import { NextRequest, NextResponse } from "next/server";
import { tasks, generateTaskId } from "@/lib/mock-data";
import { Task } from "@/types";

// ページネーション付きタスク一覧（Infinite Query用）
export async function GET(request: NextRequest) {
  await new Promise((r) => setTimeout(r, 500));

  const { searchParams } = request.nextUrl;
  const cursor = parseInt(searchParams.get("cursor") || "0");
  const limit = parseInt(searchParams.get("limit") || "10");
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");

  let filtered = [...tasks];
  if (status && status !== "all") {
    filtered = filtered.filter((t) => t.status === status);
  }
  if (priority && priority !== "all") {
    filtered = filtered.filter((t) => t.priority === priority);
  }

  // createdAtの降順
  filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const start = cursor;
  const end = start + limit;
  const items = filtered.slice(start, end);
  const nextCursor = end < filtered.length ? end : null;

  return NextResponse.json({
    items,
    nextCursor,
    totalCount: filtered.length,
  });
}

// タスク作成
export async function POST(request: NextRequest) {
  await new Promise((r) => setTimeout(r, 800));

  const body = await request.json();
  const newTask: Task = {
    id: generateTaskId(),
    title: body.title,
    description: body.description || "",
    status: "todo",
    priority: body.priority || "medium",
    assigneeId: body.assigneeId || null,
    createdAt: new Date().toISOString(),
  };

  tasks.unshift(newTask);
  return NextResponse.json(newTask, { status: 201 });
}
