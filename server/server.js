const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();

console.log("MONGO_URI USED:");
console.log(process.env.MONGO_URI);

const truckRoutes = require("./routes/truck");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/trucks", truckRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Socket
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
});

server.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port 5000");
});
