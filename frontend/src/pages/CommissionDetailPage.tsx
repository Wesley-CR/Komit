import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cancelCommission, getBalance, getCommission } from "../api/commissions";
import { assignTag, createTag, listTags, unassignTag } from "../api/tags";
import { ApiError } from "../api/client";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Spinner } from "../components/ui/Spinner";
import { StatusBadge } from "../components/ui/StatusBadge";
import { MilestoneCard } from "../components/commission/MilestoneCard";
import { PaymentSection } from "../components/commission/PaymentSection";
import { formatDate, formatMoney } from "../lib/format";
import { Input } from "../components/ui/Input";
import type { Balance, CommissionDetail } from "../types/commission";
import type { Tag } from "../types/tag";

export function CommissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const commissionId = Number(id);

  const [commission, setCommission] = useState<CommissionDetail | null>(null);
  const [balance, setBalance]       = useState<Balance | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const [cancelOpen, setCancelOpen]       = useState(false);
  const [cancelReason, setCancelReason]   = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError]     = useState<string | null>(null);

  const [allTags, setAllTags]         = useState<Tag[]>([]);
  const [tagLoading, setTagLoading]   = useState(false);
  const [newTagName, setNewTagName]   = useState("");
  const [tagError, setTagError]       = useState<string | null>(null);



  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [comm, bal, tags] = await Promise.all([
        getCommission(commissionId),
        getBalance(commissionId),
        listTags(),
      ]);
      setCommission(comm);
      setBalance(bal);
      setAllTags(tags);
    } catch {
      setError("Failed to load commission.");
    } finally {
      setLoading(false);
    }
  }, [commissionId]);

  useEffect(() => {
    setLoading(true);
    void fetchAll();
  }, [fetchAll]);

  async function handleCancel() {
    setCancelLoading(true);
    setCancelError(null);
    try {
      await cancelCommission(commissionId, cancelReason || undefined);
      setCancelOpen(false);
      setCancelReason("");
      void fetchAll();
    } catch {
      setCancelError("Failed to cancel commission.");
    } finally {
      setCancelLoading(false);
    }
  }


  async function handleAssignTag(tagId: number) {
    setTagLoading(true);
    setTagError(null);
    try {
      await assignTag(commissionId, tagId);
      void fetchAll();
    } catch (err) {
      setTagError(err instanceof ApiError ? err.message : "Failed to assign tag.");
    } finally {
      setTagLoading(false);
    }
  }

  async function handleUnassignTag(tagId: number) {
    setTagLoading(true);
    setTagError(null);
    try {
      await unassignTag(commissionId, tagId);
      void fetchAll();
    } catch (err) {
      setTagError(err instanceof ApiError ? err.message : "Failed to remove tag.");
    } finally {
      setTagLoading(false);
    }
  }

  async function handleCreateAndAssignTag() {
    if (!newTagName.trim()) return;
    setTagLoading(true);
    setTagError(null);
    try {
      const tag = await createTag(newTagName.trim());
      await assignTag(commissionId, tag.id);
      setNewTagName("");
      void fetchAll();
    } catch (err) {
      setTagError(err instanceof ApiError ? err.message : "Failed to create tag.");
    } finally {
      setTagLoading(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <Spinner className="size-8" />
        </div>
      </Layout>
    );
  }

  if (error || !commission) {
    return (
      <Layout>
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error ?? "Commission not found."}
        </div>
      </Layout>
    );
  }

  const isTerminal = commission.status === "COMPLETED" || commission.status === "CANCELLED";

  return (
    <Layout>
      <div className="max-w-3xl space-y-5">
        {/* Back */}
        <button
          onClick={() => navigate("/commissions")}
          className="text-sm text-accent-600 hover:text-accent-700 flex items-center gap-1"
        >
          ← Back to commissions
        </button>

        {/* Header card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-900">{commission.title}</h1>
                <StatusBadge status={commission.status} />
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
                <span>
                  Client:{" "}
                  <strong className="text-slate-700 font-medium">{commission.clientName}</strong>
                </span>
                <span>
                  Type:{" "}
                  <strong className="text-slate-700 font-medium">{commission.commissionTypeName}</strong>
                </span>
                <span>
                  Price:{" "}
                  <strong className="text-slate-700 font-medium">
                    {formatMoney(commission.agreedPrice, commission.currency)}
                  </strong>
                </span>
                {commission.deadline && (
                  <span>
                    Deadline:{" "}
                    <strong className="text-slate-700 font-medium">
                      {formatDate(commission.deadline)}
                    </strong>
                  </span>
                )}
              </div>

              {commission.description && (
                <p className="text-sm text-slate-600">{commission.description}</p>
              )}
              {commission.cancellationReason && (
                <p className="text-sm text-slate-500">
                  <span className="font-medium text-red-600">Cancellation reason: </span>
                  {commission.cancellationReason}
                </p>
              )}
            </div>

            {!isTerminal && (
              <div className="shrink-0">
                <Button
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50 text-sm h-8 px-3"
                  onClick={() => setCancelOpen(true)}
                >
                  Cancel commission
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Balance */}
        {balance && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Balance
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Agreed</p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatMoney(balance.agreedPrice, commission.currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Paid</p>
                <p className="text-lg font-semibold text-green-700">
                  {formatMoney(balance.totalPaid, commission.currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">
                  {balance.isOverpaid ? "Tip received" : "Outstanding"}
                </p>
                <p className={`text-lg font-semibold ${balance.isOverpaid ? "text-violet-700" : "text-slate-900"}`}>
                  {balance.isOverpaid
                    ? formatMoney(balance.tipAmount, commission.currency)
                    : formatMoney(balance.balance, commission.currency)}
                </p>
                {balance.isOverpaid && (
                  <span className="mt-1 inline-block rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
                    tip
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Milestones */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Milestones
          </h2>
          {commission.milestones
            .slice()
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((m) => (
              <MilestoneCard key={m.id} milestone={m} onRefresh={() => void fetchAll()} />
            ))}
        </div>

        {/* Payments */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <PaymentSection
            commissionId={commission.id}
            payments={commission.payments}
            currency={commission.currency}
            onRefresh={() => void fetchAll()}
          />
        </div>

        {/* References */}
        {commission.references.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              References
            </h2>
            <div className="space-y-2">
              {commission.references.map((ref) => (
                <div key={ref.id} className="flex items-start gap-2">
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent-600 hover:text-accent-700 underline break-all"
                  >
                    {ref.url}
                  </a>
                  {ref.description && (
                    <span className="text-xs text-slate-500 shrink-0">— {ref.description}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Tags
          </h2>

          {/* Assigned tags */}
          {commission.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {commission.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                >
                  {tag.name}
                  <button
                    onClick={() => void handleUnassignTag(tag.id)}
                    disabled={tagLoading}
                    className="text-slate-400 hover:text-red-500 transition-colors text-xs leading-none disabled:opacity-50"
                    aria-label={`Remove tag ${tag.name}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 mb-4">No tags assigned.</p>
          )}

          {/* Add tag */}
          {(() => {
            const assignedIds = new Set(commission.tags.map((t) => t.id));
            const available = allTags.filter((t) => !assignedIds.has(t.id));
            return (
              <div className="flex flex-wrap items-end gap-2">
                {available.length > 0 && (
                  <select
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                    value=""
                    disabled={tagLoading}
                    onChange={(e) => { if (e.target.value) void handleAssignTag(Number(e.target.value)); }}
                  >
                    <option value="">Assign existing tag…</option>
                    {available.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                )}
                <div className="flex items-center gap-1">
                  <Input
                    placeholder="New tag name"
                    className="w-36"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void handleCreateAndAssignTag(); } }}
                    disabled={tagLoading}
                  />
                  <Button
                    className="h-9 px-3 text-xs"
                    disabled={!newTagName.trim() || tagLoading}
                    onClick={() => void handleCreateAndAssignTag()}
                  >
                    Add
                  </Button>
                </div>
              </div>
            );
          })()}

          {tagError && <p className="mt-2 text-sm text-red-600">{tagError}</p>}
        </div>
      </div>

      {/* Complete warning modal */}
      <Modal
        open={completeModalOpen}
        onClose={() => { if (!completeLoading) { setCompleteModalOpen(false); setCompleteWarning(null); } }}
        title="Complete commission"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
            {completeWarning}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => { setCompleteModalOpen(false); setCompleteWarning(null); }}
              disabled={completeLoading}
            >
              Go back
            </Button>
            <Button
              loading={completeLoading}
              onClick={() => void handleComplete(true)}
            >
              Complete anyway
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel modal */}
      <Modal
        open={cancelOpen}
        onClose={() => { if (!cancelLoading) setCancelOpen(false); }}
        title="Cancel commission"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Pending and in-progress milestones will be cancelled. Completed milestones are preserved.
          </p>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Reason (optional)
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 resize-none"
              rows={3}
              placeholder="Client changed their mind…"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          {cancelError && <p className="text-sm text-red-500">{cancelError}</p>}
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setCancelOpen(false)}
              disabled={cancelLoading}
            >
              Go back
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 active:bg-red-800"
              loading={cancelLoading}
              onClick={() => void handleCancel()}
            >
              Cancel commission
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
      </div>

      {/* Cancel modal */}
      <Modal
        open={cancelOpen}
        onClose={() => { if (!cancelLoading) setCancelOpen(false); }}
        title="Cancel commission"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Pending and in-progress milestones will be cancelled. Completed milestones are preserved.
          </p>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Reason (optional)
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 resize-none"
              rows={3}
              placeholder="Client changed their mind…"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          {cancelError && <p className="text-sm text-red-500">{cancelError}</p>}
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setCancelOpen(false)}
              disabled={cancelLoading}
            >
              Go back
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 active:bg-red-800"
              loading={cancelLoading}
              onClick={() => void handleCancel()}
            >
              Cancel commission
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
