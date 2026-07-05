import "express-async-errors"; // Must be first — patches Express to catch async errors
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { prisma } from "./lib/prisma";

const app = express();
const PORT = parseInt(process.env.PORT ?? "3001", 10);

// =============================================================================
// Global middleware
// =============================================================================

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting — 100 req/min per IP (increase for production)
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, code: "RATE_LIMITED", message: "Too many requests." },
  })
);

// =============================================================================
// Routes
// =============================================================================

app.use("/api", router);

// Health check
app.get("/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);

// =============================================================================
// Error handler (must be last)
// =============================================================================

app.use(errorHandler);

// =============================================================================
// Start
// =============================================================================

async function main() {
  await prisma.$connect();
  console.log("✅ Database connected");

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV ?? "development"}`);
  });
}

main().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});

export default app;
