import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "new_order",
        "order_status",
        "new_user",
        "new_product",
        "low_stock",
        "out_of_stock",
      ],
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({
  createdAt: -1,
});

notificationSchema.index({
  read: 1,
  createdAt: -1,
});

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;