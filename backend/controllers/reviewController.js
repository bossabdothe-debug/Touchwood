import mongoose from "mongoose";

import Review from "../models/Review.js";
import Order from "../models/Orders.js";
import Product from "../models/Product.js";

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const reviews = await Review.find({
      product: productId,
    })
      .populate(
        "user",
        "name firstName lastName username"
      )
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      reviews,
    });

  } catch (error) {

    console.error(
      "Get product reviews error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch reviews",
    });
  }
};

export const getOrderReviewStatus = async (
  req,
  res
) => {
  try {

    const { orderId } = req.params;

    const userId = req.user.id;

    if (
      !mongoose.Types.ObjectId.isValid(orderId)
    ) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    })
      .populate(
        "products.product",
        "name image"
      )
      .lean();

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const reviews = await Review.find({
      order: orderId,
      user: userId,
    })
      .select("product")
      .lean();

    const reviewedProductIds =
      reviews.map((review) =>
        String(review.product)
      );

    return res.status(200).json({
      canReview:
        order.status === "Delivered",

      reviewedProductIds,

      products: order.products,
    });

  } catch (error) {

    console.error(
      "Get order review status error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch review status",
    });
  }
};

export const createReview = async (
  req,
  res
) => {
  try {

    const userId = req.user.id;

    const {
      orderId,
      productId,
      rating,
      comment,
    } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(orderId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res.status(400).json({
        message:
          "Invalid order or product ID",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message:
          "Rating must be between 1 and 5",
      });
    }

    const cleanComment =
      typeof comment === "string"
        ? comment.trim()
        : "";

    if (
      cleanComment.length < 3 ||
      cleanComment.length > 1000
    ) {
      return res.status(400).json({
        message:
          "Review must be between 3 and 1000 characters",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).lean();

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.status !== "Delivered") {
      return res.status(400).json({
        message:
          "You can only review delivered orders",
      });
    }

    const purchasedProduct =
      order.products.some(
        (item) =>
          String(item.product) ===
          String(productId)
      );

    if (!purchasedProduct) {
      return res.status(403).json({
        message:
          "You can only review products from this order",
      });
    }

    const existingReview =
      await Review.findOne({
        user: userId,
        product: productId,
        order: orderId,
      });

    if (existingReview) {
      return res.status(409).json({
        message:
          "You have already reviewed this product for this order",
      });
    }

    const review = await Review.create({
      user: userId,
      product: productId,
      order: orderId,
      rating: numericRating,
      comment: cleanComment,
    });

    const stats =
      await Review.aggregate([
        {
          $match: {
            product:
              new mongoose.Types.ObjectId(
                productId
              ),
          },
        },
        {
          $group: {
            _id: "$product",

            averageRating: {
              $avg: "$rating",
            },

            reviewsCount: {
              $sum: 1,
            },
          },
        },
      ]);

    const productStats =
      stats[0] || {
        averageRating: 0,
        reviewsCount: 0,
      };

    await Product.findByIdAndUpdate(
      productId,
      {
        rating: Number(
          productStats.averageRating.toFixed(1)
        ),

        reviewsCount:
          productStats.reviewsCount,
      }
    );

    const populatedReview =
      await Review.findById(
        review._id
      )
        .populate(
          "user",
          "name firstName lastName username"
        )
        .lean();

    return res.status(201).json({
      message:
        "Review added successfully",

      review: populatedReview,
    });

  } catch (error) {

    console.error(
      "Create review error:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "You have already reviewed this product for this order",
      });
    }

    return res.status(500).json({
      message: "Failed to add review",
    });
  }
};