import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db, UserRecord } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'ethiovoice-production-secret-key-2026-secure';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
  conversionsLeft: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// Password helpers
export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// Token generation
export function signAuthToken(user: UserRecord): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      isPremium: user.is_premium
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// Extract token from Authorization header or Cookie
export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  if (req.headers.cookie) {
    const match = req.headers.cookie.match(/token=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  }
  return null;
}

// Authentication middleware: requires a valid JWT
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = await db.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User account not found. Please log in again.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      isPremium: user.is_premium,
      conversionsLeft: user.conversions_left
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

// Optional authentication middleware: if token present, sets req.user
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await db.findUserById(decoded.id);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          isPremium: user.is_premium,
          conversionsLeft: user.conversions_left
        };
      }
    } catch {
      // Ignore invalid optional tokens
    }
  }
  next();
}

// Rate Limiting Store
interface RateBucket {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateBucket>();

// Sliding window in-memory rate limiter per IP / User
export function rateLimiter(options: { maxRequests: number; windowMs: number; message?: string }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = (req.user?.id || req.ip || req.socket.remoteAddress || 'global_client').toString();
    const now = Date.now();
    const bucket = rateLimitMap.get(key);

    if (!bucket || now > bucket.resetAt) {
      rateLimitMap.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    if (bucket.count >= options.maxRequests) {
      const retryAfterSec = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec.toString());
      return res.status(429).json({
        error: options.message || `Too many requests. Please wait ${retryAfterSec} seconds before retrying.`
      });
    }

    bucket.count += 1;
    next();
  };
}

// Filename sanitizer (prevents directory traversal)
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.+/g, '.')
    .replace(/^_+/, '')
    .slice(0, 100);
}
