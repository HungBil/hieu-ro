import { readFile } from "node:fs/promises";

const checks = [
  ["supabase/functions/_shared/harness.ts", "criticRewriteResult"],
  ["supabase/functions/_shared/harness.ts", "validateRewriteResult"],
  ["supabase/functions/_shared/harness.ts", "bản hiểu tốt nhất"],
  ["supabase/functions/analyze-writing/index.ts", "criticRewriteResult"],
  ["supabase/functions/analyze-writing/index.ts", "AI_CONFIG_MISSING"],
  ["supabase/functions/analyze-writing/index.ts", "AI_OUTPUT_FAILED"],
  ["supabase/functions/analyze-writing/index.ts", "llm_runs"],
  ["supabase/functions/run-eval-suite/index.ts", "Chưa có eval case thật"],
  ["supabase/functions/run-eval-suite/index.ts", "isCoreEval"],
  ["supabase/functions/run-eval-suite/index.ts", "pass_rate"],
  ["supabase/migrations/20260628050036_deaf_translation_eval_case.sql", "deaf_written_order_theft_france"],
  ["supabase/migrations/20260628061111_core_release_eval_gate.sql", "deaf_translation.word_order"],
  ["supabase/migrations/20260628061111_core_release_eval_gate.sql", "general_communication.regression"],
];

for (const [file, needle] of checks) {
  const content = await readFile(file, "utf8");
  if (!content.includes(needle)) {
    throw new Error(`Eval gate missing ${needle} in ${file}`);
  }
}

console.log("Eval smoke gate passed.");
