import pool from "../db";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { AuthenticatedRequest, RefreshTokenPayload } from "../types/auth.js";
import { sendTestEmail } from "../utils/mailer";
import { renderTemplate } from "../emails/render-template";

export const registerUser = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    const isEmailVerified = false;
    const result = await pool.query(
      "INSERT INTO lib_user(username, email, password, role, is_email_verified) VALUES($1, $2, $3, $4, $5) RETURNING id, username, email, role, is_email_verified",
      [username || null, email, hashed, "member", isEmailVerified]
    );
    const user = result.rows[0];

    const emailToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_EMAIL_SECRET!,
      { expiresIn: "1d" }
    );

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${emailToken}`;
    const html = renderTemplate("verify-email", {
      username: username || "User",
      link: verificationLink,
    });
    await sendTestEmail(
      email,
      "Verify Your Email for LibraryVault",
      html
    );

    res.status(201).json({
      message: "User registered, please verify your email",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    res.status(500).send("Server error");
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query;
  if (!token || typeof token !== "string")
    return res.status(400).send("Invalid token");

  try {
    const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET!) as {
      userId: string;
    };
    await pool.query(
      "UPDATE lib_user SET is_email_verified = TRUE WHERE id = $1",
      [decoded.userId]
    );
    res.send("Email verified! You can now log in.");
  } catch (err) {
    res.status(400).send("Invalid or expired token");
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  if (!identifier || !password)
    return res.status(400).json({ message: "Missing credentials" });
  try {
    const result = await pool.query(
      "SELECT * FROM lib_user WHERE email=$1 OR username=$1",
      [identifier]
    );
    const user = result.rows[0];

    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    if (!user.is_email_verified)
      return res.status(403).json({ message: "Email not verified" });

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
      console.error(err.message);
    }
    res.status(500).send("Server error");
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).send("Email required");

  const result = await pool.query("SELECT * FROM lib_user WHERE email=$1", [
    email,
  ]);
  const user = result.rows[0];
  if (!user) return res.status(400).send("No user with this email");

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 3600 * 1000);

  await pool.query(
    "UPDATE lib_user SET password_reset_token=$1, password_reset_expires=$2 WHERE id=$3",
    [token, expires, user.id]
  );

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const html = renderTemplate("password-reset", {
    username: user.username || "User",
    link: resetLink,
  });
  await sendTestEmail(
    email,
    "Reset Your LibraryVault Password",
    html
  );

  res.json({ message: "Password reset link sent" });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).send("Invalid request");

  const result = await pool.query(
    "SELECT * FROM lib_user WHERE password_reset_token=$1 AND password_reset_expires > NOW()",
    [token]
  );

  const user = result.rows[0];
  if (!user) return res.status(400).send("Invalid or expired token");

  const hashed = await bcrypt.hash(newPassword, 10);
  await pool.query(
    "UPDATE lib_user SET password=$1, password_reset_token=NULL, password_reset_expires=NULL WHERE id=$2",
    [hashed, user.id]
  );

  res.send("Password has been reset successfully");
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET!
    ) as RefreshTokenPayload;

    const result = await pool.query(
      "SELECT id, role, token_version FROM lib_user WHERE id=$1",
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

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  await pool.query(
    "UPDATE lib_user SET token_version = token_version + 1 WHERE id=$1",
    [req.user.id]
  );

  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
};