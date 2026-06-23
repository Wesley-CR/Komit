import { apiFetch } from "./client";
import type { Client } from "../types/client";

export const listClients = () => apiFetch<Client[]>("/api/clients");

export const createClient = (body: { name: string; contact: string; notes?: string }) =>
  apiFetch<Client>("/api/clients", { method: "POST", body: JSON.stringify(body) });

export const updateClient = (id: number, body: { name?: string; contact?: string; notes?: string }) =>
  apiFetch<Client>(`/api/clients/${id}`, { method: "PUT", body: JSON.stringify(body) });

export const deleteClient = (id: number) =>
  apiFetch<void>(`/api/clients/${id}`, { method: "DELETE" });
