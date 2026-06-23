import { useState } from "react";
import { completeMilestone, createRevision } from "../../api/milestones";
import { ApiError } from "../../api/client";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { StatusBadge } from "../ui/StatusBadge";
import { RevisionItem } from "./RevisionItem";
import { formatDate } from "../../lib/format";
import type { Milestone } from "../../types/commission";

interface MilestoneCardProps {
  milestone: Milestone;
  onRefresh: () => void;
  readOnly?: boolean;
  clientFeedback?: boolean;
}

export function MilestoneCard({ milestone, onRefresh, readOnly, clientFeedback }: MilestoneCardProps) {
  const [completeOpen, setCompleteOpen]   = useState(false);
  const [deliverableUrl, setDeliverableUrl] = useState("");
  const [completeLoading, setCompleteLoading] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [pendingForce, setPendingForce]   = useState(false);

  const [revisionText, setRevisionText]     = useState("");
  const [revisionLoading, setRevisionLoading] = useState(false);
  const [revisionError, setRevisionError]   = useState<string | null>(null);

  function openComplete() {
    setDeliverableUrl(milestone.deliverableUrl ?? "");
    setCompleteError(null);
    setPendingForce(false);
    setCompleteOpen(true);
  }

  function closeComplete() {
    setCompleteOpen(false);
    setCompleteError(null);
    setPendingForce(false);
  }

  async function handleComplete(force: boolean) {
    if (!deliverableUrl.trim()) {
      setCompleteError("Deliverable URL is required.");
      return;
    }
    setCompleteLoading(true);
    setCompleteError(null);
    try {
      await completeMilestone(milestone.id, {
        deliverableUrl: deliverableUrl.trim(),
        forceComplete: force,
      });
      closeComplete();
      onRefresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setPendingForce(true);
        setCompleteError(err.message);
      } else {
        setCompleteError("Failed to complete milestone.");
      }
    } finally {
      setCompleteLoading(false);
    }
  }

  async function handleAddRevision() {
    if (!revisionText.trim()) return;
    setRevisionLoading(true);
    setRevisionError(null);
    try {
      await createRevision(milestone.id, revisionText.trim());
      setRevisionText("");
      onRefresh();
    } catch {
      setRevisionError("Failed to add revision.");
    } finally {
      setRevisionLoading(false);
    }
  }

  const isTerminal = milestone.status === "COMPLETED" || milestone.status === "CANCELLED";

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-900">
              {milestone.orderIndex}. {milestone.name}
            </span>
            <StatusBadge status={milestone.status} />
          </div>
          {!isTerminal && !readOnly && (
            <Button className="h-7 px-3 text-xs shrink-0" onClick={openComplete}>
              Complete
            </Button>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          {milestone.dueDate && <span>Due {formatDate(milestone.dueDate)}</span>}
          {milestone.completedAt && <span>Completed {formatDate(milestone.completedAt)}</span>}
          {milestone.deliverableUrl && (
            <a
              href={milestone.deliverableUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-600 underline truncate max-w-xs"
            >
              {milestone.deliverableUrl}
            </a>
          )}
        </div>

        {/* Revisions */}
        {milestone.revisions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Revisions ({milestone.revisions.length})
            </p>
            {milestone.revisions.map((rev) => (
              <RevisionItem key={rev.id} revision={rev} onRefresh={onRefresh} readOnly={readOnly} />
            ))}
          </div>
        )}

        {/* Add revision — artist logs feedback, client leaves feedback */}
        {!isTerminal && !readOnly && (
          <div className="space-y-1">
            <div className="flex gap-2">
              <Input
                placeholder="Log client feedback…"
                value={revisionText}
                onChange={(e) => setRevisionText(e.target.value)}
                className="text-sm"
                onKeyDown={(e) => { if (e.key === "Enter") void handleAddRevision(); }}
              />
              <Button
                className="h-9 px-3 text-sm shrink-0"
                loading={revisionLoading}
                disabled={!revisionText.trim()}
                onClick={() => void handleAddRevision()}
              >
                Add
              </Button>
            </div>
            {revisionError && <p className="text-xs text-red-500">{revisionError}</p>}
          </div>
        )}
        {clientFeedback && (
          <div className="space-y-1">
            <div className="flex gap-2">
              <Input
                placeholder="Request a change or leave feedback…"
                value={revisionText}
                onChange={(e) => setRevisionText(e.target.value)}
                className="text-sm"
                onKeyDown={(e) => { if (e.key === "Enter") void handleAddRevision(); }}
              />
              <Button
                className="h-9 px-3 text-sm shrink-0"
                loading={revisionLoading}
                disabled={!revisionText.trim()}
                onClick={() => void handleAddRevision()}
              >
                Send
              </Button>
            </div>
            {revisionError && <p className="text-xs text-red-500">{revisionError}</p>}
          </div>
        )}
      </div>

      {/* Complete modal */}
      <Modal open={completeOpen} onClose={closeComplete} title={`Complete: ${milestone.name}`}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Deliverable URL
            </label>
            <Input
              type="url"
              placeholder="https://drive.google.com/…"
              value={deliverableUrl}
              onChange={(e) => setDeliverableUrl(e.target.value)}
            />
          </div>

          {completeError && (
            <div
              className={`rounded-lg px-3 py-2 text-sm ${
                pendingForce
                  ? "border border-amber-200 bg-amber-50 text-amber-800"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {pendingForce && (
                <p className="font-medium mb-1">This milestone has pending revisions.</p>
              )}
              <p>{completeError}</p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={closeComplete} disabled={completeLoading}>
              Cancel
            </Button>
            {pendingForce ? (
              <Button
                className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700"
                loading={completeLoading}
                onClick={() => void handleComplete(true)}
              >
                Complete anyway
              </Button>
            ) : (
              <Button loading={completeLoading} onClick={() => void handleComplete(false)}>
                Complete
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
