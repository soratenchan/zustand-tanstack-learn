/**
 * Exercise 2: Zustand中級 - immer + persist + FilterSlice
 *
 * src/stores/ui-store.ts に FilterSlice を追加してください。
 *
 * 要件:
 * - immer middleware を追加（mutableな書き方でstateを更新できるようにする）
 * - persist middleware を追加（theme, sidebarOpen, filters を永続化）
 * - FilterSlice: filters, setFilter, resetFilters を実装
 *
 * middleware の合成順: devtools(persist(subscribeWithSelector(immer(fn))))
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "@/stores/ui-store";

beforeEach(() => {
  useUIStore.setState({
    filters: { status: "all", priority: "all", assigneeId: null },
    sidebarOpen: true,
    theme: "light",
  });
});

describe("Exercise 2: FilterSlice + immer + persist", () => {
  it("filters の初期値が正しい", () => {
    const { filters } = useUIStore.getState();
    expect(filters).toEqual({
      status: "all",
      priority: "all",
      assigneeId: null,
    });
  });

  it("setFilter で status を変更できる", () => {
    useUIStore.getState().setFilter("status", "todo");
    expect(useUIStore.getState().filters.status).toBe("todo");
  });

  it("setFilter で priority を変更できる", () => {
    useUIStore.getState().setFilter("priority", "high");
    expect(useUIStore.getState().filters.priority).toBe("high");
  });

  it("setFilter で assigneeId を変更できる", () => {
    useUIStore.getState().setFilter("assigneeId", "user-1");
    expect(useUIStore.getState().filters.assigneeId).toBe("user-1");
  });

  it("setFilter は他のフィルター値に影響しない", () => {
    useUIStore.getState().setFilter("status", "done");
    const { filters } = useUIStore.getState();
    expect(filters.status).toBe("done");
    expect(filters.priority).toBe("all");
    expect(filters.assigneeId).toBeNull();
  });

  it("resetFilters で全フィルターが初期値に戻る", () => {
    useUIStore.getState().setFilter("status", "in-progress");
    useUIStore.getState().setFilter("priority", "low");
    useUIStore.getState().setFilter("assigneeId", "user-2");

    useUIStore.getState().resetFilters();

    expect(useUIStore.getState().filters).toEqual({
      status: "all",
      priority: "all",
      assigneeId: null,
    });
  });

  it("immer: setFilter 後も state が immutable に更新されている", () => {
    const before = useUIStore.getState().filters;
    useUIStore.getState().setFilter("status", "todo");
    const after = useUIStore.getState().filters;

    // immer は新しいオブジェクトを作るので参照が異なるはず
    expect(before).not.toBe(after);
    expect(before.status).toBe("all");
    expect(after.status).toBe("todo");
  });

  it("persist: persist の設定が存在する", () => {
    // persist middleware を使っている場合、 persist プロパティが存在する
    expect((useUIStore as any).persist).toBeDefined();
    expect(typeof (useUIStore as any).persist.getOptions).toBe("function");
  });

  it("persist: partialize で notifications は永続化されない", () => {
    const options = (useUIStore as any).persist.getOptions();
    const partialized = options.partialize(useUIStore.getState());

    expect(partialized).toHaveProperty("theme");
    expect(partialized).toHaveProperty("sidebarOpen");
    expect(partialized).toHaveProperty("filters");
    expect(partialized).not.toHaveProperty("notifications");
    expect(partialized).not.toHaveProperty("selectedTaskId");
  });
});
