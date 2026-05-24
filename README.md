# Zustand + TanStack Query ハンズオン

更新日: 2026-05-17

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

## Cloud Agent の使い方

このプロジェクトでは [Cursor Cloud Agent](https://www.cursor.com/) を利用した開発が可能です。Cloud Agent は AI アシスタントがクラウド上でコードの修正やテストを自動で行ってくれる機能です。

### Cloud Agent でできること

- **コードの実装・修正**: 演習ファイル（`src/stores/`、`src/hooks/`）の実装をサポート
- **テストの実行と確認**: `npm test` を実行して結果を確認
- **コードレビュー**: 実装したコードの改善提案
- **質問への回答**: Zustand や TanStack Query の使い方に関する質問

### 使用例

Cloud Agent に以下のような指示を出すことができます（日本語対応）：

```
# 演習の実装をお願いする
「演習1の useFilterStore を実装してください」

# テストを実行して確認
「npm test を実行して結果を教えてください」

# コードの説明を求める
「src/stores/filter-store.ts の immer ミドルウェアの使い方を説明してください」

# エラーの修正
「テストが失敗しています。原因を調査して修正してください」
```

### 注意事項

- Cloud Agent は `AGENTS.md` に記載されたプロジェクト固有の設定を読み込んで動作します
- `.env` ファイルは不要です（モック API がインメモリで動作します）
- 演習ファイルは意図的に未完成の状態になっています（学習目的）
