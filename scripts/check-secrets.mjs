import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const forbidden = [
  /sk-[A-Za-z0-9_-]{20,}/,
  new RegExp("SUPABASE" + "_SERVICE" + "_ROLE" + "_KEY" + "\\\\s*="),
  new RegExp(["V", "I", "T", "E", "_"].join("") + ".*" + "OPENAI", "i"),
];
const ignored = new Set(["node_modules", "dist", ".git"]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (ignored.has(entry.name)) continue;
    const filePath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(filePath);
      continue;
    }
    const content = await readFile(filePath, "utf8").catch(() => "");
    for (const pattern of forbidden) {
      if (pattern.test(content)) {
        console.error(`Secret-like value found in ${filePath}`);
        process.exit(1);
      }
    }
  }
}

await walk(root);
console.log("No forbidden frontend secret pattern found.");
