import express from "express";
import { protect, authorize } from "../middlewares/auth";
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  updateBookImage,
} from "../controllers/book.controller";
import { cache } from "../middlewares/cache";
import { upload } from "../middlewares/upload";

const router = express.Router();

router.get("/", protect, cache(120), getAllBooks);
router.get("/:id", protect, cache(120), getBookById);
router.post(
  "/",
  protect,
  authorize({ roles: ["librarian", "admin", "super_admin"] }),
  upload.single("image"),
  createBook,
);
router.put(
  "/:id",
  protect,
  authorize({ roles: ["librarian", "admin", "super_admin"] }),
  updateBook,
);
router.put(
  "/:id/image",
  protect,
  authorize({ roles: ["librarian", "admin", "super_admin"] }),
  upload.single("image"),
  updateBookImage,
);
router.delete(
  "/:id",
  protect,
  authorize({ roles: ["admin", "super_admin"] }),
  deleteBook,
);

export default router;
