export interface SupportMessage {
  readonly role: "customer" | "assistant";
  readonly text: string;
}

export interface SupportAnswer {
  readonly text: string;
  /** Optional quick-reply chips the UI can render. */
  readonly suggestions: readonly string[];
  /** Set when the assistant recommends a human takes over. */
  readonly escalate: boolean;
  /** True while answers come from local demo data. */
  readonly demo: boolean;
}

export interface SupportTicket {
  readonly id: string;
  readonly createdAt: string;
  readonly status: "open";
}
