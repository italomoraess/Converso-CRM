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
  Task,
  Transaction,
} from "@/types";

const LEADS_KEY = "@converso_leads";
const TASKS_KEY = "@converso_tasks";
const CATEGORIES_KEY = "@converso_categories";
const PRODUCTS_KEY = "@converso_products";
const TRANSACTIONS_KEY = "@converso_transactions";

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

interface AppContextType {
  leads: Lead[];
  tasks: Task[];
  categories: CatalogCategory[];
  products: CatalogProduct[];
  transactions: Transaction[];
  loading: boolean;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [l, t, c, p, tx] = await Promise.all([
        AsyncStorage.getItem(LEADS_KEY),
        AsyncStorage.getItem(TASKS_KEY),
        AsyncStorage.getItem(CATEGORIES_KEY),
        AsyncStorage.getItem(PRODUCTS_KEY),
        AsyncStorage.getItem(TRANSACTIONS_KEY),
      ]);
      if (l) setLeads(JSON.parse(l));
      if (t) setTasks(JSON.parse(t));
      if (c) setCategories(JSON.parse(c));
      if (p) setProducts(JSON.parse(p));
      if (tx) setTransactions(JSON.parse(tx));
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  const saveLeads = useCallback(async (updated: Lead[]) => {
    setLeads(updated);
    await AsyncStorage.setItem(LEADS_KEY, JSON.stringify(updated));
  }, []);

  const saveTasks = useCallback(async (updated: Task[]) => {
    setTasks(updated);
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updated));
  }, []);

  const saveCategories = useCallback(async (updated: CatalogCategory[]) => {
    setCategories(updated);
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated));
  }, []);

  const saveProducts = useCallback(async (updated: CatalogProduct[]) => {
    setProducts(updated);
    await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
  }, []);

  const saveTransactions = useCallback(async (updated: Transaction[]) => {
    setTransactions(updated);
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
  }, []);

  const addLead = useCallback(async (lead: Omit<Lead, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const newLead: Lead = { ...lead, id: generateId(), createdAt: now, updatedAt: now };
    const updated = [newLead, ...leads];
    await saveLeads(updated);
    return newLead;
  }, [leads, saveLeads]);

  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    const updated = leads.map((l) =>
      l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
    );
    await saveLeads(updated);
  }, [leads, saveLeads]);

  const deleteLead = useCallback(async (id: string) => {
    await saveLeads(leads.filter((l) => l.id !== id));
  }, [leads, saveLeads]);

  const updateLeadStage = useCallback(async (id: string, stage: FunnelStage, motivoPerdido?: string) => {
    const updated = leads.map((l) =>
      l.id === id
        ? { ...l, stage, motivoPerdido: stage === "Perdido" ? motivoPerdido : undefined, updatedAt: new Date().toISOString() }
        : l
    );
    await saveLeads(updated);
  }, [leads, saveLeads]);

  const addTask = useCallback(async (task: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = { ...task, id: generateId(), createdAt: new Date().toISOString() };
    await saveTasks([...tasks, newTask]);
    return newTask;
  }, [tasks, saveTasks]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    await saveTasks(tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, [tasks, saveTasks]);

  const deleteTask = useCallback(async (id: string) => {
    await saveTasks(tasks.filter((t) => t.id !== id));
  }, [tasks, saveTasks]);

  const toggleTaskComplete = useCallback(async (id: string) => {
    await saveTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }, [tasks, saveTasks]);

  const addCategory = useCallback(async (name: string) => {
    const cat: CatalogCategory = { id: generateId(), name, createdAt: new Date().toISOString() };
    await saveCategories([...categories, cat]);
    return cat;
  }, [categories, saveCategories]);

  const deleteCategory = useCallback(async (id: string) => {
    await saveCategories(categories.filter((c) => c.id !== id));
    await saveProducts(products.filter((p) => p.categoryId !== id));
  }, [categories, products, saveCategories, saveProducts]);

  const addProduct = useCallback(async (product: Omit<CatalogProduct, "id" | "createdAt">) => {
    const p: CatalogProduct = { ...product, id: generateId(), createdAt: new Date().toISOString() };
    await saveProducts([...products, p]);
    return p;
  }, [products, saveProducts]);

  const updateProduct = useCallback(async (id: string, updates: Partial<CatalogProduct>) => {
    await saveProducts(products.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, [products, saveProducts]);

  const deleteProduct = useCallback(async (id: string) => {
    await saveProducts(products.filter((p) => p.id !== id));
  }, [products, saveProducts]);

  const addTransaction = useCallback(async (tx: Omit<Transaction, "id" | "createdAt">) => {
    const newTx: Transaction = { ...tx, id: generateId(), createdAt: new Date().toISOString() };
    const updated = [newTx, ...transactions];
    await saveTransactions(updated);
    return newTx;
  }, [transactions, saveTransactions]);

  const deleteTransaction = useCallback(async (id: string) => {
    await saveTransactions(transactions.filter((t) => t.id !== id));
  }, [transactions, saveTransactions]);

  return (
    <AppContext.Provider
      value={{
        leads,
        tasks,
        categories,
        products,
        transactions,
        loading,
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
