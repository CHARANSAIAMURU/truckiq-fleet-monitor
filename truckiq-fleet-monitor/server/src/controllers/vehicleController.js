const asyncHandler = require("express-async-handler");
const Vehicle = require("../models/Vehicle");
const LocationHistory = require("../models/LocationHistory");

/**
 * @desc    Get all vehicles (current state)
 * @route   GET /api/vehicles
 * @access  Public
 */
const getVehicles = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const vehicles = await Vehicle.find(filter).sort({ name: 1 });
  res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
});

/**
 * @desc    Get a single vehicle by vehicleId
 * @route   GET /api/vehicles/:vehicleId
 * @access  Public
 */
const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOne({ vehicleId: req.params.vehicleId });

  if (!vehicle) {
    res.status(404);
    throw new Error(`Vehicle '${req.params.vehicleId}' not found`);
  }

  res.status(200).json({ success: true, data: vehicle });
});

/**
 * @desc    Register a new vehicle
 * @route   POST /api/vehicles
 * @access  Public
 */
const createVehicle = asyncHandler(async (req, res) => {
  const { vehicleId, name, driverName, plateNumber } = req.body;

  const exists = await Vehicle.findOne({ vehicleId });
  if (exists) {
    res.status(409);
    throw new Error(`Vehicle '${vehicleId}' already exists`);
  }

  const vehicle = await Vehicle.create({
    vehicleId,
    name,
    driverName,
    plateNumber,
    status: "offline",
  });

  res.status(201).json({ success: true, data: vehicle });
});

/**
 * @desc    Update vehicle metadata (name, driver, plate, status)
 * @route   PATCH /api/vehicles/:vehicleId
 * @access  Public
 */
const updateVehicle = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "driverName", "plateNumber", "status"];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const vehicle = await Vehicle.findOneAndUpdate(
    { vehicleId: req.params.vehicleId },
    updates,
    { new: true, runValidators: true }
  );

  if (!vehicle) {
    res.status(404);
    throw new Error(`Vehicle '${req.params.vehicleId}' not found`);
  }

  res.status(200).json({ success: true, data: vehicle });
});

/**
 * @desc    Delete a vehicle
 * @route   DELETE /api/vehicles/:vehicleId
 * @access  Public
 */
const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOneAndDelete({ vehicleId: req.params.vehicleId });

  if (!vehicle) {
    res.status(404);
    throw new Error(`Vehicle '${req.params.vehicleId}' not found`);
  }

  await LocationHistory.deleteMany({ vehicleId: req.params.vehicleId });

  res.status(200).json({ success: true, data: {} });
});

/**
 * @desc    Ingest a GPS location update for a vehicle (REST fallback to the
 *          Socket.IO "location:update" event — used by devices/scripts that
 *          can't hold a websocket open).
 * @route   POST /api/vehicles/:vehicleId/location
 * @access  Public
 */
const postLocationUpdate = asyncHandler(async (req, res) => {
  const { lat, lng, speedKmh = 0, heading = 0 } = req.body;

  if (typeof lat !== "number" || typeof lng !== "number") {
    res.status(400);
    throw new Error("lat and lng must be numbers");
  }

  const vehicle = await Vehicle.findOneAndUpdate(
    { vehicleId: req.params.vehicleId },
    {
      location: { lat, lng },
      speedKmh,
      heading,
      status: speedKmh > 1 ? "active" : "idle",
      lastUpdated: new Date(),
    },
    { new: true }
  );

  if (!vehicle) {
    res.status(404);
    throw new Error(`Vehicle '${req.params.vehicleId}' not found`);
  }

  await LocationHistory.create({
    vehicle: vehicle._id,
    vehicleId: vehicle.vehicleId,
    lat,
    lng,
    speedKmh,
    heading,
  });

  // Broadcast to all connected clients in real time.
  const io = req.app.get("io");
  if (io) io.emit("vehicle:update", vehicle);

  res.status(200).json({ success: true, data: vehicle });
});

/**
 * @desc    Get location history (trail) for a vehicle
 * @route   GET /api/vehicles/:vehicleId/history?limit=200&from=&to=
 * @access  Public
 */
const getVehicleHistory = asyncHandler(async (req, res) => {
  const { limit = 200, from, to } = req.query;

  const filter = { vehicleId: req.params.vehicleId };
  if (from || to) {
    filter.recordedAt = {};
    if (from) filter.recordedAt.$gte = new Date(from);
    if (to) filter.recordedAt.$lte = new Date(to);
  }

  const history = await LocationHistory.find(filter)
    .sort({ recordedAt: -1 })
    .limit(Math.min(Number(limit) || 200, 1000));

  res.status(200).json({ success: true, count: history.length, data: history.reverse() });
});

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  postLocationUpdate,
  getVehicleHistory,
};
