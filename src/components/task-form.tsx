// このファイルは Step 5（task-draft-store 実装後）でフォーム入力が動くようになる
// Step 9: handleSubmit の中身を実装する

"use client";

import { useTaskDraftStore } from "@/stores/task-draft-store";
import { useCreateTask } from "@/hooks/use-tasks";
import { useUsers } from "@/hooks/use-users";
import { Task } from "@/types";

export function TaskForm() {
  const draft = useTaskDraftStore((state) => state.draft);
  const updateDraft = useTaskDraftStore((state) => state.updateDraft);
  const isValid = useTaskDraftStore((state) => state.isValid);
  const createTask = useCreateTask();
  const { data: users } = useUsers();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Step 9 で実装: isValid() をチェックして createTask.mutate(draft) を呼ぶ
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-white rounded-lg shadow-sm border">
      <h2 className="font-semibold text-gray-800">新しいタスク</h2>

      <input
        type="text"
        placeholder="タスク名"
        value={draft.title}
        onChange={(e) => updateDraft("title", e.target.value)}
        className="w-full border rounded-md px-3 py-2 text-sm"
      />

      <textarea
        placeholder="説明（任意）"
        value={draft.description}
        onChange={(e) => updateDraft("description", e.target.value)}
        className="w-full border rounded-md px-3 py-2 text-sm h-20 resize-none"
      />

      <div className="flex gap-3">
        <select
          value={draft.priority}
          onChange={(e) =>
            updateDraft("priority", e.target.value as Task["priority"])
          }
          className="border rounded-md px-3 py-2 text-sm flex-1"
        >
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
        </select>

        <select
          value={draft.assigneeId ?? ""}
          onChange={(e) =>
            updateDraft("assigneeId", e.target.value || null)
          }
          className="border rounded-md px-3 py-2 text-sm flex-1"
        >
          <option value="">未割り当て</option>
          {users?.map((user) => (
            <option key={user.id} value={user.id}>
              {user.avatar} {user.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={!isValid() || createTask.isPending}
        className="w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {createTask.isPending ? "作成中..." : "タスクを作成"}
      </button>
    </form>
  );
}
