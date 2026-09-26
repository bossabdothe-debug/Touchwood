import express from "express";

import {
  checkout,
} from "../controllers/Checkout.js";

import {
  optionalAuthMiddleware,
} from "../middleware/optionalAuthMiddleware.js";

const checkoutRouter =
  express.Router();

checkoutRouter.post(
  "/",
  optionalAuthMiddleware,
  checkout
);

export default checkoutRouter;