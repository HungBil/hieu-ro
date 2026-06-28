import type { ContextType, RewriteResult, ToneType } from "./app";

export type AnalyzeWritingInput = {
  input_text: string;
  context_type: ContextType;
  tone: ToneType;
};

export type AnalyzeWritingResponse = {
  session_id: string;
  result: RewriteResult;
};

export type GenerateLessonResponse = {
  item_ids: string[];
  created_count: number;
};
