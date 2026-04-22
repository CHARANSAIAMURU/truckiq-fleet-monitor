const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

const Truck = require("./models/Truck");
const LocationLog = require("./models/LocationLog");
const truckRoutes = require("./routes/trucks");

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("TruckIQ backend running");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "TruckIQ Fleet Monitor API"
  });
});

app.use("/api/trucks", truckRoutes);
console.log("MONGO_URI =", process.env.MONGO_URI);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

setInterval(async () => {
  try {
    const trucks = await Truck.find();

    for (let t of trucks) {
      t.lat += (Math.random() - 0.5) * 0.01;
      t.lng += (Math.random() - 0.5) * 0.01;
      t.speed = Math.floor(Math.random() * 80);
      t.status = t.speed === 0 ? "idle" : "moving";
      t.lastUpdated = new Date();

      await t.save();

      await LocationLog.create({
        truckId: t.truckId,
        lat: t.lat,
        lng: t.lng,
        speed: t.speed
      });

      io.emit("update", t);
    }
  } catch (err) {
    console.error("GPS update simulation failed:", err.message);
  }
}, 5000);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
