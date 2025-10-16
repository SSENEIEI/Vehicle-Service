import jwt from 'jsonwebtoken';
import { query, initDatabase } from '@/lib/db';

const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
  throw new Error('Missing JWT_SECRET env var');
}

export async function getUserFromRequest(request) {
  try {
    const hdr = request.headers.get('authorization') || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if (!token) return null;
    const decoded = jwt.verify(token, SECRET_KEY);

    // Dev bypass: if adminga from bypass, return super admin-like
    if (decoded && decoded.username === 'adminga' && decoded.userId === 0) {
      return {
        id: 0,
        username: 'adminga',
        is_admin: 1,
        is_super_admin: 1,
        display_name: 'Admin GA',
        plant_id: null,
        department_id: null,
      };
    }

    // Load fresh from DB to get latest roles and scope
    const rows = await query('SELECT id, username, is_admin, is_super_admin, display_name, plant_id, department_id FROM users WHERE id = ?', [decoded.userId]);
    if (!rows.length) return null;
    // Also load multi-department memberships if available
    let department_ids = [];
    try {
      const drows = await query('SELECT department_id FROM user_departments WHERE user_id = ?', [rows[0].id]);
      department_ids = (Array.isArray(drows) ? drows : []).map(r => r.department_id).filter(Boolean);
    } catch (e) {
      // ignore if table missing; init paths elsewhere will create it lazily
      department_ids = [];
    }
    return { ...rows[0], department_ids };
  } catch (e) {
    return null;
  }
}

export function signToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '1d' });
}

export function requireAuth(user) {
  if (!user) {
    const error = new Error('Unauthorized');
    error.status = 401;
    throw error;
  }
}

export function requireAdmin(user) {
  requireAuth(user);
  if (!(user.is_super_admin || user.is_admin)) {
    const error = new Error('Forbidden');
    error.status = 403;
    throw error;
  }
}

export async function isDateLocked(dateStr) {
  const rows = await (async () => {
    try {
      return await query('SELECT is_locked FROM ot_locks WHERE the_date = ?', [dateStr]);
    } catch (err) {
      const msg = String(err?.message || '');
      const isNoTable = err?.code === 'ER_NO_SUCH_TABLE' || msg.includes("doesn't exist") || err?.sqlState === '42S02';
      if (!isNoTable) throw err;
      await initDatabase();
      return query('SELECT is_locked FROM ot_locks WHERE the_date = ?', [dateStr]);
    }
  })();
  if (!rows.length) return false;
  return !!rows[0].is_locked;
}

// Department-level lock check; if no row exists, falls back to global date lock
export async function isDepartmentLocked(dateStr, departmentId) {
  if (!departmentId) return isDateLocked(dateStr);
  const rows = await (async () => {
    try {
      return await query('SELECT is_locked FROM ot_department_locks WHERE the_date = ? AND department_id = ?', [dateStr, departmentId]);
    } catch (err) {
      const msg = String(err?.message || '');
      const isNoTable = err?.code === 'ER_NO_SUCH_TABLE' || msg.includes("doesn't exist") || err?.sqlState === '42S02';
      if (!isNoTable) throw err;
      await initDatabase();
      return query('SELECT is_locked FROM ot_department_locks WHERE the_date = ? AND department_id = ?', [dateStr, departmentId]);
    }
  })();
  if (rows.length) return !!rows[0].is_locked;
  // If no department-specific row, use global lock (if any)
  return isDateLocked(dateStr);
}
