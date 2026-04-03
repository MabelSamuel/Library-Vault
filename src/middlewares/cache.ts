import { Request, Response, NextFunction } from "express";
import redisClient from "../config/redis";
import crypto from "crypto";
import { ParsedQs } from "qs";

export const cache = (ttl: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const sortedQuery = Object.keys(req.query)
      .sort()
      .reduce<Record<string, any>>(
        (acc, key) => {
          acc[key] = req.query[key];
          return acc;
        },
        {},
      );

    const key = `cache:${req.baseUrl}${req.path}:${crypto
      .createHash("md5")
      .update(JSON.stringify(sortedQuery))
      .digest("hex")}`;

    try {
      const cached = await redisClient.get(key);

      if (cached) {
        console.log("running from cache");
        console.log(key);
        return res.json(JSON.parse(cached));
      }

      const originalJson = res.json.bind(res);

      res.json = (body: any) => {
        redisClient.setEx(key, ttl, JSON.stringify(body));
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.error("Cache error:", err);
      next();
    }
  };
};
