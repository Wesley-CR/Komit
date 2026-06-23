export type Role = "ARTIST" | "CLIENT";

export interface AuthResponse {
  token: string;
  email: string;
  role: Role;
  userId: number;
  clientId: number | null;
}

export interface AuthUser {
  email: string;
  role: Role;
  userId: number;
  clientId: number | null;
}
