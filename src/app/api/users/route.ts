import { NextResponse } from "next/server";
import { users } from "@/lib/mock-data";

export async function GET() {
  await new Promise((r) => setTimeout(r, 300));
  return NextResponse.json(users);
}
