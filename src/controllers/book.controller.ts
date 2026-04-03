import type { Request, Response } from "express";
import pool from "../db";
import logger from "../utils/error_logger";
import { extractPublicId } from "../utils/cloudinary";
import cloudinary from "../config/cloudinary";

export const getAllBooks = async (req: Request, res: Response) => {
  try {
    const {
      author,
      title,
      category,
      isbn,
      minQuantity,
      page = "1",
      limit = "10",
    } = req.query as {
      author?: string;
      title?: string;
      category?: string;
      isbn?: string;
      minQuantity?: string;
      page?: string;
      limit?: string;
    };

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.max(Number(limit), 1);
    const offset = (pageNum - 1) * limitNum;

    let baseQuery = `
      FROM book b
      LEFT JOIN category c ON b.category_id = c.id
      LEFT JOIN book_image bi 
        ON b.id = bi.book_id AND bi.is_cover = true
    `;

    const conditions: string[] = [];
    const values: any[] = [];

    if (author) {
      values.push(`%${author}%`);
      conditions.push(`b.author ILIKE $${values.length}`);
    }

    if (title) {
      values.push(`%${title}%`);
      conditions.push(`b.title ILIKE $${values.length}`);
    }

    if (isbn) {
      values.push(isbn);
      conditions.push(`b.isbn = $${values.length}`);
    }

    if (category) {
      values.push(`%${category}%`);
      conditions.push(`c.name ILIKE $${values.length}`);
    }

    if (minQuantity) {
      values.push(Number(minQuantity));
      conditions.push(`b.quantity >= $${values.length}`);
    }

    let whereClause = "";
    if (conditions.length) {
      whereClause = ` WHERE ` + conditions.join(" AND ");
    }

    const countQuery = `SELECT COUNT(*) ${baseQuery} ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = Number(countResult.rows[0].count);

    const dataQuery = `
      SELECT 
        b.*, 
        c.name as category,
        bi.image_url
      ${baseQuery}
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `;

    const dataValues = [...values, limitNum, offset];

    const result = await pool.query(dataQuery, dataValues);

    res.json({
      data: result.rows,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      logger.error({
        message: err.message,
        stack: err.stack,
      });
    }
    res.status(500).json({ message: "Server error" });
  }
};

export const getBookById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT 
        b.*, 
        c.name as category,
        bi.image_url
      FROM book b
      LEFT JOIN category c ON b.category_id = c.id
      LEFT JOIN book_image bi 
        ON b.id = bi.book_id AND bi.is_cover = true
      WHERE b.id = $1
      `,
      [id],
    );
    if (!result.rows.length)
      return res.status(404).json({ message: "Book not found" });

    res.json(result.rows[0]);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      logger.error({
        message: err.message,
        stack: err.stack,
      });
    }
    res.status(500).json({ message: "Server error" });
  }
};

export const createBook = async (req: Request, res: Response) => {
  const { title, author, isbn, quantity, category_id } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO book(title, author, isbn, quantity, category_id)
       VALUES($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, author, isbn, quantity, category_id],
    );
    const book = result.rows[0];
    if (req.file) {
      await pool.query(
        `INSERT INTO book_image(book_id, image_url, is_cover)
         VALUES($1, $2, $3)`,
        [book.id, req.file.path, true],
      );
    }
    res.status(201).json(book);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      logger.error({
        message: err.message,
        stack: err.stack,
      });
    }
    res.status(500).json({ message: "Server error" });
  }
};

export const updateBook = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, author, isbn, quantity, category_id } = req.body;

  try {
    const result = await pool.query(
      `UPDATE book
       SET 
         title = $1,
         author = $2,
         isbn = $3,
         quantity = $4,
         category_id = $5,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [title, author, isbn, quantity, category_id, id],
    );

    if (!result.rows.length)
      return res.status(404).json({ message: "Book not found" });

    res.json(result.rows[0]);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      logger.error({
        message: err.message,
        stack: err.stack,
      });
    }
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const images = await pool.query(
      `SELECT image_url FROM book_image WHERE book_id = $1`,
      [id],
    );

    for (const img of images.rows) {
      const publicId = extractPublicId(img.image_url);
      await cloudinary.uploader.destroy(publicId);
    }
    await pool.query("DELETE FROM book WHERE id=$1", [id]);
    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      logger.error({
        message: err.message,
        stack: err.stack,
      });
    }
    res.status(500).json({ message: "Server error" });
  }
};

export const updateBookImage = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const existing = await pool.query(
      `SELECT image_url FROM book_image 
       WHERE book_id = $1 AND is_cover = true`,
      [id],
    );

    if (existing.rows.length) {
      const oldUrl = existing.rows[0].image_url;
      const publicId = extractPublicId(oldUrl);

      await cloudinary.uploader.destroy(publicId);
    }
    await pool.query(
      `DELETE FROM book_image 
       WHERE book_id = $1 AND is_cover = true`,
      [id],
    );

    await pool.query(
      `INSERT INTO book_image (book_id, image_url, is_cover)
       VALUES ($1, $2, true)`,
      [id, req.file.path],
    );

    res.json({ message: "Book image updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
