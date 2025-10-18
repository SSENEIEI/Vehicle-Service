import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const DATABASE_NAME = (process.env.DB_DATABASE || 'vehicle_service').trim() || 'vehicle_service';
const HOST = process.env.DB_HOST || 'localhost';
const PORT = Number(process.env.DB_PORT || 3306);
const USERNAME = process.env.DB_USERNAME || 'root';
const PASSWORD = process.env.DB_PASSWORD || '';
const POOL_SIZE = Number(process.env.DB_POOL_SIZE || 10);
const USE_SSL = process.env.DB_SSL === 'true';

let pool;
let schemaInitialized = false;
let initializing = null;

function buildPoolConfig(includeDatabase = true) {
  const config = {
    host: HOST,
    port: PORT,
    user: USERNAME,
    password: PASSWORD,
    waitForConnections: true,
    connectionLimit: POOL_SIZE,
    queueLimit: 0,
  };

  if (USE_SSL) {
    config.ssl = { rejectUnauthorized: false };
  }

  if (includeDatabase) {
    config.database = DATABASE_NAME;
  }

  return config;
}

async function ensureDatabaseExists() {
  const connection = await mysql.createConnection(buildPoolConfig(false));
  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DATABASE_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await connection.end();
  }
}

async function ensurePool() {
  if (pool) return pool;
  await ensureDatabaseExists();
  pool = mysql.createPool(buildPoolConfig(true));
  return pool;
}

async function seedDefaults(db) {
  const roles = [
    {
      role: 'admin',
      displayName: 'Administrator',
      description: 'Full access to manage the Vehicle Service system.',
      capabilities: [
        'manage_users',
        'manage_services',
        'view_reports',
        'configure_system',
      ],
    },
    {
      role: 'user',
      displayName: 'Service Staff',
      description: 'Handles daily service operations and scheduling.',
      capabilities: [
        'create_service_order',
        'update_service_order',
        'view_vehicles',
      ],
    },
    {
      role: 'vendor',
      displayName: 'Partner Vendor',
      description: 'Provides external maintenance or repair services.',
      capabilities: [
        'view_assigned_orders',
        'update_order_progress',
        'upload_documents',
      ],
    },
  ];

  for (const role of roles) {
    await db.query(
      `INSERT INTO roles (role_key, display_name, description, capabilities)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE display_name = VALUES(display_name), description = VALUES(description), capabilities = VALUES(capabilities)`,
      [role.role, role.displayName, role.description, JSON.stringify(role.capabilities)]
    );
  }

  const adminUsername = process.env.DEFAULT_ADMIN_USERNAME || 'gaservice';
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || '12345';

  const [adminRows] = await db.query('SELECT id FROM users WHERE username = ?', [adminUsername]);
  if (adminRows.length === 0) {
    const hash = await bcrypt.hash(adminPassword, 10);
    await db.query(
      `INSERT INTO users (username, password_hash, email, role, status)
       VALUES (?, ?, ?, ?, ?)`,
      [adminUsername, hash, null, 'admin', 'active']
    );
  }
}

export async function initDatabase({ seed = true } = {}) {
  if (schemaInitialized) return;
  if (initializing) return initializing;

  initializing = (async () => {
    const db = await ensurePool();
    const exec = async (sql) => {
      try {
        await db.query(sql);
      } catch (error) {
        const message = String(error?.message || '');
        if (!/exists|duplicate/i.test(message)) {
          throw error;
        }
      }
    };

    await exec(`
      CREATE TABLE IF NOT EXISTS roles (
        role_key VARCHAR(30) PRIMARY KEY,
        display_name VARCHAR(100) NOT NULL,
        description TEXT NULL,
        capabilities JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await exec(`
      CREATE TABLE IF NOT EXISTS factories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        code VARCHAR(30) NULL,
        note TEXT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_factory_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await exec(`
      CREATE TABLE IF NOT EXISTS divisions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        factory_id INT NOT NULL,
        name VARCHAR(150) NOT NULL,
        code VARCHAR(30) NULL,
        note TEXT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_division_per_factory (factory_id, name),
        KEY idx_divisions_factory (factory_id),
        CONSTRAINT fk_divisions_factory FOREIGN KEY (factory_id) REFERENCES factories(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await exec(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        factory_id INT NOT NULL,
        division_id INT NOT NULL,
        name VARCHAR(150) NOT NULL,
        code VARCHAR(30) NULL,
        note TEXT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_department_per_division (division_id, name),
        KEY idx_departments_factory (factory_id),
        KEY idx_departments_division (division_id),
        CONSTRAINT fk_departments_factory FOREIGN KEY (factory_id) REFERENCES factories(id) ON DELETE CASCADE,
        CONSTRAINT fk_departments_division FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await exec(`
      CREATE TABLE IF NOT EXISTS company_drivers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        photo_url TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await exec(`
      CREATE TABLE IF NOT EXISTS company_vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        registration VARCHAR(50) NOT NULL,
        vehicle_type VARCHAR(50) NOT NULL,
        photo_url TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_vehicle_registration (registration)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(100) NULL,
        role VARCHAR(30) NOT NULL,
        factory_id INT NULL,
        department_id INT NULL,
        division_id INT NULL,
        status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        last_login_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_users_factory (factory_id),
        KEY idx_users_department (department_id),
        KEY idx_users_division (division_id),
        CONSTRAINT fk_users_role FOREIGN KEY (role) REFERENCES roles(role_key),
        CONSTRAINT fk_users_factory FOREIGN KEY (factory_id) REFERENCES factories(id) ON DELETE SET NULL,
        CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
        CONSTRAINT fk_users_division FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await exec(`ALTER TABLE divisions DROP FOREIGN KEY fk_divisions_department`);
    await exec(`ALTER TABLE divisions DROP INDEX uniq_division_per_department`);
  await exec(`ALTER TABLE divisions DROP COLUMN IF EXISTS department_id`);
  await exec(`ALTER TABLE divisions ADD UNIQUE INDEX IF NOT EXISTS uniq_division_per_factory (factory_id, name)`);

    await exec(`ALTER TABLE departments ADD COLUMN IF NOT EXISTS division_id INT NULL AFTER factory_id`);
    await exec(`ALTER TABLE departments DROP INDEX uniq_department_per_factory`);
  await exec(`ALTER TABLE departments ADD UNIQUE INDEX IF NOT EXISTS uniq_department_per_division (division_id, name)`);
  await exec(`ALTER TABLE departments ADD INDEX IF NOT EXISTS idx_departments_division (division_id)`);
    await exec(`
      ALTER TABLE departments
      ADD CONSTRAINT fk_departments_division FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE CASCADE
    `);

  await exec(`ALTER TABLE users DROP COLUMN full_name`);
  await exec(`ALTER TABLE users ADD COLUMN factory_id INT NULL`);
  await exec(`ALTER TABLE users ADD COLUMN department_id INT NULL`);
  await exec(`ALTER TABLE users ADD COLUMN division_id INT NULL`);
    await exec(`ALTER TABLE users ADD INDEX idx_users_factory (factory_id)`);
    await exec(`ALTER TABLE users ADD INDEX idx_users_department (department_id)`);
    await exec(`ALTER TABLE users ADD INDEX idx_users_division (division_id)`);
    await exec(`
      ALTER TABLE users
      ADD CONSTRAINT fk_users_factory FOREIGN KEY (factory_id) REFERENCES factories(id) ON DELETE SET NULL
    `);
    await exec(`
      ALTER TABLE users
      ADD CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
    `);
    await exec(`
      ALTER TABLE users
      ADD CONSTRAINT fk_users_division FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL
    `);

    if (seed) {
      await seedDefaults(db);
    }

    schemaInitialized = true;
    initializing = null;
  })();

  return initializing;
}

export async function query(sql, params = []) {
  try {
    await initDatabase();
    const db = await ensurePool();
    const [rows] = await db.execute(sql, params);
    return rows;
  } catch (error) {
    const code = error?.code || '';
    const message = String(error?.message || '');
    const missingSchema = code === 'ER_NO_SUCH_TABLE' || code === 'ER_BAD_DB_ERROR' || message.includes('Unknown database');

    if (missingSchema) {
      schemaInitialized = false;
      initializing = null;
      if (pool) {
        try { await pool.end(); } catch {}
        pool = null;
      }
      await initDatabase();
      const db = await ensurePool();
      const [rows] = await db.execute(sql, params);
      return rows;
    }

    throw error;
  }
}

export async function testConnection() {
  await initDatabase();
  const db = await ensurePool();
  const connection = await db.getConnection();
  try {
    await connection.ping();
    return true;
  } finally {
    connection.release();
  }
}

export async function closePool() {
  if (!pool) return;
  try {
    await pool.end();
  } finally {
    pool = null;
    schemaInitialized = false;
    initializing = null;
  }
}
