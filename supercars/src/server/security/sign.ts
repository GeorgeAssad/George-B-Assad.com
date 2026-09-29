/* HMAC helpers on Web Crypto (Node 22 + Cloudflare Workers). */

const encoder = new TextEncoder();

export function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const importKey = (secret: string, usages: KeyUsage[]) =>
  crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, usages);

export async function hmacSign(secret: string, data: string): Promise<string> {
  const key = await importKey(secret, ["sign"]);
  return toBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(data))));
}

/** Constant-time verification via SubtleCrypto. */
export async function hmacVerify(secret: string, data: string, signature: string): Promise<boolean> {
  try {
    const key = await importKey(secret, ["verify"]);
    // Cast: TS 5.9 types Uint8Array generically over ArrayBufferLike; runtime is a plain buffer.
    return await crypto.subtle.verify("HMAC", key, fromBase64Url(signature) as unknown as BufferSource, encoder.encode(data));
  } catch {
    return false;
  }
}

export async function sha256Hex(data: string): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(data)));
  return Array.from(digest, (b) => b.toString(16).padStart(2, "0")).join("");
}
