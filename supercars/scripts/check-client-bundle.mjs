// Scans everything a browser can download for secrets and server-only strings.
//   .next/static      (Next client chunks)          — after `next build`
//   .open-next/assets (static assets uploaded to CF) — after `opennextjs-cloudflare build`
// Also checks that no NEXT_PUBLIC_ variable name suggests a secret.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { SECRET_ENV_NAMES, SECRET_PATTERNS, SERVER_ONLY_STRINGS } from "./secret-patterns.mjs";

const roots = [".next/static", ".open-next/assets"].filter(existsSync);
if (roots.length === 0) {
  console.error("No build output found. Run `npm run build` first.");
  process.exit(2);
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const TEXT = /\.(js|mjs|css|html|json|txt|map|svg|xml)$/i;
const problems = [];
let scanned = 0;

for (const root of roots) {
  for (const file of walk(root)) {
    if (!TEXT.test(file)) continue;
    const text = readFileSync(file, "utf8");
    scanned++;
    for (const [name, re] of SECRET_PATTERNS) if (re.test(text)) problems.push(`${file}: matches ${name}`);
    for (const n of SECRET_ENV_NAMES) if (text.includes(n)) problems.push(`${file}: contains server-secret name ${n}`);
    for (const s of SERVER_ONLY_STRINGS) if (text.includes(s)) problems.push(`${file}: contains server-only string "${s}"`);
    for (const m of text.matchAll(/NEXT_PUBLIC_[A-Z0-9_]+/g)) {
      if (/SECRET|KEY|TOKEN|PASSWORD|PRIVATE/.test(m[0])) problems.push(`${file}: suspicious public variable ${m[0]}`);
    }
  }
}

if (problems.length) {
  console.error("Client bundle scan FAILED:\n" + [...new Set(problems)].map((p) => "  - " + p).join("\n"));
  process.exit(1);
}
console.log(`Client bundle scan passed (${scanned} files in ${roots.join(", ")}).`);
