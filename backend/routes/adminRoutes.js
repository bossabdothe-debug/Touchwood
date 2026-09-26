import express from "express";

import {
  getDashboardStats,
  getAdminOrders,
  getAdminOrderById,
  createAdminOrder,
  updateAdminOrder,
  deleteAdminOrder,
  updateAdminOrderStatus,
  getAdminProducts,
  getAdminProductById,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminUsers,updateAdminSettings,getAdminSettings
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
  "/orders/:id",
  getAdminOrderById
);

adminRouter.post(
  "/orders",
  createAdminOrder
);

adminRouter.put(
  "/orders/:id",
  updateAdminOrder
);

adminRouter.delete(
  "/orders/:id",
  deleteAdminOrder
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
adminRouter.get(
  "/settings",
  getAdminSettings
);

adminRouter.patch(
  "/settings",
  updateAdminSettings
);
export default adminRouter;