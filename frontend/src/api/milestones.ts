import { apiFetch } from "./client";
import type { Milestone, Revision, CompleteMilestoneBody } from "../types/commission";

export const completeMilestone = (id: number, body: CompleteMilestoneBody) =>
  apiFetch<Milestone>(`/api/milestones/${id}/complete`, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const createRevision = (milestoneId: number, feedbackText: string) =>
  apiFetch<Revision>(`/api/milestones/${milestoneId}/revisions`, {
    method: "POST",
    body: JSON.stringify({ feedbackText }),
  });

export const addressRevision = (id: number) =>
  apiFetch<Revision>(`/api/revisions/${id}/address`, { method: "POST" });

export const rejectRevision = (id: number) =>
  apiFetch<Revision>(`/api/revisions/${id}/reject`, { method: "POST" });
