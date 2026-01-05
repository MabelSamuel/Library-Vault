import express from 'express';
import type { Request, Response } from 'express';
import dotenv from "dotenv";
import pool from '../src/db';
import authRoutes from './routes/auth.route';
import userRoutes from "./routes/user.route";
import bookRoutes from "./routes/book.route";
import transactionRoutes from "./routes/transaction.route";

dotenv.config();

const app = express()
const port = process.env.PORT

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/book', bookRoutes);
app.use('/api/v1/transaction', transactionRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('RBAC for Library!')
})

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