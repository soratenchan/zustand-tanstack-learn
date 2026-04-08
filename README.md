# Zustand + TanStack Query ハンズオン

Zustand と TanStack Query を学ぶためのハンズオンプロジェクトです。
タスク管理アプリを段階的に完成させながら、両ライブラリの実践的な使い方を習得します。

## セットアップ

```bash
npm install
npm run dev
```

http://localhost:3000 を開いてください。

## 学習ガイド

演習の手順は [`src/exercises/README.md`](./src/exercises/README.md) を参照してください。

## 主な学習内容

| テーマ | 内容 |
|---|---|
| Zustand 基礎 | `create`, `set`, `get` |
| Zustand middleware | `immer`, `persist`, `devtools`, `subscribeWithSelector` |
| TanStack Query 基礎 | `useInfiniteQuery`, Query Key Factory |
| TanStack Query 応用 | `useMutation`, 楽観的更新, ロールバック |
| 統合 | Zustand × TanStack Query の連携パターン |

## プロジェクト構成

```
src/
├── stores/          # Zustand ストア（演習ファイル）
├── hooks/           # TanStack Query カスタムフック（演習ファイル）
├── components/      # React コンポーネント
├── app/api/         # モック API（実装済み）
├── tests/           # Vitest テスト
├── solutions/       # 模範解答
└── exercises/       # 演習ガイド (README.md)
```

## テスト実行

```bash
npm test              # 全テスト実行
npm run test:watch    # ウォッチモード
npm test -- src/tests/ex1  # 特定のテストのみ
```
