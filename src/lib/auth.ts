import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { getAdminByEmail, updateAdminLastLogin, createAuditLog } from './db';
import { AdminUser } from './types';

const JWT_SECRET_STRING = process.env.ADMIN_JWT_SECRET || 'trp-roll-palace-secure-jwt-super-secret-key-2026';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const COOKIE_NAME = 'trp_admin_token';

export interface AdminSessionPayload {
  userId: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'staff';
}

export async function signAdminToken(payload: AdminSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyAdminToken(token: string): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AdminSessionPayload;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function loginAdmin(email: string, password: string, ip?: string): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
  const cleanEmail = email.trim().toLowerCase();
  const admin = getAdminByEmail(cleanEmail);

  if (!admin) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const isPasswordValid = bcrypt.compareSync(password, admin.password_hash);
  if (!isPasswordValid) {
    createAuditLog(admin.id, admin.email, 'LOGIN_FAILED', 'Failed password attempt', ip);
    return { success: false, error: 'Invalid email or password.' };
  }

  updateAdminLastLogin(admin.id);
  createAuditLog(admin.id, admin.email, 'LOGIN_SUCCESS', 'Admin logged in successfully', ip);

  const token = await signAdminToken({
    userId: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return {
    success: true,
    user: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      created_at: admin.created_at,
      last_login: admin.last_login,
    },
  };
}

export async function logoutAdmin(ip?: string): Promise<void> {
  const session = await getAdminSession();
  if (session) {
    createAuditLog(session.userId, session.email, 'LOGOUT', 'Admin logged out', ip);
  }
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
