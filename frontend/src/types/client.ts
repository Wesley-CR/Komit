export interface Client {
  id: number;
  name: string;
  contact: string;
  notes: string | null;
  invitationToken: string | null;
  claimed: boolean;
}
