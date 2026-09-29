import { z } from "zod";
import { describeError, log } from "./logger";
import { configuredSiteOrigin } from "@/config/site";
import { isSameOrigin } from "./origin";
import { clientKey, getRateLimiter, type RateLimitPolicy } from "./rate-limit";
import { newId } from "@/lib/ids";

/* THE ONE WAY TO WRITE AN API ROUTE.
 * method check → same-origin → rate limit → content-type → size cap →
 * strict schema validation → handler → sanitized errors.
 * Customers never see stack traces; developers get redacted structured logs. */

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiContext<TInput> {
  readonly input: TInput;
  readonly request: Request;
  readonly requestId: string;
  readonly clientKey: string;
}

export interface ApiOptions<S extends z.ZodType | undefined> {
  /** Stable route label used in logs. */
  readonly route: string;
  readonly method: "GET" | "POST";
  /** POST: JSON body schema. GET: schema applied to the query-string params. */
  readonly schema?: S;
  readonly rateLimit?: RateLimitPolicy;
  readonly maxBodyBytes?: number;
}

const DEFAULT_MAX_BODY = 16 * 1024;

const SECURITY_HEADERS: Record<string, string> = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

function json(body: unknown, status: number, requestId: string, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "X-Request-Id": requestId, ...SECURITY_HEADERS, ...extra },
  });
}

const errorBody = (code: string, message: string, requestId: string, issues?: unknown) => ({
  error: { code, message, requestId, ...(issues ? { issues } : {}) },
});

async function readCappedText(req: Request, max: number): Promise<string> {
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > max) throw new ApiError(413, "payload_too_large", "Request is too large.");
  if (!req.body) return "";
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) {
      await reader.cancel();
      throw new ApiError(413, "payload_too_large", "Request is too large.");
    }
    chunks.push(value);
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder().decode(merged);
}

const publicIssues = (error: z.ZodError) =>
  error.issues.slice(0, 10).map((i) => ({ path: i.path.join("."), message: i.message }));

export function withApi<S extends z.ZodType | undefined = undefined>(
  options: ApiOptions<S>,
  handler: (ctx: ApiContext<S extends z.ZodType ? z.output<S> : undefined>) => Promise<unknown>,
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    const requestId = newId("req");
    const key = clientKey(request);
    try {
      if (request.method !== options.method) {
        return json(errorBody("method_not_allowed", "Method not allowed.", requestId), 405, requestId, { Allow: options.method });
      }

      if (options.method === "POST" && !isSameOrigin(request, [configuredSiteOrigin])) {
        log.warn("api.cross_origin_rejected", { route: options.route, requestId });
        return json(errorBody("forbidden", "Cross-origin requests are not allowed.", requestId), 403, requestId);
      }

      if (options.rateLimit) {
        const result = await getRateLimiter().check(key, options.rateLimit);
        if (!result.allowed) {
          log.warn("api.rate_limited", { route: options.route, requestId, policy: options.rateLimit.name });
          return json(errorBody("rate_limited", "Too many requests. Please wait a moment and try again.", requestId), 429, requestId, {
            "Retry-After": String(result.retryAfterSeconds),
          });
        }
      }

      let raw: unknown;
      if (options.method === "POST") {
        const type = request.headers.get("content-type") ?? "";
        if (!type.toLowerCase().startsWith("application/json")) {
          return json(errorBody("unsupported_media_type", "Send JSON.", requestId), 415, requestId);
        }
        const bodyText = await readCappedText(request, options.maxBodyBytes ?? DEFAULT_MAX_BODY);
        try {
          raw = bodyText ? JSON.parse(bodyText) : {};
        } catch {
          return json(errorBody("invalid_json", "Request body is not valid JSON.", requestId), 400, requestId);
        }
      } else {
        raw = Object.fromEntries(new URL(request.url).searchParams);
      }

      let input: unknown = undefined;
      if (options.schema) {
        const parsed = options.schema.safeParse(raw);
        if (!parsed.success) {
          return json(errorBody("invalid_request", "Some fields are invalid.", requestId, publicIssues(parsed.error)), 422, requestId);
        }
        input = parsed.data;
      }

      const result = await handler({ input: input as never, request, requestId, clientKey: key });
      if (result instanceof Response) return result;
      return json(result, 200, requestId);
    } catch (err) {
      if (err instanceof ApiError) {
        return json(errorBody(err.code, err.message, requestId), err.status, requestId);
      }
      log.error("api.unhandled_error", { route: options.route, requestId, ...describeError(err) });
      return json(errorBody("internal_error", "Something went wrong on our side. Please try again.", requestId), 500, requestId);
    }
  };
}
