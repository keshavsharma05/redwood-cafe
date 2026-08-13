import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import orderRoutes from "./routes/orders.js";
import menuRoutes from "./routes/menu.js";
import authRoutes from "./routes/auth.js";
import paymentRoutes from "./routes/payments.js";
import errorHandler from "./middleware/errorMiddleware.js";
import initScheduler from "./config/scheduler.js";

dotenv.config();

// Connect to Database
connectDB();

// Init Background Jobs
initScheduler();

const app = express();

// Security Middlewares
app.use(helmet());
app.use(morgan("dev"));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development/polling
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// CORS Config
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.send("Redwood CafÃ© Backend API is running...");
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[SERVER] Started successfully on port ${PORT}`);
  console.log(`[SERVER] Health check available at /api/health`);
});
