import { useEffect, useState, type FormEvent } from "react";
import { createTag, deleteTag, listTags } from "../api/tags";
import { ApiError } from "../api/client";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Spinner } from "../components/ui/Spinner";
import type { Tag } from "../types/tag";

export function TagsPage() {
  const [tags, setTags]       = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const [newName, setNewName]         = useState("");
  const [addLoading, setAddLoading]   = useState(false);
  const [addError, setAddError]       = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget]   = useState<Tag | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError]     = useState<string | null>(null);

  async function fetchTags() {
    setError(null);
    try {
      setTags(await listTags());
    } catch {
      setError("Failed to load tags.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void fetchTags(); }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAddLoading(true);
    setAddError(null);
    try {
      await createTag(newName.trim());
      setNewName("");
      void fetchTags();
    } catch (err) {
      setAddError(err instanceof ApiError ? err.message : "Failed to create tag.");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteTag(deleteTarget.id);
      setDeleteTarget(null);
      void fetchTags();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Delete failed.");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Tags</h1>
          {!loading && <p className="text-sm text-slate-400 mt-0.5">{tags.length} total</p>}
        </div>

        {/* Add tag inline */}
        <Card>
          <form onSubmit={(e) => void handleAdd(e)} className="flex items-end gap-3">
            <div className="flex-1 space-y-1">
              <label className="block text-xs font-medium text-slate-500">New tag</label>
              <Input
                placeholder="e.g. OC, fanart, NSFW…"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <Button type="submit" loading={addLoading} disabled={!newName.trim()}>Add</Button>
          </form>
          {addError && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{addError}</p>}
        </Card>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="size-7" /></div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div>
        ) : tags.length === 0 ? (
          <Card className="py-12 text-center">
            <p className="text-slate-500">No tags yet. Add one above.</p>
          </Card>
        ) : (
          <Card>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t.id}
                  className="group inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
                >
                  {t.name}
                  <button
                    onClick={() => { setDeleteError(null); setDeleteTarget(t); }}
                    className="text-slate-400 hover:text-red-500 transition-colors text-xs leading-none"
                    aria-label={`Delete tag ${t.name}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Delete confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => { if (!deleteLoading) setDeleteTarget(null); }}
        title="Delete tag"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Delete tag <strong>{deleteTarget?.name}</strong>? It will be unassigned from all commissions.
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
