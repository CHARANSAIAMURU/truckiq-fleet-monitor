const LABELS = {
  active: "Active",
  idle: "Idle",
  offline: "Offline",
  maintenance: "Maintenance",
};

export default function StatusChip({ status = "offline" }) {
  const key = LABELS[status] ? status : "offline";
  return (
    <span className={`status-chip status-${key}`}>
      <span className="status-dot" />
      {LABELS[key]}
    </span>
  );
}
