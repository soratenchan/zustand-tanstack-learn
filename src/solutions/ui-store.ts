import { create } from "zustand";
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { TaskFilters } from "@/types";

// =====================================================
// 学習ポイント 1: Sliceパターン
// ストアが大きくなったとき、関心ごとにSliceに分割する。
// 各sliceは独立したstate + actionを持つ。
// =====================================================

// --- Filter Slice ---
type FilterSlice = {
  filters: TaskFilters;
  setFilter: <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => void;
  resetFilters: () => void;
};

const initialFilters: TaskFilters = {
  status: "all",
  priority: "all",
  assigneeId: null,
};

// --- UI Slice ---
type UISlice = {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  selectedTaskId: string | null;
  selectTask: (id: string | null) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
};

// --- Notification Slice ---
type Notification = {
  id: string;
  message: string;
  type: "success" | "error" | "info";
};

type NotificationSlice = {
  notifications: Notification[];
  addNotification: (message: string, type: Notification["type"]) => void;
  removeNotification: (id: string) => void;
};

// --- 統合型 ---
type UIStore = FilterSlice & UISlice & NotificationSlice;

// =====================================================
// 学習ポイント 2: Middleware合成
// devtools → persist → subscribeWithSelector → immer の順で合成
// 注意: middlewareの順番は重要。外側から適用される。
// =====================================================
export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set) => ({
          // --- Filter Slice ---
          filters: initialFilters,
          setFilter: (key, value) =>
            set(
              (state) => {
                // 学習ポイント 3: immerがあるのでmutableに書ける
                state.filters[key] = value;
              },
              false, // replace: false（デフォルト）
              `filters/set-${key}` // devtoolsでのアクション名
            ),
          resetFilters: () =>
            set(
              (state) => {
                state.filters = initialFilters;
              },
              false,
              "filters/reset"
            ),

          // --- UI Slice ---
          sidebarOpen: true,
          toggleSidebar: () =>
            set(
              (state) => {
                state.sidebarOpen = !state.sidebarOpen;
              },
              false,
              "ui/toggleSidebar"
            ),
          selectedTaskId: null,
          selectTask: (id) =>
            set(
              (state) => {
                state.selectedTaskId = id;
              },
              false,
              "ui/selectTask"
            ),
          theme: "light",
          toggleTheme: () =>
            set(
              (state) => {
                state.theme = state.theme === "light" ? "dark" : "light";
              },
              false,
              "ui/toggleTheme"
            ),

          // --- Notification Slice ---
          notifications: [],
          addNotification: (message, type) =>
            set(
              (state) => {
                state.notifications.push({
                  id: crypto.randomUUID(),
                  message,
                  type,
                });
              },
              false,
              "notifications/add"
            ),
          removeNotification: (id) =>
            set(
              (state) => {
                state.notifications = state.notifications.filter(
                  (n) => n.id !== id
                );
              },
              false,
              "notifications/remove"
            ),
        }))
      ),
      {
        name: "ui-store", // localStorage key
        // 学習ポイント 4: partialize で永続化する項目を選択
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
          filters: state.filters,
        }),
      }
    ),
    { name: "UIStore" } // DevToolsでの表示名
  )
);

// =====================================================
// 学習ポイント 5: subscribeWithSelector
// stateの一部だけを監視してリアクションを実行できる。
// Reactのコンポーネント外からも使える。
// =====================================================
useUIStore.subscribe(
  (state) => state.notifications.length,
  (length, prevLength) => {
    if (length > prevLength) {
      // 新しい通知が追加されたら3秒後に自動削除
      const latest =
        useUIStore.getState().notifications[
          useUIStore.getState().notifications.length - 1
        ];
      if (latest) {
        setTimeout(() => {
          useUIStore.getState().removeNotification(latest.id);
        }, 3000);
      }
    }
  }
);
