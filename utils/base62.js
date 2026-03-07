// utils/base62.js
const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const PRIME = 15485863; // large prime
const MAX = 62 ** 7; // 7-character space

// Base62 encode
export function encodeBase62(num) {
  let str = "";
  while (num > 0) {
    str = BASE62[num % 62] + str;
    num = Math.floor(num / 62);
  }
  return str || "0";
}

// Obfuscate ID
export function obfuscate(id) {
  return (id * PRIME) % MAX;
}

// Convert DB ID → shortId
export function encodeShortId(id) {
  const obf = obfuscate(id);
  return encodeBase62(obf).padStart(7, "0"); // fixed 7 chars
}