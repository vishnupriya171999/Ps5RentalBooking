import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const connection = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    };

const pool = new Pool({
  ...connection,
  connectionTimeoutMillis: 10000,
  ssl: {
    rejectUnauthorized: true,
  },
});

pool.on("connect", () => {
  console.log("PostgreSQL connected successfully");
});

pool.on("error", (error) => {
  console.error("PostgreSQL connection error:", error);
});

export default pool;
