import { useState } from "react";
import { addressRevision, rejectRevision } from "../../api/milestones";
import { Button } from "../ui/Button";
import { StatusBadge } from "../ui/StatusBadge";
import { formatDateTime } from "../../lib/format";
import type { Revision } from "../../types/commission";

interface RevisionItemProps {
  revision: Revision;
  onRefresh: () => void;
  readOnly?: boolean;
}

export function RevisionItem({ revision, onRefresh, readOnly }: RevisionItemProps) {
  const [busy, setBusy] = useState<"address" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handle(action: "address" | "reject") {
    setBusy(action);
    setError(null);
    try {
      if (action === "address") await addressRevision(revision.id);
      else await rejectRevision(revision.id);
      onRefresh();
    } catch {
      setError("Failed to update revision.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Round {revision.roundNumber}</span>
          <StatusBadge status={revision.status} />
        </div>
        <span className="text-xs text-slate-400">{formatDateTime(revision.requestedAt)}</span>
      </div>

      <p className="text-sm text-slate-700">{revision.feedbackText}</p>

      {revision.addressedAt && (
        <p className="text-xs text-slate-400">Addressed {formatDateTime(revision.addressedAt)}</p>
      )}

      {revision.status === "PENDING" && !readOnly && (
        <div className="flex items-center gap-2 pt-0.5">
          <Button
            variant="ghost"
            className="h-7 px-2 text-xs text-green-700 hover:bg-green-50"
            loading={busy === "address"}
            disabled={busy !== null}
            onClick={() => handle("address")}
          >
            Address
          </Button>
          <Button
            variant="ghost"
            className="h-7 px-2 text-xs text-red-600 hover:bg-red-50"
            loading={busy === "reject"}
            disabled={busy !== null}
            onClick={() => handle("reject")}
          >
            Reject
          </Button>
          {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
      )}
    </div>
  );
}
