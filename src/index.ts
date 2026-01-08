import express from 'express';
import type { Request, Response } from 'express';
import dotenv from "dotenv";
import pool from '../src/db';
import cors from "cors";
import type { CorsOptions } from 'cors';
import authRoutes from './routes/auth.route';
import userRoutes from "./routes/user.route";
import bookRoutes from "./routes/book.route";
import transactionRoutes from "./routes/transaction.route";

dotenv.config();

const app = express()
const port = process.env.PORT

const allowedOrigins = [process.env.FRONTEND_URL, process.env.DEV_URL].filter(Boolean) as string[];

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (process.env.NODE_ENV === "development") {
      callback(null, true);
    } 
    else if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

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