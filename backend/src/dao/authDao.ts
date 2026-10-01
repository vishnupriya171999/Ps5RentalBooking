import pool from '../db.js';

export interface SecurityManager {
  ID: number;
  NAME: string;
  MOBILE: string;
  PASSWORD: string;
  ROLE: string;
  IS_ACTIVE: boolean;
  CREATED_AT: string;
  UPDATED_AT: string;
  PASS_EXPIRY_DATE: string;
  PASSWORD_SECONDS_LEFT: number;
}

export const managerColumns = `"ID" AS id, "NAME" AS name, "MOBILE" AS mobile, "ROLE" AS role,
  "IS_ACTIVE" AS "isActive", "PASS_EXPIRY_DATE" AS "passwordExpiresAt",
  "CREATED_AT" AS "createdAt", "UPDATED_AT" AS "updatedAt"`;

export const findManagerByMobile = async (mobile: string): Promise<SecurityManager | null> => {
  const result = await pool.query<SecurityManager>(
    `SELECT "ID", "NAME", "MOBILE", "PASSWORD", "ROLE", "IS_ACTIVE", "CREATED_AT", "UPDATED_AT", "PASS_EXPIRY_DATE",
      EXTRACT(EPOCH FROM ("PASS_EXPIRY_DATE" - CURRENT_TIMESTAMP))::float8 AS "PASSWORD_SECONDS_LEFT"
     FROM "SECURITY_MANAGERS" WHERE "MOBILE" = $1 LIMIT 1`, [mobile]);
  return result.rows[0] ?? null;
};

export const publicManager = (manager: SecurityManager) => ({
  id: manager.ID, name: manager.NAME, mobile: manager.MOBILE, role: manager.ROLE,
  isActive: manager.IS_ACTIVE, createdAt: manager.CREATED_AT, updatedAt: manager.UPDATED_AT,
  passwordExpiresAt: manager.PASS_EXPIRY_DATE,
});

export const insertManager = async (name: string, mobile: string, passwordHash: string, role: string, isActive = true) => {
  const result = await pool.query(
    `INSERT INTO "SECURITY_MANAGERS" ("NAME", "MOBILE", "PASSWORD", "ROLE", "IS_ACTIVE")
     VALUES ($1, $2, $3, $4, $5) RETURNING ${managerColumns}`,
    [name, mobile, passwordHash, role, isActive]);
  return result.rows[0];
};

export const listManagers = async () => {
  const result = await pool.query(`SELECT ${managerColumns} FROM "SECURITY_MANAGERS" ORDER BY "UPDATED_AT" DESC, "ID" DESC`);
  return result.rows;
};

export const findManagerById = async (id: number) => {
  const result = await pool.query(`SELECT ${managerColumns} FROM "SECURITY_MANAGERS" WHERE "ID" = $1`, [id]);
  return result.rows[0] ?? null;
};

export const updateManager = async (id: number, name: string, mobile: string, role: string, isActive: boolean, passwordHash: string | null) => {
  const result = await pool.query(
    `UPDATE "SECURITY_MANAGERS" SET "NAME" = $2, "MOBILE" = $3, "ROLE" = $4, "IS_ACTIVE" = $5,
      "PASSWORD" = COALESCE($6, "PASSWORD"),
      "PASS_EXPIRY_DATE" = CASE WHEN $6::text IS NULL THEN "PASS_EXPIRY_DATE" ELSE CURRENT_TIMESTAMP + INTERVAL '1 month' END,
      "UPDATED_AT" = CURRENT_TIMESTAMP
     WHERE "ID" = $1 RETURNING ${managerColumns}`, [id, name, mobile, role, isActive, passwordHash]);
  return result.rows[0] ?? null;
};
