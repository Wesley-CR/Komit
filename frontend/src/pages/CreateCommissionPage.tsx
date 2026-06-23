import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createCommission } from "../api/commissions";
import { listClients } from "../api/clients";
import { listCommissionTypes } from "../api/commissionTypes";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Spinner } from "../components/ui/Spinner";
import type { Client } from "../types/client";
import type { CommissionType } from "../types/commissionType";

export function CreateCommissionPage() {
  const navigate = useNavigate();

  const [clients, setClients]           = useState<Client[]>([]);
  const [types, setTypes]               = useState<CommissionType[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [title, setTitle]                       = useState("");
  const [description, setDescription]           = useState("");
  const [clientId, setClientId]                 = useState<number | "">("");
  const [commissionTypeId, setCommissionTypeId] = useState<number | "">("");
  const [agreedPrice, setAgreedPrice]           = useState("");
  const [currency, setCurrency]                 = useState("USD");
  const [deadline, setDeadline]                 = useState("");

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError]     = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listClients(), listCommissionTypes()])
      .then(([c, t]) => {
        setClients(c);
        setTypes(t);
      })
      .catch(() => setOptionsError("Failed to load clients/types. Refresh and try again."))
      .finally(() => setOptionsLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!title.trim())        { setSubmitError("Title is required."); return; }
    if (!clientId)            { setSubmitError("Client is required."); return; }
    if (!commissionTypeId)    { setSubmitError("Commission type is required."); return; }
    const price = parseFloat(agreedPrice);
    if (!agreedPrice || isNaN(price) || price <= 0) {
      setSubmitError("Price must be greater than 0.");
      return;
    }
    if (!currency.trim())     { setSubmitError("Currency is required."); return; }

    setSubmitLoading(true);
    try {
      const result = await createCommission({
        title: title.trim(),
        description: description.trim() || undefined,
        clientId: clientId as number,
        commissionTypeId: commissionTypeId as number,
        agreedPrice: price,
        currency: currency.toUpperCase(),
        deadline: deadline || null,
      });
      navigate(`/commissions/${result.id}`);
    } catch {
      setSubmitError("Failed to create commission. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-lg space-y-6">
        <div>
          <button
            onClick={() => navigate("/commissions")}
            className="mb-4 text-sm text-accent-600 hover:text-accent-700 flex items-center gap-1"
          >
            ← Back to commissions
          </button>
          <h1 className="text-xl font-semibold text-slate-900">New Commission</h1>
          <p className="mt-1 text-sm text-slate-500">
            4 milestones (Sketch → Lineart → Color → Final) are auto-created on submit.
          </p>
        </div>

        {optionsLoading ? (
          <Card className="flex justify-center py-10">
            <Spinner className="size-6" />
          </Card>
        ) : optionsError ? (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{optionsError}</div>
        ) : (
          <Card>
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  required
                  placeholder="e.g. Full illustration of OC"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 resize-none"
                  rows={2}
                  placeholder="Details, references, special requests…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="client">Client *</Label>
                <select
                  id="client"
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value ? Number(e.target.value) : "")}
                >
                  <option value="">Select a client…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="type">Commission type *</Label>
                <select
                  id="type"
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                  value={commissionTypeId}
                  onChange={(e) => setCommissionTypeId(e.target.value ? Number(e.target.value) : "")}
                >
                  <option value="">Select a type…</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — base {t.basePrice} USD
                    </option>
                  ))}
                </select>

              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="price">Agreed price *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    placeholder="100.00"
                    value={agreedPrice}
                    onChange={(e) => setAgreedPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="currency">Currency *</Label>
                  <Input
                    id="currency"
                    required
                    placeholder="USD"
                    maxLength={3}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deadline">Deadline (optional)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              {submitError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {submitError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => navigate("/commissions")}
                  disabled={submitLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={submitLoading}>
                  Create Commission
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </Layout>
  );
}
