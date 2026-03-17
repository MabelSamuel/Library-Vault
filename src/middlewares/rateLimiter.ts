import redisClient from "../config/redis";
import { Request, Response, NextFunction } from "express";

export const redisRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip = req.ip;
  const key = `rate:${ip}`;

  const requests = await redisClient.incr(key);

  if (requests === 1) {
    await redisClient.expire(key, 60);
  }

  if (requests > 100) {
    return res.status(429).json({
      success: false,
      message: "Too many requests",
    });
  }

  next();
};

export const redisAuthLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip = req.ip;
  const key = `auth:${ip}`;

  const requests = await redisClient.incr(key);

  if (requests === 1) {
    await redisClient.expire(key, 600); 
  }

  if (requests > 5) {
    return res.status(429).json({
      success: false,
      message: "Too many login attempts. Try again later."
    });
  }

  next();
};