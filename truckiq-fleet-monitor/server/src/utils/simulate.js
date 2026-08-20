/**
 * Simulates live GPS pings for the seeded demo trucks by connecting as a
 * Socket.IO client and emitting "location:update" every few seconds.
 * Handy for demoing the real-time map without real hardware.
 *
 * Usage: node src/utils/simulate.js
 */
require("dotenv").config();
const { io } = require("socket.io-client");

const SERVER_URL = `http://localhost:${process.env.PORT || 5000}`;
const vehicleIds = ["TRK-001", "TRK-002", "TRK-003"];

// Track a simple pseudo-random walk per vehicle starting near their seeded point.
const state = {
  "TRK-001": { lat: 27.8006, lng: -97.3964 },
  "TRK-002": { lat: 29.7604, lng: -95.3698 },
  "TRK-003": { lat: 32.7767, lng: -96.797 },
};

const socket = io(SERVER_URL, { transports: ["websocket"] });

socket.on("connect", () => {
  console.log(`[simulate] connected to ${SERVER_URL} as ${socket.id}`);

  setInterval(() => {
    vehicleIds.forEach((vehicleId) => {
      const pos = state[vehicleId];
      // Small random drift to emulate movement.
      pos.lat += (Math.random() - 0.5) * 0.01;
      pos.lng += (Math.random() - 0.5) * 0.01;

      const speedKmh = Math.round(30 + Math.random() * 60);
      const heading = Math.round(Math.random() * 360);

      socket.emit(
        "location:update",
        { vehicleId, lat: pos.lat, lng: pos.lng, speedKmh, heading },
        (response) => {
          if (!response?.success) {
            console.warn(`[simulate] update failed for ${vehicleId}:`, response?.message);
          }
        }
      );
    });
  }, 4000);
});

socket.on("connect_error", (err) => {
  console.error("[simulate] connection error:", err.message);
});
