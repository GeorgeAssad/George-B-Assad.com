// Shared by the secret scanners. Patterns are deliberately conservative to avoid false positives.
export const SECRET_PATTERNS = [
  ["Stripe secret key", /\bsk_(?:live|test)_[A-Za-z0-9]{16,}/],
  ["Stripe restricted key", /\brk_(?:live|test)_[A-Za-z0-9]{16,}/],
  ["Stripe webhook secret", /\bwhsec_[A-Za-z0-9]{16,}/],
  ["OpenAI-style key", /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}/],
  ["Anthropic key", /\bsk-ant-[A-Za-z0-9_-]{20,}/],
  ["AWS access key id", /\bAKIA[0-9A-Z]{16}\b/],
  ["Private key block", /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/],
  ["GitHub token", /\bgh[pousr]_[A-Za-z0-9]{30,}/],
  ["Slack token", /\bxox[baprs]-[A-Za-z0-9-]{10,}/],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{35}\b/],
  ["Cloudflare API token-like", /\bcf[a-z]*_[A-Za-z0-9_-]{30,}/],
  ["JSON Web Token", /\beyJ[A-Za-z0-9_-]{15,}\.eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}/],
];

// Names of server-side secrets. They must never appear in anything shipped to a browser.
export const SECRET_ENV_NAMES = [
  "STRIPE_SECRET_KEY", "PAYMENT_SECRET_KEY", "PAYMENT_WEBHOOK_SECRET", "OPENAI_API_KEY", "AI_API_KEY",
  "FULFILLMENT_API_KEY", "EMAIL_API_KEY", "DATABASE_URL", "CHECKOUT_SIGNING_SECRET", "CLOUDFLARE_API_TOKEN",
];

// The public, non-secret demo constant must stay server-side too (it only exists in the mock payment provider).
export const SERVER_ONLY_STRINGS = ["supercars-demo-only-public-constant", "createMockPaymentProvider", "verifyPayment"];
