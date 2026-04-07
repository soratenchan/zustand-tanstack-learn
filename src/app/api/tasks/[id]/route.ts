import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@/lib/mock-data";

// タスク更新（Optimistic Update用）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 学習ポイント: たまに失敗させてOptimistic Updateのロールバックを確認
  if (Math.random() < 0.15) {
    await new Promise((r) => setTimeout(r, 1000));
    return NextResponse.json({ error: "サーバーエラー（ランダム）" }, { status: 500 });
  }

  await new Promise((r) => setTimeout(r, 600));

  const { id } = await params;
  const body = await request.json();
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  tasks[index] = { ...tasks[index], ...body };
  return NextResponse.json(tasks[index]);
}

// タスク削除
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await new Promise((r) => setTimeout(r, 400));

  const { id } = await params;
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  tasks.splice(index, 1);
  return NextResponse.json({ success: true });
}
