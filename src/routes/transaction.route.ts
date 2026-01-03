import express from "express";
import { protect, authorize } from "../middlewares/auth";
import {
  borrowBook,
  returnBook,
  getMyTransactions,
  getAllTransactions,
} from "../controllers/transaction.controller";
import { requireAuth } from "../utils/requireAuth";

const router = express.Router();

router.post("/borrow", protect, authorize({ roles: ["member"] }), requireAuth(borrowBook));
router.post("/return", protect, authorize({ roles: ["member"] }), returnBook);
router.get("/me", protect, requireAuth(getMyTransactions));
router.get(
  "/",
  protect,
  authorize({ roles: ["librarian", "admin", "super_admin"] }),
  getAllTransactions
);

export default router;
