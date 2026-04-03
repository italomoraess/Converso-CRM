import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  CatalogCategory,
  CatalogProduct,
  FunnelStage,
  Lead,
  LeadOrigin,
  Task,
  TaskType,
  Transaction,
  TransactionType,
} from "@/types";
import { apiFetch, ACCESS_TOKEN_KEY } from "@/services/api";

// ─── Mappers ────────────────────────────────────────────────────────────────

const stageToApi: Record<FunnelStage, string> = {
  "Novo Lead": "novo",
  "Em Contato": "contatado",
  "Proposta Enviada": "negociando",
  "Em Negociação": "negociando",
  "Fechado": "fechado",
  "Perdido": "perdido",
};

const stageFromApi: Record<string, FunnelStage> = {
  novo: "Novo Lead",
  contatado: "Em Contato",
  negociando: "Em Negociação",
  fechado: "Fechado",
  perdido: "Perdido",
};

const originToApi: Record<LeadOrigin, string> = {
  Instagram: "instagram",
  "Indicação": "indicacao",
  Facebook: "facebook",
  WhatsApp: "whatsapp",
  Site: "site",
  Telefone: "telefone",
  "Tráfego pago": "outro",
  Rua: "outro",
  Outro: "outro",
};

const originFromApi: Record<string, LeadOrigin> = {
  instagram: "Instagram",
  indicacao: "Indicação",
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  site: "Site",
  telefone: "Telefone",
  outro: "Outro",
};

const taskTypeToApi: Record<TaskType, string> = {
  "Ligação": "ligacao",
  Visita: "visita",
  "Reunião": "reuniao",
  "Retornar proposta": "retorno",
  Outro: "outro",
};

const taskTypeFromApi: Record<string, TaskType> = {
  ligacao: "Ligação",
  visita: "Visita",
  reuniao: "Reunião",
  retorno: "Retornar proposta",
  outro: "Outro",
};

// API shapes
interface ApiLead {
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

interface ApiAppointment {
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

interface ApiCategory {
  id: string;
  name: string;
  createdAt: string;
}

interface ApiProduct {
  id: string;
  categoryId: string;
  name: string;
  price: string;
  durationDays?: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiFinanceCategory {
  id: string;
  name: string;
  type: TransactionType;
  color?: string;
  createdAt: string;
}

interface ApiTransaction {
  id: string;
  categoryId: string;
  type: TransactionType;
  amount: string;
  description?: string;
  date: string;
  createdAt: string;
  category?: ApiFinanceCategory;
}

function apiLeadToLocal(a: ApiLead): Lead {
  return {
    id: a.id,
    nome: a.name,
    telefone: a.phone,
    cpfCnpj: a.cpfCnpj,
    email: a.email,
    origem: originFromApi[a.origin] ?? "Outro",
    localizacao: a.location,
    observacoes: a.observations,
    vendaRecorrente: a.recurringSale,
    stage: stageFromApi[a.funnelStage] ?? "Novo Lead",
    motivoPerdido: a.lostReason ?? undefined,
    dealValue: a.dealValue ? parseFloat(a.dealValue) : undefined,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}

function localLeadToApi(lead: Partial<Omit<Lead, "id" | "createdAt" | "updatedAt">>) {
  const body: Record<string, unknown> = {};
  if (lead.nome !== undefined) body.name = lead.nome;
  if (lead.telefone !== undefined) body.phone = lead.telefone;
  if (lead.cpfCnpj !== undefined) body.cpfCnpj = lead.cpfCnpj;
  if (lead.email !== undefined) body.email = lead.email;
  if (lead.origem !== undefined) body.origin = originToApi[lead.origem] ?? "outro";
  if (lead.localizacao !== undefined) body.location = lead.localizacao;
  if (lead.observacoes !== undefined) body.observations = lead.observacoes;
  if (lead.vendaRecorrente !== undefined) body.recurringSale = lead.vendaRecorrente;
  if (lead.stage !== undefined) body.funnelStage = stageToApi[lead.stage] ?? "novo";
  if (lead.motivoPerdido !== undefined) body.lostReason = lead.motivoPerdido;
  if ((lead as any).dealValue !== undefined) body.dealValue = (lead as any).dealValue;
  return body;
}

function apiApptToLocal(a: ApiAppointment): Task {
  return {
    id: a.id,
    title: a.title,
    type: taskTypeFromApi[a.type] ?? "Outro",
    date: a.date.slice(0, 10),
    leadId: a.leadId,
    leadName: a.lead?.name,
    notes: a.description,
    completed: a.completed,
    createdAt: a.createdAt,
  };
}

function localTaskToApi(task: Partial<Omit<Task, "id" | "createdAt">>) {
  const body: Record<string, unknown> = {};
  if (task.title !== undefined) body.title = task.title;
  if (task.type !== undefined) body.type = taskTypeToApi[task.type] ?? "outro";
  if (task.date !== undefined) body.date = task.date;
  if (task.leadId !== undefined) body.leadId = task.leadId;
  if (task.notes !== undefined) body.description = task.notes;
  return body;
}

function apiProductToLocal(p: ApiProduct): CatalogProduct {
  return {
    id: p.id,
    categoryId: p.categoryId,
    name: p.name,
    price: parseFloat(p.price),
    duration: p.durationDays,
    durationUnit: p.durationDays ? "dias" : undefined,
    createdAt: p.createdAt,
  };
}

function apiTxToLocal(t: ApiTransaction): Transaction {
  return {
    id: t.id,
    type: t.type,
    value: parseFloat(t.amount),
    description: t.description ?? "",
    category: t.category?.name ?? t.categoryId,
    categoryId: t.categoryId,
    date: t.date.slice(0, 10),
    createdAt: t.createdAt,
  };
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppContextType {
  leads: Lead[];
  tasks: Task[];
  categories: CatalogCategory[];
  products: CatalogProduct[];
  transactions: Transaction[];
  loading: boolean;
  refreshAll: () => Promise<void>;
  addLead: (lead: Omit<Lead, "id" | "createdAt" | "updatedAt">) => Promise<Lead>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  updateLeadStage: (id: string, stage: FunnelStage, motivoPerdido?: string) => Promise<void>;
  addTask: (task: Omit<Task, "id" | "createdAt">) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  addCategory: (name: string) => Promise<CatalogCategory>;
  deleteCategory: (id: string) => Promise<void>;
  addProduct: (product: Omit<CatalogProduct, "id" | "createdAt">) => Promise<CatalogProduct>;
  updateProduct: (id: string, updates: Partial<CatalogProduct>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, "id" | "createdAt">) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [financeCategories, setFinanceCategories] = useState<ApiFinanceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) { setLoading(false); return; }

    try {
      const [leadsData, apptData, catData, prodData, txData, finCatData] = await Promise.all([
        apiFetch<ApiLead[]>("/leads").catch(() => [] as ApiLead[]),
        apiFetch<ApiAppointment[]>("/appointments").catch(() => [] as ApiAppointment[]),
        apiFetch<ApiCategory[]>("/catalog/categories").catch(() => [] as ApiCategory[]),
        apiFetch<ApiProduct[]>("/catalog/products").catch(() => [] as ApiProduct[]),
        apiFetch<ApiTransaction[]>("/finance/transactions").catch(() => [] as ApiTransaction[]),
        apiFetch<ApiFinanceCategory[]>("/finance/categories").catch(() => [] as ApiFinanceCategory[]),
      ]);
      setLeads(leadsData.map(apiLeadToLocal));
      setTasks(apptData.map(apiApptToLocal));
      setCategories(catData.map(c => ({ id: c.id, name: c.name, createdAt: c.createdAt })));
      setProducts(prodData.map(apiProductToLocal));
      setTransactions(txData.map(apiTxToLocal));
      setFinanceCategories(finCatData);
    } catch {
      // Errors (including 401 redirect) handled by apiFetch
    } finally {
      setLoading(false);
    }
  }

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await loadAll();
  }, []);

  // ── Finance category helpers ───────────────────────────────────────────────

  async function getOrCreateFinanceCategory(name: string, type: TransactionType): Promise<string> {
    const existing = financeCategories.find(
      c => c.name.toLowerCase() === name.toLowerCase() && c.type === type
    );
    if (existing) return existing.id;

    const created = await apiFetch<ApiFinanceCategory>("/finance/categories", {
      method: "POST",
      body: JSON.stringify({ name, type }),
    });
    setFinanceCategories(prev => [...prev, created]);
    return created.id;
  }

  // ── Leads ──────────────────────────────────────────────────────────────────

  const addLead = useCallback(async (lead: Omit<Lead, "id" | "createdAt" | "updatedAt">) => {
    const created = await apiFetch<ApiLead>("/leads", {
      method: "POST",
      body: JSON.stringify(localLeadToApi(lead)),
    });
    const local = apiLeadToLocal(created);
    setLeads(prev => [local, ...prev]);
    return local;
  }, []);

  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    const updated = await apiFetch<ApiLead>(`/leads/${id}`, {
      method: "PATCH",
      body: JSON.stringify(localLeadToApi(updates)),
    });
    setLeads(prev => prev.map(l => (l.id === id ? apiLeadToLocal(updated) : l)));
  }, []);

  const deleteLead = useCallback(async (id: string) => {
    await apiFetch(`/leads/${id}`, { method: "DELETE" });
    setLeads(prev => prev.filter(l => l.id !== id));
  }, []);

  const updateLeadStage = useCallback(async (id: string, stage: FunnelStage, motivoPerdido?: string) => {
    const body: Record<string, unknown> = { funnelStage: stageToApi[stage] ?? "novo" };
    if (stage === "Perdido" && motivoPerdido) body.lostReason = motivoPerdido;

    const updated = await apiFetch<ApiLead>(`/leads/${id}/stage`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    setLeads(prev => prev.map(l => (l.id === id ? apiLeadToLocal(updated) : l)));
  }, []);

  // ── Tasks (Appointments) ──────────────────────────────────────────────────

  const addTask = useCallback(async (task: Omit<Task, "id" | "createdAt">) => {
    const created = await apiFetch<ApiAppointment>("/appointments", {
      method: "POST",
      body: JSON.stringify(localTaskToApi(task)),
    });
    const local = apiApptToLocal(created);
    setTasks(prev => [...prev, local]);
    return local;
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const updated = await apiFetch<ApiAppointment>(`/appointments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(localTaskToApi(updates)),
    });
    setTasks(prev => prev.map(t => (t.id === id ? apiApptToLocal(updated) : t)));
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await apiFetch(`/appointments/${id}`, { method: "DELETE" });
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleTaskComplete = useCallback(async (id: string) => {
    const updated = await apiFetch<ApiAppointment>(`/appointments/${id}/complete`, {
      method: "PATCH",
    });
    setTasks(prev => prev.map(t => (t.id === id ? apiApptToLocal(updated) : t)));
  }, []);

  // ── Catalog Categories ────────────────────────────────────────────────────

  const addCategory = useCallback(async (name: string) => {
    const created = await apiFetch<ApiCategory>("/catalog/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    const cat: CatalogCategory = { id: created.id, name: created.name, createdAt: created.createdAt };
    setCategories(prev => [...prev, cat]);
    return cat;
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    await apiFetch(`/catalog/categories/${id}`, { method: "DELETE" });
    setCategories(prev => prev.filter(c => c.id !== id));
    setProducts(prev => prev.filter(p => p.categoryId !== id));
  }, []);

  // ── Catalog Products ──────────────────────────────────────────────────────

  const addProduct = useCallback(async (product: Omit<CatalogProduct, "id" | "createdAt">) => {
    const body: Record<string, unknown> = {
      categoryId: product.categoryId,
      name: product.name,
      price: product.price,
    };
    if (product.duration) body.durationDays = product.duration;

    const created = await apiFetch<ApiProduct>("/catalog/products", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const local = apiProductToLocal(created);
    setProducts(prev => [...prev, local]);
    return local;
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<CatalogProduct>) => {
    const body: Record<string, unknown> = {};
    if (updates.name !== undefined) body.name = updates.name;
    if (updates.price !== undefined) body.price = updates.price;
    if (updates.categoryId !== undefined) body.categoryId = updates.categoryId;
    if (updates.duration !== undefined) body.durationDays = updates.duration;

    const updated = await apiFetch<ApiProduct>(`/catalog/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    setProducts(prev => prev.map(p => (p.id === id ? apiProductToLocal(updated) : p)));
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    await apiFetch(`/catalog/products/${id}`, { method: "DELETE" });
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  // ── Finance Transactions ──────────────────────────────────────────────────

  const addTransaction = useCallback(async (tx: Omit<Transaction, "id" | "createdAt">) => {
    const categoryId = await getOrCreateFinanceCategory(tx.category, tx.type);
    const created = await apiFetch<ApiTransaction>("/finance/transactions", {
      method: "POST",
      body: JSON.stringify({
        categoryId,
        type: tx.type,
        amount: tx.value,
        description: tx.description || undefined,
        date: tx.date,
      }),
    });
    const local = apiTxToLocal({ ...created, category: financeCategories.find(c => c.id === created.categoryId) });
    setTransactions(prev => [local, ...prev]);
    return local;
  }, [financeCategories]);

  const deleteTransaction = useCallback(async (id: string) => {
    await apiFetch(`/finance/transactions/${id}`, { method: "DELETE" });
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        leads,
        tasks,
        categories,
        products,
        transactions,
        loading,
        refreshAll,
        addLead,
        updateLead,
        deleteLead,
        updateLeadStage,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        addCategory,
        deleteCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        addTransaction,
        deleteTransaction,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
