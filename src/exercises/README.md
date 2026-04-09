# Zustand + TanStack Query ハンズオン

**更新日: 2026-04-09**

ブラウザで動くタスク管理アプリを段階的に完成させながら、Zustand と TanStack Query を学びます。

各 Step を完了するたびに**ブラウザで変化が見えます**。テストは任意の確認手段です。

---

## セットアップ

```bash
cd zustand-tanstack-learn
npm install
```

## プロジェクト構成

```
src/
├── stores/
│   ├── ui-store.ts         ← Step 2, 3, 4 で編集
│   └── task-draft-store.ts ← Step 5 で編集
├── hooks/
│   ├── use-tasks.ts        ← Step 6, 8, 9 で編集
│   └── use-users.ts        （実装済み）
├── components/
│   ├── task-form.tsx        ← Step 9 で編集
│   ├── task-list.tsx        ← Step 7, 8 で編集
│   ├── task-filters.tsx     （実装済み）
│   ├── sidebar.tsx          （実装済み）
│   └── notifications.tsx    （実装済み）
├── app/api/                 （モック API、実装済み）
├── tests/                   （テストファイル、変更しない）
├── solutions/               （模範解答）
├── types/                   （型定義、変更しない）
└── providers/               （QueryProvider、実装済み）
```

---

## Step 1: 起動して画面を確認する

```bash
npm run dev
```

http://localhost:3000 を開いてください。

**ブラウザで見えるもの:**
- 左にサイドバー（タスク作成フォームとフィルター）
- メインエリアにローディングスケルトン（5つの灰色パルスアニメーション）が永遠に表示される
- サイドバーの開閉ボタン（←/→）は動く
- フォームに文字を入力しても反映されない（updateDraft が未実装）
- フィルターを変更しても何も起きない（setFilter が未実装）
- 「タスクを作成」ボタンは常に無効（isValid が常に false）

これが出発点です。コードを書く必要はありません。ここからひとつずつ機能を追加していきます。

---

## Step 2: フィルターを動かす (Zustand: setFilter / resetFilters)

**ファイル:** `src/stores/ui-store.ts`

### やること

`setFilter` と `resetFilters` の no-op を実際の実装に置き換える。

`setFilter` は `filters` オブジェクトの指定キーを更新する。`resetFilters` は `initialFilters` に戻す。

```typescript
setFilter: (key, value) => set((state) => ({
  filters: { ...state.filters, [key]: value },
})),
resetFilters: () => set({ filters: initialFilters }),
```

> `initialFilters` はファイル上部で定義済みです。

### ブラウザで確認

- サイドバーのフィルター（ステータス・優先度）のドロップダウンを変更すると値が切り替わる
- 「リセット」をクリックすると「すべて」に戻る
- メインエリアはローディングが一瞬で終わる/表示されない場合があります（開発環境の再描画や実装状況によって挙動が変わるため）

### テストで確認（任意）

```bash
npm test -- src/tests/ex2
```

---

## Step 3: middleware を追加する (immer + persist + devtools + subscribeWithSelector)

**ファイル:** `src/stores/ui-store.ts`

### やること

現在の `create<UIStore>()((set) => ({...}))` を middleware で包む。

```typescript
import { create } from "zustand";
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set) => ({
          // ... 既存の実装をここに移動
        }))
      ),
      {
        name: "ui-store",  // localStorage のキー名
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
          filters: state.filters,
        }),
      }
    ),
    { name: "UIStore" }  // Redux DevTools での表示名
  )
);
```

### 各 middleware の役割

| middleware | 役割 |
|---|---|
| `immer` | `set` の中で `state.filters[key] = value` のようにミュータブルに書ける |
| `subscribeWithSelector` | ストアの一部だけを監視する `subscribe(selector, listener)` が使える（Step 4 で使用） |
| `persist` | localStorage にストアの一部を自動保存・復元する |
| `devtools` | ブラウザの Redux DevTools でストアの変化を確認できる |

### immer を使った setFilter の書き方

```typescript
// immer なし（スプレッド構文）
setFilter: (key, value) => set((state) => ({
  filters: { ...state.filters, [key]: value },
})),

// immer あり（ミュータブル風）
setFilter: (key, value) => set((state) => {
  state.filters[key] = value;
}),
```

### ブラウザで確認

- フィルターやテーマを変更してからページをリロード → 値が復元される
- DevTools の Application → Local Storage に `ui-store` キーが保存されている
- Redux DevTools（ブラウザ拡張）でアクションのログが見える

### テストで確認（任意）

```bash
npm test -- src/tests/ex2
```

---

## Step 4: 通知を実装する (Zustand: addNotification + subscribeWithSelector)

**ファイル:** `src/stores/ui-store.ts`

### やること

1. `addNotification` と `removeNotification` を実装する
2. ストア定義の**後**に `subscribe` で通知の自動削除を追加する

### addNotification の実装

```typescript
addNotification: (message, type) => set((state) => {
  state.notifications.push({
    id: crypto.randomUUID(),
    message,
    type,
  });
}),
```

> `immer` middleware があるので `push` が使える。immer がなければスプレッド構文が必要。

### removeNotification の実装

```typescript
removeNotification: (id) => set((state) => {
  state.notifications = state.notifications.filter((n) => n.id !== id);
}),
```

### subscribe で自動削除（ストア定義の後に追加）

```typescript
// useUIStore の定義の後に追加する
useUIStore.subscribe(
  (state) => state.notifications.length,  // セレクタ: 通知の数だけ監視
  (length, prevLength) => {
    if (length > prevLength) {
      // 新しい通知が追加されたとき
      const { notifications } = useUIStore.getState();
      const latest = notifications[notifications.length - 1];
      if (latest) {
        setTimeout(() => {
          useUIStore.getState().removeNotification(latest.id);
        }, 3000);
      }
    }
  }
);
```

> `subscribeWithSelector` middleware があるから `subscribe` の第一引数にセレクタを渡せる。通知の数が変わったときだけコールバックが実行される。

### ブラウザで確認

この時点では通知をトリガーする操作がまだ少ないので、視覚的な確認は Step 8 で行います。
テストで動作を確認するのがおすすめです。

### テストで確認（任意）

```bash
npm test -- src/tests/ex3
```

---

## Step 5: フォーム入力を動かす (Zustand: TaskDraftStore)

**ファイル:** `src/stores/task-draft-store.ts`

### やること

`updateDraft`、`resetDraft`、`isValid` を実装する。

```typescript
updateDraft: (key, value) => set((state) => ({
  draft: { ...state.draft, [key]: value },
})),
resetDraft: () => set({ draft: emptyDraft }),
isValid: () => get().draft.title.trim().length > 0,
```

> `isValid` は `get()` を使って現在の state を読み取る。`set` ではなく `get` であることに注意。

### ブラウザで確認

- サイドバーのフォームに文字を入力すると、入力欄にテキストが表示されるようになる
- タスク名に何か入力すると「タスクを作成」ボタンが有効になる（灰色 → 青色）
- タスク名を空にするとボタンが再び無効になる
- まだ送信しても何も起きない（useCreateTask が未実装）

### テストで確認（任意）

```bash
npm test -- src/tests/ex3
```

---

## Step 6: タスク一覧を表示する (TanStack Query: useInfiniteQuery)

**ファイル:** `src/hooks/use-tasks.ts`

### やること

`useTasks()` のダミー実装を `useInfiniteQuery` に置き換える。

```typescript
export function useTasks() {
  const filters = useUIStore(useShallow((state) => state.filters));

  return useInfiniteQuery({
    queryKey: taskKeys.list(filters),
    queryFn: ({ pageParam }) => fetchTasks(pageParam, filters),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30 * 1000,   // 30秒間はデータを新鮮とみなす
    gcTime: 5 * 60 * 1000,  // 5分間キャッシュを保持
  });
}
```

### 学習ポイント

- `useInfiniteQuery` はページネーションや無限スクロール向けのフック
- `queryKey` にフィルターを含めることで、フィルター変更時に自動的に再取得される
- `getNextPageParam` が `undefined` を返すと `hasNextPage` が `false` になる
- `useShallow` で `filters` オブジェクトの浅い比較を行い、不要な再レンダリングを防ぐ
- `staleTime`: この時間内はデータを「新鮮」とみなし再取得しない
- `gcTime`: アンマウント後もこの時間はキャッシュに残る

### ブラウザで確認

- ローディングスケルトンの後、**タスクカード（最大10件）が表示される**
- フィルターを変更するとタスク一覧が絞り込まれる
- 「N件中 M件表示」というカウントが表示される

**これが最初の大きな視覚的変化です。**

### テストで確認（任意）

```bash
npm test -- src/tests/ex4
```

---

## Step 7: 無限スクロールを実装する (IntersectionObserver)

**ファイル:** `src/components/task-list.tsx`

### やること

`loadMoreRef` コールバック内に IntersectionObserver を実装する。

```typescript
const loadMoreRef = useCallback(
  (node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!node) return;

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
    observerRef.current.observe(node);
  },
  [hasNextPage, isFetchingNextPage, fetchNextPage]
);
```

### 学習ポイント

- `IntersectionObserver` はビューポートに要素が入ったときにコールバックを実行する Web API
- `ref callback` パターンで DOM ノードの変更に対応する
- `useCallback` の依存配列に `hasNextPage` と `isFetchingNextPage` を含めることで、状態変化時に Observer が再作成される

### ブラウザで確認

- タスク一覧を下までスクロールすると「読み込み中...」が表示され、追加のタスクが自動で読み込まれる
- すべて読み込み終わると「すべて表示しました」と表示される

---

## Step 8: ステータス変更と楽観的更新 (TanStack Query: useMutation + optimistic update)

**ファイル:** `src/hooks/use-tasks.ts` と `src/components/task-list.tsx`

### Part A: useUpdateTask を実装する

**ファイル:** `src/hooks/use-tasks.ts`

`useUpdateTask()` のダミーを `useMutation` + 楽観的更新に置き換える。

```typescript
export function useUpdateTask() {
  const queryClient = useQueryClient();
  const filters = useUIStore(useShallow((state) => state.filters));
  const addNotification = useUIStore((state) => state.addNotification);

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update task");
      }
      return res.json() as Promise<Task>;
    },

    // 楽観的更新: サーバー応答前に UI を先に更新する
    onMutate: async ({ id, updates }) => {
      // 1. 進行中の refetch をキャンセル（楽観的更新を上書きされないため）
      await queryClient.cancelQueries({ queryKey: taskKeys.list(filters) });

      // 2. 現在のキャッシュを保存（ロールバック用）
      const previousData = queryClient.getQueryData<InfiniteData<TasksPage>>(
        taskKeys.list(filters)
      );

      // 3. キャッシュを楽観的に更新
      queryClient.setQueryData<InfiniteData<TasksPage>>(
        taskKeys.list(filters),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((task) =>
                task.id === id ? { ...task, ...updates } : task
              ),
            })),
          };
        }
      );

      // 4. ロールバック用データを返す
      return { previousData };
    },

    // エラー時: ロールバック
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(taskKeys.list(filters), context.previousData);
      }
      addNotification("更新に失敗しました。ロールバックしました。", "error");
    },

    onSuccess: () => {
      addNotification("タスクを更新しました", "success");
    },

    // 成功でも失敗でも最終的にサーバーから正確なデータを再取得
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
```

> `InfiniteData<TasksPage>` の型を使うために、ファイル上部の import に `InfiniteData` があることを確認してください（既にあります）。

### Part B: ステータス変更ボタンを接続する

**ファイル:** `src/components/task-list.tsx`

TaskCard コンポーネント内のステータスボタンの `onClick` を実装する。

```typescript
onClick={(e) => {
  e.stopPropagation();
  updateTask.mutate({ id: task.id, updates: { status: nextStatus[task.status] } });
}}
```

### 楽観的更新の流れ

1. ユーザーがクリック → `mutate()` が呼ばれる
2. `onMutate`: キャッシュを即座に更新 → **UI が即座に変わる**
3. サーバーにリクエスト送信
4. 成功 → `onSuccess` → `onSettled`（再取得して正確なデータに）
5. 失敗 → `onError`（`previousData` でキャッシュを復元 → **UI が元に戻る**） → `onSettled`

### ブラウザで確認

- タスクカードのステータスバッジをクリック → **即座にステータスが切り替わる**（未着手 → 進行中 → 完了 → 未着手）
- 成功すると右上に「タスクを更新しました」の緑色トースト通知
- **API は 15% の確率でエラーを返す**ので、何度かクリックするとロールバックが発生 → ステータスが元に戻り「更新に失敗しました。ロールバックしました。」の赤色通知が表示される
- 削除ボタン（×）も動作し、「タスクを削除しました」の通知が表示される
- 通知は 3 秒後に自動で消える（Step 4 の subscribe の効果）

**これが最も印象的なデモです。楽観的更新とロールバックを体感してください。**

### テストで確認（任意）

```bash
npm test -- src/tests/ex5
```

---

## Step 9: タスク作成を実装する (TanStack Query: useMutation + Zustand 連携)

**ファイル:** `src/hooks/use-tasks.ts` と `src/components/task-form.tsx`

### Part A: useCreateTask を実装する

**ファイル:** `src/hooks/use-tasks.ts`

```typescript
export function useCreateTask() {
  const queryClient = useQueryClient();
  const resetDraft = useTaskDraftStore((state) => state.resetDraft);
  const addNotification = useUIStore((state) => state.addNotification);

  return useMutation({
    mutationFn: async (task: {
      title: string;
      description: string;
      priority: string;
      assigneeId: string | null;
    }) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json() as Promise<Task>;
    },
    onSuccess: () => {
      // lists() キーで invalidate すると、フィルター条件に関係なく
      // 全てのタスクリストクエリが無効化される（部分一致）
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      resetDraft();  // Zustand のストアをリセット
      addNotification("タスクを作成しました", "success");
    },
    onError: () => {
      addNotification("タスクの作成に失敗しました", "error");
    },
  });
}
```

### Part B: フォーム送信を接続する

**ファイル:** `src/components/task-form.tsx`

`handleSubmit` を実装する。

```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!isValid()) return;
  createTask.mutate(draft);
};
```

### ブラウザで確認

- タスク名を入力して「タスクを作成」をクリック → **タスクが一覧に追加される**
- フォームがリセットされる（resetDraft の効果）
- 「タスクを作成しました」の通知が表示される

**アプリが完全に動作するようになりました。**

---

## 完成後にやること

- `src/solutions/` に模範解答があります。自分の実装と比較してみてください
- React DevTools の Components タブで、各コンポーネントがどの state を購読しているか確認してみてください
- TanStack Query DevTools（画面左下のアイコン）でクエリのキャッシュ状態を観察してみてください
- すべてのテストを実行して確認:

```bash
npm test
```

### 発展課題

- タスクの詳細表示パネル（`selectedTaskId` を使って右側にパネルを表示）
- ダークモード対応（`theme` の値に応じてスタイルを切り替え）
- タスクの並び替え（優先度順、作成日順）
- 楽観的更新をタスク作成にも適用する
