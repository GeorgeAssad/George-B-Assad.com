/* ID helpers. Uses Web Crypto (available in Node 22 and Cloudflare Workers). */

// Unambiguous alphabet: no 0/O, 1/I/L.
const ORDER_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export const ORDER_ID_PATTERN = /^SC-[A-Z0-9]{6,8}$/;

export function randomString(alphabet: string, length: number): string {
  const limit = 256 - (256 % alphabet.length);
  let out = "";
  while (out.length < length) {
    const bytes = new Uint8Array(length * 2);
    crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte < limit && out.length < length) out += alphabet[byte % alphabet.length];
    }
  }
  return out;
}

export const generateOrderId = (): string => `SC-${randomString(ORDER_ALPHABET, 6)}`;

export const newId = (prefix: string): string =>
  `${prefix}_${randomString("abcdefghijklmnopqrstuvwxyz0123456789", 12)}`;
