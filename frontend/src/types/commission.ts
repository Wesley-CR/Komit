export type CommissionStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type MilestoneStatus  = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type RevisionStatus   = "PENDING" | "ADDRESSED" | "REJECTED";

export interface Revision {
  id: number;
  milestoneId: number;
  roundNumber: number;
  feedbackText: string;
  requestedAt: string;
  addressedAt: string | null;
  status: RevisionStatus;
}

export interface Milestone {
  id: number;
  commissionId: number;
  name: string;
  orderIndex: number;
  status: MilestoneStatus;
  dueDate: string | null;
  completedAt: string | null;
  deliverableUrl: string | null;
  revisions: Revision[];
}

export interface Payment {
  id: number;
  commissionId: number;
  amount: number;
  paymentMethod: string;
  paidAt: string;
  notes: string | null;
}

export interface Reference {
  id: number;
  commissionId: number;
  url: string;
  description: string | null;
}

export interface CommissionTag {
  id: number;
  name: string;
}

export interface CommissionSummary {
  id: number;
  title: string;
  description: string | null;
  clientId: number;
  clientName: string;
  commissionTypeId: number;
  commissionTypeName: string;
  status: CommissionStatus;
  deadline: string | null;
  agreedPrice: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommissionDetail extends CommissionSummary {
  cancelledAt: string | null;
  completedAt: string | null;
  cancellationReason: string | null;
  milestones: Milestone[];
  payments: Payment[];
  references: Reference[];
  tags: CommissionTag[];
}

export interface Balance {
  agreedPrice: number;
  totalPaid: number;
  balance: number;
  isOverpaid: boolean;
  tipAmount: number;
}

export interface CreateCommissionBody {
  title: string;
  description?: string;
  clientId: number;
  commissionTypeId: number;
  agreedPrice: number;
  currency: string;
  deadline?: string | null;
}

export interface CompleteMilestoneBody {
  deliverableUrl: string;
  forceComplete: boolean;
}

export interface CreatePaymentBody {
  amount: number;
  paymentMethod: string;
  paidAt: string;
  notes?: string;
}
