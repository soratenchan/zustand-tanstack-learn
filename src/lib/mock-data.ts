import { Task, User } from "@/types";

// サーバーサイドのメモリ内DB（API Routeで使用）
export const users: User[] = [
  { id: "1", name: "田中太郎", email: "tanaka@example.com", avatar: "🧑‍💻" },
  { id: "2", name: "鈴木花子", email: "suzuki@example.com", avatar: "👩‍💻" },
  { id: "3", name: "佐藤次郎", email: "sato@example.com", avatar: "🧑‍🔧" },
];

let taskIdCounter = 20;

export const tasks: Task[] = Array.from({ length: 50 }, (_, i) => ({
  id: String(i + 1),
  title: `タスク #${i + 1} - ${["UIの修正", "APIの実装", "テスト追加", "ドキュメント更新", "パフォーマンス改善"][i % 5]}`,
  description: `これはタスク #${i + 1} の詳細説明です。`,
  status: (["todo", "in-progress", "done"] as const)[i % 3],
  priority: (["low", "medium", "high"] as const)[i % 3],
  assigneeId: i % 4 === 0 ? null : String((i % 3) + 1),
  createdAt: new Date(2026, 3, 1, i).toISOString(),
}));

export function generateTaskId(): string {
  return String(++taskIdCounter + 50);
}
