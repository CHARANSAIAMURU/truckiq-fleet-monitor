import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Leaflet's default marker icons reference image paths that don't resolve
// correctly under Vite's bundler. We replace markers with a divIcon truck
// glyph anyway, but this default fix keeps any fallback marker usable too.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const STATUS_COLOR = {
  active: "#34d399",
  idle: "#f5a623",
  offline: "#6b7280",
  maintenance: "#f87171",
};

function truckIcon(status, heading = 0) {
  const color = STATUS_COLOR[status] || STATUS_COLOR.offline;
  const html = `
    <div style="
      width:34px;height:34px;border-radius:50%;
      background:#161a22;border:2px solid ${color};
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 0 0 4px rgba(0,0,0,0.25);
      transform:rotate(${heading}deg);
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="transform:rotate(${-heading}deg)">
        <path d="M3 13h9V6H3v7z" stroke="${color}" stroke-width="1.6"/>
        <path d="M12 9h5l4 4v2h-9V9z" stroke="${color}" stroke-width="1.6"/>
        <circle cx="7" cy="17" r="1.6" fill="${color}"/>
        <circle cx="17" cy="17" r="1.6" fill="${color}"/>
      </svg>
    </div>`;
  return L.divIcon({
    html,
    className: "truck-marker-icon",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
}

/** Recenters/fits the map when the selected vehicle changes. */
function FlyToSelected({ vehicle }) {
  const map = useMap();
  useEffect(() => {
    if (vehicle?.location) {
      map.flyTo([vehicle.location.lat, vehicle.location.lng], Math.max(map.getZoom(), 11), {
        duration: 0.8,
      });
    }
  }, [vehicle?.vehicleId, vehicle?.location?.lat, vehicle?.location?.lng]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function MapView({ vehicles, selectedVehicle, onSelect }) {
  const located = useMemo(() => vehicles.filter((v) => v.location), [vehicles]);
  const initialCenter = located[0]?.location
    ? [located[0].location.lat, located[0].location.lng]
    : [29.7604, -95.3698]; // Fallback: Texas Gulf Coast

  const hasCenteredOnce = useRef(false);

  return (
    <MapContainer
      center={initialCenter}
      zoom={7}
      scrollWheelZoom
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {located.map((v) => (
        <Marker
          key={v.vehicleId}
          position={[v.location.lat, v.location.lng]}
          icon={truckIcon(v.status, v.heading)}
          eventHandlers={{ click: () => onSelect(v.vehicleId) }}
        >
          <Popup>
            <div className="truck-popup">
              <h3>{v.name}</h3>
              <dl>
                <dt>ID</dt>
                <dd>{v.vehicleId}</dd>
                <dt>Driver</dt>
                <dd>{v.driverName || "Unassigned"}</dd>
                <dt>Status</dt>
                <dd>{v.status}</dd>
                <dt>Speed</dt>
                <dd>{Math.round(v.speedKmh || 0)} km/h</dd>
                <dt>Updated</dt>
                <dd>{v.lastUpdated ? new Date(v.lastUpdated).toLocaleTimeString() : "--"}</dd>
              </dl>
            </div>
          </Popup>
        </Marker>
      ))}

      {selectedVehicle?.location && <FlyToSelected vehicle={selectedVehicle} />}
    </MapContainer>
  );
}
