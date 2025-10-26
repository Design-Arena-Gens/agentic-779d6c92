export type ConversationMode = "offline" | "online-hybrid";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  annotations?: string[];
}

export interface ChatThread {
  id: string;
  title: string;
  mode: ConversationMode;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface AgentStatus {
  mode: ConversationMode;
  isProcessing: boolean;
  lastError?: string | null;
}
