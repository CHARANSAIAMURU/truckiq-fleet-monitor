export default function TopBar({ vehicles, connected }) {
  const counts = vehicles.reduce(
    (acc, v) => {
      acc.total += 1;
      acc[v.status] = (acc[v.status] || 0) + 1;
      return acc;
    },
    { total: 0, active: 0, idle: 0, offline: 0, maintenance: 0 }
  );

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">TQ</div>
        <div className="brand-text">
          <h1>TruckIQ</h1>
          <span>Fleet Monitor</span>
        </div>
      </div>

      <div className="fleet-stats">
        <div className="stat">
          <span className="stat-value">{counts.total}</span>
          <span className="stat-label">Fleet</span>
        </div>
        <div className="stat">
          <span className="stat-value" style={{ color: "#34d399" }}>
            {counts.active}
          </span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat">
          <span className="stat-value" style={{ color: "#f5a623" }}>
            {counts.idle}
          </span>
          <span className="stat-label">Idle</span>
        </div>
        <div className="stat">
          <span className="stat-value" style={{ color: "#6b7280" }}>
            {counts.offline}
          </span>
          <span className="stat-label">Offline</span>
        </div>
      </div>

      <div className={`conn-pill${connected ? " live" : ""}`}>
        <span className="conn-dot" />
        {connected ? "Live" : "Reconnecting"}
      </div>
    </header>
  );
}
