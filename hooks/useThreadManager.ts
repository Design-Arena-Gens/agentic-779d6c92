/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useState } from "react";
import { nanoid } from "nanoid";
import type { AgentStatus, ChatMessage, ChatThread, ConversationMode } from "@/types/chat";

const STORAGE_KEY = "nova-assistant-threads";
const STATUS_KEY = "nova-assistant-status";

const bootstrapThread = (): ChatThread => {
  const now = new Date().toISOString();
  return {
    id: nanoid(),
    title: "New Strategy",
    mode: "offline",
    createdAt: now,
    updatedAt: now,
    messages: [
      {
        id: nanoid(),
        role: "assistant",
        content:
          "Welcome to the Nova AI Assistant. Switch between offline and hybrid online mode, spin up parallel threads, and I will orchestrate the best plan for you.",
        createdAt: now
      }
    ]
  };
};

export const useThreadManager = () => {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [status, setStatus] = useState<AgentStatus>({
    mode: "offline",
    isProcessing: false,
    lastError: null
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const rawThreads = window.localStorage.getItem(STORAGE_KEY);
    const rawStatus = window.localStorage.getItem(STATUS_KEY);
    if (rawThreads) {
      try {
        const parsed = JSON.parse(rawThreads) as ChatThread[];
        if (parsed.length) {
          setThreads(parsed);
          setActiveThreadId(parsed[0].id);
        } else {
          const bootstrap = bootstrapThread();
          setThreads([bootstrap]);
          setActiveThreadId(bootstrap.id);
        }
      } catch {
        const bootstrap = bootstrapThread();
        setThreads([bootstrap]);
        setActiveThreadId(bootstrap.id);
      }
    } else {
      const bootstrap = bootstrapThread();
      setThreads([bootstrap]);
      setActiveThreadId(bootstrap.id);
    }
    if (rawStatus) {
      try {
        setStatus(JSON.parse(rawStatus) as AgentStatus);
      } catch {
        // ignore corrupt status payload
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STATUS_KEY, JSON.stringify(status));
  }, [status]);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? null,
    [threads, activeThreadId]
  );

  const createThread = useCallback((mode: ConversationMode) => {
    const now = new Date().toISOString();
    const thread: ChatThread = {
      id: nanoid(),
      title: "Untitled Playbook",
      mode,
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: nanoid(),
          role: "assistant",
          content:
            "New thread ready. Describe the scenario and I will assemble the best set of recommendations.",
          createdAt: now
        }
      ]
    };
    setThreads((prev) => [thread, ...prev]);
    setActiveThreadId(thread.id);
    setStatus((prev) => ({ ...prev, mode }));
  }, []);

  const deleteThread = useCallback((id: string) => {
    setThreads((prev) => {
      const updated = prev.filter((thread) => thread.id !== id);
      if (!updated.length) {
        const bootstrap = bootstrapThread();
        setActiveThreadId(bootstrap.id);
        return [bootstrap];
      }
      if (activeThreadId === id) {
        setActiveThreadId(updated[0].id);
      }
      return updated;
    });
  }, [activeThreadId]);

  const renameThread = useCallback((id: string, title: string) => {
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === id
          ? {
              ...thread,
              title,
              updatedAt: new Date().toISOString()
            }
          : thread
      )
    );
  }, []);

  const appendMessage = useCallback((threadId: string, message: ChatMessage) => {
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              messages: [...thread.messages, message],
              title:
                thread.messages.length === 1 && message.role === "user"
                  ? message.content.slice(0, 60)
                  : thread.title,
              updatedAt: new Date().toISOString()
            }
          : thread
      )
    );
  }, []);

  const setMode = useCallback((mode: ConversationMode) => {
    setStatus((prev) => ({ ...prev, mode }));
    if (!activeThreadId) return;
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === activeThreadId
          ? {
              ...thread,
              mode
            }
          : thread
      )
    );
  }, [activeThreadId]);

  const setProcessing = useCallback((isProcessing: boolean, lastError?: string | null) => {
    setStatus((prev) => ({ ...prev, isProcessing, lastError: lastError ?? null }));
  }, []);

  return {
    threads,
    activeThread,
    activeThreadId,
    status,
    setActiveThreadId,
    createThread,
    deleteThread,
    renameThread,
    appendMessage,
    setMode,
    setProcessing
  };
};
