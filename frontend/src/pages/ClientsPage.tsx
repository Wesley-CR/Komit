import { useEffect, useState, type FormEvent } from "react";
import { createClient, deleteClient, listClients, updateClient } from "../api/clients";
import { ApiError } from "../api/client";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Modal } from "../components/ui/Modal";
import { Spinner } from "../components/ui/Spinner";
import type { Client } from "../types/client";

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const [formOpen, setFormOpen]       = useState(false);
  const [editing, setEditing]         = useState<Client | null>(null);
  const [formName, setFormName]       = useState("");
  const [formContact, setFormContact] = useState("");
  const [formNotes, setFormNotes]     = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError]     = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget]   = useState<Client | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError]     = useState<string | null>(null);

  async function fetchClients() {
    setError(null);
    try {
      setClients(await listClients());
    } catch {
      setError("Failed to load clients.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void fetchClients(); }, []);

  function openCreate() {
    setEditing(null);
    setFormName("");
    setFormContact("");
    setFormNotes("");
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(c: Client) {
    setEditing(c);
    setFormName(c.name);
    setFormContact(c.contact);
    setFormNotes(c.notes ?? "");
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!formName.trim())    { setFormError("Name is required."); return; }
    if (!formContact.trim()) { setFormError("Contact is required."); return; }

    setFormLoading(true);
    try {
      const body = { name: formName.trim(), contact: formContact.trim(), notes: formNotes.trim() || undefined };
      if (editing) {
        await updateClient(editing.id, body);
      } else {
        await createClient(body);
      }
      setFormOpen(false);
      void fetchClients();
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
      await deleteClient(deleteTarget.id);
      setDeleteTarget(null);
      void fetchClients();
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
            <h1 className="text-xl font-semibold text-slate-900">Clients</h1>
            {!loading && <p className="text-sm text-slate-400 mt-0.5">{clients.length} total</p>}
          </div>
          <Button onClick={openCreate}>New Client</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="size-7" /></div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div>
        ) : clients.length === 0 ? (
          <Card className="py-16 text-center">
            <p className="text-slate-500">No clients yet.</p>
            <Button className="mt-4" onClick={openCreate}>New Client</Button>
          </Card>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-4 py-3 font-medium text-slate-500">Name</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Contact</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Notes</th>
                  <th className="px-4 py-3 font-medium text-slate-500 w-28" />
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                    <td className="px-4 py-3 text-slate-600">{c.contact}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{c.notes ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="rounded-lg px-2 py-1 text-xs text-accent-600 hover:bg-accent-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => { setDeleteError(null); setDeleteTarget(c); }}
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

      {/* Create / Edit modal */}
      <Modal
        open={formOpen}
        onClose={() => { if (!formLoading) setFormOpen(false); }}
        title={editing ? "Edit client" : "New client"}
      >
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="client-name">Name *</Label>
            <Input id="client-name" required value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="client-contact">Contact *</Label>
            <Input id="client-contact" required value={formContact} onChange={(e) => setFormContact(e.target.value)} placeholder="jane@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="client-notes">Notes</Label>
            <textarea
              id="client-notes"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 resize-none"
              rows={2}
              placeholder="Preferred style, timezone…"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
            />
          </div>
          {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setFormOpen(false)} disabled={formLoading}>Cancel</Button>
            <Button type="submit" loading={formLoading}>{editing ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => { if (!deleteLoading) setDeleteTarget(null); }}
        title="Delete client"
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
