import type { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/auth";

type AuthHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => any;

export const requireAuth =
  (handler: AuthHandler) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    return handler(req as unknown as AuthenticatedRequest, res, next);
  };
