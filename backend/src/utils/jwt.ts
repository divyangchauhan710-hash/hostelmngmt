import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'hostelhub-super-secret-dev-jwt-key-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  hostelBlock?: string;
  roomNumber?: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}
