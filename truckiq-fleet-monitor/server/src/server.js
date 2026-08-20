require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const createApp = require("./app");
const connectDB = require("./config/db");
const { initSocket, startOfflineWatcher } = require("./sockets/socketHandler");

const PORT = process.env.PORT || 5000;
const OFFLINE_THRESHOLD_MS = Number(process.env.OFFLINE_THRESHOLD_MS) || 60000;

async function start() {
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);

  const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim());

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Make io available inside REST controllers (req.app.get("io")) so a
  // plain HTTP location POST can also broadcast over the websocket.
  app.set("io", io);

  initSocket(io);
  startOfflineWatcher(io, OFFLINE_THRESHOLD_MS);

  server.listen(PORT, () => {
    console.log(`[server] TruckIQ API listening on port ${PORT} (${process.env.NODE_ENV || "development"})`);
  });

  const shutdown = (signal) => {
    console.log(`[server] ${signal} received, shutting down gracefully...`);
    server.close(() => {
      console.log("[server] HTTP server closed");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("unhandledRejection", (err) => {
    console.error("[server] Unhandled Rejection:", err);
  });
}

start();
