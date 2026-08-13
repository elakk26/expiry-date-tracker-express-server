require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const connectDB = require("./src/configs/db");
const swaggerSpec = require("./src/configs/swagger");
const authRoutes = require("./src/routes/authRoutes");
const errorHandler = require("./src/middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 5001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Swagger UI ───────────────────────────────────────────────────────────────
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "Expiry Date Tracker API Docs",
    swaggerOptions: { persistAuthorization: true },
  })
);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Expiry Date Tracker API is running 🚀",
    version: "1.0.0",
    docs: `/api-docs`,
  });
});

app.use("/auth", authRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ─── Connect to Database then Start Server ────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📚 Swagger docs at http://localhost:${PORT}/api-docs`);
  });
});

module.exports = app;
