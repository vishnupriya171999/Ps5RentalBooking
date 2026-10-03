import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtPublicKey } from '../jwtKeys.js';

// Only customer availability and login do not require a session.
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const publicRoute = (req.method === 'POST' && req.path === '/auth/login') ||
    (req.method === 'GET' && req.path === '/availability/consoles');
  if (publicRoute) return next();
  res.setHeader('Cache-Control', 'no-store');
  const token = req.get('Authorization')?.match(/^Bearer (\S+)$/i)?.[1];
  try {
    if (!token) throw new Error('Missing token');
    const claims = jwt.verify(token, jwtPublicKey, {
      algorithms: ['RS256'], issuer: 'ps5-rental-backend', audience: 'ps5-rental-admin', maxAge: '8h',
    });
    if (typeof claims === 'string' || typeof claims.exp !== 'number' ||
        typeof claims.id !== 'number' || typeof claims.role !== 'string') throw new Error('Invalid claims');
    res.locals.user = { id: claims.id, name: claims.name, mobile: claims.mobile, role: claims.role };
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Session expired or invalid. Please sign in again.' });
  }
};
