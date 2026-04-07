/**
 * Exercise 1: Zustand基礎 - UIストアを作る
 *
 * src/stores/ui-store.ts に useUIStore を実装してください。
 * まずは UISlice の部分だけで OK です。
 *
 * 要件:
 * - create() で Zustand ストアを作る
 * - devtools middleware を使う
 * - sidebarOpen, toggleSidebar, selectedTaskId, selectTask, theme, toggleTheme を実装
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "@/stores/ui-store";

// 各テストの前にストアをリセット
beforeEach(() => {
  useUIStore.setState({
    sidebarOpen: true,
    selectedTaskId: null,
    theme: "light",
  });
});

describe("Exercise 1: UIストアの基礎", () => {
  it("useUIStore が Zustand ストアとして存在する", () => {
    expect(useUIStore).toBeDefined();
    expect(typeof useUIStore.getState).toBe("function");
    expect(typeof useUIStore.setState).toBe("function");
    expect(typeof useUIStore.subscribe).toBe("function");
  });

  it("sidebarOpen の初期値は true", () => {
    const state = useUIStore.getState();
    expect(state.sidebarOpen).toBe(true);
  });

  it("toggleSidebar で sidebarOpen が反転する", () => {
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(false);

    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it("selectedTaskId の初期値は null", () => {
    expect(useUIStore.getState().selectedTaskId).toBeNull();
  });

  it("selectTask で selectedTaskId が設定される", () => {
    useUIStore.getState().selectTask("task-1");
    expect(useUIStore.getState().selectedTaskId).toBe("task-1");

    useUIStore.getState().selectTask(null);
    expect(useUIStore.getState().selectedTaskId).toBeNull();
  });

  it("theme の初期値は 'light'", () => {
    expect(useUIStore.getState().theme).toBe("light");
  });

  it("toggleTheme で light/dark が切り替わる", () => {
    useUIStore.getState().toggleTheme();
    expect(useUIStore.getState().theme).toBe("dark");

    useUIStore.getState().toggleTheme();
    expect(useUIStore.getState().theme).toBe("light");
  });

  it("アクションを連続で呼んでも正しく動作する", () => {
    useUIStore.getState().toggleSidebar();
    useUIStore.getState().selectTask("x");
    useUIStore.getState().toggleTheme();

    const state = useUIStore.getState();
    expect(state.sidebarOpen).toBe(false);
    expect(state.selectedTaskId).toBe("x");
    expect(state.theme).toBe("dark");
  });
});
