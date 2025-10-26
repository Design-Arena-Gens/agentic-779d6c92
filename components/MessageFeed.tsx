"use client";

import { format } from "date-fns";
import type { ChatMessage } from "@/types/chat";

interface MessageFeedProps {
  messages: ChatMessage[];
  isProcessing: boolean;
}

const formatTimestamp = (iso: string) => format(new Date(iso), "HH:mm");

export const MessageFeed = ({ messages, isProcessing }: MessageFeedProps) => {
  return (
    <div className="chat-stream">
      {messages.map((message) => (
        <div key={message.id} className={`message ${message.role}`}>
          <div className="message-bubble">
            <div className="chip" style={{ marginBottom: "8px" }}>
              <strong>{message.role === "user" ? "Operator" : "Nova"}</strong>
              {formatTimestamp(message.createdAt)}
            </div>
            <div>{message.content}</div>
            {message.annotations?.length ? (
              <div className="insight-grid" style={{ marginTop: "12px" }}>
                {message.annotations.map((note, index) => (
                  <div key={index} className="insight-card">
                    <p>{note}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ))}
      {isProcessing && (
        <div className="loading-indicator" style={{ padding: "12px 0" }}>
          <span />
          <span />
          <span />
          Synthesizing strategy...
        </div>
      )}
    </div>
  );
};
