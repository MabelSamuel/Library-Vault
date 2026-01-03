import express from "express";
import { protect, authorize } from "../middlewares/auth";
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/book.controller";

const router = express.Router();

router.get("/", protect, getAllBooks);
router.get("/:id", protect, getBookById);
router.post(
  "/",
  protect,
  authorize({ roles: ["librarian", "admin", "super_admin"] }),
  createBook
);
router.put(
  "/:id",
  protect,
  authorize({ roles: ["librarian", "admin", "super_admin"] }),
  updateBook
);
router.delete(
  "/:id",
  protect,
  authorize({ roles: ["admin", "super_admin"] }),
  deleteBook
);

export default router;
