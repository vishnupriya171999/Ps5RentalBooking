import type { Request, Response } from 'express';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findManagerByMobile } from '../dao/authDao.js';
import { jwtPrivateKey } from '../jwtKeys.js';

const dummyHash = bcrypt.hashSync(randomBytes(32).toString('hex'), 12);

export const login = async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  const { mobile, password } = req.body ?? {};
  if (typeof mobile !== 'string' || !/^[6-9]\d{9}$/.test(mobile.trim()) ||
      typeof password !== 'string' || !password.trim() || Buffer.byteLength(password) > 72) {
    return res.status(400).json({ success: false, message: 'Enter a valid mobile number and password.' });
  }
  try {
    const manager = await findManagerByMobile(mobile.trim());
    const hash = manager?.PASSWORD;
    const validHash = typeof hash === 'string' && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(hash);
    const matches = await bcrypt.compare(password, validHash ? hash.replace(/^\$2y\$/, '$2b$') : dummyHash);
    if (!manager || !validHash || !matches) {
      return res.status(401).json({ success: false, message: 'Mobile number or password is wrong.' });
    }
    if (manager.IS_ACTIVE === false) {
      return res.status(403).json({ success: false, message: 'Your account is inactive. Contact your administrator.' });
    }
    if (!Number.isFinite(manager.PASSWORD_SECONDS_LEFT) || manager.PASSWORD_SECONDS_LEFT < 1) {
      return res.status(403).json({ success: false, message: 'Your password has expired. Contact your administrator.' });
    }
    const user = { id: manager.ID, name: manager.NAME, mobile: manager.MOBILE, role: manager.ROLE };
    const token = jwt.sign(user, jwtPrivateKey, {
      algorithm: 'RS256', subject: String(manager.ID),
      issuer: 'ps5-rental-backend', audience: 'ps5-rental-admin',
      expiresIn: Math.min(8 * 60 * 60, Math.floor(manager.PASSWORD_SECONDS_LEFT)),
    });
    return res.json({ success: true, token, manager: user });
  } catch {
    return res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};
