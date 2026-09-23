import express from "express";
import { getOrderById } from "../controllers/Order.js";
import { getOrders } from "../controllers/Order.js";
import { cancelOrder } from "../controllers/Order.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const ordersRouter = express.Router();
ordersRouter.get('/:id',authMiddleware,getOrderById);
ordersRouter.get('/',authMiddleware,getOrders);
ordersRouter.patch('/:id',authMiddleware,cancelOrder)
export default ordersRouter;