const mongoose = require("mongoose");

const truckSchema = new mongoose.Schema({
  truckId: { type: String, required: true, unique: true },
  driverName: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  speed: { type: Number, default: 0 },
  status: { type: String, enum: ["moving", "idle", "offline"], default: "idle" },
  routeName: { type: String, default: "Unknown Route" },
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Truck", truckSchema);