import pool from '../db.js';
import bcrypt from 'bcrypt';

export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, role FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

export const createUser = async (req, res) => {
  const { username, password, role = "member" } = req.body;
  const currentUserRole = req.user.role;

  if (role === 'super_admin' && currentUserRole !== 'super_admin') {
    return res.status(403).json({ message: 'Cannot create super_admin' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users(username, password, role) VALUES($1, $2, $3) RETURNING id, username, role',
      [username, hashed, role]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const currentUserRole = req.user.role;

  if (role === 'super_admin' && currentUserRole !== 'super_admin') {
    return res.status(403).json({ message: 'Cannot assign super_admin role' });
  }
  
  try {
    const result = await pool.query(
      'UPDATE users SET role=$1 WHERE id=$2 RETURNING id, username, role',
      [role, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id=$1', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
