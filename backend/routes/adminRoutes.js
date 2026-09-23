import express from "express";

import {
  getDashboardStats,
  getAdminOrders,
  updateAdminOrderStatus,
  getAdminProducts,
  getAdminProductById,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminUsers

} from "../controllers/adminController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const adminRouter = express.Router();

adminRouter.use(authMiddleware, adminMiddleware);

adminRouter.get(
  "/dashboard",
  getDashboardStats
);

adminRouter.get(
  "/orders",
  getAdminOrders
);

adminRouter.patch(
  "/orders/:id/status",
  updateAdminOrderStatus
);

adminRouter.get(
  "/products",
  getAdminProducts
);

adminRouter.get(
  "/products/:id",
  getAdminProductById
);

adminRouter.post(
  "/products",
  createAdminProduct
);

adminRouter.put(
  "/products/:id",
  updateAdminProduct
);

adminRouter.delete(
  "/products/:id",
  deleteAdminProduct
);
adminRouter.get(
  "/users",
  getAdminUsers
);

export default adminRouter;