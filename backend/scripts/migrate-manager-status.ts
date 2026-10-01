import pool from '../src/db.js';
try {
  await pool.query(`ALTER TABLE "SECURITY_MANAGERS" ADD COLUMN IF NOT EXISTS "IS_ACTIVE" boolean NOT NULL DEFAULT true`);
  console.log('Manager status migration complete. Existing managers default to active.');
} finally { await pool.end(); }
