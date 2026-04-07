/**
 * Exercise 5: TanStack Query中級 - Mutations
 *
 * src/hooks/use-tasks.ts に useUpdateTask と useCreateTask を実装してください。
 *
 * 要件:
 * - useUpdateTask: PATCH /api/tasks/:id + 楽観的更新 + ロールバック
 * - useCreateTask: POST /api/tasks + invalidation + resetDraft
 *
 * 楽観的更新のロジックはブラウザで動作確認してください。
 * （15%の確率でサーバーエラーが発生するので、ロールバックを目視確認できます）
 */
import { describe, it, expect } from "vitest";
import { useUpdateTask, useCreateTask, useDeleteTask } from "@/hooks/use-tasks";

describe("Exercise 5: Mutations", () => {
  it("useUpdateTask がカスタムフックとして実装されている（React hooksを呼ぶ関数）", () => {
    expect(typeof useUpdateTask).toBe("function");
    // undefined ではなく実際のフック実装があることを確認
    // フック内で useMutation 等を呼ぶので、関数の中身がある
    expect(useUpdateTask.toString()).not.toContain("return undefined");
    expect(useUpdateTask.toString().length).toBeGreaterThan(50);
  });

  it("useCreateTask がカスタムフックとして実装されている", () => {
    expect(typeof useCreateTask).toBe("function");
    expect(useCreateTask.toString()).not.toContain("return undefined");
    expect(useCreateTask.toString().length).toBeGreaterThan(50);
  });

  it("useDeleteTask が参考実装として存在する", () => {
    expect(typeof useDeleteTask).toBe("function");
    // 参考実装は既に完成しているのでこれは通るはず
    expect(useDeleteTask.toString()).toContain("mutationFn");
  });
});
