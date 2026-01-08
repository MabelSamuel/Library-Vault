import type { Request, Response } from 'express';
import pool from '../db';
import logger from '../utils/error_logger';

export const getAllBooks = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM book ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      logger.error({
        message: err.message,
        stack: err.stack,
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBookById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM book WHERE id=$1', [id]);
    if (!result.rows.length)
      return res.status(404).json({ message: 'Book not found' });

    res.json(result.rows[0]);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      logger.error({
        message: err.message,
        stack: err.stack,
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const createBook = async (req: Request, res: Response) => {
  const { title, author, isbn, quantity } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO book(title, author, isbn, quantity)
       VALUES($1, $2, $3, $4)
       RETURNING *`,
      [title, author, isbn, quantity]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      logger.error({
        message: err.message,
        stack: err.stack,
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateBook = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, author, quantity } = req.body;

  try {
    const result = await pool.query(
      `UPDATE book
       SET title=$1, author=$2, quantity=$3
       WHERE id=$4
       RETURNING *`,
      [title, author, quantity, id]
    );

    if (!result.rows.length)
      return res.status(404).json({ message: 'Book not found' });

    res.json(result.rows[0]);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      logger.error({
        message: err.message,
        stack: err.stack,
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM book WHERE id=$1', [id]);
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      logger.error({
        message: err.message,
        stack: err.stack,
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
