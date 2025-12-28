import express from 'express';
import dotenv from "dotenv";
import pool from './db.js';
import authRoutes from './routes/auth.js';
import userRoutes from "./routes/users.js";
import bookRoutes from "./routes/books.js";
import transactionRoutes from "./routes/transactions.js";

dotenv.config();

const app = express()
const port = process.env.PORT

app.use(express.json());

async function startServer() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('PostgreSQL connected:', res.rows[0]);

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to connect to PostgreSQL:', err);
    process.exit(1);
  }
}

startServer();

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/transactions', transactionRoutes);

app.get('/', (req, res) => {
  res.send('RBAC for Library!')
})

