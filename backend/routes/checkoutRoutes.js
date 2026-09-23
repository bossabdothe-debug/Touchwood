import express from "express";
import { checkout } from "../controllers/Checkout.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const checkoutRouter = express.Router();
checkoutRouter.post("/",authMiddleware,checkout);
export default checkoutRouter;