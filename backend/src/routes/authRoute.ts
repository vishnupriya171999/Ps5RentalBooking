import express from 'express';
import { rateLimit } from 'express-rate-limit';
import API from '../constant.js';
import { login } from '../handlers/authHandler.js';
import { createManager, getManagers, getManager, editManager, requireActiveManager, requireManagerAdmin } from '../handlers/managerHandler.js';

const router = express.Router();
const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
});
router.get(API.ME, (_req, res) => res.json({ success: true, user: res.locals.user }));
router.post(API.LOGIN, loginLimit, login);
router.get(API.MANAGERS, requireActiveManager, getManagers);
router.get(API.MANAGERS + '/:mobile', requireActiveManager, getManager);
router.put(API.MANAGERS + '/:id', requireActiveManager, requireManagerAdmin, editManager);
router.post(API.MANAGERS, requireActiveManager, requireManagerAdmin, rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
}), createManager);

export default router;
