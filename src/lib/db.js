import mysql from 'mysql2/promise';

// Reusable pool for MySQL/MariaDB (XAMPP) and optional TiDB in production.
// NOTE: We now prefer local XAMPP by default during development. TiDB is only
// used when NODE_ENV=production (or when DB_PREFER_LOCAL is not true) and a
// DATABASE_URL is provided. This prevents accidental TiDB usage while developing.
// TiDB Cloud connection string example (for production .env):
// DATABASE_URL="mysql://<user>:<password>@<host>:4000/truck_booking_system?ssl={\"rejectUnauthorized\":true}"
// You can append &timezone=Z to force UTC if needed.

let pool; // cached across hot reloads (Next.js dev) and lambda invocations

const isProd = process.env.NODE_ENV === 'production';
// Prefer local DB when developing unless explicitly overridden
const preferLocal = process.env.DB_PREFER_LOCAL === 'true' || !isProd;

export function getPool() {
  if (!pool) {
    // Determine pool size once
    const connectionLimit = Number(process.env.DB_POOL_SIZE || (preferLocal ? 10 : 5));
    const ensureUrlHasTiDBSSL = (raw) => {
      try {
        const u = new URL(raw);
        const isTiDB = /tidbcloud\.com$/i.test(u.hostname || '');
        if (isTiDB) {
          const sp = u.searchParams;
          if (!sp.has('ssl')) sp.set('ssl', JSON.stringify({ rejectUnauthorized: true }));
          if (!sp.has('timezone')) sp.set('timezone', 'Z');
          u.search = sp.toString();
          return u.toString();
        }
      } catch {}
      return raw;
    };

    // 1) Production TiDB via DATABASE_URL (only if not preferring local)
    if (!preferLocal && process.env.DATABASE_URL) {
      const url = ensureUrlHasTiDBSSL(process.env.DATABASE_URL);
      pool = mysql.createPool(url);
    }
    // 2) Explicit host/user via env (works for local XAMPP or any MySQL)
    else if (process.env.DB_HOST || process.env.DB_USERNAME) {
      const isLocalHost = (process.env.DB_HOST || '').includes('localhost') || (process.env.DB_HOST || '').startsWith('127.');
      const isTiDB = /tidbcloud\.com$/i.test(process.env.DB_HOST || '');
      const useSSL = ((process.env.DB_SSL === 'true') || isTiDB) && !isLocalHost; // force SSL for TiDB
      pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'Bus-system',
        ...(useSSL ? { ssl: { rejectUnauthorized: true, minVersion: 'TLSv1.2', servername: process.env.DB_HOST }, timezone: 'Z' } : {}),
        waitForConnections: true,
        connectionLimit,
        queueLimit: 0
      });
    }
    // 3) Default local XAMPP
    else {
      pool = mysql.createPool({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '', // default password : 'admin1234'
  database: 'Bus-system',
        waitForConnections: true,
        connectionLimit,
        queueLimit: 0
      });
    }
  }
  return pool;
}

// Simple query helper
export async function query(sql, params = []) {
  try {
    const [rows] = await getPool().execute(sql, params);
    return rows;
  } catch (err) {
    const msg = String(err?.message || '');
    const isNoTable = err?.code === 'ER_NO_SUCH_TABLE' || msg.includes("doesn't exist") || err?.sqlState === '42S02';
    const isNoDb = err?.code === 'ER_BAD_DB_ERROR' || msg.includes('Unknown database');
    if (isNoTable || isNoDb) {
      // Initialize schema/database once and retry the same query
      try {
        await initDatabase();
        const [retryRows] = await getPool().execute(sql, params);
        return retryRows;
      } catch (e) {
        // Fall through with original error if retry also fails
        throw err;
      }
    }
    throw err;
  }
}

// Health check (can be used in an /api/health route)
export async function testConnection() {
  const conn = await getPool().getConnection();
  try {
    await conn.ping();
    return true;
  } finally {
    conn.release();
  }
}

// Backwards compatibility (if existing code expects getConnection())
// export async function getConnection() {
//   // For Vercel/TiDB deployment, it will use the DATABASE_URL environment variable.
//   // For local development, it will use the local MySQL connection details.
//   const connection = await mysql.createConnection(process.env.DATABASE_URL || {
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'Bus-system',
//     //default password : 'admin1234'
//   });
//   return connection;
// }

// Initialize schema in TiDB / MySQL if it does not exist yet.
// Safe to call multiple times; uses IF NOT EXISTS / defensive checks.
export async function initDatabase(options = {}) {
  const { seed = false } = options; // seed inserts sample data (optional)
  // Ensure the target database exists (handy for fresh XAMPP installs)
  // IMPORTANT: When using DATABASE_URL (e.g., TiDB on Vercel), skip this bootstrap step
  // because connecting to localhost would fail. We assume the DB/schema already exists.
  const usingDatabaseUrl = (!preferLocal && !!process.env.DATABASE_URL);
  if (!usingDatabaseUrl) {
    try {
      // Derive connection settings (local-first)
      const host = process.env.DB_HOST || 'localhost';
      const port = Number(process.env.DB_PORT || 3306);
      const user = process.env.DB_USERNAME || 'root';
      const password = process.env.DB_PASSWORD || '';
      const dbName = process.env.DB_DATABASE || 'Bus-system';

      // Create the database if missing using a direct connection without selecting a DB
      const isLocalHost = (host || '').includes('localhost') || (host || '').startsWith('127.');
      const useSSL = process.env.DB_SSL === 'true' && !isLocalHost;
      const bootstrapConn = await mysql.createConnection({
        host,
        port,
        user,
        password,
        ...(useSSL ? { ssl: { rejectUnauthorized: true, minVersion: 'TLSv1.2', servername: host } } : {}),
      });
      try {
        await bootstrapConn.query(
          `CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        );
      } finally {
        await bootstrapConn.end();
      }
    } catch (e) {
      console.error('Failed to ensure database exists:', e.message);
      throw e;
    }
  }

  const pool = getPool();

  // Helper to run queries safely
  const exec = async (sql) => {
    try { await pool.query(sql); } catch (err) {
      if (!/Duplicate|exists|already/i.test(err.message)) {
        console.error('Schema statement failed:', err.message, '\nSQL:', sql);
        throw err;
      }
    }
  };

  // MariaDB-safe helper: add FK if missing by checking INFORMATION_SCHEMA
  const ensureForeignKey = async (table, constraintName, definition) => {
    const [rows] = await pool.query(
      `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
       WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?`,
      [table, constraintName]
    );
    if (rows.length === 0) {
      await pool.query(`ALTER TABLE \`${table}\` ADD CONSTRAINT \`${constraintName}\` ${definition}`);
    }
  };

  // 0) Legacy tables (keep for backward compatibility; safe to keep)
  await exec(`CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    vendor VARCHAR(150) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_product_vendor (name, vendor)
  ) CHARSET=utf8mb4`);
  await exec(`CREATE TABLE IF NOT EXISTS locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) CHARSET=utf8mb4`);

  // 1) Users (enhanced)
  await exec(`CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY username (username)
  ) CHARSET=utf8mb4`);
  // Add new columns if missing
  await exec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin TINYINT(1) NOT NULL DEFAULT 0`);
  await exec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_admin TINYINT(1) NOT NULL DEFAULT 0`);
  await exec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(100) NULL`);
  await exec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100) NULL`);
  await exec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS plant_id INT NULL`);
  await exec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id INT NULL`);

  // 2) Plants / Departments
  await exec(`CREATE TABLE IF NOT EXISTS plants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) CHARSET=utf8mb4`);
  await exec(`CREATE TABLE IF NOT EXISTS departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plant_id INT NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_plant_code (plant_id, code),
    KEY plant_idx (plant_id)
  ) CHARSET=utf8mb4`);

  // FK for users -> plants/departments (MariaDB-compatible)
  await ensureForeignKey('users', 'users_plant_fk', 'FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE SET NULL');
  await ensureForeignKey('users', 'users_department_fk', 'FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL');
  await ensureForeignKey('departments', 'dept_plant_fk', 'FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE');

  // 2.1) User departments (many-to-many for department memberships)
  await exec(`CREATE TABLE IF NOT EXISTS user_departments (
    user_id INT NOT NULL,
    department_id INT NOT NULL,
    PRIMARY KEY (user_id, department_id)
  ) CHARSET=utf8mb4`);
  await ensureForeignKey('user_departments', 'ud_user_fk', 'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
  await ensureForeignKey('user_departments', 'ud_dept_fk', 'FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE');

  // 3) Shifts / Depart Times
  await exec(`CREATE TABLE IF NOT EXISTS shifts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name_th VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) CHARSET=utf8mb4`);
  await exec(`CREATE TABLE IF NOT EXISTS depart_times (
    id INT PRIMARY KEY AUTO_INCREMENT,
    shift_id INT NOT NULL,
    time TIME NOT NULL,
    is_entry TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deactivated_at DATETIME NULL,
    UNIQUE KEY uniq_shift_time_type (shift_id, time, is_entry),
    KEY shift_idx (shift_id)
  ) CHARSET=utf8mb4`);
  await ensureForeignKey('depart_times', 'dt_shift_fk', 'FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE');
  // Backfill columns for existing databases (TiDB/MySQL support IF NOT EXISTS)
  await exec(`ALTER TABLE depart_times
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS deactivated_at DATETIME NULL,
    ADD COLUMN IF NOT EXISTS is_entry TINYINT(1) NOT NULL DEFAULT 0`);

  // Ensure unique index includes is_entry; drop legacy index if present
  try {
    const [idx] = await pool.query(
      `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'depart_times' AND INDEX_NAME = 'uniq_shift_time_type'`
    );
    if (idx.length === 0) {
      // Drop old unique if exists
      const [oldIdx] = await pool.query(
        `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'depart_times' AND INDEX_NAME = 'uniq_shift_time'`
      );
      if (oldIdx.length > 0) {
        await pool.query(`ALTER TABLE depart_times DROP INDEX uniq_shift_time`);
      }
      await pool.query(`ALTER TABLE depart_times ADD UNIQUE INDEX uniq_shift_time_type (shift_id, time, is_entry)`);
    }
  } catch (e) {
    // Non-fatal: log and continue
    console.warn('Index migration for depart_times skipped:', e.message);
  }

  // 4) Routes (สายรถ)
  await exec(`CREATE TABLE IF NOT EXISTS routes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    vendor VARCHAR(100) NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) CHARSET=utf8mb4`);

  // 5) OT counts per date/route/plant/department/shift/depart_time
  await exec(`CREATE TABLE IF NOT EXISTS ot_counts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    the_date DATE NOT NULL,
    route_id INT NOT NULL,
    plant_id INT NOT NULL,
    department_id INT NOT NULL,
    shift_id INT NOT NULL,
    depart_time_id INT NOT NULL,
    count INT UNSIGNED NOT NULL DEFAULT 0,
    UNIQUE KEY uniq_count (the_date, route_id, plant_id, department_id, shift_id, depart_time_id),
    KEY date_idx (the_date)
  ) CHARSET=utf8mb4`);
  await ensureForeignKey('ot_counts', 'otc_route_fk', 'FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE');
  await ensureForeignKey('ot_counts', 'otc_plant_fk', 'FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE');
  await ensureForeignKey('ot_counts', 'otc_dept_fk', 'FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE');
  await ensureForeignKey('ot_counts', 'otc_shift_fk', 'FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE');
  await ensureForeignKey('ot_counts', 'otc_dt_fk', 'FOREIGN KEY (depart_time_id) REFERENCES depart_times(id) ON DELETE CASCADE');

  // 5.1) Overview counts per date/department/shift (grid totals without route/time)
  await exec(`CREATE TABLE IF NOT EXISTS ot_overview_counts (
    the_date DATE NOT NULL,
    department_id INT NOT NULL,
    shift_id INT NOT NULL,
    count INT UNSIGNED NOT NULL DEFAULT 0,
    updated_by INT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (the_date, department_id, shift_id)
  ) CHARSET=utf8mb4`);
  await ensureForeignKey('ot_overview_counts', 'otoc_dept_fk', 'FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE');
  await ensureForeignKey('ot_overview_counts', 'otoc_shift_fk', 'FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE');
  await ensureForeignKey('ot_overview_counts', 'otoc_updated_by_fk', 'FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL');

  // 6) Locks per date
  await exec(`CREATE TABLE IF NOT EXISTS ot_locks (
    the_date DATE PRIMARY KEY,
    is_locked TINYINT(1) NOT NULL DEFAULT 1,
    locked_by_user_id INT NULL,
    locked_at DATETIME NULL
  ) CHARSET=utf8mb4`);
    // Editable shop plan per date (for adminga overrides)
    await exec(`CREATE TABLE IF NOT EXISTS ot_shop_plan (
      the_date DATE PRIMARY KEY,
      rice_shops INT DEFAULT 0,
      minimart_shops INT DEFAULT 0,
      noodle_shops INT DEFAULT 0,
      updated_by INT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    // Nurse plan per date and shift (editable)
    await exec(`CREATE TABLE IF NOT EXISTS ot_nurse_plan (
      the_date DATE NOT NULL,
      shift_id INT NOT NULL,
      nurse_count INT NOT NULL DEFAULT 1,
      updated_by INT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (the_date, shift_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await ensureForeignKey('ot_locks', 'otlock_user_fk', 'FOREIGN KEY (locked_by_user_id) REFERENCES users(id) ON DELETE SET NULL');

  // 6.1) Department-level locks per date (granular lock per department)
  await exec(`CREATE TABLE IF NOT EXISTS ot_department_locks (
    the_date DATE NOT NULL,
    department_id INT NOT NULL,
    is_locked TINYINT(1) NOT NULL DEFAULT 1,
    locked_by_user_id INT NULL,
    locked_at DATETIME NULL,
    PRIMARY KEY (the_date, department_id)
  ) CHARSET=utf8mb4`);
  await ensureForeignKey('ot_department_locks', 'otdeptlock_dept_fk', 'FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE');
  await ensureForeignKey('ot_department_locks', 'otdeptlock_user_fk', 'FOREIGN KEY (locked_by_user_id) REFERENCES users(id) ON DELETE SET NULL');
    await ensureForeignKey('ot_shop_plan', 'otshop_updated_by_fk', 'FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL');
    await ensureForeignKey('ot_nurse_plan', 'otnurse_shift_fk', 'FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE');
    await ensureForeignKey('ot_nurse_plan', 'otnurse_updated_by_fk', 'FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL');

  // 6.2) Time-slot level locks per date/shift/depart_time (global)
  await exec(`CREATE TABLE IF NOT EXISTS ot_time_locks (
    the_date DATE NOT NULL,
    shift_id INT NOT NULL,
    depart_time_id INT NOT NULL,
    is_locked TINYINT(1) NOT NULL DEFAULT 1,
    locked_by_user_id INT NULL,
    locked_at DATETIME NULL,
    PRIMARY KEY (the_date, shift_id, depart_time_id)
  ) CHARSET=utf8mb4`);
  await ensureForeignKey('ot_time_locks', 'ottime_shift_fk', 'FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE');
  await ensureForeignKey('ot_time_locks', 'ottime_dt_fk', 'FOREIGN KEY (depart_time_id) REFERENCES depart_times(id) ON DELETE CASCADE');
  await ensureForeignKey('ot_time_locks', 'ottime_user_fk', 'FOREIGN KEY (locked_by_user_id) REFERENCES users(id) ON DELETE SET NULL');

  // 6.4) Time hides per date/shift (admin-controlled visibility of depart times)
  await exec(`CREATE TABLE IF NOT EXISTS ot_time_hides (
    the_date DATE NOT NULL,
    shift_id INT NOT NULL,
    depart_time_id INT NOT NULL,
    hidden_by_user_id INT NULL,
    hidden_at DATETIME NULL,
    PRIMARY KEY (the_date, shift_id, depart_time_id)
  ) CHARSET=utf8mb4`);
  await ensureForeignKey('ot_time_hides', 'othide_shift_fk', 'FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE');
  await ensureForeignKey('ot_time_hides', 'othide_dt_fk', 'FOREIGN KEY (depart_time_id) REFERENCES depart_times(id) ON DELETE CASCADE');
  await ensureForeignKey('ot_time_hides', 'othide_user_fk', 'FOREIGN KEY (hidden_by_user_id) REFERENCES users(id) ON DELETE SET NULL');

  // 6.4.1) Global OT settings (key-value) to control behaviors like auto-hide
  await exec(`CREATE TABLE IF NOT EXISTS ot_settings (
    name VARCHAR(100) NOT NULL,
    value VARCHAR(255) NULL,
    updated_by INT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (name)
  ) CHARSET=utf8mb4`);
  await ensureForeignKey('ot_settings', 'otsettings_updated_by_fk', 'FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL');

  // 6.3) Department-level locks per date/shift/depart_time
  await exec(`CREATE TABLE IF NOT EXISTS ot_department_time_locks (
    the_date DATE NOT NULL,
    department_id INT NOT NULL,
    shift_id INT NOT NULL,
    depart_time_id INT NOT NULL,
    is_locked TINYINT(1) NOT NULL DEFAULT 1,
    locked_by_user_id INT NULL,
    locked_at DATETIME NULL,
    PRIMARY KEY (the_date, department_id, shift_id, depart_time_id)
  ) CHARSET=utf8mb4`);
  await ensureForeignKey('ot_department_time_locks', 'otdepttime_dept_fk', 'FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE');
  await ensureForeignKey('ot_department_time_locks', 'otdepttime_shift_fk', 'FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE');
  await ensureForeignKey('ot_department_time_locks', 'otdepttime_dt_fk', 'FOREIGN KEY (depart_time_id) REFERENCES depart_times(id) ON DELETE CASCADE');
  await ensureForeignKey('ot_department_time_locks', 'otdepttime_user_fk', 'FOREIGN KEY (locked_by_user_id) REFERENCES users(id) ON DELETE SET NULL');

    // Car plan per date/shift/depart_time/route (editable by super admin)
    await exec(`CREATE TABLE IF NOT EXISTS ot_car_plan (
      the_date DATE NOT NULL,
      shift_id INT NOT NULL,
      depart_time_id INT NOT NULL,
      route_id INT NOT NULL,
      car_count INT NOT NULL DEFAULT 0,
      updated_by INT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (the_date, shift_id, depart_time_id, route_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    await ensureForeignKey('ot_car_plan', 'otcar_shift_fk', 'FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE');
    await ensureForeignKey('ot_car_plan', 'otcar_dt_fk', 'FOREIGN KEY (depart_time_id) REFERENCES depart_times(id) ON DELETE CASCADE');
    await ensureForeignKey('ot_car_plan', 'otcar_route_fk', 'FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE');
    await ensureForeignKey('ot_car_plan', 'otcar_updated_by_fk', 'FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL');

  // 6.x) Vendor payments per date/route (editable summary values)
  await exec(`CREATE TABLE IF NOT EXISTS vendor_payments (
      the_date DATE NOT NULL,
      route_id INT NOT NULL,
      pay_flat INT NOT NULL DEFAULT 0,           -- เหมาจ่าย
      pay_wait INT NOT NULL DEFAULT 0,           -- จอดรอ
      pay_total_cars INT NOT NULL DEFAULT 0,     -- รวมรถ (ใหม่)
      pay_ot_normal INT NOT NULL DEFAULT 0,      -- OT หมวดวันปกติ
      pay_trip INT NOT NULL DEFAULT 0,           -- เหมานเที่ยว
      pay_ot_holiday INT NOT NULL DEFAULT 0,     -- OT หมวดวันหยุด
      pay_trip_night INT NOT NULL DEFAULT 0,     -- เหมานเที่ยวกะดึก
      updated_by INT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (the_date, route_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await ensureForeignKey('vendor_payments', 'vp_route_fk', 'FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE');
  await ensureForeignKey('vendor_payments', 'vp_updated_by_fk', 'FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL');
  // Add new column for existing deployments (MySQL 8+ supports IF NOT EXISTS)
  await exec(`ALTER TABLE vendor_payments ADD COLUMN IF NOT EXISTS pay_total_cars INT NOT NULL DEFAULT 0`);

  // 6.x.1) Monthly vendor payments defaults (for pay_flat only)
  await exec(`CREATE TABLE IF NOT EXISTS vendor_monthly_payments (
      month_start DATE NOT NULL,                -- first day of month (e.g., 2025-09-01)
      route_id INT NOT NULL,
      pay_flat INT NOT NULL DEFAULT 0,          -- รายเดือน (เหมาจ่าย) สำหรับทั้งเดือน
      updated_by INT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (month_start, route_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await ensureForeignKey('vendor_monthly_payments', 'vmp_route_fk', 'FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE');
  await ensureForeignKey('vendor_monthly_payments', 'vmp_updated_by_fk', 'FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL');

  // 6.y) Vendor rates per route (persistent Cost values)
  await exec(`CREATE TABLE IF NOT EXISTS vendor_rates (
    route_id INT NOT NULL,
    rate_flat DECIMAL(12,2) NOT NULL DEFAULT 0,
    rate_wait DECIMAL(12,2) NOT NULL DEFAULT 0,
    rate_total_cars DECIMAL(12,2) NOT NULL DEFAULT 0,
    rate_ot_normal DECIMAL(12,2) NOT NULL DEFAULT 0,
    rate_trip DECIMAL(12,2) NOT NULL DEFAULT 0,
    rate_ot_holiday DECIMAL(12,2) NOT NULL DEFAULT 0,
    rate_trip_night DECIMAL(12,2) NOT NULL DEFAULT 0,
    updated_by INT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (route_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await ensureForeignKey('vendor_rates', 'vr_route_fk', 'FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE');
  await ensureForeignKey('vendor_rates', 'vr_updated_by_fk', 'FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL');
  await exec(`ALTER TABLE vendor_rates ADD COLUMN IF NOT EXISTS rate_total_cars DECIMAL(12,2) NOT NULL DEFAULT 0`);

  // 7) (Optional) Legacy tables FKs
  await exec(`CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    truck_number INT NOT NULL,
    department VARCHAR(100) NOT NULL,
    percentage INT NOT NULL,
    booking_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_booking_lookup (booking_date, product_id, truck_number),
    KEY user_id (user_id),
    KEY product_id (product_id)
  ) CHARSET=utf8mb4`);
  await ensureForeignKey('bookings', 'bookings_user_fk', 'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
  await ensureForeignKey('bookings', 'bookings_product_fk', 'FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE');

  // Transport registrations (for adminga first)
  await exec(`CREATE TABLE IF NOT EXISTS transport_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_code VARCHAR(50) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    employee_type VARCHAR(100) NULL,
    plant_id INT NULL,
    department_id INT NULL,
    department_text VARCHAR(100) NULL,
    route_id INT NULL,
    pickup_point VARCHAR(150) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) CHARSET=utf8mb4`);
  // Backfill new column for existing DBs
  await exec(`ALTER TABLE transport_registrations ADD COLUMN IF NOT EXISTS department_text VARCHAR(100) NULL`);
  await ensureForeignKey('transport_registrations', 'tr_plant_fk', 'FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE SET NULL');
  await ensureForeignKey('transport_registrations', 'tr_dept_fk', 'FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL');
  await ensureForeignKey('transport_registrations', 'tr_route_fk', 'FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL');

  // Employee types (master)
  await exec(`CREATE TABLE IF NOT EXISTS employee_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) CHARSET=utf8mb4`);

  // Pickup points (master) - optional relation to route
  await exec(`CREATE TABLE IF NOT EXISTS pickup_points (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL UNIQUE,
    route_id INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) CHARSET=utf8mb4`);
  await ensureForeignKey('pickup_points', 'pp_route_fk', 'FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL');

  if (seed) {
    // Seed plants
    await exec(`INSERT INTO plants (code, name) VALUES ('AC','AC'),('RF','RF'),('SSC','SSC')`);
    // Seed departments (examples)
    await exec(`INSERT INTO departments (plant_id, code, name)
      SELECT p.id, 'SAC','SAC' FROM plants p WHERE p.code='AC';`);
    await exec(`INSERT INTO departments (plant_id, code, name)
      SELECT p.id, 'AIO','AIO' FROM plants p WHERE p.code='AC';`);
    await exec(`INSERT INTO departments (plant_id, code, name)
      SELECT p.id, 'RF-A','RF-A' FROM plants p WHERE p.code='RF';`);
    await exec(`INSERT INTO departments (plant_id, code, name)
      SELECT p.id, 'RF-B','RF-B' FROM plants p WHERE p.code='RF';`);
    await exec(`INSERT INTO departments (plant_id, code, name)
      SELECT p.id, 'HR','HR' FROM plants p WHERE p.code='SSC';`);
    await exec(`INSERT INTO departments (plant_id, code, name)
      SELECT p.id, 'SCM','SCM' FROM plants p WHERE p.code='SSC';`);

    // Seed shifts and times
    await exec(`INSERT INTO shifts (name_th, name_en) VALUES ('กะกลางวัน','Day Shift'),('กะกลางคืน','Night Shift')`);
    await exec(`INSERT INTO depart_times (shift_id, time)
      SELECT s.id, '17:00:00' FROM shifts s WHERE s.name_th='กะกลางวัน'`);
    await exec(`INSERT INTO depart_times (shift_id, time)
      SELECT s.id, '19:10:00' FROM shifts s WHERE s.name_th='กะกลางวัน'`);

    // Seed routes
    const routeNames = ['คลองอุดม','วิจิตรา','สระแท่น','นาดี','ครัวอากู๋','บ้านเลียบ','สันติสุข','ปราจีนบุรี','สระแก้ว','ดงน้อย'];
    for (let i=0; i<routeNames.length; i++) {
      const name = routeNames[i];
      await exec(`INSERT INTO routes (name, display_order) VALUES ('${name}', ${i+1})`);
    }

    // Seed super admin (password: 12345 placeholder hashed recommended in auth flow)
    // Note: Keep existing login-bypass in dev as earlier.
  }

  return { ok: true };
}

// Compatibility: existing routes import getConnection; provide pooled connection.
export async function getConnection() {
  return getPool().getConnection();
}
