import { readFile } from "node:fs/promises";

const checks = [
  ["supabase/functions/_shared/harness.ts", "criticRewriteResult"],
  ["supabase/functions/_shared/harness.ts", "validateRewriteResult"],
  ["supabase/functions/analyze-writing/index.ts", "criticRewriteResult"],
  ["supabase/functions/analyze-writing/index.ts", "llm_runs"],
  ["supabase/functions/run-eval-suite/index.ts", "Chưa có eval case thật"],
];

for (const [file, needle] of checks) {
  const content = await readFile(file, "utf8");
  if (!content.includes(needle)) {
    throw new Error(`Eval gate missing ${needle} in ${file}`);
  }
}

console.log("Eval smoke gate passed.");
