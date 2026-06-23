import { apiFetch } from "./client";
import type {
  Balance,
  CommissionDetail,
  CommissionSummary,
  CreateCommissionBody,
} from "../types/commission";

export interface CommissionFilters {
  status?: string;
  clientId?: number;
  deadlineBefore?: string;
  tagId?: number;
}

function buildQuery(filters: CommissionFilters): string {
  const params = new URLSearchParams();
  if (filters.status)        params.set("status", filters.status);
  if (filters.clientId)      params.set("clientId", String(filters.clientId));
  if (filters.deadlineBefore) params.set("deadlineBefore", filters.deadlineBefore);
  if (filters.tagId)         params.set("tagId", String(filters.tagId));
  const q = params.toString();
  return q ? `?${q}` : "";
}

export const listCommissions = (filters: CommissionFilters = {}) =>
  apiFetch<CommissionSummary[]>(`/api/commissions${buildQuery(filters)}`);

export const getCommission = (id: number) =>
  apiFetch<CommissionDetail>(`/api/commissions/${id}`);

export const getBalance = (id: number) =>
  apiFetch<Balance>(`/api/commissions/${id}/balance`);

export const createCommission = (body: CreateCommissionBody) =>
  apiFetch<CommissionDetail>("/api/commissions", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const updateCommission = (id: number, body: CreateCommissionBody) =>
  apiFetch<CommissionDetail>(`/api/commissions/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const cancelCommission = (id: number, reason?: string) =>
  apiFetch<CommissionDetail>(`/api/commissions/${id}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

export const completeCommission = (id: number, force: boolean) =>
  apiFetch<CommissionDetail>(`/api/commissions/${id}/complete`, {
    method: "POST",
    body: JSON.stringify({ force }),
  });
