import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  { ignores: [".next/**", ".open-next/**", ".wrangler/**", "node_modules/**", "next-env.d.ts", "coverage/**", "src/app/lab/**", "test-results/**", "playwright-report/**"] },
  {
    // The UI layer reads data only through repositories (server) — never from demo data files.
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{ group: ["@/data/*"], message: "Read data through @/server/repositories, not directly from demo data files." }] }],
    },
  },
  {
    // Client components must never import server-only modules (secrets, providers).
    files: ["src/components/**/*.{ts,tsx}", "src/lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [
        { group: ["@/data/*"], message: "Read data through @/server/repositories, not directly from demo data files." },
        { group: ["@/server/services", "@/server/services/*", "@/config/env"], message: "Server-only module: do not import into client code." },
      ] }],
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "react/no-danger": ["error"],
    },
  },
  {
    // The only two intentional uses of dangerouslySetInnerHTML: a constant theme bootstrap string and JSON-LD built from our own data.
    files: ["src/app/layout.tsx"],
    rules: { "react/no-danger": "off" },
  },
];

export default config;
