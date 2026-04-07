"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import { Task, TaskFilters } from "@/types";
import { useUIStore } from "@/stores/ui-store";
import { useTaskDraftStore } from "@/stores/task-draft-store";
import { useShallow } from "zustand/shallow";

// --- Types ---
type TasksPage = {
  items: Task[];
  nextCursor: number | null;
  totalCount: number;
};

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), filters] as const,
};

// --- Fetch ---
async function fetchTasks(
  cursor: number,
  filters: TaskFilters
): Promise<TasksPage> {
  const params = new URLSearchParams({
    cursor: String(cursor),
    limit: "10",
    status: filters.status,
    priority: filters.priority,
  });
  const res = await fetch(`/api/tasks?${params}`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

export function useTasks() {
  const filters = useUIStore(useShallow((state) => state.filters));

  return useInfiniteQuery({
    queryKey: taskKeys.list(filters),
    queryFn: ({ pageParam }) => fetchTasks(pageParam, filters),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30 * 1000, // 30秒
    gcTime: 5 * 60 * 1000, // 5分
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const filters = useUIStore(useShallow((state) => state.filters));
  const addNotification = useUIStore((state) => state.addNotification);

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Task>;
    }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update task");
      }
      return res.json() as Promise<Task>;
    },

    onMutate: async ({ id, updates }) => {
      // 1. 進行中のrefetchをキャンセル（楽観的更新を上書きされないため）
      await queryClient.cancelQueries({ queryKey: taskKeys.list(filters) });

      // 2. 現在のキャッシュを保存（ロールバック用）
      const previousData = queryClient.getQueryData<InfiniteData<TasksPage>>(
        taskKeys.list(filters)
      );

      // 3. キャッシュを楽観的に更新
      queryClient.setQueryData<InfiniteData<TasksPage>>(
        taskKeys.list(filters),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((task) =>
                task.id === id ? { ...task, ...updates } : task
              ),
            })),
          };
        }
      );

      // 4. contextとしてロールバック用データを返す
      return { previousData };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(taskKeys.list(filters), context.previousData);
      }
      addNotification("更新に失敗しました。ロールバックしました。", "error");
    },

    onSuccess: () => {
      addNotification("タスクを更新しました", "success");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const resetDraft = useTaskDraftStore((state) => state.resetDraft);
  const addNotification = useUIStore((state) => state.addNotification);

  return useMutation({
    mutationFn: async (task: {
      title: string;
      description: string;
      priority: string;
      assigneeId: string | null;
    }) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json() as Promise<Task>;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      resetDraft(); // Zustandのストアをリセット
      addNotification("タスクを作成しました", "success");
    },

    onError: () => {
      addNotification("タスクの作成に失敗しました", "error");
    },
  });
}

// タスク削除
export function useDeleteTask() {
  const queryClient = useQueryClient();
  const addNotification = useUIStore((state) => state.addNotification);

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      addNotification("タスクを削除しました", "success");
    },
  });
}
