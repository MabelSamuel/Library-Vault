import { createClient } from "redis";

// const redisClient = createClient({
//   url: `redis://:${process.env.REDIS_PASSWORD}@localhost:6379/${process.env.REDIS_DB}`,
// });

const redisClient = createClient();

redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis connected");
  }
};

export default redisClient;