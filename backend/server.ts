import app from "./src/app.js";
import pool from "./src/db.js";
import { getServerConfig } from './src/config.js';

const startServer = async () => {
  const { host, port } = getServerConfig();

  try {
    await pool.query("SELECT 1");
    const server = app.listen(port, host, () => {
      console.log(`Server listening on ${host}:${port}`);
    });

    server.on("error", async (error) => {
      console.error("HTTP server error:", error instanceof Error ? error.message : "Unknown error");
      await pool.end();
      process.exitCode = 1;
    });

    let shuttingDown = false;
    const shutdown = () => {
      if (shuttingDown) return;
      shuttingDown = true;
      const timeout = setTimeout(() => process.exit(1), 10000);
      timeout.unref();
      server.close(async () => {
        try {
          await pool.end();
        } catch (error) {
          console.error("Shutdown failed:", error instanceof Error ? error.message : "Unknown error");
          process.exitCode = 1;
        } finally {
          clearTimeout(timeout);
        }
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Database startup check failed:", error instanceof Error ? error.message : "Unknown error");
    await pool.end();
    process.exitCode = 1;
  }
};

// Vercel serves the exported app and owns its listener lifecycle.
if (!process.env.VERCEL) await startServer();

export default app;
