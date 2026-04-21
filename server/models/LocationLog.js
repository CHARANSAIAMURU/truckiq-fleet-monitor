const mongoose = require("mongoose");

const locationLogSchema = new mongoose.Schema({
  truckId: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  speed: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.models.LocationLog || mongoose.model("LocationLog", locationLogSchema);