type Status = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

const config: Record<Status, { label: string; className: string; dot: string }> = {
  PENDING: { label: "Pending", className: "badge-pending", dot: "bg-yellow-400" },
  CONFIRMED: { label: "Confirmed", className: "badge-confirmed", dot: "bg-green-400" },
  COMPLETED: { label: "Completed", className: "badge-completed", dot: "bg-blue-400" },
  CANCELLED: { label: "Cancelled", className: "badge-cancelled", dot: "bg-red-400" },
  NO_SHOW: { label: "No Show", className: "badge-no_show", dot: "bg-gray-400" },
};

export function StatusBadge({ status }: { status: Status }) {
  const cfg = config[status] || config.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
