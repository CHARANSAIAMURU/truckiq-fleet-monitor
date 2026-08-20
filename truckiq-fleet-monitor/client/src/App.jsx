import { useState, useMemo } from "react";
import TopBar from "./components/TopBar";
import VehicleList from "./components/VehicleList";
import MapView from "./components/MapView";
import useFleetSocket from "./hooks/useFleetSocket";

export default function App() {
  const { vehicles, connected, loading, error } = useFleetSocket();
  const [selectedId, setSelectedId] = useState(null);

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.vehicleId === selectedId) || null,
    [vehicles, selectedId]
  );

  return (
    <div className="app-shell">
      <TopBar vehicles={vehicles} connected={connected} />

      <div className="main-layout">
        <aside className="sidebar">
          <div className="sidebar-heading">Fleet ({vehicles.length})</div>
          {loading ? (
            <div className="empty-state">Loading fleet…</div>
          ) : (
            <VehicleList vehicles={vehicles} selectedId={selectedId} onSelect={setSelectedId} />
          )}
        </aside>

        <div className="map-wrap">
          {error && <div className="map-error-banner">Couldn&apos;t load fleet data: {error}</div>}
          <MapView vehicles={vehicles} selectedVehicle={selectedVehicle} onSelect={setSelectedId} />
        </div>
      </div>
    </div>
  );
}
