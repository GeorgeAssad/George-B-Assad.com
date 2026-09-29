// Static security/hygiene audit of the source tree. Fails on dangerous patterns outside an explicit allow-list.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SRC = "src";
function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (/\.(ts|tsx)$/.test(name)) yield p;
  }
}

/** [label, regex, allowed file suffixes] */
const RULES = [
  ["dangerouslySetInnerHTML", /dangerouslySetInnerHTML/, ["app/layout.tsx"]], // constant theme bootstrap string only
  ["innerHTML/outerHTML/insertAdjacentHTML", /\b(?:innerHTML|outerHTML|insertAdjacentHTML)\b/, []],
  ["document.write", /document\.write/, []],
  ["eval()", /(?<![\w.])eval\s*\(/, []],
  ["new Function()", /new Function\s*\(/, []],
  ["javascript: URL", /javascript:/i, []],
  ["window.open", /window\.open\s*\(/, []],
  ["location assignment", /(?<![\w])(?:window\.)?location(?:\.href)?\s*=(?!=)/, []],
  ["NEXT_PUBLIC_ outside config/site.ts", /NEXT_PUBLIC_/, ["config/site.ts"]],
  ["process.env outside config/logging", /process\.env\b/, ["config/env.ts", "config/site.ts", "server/security/logger.ts", "lib/analytics/mock-provider.ts", "app/og-preview/[...key]/page.tsx"]],
];

const problems = [];
for (const file of walk(SRC)) {
  const rel = relative(SRC, file);
  const text = readFileSync(file, "utf8");
  for (const [label, re, allowed] of RULES) {
    if (re.test(text) && !allowed.some((a) => rel.endsWith(a))) problems.push(`${rel}: ${label}`);
  }
  // Client components must not import server-only modules at runtime (type-only imports are fine).
  if (/^\s*["']use client["']/m.test(text)) {
    for (const m of text.matchAll(/^import\s+(?!type\b)[^;]*from\s+["']@\/(server|config\/env)[^"']*["']/gm)) problems.push(`${rel}: client component imports server-only module (${m[0].trim().slice(0, 70)})`);
  }
  // Links that open a new tab must carry rel="noopener noreferrer".
  for (const m of text.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    if (!/rel="[^"]*noopener[^"]*"/.test(m[0])) problems.push(`${rel}: target=_blank without rel=noopener`);
  }
}

if (problems.length) {
  console.error("Code audit FAILED:\n" + problems.map((p) => "  - " + p).join("\n"));
  process.exit(1);
}
console.log("Code audit passed.");
