"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IChatPreview } from "./types";
import { useChats } from "./lib/hooks";

const PAGE_SIZE = 15;

export default function Home() {
  const initialFetch = useRef(false);
  const [chats, setChats] = useState<IChatPreview[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const { loading, error, handleGetChats } = useChats();

  const fetchChats = useCallback(
    async (page = currentPage) => {
      const response = await handleGetChats(page, PAGE_SIZE, search);
      setChats((prev) => [...prev, ...response.chats]);
    },
    [currentPage, handleGetChats, search]
  );

  useEffect(() => {
    if (!initialFetch.current) {
      fetchChats();
      initialFetch.current = true;
    }
  }, [fetchChats]);

  return (
    <div className="flex justify-center items-center h-screen">
      <button
        onClick={() => {
          const newPage = currentPage + 1;
          setCurrentPage(newPage);
          fetchChats(newPage);
        }}
      >
        next
      </button>
      <div className="flex flex-col">
        {chats.map((chat) => (
          <div key={chat.id}>{chat.contactName}</div>
        ))}
      </div>
    </div>
  );
}
