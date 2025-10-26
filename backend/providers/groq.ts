import Groq from "groq-sdk";

export type ChatRole = "system" | "user" | "assistant";
export type ChatMessage = { role: ChatRole; content: string };

export interface ChatParams {
  model: string;                // e.g. "llama-3.1-70b" (or your chosen ID)
  temperature?: number;         // default 0.2
  top_p?: number;               // default 0.9
  max_tokens?: number;          // default 1000
  timeoutMs?: number;           // default 10000
}

export interface ChatResult {
  text: string;
  latencyMs: number;
  tokensIn?: number;
  tokensOut?: number;
  model: string;
}

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  maxRetries: 3,
});

export async function listGroqModels(): Promise<Array<{ id: string }>> {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set");
  const list = await (client as any).models.list();
  const data = (list?.data ?? []) as Array<{ id: string }>;
  return data.map((m) => ({ id: m.id }));
}

export async function groqChatOnce(
  messages: ChatMessage[],
  params: ChatParams
): Promise<ChatResult> {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set");
  const start = Date.now();
  const resp = await client.chat.completions.create(
    {
      model: params.model,
      messages,
      temperature: params.temperature ?? 0.2,
      top_p: params.top_p ?? 0.9,
      max_tokens: params.max_tokens ?? 1000,
      stream: false,
    },
    { timeout: params.timeoutMs ?? 10_000 }
  );
  const text = resp.choices?.[0]?.message?.content ?? "";
  const latencyMs = Date.now() - start;
  const tokensIn = (resp as any)?.usage?.prompt_tokens;
  const tokensOut = (resp as any)?.usage?.completion_tokens;
  return { text, latencyMs, tokensIn, tokensOut, model: params.model };
}

export async function groqChatStream(
  messages: ChatMessage[],
  params: ChatParams,
  onDelta: (textDelta: string) => void
): Promise<{ model: string; latencyMs: number }> {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set");
  const start = Date.now();
  const stream = await client.chat.completions.create(
    {
      model: params.model,
      messages,
      temperature: params.temperature ?? 0.2,
      top_p: params.top_p ?? 0.9,
      max_tokens: params.max_tokens ?? 1000,
      stream: true,
    },
    { timeout: params.timeoutMs ?? 10_000 }
  );
  for await (const chunk of stream) {
    const delta = chunk?.choices?.[0]?.delta?.content ?? "";
    if (delta) onDelta(delta);
  }
  return { model: params.model, latencyMs: Date.now() - start };
}