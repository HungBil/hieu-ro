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
if (body.passed_cases < body.total_cases) {
  throw new Error(`Eval passed ${body.passed_cases}/${body.total_cases}; all core cases must pass`);
}

console.log(`Live eval passed: ${body.passed_cases}/${body.total_cases}, avg ${body.average_score}`);
