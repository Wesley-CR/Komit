import { apiFetch } from "./client";
import type { Tag } from "../types/tag";
import type { CommissionDetail } from "../types/commission";

export const listTags = () => apiFetch<Tag[]>("/api/tags");

export const createTag = (name: string) =>
  apiFetch<Tag>("/api/tags", { method: "POST", body: JSON.stringify({ name }) });

export const deleteTag = (id: number) =>
  apiFetch<void>(`/api/tags/${id}`, { method: "DELETE" });

export const assignTag = (commissionId: number, tagId: number) =>
  apiFetch<CommissionDetail>(`/api/commissions/${commissionId}/tags`, {
    method: "POST",
    body: JSON.stringify({ tagId }),
  });

export const unassignTag = (commissionId: number, tagId: number) =>
  apiFetch<void>(`/api/commissions/${commissionId}/tags/${tagId}`, { method: "DELETE" });
