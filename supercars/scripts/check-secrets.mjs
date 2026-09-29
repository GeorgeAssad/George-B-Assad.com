// Fails if any tracked file looks like it contains a secret, or if env files are tracked.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { SECRET_PATTERNS } from "./secret-patterns.mjs";

const files = execSync("git ls-files .", { encoding: "utf8" }).split("\n").filter(Boolean);
const BINARY = /\.(png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|pdf|zip)$/i;
const SELF = /^scripts\/(check-|secret-patterns)/;
const problems = [];

for (const f of files) {
  if (/(^|\/)\.env(\..*)?$/.test(f) && !/\.example$/.test(f)) problems.push(`${f}: environment file is tracked`);
  if (/(^|\/)\.dev\.vars(\..*)?$/.test(f) && !/\.example$/.test(f)) problems.push(`${f}: .dev.vars file is tracked`);
  if (BINARY.test(f) || SELF.test(f) || f === "package-lock.json") continue;
  const text = readFileSync(f, "utf8");
  for (const [name, re] of SECRET_PATTERNS) {
    const m = re.exec(text);
    if (m) problems.push(`${f}: looks like a ${name} (${m[0].slice(0, 8)}…)`);
  }
  // KEY=value assignments with a real-looking value in env-style files (examples must be empty/placeholder).
  if (/\.(env|vars)(\.|$)|\.example$/.test(f) || /(^|\/)\.(env|dev\.vars)/.test(f)) {
    for (const line of text.split("\n")) {
      const m = /^\s*([A-Z0-9_]*(?:SECRET|API_KEY|TOKEN|PASSWORD|DATABASE_URL)[A-Z0-9_]*)\s*=\s*([^#\s]+)/.exec(line);
      if (m && m[2].length > 0) problems.push(`${f}: ${m[1]} has a non-empty value`);
    }
  }
}

if (problems.length) {
  console.error("Secret scan FAILED:\n" + problems.map((p) => "  - " + p).join("\n"));
  process.exit(1);
}
console.log(`Secret scan passed (${files.length} tracked files checked).`);
