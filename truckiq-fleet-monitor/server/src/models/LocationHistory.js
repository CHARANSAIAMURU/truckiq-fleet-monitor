const mongoose = require("mongoose");

/**
 * LocationHistory stores each GPS ping so a vehicle's route/trail can be
 * reconstructed and queried later (e.g. "show today's route for truck X").
 */
const locationHistorySchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      index: true,
    },
    vehicleId: {
      type: String,
      required: true,
      index: true,
    },
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
    speedKmh: { type: Number, default: 0 },
    heading: { type: Number, default: 0 },
    recordedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

// Efficient range queries per vehicle ("history between t1 and t2")
locationHistorySchema.index({ vehicleId: 1, recordedAt: -1 });

module.exports = mongoose.model("LocationHistory", locationHistorySchema);
