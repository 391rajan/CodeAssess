require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const app = express();

// --------------- Middleware ---------------
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --------------- Routes ---------------
app.use("/api/auth", require("./routes/auth"));
app.use("/api/student", require("./routes/student"));
app.use("/api/submit", require("./routes/submit"));
app.use("/api/problems", require("./routes/problems"));
app.use("/api/admin", require("./routes/admin"));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    data: { status: "ok", timestamp: new Date().toISOString() },
    error: null,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    data: null,
    error: "Internal server error",
  });
});

// --------------- Start Server ---------------
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
