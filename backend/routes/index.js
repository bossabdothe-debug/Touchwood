import express from "express";
import router from "./productRoutes.js";
import ordersRouter from "./orderRoutes.js";
import checkoutRouter from "./checkoutRoutes.js";
import authRouter from "./authRoutes.js";
import adminRouter from "./adminRoutes.js";
import notificationRouter from "./notificationRoutes.js";
import reviewRouter from "./reviewRoutes.js";
import uploadRouter from "./uploadRoutes.js";

const Router = express.Router();

Router.use("/products", router);

Router.use("/orders", ordersRouter);

Router.use("/checkout", checkoutRouter);

Router.use("/user", authRouter);

Router.use("/admin", adminRouter);

Router.use(
  "/admin/notifications",
  notificationRouter
);

Router.use(
  "/reviews",
  reviewRouter
);

Router.use(
  "/uploads",
  uploadRouter
);

export default Router;