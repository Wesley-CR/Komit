import { useEffect, useState, type FormEvent } from "react";
import {
  createCommissionType,
  deleteCommissionType,
  listCommissionTypes,
  updateCommissionType,
} from "../api/commissionTypes";
import { ApiError } from "../api/client";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Modal } from "../components/ui/Modal";
import { Spinner } from "../components/ui/Spinner";
import { formatMoney } from "../lib/format";
import type { CommissionType } from "../types/commissionType";

export function CommissionTypesPage() {
  const [types, setTypes]     = useState<CommissionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const [formOpen, setFormOpen]         = useState(false);
  const [editing, setEditing]           = useState<CommissionType | null>(null);
  const [formName, setFormName]         = useState("");
  const [formDesc, setFormDesc]         = useState("");
  const [formPrice, setFormPrice]       = useState("");
  const [formLoading, setFormLoading]   = useState(false);
  const [formError, setFormError]       = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget]   = useState<CommissionType | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError]     = useState<string | null>(null);


  async function fetchTypes() {
    setError(null);
    try {
      setTypes(await listCommissionTypes());
    } catch {
      setError("Failed to load commission types.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void fetchTypes(); }, []);

  function openCreate() {
    setEditing(null);
    setFormName("");
    setFormDesc("");
    setFormPrice("");
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(t: CommissionType) {
    setEditing(t);
    setFormName(t.name);
    setFormDesc(t.description ?? "");
    setFormPrice(String(t.basePrice));
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!formName.trim()) { setFormError("Name is required."); return; }
    const price = parseFloat(formPrice);
    if (!formPrice || isNaN(price) || price <= 0) { setFormError("Base price must be greater than 0."); return; }

    setFormLoading(true);
    try {
      const body = { name: formName.trim(), description: formDesc.trim() || undefined, basePrice: price };
      if (editing) {
        await updateCommissionType(editing.id, body);
      } else {
        await createCommissionType(body);
      }
      setFormOpen(false);
      void fetchTypes();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Operation failed.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteCommissionType(deleteTarget.id);
      setDeleteTarget(null);
      void fetchTypes();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Delete failed.");
    } finally {
      setDeleteLoading(false);
    }
  }


  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Commission Types</h1>
            {!loading && <p className="text-sm text-slate-400 mt-0.5">{types.length} total</p>}
          </div>
          <Button onClick={openCreate}>New Type</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="size-7" /></div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div>
        ) : types.length === 0 ? (
          <Card className="py-16 text-center">
            <p className="text-slate-500">No commission types yet.</p>
            <Button className="mt-4" onClick={openCreate}>New Type</Button>
          </Card>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-4 py-3 font-medium text-slate-500">Name</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Description</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Base Price</th>
                  <th className="px-4 py-3 font-medium text-slate-500 w-28" />
                </tr>
              </thead>
              <tbody>
                {types.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-900">{t.name}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{t.description ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{formatMoney(t.basePrice, "USD")}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(t)}
                          className="rounded-lg px-2 py-1 text-xs text-accent-600 hover:bg-accent-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => { setDeleteError(null); setDeleteTarget(t); }}
                          className="rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit type modal */}
      <Modal
        open={formOpen}
        onClose={() => { if (!formLoading) setFormOpen(false); }}
        title={editing ? "Edit commission type" : "New commission type"}
      >
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="type-name">Name *</Label>
            <Input id="type-name" required value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Full illustration" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="type-desc">Description</Label>
            <textarea
              id="type-desc"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 resize-none"
              rows={2}
              placeholder="What's included…"
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="type-price">Base price (USD) *</Label>
            <Input
              id="type-price"
              type="number"
              min="0.01"
              step="0.01"
              required
              placeholder="100.00"
              value={formPrice}
              onChange={(e) => setFormPrice(e.target.value)}
            />
          </div>
          {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setFormOpen(false)} disabled={formLoading}>Cancel</Button>
            <Button type="submit" loading={formLoading}>{editing ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete type confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => { if (!deleteLoading) setDeleteTarget(null); }}
        title="Delete commission type"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
          </p>
          {deleteError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{deleteError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700 active:bg-red-800"
              loading={deleteLoading}
              onClick={() => void handleDelete()}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

    </Layout>
  );
}
