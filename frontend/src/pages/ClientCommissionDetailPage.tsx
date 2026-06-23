import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBalance, getCommission } from "../api/commissions";
import { Layout } from "../components/Layout";
import { Spinner } from "../components/ui/Spinner";
import { StatusBadge } from "../components/ui/StatusBadge";
import { MilestoneCard } from "../components/commission/MilestoneCard";
import { PaymentSection } from "../components/commission/PaymentSection";
import { formatDate, formatMoney } from "../lib/format";
import type { Balance, CommissionDetail } from "../types/commission";

export function ClientCommissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const commissionId = Number(id);

  const [commission, setCommission] = useState<CommissionDetail | null>(null);
  const [balance, setBalance]       = useState<Balance | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [comm, bal] = await Promise.all([
        getCommission(commissionId),
        getBalance(commissionId),
      ]);
      setCommission(comm);
      setBalance(bal);
    } catch {
      setError("Commission not found or access denied.");
    } finally {
      setLoading(false);
    }
  }, [commissionId]);

  useEffect(() => {
    setLoading(true);
    void fetchAll();
  }, [fetchAll]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20"><Spinner className="size-8" /></div>
      </Layout>
    );
  }

  if (error || !commission) {
    return (
      <Layout>
        <div className="max-w-3xl space-y-4">
          <button
            onClick={() => navigate("/my-commissions")}
            className="text-sm text-accent-600 hover:text-accent-700 flex items-center gap-1"
          >
            ← Back to my commissions
          </button>
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error ?? "Commission not found."}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl space-y-5">
        {/* Back */}
        <button
          onClick={() => navigate("/my-commissions")}
          className="text-sm text-accent-600 hover:text-accent-700 flex items-center gap-1"
        >
          ← Back to my commissions
        </button>

        {/* Header card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-slate-900">{commission.title}</h1>
              <StatusBadge status={commission.status} />
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
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
                  {balance.isOverpaid ? "Tip" : "Outstanding"}
                </p>
                <p className={`text-lg font-semibold ${balance.isOverpaid ? "text-violet-700" : "text-slate-900"}`}>
                  {balance.isOverpaid
                    ? formatMoney(balance.tipAmount, commission.currency)
                    : formatMoney(balance.balance, commission.currency)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Milestones — read-only with client feedback */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Milestones
          </h2>
          {commission.milestones
            .slice()
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((m) => (
              <MilestoneCard
                key={m.id}
                milestone={m}
                onRefresh={() => void fetchAll()}
                readOnly
                clientFeedback
              />
            ))}
        </div>

        {/* Payments — read-only */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <PaymentSection
            commissionId={commission.id}
            payments={commission.payments}
            currency={commission.currency}
            onRefresh={() => void fetchAll()}
            readOnly
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

        {/* Tags — read-only */}
        {commission.tags.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {commission.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
