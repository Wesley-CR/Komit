import { apiFetch } from "./client";
import type { Payment, CreatePaymentBody } from "../types/commission";

export const createPayment = (commissionId: number, body: CreatePaymentBody) =>
  apiFetch<Payment>(`/api/commissions/${commissionId}/payments`, {
    method: "POST",
    body: JSON.stringify(body),
  });
