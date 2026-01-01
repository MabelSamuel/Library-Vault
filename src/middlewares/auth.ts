import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import type { Request, Response, NextFunction } from "express";
import { Role } from "../types/auth";
dotenv.config();

const ROLE_LEVELS: Record<Role, number> = {
  member: 1,
  librarian: 2,
  admin: 3,
  super_admin: 4,
};

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Not authorized" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid" });
  }
};

export const authorize =
  (options: { roles?: Role[]; minRole?: Role }) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { roles = [], minRole } = options;
    const userRole: Role = req.user.role;

    if (roles.length && roles.includes(userRole)) return next();

    if (minRole && ROLE_LEVELS[userRole] >= ROLE_LEVELS[minRole]) return next();

    return res.status(403).json({ message: "Forbidden: Access denied" });
  };
