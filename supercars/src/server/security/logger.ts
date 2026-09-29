/* REDACTING LOGGER. Logs are for debugging, not for personal data.
 * Anything whose key looks sensitive is replaced; strings are truncated;
 * stack traces are only emitted in development. Never log request bodies. */

const SENSITIVE_KEY = /pass|token|secret|authorization|cookie|card|cvv|iban|email|phone|address|street|postal|name|session|signature|key/i;
const MAX_STRING = 200;
const MAX_DEPTH = 3;

function redact(value: unknown, depth = 0): unknown {
  if (value == null || typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "string") return value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…` : value;
  if (depth >= MAX_DEPTH) return "[truncated]";
  if (Array.isArray(value)) return value.slice(0, 10).map((v) => redact(v, depth + 1));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SENSITIVE_KEY.test(k) ? "[redacted]" : redact(v, depth + 1);
    }
    return out;
  }
  return String(value);
}

type Level = "info" | "warn" | "error";

function emit(level: Level, event: string, fields: Record<string, unknown> = {}): void {
  const line = JSON.stringify({ level, event, ts: new Date().toISOString(), ...(redact(fields) as object) });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export function describeError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return {
      errorName: err.name,
      errorMessage: err.message.slice(0, MAX_STRING),
      ...(process.env.APP_ENV === "development" && err.stack ? { stack: err.stack.split("\n").slice(0, 8) } : {}),
    };
  }
  return { errorName: "NonError" };
}

export const log = {
  info: (event: string, fields?: Record<string, unknown>) => emit("info", event, fields),
  warn: (event: string, fields?: Record<string, unknown>) => emit("warn", event, fields),
  error: (event: string, fields?: Record<string, unknown>) => emit("error", event, fields),
};

export { redact as redactForLog };
