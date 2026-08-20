import StatusChip from "./StatusChip";

export default function VehicleList({ vehicles, selectedId, onSelect }) {
  if (!vehicles.length) {
    return (
      <div className="empty-state">
        No trucks registered yet.
        <br />
        Run <code>npm run seed</code> in the server, or add a vehicle via the API.
      </div>
    );
  }

  return (
    <>
      {vehicles.map((v) => (
        <div
          key={v.vehicleId}
          className={`vehicle-card${v.vehicleId === selectedId ? " selected" : ""}`}
          onClick={() => onSelect(v.vehicleId)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onSelect(v.vehicleId);
          }}
        >
          <div className="vehicle-card-top">
            <div>
              <div className="vehicle-name">{v.name}</div>
              <div className="vehicle-id">{v.vehicleId}</div>
            </div>
            <StatusChip status={v.status} />
          </div>
          <div className="vehicle-meta">
            <span>{v.driverName || "Unassigned"}</span>
            <span>{v.speedKmh ? `${Math.round(v.speedKmh)} km/h` : "--"}</span>
          </div>
        </div>
      ))}
    </>
  );
}
