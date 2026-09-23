import express from "express";

import {
  getAdminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const notificationRouter =
  express.Router();

notificationRouter.use(
  authMiddleware,
  adminMiddleware
);

notificationRouter.get(
  "/",
  getAdminNotifications
);

notificationRouter.patch(
  "/:id/read",
  markNotificationAsRead
);

notificationRouter.patch(
  "/read-all",
  markAllNotificationsAsRead
);

notificationRouter.delete(
  "/:id",
  deleteNotification
);

export default notificationRouter;