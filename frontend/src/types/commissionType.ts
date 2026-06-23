export interface MilestoneTemplate {
  id: number;
  name: string;
  orderIndex: number;
  commissionTypeId: number;
}

export interface CommissionType {
  id: number;
  name: string;
  description: string | null;
  basePrice: number;
  milestoneTemplates: MilestoneTemplate[];
}
