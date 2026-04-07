# Zustand + TanStack Query ハンズオン演習

テスト駆動で学ぶ演習です。**テストを通すためにコードを自分で書いてください。**

---

## セットアップ

```bash
cd zustand-tanstack-learn
npm install
```

## 進め方

### 1. テストを実行する（最初は全部 FAIL する）

```bash
npm test -- src/tests/ex1
```

### 2. watch モードで実装する

```bash
npm run test:watch -- src/tests/ex1
```

ファイルを保存するたびに自動でテストが再実行されます。
赤(FAIL) → 緑(PASS) になるまでコードを書いてください。

### 3. 全部通ったら次の Exercise へ

```bash
npm run test:watch -- src/tests/ex2
```

**Exercise 1 → 2 → 3 → 4 → 5 → 6 の順でやってください。**
後の Exercise は前の実装に依存します。

### 4. 全 Exercise 完了後、ブラウザで動作確認

```bash
npm run dev
```

http://localhost:3000 でタスク管理アプリが動きます。

### 5. 詰まったら

`src/solutions/` に解答があります。
丸写しせずに、まず自分で考えてください。

---

## プロジェクト構成

```
src/
├── stores/
│   ├── ui-store.ts         ← Exercise 1, 2, 3 で実装
│   └── task-draft-store.ts ← Exercise 3 で実装
├── hooks/
│   ├── use-tasks.ts        ← Exercise 4, 5 で実装
│   └── use-users.ts        （実装済み）
├── components/
│   ├── task-form.tsx        ← Exercise 6 で実装
│   ├── task-list.tsx        ← Exercise 6 で実装
│   ├── task-filters.tsx     （実装済み）
│   ├── sidebar.tsx          （実装済み）
│   └── notifications.tsx    （実装済み）
├── app/api/                 （モックAPI、実装済み）
├── tests/                   （テストファイル、変更しない）
├── solutions/               （解答）
├── types/                   （型定義、変更しない）
└── providers/               （QueryProvider、実装済み）
```

---

## Exercise 1: Zustand基礎 - create + devtools

**ファイル:** `src/stores/ui-store.ts`
**テスト:** `npm test -- src/tests/ex1`

### やること

`create()` で Zustand ストアを作成する。`devtools` middleware を使う。

### テストが検証すること

| state / action | 期待する動作 |
|---|---|
| `sidebarOpen` | 初期値 `true` |
| `toggleSidebar()` | `true` ↔ `false` を反転 |
| `selectedTaskId` | 初期値 `null` |
| `selectTask(id)` | 引数の値をセット。`null` も受け付ける |
| `theme` | 初期値 `"light"` |
| `toggleTheme()` | `"light"` ↔ `"dark"` を切り替え |

### 学べること

- `create()` でストアを作る基本
- `set()` で状態を更新する方法
- `devtools` middleware の適用方法

---

## Exercise 2: Zustand中級 - immer + persist + FilterSlice

**ファイル:** `src/stores/ui-store.ts`（Exercise 1 のコードを拡張）
**テスト:** `npm test -- src/tests/ex2`

### やること

1. **FilterSlice** を追加する（filters, setFilter, resetFilters）
2. **middleware を合成**する: `devtools(persist(subscribeWithSelector(immer(fn))))`
3. **persist** で `theme`, `sidebarOpen`, `filters` だけを永続化する

### テストが検証すること

| 項目 | 期待する動作 |
|---|---|
| `filters` 初期値 | `{ status: "all", priority: "all", assigneeId: null }` |
| `setFilter("status", "todo")` | `status` だけ変わり、他はそのまま |
| `resetFilters()` | 全フィルターが初期値に戻る |
| immer の挙動 | `setFilter` 後の `filters` が別の参照（新しいオブジェクト） |
| persist | `.persist.getOptions()` が呼べる |
| partialize | `notifications` と `selectedTaskId` は永続化されない |

### 学べること

- middleware の合成順と各 middleware の役割
- `immer` による mutable 風の state 更新
- `persist` + `partialize` による部分的な永続化

---

## Exercise 3: Zustand応用 - 通知の自動削除 + 下書きストア

**ファイル:** `src/stores/ui-store.ts` + `src/stores/task-draft-store.ts`
**テスト:** `npm test -- src/tests/ex3`

### Part A: NotificationSlice（ui-store.ts に追加）

| action | 動作 |
|---|---|
| `addNotification(message, type)` | 通知を配列に追加。`id` は `crypto.randomUUID()` |
| `removeNotification(id)` | 指定 ID の通知を削除 |
| **subscribe** | `notifications.length` が増えたら 3 秒後に最新の通知を自動削除 |

### Part B: TaskDraftStore（task-draft-store.ts を新規実装）

`devtools` + `immer` で別のストアを作る。

| state / action | 動作 |
|---|---|
| `draft` | 初期値: `{ title: "", description: "", priority: "medium", assigneeId: null }` |
| `updateDraft(key, value)` | 指定キーだけ更新 |
| `resetDraft()` | 初期値に戻す |
| `isValid()` | `draft.title` が空白のみでなければ `true`（`get()` を使う） |

### 学べること

- `subscribeWithSelector` でコンポーネント外から state を監視する
- `getState()` でコンポーネント外からストアにアクセスする
- `get()` を使った derived state（computed values）

---

## Exercise 4: TanStack Query基礎 - Query Key Factory + Infinite Query

**ファイル:** `src/hooks/use-tasks.ts`
**テスト:** `npm test -- src/tests/ex4`

### やること

**Query Key Factory** パターンを実装する。

```
taskKeys.all       → ["tasks"]
taskKeys.lists()   → ["tasks", "list"]
taskKeys.list(f)   → ["tasks", "list", f]
```

（テストは Key Factory のみ検証します。`useTasks` は Exercise 5 以降で使います。）

### 学べること

- Query Key を階層的に管理するパターン
- `as const` によるリテラル型推論
- キーの部分一致で一括 invalidation できる設計

---

## Exercise 5: TanStack Query中級 - Mutation + Optimistic Update

**ファイル:** `src/hooks/use-tasks.ts`（Exercise 4 に追加）
**テスト:** `npm test -- src/tests/ex5`

### やること

`useDeleteTask`（完成済み）を参考に、2つの mutation hook を実装する。

#### useUpdateTask

- `mutationFn`: `PATCH /api/tasks/:id` にリクエスト
- `onMutate`: キャッシュを楽観的に更新（ロールバック用データを return）
- `onError`: キャッシュをロールバック + エラー通知
- `onSuccess`: 成功通知
- `onSettled`: `invalidateQueries` で再フェッチ

#### useCreateTask

- `mutationFn`: `POST /api/tasks` にリクエスト
- `onSuccess`: `invalidateQueries` + `resetDraft()` + 成功通知
- `onError`: エラー通知

### 学べること

- `useMutation` のライフサイクル（onMutate → onSuccess/onError → onSettled）
- 楽観的更新: `cancelQueries` → `getQueryData` → `setQueryData` → return context
- エラー時のロールバック
- `invalidateQueries` によるキャッシュ無効化
- Zustand ストアと TanStack Query の連携

---

## Exercise 6: 統合 - コンポーネントを組み立てる

**ファイル:** `src/components/task-form.tsx` + `src/components/task-list.tsx`
**テスト:** `npm test -- src/tests/ex6`

### やること

Exercise 1-5 で作ったストアと hooks をコンポーネントに接続する。

#### TaskForm

- `useTaskDraftStore` から `draft`, `updateDraft`, `isValid` を取得
- `useCreateTask()` で mutation を取得
- `useUsers()` でユーザーリストを取得
- input/select の `value` と `onChange` を draft に接続
- `handleSubmit` で `isValid()` チェック後に `createTask.mutate(draft)`

#### TaskList

- `useTasks()` で Infinite Query の結果を取得
- `data.pages.flatMap(page => page.items)` でタスクを展開
- `IntersectionObserver` + `ref callback` で無限スクロールを実装
- TaskCard で `useUpdateTask`, `useDeleteTask` を接続

### 学べること

- Zustand（クライアント状態）と TanStack Query（サーバー状態）の役割分担
- `useShallow` による再レンダリング最適化
- `IntersectionObserver` を使った無限スクロールの実装パターン

---

## 全 Exercise 完了後

```bash
# 全テストが通ることを確認
npm test

# ブラウザで動作確認
npm run dev
```

ブラウザでの確認ポイント:
- タスクのステータスバッジをクリック → **即座に UI が変わる**（楽観的更新）
- 15% の確率でエラー → **UI がロールバック**される（通知も出る）
- フィルターを変更 → **リストが自動で更新**される
- ページ最下部まで → **次のタスクが自動読み込み**される（無限スクロール）
- ページをリロード → **テーマとフィルターが復元**される（persist）
- React Query DevTools（画面右下のアイコン）でキャッシュの状態を観察
