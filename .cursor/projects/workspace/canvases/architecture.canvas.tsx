import {
  Button,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Code,
  CollapsibleSection,
  computeDAGLayout,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Pill,
  Row,
  Spacer,
  Stack,
  Stat,
  Table,
  Text,
  useCanvasState,
  useHostTheme,
  type DAGLayoutEdge,
} from "cursor/canvas";

type SectionId =
  | "overview"
  | "architecture"
  | "layers"
  | "dataflow"
  | "state"
  | "api"
  | "exercises"
  | "references";

type ArchNodeId =
  | "layout"
  | "page"
  | "sidebar"
  | "task-list"
  | "notifications"
  | "ui-store"
  | "draft-store"
  | "use-tasks"
  | "use-users"
  | "api-tasks"
  | "api-users"
  | "mock-data";

type ArchNode = {
  id: ArchNodeId;
  label: string;
  path: string;
  role: string;
  tech: string;
  layer: "UI" | "State" | "Data" | "Server";
};

const ARCH_NODES: ArchNode[] = [
  {
    id: "layout",
    label: "RootLayout",
    path: "src/app/layout.tsx",
    role: "QueryClientProvider でアプリ全体をラップ",
    tech: "Next.js App Router",
    layer: "UI",
  },
  {
    id: "page",
    label: "Home Page",
    path: "src/app/page.tsx",
    role: "Sidebar・TaskList・Notifications を配置",
    tech: "Client Component",
    layer: "UI",
  },
  {
    id: "sidebar",
    label: "Sidebar",
    path: "src/components/sidebar.tsx",
    role: "TaskForm + TaskFilters、サイドバー開閉",
    tech: "Zustand (ui-store)",
    layer: "UI",
  },
  {
    id: "task-list",
    label: "TaskList",
    path: "src/components/task-list.tsx",
    role: "無限スクロール一覧・ステータス更新・削除",
    tech: "TanStack Query + Zustand",
    layer: "UI",
  },
  {
    id: "notifications",
    label: "Notifications",
    path: "src/components/notifications.tsx",
    role: "トースト通知の表示",
    tech: "Zustand (ui-store)",
    layer: "UI",
  },
  {
    id: "ui-store",
    label: "ui-store",
    path: "src/stores/ui-store.ts",
    role: "フィルター・サイドバー・通知・テーマ",
    tech: "Zustand + immer/persist/devtools",
    layer: "State",
  },
  {
    id: "draft-store",
    label: "task-draft-store",
    path: "src/stores/task-draft-store.ts",
    role: "作成フォームの下書きとバリデーション",
    tech: "Zustand",
    layer: "State",
  },
  {
    id: "use-tasks",
    label: "use-tasks",
    path: "src/hooks/use-tasks.ts",
    role: "一覧取得・作成・更新・削除の Query/Mutation",
    tech: "TanStack Query",
    layer: "Data",
  },
  {
    id: "use-users",
    label: "use-users",
    path: "src/hooks/use-users.ts",
    role: "担当者一覧の取得",
    tech: "TanStack Query (実装済み)",
    layer: "Data",
  },
  {
    id: "api-tasks",
    label: "API /tasks",
    path: "src/app/api/tasks/",
    role: "GET(ページネーション)・POST(作成)",
    tech: "Next.js Route Handlers",
    layer: "Server",
  },
  {
    id: "api-users",
    label: "API /users",
    path: "src/app/api/users/route.ts",
    role: "ユーザー一覧",
    tech: "Next.js Route Handlers",
    layer: "Server",
  },
  {
    id: "mock-data",
    label: "mock-data",
    path: "src/lib/mock-data.ts",
    role: "メモリ内の tasks / users 配列",
    tech: "インメモリ DB（永続化なし）",
    layer: "Server",
  },
];

const NODE_BY_ID = Object.fromEntries(
  ARCH_NODES.map((n) => [n.id, n]),
) as Record<ArchNodeId, ArchNode>;


const TOC: { id: SectionId; label: string }[] = [
  { id: "overview", label: "概要" },
  { id: "architecture", label: "アーキテクチャ図" },
  { id: "layers", label: "レイヤー" },
  { id: "dataflow", label: "データフロー" },
  { id: "state", label: "状態管理" },
  { id: "api", label: "API" },
  { id: "exercises", label: "演習" },
  { id: "references", label: "参照" },
];

const DAG_EDGES: { from: ArchNodeId; to: ArchNodeId }[] = [
  { from: "layout", to: "page" },
  { from: "page", to: "sidebar" },
  { from: "page", to: "task-list" },
  { from: "page", to: "notifications" },
  { from: "sidebar", to: "ui-store" },
  { from: "sidebar", to: "draft-store" },
  { from: "task-list", to: "use-tasks" },
  { from: "task-list", to: "use-users" },
  { from: "task-list", to: "ui-store" },
  { from: "notifications", to: "ui-store" },
  { from: "use-tasks", to: "api-tasks" },
  { from: "use-users", to: "api-users" },
  { from: "api-tasks", to: "mock-data" },
  { from: "api-users", to: "mock-data" },
  { from: "use-tasks", to: "ui-store" },
  { from: "use-tasks", to: "draft-store" },
];

function layerFill(
  layer: ArchNode["layer"],
  theme: ReturnType<typeof useHostTheme>,
  selected: boolean,
) {
  const base =
    layer === "UI"
      ? theme.fill.secondary
      : layer === "State"
        ? theme.fill.tertiary
        : layer === "Data"
          ? theme.fill.quaternary
          : theme.bg.elevated;
  return selected ? theme.accent.control : base;
}

function ArchitectureDAG({
  selectedId,
  onSelect,
}: {
  selectedId: ArchNodeId | null;
  onSelect: (id: ArchNodeId | null) => void;
}) {
  const theme = useHostTheme();
  const layout = computeDAGLayout({
    nodes: ARCH_NODES.map((n) => ({ id: n.id })),
    edges: DAG_EDGES,
    direction: "vertical",
    nodeWidth: 176,
    nodeHeight: 52,
    rankGap: 72,
    nodeGap: 40,
    padding: 28,
  });

  function edgePath(edge: DAGLayoutEdge) {
    const midY = (edge.sourceY + edge.targetY) / 2;
    return `M ${edge.sourceX} ${edge.sourceY} C ${edge.sourceX} ${midY}, ${edge.targetX} ${midY}, ${edge.targetX} ${edge.targetY}`;
  }

  return (
    <Stack gap={12}>
      <Row gap={8} wrap>
        {(["UI", "State", "Data", "Server"] as ArchNode["layer"][]).map((layer) => (
          <Row key={layer} gap={6} align="center">
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: layerFill(layer, theme, false),
                border: `1px solid ${theme.stroke.secondary}`,
              }}
            />
            <Text size="small" tone="secondary">
              {layer}
            </Text>
          </Row>
        ))}
        <Spacer />
        <Button variant="ghost" onClick={() => onSelect(null)}>
          選択をクリア
        </Button>
      </Row>

      <div style={{ overflowX: "auto", paddingBottom: 8 }}>
        <svg
          width={layout.width}
          height={layout.height}
          style={{ display: "block", minWidth: layout.width }}
        >
          {layout.edges.map((edge) => (
            <path
              key={`${edge.from}-${edge.to}`}
              d={edgePath(edge)}
              fill="none"
              stroke={
                edge.isBackEdge
                  ? theme.stroke.tertiary
                  : theme.stroke.secondary
              }
              strokeWidth={edge.isBackEdge ? 1 : 1.5}
              strokeDasharray={edge.isBackEdge ? "4 3" : undefined}
            />
          ))}
          {layout.nodes.map((pos) => {
            const node = NODE_BY_ID[pos.id as ArchNodeId];
            const selected = selectedId === node.id;
            return (
              <g
                key={node.id}
                style={{ cursor: "pointer" }}
                onClick={() => onSelect(selected ? null : node.id)}
              >
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={176}
                  height={52}
                  rx={6}
                  fill={layerFill(node.layer, theme, selected)}
                  stroke={
                    selected ? theme.accent.primary : theme.stroke.primary
                  }
                  strokeWidth={selected ? 2 : 1}
                />
                <text
                  x={pos.x + 88}
                  y={pos.y + 22}
                  textAnchor="middle"
                  fill={selected ? theme.text.onAccent : theme.text.primary}
                  fontSize={12}
                  fontWeight={600}
                >
                  {node.label}
                </text>
                <text
                  x={pos.x + 88}
                  y={pos.y + 38}
                  textAnchor="middle"
                  fill={selected ? theme.text.onAccent : theme.text.tertiary}
                  fontSize={10}
                >
                  {node.layer}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Stack>
  );
}

function NodeDetail({ nodeId }: { nodeId: ArchNodeId }) {
  const node = NODE_BY_ID[nodeId];
  return (
    <Card>
      <CardHeader trailing={<Pill tone="info">{node.layer}</Pill>}>
        {node.label}
      </CardHeader>
      <CardBody>
        <Stack gap={10}>
          <Text>
            <Text weight="semibold">パス: </Text>
            <Code>{node.path}</Code>
          </Text>
          <Text>{node.role}</Text>
          <Text tone="secondary" size="small">
            {node.tech}
          </Text>
        </Stack>
      </CardBody>
    </Card>
  );
}

function TableOfContents({
  active,
  onNavigate,
}: {
  active: SectionId;
  onNavigate: (id: SectionId) => void;
}) {
  return (
    <Stack gap={8}>
      <Text weight="semibold" size="small">
        目次
      </Text>
      <Row gap={6} wrap>
        {TOC.map((item) => (
          <Button
            key={item.id}
            variant={active === item.id ? "primary" : "secondary"}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </Row>
    </Stack>
  );
}

function OverviewSection() {
  return (
    <Stack gap={16}>
      <Text>
        Zustand と TanStack Query を学ぶための**日本語タスク管理アプリ**です。Next.js
        16 の App Router、インメモリのモック API、段階的な演習スタブで構成されています。
      </Text>
      <Grid columns={3} gap={12}>
        <Stat label="フレームワーク" value="Next.js 16" />
        <Stat label="クライアント状態" value="Zustand 5" />
        <Stat label="サーバー状態" value="TanStack Query 5" />
      </Grid>
      <Callout tone="info" title="起動">
        <Text>
          `npm install` のあと `npm run dev`（ポート **3001**）。`.env` は不要です。
        </Text>
      </Callout>
      <Callout tone="warning" title="演習スタブについて">
        <Text>
          `src/stores/` と `src/hooks/` は学習用のプレースホルダーです。Step
          6 以降のテストや本番ビルドは、実装完了まで失敗する場合があります。模範解答は
          `src/solutions/` にあります。
        </Text>
      </Callout>
    </Stack>
  );
}

function LayersSection() {
  return (
    <Stack gap={16}>
      <Table
        headers={["レイヤー", "責務", "主なファイル"]}
        columnAlign={["left", "left", "left"]}
        rows={[
          [
            "Presentation",
            "画面・ユーザー操作",
            "src/app/, src/components/",
          ],
          [
            "Client State",
            "UI 設定・フォーム下書き・通知",
            "src/stores/ui-store.ts, task-draft-store.ts",
          ],
          [
            "Server State",
            "API データの取得・キャッシュ・Mutation",
            "src/hooks/use-tasks.ts, use-users.ts",
          ],
          [
            "API",
            "REST 風 Route Handlers",
            "src/app/api/tasks/, users/",
          ],
          ["Persistence", "インメモリ配列", "src/lib/mock-data.ts"],
        ]}
        striped
      />
      <CollapsibleSection title="providers/query-provider.tsx" defaultOpen={false}>
        <Text>
          アプリ全体を `QueryClientProvider` で包み、左下に React Query
          DevTools を表示します。クエリのデフォルトは `retry: 1`、ウィンドウフォーカス時に
          refetch します。
        </Text>
      </CollapsibleSection>
    </Stack>
  );
}

function DataFlowSection() {
  const theme = useHostTheme();
  const flows = [
    {
      title: "1. タスク一覧の読み込み",
      steps: [
        "TaskList が useTasks() を呼ぶ",
        "useUIStore から filters を取得し queryKey に含める",
        "GET /api/tasks?cursor=&limit=10&status=…",
        "mock-data の tasks をフィルタ・ソート・スライス",
        "useInfiniteQuery が pages に蓄積、IntersectionObserver で次ページ",
      ],
    },
    {
      title: "2. ステータス更新（楽観的更新）",
      steps: [
        "TaskCard のクリック → useUpdateTask().mutate()",
        "onMutate: キャッシュを即時更新（UI が先に変わる）",
        "PATCH /api/tasks/[id]（15% で 500 エラー）",
        "onError: previousData でロールバック + エラー通知",
        "onSettled: taskKeys.lists() で invalidate",
      ],
    },
    {
      title: "3. タスク作成",
      steps: [
        "TaskForm → useCreateTask().mutate(draft)",
        "POST /api/tasks → mock-data に unshift",
        "onSuccess: invalidate + resetDraft() + 成功通知",
      ],
    },
  ];

  return (
    <Stack gap={20}>
      {flows.map((flow) => (
        <Stack key={flow.title} gap={8}>
          <H3>{flow.title}</H3>
          <Stack gap={4}>
            {flow.steps.map((step, i) => (
              <Row key={step} gap={10} align="start">
                <Text
                  size="small"
                  tone="tertiary"
                  style={{
                    minWidth: 20,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {i + 1}.
                </Text>
                <Text>{step}</Text>
              </Row>
            ))}
          </Stack>
          {flow.title.startsWith("2.") && (
            <div
              style={{
                borderLeft: `3px solid ${theme.accent.primary}`,
                paddingLeft: 12,
              }}
            >
              <Text size="small" tone="secondary">
                Zustand（通知）と TanStack Query（キャッシュ）が Mutation
                ライフサイクルで連携する代表的なパターンです。
              </Text>
            </div>
          )}
        </Stack>
      ))}
    </Stack>
  );
}

function StateSection() {
  return (
    <Stack gap={16}>
      <Grid columns={2} gap={12}>
        <Card>
          <CardHeader>ui-store（Zustand）</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text size="small">フィルター、サイドバー、選択中タスク、テーマ</Text>
              <Text size="small" tone="secondary">
                Step 3: immer / persist / devtools / subscribeWithSelector
              </Text>
              <Text size="small" tone="secondary">
                Step 4: 通知 + subscribe による 3 秒自動削除
              </Text>
            </Stack>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>task-draft-store</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text size="small">作成フォームの draft / isValid</Text>
              <Text size="small" tone="secondary">
                Step 5 で updateDraft / resetDraft を実装
              </Text>
              <Text size="small" tone="secondary">
                Step 9 の onSuccess で resetDraft と連携
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>
      <Table
        headers={["データ", "管理", "更新タイミング"]}
        rows={[
          ["タスク一覧", "TanStack Query キャッシュ", "fetch / mutate / invalidate"],
          ["ユーザー一覧", "TanStack Query", "初回 fetch、staleTime 10分"],
          ["フィルター・UI", "Zustand + localStorage", "ユーザー操作"],
          ["フォーム下書き", "Zustand（メモリのみ）", "入力・送信後リセット"],
        ]}
        striped
      />
    </Stack>
  );
}

function ApiSection() {
  return (
    <Table
      headers={["メソッド", "パス", "説明", "遅延"]}
      columnAlign={["left", "left", "left", "right"]}
      rows={[
        ["GET", "/api/tasks", "cursor + filters でページネーション", "~500ms"],
        ["POST", "/api/tasks", "新規タスク作成", "~800ms"],
        ["PATCH", "/api/tasks/[id]", "更新（15% で 500）", "~600ms"],
        ["DELETE", "/api/tasks/[id]", "削除", "~400ms"],
        ["GET", "/api/users", "担当者一覧", "—"],
      ]}
      striped
    />
  );
}

function ExercisesSection() {
  return (
    <Stack gap={12}>
      <Text>
        詳細手順は `src/exercises/README.md`（Step 1〜9）。下表はファイルと Step
        の対応です。
      </Text>
      <Table
        headers={["Step", "テーマ", "主な編集ファイル"]}
        rows={[
          ["2–4", "Zustand UI", "src/stores/ui-store.ts"],
          ["5", "フォーム下書き", "src/stores/task-draft-store.ts"],
          ["6", "useInfiniteQuery", "src/hooks/use-tasks.ts"],
          ["7", "無限スクロール", "src/components/task-list.tsx"],
          ["8", "楽観的更新", "use-tasks.ts + task-list.tsx"],
          ["9", "タスク作成", "use-tasks.ts + task-form.tsx"],
        ]}
        striped
      />
      <Callout tone="neutral" title="テスト">
        <Text>`npm test` — ex3 / ex5 は演習完了後にパスします。</Text>
      </Callout>
    </Stack>
  );
}

function ReferencesSection() {
  return (
    <Stack gap={8}>
      <Text>
        • ルート README: `README.md`
      </Text>
      <Text>
        • 演習ガイド: `src/exercises/README.md`
      </Text>
      <Text>
        • 模範解答: `src/solutions/`
      </Text>
      <Text>
        • 型定義: `src/types/index.ts`
      </Text>
      <Divider />
      <Text tone="secondary" size="small">
        ノードをクリックするとアーキテクチャ図でコンポーネントの詳細が表示されます。目次のボタンでセクションを切り替えられます。
      </Text>
    </Stack>
  );
}

function SectionBody({ section }: { section: SectionId }) {
  switch (section) {
    case "overview":
      return <OverviewSection />;
    case "architecture":
      return null;
    case "layers":
      return <LayersSection />;
    case "dataflow":
      return <DataFlowSection />;
    case "state":
      return <StateSection />;
    case "api":
      return <ApiSection />;
    case "exercises":
      return <ExercisesSection />;
    case "references":
      return <ReferencesSection />;
    default:
      return <OverviewSection />;
  }
}

export default function ArchitectureCanvas() {
  const [section, setSection] = useCanvasState<SectionId>("section", "overview");
  const [selectedNode, setSelectedNode] = useCanvasState<ArchNodeId | null>(
    "selectedNode",
    null,
  );
  const [showDetail, setShowDetail] = useCanvasState("showDetail", true);

  return (
    <Stack gap={24} style={{ maxWidth: 960, margin: "0 auto", padding: "8px 4px 32px" }}>
      <Stack gap={8}>
        <H1>Zustand + TanStack Query 学習アプリ</H1>
        <Text tone="secondary">
          リポジトリの対話型アーキテクチャ図 — ノードをクリックして詳細を表示
        </Text>
      </Stack>

      <TableOfContents active={section} onNavigate={setSection} />

      <Divider />

      {section === "architecture" ? (
        <Stack gap={16}>
          <H2>アーキテクチャ図</H2>
          <Text tone="secondary">
            上から下へ依存の流れ。破線のエッジはレイアウト上の循環参照（例:
            Mutation → ui-store）です。
          </Text>
          <ArchitectureDAG
            selectedId={selectedNode}
            onSelect={(id) => {
              setSelectedNode(id);
              if (id) setShowDetail(true);
            }}
          />
          {selectedNode && showDetail && (
            <NodeDetail nodeId={selectedNode} />
          )}
        </Stack>
      ) : (
        <Stack gap={12}>
          <H2>{TOC.find((t) => t.id === section)?.label ?? section}</H2>
          <SectionBody section={section} />
        </Stack>
      )}

      {section !== "exercises" && section !== "overview" && (
        <>
          <Divider />
          <Row gap={8}>
            <Button
              variant="ghost"
              onClick={() => {
                const idx = TOC.findIndex((t) => t.id === section);
                if (idx > 0) setSection(TOC[idx - 1].id);
              }}
            >
              前へ
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                const idx = TOC.findIndex((t) => t.id === section);
                if (idx < TOC.length - 1) setSection(TOC[idx + 1].id);
              }}
            >
              次へ
            </Button>
            <Spacer />
            <Button variant="secondary" onClick={() => setSection("architecture")}>
              図を見る
            </Button>
          </Row>
        </>
      )}
    </Stack>
  );
}
