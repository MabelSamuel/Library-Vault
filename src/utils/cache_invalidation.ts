import redisClient from "../config/redis";

export const clearCache = async (pattern: string) => {
  const keys: string[] = [];

  for await (const chunk of redisClient.scanIterator({ MATCH: pattern })) {
    keys.push(...(chunk as string[])); 
  }

  if (keys.length) {
    console.log(`Clearing ${keys.length} cache keys for pattern: ${pattern}`);
    await redisClient.del(keys);
  }
};