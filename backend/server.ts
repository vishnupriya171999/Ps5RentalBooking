import app from "./src/app.js";
import pool from "./src/db.js";

const port = Number(process.env.PORT || 5000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

try {
  await pool.query("SELECT 1");
  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
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
