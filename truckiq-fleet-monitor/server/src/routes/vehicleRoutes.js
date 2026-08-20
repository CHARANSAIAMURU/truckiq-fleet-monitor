const express = require("express");
const { body } = require("express-validator");
const validateRequest = require("../middleware/validateRequest");
const {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  postLocationUpdate,
  getVehicleHistory,
} = require("../controllers/vehicleController");

const router = express.Router();

router
  .route("/")
  .get(getVehicles)
  .post(
    [
      body("vehicleId").trim().notEmpty().withMessage("vehicleId is required"),
      body("name").trim().notEmpty().withMessage("name is required"),
    ],
    validateRequest,
    createVehicle
  );

router
  .route("/:vehicleId")
  .get(getVehicleById)
  .patch(updateVehicle)
  .delete(deleteVehicle);

router
  .route("/:vehicleId/location")
  .post(
    [
      body("lat").isFloat({ min: -90, max: 90 }).withMessage("lat must be between -90 and 90"),
      body("lng").isFloat({ min: -180, max: 180 }).withMessage("lng must be between -180 and 180"),
      body("speedKmh").optional().isFloat({ min: 0 }),
      body("heading").optional().isFloat({ min: 0, max: 360 }),
    ],
    validateRequest,
    postLocationUpdate
  );

router.route("/:vehicleId/history").get(getVehicleHistory);

module.exports = router;
