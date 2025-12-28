import pool from '../db.js';

export const getAllBooks = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBookById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM books WHERE id=$1', [id]);
    if (!result.rows.length)
      return res.status(404).json({ message: 'Book not found' });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createBook = async (req, res) => {
  const { title, author, isbn, quantity } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO books(title, author, isbn, quantity)
       VALUES($1, $2, $3, $4)
       RETURNING *`,
      [title, author, isbn, quantity]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateBook = async (req, res) => {
  const { id } = req.params;
  const { title, author, quantity } = req.body;

  try {
    const result = await pool.query(
      `UPDATE books
       SET title=$1, author=$2, quantity=$3
       WHERE id=$4
       RETURNING *`,
      [title, author, quantity, id]
    );

    if (!result.rows.length)
      return res.status(404).json({ message: 'Book not found' });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteBook = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM books WHERE id=$1', [id]);
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
