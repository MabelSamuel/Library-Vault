import jwt from "jsonwebtoken";
import type { Secret } from "jsonwebtoken";
import dotenv from "dotenv";
import { JwtUserPayload } from "../types/auth";
dotenv.config();

export const generateAccessToken = (user: JwtUserPayload) => {
  return jwt.sign(
    { id: user.id, role: user.role, tokenVersion: user.token_version },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );
};

export const generateRefreshToken = (user: JwtUserPayload) => {
  return jwt.sign(
    {
      id: user.id,
      tokenVersion: user.token_version
    },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );
};