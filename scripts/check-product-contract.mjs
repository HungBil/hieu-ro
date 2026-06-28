import { access, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const checks = [
  ["supabase/functions/_shared/harness.ts", "meaning_structure"],
  ["src/pages/app/WriteResultPage.tsx", "Đúng ý tôi"],
  ["src/pages/app/WriteResultPage.tsx", "Chưa đúng ý"],
  ["src/pages/app/WriteResultPage.tsx", "Thiếu ý"],
  ["src/pages/app/WriteResultPage.tsx", "Quá dài"],
  ["src/pages/app/WriteResultPage.tsx", "Khó hiểu"],
  ["src/pages/app/WriteResultPage.tsx", "meaning_structure"],
  ["supabase/functions/run-eval-suite/index.ts", "no_hallucination"],
  ["supabase/functions/run-eval-suite/index.ts", "respectful_tone"],
  ["scripts/eval-live.mjs", "no_hallucination"],
  ["package.json", "\"test\""],
];

const docs = ["DEPLOYMENT.md", "QA_CHECKLIST.md", "EVALS.md", "SECURITY.md", "DATA_CONSENT.md", "ARCHITECTURE.md"];
const forbiddenSeedTables = ["coach_sessions", "coach_feedback", "saved_phrases", "learning_items", "learning_reviews", "writing_samples", "community_posts", "community_replies"];

for (const [file, needle] of checks) {
  const content = await readFile(file, "utf8");
  if (!content.includes(needle)) throw new Error(`Product contract missing ${needle} in ${file}`);
}

for (const file of docs) {
  await access(file).catch(() => {
    throw new Error(`Product contract missing doc ${file}`);
  });
}

for (const file of await readdir("supabase/migrations")) {
  if (!file.endsWith(".sql")) continue;
  const content = await readFile(join("supabase/migrations", file), "utf8");
  for (const table of forbiddenSeedTables) {
    if (new RegExp(`insert\\s+into\\s+public\\.${table}\\b`, "i").test(content)) {
      throw new Error(`Runtime seed data found for public.${table} in ${file}`);
    }
  }
}

console.log("Product contract check passed.");
