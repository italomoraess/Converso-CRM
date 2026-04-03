export type LeadOrigin =
  | "Instagram"
  | "Indicação"
  | "Facebook"
  | "WhatsApp"
  | "Site"
  | "Telefone"
  | "Tráfego pago"
  | "Rua"
  | "Outro";

export type FunnelStage =
  | "Novo Lead"
  | "Em Contato"
  | "Proposta Enviada"
  | "Em Negociação"
  | "Fechado"
  | "Perdido";

export type TaskType = "Ligação" | "Visita" | "Reunião" | "Retornar proposta" | "Outro";

export interface Lead {
  id: string;
  nome: string;
  telefone: string;
  cpfCnpj?: string;
  email?: string;
  origem: LeadOrigin;
  localizacao?: string;
  observacoes?: string;
  vendaRecorrente: boolean;
  stage: FunnelStage;
  motivoPerdido?: string;
  dealValue?: number;
  catalogProductId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  date: string;
  leadId?: string;
  leadName?: string;
  notes?: string;
  completed: boolean;
  createdAt: string;
}

export interface CatalogCategory {
  id: string;
  name: string;
  createdAt: string;
}

export interface CatalogProduct {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  duration?: number;
  durationUnit?: "dias" | "meses" | "anos";
  description?: string;
  createdAt: string;
}

export const FUNNEL_STAGES: FunnelStage[] = [
  "Novo Lead",
  "Em Contato",
  "Proposta Enviada",
  "Em Negociação",
  "Fechado",
  "Perdido",
];

export const LEAD_ORIGINS: LeadOrigin[] = [
  "Instagram",
  "Indicação",
  "Facebook",
  "WhatsApp",
  "Site",
  "Telefone",
  "Tráfego pago",
  "Rua",
  "Outro",
];

export const TASK_TYPES: TaskType[] = [
  "Ligação",
  "Visita",
  "Reunião",
  "Retornar proposta",
  "Outro",
];

export type TransactionType = "entrada" | "saida";

export interface Transaction {
  id: string;
  type: TransactionType;
  value: number;
  description: string;
  category: string;
  categoryId?: string;
  date: string;
  createdAt: string;
}

export const ENTRADA_CATEGORIES = ["Serviço", "Produto", "Venda", "Comissão", "Outro"];
export const SAIDA_CATEGORIES = ["Aluguel", "Marketing", "Material", "Imposto", "Pessoal", "Software", "Outro"];
