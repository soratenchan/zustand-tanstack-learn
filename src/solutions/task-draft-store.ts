import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Task } from "@/types";

type TaskDraft = Pick<Task, "title" | "description" | "priority" | "assigneeId">;

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

export const useTaskDraftStore = create<TaskDraftStore>()(
  devtools(
    immer((set, get) => ({
      draft: emptyDraft,
      updateDraft: (key, value) =>
        set((state) => {
          state.draft[key] = value;
        }),
      resetDraft: () =>
        set((state) => {
          state.draft = emptyDraft;
        }),
      isValid: () => {
        const { title } = get().draft;
        return title.trim().length > 0;
      },
    })),
    { name: "TaskDraftStore" }
  )
);
