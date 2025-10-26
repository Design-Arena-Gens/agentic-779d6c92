"use client";

import clsx from "clsx";
import { formatDistanceToNow } from "date-fns";
import type { AgentStatus, ChatThread, ConversationMode } from "@/types/chat";

interface ThreadSidebarProps {
  threads: ChatThread[];
  activeThreadId: string | null;
  status: AgentStatus;
  onSelect: (id: string) => void;
  onCreate: (mode: ConversationMode) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onModeChange: (mode: ConversationMode) => void;
}

const formatTimestamp = (iso: string) =>
  formatDistanceToNow(new Date(iso), { addSuffix: true });

export const ThreadSidebar = ({
  threads,
  activeThreadId,
  status,
  onSelect,
  onCreate,
  onDelete,
  onRename,
  onModeChange
}: ThreadSidebarProps) => {
  return (
    <aside className="sidebar glass-panel">
      <header className="sidebar-header">
        <h1>Nova Assistant</h1>
        <span>Offline + hybrid intelligence with parallel threads.</span>
      </header>

      <div className="control-bar">
        <button
          className={clsx(status.mode === "offline" && "active")}
          onClick={() => onModeChange("offline")}
        >
          Offline Core
        </button>
        <button
          className={clsx(status.mode === "online-hybrid" && "active")}
          onClick={() => onModeChange("online-hybrid")}
        >
          Hybrid Online
        </button>
      </div>

      <button className="new-thread-btn" onClick={() => onCreate(status.mode)}>
        + Spawn Thread
      </button>

      <div className="thread-list">
        {threads.map((thread) => {
          const active = thread.id === activeThreadId;
          return (
            <article
              key={thread.id}
              className={clsx("thread-card", active && "active")}
              onClick={() => onSelect(thread.id)}
            >
              <strong>{thread.title}</strong>
              <div className="thread-meta">
                <span>
                  <span className={clsx("status-dot", thread.mode === "offline" ? "offline" : "online")} />
                  {thread.mode === "offline" ? "Offline" : "Hybrid"}
                </span>
                <span>{formatTimestamp(thread.updatedAt)}</span>
              </div>
              <div className="thread-actions" onClick={(event) => event.stopPropagation()}>
                <button
                  onClick={() => {
                    const nextTitle = prompt("Rename thread", thread.title);
                    if (nextTitle && nextTitle.trim()) {
                      onRename(thread.id, nextTitle.trim());
                    }
                  }}
                >
                  Rename
                </button>
                <button onClick={() => onDelete(thread.id)}>Archive</button>
              </div>
            </article>
          );
        })}
        {!threads.length && <p>No threads yet.</p>}
      </div>
    </aside>
  );
};
