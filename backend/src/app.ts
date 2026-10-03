import type { Request, Response, NextFunction } from 'express';
import express from "express";
import cors from "cors";
import registerRoutes from "./routes/registerRoutes.js";
import { API_PREFIX, CORS_ORIGINS } from './config.js';

const app = express();

app.disable("x-powered-by");
app.use(cors({ origin: CORS_ORIGINS.length ? CORS_ORIGINS : '*' }));
app.use(express.json({ limit: "100kb" }));

app.get("/", (req, res) => {
  res.json({ success: true, message: "PS5 Rental Backend Running" });
});

app.use(API_PREFIX, registerRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  const errorType = typeof error === "object" && error !== null && "type" in error ? error.type : undefined;
  if (res.headersSent) return next(error);

  if (errorType === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Invalid JSON body" });
  }
  if (errorType === "entity.too.large") {
    return res.status(413).json({ success: false, message: "Request body too large" });
  }

  console.error("Unhandled request error:", error instanceof Error ? error.message : "Unknown error");
  return res.status(500).json({ success: false, message: "Internal server error" });
});

export default app;
