import redis from "./config/redis.js";

const keys = await redis.keys("rl:*");
console.log("Deleting:", keys);

if(keys.length > 0){
  await redis.del(keys);
  console.log("login blocks clear");
} else {
  console.log("No block found");
}

process.exit(0);