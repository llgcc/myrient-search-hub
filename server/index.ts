import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import myrientRouter from "./routes/myrient.js";
import gameCoverRouter from "./routes/gameCover.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Use absolute path for production in Docker, fallback to relative for local dev
  const staticPath = process.env.NODE_ENV === "production" 
    ? "/app/dist/public" 
    : path.resolve(__dirname, "..", "dist", "public");

  console.log(`Static files path: ${staticPath}`);

  app.use(express.static(staticPath));

  // API 路由
  app.use("/api/myrient", myrientRouter);
  app.use("/api/game-cover", gameCoverRouter);

  // Health check
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req: any, res: any) => {
    res.sendFile(path.join(staticPath, "index.html"), (err) => {
      if (err) {
        res.status(404).json({ error: "Static files not found. Build might be incomplete." });
      }
    });
  });

  const port = process.env.PORT || 3001;

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(console.error);
