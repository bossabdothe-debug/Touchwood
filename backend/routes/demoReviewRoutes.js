import express from "express";
import {
  getDemoProductReviews,
} from "../controllers/demoReviewController.js";

const demoReviewRouter = express.Router();

demoReviewRouter.get(
  "/product/:productId",
  getDemoProductReviews,
);

export default demoReviewRouter;