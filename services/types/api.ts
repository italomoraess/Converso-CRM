import type { TransactionType } from "@/types";

export interface ApiLead {
  id: string;
  name: string;
  phone: string;
  cpfCnpj?: string;
  email?: string;
  origin: string;
  location?: string;
  observations?: string;
  recurringSale: boolean;
  funnelStage: string;
  dealValue?: string;
  lostReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiAppointment {
  id: string;
  title: string;
  type: string;
  date: string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  leadId?: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  lead?: { id: string; name: string; phone: string };
}

export interface ApiCategory {
  id: string;
  name: string;
  createdAt: string;
}

export interface ApiProduct {
  id: string;
  categoryId: string;
  name: string;
  price: string;
  durationDays?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiFinanceCategory {
  id: string;
  name: string;
  type: TransactionType;
  color?: string;
  createdAt: string;
}

export interface ApiTransaction {
  id: string;
  categoryId: string;
  type: TransactionType;
  amount: string;
  description?: string;
  date: string;
  createdAt: string;
  category?: ApiFinanceCategory;
}
