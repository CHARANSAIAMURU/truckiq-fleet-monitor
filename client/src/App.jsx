import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

// IMPORTANT: no fallback to localhost in production
console.log("API URL =", import.meta.env.VITE_API_URL);

function App() {
  const [trucks, setTrucks] = useState([]);
  const [error, setError] = useState("");

  // Fetch trucks
  const fetchTrucks = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/trucks`);
      setTrucks(res.data);
      setError("");
    } catch (err) {
      console.error("Truck data error:", err);
      setError("Could not load truck data from backend.");
    }
  };

  useEffect(() => {
    fetchTrucks();

    // Socket connection
    const socket = io(API_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("update", (updatedTruck) => {
      setTrucks((prev) =>
        prev.map((truck) =>
          truck.truckId === updatedTruck.truckId ? updatedTruck : truck
        )
      );
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="app">
      <h1>TruckIQ Fleet Monitor</h1>

      {error && <p className="error">{error}</p>}

      <MapContainer
        center={[31.5, -96.5]}
        zoom={6}
        scrollWheelZoom={true}
        className="map"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {trucks.map((truck) => (
          <Marker key={truck._id} position={[truck.lat, truck.lng]}>
            <Popup>
              <strong>{truck.truckId}</strong>
              <br />
              Driver: {truck.driverName}
              <br />
              Speed: {truck.speed} mph
              <br />
              Status: {truck.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="truck-list">
        <h2>Active Trucks</h2>

        {trucks.map((truck) => (
          <div className="truck-card" key={truck._id}>
            <strong>{truck.truckId}</strong>
            <p>Driver: {truck.driverName}</p>
            <p>Speed: {truck.speed} mph</p>
            <p>Status: {truck.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
