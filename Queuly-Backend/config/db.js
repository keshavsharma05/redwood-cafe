import mongoose from "mongoose";

const connectDB = async (retryCount = 5) => {
  try {
    console.log("[DB] Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("[DB] MongoDB connected successfully");
  } catch (error) {
    if (retryCount > 0) {
      console.warn(`[DB] Connection failed. Retrying in 5 seconds... (${retryCount} retries left)`);
      setTimeout(() => connectDB(retryCount - 1), 5000);
    } else {
      console.error("[DB] MongoDB connection failed after multiple attempts:", error.message);
      process.exit(1);
    }
  }
};

// Handle connection events
mongoose.connection.on("disconnected", () => {
  console.warn("[DB] MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on("error", (err) => {
  console.error("[DB] MongoDB error:", err.message);
});
mongoose.connection.once("open", () => {
  console.log("CONNECTED TO DB:", mongoose.connection.name);
});
export default connectDB;
