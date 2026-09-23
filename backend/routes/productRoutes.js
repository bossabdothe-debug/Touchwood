import express from "express";
import {
  createProduct,
  getProducts,
  updateProduct,
  getProductById,
  deleteProduct,
} from "../controllers/productController.js";
import {
  validateProduct,
  validateupdateProduct,
} from "../middleware/validateProduct.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", getProducts);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  validateProduct,
  createProduct
);

router.get("/:id", getProductById);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateupdateProduct,
  updateProduct
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteProduct
);

export default router;