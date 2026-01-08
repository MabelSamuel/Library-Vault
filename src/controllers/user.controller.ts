import type { Request, Response } from 'express';
import pool from '../db';
import bcrypt from 'bcrypt';
import type { AuthenticatedRequest } from '../types/auth';
import { sendTestEmail } from '../utils/mailer';
import { renderTemplate } from '../emails/render-template';
import logger from '../utils/error_logger';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, username, role FROM lib_user');
    res.json(result.rows);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      logger.error({
        message: err.message,
        stack: err.stack,
      });
    }
    res.status(500).send('Server error');
  }
};

export const createUserByAdmin = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { username, email, password, role } = req.body;

  if (role === "admin" && req.user.role !== "super_admin")
    return res.status(403).json({ message: "Forbidden" });

  if (role === "librarian" && req.user.role !== "admin")
    return res.status(403).json({ message: "Forbidden" });

  if (role === "member" && req.user.role !== "admin")
    return res.status(403).json({ message: "Forbidden" });

  if (role === "super_admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    const isEmailVerified = true;

    const result = await pool.query(
      `INSERT INTO lib_user(username, email, password, role, is_email_verified)
       VALUES($1, $2, $3, $4, $5)
       RETURNING id, username, email, role, is_email_verified`,
      [username || null, email, hashed, role, isEmailVerified]
    );

    const html = renderTemplate("welcome-user", {
      username: username || "User",
      email: email
    });
    await sendTestEmail(
      email,
      "Welcome to LibraryVault",
      html
    );

    res
      .status(201)
      .json({ message: "User created successfully", user: result.rows[0] });
  } catch (err: any) {
    if (err instanceof Error) {
      console.error(err.message);
      logger.error({
        message: err.message,
        stack: err.stack,
      });
    }
    res.status(500).send("Server error");
  }
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as unknown as { id: string };
  const { role } = req.body  as unknown as {
    role: "member" | "admin" | "super_admin";
  };
  const currentUserRole = req.user.role;

  if (role === 'super_admin' && currentUserRole !== 'super_admin') {
    return res.status(403).json({ message: 'Cannot assign super_admin role' });
  }

  if (role === "super_admin") {
    return res.status(403).json({ message: "Superadmin role cannot be assigned" });
  }
  
  try {
    const result = await pool.query(
      'UPDATE lib_user SET role=$1 WHERE id=$2 RETURNING id, username, role',
      [role, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      logger.error({
        message: err.message,
        stack: err.stack,
      });
    }
    res.status(500).send('Server error');
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM lib_user WHERE id=$1', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      logger.error({
        message: err.message,
        stack: err.stack,
      });
    }
    res.status(500).send('Server error');
  }
};
