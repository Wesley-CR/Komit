import { useState } from "react";
import { createPayment } from "../../api/payments";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Modal } from "../ui/Modal";
import { formatDateTime, formatMoney } from "../../lib/format";
import type { Payment } from "../../types/commission";

interface PaymentSectionProps {
  commissionId: number;
  payments: Payment[];
  currency: string;
  onRefresh: () => void;
  readOnly?: boolean;
}

const PAYMENT_METHODS = ["TRANSFER", "PAYPAL", "CASH", "CRYPTO", "OTHER"];

interface PaymentForm {
  amount: string;
  paymentMethod: string;
  paidAt: string;
  notes: string;
}

export function PaymentSection({ commissionId, payments, currency, onRefresh, readOnly }: PaymentSectionProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PaymentForm>({
    amount: "",
    paymentMethod: "TRANSFER",
    paidAt: new Date().toISOString().slice(0, 16),
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openModal() {
    setForm({
      amount: "",
      paymentMethod: "TRANSFER",
      paidAt: new Date().toISOString().slice(0, 16),
      notes: "",
    });
    setError(null);
    setOpen(true);
  }

  async function handleSubmit() {
    const amount = parseFloat(form.amount);
    if (!form.amount || isNaN(amount) || amount <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }
    if (!form.paidAt) {
      setError("Date is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createPayment(commissionId, {
        amount,
        paymentMethod: form.paymentMethod,
        paidAt: new Date(form.paidAt).toISOString(),
        notes: form.notes || undefined,
      });
      setOpen(false);
      onRefresh();
    } catch {
      setError("Failed to record payment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Payments</h3>
        {!readOnly && (
          <Button className="h-7 px-3 text-xs" onClick={openModal}>
            Add Payment
          </Button>
        )}
      </div>

      {payments.length === 0 ? (
        <p className="text-sm text-slate-400">No payments recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {payments.map((p) => (
            <div
              key={p.id}
              className="flex items-start justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
            >
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-slate-900">
                  {formatMoney(p.amount, currency)}
                </p>
                <p className="text-xs text-slate-500">
                  {p.paymentMethod} · {formatDateTime(p.paidAt)}
                </p>
                {p.notes && <p className="text-xs text-slate-400">{p.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add Payment">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Amount ({currency})</Label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="50.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Payment method</Label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Date & time</Label>
            <Input
              type="datetime-local"
              value={form.paidAt}
              onChange={(e) => setForm({ ...form, paidAt: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Input
              placeholder="e.g. initial deposit"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button loading={loading} onClick={() => void handleSubmit()}>
              Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
