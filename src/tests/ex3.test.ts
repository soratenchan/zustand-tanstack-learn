/**
 * Exercise 3: Zustand応用 - NotificationSlice + subscribeWithSelector + TaskDraftStore
 *
 * 2つのファイルを実装してください:
 *
 * (A) src/stores/ui-store.ts の NotificationSlice
 *   - addNotification: 通知を追加（id は crypto.randomUUID()）
 *   - removeNotification: 指定IDの通知を削除
 *   - subscribeWithSelector で notifications.length を監視し、
 *     新しい通知が追加されたら3秒後に自動削除
 *
 * (B) src/stores/task-draft-store.ts
 *   - devtools + immer middleware
 *   - draft: フォーム状態
 *   - updateDraft: 指定キーの値を更新
 *   - resetDraft: 初期値にリセット
 *   - isValid(): get() を使って title が空でないか判定
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useUIStore } from "@/stores/ui-store";
import { useTaskDraftStore } from "@/stores/task-draft-store";

beforeEach(() => {
  useUIStore.setState({ notifications: [] });
  useTaskDraftStore.setState({
    draft: { title: "", description: "", priority: "medium", assigneeId: null },
  });
});

describe("Exercise 3A: NotificationSlice", () => {
  it("notifications の初期値は空配列", () => {
    expect(useUIStore.getState().notifications).toEqual([]);
  });

  it("addNotification で通知が追加される", () => {
    useUIStore.getState().addNotification("テスト通知", "success");
    const { notifications } = useUIStore.getState();
    expect(notifications).toHaveLength(1);
    expect(notifications[0].message).toBe("テスト通知");
    expect(notifications[0].type).toBe("success");
    expect(notifications[0].id).toBeDefined();
  });

  it("addNotification で追加される通知に一意の id がある", () => {
    useUIStore.getState().addNotification("通知1", "info");
    useUIStore.getState().addNotification("通知2", "error");
    const { notifications } = useUIStore.getState();
    expect(notifications[0].id).not.toBe(notifications[1].id);
  });

  it("removeNotification で指定IDの通知が削除される", () => {
    useUIStore.getState().addNotification("消す通知", "info");
    useUIStore.getState().addNotification("残す通知", "success");
    const id = useUIStore.getState().notifications[0].id;

    useUIStore.getState().removeNotification(id);

    const { notifications } = useUIStore.getState();
    expect(notifications).toHaveLength(1);
    expect(notifications[0].message).toBe("残す通知");
  });

  // このテストは Step 3 で subscribeWithSelector middleware を追加した後に通過します
  it("subscribeWithSelector: 通知追加後に3秒で自動削除される", async () => {
    vi.useFakeTimers();

    useUIStore.getState().addNotification("自動削除される通知", "info");
    expect(useUIStore.getState().notifications).toHaveLength(1);

    vi.advanceTimersByTime(3000);

    expect(useUIStore.getState().notifications).toHaveLength(0);

    vi.useRealTimers();
  });
});

describe("Exercise 3B: TaskDraftStore", () => {
  it("useTaskDraftStore が Zustand ストアとして存在する", () => {
    expect(useTaskDraftStore).toBeDefined();
    expect(typeof useTaskDraftStore.getState).toBe("function");
  });

  it("draft の初期値が正しい", () => {
    const { draft } = useTaskDraftStore.getState();
    expect(draft).toEqual({
      title: "",
      description: "",
      priority: "medium",
      assigneeId: null,
    });
  });

  it("updateDraft で title を更新できる", () => {
    useTaskDraftStore.getState().updateDraft("title", "新しいタスク");
    expect(useTaskDraftStore.getState().draft.title).toBe("新しいタスク");
  });

  it("updateDraft で priority を更新できる", () => {
    useTaskDraftStore.getState().updateDraft("priority", "high");
    expect(useTaskDraftStore.getState().draft.priority).toBe("high");
  });

  it("updateDraft は他のフィールドに影響しない", () => {
    useTaskDraftStore.getState().updateDraft("title", "タスク");
    const { draft } = useTaskDraftStore.getState();
    expect(draft.title).toBe("タスク");
    expect(draft.description).toBe("");
    expect(draft.priority).toBe("medium");
  });

  it("resetDraft で初期値に戻る", () => {
    useTaskDraftStore.getState().updateDraft("title", "何か");
    useTaskDraftStore.getState().updateDraft("description", "説明");
    useTaskDraftStore.getState().updateDraft("priority", "high");

    useTaskDraftStore.getState().resetDraft();

    expect(useTaskDraftStore.getState().draft).toEqual({
      title: "",
      description: "",
      priority: "medium",
      assigneeId: null,
    });
  });

  it("isValid() は title が空のとき false を返す", () => {
    expect(useTaskDraftStore.getState().isValid()).toBe(false);
  });

  it("isValid() は title が空白のみでも false を返す", () => {
    useTaskDraftStore.getState().updateDraft("title", "   ");
    expect(useTaskDraftStore.getState().isValid()).toBe(false);
  });

  it("isValid() は title に文字があれば true を返す", () => {
    useTaskDraftStore.getState().updateDraft("title", "タスク名");
    expect(useTaskDraftStore.getState().isValid()).toBe(true);
  });
});
