const express = require("express");
const router = express.Router();
const Truck = require("../models/Truck");
const LocationLog = require("../models/LocationLog");

// Get all trucks
router.get("/", async (req, res) => {
  try {
    const trucks = await Truck.find();
    res.json(trucks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed trucks
router.post("/seed", async (req, res) => {
  try {
    await Truck.deleteMany({});
    await LocationLog.deleteMany({});

    const trucks = [
      {
        truckId: "TX-101",
        driverName: "James",
        lat: 32.77,
        lng: -96.79,
        speed: 40,
        status: "moving",
        routeName: "Dallas-Austin",
      },
      {
        truckId: "TX-102",
        driverName: "Maria",
        lat: 29.76,
        lng: -95.36,
        speed: 0,
        status: "idle",
        routeName: "Houston-SA",
      },
    ];

    const created = await Truck.insertMany(trucks);

    res.json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;