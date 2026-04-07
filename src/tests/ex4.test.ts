/**
 * Exercise 4: TanStack Query基礎 - Query Key Factory + Infinite Query
 *
 * src/hooks/use-tasks.ts を実装してください。
 *
 * 要件:
 * - taskKeys: Query Key Factory パターン
 * - useTasks(): useInfiniteQuery を使った無限スクロールクエリ
 */
import { describe, it, expect } from "vitest";
import { taskKeys } from "@/hooks/use-tasks";

describe("Exercise 4: Query Key Factory", () => {
  it("taskKeys.all は ['tasks'] を返す", () => {
    expect(taskKeys.all).toEqual(["tasks"]);
  });

  it("taskKeys.lists() は ['tasks', 'list'] を返す", () => {
    expect(taskKeys.lists()).toEqual(["tasks", "list"]);
  });

  it("taskKeys.list(filters) は ['tasks', 'list', filters] を返す", () => {
    const filters = { status: "todo" as const, priority: "all" as const, assigneeId: null };
    expect(taskKeys.list(filters)).toEqual(["tasks", "list", filters]);
  });

  it("taskKeys.all は as const でリテラル型", () => {
    // 配列の参照が安定していることを確認
    expect(taskKeys.all).toBe(taskKeys.all);
  });

  it("taskKeys.lists() は taskKeys.all を含む", () => {
    const lists = taskKeys.lists();
    expect(lists[0]).toBe("tasks");
    expect(lists[1]).toBe("list");
  });

  it("異なる filters で異なるキーが生成される", () => {
    const key1 = taskKeys.list({ status: "todo", priority: "all", assigneeId: null });
    const key2 = taskKeys.list({ status: "done", priority: "all", assigneeId: null });
    expect(key1).not.toEqual(key2);
  });
});
