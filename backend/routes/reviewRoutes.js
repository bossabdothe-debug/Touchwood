import express from "express";

import {
  getProductReviews,
  getOrderReviewStatus,
  createReview,
} from "../controllers/reviewController.js";

import {
  authMiddleware,
} from "../middleware/authMiddleware.js";


const reviewRouter =
  express.Router();


// Public
// جلب مراجعات المنتج

reviewRouter.get(
  "/product/:productId",
  getProductReviews
);


// User
// معرفة المنتجات التي تمت مراجعتها

reviewRouter.get(
  "/order/:orderId/status",
  authMiddleware,
  getOrderReviewStatus
);


// User
// إضافة مراجعة

reviewRouter.post(
  "/",
  authMiddleware,
  createReview
);


export default reviewRouter;