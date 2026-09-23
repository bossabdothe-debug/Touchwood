import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    order: {
      type: Schema.Types.ObjectId,
      ref: "order",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// منع المستخدم من مراجعة نفس المنتج
// أكثر من مرة في نفس الطلب
reviewSchema.index(
  {
    user: 1,
    product: 1,
    order: 1,
  },
  {
    unique: true,
  }
);

// تسريع جلب مراجعات المنتج
reviewSchema.index({
  product: 1,
  createdAt: -1,
});

const Review = mongoose.model(
  "Review",
  reviewSchema
);

export default Review;