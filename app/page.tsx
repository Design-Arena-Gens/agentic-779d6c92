"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { ThreadSidebar } from "@/components/ThreadSidebar";
import { MessageFeed } from "@/components/MessageFeed";
import { ChatComposer } from "@/components/ChatComposer";
import { InsightPanel } from "@/components/InsightPanel";
import { useThreadManager } from "@/hooks/useThreadManager";
import type { ChatMessage, ConversationMode } from "@/types/chat";
import { runOfflineAgent, type OfflineResponse } from "@/lib/offlineAgent";

interface UsageStats {
  totalTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
}

const serializeUsage = (usage: UsageStats | null): string | null => {
  if (!usage) return null;
  const parts: string[] = [];
  if (usage.totalTokens) parts.push(`Total ${usage.totalTokens}`);
  if (usage.promptTokens) parts.push(`Prompt ${usage.promptTokens}`);
  if (usage.completionTokens) parts.push(`Completion ${usage.completionTokens}`);
  return parts.join(" • ");
};

export default function HomePage() {
  const {
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
  } = useThreadManager();
  const [draft, setDraft] = useState("");
  const [insightMap, setInsightMap] = useState<Record<string, OfflineResponse | null>>({});
  const [usage, setUsage] = useState<string | null>(null);

  useEffect(() => {
    if (activeThread) {
      setDraft("");
    }
  }, [activeThreadId, activeThread]);

  const submitMessage = useCallback(async () => {
    if (!activeThread || !draft.trim()) {
      return;
    }

    const payload = draft.trim();
    const timestamp = new Date().toISOString();
    const userMessage: ChatMessage = {
      id: nanoid(),
      role: "user",
      content: payload,
      createdAt: timestamp
    };

    appendMessage(activeThread.id, userMessage);
    setDraft("");
    setProcessing(true);
    setUsage(null);

    const resolveOffline = (opts?: { error?: string }) => {
      const offline = runOfflineAgent(payload);
      const assistantMessage: ChatMessage = {
        id: nanoid(),
        role: "assistant",
        content: [
          "### Tactical Synthesis",
          offline.synthesis,
          "",
          "**Strategic Reasoning**",
          offline.reasoning,
          "",
          "**Recommended Actions**",
          offline.actionable.map((item) => `- ${item}`).join("\n")
        ].join("\n"),
        createdAt: new Date().toISOString(),
        annotations: offline.actionable
      };
      appendMessage(activeThread.id, assistantMessage);
      setInsightMap((prev) => ({ ...prev, [activeThread.id]: offline }));
      setProcessing(false, opts?.error ?? null);
    };

    if (activeThread.mode === "offline") {
      resolveOffline();
      return;
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          threadId: activeThread.id,
          messages: activeThread.messages.concat(userMessage).map((message) => ({
            role: message.role,
            content: message.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();

      if (data.offlineOnly) {
        resolveOffline({ error: "Hybrid mode unavailable, reverting to offline intelligence." });
        return;
      }

      const assistantMessage: ChatMessage = {
        id: nanoid(),
        role: "assistant",
        content: data.content ?? "I could not generate a response.",
        createdAt: new Date().toISOString()
      };
      appendMessage(activeThread.id, assistantMessage);
      setInsightMap((prev) => ({ ...prev, [activeThread.id]: null }));
      setUsage(serializeUsage(data.usage ?? null));
      setProcessing(false, null);
    } catch (error) {
      console.error("Hybrid mode failed, reverting offline", error);
      resolveOffline({
        error: "Hybrid call failed. Response synthesized from offline knowledge base."
      });
    }
  }, [activeThread, draft, appendMessage, setProcessing]);

  const handleModeChange = useCallback(
    (mode: ConversationMode) => {
      setMode(mode);
    },
    [setMode]
  );

  const activeInsights = useMemo(
    () => (activeThread ? insightMap[activeThread.id] ?? null : null),
    [activeThread, insightMap]
  );

  return (
    <div className="app-shell">
      <ThreadSidebar
        threads={threads}
        activeThreadId={activeThreadId}
        status={status}
        onSelect={setActiveThreadId}
        onCreate={createThread}
        onDelete={deleteThread}
        onRename={renameThread}
        onModeChange={handleModeChange}
      />

      <main className="main">
        {activeThread ? (
          <>
            <header className="chat-header">
              <h2>{activeThread.title}</h2>
              <div className="chip">
                <strong>Mode</strong>{" "}
                {activeThread.mode === "offline" ? "Offline Knowledge Pack" : "Hybrid Online"}
              </div>
              {usage ? <div className="chip">Usage {usage}</div> : null}
              {status.lastError ? <div className="chip">{status.lastError}</div> : null}
            </header>
            <MessageFeed messages={activeThread.messages} isProcessing={status.isProcessing} />
            <ChatComposer
              value={draft}
              disabled={status.isProcessing}
              onChange={setDraft}
              onSubmit={submitMessage}
              placeholder="Tell Nova what to orchestrate..."
            />
            <InsightPanel response={activeInsights} />
          </>
        ) : (
          <div className="empty-state">
            Spawn a thread to begin orchestrating plans. Nova can operate fully offline or augment
            plans with live model calls.
          </div>
        )}
      </main>
    </div>
  );
}
