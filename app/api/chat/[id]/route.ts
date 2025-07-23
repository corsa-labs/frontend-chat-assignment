import { NextRequest, NextResponse } from "next/server";
import { chats } from "@/app/db";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const chat = chats.find((chat) => chat.id === id);

  if (!chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return NextResponse.json(chat);
}
