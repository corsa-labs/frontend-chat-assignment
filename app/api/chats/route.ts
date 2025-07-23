import { NextRequest, NextResponse } from "next/server";
import { IChat, IChatPreview, IChatsResponse } from "@/app/types";
import { chats } from "@/app/db";

function mapChatToPreview(chat: IChat): IChatPreview {
  const lastMessage = chat.messages[chat.messages.length - 1];

  return {
    id: chat.id,
    contactName: chat.contactName,
    contactImage: chat.contactImage,
    lastMessage: lastMessage.content,
    lastMessageTimestamp: lastMessage.timestamp,
  };
}

function filterChatsBySearch(chats: IChat[], searchTerm: string): IChat[] {
  const lowerSearchTerm = searchTerm.toLowerCase();

  return chats.filter((chat) => {
    if (chat.contactName.toLowerCase().includes(lowerSearchTerm)) {
      return true;
    }

    return chat.messages.some((message) =>
      message.content.toLowerCase().includes(lowerSearchTerm)
    );
  });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const search = searchParams.get("search") || "";

  if (page < 1 || pageSize < 1) {
    return NextResponse.json(
      { error: "Invalid page or pageSize parameters" },
      { status: 400 }
    );
  }

  let filteredChats = chats;
  if (search.trim()) {
    filteredChats = filterChatsBySearch(chats, search.trim());
  }

  const totalChats = filteredChats.length;
  const totalPages = Math.ceil(totalChats / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedChats = filteredChats.slice(startIndex, endIndex);

  const chatPreviews: IChatPreview[] = paginatedChats.map(mapChatToPreview);

  chatPreviews.sort((a, b) => {
    return (
      new Date(b.lastMessageTimestamp).getTime() -
      new Date(a.lastMessageTimestamp).getTime()
    );
  });

  const response: IChatsResponse = {
    chats: chatPreviews,
    meta: {
      totalChats,
      page,
      pageSize,
      totalPages,
    },
  };

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return NextResponse.json(response);
}
