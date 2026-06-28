export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatCompletionResult = {
  content: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  raw: unknown;
};

export type JsonResponseFormat = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

function requiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export async function callOpenAIChat(input: {
  model: string;
  messages: ChatMessage[];
  responseFormat?: JsonResponseFormat;
  timeoutMs?: number;
}): Promise<ChatCompletionResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), input.timeoutMs ?? 20000);
  const instructions = input.messages.filter((message) => message.role === "system").map((message) => message.content).join("\n\n");
  const messages = input.messages.filter((message) => message.role !== "system");

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${requiredEnv("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: input.model,
        instructions,
        input: messages,
        store: false,
        reasoning: { effort: Deno.env.get("OPENAI_REASONING_EFFORT") || "low" },
        text: {
          format: input.responseFormat
            ? {
                type: "json_schema",
                name: input.responseFormat.name,
                schema: input.responseFormat.schema,
                strict: input.responseFormat.strict ?? true,
              }
            : { type: "json_object" },
          verbosity: "medium",
        },
      }),
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = typeof json?.error?.message === "string" ? json.error.message : "OpenAI request failed";
      throw new Error(message);
    }

    const content = extractOutputText(json);
    if (typeof content !== "string") throw new Error("OpenAI response missing content");

    return {
      content,
      usage: {
        prompt_tokens: json?.usage?.input_tokens,
        completion_tokens: json?.usage?.output_tokens,
        total_tokens: json?.usage?.total_tokens,
      },
      raw: json,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function extractOutputText(json: any) {
  if (typeof json?.output_text === "string") return json.output_text;
  for (const item of json?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === "string") return content.text;
    }
  }
  return undefined;
}

export async function embedText(text: string): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requiredEnv("OPENAI_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: Deno.env.get("OPENAI_EMBEDDING_MODEL") || "text-embedding-3-small",
      input: text,
    }),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof json?.error?.message === "string" ? json.error.message : "Embedding request failed";
    throw new Error(message);
  }

  const embedding = json?.data?.[0]?.embedding;
  if (!Array.isArray(embedding)) throw new Error("Embedding response missing vector");
  return embedding;
}
