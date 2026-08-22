import crypto from 'crypto';
import redis from '../config/redis.js';

const OTP_TTL = 5 * 60;
const MAX_ATTEMPTS = 5;

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

function getKey(userId, purpose = 'login') {
  return `2fa:${purpose}:${userId}`;
}

export async function storeOtp(userId, purpose = 'login', ttl = OTP_TTL) {
  const otp = generateOtp();
  const key = getKey(userId, purpose);
  await redis.hmset(key, { otp, attempts: 0 });
  await redis.expire(key, ttl);
  return otp;
}

export async function verifyOtp(userId, submittedOtp, purpose = 'login') {
  const key = getKey(userId, purpose);
  const data = await redis.hgetall(key);
  if (!data || !data.otp) return { valid: false, reason: 'expired' };
  if (parseInt(data.attempts) >= MAX_ATTEMPTS) {
    await redis.del(key);
    return { valid: false, reason: 'max_attempts' };
  }
  if (data.otp !== submittedOtp) {
    await redis.hincrby(key, 'attempts', 1);
    return { valid: false, reason: 'invalid' };
  }
  await redis.del(key);
  return { valid: true };
}

export async function deleteOtp(userId, purpose = 'login') {
  await redis.del(getKey(userId, purpose));
}

export async function existsOtp(userId, purpose = 'login') {
  return await redis.exists(getKey(userId, purpose));
}