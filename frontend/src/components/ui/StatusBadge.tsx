import { cn } from "../../lib/cn";
import type { CommissionStatus, MilestoneStatus, RevisionStatus } from "../../types/commission";

type AnyStatus = CommissionStatus | MilestoneStatus | RevisionStatus;

const styles: Record<string, string> = {
  PENDING:     "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED:   "bg-green-100 text-green-700",
  CANCELLED:   "bg-red-100 text-red-700",
  ADDRESSED:   "bg-green-100 text-green-700",
  REJECTED:    "bg-red-100 text-red-700",
};

const labels: Record<string, string> = {
  PENDING:     "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED:   "Completed",
  CANCELLED:   "Cancelled",
  ADDRESSED:   "Addressed",
  REJECTED:    "Rejected",
};

interface StatusBadgeProps {
  status: AnyStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        styles[status] ?? "bg-slate-100 text-slate-700",
        className,
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}
