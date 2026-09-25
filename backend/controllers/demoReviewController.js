import mongoose from "mongoose";
import DemoReview from "../models/DemoReview.js";

export const getDemoProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const reviews = await DemoReview.find({
      product: productId,
      isDemo: true,
    })
      .select(
        "_id product name nameAr nameEn rating comment language isDemo createdAt",
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      reviews,
    });
  } catch (error) {
    console.error(
      "Get demo product reviews error:",
      error,
    );

    return res.status(500).json({
      message: "Failed to fetch demo reviews",
    });
  }
};