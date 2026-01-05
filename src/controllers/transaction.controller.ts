import type { Request, Response } from 'express';
import pool from '../db';
import { AuthenticatedRequest } from '../types/auth';

export const borrowBook = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const { book_id } = req.body;

  try {
    const book = await pool.query(
      'SELECT quantity FROM book WHERE id=$1',
      [book_id]
    );

    if (!book.rows.length || book.rows[0].quantity < 1)
      return res.status(400).json({ message: 'Book not available' });

    await pool.query('BEGIN');

    await pool.query(
      `INSERT INTO book_transaction(user_id, book_id, status)
       VALUES($1, $2, 'borrowed')`,
      [userId, book_id]
    );

    await pool.query(
      'UPDATE book SET quantity = quantity - 1 WHERE id=$1',
      [book_id]
    );

    await pool.query('COMMIT');
    res.status(201).json({ message: 'Book borrowed successfully' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const returnBook = async (req: Request, res: Response) => {
  const { transaction_id } = req.body;

  try {
    await pool.query('BEGIN');

    const trx = await pool.query(
      `UPDATE book_transaction
       SET status='returned', returned_at=NOW()
       WHERE id=$1 AND status='borrowed'
       RETURNING book_id`,
      [transaction_id]
    );

    if (!trx.rows.length) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ message: 'Invalid transaction' });
    }

    await pool.query(
      'UPDATE book SET quantity = quantity + 1 WHERE id=$1',
      [trx.rows[0].book_id]
    );

    await pool.query('COMMIT');
    res.json({ message: 'Book returned successfully' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyTransactions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM book_transaction WHERE user_id=$1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT t.*, u.username, b.title
       FROM book_transaction t
       JOIN lib_user u ON u.id = t.user_id
       JOIN book b ON b.id = t.book_id
       ORDER BY t.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
