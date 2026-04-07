"use client";

import { useTasks, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { useUsers } from "@/hooks/use-users";
import { useUIStore } from "@/stores/ui-store";
import { Task } from "@/types";
import { useCallback, useRef, useEffect } from "react";

const statusLabels = { todo: "未着手", "in-progress": "進行中", done: "完了" };
const statusColors = {
  todo: "bg-gray-100 text-gray-700",
  "in-progress": "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};
const priorityLabels = { low: "低", medium: "中", high: "高" };
const priorityColors = {
  low: "text-gray-500",
  medium: "text-yellow-600",
  high: "text-red-600 font-bold",
};

function TaskCard({ task }: { task: Task }) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const selectTask = useUIStore((state) => state.selectTask);
  const { data: users } = useUsers();

  const assignee = users?.find((u) => u.id === task.assigneeId);

  const nextStatus: Record<Task["status"], Task["status"]> = {
    todo: "in-progress",
    "in-progress": "done",
    done: "todo",
  };

  return (
    <div
      className="p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => selectTask(task.id)}
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-medium text-gray-900 flex-1">{task.title}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteTask.mutate(task.id);
          }}
          className="text-gray-400 hover:text-red-500 text-lg leading-none"
          title="削除"
        >
          ×
        </button>
      </div>
      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
        {task.description}
      </p>
      <div className="flex items-center gap-2 mt-3">
        {/* 学習ポイント 22: ステータス変更でOptimistic Update発火 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            updateTask.mutate({
              id: task.id,
              updates: { status: nextStatus[task.status] },
            });
          }}
          className={`px-2 py-0.5 rounded-full text-xs ${statusColors[task.status]}`}
          title="クリックでステータス変更"
        >
          {statusLabels[task.status]}
        </button>
        <span className={`text-xs ${priorityColors[task.priority]}`}>
          {priorityLabels[task.priority]}
        </span>
        {assignee && (
          <span className="text-xs text-gray-500 ml-auto">
            {assignee.avatar} {assignee.name}
          </span>
        )}
      </div>
      {updateTask.isPending && (
        <div className="text-xs text-blue-500 mt-1">更新中...</div>
      )}
    </div>
  );
}

export function TaskList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useTasks();

  // =====================================================
  // 学習ポイント 23: Intersection Observer で無限スクロール
  // =====================================================
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node) return;

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });
      observerRef.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-lg">
        エラー: {error.message}
      </div>
    );
  }

  const allTasks = data?.pages.flatMap((page) => page.items) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  return (
    <div>
      <p className="text-sm text-gray-500 mb-3">
        {totalCount}件中 {allTasks.length}件表示
      </p>
      <div className="space-y-3">
        {allTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {/* 無限スクロールのトリガー要素 */}
      <div ref={loadMoreRef} className="py-4 text-center">
        {isFetchingNextPage ? (
          <span className="text-gray-500 text-sm">読み込み中...</span>
        ) : hasNextPage ? (
          <span className="text-gray-400 text-sm">↓ スクロールで更に読み込み</span>
        ) : allTasks.length > 0 ? (
          <span className="text-gray-400 text-sm">すべて表示しました</span>
        ) : null}
      </div>
    </div>
  );
}
