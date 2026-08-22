import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
redis.on('ready', () => console.log('Redis: Ready'));
redis.on('error', (e) => console.error('Redis Error', e));

export default redis;