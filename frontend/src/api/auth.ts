import { apiFetch } from "./client";
import type { AuthResponse } from "../types/auth";

export function login(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function signup(
  email: string,
  password: string,
  name: string,
  contact: string,
  invitationToken?: string,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      name,
      contact,
      invitationToken: invitationToken || null,
    }),
  });
}
