import express from "express";
import availabilityRouter from "./availabilityRoute.js";

import authRouter from "./authRoute.js";
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();
router.use(authenticate);

router.use("/auth", authRouter);
router.use("/availability", availabilityRouter);

export default router;
