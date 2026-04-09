// Zustand UI Store
// Step 2: setFilter / resetFilters を実装
// Step 3: middleware (immer + persist + devtools + subscribeWithSelector) を追加
// Step 4: addNotification / removeNotification を実装 + subscribe で自動削除

import { create } from "zustand";
import { TaskFilters } from "@/types";

const initialFilters: TaskFilters = {
  status: "all",
  priority: "all",
  assigneeId: null,
};

// --- 型定義（これは変更しないでください） ---

type FilterSlice = {
  filters: TaskFilters;
  setFilter: <K extends keyof TaskFilters>(
    key: K,
    value: TaskFilters[K],
  ) => void;
  resetFilters: () => void;
};

type UISlice = {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  selectedTaskId: string | null;
  selectTask: (id: string | null) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
};

type Notification = {
  id: string;
  message: string;
  type: "success" | "error" | "info";
};

type NotificationSlice = {
  notifications: Notification[];
  addNotification: (message: string, type: Notification["type"]) => void;
  removeNotification: (id: string) => void;
};

export type UIStore = FilterSlice & UISlice & NotificationSlice;

// --- ここから実装してください ---

export const useUIStore = create<UIStore>()((set) => ({
  // --- Filter Slice ---
  filters: initialFilters,
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })), // ← Step 2 で実装
  resetFilters: () => {
    set({ filters: initialFilters });
  }, // ← Step 2 で実装

  // --- UI Slice（実装済み） ---
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  selectedTaskId: null,
  selectTask: (id) => set({ selectedTaskId: id }),
  theme: "light",
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),

  // --- Notification Slice ---
  notifications: [],
  addNotification: () => {}, // ← Step 4 で実装
  removeNotification: () => {}, // ← Step 4 で実装
}));
