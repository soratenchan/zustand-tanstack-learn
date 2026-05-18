// Step 5: updateDraft / resetDraft / isValid を実装してください

import { create } from "zustand";
import { Task } from "@/types";

type TaskDraft = Pick<
  Task,
  "title" | "description" | "priority" | "assigneeId"
>;

type TaskDraftStore = {
  draft: TaskDraft;
  updateDraft: <K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) => void;
  resetDraft: () => void;
  isValid: () => boolean;
};

const emptyDraft: TaskDraft = {
  title: "",
  description: "",
  priority: "medium",
  assigneeId: null,
};

// --- ここから実装してください ---

export const useTaskDraftStore = create<TaskDraftStore>()((set, get) => ({
  draft: emptyDraft,
  updateDraft: (key, value) =>
    set((state) => ({
      draft: { ...state.draft, [key]: value },
    })), // ← Step 5 で実装
  resetDraft: () => set({ draft: emptyDraft }), // ← Step 5 で実装
  isValid: () => get().draft.title.trim().length > 0, // ← Step 5 で実装
}));
