export const allowedContextTypes = new Set([
  "general",
  "personal_message",
  "school",
  "work",
  "family",
  "travel",
  "money",
  "warning",
  "community",
  "other",
]);

export const allowedToneTypes = new Set(["neutral", "polite", "friendly", "formal", "short"]);

export const allowedLearningTypes = new Set([
  "clarity",
  "grammar",
  "word_order",
  "connector",
  "time_specificity",
  "politeness",
  "sentence_pattern",
]);

export type NormalizedInput = {
  original: string;
  normalizedForSearch: string;
  length: number;
  lineCount: number;
  hasEmoji: boolean;
  hasUrl: boolean;
  hasPhoneLikeText: boolean;
  hasEmail: boolean;
  suspectedNames: string[];
};

export type SensitiveDetectionResult = {
  hasSensitiveInfo: boolean;
  categories: string[];
  redactedText: string;
  warnings: string[];
};

export type RewriteResult = {
  rewritten_text: string;
  meaning_guess?: string;
  meaning_structure: {
    speaker: string;
    recipient: string;
    action: string;
    time: string;
    place: string;
    object: string;
    intent: string;
    politeness_level: "casual" | "polite" | "formal" | "unknown";
  };
  confidence_score: number;
  ambiguity_level: "low" | "medium" | "high";
  ambiguities: Array<{ phrase: string; why_unclear?: string; question: string }>;
  rewrite_reasons: string[];
  learning_points: Array<{
    type: string;
    title: string;
    rule_text: string;
    unclear_example?: string | null;
    clear_example?: string | null;
  }>;
  safety_notes: string[];
  should_ask_user: boolean;
};

export const rewriteResultJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "rewritten_text",
    "meaning_guess",
    "meaning_structure",
    "confidence_score",
    "ambiguity_level",
    "ambiguities",
    "rewrite_reasons",
    "learning_points",
    "safety_notes",
    "should_ask_user",
  ],
  properties: {
    rewritten_text: { type: "string" },
    meaning_guess: { type: "string" },
    meaning_structure: {
      type: "object",
      additionalProperties: false,
      required: ["speaker", "recipient", "action", "time", "place", "object", "intent", "politeness_level"],
      properties: {
        speaker: { type: "string" },
        recipient: { type: "string" },
        action: { type: "string" },
        time: { type: "string" },
        place: { type: "string" },
        object: { type: "string" },
        intent: { type: "string" },
        politeness_level: { type: "string", enum: ["casual", "polite", "formal", "unknown"] },
      },
    },
    confidence_score: { type: "number" },
    ambiguity_level: { type: "string", enum: ["low", "medium", "high"] },
    ambiguities: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["phrase", "why_unclear", "question"],
        properties: {
          phrase: { type: "string" },
          why_unclear: { type: "string" },
          question: { type: "string" },
        },
      },
    },
    rewrite_reasons: {
      type: "array",
      items: { type: "string" },
    },
    learning_points: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "title", "rule_text", "unclear_example", "clear_example"],
        properties: {
          type: {
            type: "string",
            enum: ["clarity", "grammar", "word_order", "connector", "time_specificity", "politeness", "sentence_pattern"],
          },
          title: { type: "string" },
          rule_text: { type: "string" },
          unclear_example: { type: "string" },
          clear_example: { type: "string" },
        },
      },
    },
    safety_notes: {
      type: "array",
      items: { type: "string" },
    },
    should_ask_user: { type: "boolean" },
  },
} as const;

export function normalizeInput(input: string): NormalizedInput {
  const trimmed = input.trim();
  const collapsed = trimmed.replace(/\s+/g, " ");
  return {
    original: trimmed,
    normalizedForSearch: collapsed.toLowerCase().normalize("NFC"),
    length: trimmed.length,
    lineCount: trimmed.length ? trimmed.split("\n").length : 0,
    hasEmoji: /\p{Extended_Pictographic}/u.test(trimmed),
    hasUrl: /(https?:\/\/|www\.)/i.test(trimmed),
    hasPhoneLikeText: /(\+?84|0)(\d[\s.-]?){8,10}/.test(trimmed),
    hasEmail: /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(trimmed),
    suspectedNames: [],
  };
}

export function detectSensitiveInfo(text: string): SensitiveDetectionResult {
  const categories: string[] = [];
  let redactedText = text;

  const patterns: Array<{ label: string; regex: RegExp; replacement: string }> = [
    { label: "email", regex: /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, replacement: "[email]" },
    { label: "phone", regex: /(\+?84|0)(\d[\s.-]?){8,10}/g, replacement: "[số điện thoại]" },
    { label: "url", regex: /(https?:\/\/|www\.)\S+/gi, replacement: "[liên kết]" },
    { label: "id_or_bank_number", regex: /\b\d{9,14}\b/g, replacement: "[dãy số riêng tư]" },
    { label: "social_handle", regex: /(^|\s)@[A-Za-z0-9_.]{3,}/g, replacement: " [tài khoản mạng xã hội]" },
  ];

  for (const pattern of patterns) {
    if (pattern.regex.test(text)) {
      categories.push(pattern.label);
      redactedText = redactedText.replace(pattern.regex, pattern.replacement);
    }
  }

  return {
    hasSensitiveInfo: categories.length > 0,
    categories,
    redactedText,
    warnings: categories.length ? ["Có thể có thông tin riêng tư. Không đưa nội dung này vào kho tri thức nếu chưa được ẩn danh."] : [],
  };
}

export function validateAnalyzeInput(body: unknown) {
  const input = body as { input_text?: unknown; context_type?: unknown; tone?: unknown; requested_depth?: unknown };
  if (!input || typeof input.input_text !== "string") throw new Error("INVALID_INPUT");
  const normalized = normalizeInput(input.input_text);
  if (normalized.original.length < 2) throw new Error("INPUT_TOO_SHORT");
  if (normalized.original.length > 3000) throw new Error("INPUT_TOO_LONG");

  const contextType = typeof input.context_type === "string" && allowedContextTypes.has(input.context_type) ? input.context_type : "general";
  const tone = typeof input.tone === "string" && allowedToneTypes.has(input.tone) ? input.tone : "polite";
  const requestedDepth = input.requested_depth === "careful" || input.requested_depth === "fast" ? input.requested_depth : "balanced";

  return { inputText: normalized.original, contextType, tone, requestedDepth, normalized };
}

export function estimateAmbiguityScore(text: string) {
  const normalized = text.toLowerCase();
  let score = 0;
  const vagueSignals = ["đó", "kia", "này", "chỗ cũ", "sớm", "ít hôm", "lúc nào đó", "người đó", "việc đó", "như vậy", "cái đó"];
  for (const signal of vagueSignals) if (normalized.includes(signal)) score += 0.12;
  if (text.length > 800) score += 0.25;
  if (text.split(/[,.!?;\n]/).filter(Boolean).length > 4) score += 0.15;
  if (!/[.!?]$/.test(text.trim()) && text.length > 120) score += 0.1;
  return Math.min(1, Number(score.toFixed(2)));
}

export function chooseModel(input: { inputText: string; ambiguityScore: number; hasSensitiveSignals: boolean; requestedDepth: "fast" | "balanced" | "careful" }) {
  const fast = Deno.env.get("OPENAI_FAST_MODEL") || "gpt-5.4-mini";
  const strong = Deno.env.get("OPENAI_STRONG_MODEL") || "gpt-5.5";
  if (input.requestedDepth === "careful") return strong;
  if (input.hasSensitiveSignals) return strong;
  if (input.ambiguityScore >= 0.65) return strong;
  if (input.inputText.length > 800) return strong;
  return fast;
}

export function safeParseJson(content: string) {
  try {
    return JSON.parse(content);
  } catch {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(content.slice(start, end + 1));
    throw new Error("INVALID_JSON");
  }
}

export function validateRewriteResult(value: unknown): { result?: RewriteResult; issues: string[] } {
  const issues: string[] = [];
  const input = value as Partial<RewriteResult>;

  if (!input || typeof input !== "object") return { issues: ["Output không phải object."] };
  if (typeof input.rewritten_text !== "string" || !input.rewritten_text.trim()) issues.push("Thiếu rewritten_text.");
  if (typeof input.confidence_score !== "number" || input.confidence_score < 0 || input.confidence_score > 1) issues.push("confidence_score phải trong khoảng 0-1.");

  const ambiguityLevel = input.ambiguity_level === "medium" || input.ambiguity_level === "high" ? input.ambiguity_level : "low";
  const ambiguities = Array.isArray(input.ambiguities)
    ? input.ambiguities.slice(0, 5).map((item) => ({
        phrase: typeof item?.phrase === "string" ? item.phrase.slice(0, 120) : "",
        why_unclear: typeof item?.why_unclear === "string" ? item.why_unclear.slice(0, 240) : undefined,
        question: typeof item?.question === "string" ? item.question.slice(0, 240) : "Bạn có thể nói rõ hơn chỗ này không?",
      })).filter((item) => item.question)
    : [];

  const rewriteReasons = Array.isArray(input.rewrite_reasons)
    ? input.rewrite_reasons.filter((item) => typeof item === "string" && item.trim()).slice(0, 3)
    : [];
  if (!rewriteReasons.length) issues.push("Thiếu rewrite_reasons.");

  const learningPoints = Array.isArray(input.learning_points)
    ? input.learning_points.slice(0, 3).map((point) => ({
        type: allowedLearningTypes.has(String(point?.type)) ? String(point.type) : "clarity",
        title: typeof point?.title === "string" && point.title.trim() ? point.title.slice(0, 120) : "Viết rõ ý hơn",
        rule_text: typeof point?.rule_text === "string" && point.rule_text.trim() ? point.rule_text.slice(0, 500) : "Khi viết, hãy thêm đủ bối cảnh để người đọc hiểu ý chính.",
        unclear_example: typeof point?.unclear_example === "string" ? point.unclear_example.slice(0, 500) : null,
        clear_example: typeof point?.clear_example === "string" ? point.clear_example.slice(0, 500) : null,
      }))
    : [];
  if (!learningPoints.length) issues.push("Thiếu learning_points.");

  const result: RewriteResult = {
    rewritten_text: typeof input.rewritten_text === "string" ? input.rewritten_text.trim() : "",
    meaning_guess: typeof input.meaning_guess === "string" ? input.meaning_guess.slice(0, 600) : undefined,
    meaning_structure: {
      speaker: typeof input.meaning_structure?.speaker === "string" ? input.meaning_structure.speaker.slice(0, 120) : "chưa rõ",
      recipient: typeof input.meaning_structure?.recipient === "string" ? input.meaning_structure.recipient.slice(0, 120) : "chưa rõ",
      action: typeof input.meaning_structure?.action === "string" ? input.meaning_structure.action.slice(0, 160) : "chưa rõ",
      time: typeof input.meaning_structure?.time === "string" ? input.meaning_structure.time.slice(0, 120) : "chưa rõ",
      place: typeof input.meaning_structure?.place === "string" ? input.meaning_structure.place.slice(0, 120) : "chưa rõ",
      object: typeof input.meaning_structure?.object === "string" ? input.meaning_structure.object.slice(0, 160) : "chưa rõ",
      intent: typeof input.meaning_structure?.intent === "string" ? input.meaning_structure.intent.slice(0, 200) : "chưa rõ",
      politeness_level:
        input.meaning_structure?.politeness_level === "casual" || input.meaning_structure?.politeness_level === "polite" || input.meaning_structure?.politeness_level === "formal"
          ? input.meaning_structure.politeness_level
          : "unknown",
    },
    confidence_score: typeof input.confidence_score === "number" ? Number(input.confidence_score.toFixed(3)) : 0,
    ambiguity_level: ambiguityLevel,
    ambiguities,
    rewrite_reasons: rewriteReasons,
    learning_points: learningPoints,
    safety_notes: Array.isArray(input.safety_notes) ? input.safety_notes.filter((item) => typeof item === "string").slice(0, 3) : [],
    should_ask_user: Boolean(input.should_ask_user || ambiguityLevel === "high"),
  };

  return { result, issues };
}

export function criticRewriteResult(inputText: string, result: RewriteResult) {
  const issues: string[] = [];
  const joined = JSON.stringify(result).toLowerCase();
  const bannedSignals = [`bạn ${"viết"} ${"sai"}`, `không ${"biết"} tiếng việt`, `${"dịch"} tiếng việt người điếc`];
  for (const signal of bannedSignals) if (joined.includes(signal)) issues.push("Output có wording phán xét.");
  if (result.rewritten_text.length > Math.max(500, inputText.length * 3)) issues.push("Câu viết lại dài quá mức cần thiết.");
  if (/mình chưa đủ chắc|cần thêm bối cảnh|không thể viết lại/i.test(result.rewritten_text)) {
    issues.push("Output từ chối thay vì đưa bản hiểu tốt nhất.");
  }
  if (!inputText.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/) && result.rewritten_text.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)) issues.push("Output thêm email không có trong input.");
  if (!/(\+?84|0)(\d[\s.-]?){8,10}/.test(inputText) && /(\+?84|0)(\d[\s.-]?){8,10}/.test(result.rewritten_text)) issues.push("Output thêm số điện thoại không có trong input.");
  const lessonText = result.learning_points.map((point) => `${point.title} ${point.rule_text}`).join(" ").toLowerCase();
  if (/\b(english|vocabulary|pronunciation|grammar in english|ipa)\b/i.test(lessonText)) issues.push("Bài học có nội dung học tiếng Anh.");

  const riskyAccusations = ["trộm", "lừa đảo", "đe dọa", "tấn công", "ăn cắp"];
  if (riskyAccusations.some((word) => inputText.toLowerCase().includes(word))) {
    if (!/(có thể|mình hiểu tạm|nghi ngờ|cần xác minh|nên kiểm tra|chưa xác định|chưa rõ)/i.test(result.rewritten_text)) {
      issues.push("Câu nhạy cảm cần diễn đạt thận trọng hơn.");
    }
  }

  return {
    pass: issues.length === 0,
    issues,
    hallucinationRisk: issues.some((item) => item.includes("thêm")) ? "high" : "low",
    privacyRisk: issues.some((item) => item.includes("email") || item.includes("số điện thoại")) ? "high" : "low",
    shouldRegenerate: issues.length > 0,
  };
}

export function buildRewriteMessages(input: {
  inputText: string;
  contextType: string;
  tone: string;
  retrievedExamples: Array<{ chunk_text: string; similarity?: number }>;
  retryIssues?: string[];
}) {
  const examplesBlock = input.retrievedExamples.length
    ? `\nVí dụ tham khảo đã được duyệt:\n${input.retrievedExamples.slice(0, 4).map((chunk, index) => `[Ví dụ ${index + 1}]\n${chunk.chunk_text.slice(0, 1200)}`).join("\n\n")}`
    : "";

  const retryBlock = input.retryIssues?.length
    ? `\nLần trả lời trước chưa đạt vì: ${input.retryIssues.join("; ")}. Hãy sửa và vẫn trả JSON hợp lệ.`
    : "";

  const system = `Bạn là công cụ dịch câu tiếng Việt khó hiểu, thiếu trật tự từ hoặc chịu ảnh hưởng ngôn ngữ ký hiệu sang tiếng Việt phổ thông.
Nhiệm vụ chính: luôn đưa bản hiểu tốt nhất có thể trong rewritten_text, kể cả khi câu mơ hồ.
Nếu chưa chắc, hãy viết bản dịch thận trọng bằng "Có thể là..." hoặc "Mình hiểu tạm là...", giảm confidence_score, ghi ambiguity_level phù hợp, nêu chỗ chưa chắc và đặt câu hỏi xác nhận.
Không được chỉ trả lời rằng cần thêm bối cảnh nếu vẫn có thể đoán được ý chính.
Không tự thêm người, sự kiện, cáo buộc, địa điểm hoặc kết luận không có căn cứ. Với nội dung trộm cắp, tiền, tai nạn hoặc bảo vệ, dùng wording thận trọng như "có thể", "nghi", "cần xác nhận" khi input chưa rõ.
Giải thích ngắn gọn vì sao dịch/sửa như vậy.
Tách ý chính vào meaning_structure bằng cụm ngắn; dùng "chưa rõ" hoặc politeness_level "unknown" nếu input không đủ dữ kiện.
Tạo 1-3 bài học nhỏ giúp người học tiến gần tiếng Việt phổ thông hơn, ưu tiên trật tự từ, quan hệ sở hữu, từ gần đúng, thiếu chủ ngữ/vị ngữ và cách nối ý.
Không tạo nội dung học tiếng Anh, không dịch sang tiếng Anh, không dùng giọng thương hại, không dùng wording phán xét.
Không hiển thị suy luận nội bộ.
Trả về JSON hợp lệ, không markdown, không text ngoài JSON.`;

  const user = `Câu gốc:\n${input.inputText}\n\nNgữ cảnh:\n${input.contextType}\n\nGiọng điệu mong muốn:\n${input.tone}${examplesBlock}${retryBlock}\n\nTrả về JSON theo schema:\n{
  "rewritten_text": "string",
  "meaning_guess": "string",
  "meaning_structure": {
    "speaker": "string",
    "recipient": "string",
    "action": "string",
    "time": "string",
    "place": "string",
    "object": "string",
    "intent": "string",
    "politeness_level": "casual|polite|formal|unknown"
  },
  "confidence_score": 0.0,
  "ambiguity_level": "low|medium|high",
  "ambiguities": [
    { "phrase": "string", "why_unclear": "string", "question": "string" }
  ],
  "rewrite_reasons": ["string"],
  "learning_points": [
    {
      "type": "clarity|grammar|word_order|connector|time_specificity|politeness|sentence_pattern",
      "title": "string",
      "rule_text": "string",
      "unclear_example": "string",
      "clear_example": "string"
    }
  ],
  "safety_notes": ["string"],
  "should_ask_user": false
}`;

  return [
    { role: "system" as const, content: system },
    { role: "user" as const, content: user },
  ];
}

export function fallbackRewriteResult(inputText: string): RewriteResult {
  return {
    rewritten_text: `Có thể là: ${inputText.trim()}`,
    meaning_guess: "Hệ thống chưa tạo được bản dịch chắc chắn, nên đang giữ nguyên ý gốc và đánh dấu cần xác nhận.",
    meaning_structure: {
      speaker: "chưa rõ",
      recipient: "chưa rõ",
      action: inputText.trim().slice(0, 160),
      time: "chưa rõ",
      place: "chưa rõ",
      object: "chưa rõ",
      intent: "cần xác nhận ý chính",
      politeness_level: "unknown",
    },
    confidence_score: 0.2,
    ambiguity_level: "high",
    ambiguities: [
      { phrase: inputText.slice(0, 120), why_unclear: "Chưa đủ chắc để xác định trật tự câu, người liên quan hoặc quan hệ sở hữu.", question: "Bạn muốn nói ai làm gì với ai, và chuyện xảy ra ở đâu?" },
    ],
    rewrite_reasons: ["Giữ bản hiểu thận trọng để tránh thêm ý không có trong câu gốc."],
    learning_points: [
      {
        type: "clarity",
        title: "Thêm vai người và ý chính",
        rule_text: "Khi câu có nhiều mảnh ý, hãy viết rõ ai làm gì, với ai, ở đâu hoặc vì sao.",
        unclear_example: inputText.slice(0, 300),
        clear_example: "Ở [địa điểm], [ai] đã [hành động] với [ai/cái gì], nên [kết quả].",
      },
    ],
    safety_notes: [],
    should_ask_user: true,
  };
}

export async function hashText(text: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function logTrace(service: any, input: {
  user_id: string;
  session_id?: string | null;
  trace_type: string;
  status: "started" | "success" | "failed";
  input_snapshot?: unknown;
  output_snapshot?: unknown;
  metadata?: Record<string, unknown>;
  started_at?: number;
  error_message?: string;
}) {
  const now = Date.now();
  const latency = input.started_at ? now - input.started_at : undefined;
  await service.from("ai_traces").insert({
    user_id: input.user_id,
    session_id: input.session_id || null,
    trace_type: input.trace_type,
    status: input.status,
    input_snapshot: input.input_snapshot ?? null,
    output_snapshot: input.output_snapshot ?? null,
    metadata: input.metadata || {},
    finished_at: new Date().toISOString(),
    latency_ms: latency,
    error_message: input.error_message || null,
  });
}

export function estimateCost(_model: string, inputTokens?: number, outputTokens?: number) {
  if (!inputTokens && !outputTokens) return null;
  const inputPerMillion = Number(Deno.env.get("OPENAI_INPUT_PRICE_PER_1M") || "");
  const outputPerMillion = Number(Deno.env.get("OPENAI_OUTPUT_PRICE_PER_1M") || "");
  if (!inputPerMillion || !outputPerMillion) return null;
  return Number((((inputTokens || 0) * inputPerMillion + (outputTokens || 0) * outputPerMillion) / 1_000_000).toFixed(6));
}
