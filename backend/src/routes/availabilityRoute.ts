import express from "express";
import { getAllConsoles } from "../handlers/availabilityHandler.js";
import API from "../constant.js";

const router = express.Router();

router.get(API.CONSOLES, getAllConsoles);

export default router;
