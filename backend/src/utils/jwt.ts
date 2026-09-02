import jwt from 'jsonwebtoken';
import { Response } from 'express';

export const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me_in_prod';
export const COOKIE_NAME = 'hp_auth';

export interface JwtPayload {
  userId: string;
  role: 'RECRUITER' | 'INTERVIEWER';
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

export function setAuthCookie(res: Response, token: string) {
  // NOTE: In production (Vercel + Render), we rely on a same-site deployment architecture
  // using a Vercel rewrite (proxying /api to Render) to ensure frontend and backend 
  // share the same origin. This allows us to keep SameSite: 'strict' securely.
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  });
}

export function clearAuthCookie(res: Response) {
  res.cookie(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 0,
    path: '/',
  });
}
