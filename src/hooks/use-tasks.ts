// Step 6: useTasks を useInfiniteQuery で実装
// Step 8: useUpdateTask（楽観的更新）を実装
// Step 9: useCreateTask を実装

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

type TasksPage = {
  items: Task[];
  nextCursor: number | null;
  totalCount: number;
};

// --- Query Key Factory（実装済み） ---
export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), filters] as const,
};

// --- fetch関数（これは変更しないでください） ---
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

// --- Step 6 で実装してください ---
// useInfiniteQuery を使ってタスク一覧を取得する
export function useTasks() {
  // ダミー実装: Step 6 で useInfiniteQuery に置き換える
  return {
    data: undefined,
    fetchNextPage: () => {},
    hasNextPage: false,
    isFetchingNextPage: false,
    isLoading: true,
    isError: false,
    error: null,
  } as any;
}

// --- Step 8 で実装してください ---
// 楽観的更新を含む useMutation
export function useUpdateTask() {
  return { mutate: () => {}, isPending: false } as any;
}

// --- Step 9 で実装してください ---
// タスク作成の useMutation
export function useCreateTask() {
  return { mutate: () => {}, isPending: false } as any;
}

// --- この関数は完成済み（参考にしてください） ---
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
