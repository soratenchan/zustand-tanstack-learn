"use client";

import { useUIStore } from "@/stores/ui-store";

export function TaskFilters() {
  // 個別のselectorで必要なものだけ購読
  const status = useUIStore((state) => state.filters.status);
  const priority = useUIStore((state) => state.filters.priority);
  const setFilter = useUIStore((state) => state.setFilter);
  const resetFilters = useUIStore((state) => state.resetFilters);

  return (
    <div className="flex flex-wrap gap-3 items-center p-4 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">ステータス:</label>
        <select
          value={status}
          onChange={(e) => setFilter("status", e.target.value as typeof status)}
          className="border rounded-md px-3 py-1.5 text-sm bg-white"
        >
          <option value="all">すべて</option>
          <option value="todo">未着手</option>
          <option value="in-progress">進行中</option>
          <option value="done">完了</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">優先度:</label>
        <select
          value={priority}
          onChange={(e) =>
            setFilter("priority", e.target.value as typeof priority)
          }
          className="border rounded-md px-3 py-1.5 text-sm bg-white"
        >
          <option value="all">すべて</option>
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
        </select>
      </div>

      <button
        onClick={resetFilters}
        className="text-sm text-blue-600 hover:text-blue-800 underline"
      >
        リセット
      </button>
    </div>
  );
}
