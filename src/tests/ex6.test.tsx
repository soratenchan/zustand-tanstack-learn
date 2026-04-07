/**
 * Exercise 6: 統合 - Zustand × TanStack Query の接続
 *
 * 以下のコンポーネントを実装してください:
 *   - src/components/task-form.tsx: フォーム → Zustand → TanStack Query
 *   - src/components/task-list.tsx: Infinite Query → 無限スクロール
 *
 * Exercise 1-5 を先に完了してください。
 */
import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUIStore } from "@/stores/ui-store";
import { useTaskDraftStore } from "@/stores/task-draft-store";

import { TaskForm } from "@/components/task-form";
import { TaskList } from "@/components/task-list";

function Wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(
    QueryClientProvider,
    { client },
    children
  );
}

describe("Exercise 6: コンポーネント統合", () => {
  it("前提: useUIStore が実装済みである", () => {
    expect(useUIStore).toBeDefined();
    expect(typeof useUIStore.getState).toBe("function");
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it("前提: useTaskDraftStore が実装済みである", () => {
    expect(useTaskDraftStore).toBeDefined();
    expect(typeof useTaskDraftStore.getState).toBe("function");
    expect(useTaskDraftStore.getState().draft).toBeDefined();
  });

  it("TaskForm がエラーなくレンダリングされる", () => {
    expect(() => {
      renderToStaticMarkup(
        React.createElement(Wrapper, null, React.createElement(TaskForm))
      );
    }).not.toThrow();
  });

  it("TaskForm に input[placeholder='タスク名'] が含まれる", () => {
    const html = renderToStaticMarkup(
      React.createElement(Wrapper, null, React.createElement(TaskForm))
    );
    expect(html).toContain('placeholder="タスク名"');
  });

  it("TaskForm に送信ボタンが含まれる", () => {
    const html = renderToStaticMarkup(
      React.createElement(Wrapper, null, React.createElement(TaskForm))
    );
    expect(html).toContain("タスクを作成");
  });

  it("TaskList がエラーなくレンダリングされる", () => {
    expect(() => {
      renderToStaticMarkup(
        React.createElement(Wrapper, null, React.createElement(TaskList))
      );
    }).not.toThrow();
  });
});
