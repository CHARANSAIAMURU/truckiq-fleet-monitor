const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const vehicleRoutes = require("./routes/vehicleRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

function createApp() {
  const app = express();

  const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim());

  app.use(helmet());
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (process.env.NODE_ENV !== "test") {
    app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
  }

  app.get("/api/health", (req, res) => {
    res.status(200).json({ success: true, message: "TruckIQ API is healthy", time: new Date().toISOString() });
  });

  app.use("/api/vehicles", vehicleRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
