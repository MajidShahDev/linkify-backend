import redis from "./config/redis.js";

const keys = await redis.keys("2fa:*");
console.log("Found keys:", keys);

for (const key of keys) {
  const data = await redis.hgetall(key);
  const ttl = await redis.ttl(key);
  console.log(`\n--- ${key} ---`);
  console.log("Data:", data);
  console.log(`Expires in: ${ttl} seconds`);
}

process.exit(0);
