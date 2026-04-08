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

// Note: useMutation フックは QueryClientProvider 内でレンダリングしないと呼べないため、
// ここでは「実装が存在するか」を関数の形状で確認するにとどめています。
// 実際の動作確認（楽観的更新・ロールバック）はブラウザで行ってください（API は 15% の確率でエラーを返します）。
describe("Exercise 5: Mutations", () => {
  it("useUpdateTask がカスタムフックとして実装されている（React hooksを呼ぶ関数）", () => {
    expect(typeof useUpdateTask).toBe("function");
    // ダミー実装（return { mutate: () => {} }）より長い実装があることを確認
    expect(useUpdateTask.toString()).toContain("useMutation");
  });

  it("useCreateTask がカスタムフックとして実装されている", () => {
    expect(typeof useCreateTask).toBe("function");
    expect(useCreateTask.toString()).toContain("useMutation");
  });

  it("useDeleteTask が参考実装として存在する", () => {
    expect(typeof useDeleteTask).toBe("function");
    // 参考実装は既に完成しているのでこれは通るはず
    expect(useDeleteTask.toString()).toContain("mutationFn");
  });
});
