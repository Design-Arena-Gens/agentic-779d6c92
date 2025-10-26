import { NextResponse } from "next/server";

interface ChatPayload {
  threadId: string;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  temperature?: number;
}

const SYSTEM_PROMPT = `You are Nova, an elite assistant orchestrator. Combine rigorous planning with pragmatic execution.
- Always provide concise, structured answers.
- Surface key risks, recommended tools, and next steps.
- When the user asks for implementation help, supply code snippets with context.
- If information is missing, request it before proceeding.
- Respect offline constraints when the user calls that out.`;

export async function POST(request: Request) {
  let payload: ChatPayload;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json(
      {
        error: "invalid_request",
        message: "Body must be valid JSON."
      },
      { status: 400 }
    );
  }

  if (!payload.threadId || !Array.isArray(payload.messages)) {
    return NextResponse.json(
      {
        error: "invalid_payload",
        message: "Thread id and message history are required."
      },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...payload.messages.map((message) => ({
      role: message.role,
      content: message.content
    }))
  ];

  if (!apiKey) {
    return NextResponse.json(
      {
        offlineOnly: true,
        content:
          "Online mode is not configured. Provide an OPENAI_API_KEY environment variable to unlock hybrid reasoning.",
        usage: null
      },
      { status: 200 }
    );
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: payload.temperature ?? 0.2
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI error", error);
      return NextResponse.json(
        {
          error: "upstream_failure",
          message: "Failed to reach OpenAI. Check API keys or rate limits.",
          details: error
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content: string =
      data.choices?.[0]?.message?.content ??
      "I could not craft a response. Please retry with a more specific instruction.";

    return NextResponse.json(
      {
        offlineOnly: false,
        content,
        usage: data.usage ?? null
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Chat route error", error);
    return NextResponse.json(
      {
        error: "network_error",
        message: "Unexpected error calling the upstream model.",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
