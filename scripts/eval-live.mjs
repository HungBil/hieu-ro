const required = ["EVAL_FUNCTION_URL", "EVAL_AUTH_TOKEN"];
for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing ${name}`);
}

const response = await fetch(process.env.EVAL_FUNCTION_URL, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.EVAL_AUTH_TOKEN}`,
    "Content-Type": "application/json",
  },
  body: "{}",
});

const body = await response.json().catch(() => ({}));
if (!response.ok) {
  const details = [body.error, body.debug_code].filter(Boolean).join(" ");
  throw new Error(details || `Eval failed with ${response.status}`);
}
if (!body.total_cases) throw new Error("Eval suite has no active cases");
if (body.average_score < Number(process.env.EVAL_MIN_AVERAGE || "4")) {
  throw new Error(`Eval average ${body.average_score} is below threshold`);
}
const rubric = body.rubric || {};
for (const key of ["no_hallucination", "respectful_tone"]) {
  if (Number(rubric[key] || 0) < 4.5) {
    throw new Error(`Eval ${key} ${rubric[key] ?? "missing"} is below 4.5`);
  }
}
if (body.passed_cases < body.total_cases) {
  const failedCoreCases = Array.isArray(body.details)
    ? body.details.filter((item) => item?.core && Number(item?.overall || 0) < 4)
    : [];
  if (failedCoreCases.length) {
    console.error("Failed core eval cases:");
    for (const item of failedCoreCases) {
      const checks = item.checks && typeof item.checks === "object" ? item.checks : {};
      const failedChecks = Object.entries(checks)
        .filter(([, passed]) => !passed)
        .map(([name]) => name)
        .join(", ");
      console.error(`- ${item.name || "unnamed"}: score=${item.overall ?? "n/a"} failed=${failedChecks || "unknown"}`);
      if (item.rewritten_text) console.error(`  rewrite=${String(item.rewritten_text).slice(0, 240)}`);
      if (Array.isArray(item.issues) && item.issues.length) console.error(`  issues=${item.issues.join("; ")}`);
    }
  }
  throw new Error(`Eval passed ${body.passed_cases}/${body.total_cases}; all core cases must pass`);
}

console.log(`Live eval passed: ${body.passed_cases}/${body.total_cases}, avg ${body.average_score}`);
