import mongoose from "mongoose";

const { Schema } = mongoose;

const demoReviewSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    nameAr: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    nameEn: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    rating: {
      type: Number,
      required: true,
      min: 4,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Demo rating must be an integer between 4 and 5",
      },
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 1000,
    },

    language: {
      type: String,
      enum: ["ar", "en"],
      required: true,
    },

    isDemo: {
      type: Boolean,
      default: true,
      immutable: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

demoReviewSchema.index({
  product: 1,
  createdAt: -1,
});

const DemoReview =
  mongoose.models.DemoReview ||
  mongoose.model("DemoReview", demoReviewSchema);

export default DemoReview;