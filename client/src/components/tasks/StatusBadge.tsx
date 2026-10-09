export type TaskStatusString = "Pending" | "In Progress" | "Testing" | "Completed";

export interface StatusBadgeProps {
  status: TaskStatusString | string;
  className?: string;
}

const STATUS_CONFIG: Record<string, { styleClasses: string; dotClass: string }> = {
  "In Progress": {
    styleClasses: "bg-accent-soft/70 text-accent-deep border-accent/30",
    dotClass: "bg-accent",
  },
  Testing: {
    styleClasses: "bg-amber-100/80 text-amber-900 border-amber-300",
    dotClass: "bg-amber-600",
  },
  Completed: {
    styleClasses: "bg-emerald-100/80 text-emerald-900 border-emerald-300",
    dotClass: "bg-emerald-600",
  },
  Pending: {
    styleClasses: "bg-sunk text-mute border-line",
    dotClass: "bg-mute/70",
  },
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide ${config.styleClasses} ${className}`}
      aria-label={`Status: ${status}`}
    >
      <span className={`size-1.5 rounded-full ${config.dotClass}`} aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}
