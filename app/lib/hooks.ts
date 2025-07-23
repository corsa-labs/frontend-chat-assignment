"use client";

import { useState } from "react";

export const useChats = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetChats = async (
    page: number,
    pageSize: number,
    search?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/chats?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(
          search || ""
        )}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    handleGetChats,
  };
};

export const useChat = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetChat = async (chatId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/chat/${chatId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch chat");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    handleGetChat,
  };
};
