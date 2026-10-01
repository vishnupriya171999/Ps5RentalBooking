import pool from "../db.js";

export const getAllConsoles = async () => {
  const result = await pool.query<{ current_time: Date }>("SELECT NOW() AS current_time");

  return result.rows;
};
