import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const socket = io("http://localhost:5000");

function App() {
  const [trucks, setTrucks] = useState([]);

  useEffect(() => {
    fetchTrucks();

    socket.on("update", (updatedTruck) => {
      setTrucks((prev) =>
        prev.map((t) =>
          t.truckId === updatedTruck.truckId ? updatedTruck : t
        )
      );
    });

    return () => socket.off("update");
  }, []);

  const fetchTrucks = async () => {
    const res = await axios.get("http://localhost:5000/api/trucks");
    setTrucks(res.data);
  };

  return (
    <div style={{ height: "100vh" }}>
      <h2 style={{ textAlign: "center" }}>TruckIQ Fleet Monitor</h2>

      <MapContainer center={[30.2672, -97.7431]} zoom={5} style={{ height: "90%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {trucks.map((t) => (
          <Marker key={t._id} position={[t.lat, t.lng]}>
            <Popup>
  <b>{t.truckId}</b><br />
  Driver: {t.driverName}<br />
  Speed: {t.speed} mph<br />
  Status: {t.status}
</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;