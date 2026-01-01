import pool from "../db.js";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { RefreshTokenPayload } from "../types/auth.js";

export const registerUser = async (req: Request, res: Response) => {
  const { username, password, role } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users(username, password, role) VALUES($1, $2, $3) RETURNING *",
      [username, hashed, role || "member"]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message)
    }
    res.status(500).send("Server error");
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE username=$1", [
      username,
    ]);
    const user = result.rows[0];

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.json({ token });
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message)
    }
    res.status(500).send("Server error");
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as RefreshTokenPayload;

    const result = await pool.query(
      'SELECT id, role, token_version FROM users WHERE id=$1',
      [decoded.id]
    );

    const user = result.rows[0];
    if (!user) return res.sendStatus(401);

    if (user.token_version !== decoded.tokenVersion) {
      return res.sendStatus(401);
    }

    const accessToken = generateAccessToken(user);
    res.json({ accessToken });
  } catch {
    res.sendStatus(401);
  }
};

export const logout = async (req: Request, res: Response) => {
  await pool.query(
    'UPDATE users SET token_version = token_version + 1 WHERE id=$1',
    [req.user.id]
  );
  
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
};


export const adminRoute = (req: Request, res: Response) => {
  res.send("This route is only for super_admin and admin");
};