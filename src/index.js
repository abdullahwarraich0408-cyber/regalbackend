import "dotenv/config";
import cors from "cors";
import express from "express";
import bookingsRouter from "./routes/bookings.js";
import portfolioRouter from "./routes/portfolio.js";
import eventTypesRouter from "./routes/event-types.js";
import servicesRouter from "./routes/services.js";
import testimonialsRouter from "./routes/testimonials.js";
import enquiriesRouter from "./routes/enquiries.js";
import instagramRouter from "./routes/instagram.js";
import uploadsRouter from "./routes/uploads.js";
import { initDatabase, verifyDatabaseConnection } from "./db/schema.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = Number(process.env.PORT) || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "..", "uploads");
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || "http://localhost:8080",
  process.env.ADMIN_ORIGIN || "http://localhost:3000",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

app.get("/health", async (_req, res) => {
  try {
    await verifyDatabaseConnection();
    res.json({ ok: true, service: "regal-knot-backend", database: "connected" });
  } catch (error) {
    res.status(503).json({
      ok: false,
      service: "regal-knot-backend",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Database unavailable",
    });
  }
});

app.use("/api/bookings", bookingsRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api/event-types", eventTypesRouter);
app.use("/api/services", servicesRouter);
app.use("/api/testimonials", testimonialsRouter);
app.use("/api/enquiries", enquiriesRouter);
app.use("/api/instagram", instagramRouter);
app.use("/api/uploads", uploadsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

async function startServer() {
  try {
    await verifyDatabaseConnection();
    await initDatabase();
    console.info("[db] connected to mysql");

    app.listen(port, () => {
      console.log(`Backend running at http://localhost:${port}`);
      console.log(`CORS enabled for ${allowedOrigins.join(", ")}`);
    });
  } catch (error) {
    console.error("[db] failed to connect to mysql");
    console.error(error instanceof Error ? error.message : error);
    console.error(
      "Start MySQL and check DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in backend/.env"
    );
    process.exit(1);
  }
}

startServer();
