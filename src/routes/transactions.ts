import express from "express";
import { protect, authorize } from "../middlewares/auth.js";
import {
  borrowBook,
  returnBook,
  getMyTransactions,
  getAllTransactions,
} from "../controllers/transactions.js";

const router = express.Router();

router.post("/borrow", protect, authorize({ roles: ["member"] }), borrowBook);
router.post("/return", protect, authorize({ roles: ["member"] }), returnBook);
router.get("/me", protect, getMyTransactions);
router.get(
  "/",
  protect,
  authorize({ roles: ["librarian", "admin", "super_admin"] }),
  getAllTransactions
);

export default router;
