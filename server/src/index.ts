import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import postRoutes from "./routes/postRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { initDb } from "./config/db.js";
import twahaAuthRoutes from "./routes/twahaAuthRoutes.js";

const app = new Hono();

initDb();
app.use(logger());

// Healthcheck
app.get("/", (c) => c.text("Forum API server running..."));

app.route("/api/posts", postRoutes);
app.route("/api/anindya/auth", authRoutes);
app.route("/api/twaha/auth", twahaAuthRoutes);

const port = Number(process.env.PORT) || 5000;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
