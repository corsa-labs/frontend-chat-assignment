/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IChat, IChatPreview } from "./types";
import { useChat, useChats } from "./lib/hooks";
import Spinner from "./components/spinner";
import { useDebouncedCallback } from "use-debounce";

const PAGE_SIZE = 15;

export default function Home() {
  const initialFetch = useRef(false);
  const chatsRef = useRef<HTMLDivElement>(null);
  const [chats, setChats] = useState<IChatPreview[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSearch, setCurrentSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalChats, setTotalChats] = useState(0);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<IChat | null>(null);

  const { loading, handleGetChats } = useChats();
  const { loading: chatLoading, handleGetChat } = useChat();

  const fetchChats = useCallback(
    async (page = currentPage, search?: string) => {
      if (loading) return;
      const newSearch = search !== currentSearch;
      const response = await handleGetChats(page, PAGE_SIZE, search);
      setChats((prev) => [...(!newSearch ? prev : []), ...response.chats]);
      if (newSearch) setCurrentPage(1);
      setTotalPages(response.meta.totalPages);
      setTotalChats(response.meta.totalChats);
    },
    [currentPage, loading, currentSearch, handleGetChats]
  );

  const fetchChat = useCallback(
    async (chatId: string) => {
      if (chatLoading) return;
      const newChat = await handleGetChat(chatId);
      setSelectedChat(newChat);
    },
    [chatLoading, handleGetChat]
  );

  const performSearch = useDebouncedCallback(async (search: string) => {
    setIsSearching(true);
    setCurrentSearch(search);
    await fetchChats(1, search);
    setIsSearching(false);
  }, 200);

  const nextPage = useCallback(() => {
    if (loading || currentPage >= totalPages) return;
    const newPage = currentPage + 1;
    setCurrentPage(newPage);
    fetchChats(newPage, currentSearch);
  }, [currentPage, currentSearch, fetchChats, loading, totalPages]);

  useEffect(() => {
    if (!initialFetch.current) {
      fetchChats();
      initialFetch.current = true;
    }
  }, [fetchChats]);

  useEffect(() => {
    const handleScroll = () => {
      const el = chatsRef.current;
      if (
        el &&
        el.scrollHeight - el.scrollTop <= el.clientHeight &&
        !loading &&
        currentPage < totalPages
      ) {
        nextPage();
      }
    };

    const el = chatsRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (el) {
        el.removeEventListener("scroll", handleScroll);
      }
    };
  }, [
    chatsRef,
    loading,
    currentPage,
    totalPages,
    fetchChats,
    currentSearch,
    nextPage,
  ]);

  useEffect(() => {
    if (selectedChatId && !chatLoading && selectedChatId !== selectedChat?.id) {
      fetchChat(selectedChatId);
    }
  }, [selectedChatId, fetchChat, chatLoading, selectedChat?.id]);

  return (
    <div className="h-screen w-screen bg-white flex text-gray-950 overflow-hidden">
      <div className="w-[19.5rem] bg-white flex flex-col shrink-0 border-e border-gray-200">
        <div className="flex items-center justify-center border-b border-gray-100 p-4">
          <div className="relative w-full">
            <input
              name="search"
              type="text"
              className="px-3 w-full border border-gray-200 rounded-full text-sm placeholder:text-gray-400 h-[2.625rem]"
              placeholder="Search..."
              onChange={(e) => performSearch(e.target.value)}
            />
            {isSearching && (
              <div className="absolute end-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                <Spinner />
              </div>
            )}
          </div>
        </div>
        <div ref={chatsRef} className="flex flex-col overflow-y-auto p-4">
          {chats.map((chat) => (
            <button
              key={chat.id}
              className={`text-sm flex gap-2.5 h-[4.5625rem] cursor-pointer items-center hover:bg-gray-50 text-start p-2.5 rounded-md overflow-hidden shrink-0 ${
                selectedChatId === chat.id ? "bg-gray-100" : ""
              }`}
              onClick={() => setSelectedChatId(chat.id)}
            >
              <img
                src={chat.contactImage}
                alt={chat.contactName}
                className="w-10 h-10 rounded-full shrink-0"
              />
              <div className="flex flex-col w-full truncate">
                <div className="flex justify-between items-center">
                  <span className="font-semibold truncate">
                    {chat.contactName}
                  </span>
                  <span className="text-gray-500">
                    {new Date(chat.lastMessageTimestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-gray-500 truncate w-full">
                  {chat.lastMessage}
                </div>
              </div>
            </button>
          ))}
          {loading && !isSearching && (
            <div className="flex justify-center items-center h-[4.5625rem] gap-1.5 text-gray-500 shrink-0 text-sm font-medium">
              <Spinner />
              Loading more chats...
            </div>
          )}
        </div>
      </div>
      <div className="w-full bg-gray-50">
        {!selectedChatId && (
          <div className="flex justify-center items-center h-full">
            <div className="text-gray-500 text-sm font-medium flex flex-col justify-center items-center gap-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-message-square-icon lucide-message-square"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Select a chat from the sidebar</span>
            </div>
          </div>
        )}
        {chatLoading && (
          <div className="flex justify-center items-center h-full">
            <Spinner />
          </div>
        )}
        {selectedChat && (
          <div className="flex flex-col h-full">
            <div className="flex items-center p-4 border-b border-gray-200 bg-gray-100 gap-2.5">
              <img
                src={selectedChat.contactImage || ""}
                alt={selectedChat.contactName}
                className="w-10 h-10 rounded-full shrink-0"
              />
              <span className="font-semibold">{selectedChat.contactName}</span>
            </div>
            <div className="flex flex-col p-4 h-full gap-4">
              {selectedChat.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex flex-col gap-2.5 p-2.5 rounded-lg shadow-sm ${
                      message.sender === "user"
                        ? "bg-green-500 text-white"
                        : "bg-white"
                    }`}
                  >
                    <span>{message.content}</span>
                    <div className="text-xs text-end opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center p-4  gap-2.5">
              <div className="relative w-full">
                <input
                  type="text"
                  className="w-full border border-gray-200 bg-white rounded-full text-sm placeholder:text-gray-400 h-[4rem] shrink-0 px-4 shadow"
                  placeholder="Type a message..."
                />
                <button className="size-[2.75rem] bg-green-500  text-white rounded-full flex justify-center items-center absolute end-3 top-1/2 -translate-y-1/2 cursor-pointer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-send-horizontal-icon lucide-send-horizontal"
                  >
                    <path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z" />
                    <path d="M6 12h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

{
  /* <div className="flex justify-center items-center min-h-screen flex-col">
      total chats: {totalChats} <br />
      total pages: {totalPages} <br />
      current page: {currentPage} <br />
      current search: {currentSearch} <br />
      <input
        type="text"
        value={currentSearch}
        onChange={(e) => {
          setCurrentSearch(e.target.value);
          fetchChats(1, e.target.value);
        }}
      />
      <button
        disabled={loading || currentPage >= totalPages}
        onClick={() => {
          const newPage = currentPage + 1;
          setCurrentPage(newPage);
          fetchChats(newPage, currentSearch);
        }}
      >
        {!loading ? "next" : "loading..."}
      </button>
      <div className="flex flex-col">
        {chats.map((chat) => (
          <div key={chat.id}>
            {chat.id}-{chat.contactName}
          </div>
        ))}
      </div>
    </div> */
}
