// utils/base62.js

const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BASE = 62;
const LENGTH = 7;

// secret key for obfuscation
const SECRET = parseInt(process.env.OBFUSCATION_SECRET);

// Base62 Encode
export function encodeBase62(num) {
  let str = "";

  while (num > 0) {
    str = BASE62[num % BASE] + str;
    num = Math.floor(num / BASE);
  }

  return str.padStart(LENGTH, "0");
}

// Base62 Decode
export function decodeBase62(str) {
  let num = 0;

  for (let i = 0; i < str.length; i++) {
    num = num * BASE + BASE62.indexOf(str[i]);
  }

  return num;
}

// Obfuscate ID
function obfuscate(id) {
  return id ^ SECRET;   // XOR
}

// Reverse Obfuscation
function deobfuscate(num) {
  return num ^ SECRET;  // XOR again reverses it
}

// Encode DB id → shortId
export function encodeShortId(id) {
  const obf = obfuscate(id);
  return encodeBase62(obf);
}

// Decode shortId → DB id
export function decodeShortId(shortId) {
  const num = decodeBase62(shortId);
  return deobfuscate(num);
}