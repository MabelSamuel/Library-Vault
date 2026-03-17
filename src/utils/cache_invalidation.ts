import redisClient from "../config/redis";

export const clearCache = async (pattern: string) => {
  const keys = await redisClient.keys(pattern);

  if (keys.length) {
    await redisClient.del(keys);
  }
};