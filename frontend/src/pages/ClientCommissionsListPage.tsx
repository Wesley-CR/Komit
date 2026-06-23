import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listCommissions } from "../api/commissions";
import { Layout } from "../components/Layout";
import { Spinner } from "../components/ui/Spinner";
import { StatusBadge } from "../components/ui/StatusBadge";
import { formatDate, formatMoney } from "../lib/format";
import type { CommissionStatus, CommissionSummary } from "../types/commission";

const STATUSES: CommissionStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
const STATUS_LABELS: Record<CommissionStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

type SortKey = "newest" | "oldest" | "deadline" | "price_desc" | "price_asc";
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest",     label: "Newest first" },
  { value: "oldest",     label: "Oldest first" },
  { value: "deadline",   label: "Deadline (soonest)" },
  { value: "price_desc", label: "Price (high → low)" },
  { value: "price_asc",  label: "Price (low → high)" },
];

function sortCommissions(list: CommissionSummary[], key: SortKey): CommissionSummary[] {
  const sorted = list.slice();
  switch (key) {
    case "newest":
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "oldest":
      return sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    case "deadline":
      return sorted.sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.localeCompare(b.deadline);
      });
    case "price_desc":
      return sorted.sort((a, b) => b.agreedPrice - a.agreedPrice);
    case "price_asc":
      return sorted.sort((a, b) => a.agreedPrice - b.agreedPrice);
  }
}

export function ClientCommissionsListPage() {
  const navigate = useNavigate();

  const [commissions, setCommissions] = useState<CommissionSummary[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<CommissionStatus | "">("");
  const [sortKey, setSortKey]           = useState<SortKey>("newest");

  useEffect(() => {
    setLoading(true);
    setError(null);
    const filters = statusFilter ? { status: statusFilter } : {};
    listCommissions(filters)
      .then(setCommissions)
      .catch(() => setError("Failed to load commissions."))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">My Commissions</h1>
          {!loading && <p className="text-sm text-slate-400 mt-0.5">{commissions.length} total</p>}
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-500">Status</label>
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CommissionStatus | "")}
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-500">Sort by</label>
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="size-7" /></div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div>
        ) : commissions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <p className="text-slate-500">You don't have any commissions yet.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-4 py-3 font-medium text-slate-500">Title</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Type</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Price</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Deadline</th>
                </tr>
              </thead>
              <tbody>
                {sortCommissions(commissions, sortKey).map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/my-commissions/${c.id}`)}
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">{c.title}</td>
                    <td className="px-4 py-3 text-slate-600">{c.commissionTypeName}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-slate-600">{formatMoney(c.agreedPrice, c.currency)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(c.deadline)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
