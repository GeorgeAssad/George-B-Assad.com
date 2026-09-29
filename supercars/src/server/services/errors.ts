/** Provider failures. `code` is safe to show to customers; `message` is not guaranteed to be. */
export class ProviderError extends Error {
  constructor(
    readonly code: "invalid_session" | "session_expired" | "not_configured" | "unavailable",
    message: string,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}
