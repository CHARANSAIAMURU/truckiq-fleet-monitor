const Vehicle = require("../models/Vehicle");
const LocationHistory = require("../models/LocationHistory");

/**
 * Wires up all Socket.IO event handling.
 *
 * Client -> Server events:
 *   - "location:update"  { vehicleId, lat, lng, speedKmh, heading }
 *       Pushed by a truck/simulator device to report a new GPS fix.
 *
 * Server -> Client events:
 *   - "vehicle:update"   Full vehicle document, broadcast whenever a
 *                        vehicle's location/status changes.
 *   - "vehicle:offline"  { vehicleId } when a vehicle is marked offline
 *                        due to inactivity.
 *   - "error"            { message } sent back to the originating socket
 *                        if an update fails validation.
 */
function initSocket(io) {
  io.on("connection", (socket) => {
    console.log(`[socket] client connected: ${socket.id}`);

    socket.on("location:update", async (payload = {}, ack) => {
      try {
        const { vehicleId, lat, lng, speedKmh = 0, heading = 0 } = payload;

        if (!vehicleId || typeof lat !== "number" || typeof lng !== "number") {
          const message = "location:update requires vehicleId, numeric lat, and numeric lng";
          socket.emit("error", { message });
          if (typeof ack === "function") ack({ success: false, message });
          return;
        }

        const vehicle = await Vehicle.findOneAndUpdate(
          { vehicleId },
          {
            location: { lat, lng },
            speedKmh,
            heading,
            status: speedKmh > 1 ? "active" : "idle",
            lastUpdated: new Date(),
          },
          { new: true, upsert: false }
        );

        if (!vehicle) {
          const message = `Vehicle '${vehicleId}' not found`;
          socket.emit("error", { message });
          if (typeof ack === "function") ack({ success: false, message });
          return;
        }

        await LocationHistory.create({
          vehicle: vehicle._id,
          vehicleId: vehicle.vehicleId,
          lat,
          lng,
          speedKmh,
          heading,
        });

        // Broadcast the new state to every connected dashboard.
        io.emit("vehicle:update", vehicle);

        if (typeof ack === "function") ack({ success: true, data: vehicle });
      } catch (err) {
        console.error("[socket] location:update error:", err.message);
        socket.emit("error", { message: "Failed to process location update" });
        if (typeof ack === "function") ack({ success: false, message: err.message });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`[socket] client disconnected: ${socket.id} (${reason})`);
    });
  });
}

/**
 * Periodically scans for vehicles that haven't reported in a while and
 * flips their status to "offline", broadcasting the change.
 */
function startOfflineWatcher(io, thresholdMs = 60000, intervalMs = 15000) {
  setInterval(async () => {
    try {
      const cutoff = new Date(Date.now() - thresholdMs);
      const staleVehicles = await Vehicle.find({
        lastUpdated: { $lt: cutoff },
        status: { $ne: "offline" },
      });

      for (const vehicle of staleVehicles) {
        vehicle.status = "offline";
        await vehicle.save();
        io.emit("vehicle:update", vehicle);
        io.emit("vehicle:offline", { vehicleId: vehicle.vehicleId });
      }
    } catch (err) {
      console.error("[socket] offline watcher error:", err.message);
    }
  }, intervalMs);
}

module.exports = { initSocket, startOfflineWatcher };
