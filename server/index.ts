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

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // API 路由
  app.use("/api/myrient", myrientRouter);
  app.use("/api/game-cover", gameCoverRouter);

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req: any, res: any) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3001;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
