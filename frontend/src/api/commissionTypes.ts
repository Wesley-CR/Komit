import { apiFetch } from "./client";
import type { CommissionType, MilestoneTemplate } from "../types/commissionType";

export const listCommissionTypes = () => apiFetch<CommissionType[]>("/api/commission-types");

export const createCommissionType = (body: { name: string; description?: string; basePrice: number }) =>
  apiFetch<CommissionType>("/api/commission-types", { method: "POST", body: JSON.stringify(body) });

export const updateCommissionType = (id: number, body: { name?: string; description?: string; basePrice?: number }) =>
  apiFetch<CommissionType>(`/api/commission-types/${id}`, { method: "PUT", body: JSON.stringify(body) });

export const deleteCommissionType = (id: number) =>
  apiFetch<void>(`/api/commission-types/${id}`, { method: "DELETE" });

export const listMilestoneTemplates = (typeId: number) =>
  apiFetch<MilestoneTemplate[]>(`/api/commission-types/${typeId}/milestone-templates`);

export const createMilestoneTemplate = (typeId: number, body: { name: string; orderIndex: number }) =>
  apiFetch<MilestoneTemplate>(`/api/commission-types/${typeId}/milestone-templates`, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const updateMilestoneTemplate = (id: number, body: { name: string; orderIndex: number }) =>
  apiFetch<MilestoneTemplate>(`/api/milestone-templates/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const deleteMilestoneTemplate = (id: number) =>
  apiFetch<void>(`/api/milestone-templates/${id}`, { method: "DELETE" });
