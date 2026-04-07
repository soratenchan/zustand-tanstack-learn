import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Task } from "@/types";

// =====================================================
// 学習ポイント 6: コンポーネント外からのストア利用
// フォームの下書き状態を管理する例。
// TanStack QueryのmutationとZustandを組み合わせる。
// =====================================================

type TaskDraft = Pick<Task, "title" | "description" | "priority" | "assigneeId">;

type TaskDraftStore = {
  draft: TaskDraft;
  updateDraft: <K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) => void;
  resetDraft: () => void;
  // 学習ポイント 7: computed values（derived state）
  // Zustandにはcomputed propertyがないので、関数で実現する
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
