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

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

app.use("/api/trucks", truckRoutes);

app.get("/", (req, res) => {
  res.send("TruckIQ backend running");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Fake GPS updates
setInterval(async () => {
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
      speed: t.speed,
    });

    io.emit("update", t);
  }
}, 5000);

server.listen(5000, () => {
  console.log("Server running on port 5000");
});