import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

const SECRET_KEY = process.env.JWT_SECRET || null;

export async function getUserFromRequest(request) {
  if (!SECRET_KEY) {
    return null;
  }
  try {
    const header = request.headers.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return null;

    const decoded = jwt.verify(token, SECRET_KEY);
    const rows = await query(
      'SELECT id, username, email, role, status, last_login_at, created_at, updated_at FROM users WHERE id = ?',
      [decoded.userId]
    );
    if (!rows.length) return null;
    return rows[0];
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

export function signToken(payload) {
  if (!SECRET_KEY) {
    const err = new Error('JWT_SECRET is not configured');
    err.status = 500;
    throw err;
  }
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '1d' });
}

export function requireAuth(user) {
  if (!user) {
    const error = new Error('Unauthorized');
    error.status = 401;
    throw error;
  }
  if (user.status && user.status !== 'active') {
    const error = new Error('Account disabled');
    error.status = 403;
    throw error;
  }
}

export function requireAdmin(user) {
  requireAuth(user);
  if (user.role !== 'admin') {
    const error = new Error('Forbidden');
    error.status = 403;
    throw error;
  }
}
