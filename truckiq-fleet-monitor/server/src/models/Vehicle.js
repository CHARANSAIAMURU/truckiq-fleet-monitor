const mongoose = require("mongoose");

/**
 * Vehicle holds the current known state of a truck.
 * Live location is stored on the vehicle itself for fast reads (current position on map),
 * while a full trail is stored separately in LocationHistory.
 */
const vehicleSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: [true, "vehicleId is required"],
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
    },
    driverName: {
      type: String,
      trim: true,
      default: "",
    },
    plateNumber: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "idle", "offline", "maintenance"],
      default: "offline",
    },
    location: {
      type: {
        lat: { type: Number, min: -90, max: 90 },
        lng: { type: Number, min: -180, max: 180 },
      },
      default: null,
    },
    speedKmh: {
      type: Number,
      default: 0,
      min: 0,
    },
    heading: {
      type: Number, // degrees, 0-360
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

vehicleSchema.index({ "location.lat": 1, "location.lng": 1 });

module.exports = mongoose.model("Vehicle", vehicleSchema);
