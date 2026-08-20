/**
 * Seeds a handful of demo trucks so the dashboard isn't empty on first run.
 * Usage: npm run seed
 */
require("dotenv").config();
const connectDB = require("../config/db");
const Vehicle = require("../models/Vehicle");
const mongoose = require("mongoose");

const demoVehicles = [
  {
    vehicleId: "TRK-001",
    name: "Highway Hauler",
    driverName: "Alex Rivera",
    plateNumber: "TX-4821",
    status: "idle",
    location: { lat: 27.8006, lng: -97.3964 }, // Corpus Christi, TX
  },
  {
    vehicleId: "TRK-002",
    name: "Coastal Cargo",
    driverName: "Jamie Chen",
    plateNumber: "TX-1190",
    status: "idle",
    location: { lat: 29.7604, lng: -95.3698 }, // Houston, TX
  },
  {
    vehicleId: "TRK-003",
    name: "Border Runner",
    driverName: "Sam Patel",
    plateNumber: "TX-7745",
    status: "idle",
    location: { lat: 32.7767, lng: -96.797 }, // Dallas, TX
  },
];

async function seed() {
  await connectDB();

  for (const v of demoVehicles) {
    await Vehicle.findOneAndUpdate({ vehicleId: v.vehicleId }, v, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
    console.log(`[seed] upserted ${v.vehicleId}`);
  }

  console.log("[seed] done");
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
