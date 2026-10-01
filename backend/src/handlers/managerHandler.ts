import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { findManagerById, findManagerByMobile, insertManager, listManagers, publicManager, updateManager } from '../dao/authDao.js';

const fail = (res: Response, error: unknown) => {
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
    return res.status(409).json({ success: false, message: 'Mobile number already exists.' });
  }
  return res.status(500).json({ success: false, message: 'Unable to save or load managers. Please try again.' });
};

// Validate the current account rather than relying on stale token claims.
export const requireActiveManager = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await findManagerById(res.locals.user.id);
    if (!user?.isActive) {
      return res.status(403).json({ success: false, message: 'Your account is inactive or no longer exists. Contact your administrator.' });
    }
    res.locals.manager = user;
    next();
  } catch (error) { return fail(res, error); }
};

export const requireManagerAdmin = (_req: Request, res: Response, next: NextFunction) => {
  if (res.locals.manager.role.trim().toUpperCase() !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Only administrators can update manager accounts.' });
  }
  next();
};
export const getManagers = async (_req: Request, res: Response) => {
  try { return res.json({ success: true, managers: await listManagers() }); }
  catch (error) { return fail(res, error); }
};

export const getManager = async (req: Request, res: Response) => {
  const mobile = String(req.params.mobile);
  if (!/^[6-9]\d{9}$/.test(mobile)) return res.status(400).json({ success: false, message: 'Enter a valid mobile number.' });
  try {
    const manager = await findManagerByMobile(mobile);
    if (!manager) return res.status(404).json({ success: false, message: 'Manager not found.' });
    return res.json({ success: true, manager: publicManager(manager) });
  } catch (error) { return fail(res, error); }
};

const saveManager = async (req: Request, res: Response, editing: boolean) => {
  res.setHeader('Cache-Control', 'no-store');
  const { name, mobile, role, password, isActive = editing ? undefined : true } = req.body ?? {};
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 100 ||
      typeof mobile !== 'string' || !/^[6-9]\d{9}$/.test(mobile.trim()) ||
      typeof role !== 'string' || !role.trim() || role.trim().length > 50 ||
      typeof isActive !== 'boolean' ||
      (!editing && (typeof password !== 'string' || !password.trim())) ||
      (password !== undefined && (typeof password !== 'string' || (password !== '' && !password.trim()) || Buffer.byteLength(password) > 72))) {
    return res.status(400).json({ success: false, message: 'Enter a name, valid mobile number, role, status and password (maximum 72 bytes). Password is optional when updating.' });
  }
  const id = Number(req.params.id);
  if (editing && (!Number.isSafeInteger(id) || id < 1)) return res.status(400).json({ success: false, message: 'Invalid manager ID.' });
  if (editing && id === res.locals.user.id && (!isActive || role.trim().toUpperCase() !== 'ADMIN')) {
    return res.status(400).json({ success: false, message: 'You cannot deactivate your own account or remove your administrator role.' });
  }
  try {
    const hash = password ? await bcrypt.hash(password, 12) : null;
    const manager = editing
      ? await updateManager(id, name.trim(), mobile.trim(), role.trim(), isActive, hash)
      : await insertManager(name.trim(), mobile.trim(), hash!, role.trim(), isActive);
    if (!manager) return res.status(404).json({ success: false, message: 'Manager not found.' });
    return res.status(editing ? 200 : 201).json({ success: true, manager });
  } catch (error) { return fail(res, error); }
};

export const createManager = (req: Request, res: Response) => saveManager(req, res, false);
export const editManager = (req: Request, res: Response) => saveManager(req, res, true);
