import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { appointmentsApi } from "@/services/appointments/appointments.service";
import { catalogApi } from "@/services/catalog/catalog.service";
import { financeApi } from "@/services/finance/finance.service";
import { ACCESS_TOKEN_KEY } from "@/services/http/config";
import { leadsApi } from "@/services/leads/leads.service";
import {
  apiApptToLocal,
  apiLeadToLocal,
  apiProductToLocal,
  apiTxToLocal,
  localLeadToApi,
  localTaskToApi,
  stageToApi,
} from "@/services/mappers/domain-mappers";
import type {
  ApiAppointment,
  ApiCategory,
  ApiFinanceCategory,
  ApiLead,
  ApiProduct,
  ApiTransaction,
} from "@/services/types/api";
import {
  CatalogCategory,
  CatalogProduct,
  FunnelStage,
  Lead,
  Task,
  Transaction,
  TransactionType,
} from "@/types";

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
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [financeCategories, setFinanceCategories] = useState<ApiFinanceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const loadRequestIdRef = useRef(0);

  const loadAll = useCallback(async () => {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    const requestId = ++loadRequestIdRef.current;
    setLoading(true);

    try {
      const settled = await Promise.allSettled([
        leadsApi.list(),
        appointmentsApi.list(),
        catalogApi.categories.list(),
        catalogApi.products.list(),
        financeApi.transactions.list(),
        financeApi.categories.list(),
      ]);

      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      const [lr, ar, cr, pr, tr, fr] = settled;

      if (lr.status === "fulfilled" && Array.isArray(lr.value)) {
        setLeads(lr.value.map(apiLeadToLocal));
      }
      if (ar.status === "fulfilled" && Array.isArray(ar.value)) {
        setTasks(ar.value.map(apiApptToLocal));
      }
      if (cr.status === "fulfilled" && Array.isArray(cr.value)) {
        setCategories(cr.value.map((x) => ({ id: x.id, name: x.name, createdAt: x.createdAt })));
      }
      if (pr.status === "fulfilled" && Array.isArray(pr.value)) {
        setProducts(pr.value.map(apiProductToLocal));
      }
      if (tr.status === "fulfilled" && Array.isArray(tr.value)) {
        setTransactions(tr.value.map(apiTxToLocal));
      }
      if (fr.status === "fulfilled" && Array.isArray(fr.value)) {
        setFinanceCategories(fr.value);
      }
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!isAuthenticated) {
      setLeads([]);
      setTasks([]);
      setCategories([]);
      setProducts([]);
      setTransactions([]);
      setFinanceCategories([]);
      setLoading(false);
      return;
    }
    void loadAll();
  }, [authLoading, isAuthenticated, loadAll]);

  const refreshAll = useCallback(async () => {
    await loadAll();
  }, [loadAll]);

  async function getOrCreateFinanceCategory(name: string, type: TransactionType): Promise<string> {
    const existing = financeCategories.find(
      (c) => c.name.toLowerCase() === name.toLowerCase() && c.type === type
    );
    if (existing) return existing.id;

    const created = await financeApi.categories.create({ name, type });
    setFinanceCategories((prev) => [...prev, created]);
    return created.id;
  }

  const addLead = useCallback(async (lead: Omit<Lead, "id" | "createdAt" | "updatedAt">) => {
    const created = await leadsApi.create(localLeadToApi(lead));
    const local = apiLeadToLocal(created);
    setLeads((prev) => [local, ...prev]);
    return local;
  }, []);

  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    const updated = await leadsApi.update(id, localLeadToApi(updates));
    setLeads((prev) => prev.map((l) => (l.id === id ? apiLeadToLocal(updated) : l)));
  }, []);

  const deleteLead = useCallback(async (id: string) => {
    await leadsApi.remove(id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const updateLeadStage = useCallback(async (id: string, stage: FunnelStage, motivoPerdido?: string) => {
    const body: Record<string, unknown> = { funnelStage: stageToApi[stage] ?? "novo" };
    if (stage === "Perdido" && motivoPerdido) body.lostReason = motivoPerdido;

    const updated = await leadsApi.updateStage(id, body);
    setLeads((prev) => prev.map((l) => (l.id === id ? apiLeadToLocal(updated) : l)));
  }, []);

  const addTask = useCallback(async (task: Omit<Task, "id" | "createdAt">) => {
    const created = await appointmentsApi.create(localTaskToApi(task));
    const local = apiApptToLocal(created);
    setTasks((prev) => [...prev, local]);
    return local;
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const updated = await appointmentsApi.update(id, localTaskToApi(updates));
    setTasks((prev) => prev.map((t) => (t.id === id ? apiApptToLocal(updated) : t)));
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await appointmentsApi.remove(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTaskComplete = useCallback(async (id: string) => {
    const updated = await appointmentsApi.complete(id);
    setTasks((prev) => prev.map((t) => (t.id === id ? apiApptToLocal(updated) : t)));
  }, []);

  const addCategory = useCallback(async (name: string) => {
    const created = await catalogApi.categories.create({ name });
    const cat: CatalogCategory = { id: created.id, name: created.name, createdAt: created.createdAt };
    setCategories((prev) => [...prev, cat]);
    return cat;
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    await catalogApi.categories.remove(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setProducts((prev) => prev.filter((p) => p.categoryId !== id));
  }, []);

  const addProduct = useCallback(async (product: Omit<CatalogProduct, "id" | "createdAt">) => {
    const body: Record<string, unknown> = {
      categoryId: product.categoryId,
      name: product.name,
      price: product.price,
    };
    if (product.duration) body.durationDays = product.duration;

    const created = await catalogApi.products.create(body);
    const local = apiProductToLocal(created);
    setProducts((prev) => [...prev, local]);
    return local;
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<CatalogProduct>) => {
    const body: Record<string, unknown> = {};
    if (updates.name !== undefined) body.name = updates.name;
    if (updates.price !== undefined) body.price = updates.price;
    if (updates.categoryId !== undefined) body.categoryId = updates.categoryId;
    if (updates.duration !== undefined) body.durationDays = updates.duration;

    const updated = await catalogApi.products.update(id, body);
    setProducts((prev) => prev.map((p) => (p.id === id ? apiProductToLocal(updated) : p)));
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    await catalogApi.products.remove(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addTransaction = useCallback(
    async (tx: Omit<Transaction, "id" | "createdAt">) => {
      const categoryId = await getOrCreateFinanceCategory(tx.category, tx.type);
      const created = await financeApi.transactions.create({
        categoryId,
        type: tx.type,
        amount: tx.value,
        description: tx.description || undefined,
        date: tx.date,
      });
      const local = apiTxToLocal({
        ...created,
        category: financeCategories.find((c) => c.id === created.categoryId),
      });
      setTransactions((prev) => [local, ...prev]);
      return local;
    },
    [financeCategories]
  );

  const deleteTransaction = useCallback(async (id: string) => {
    await financeApi.transactions.remove(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
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
