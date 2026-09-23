import mongoose, { Schema } from "mongoose";

const orderProductSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    colorId: {
      type: Schema.Types.ObjectId,
      default: null,
    },

    colorName: {
      ar: {
        type: String,
        trim: true,
        default: "",
      },
      en: {
        type: String,
        trim: true,
        default: "",
      },
    },

    colorHex: {
      type: String,
      trim: true,
      default: "",
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
      required: true,
    },

    priceAtPurchase: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const ordersSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: {
      type: [orderProductSchema],
      required: true,
      validate: {
        validator: (products) => products.length > 0,
        message: "Order must contain at least one product",
      },
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shipping: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    discount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    couponCode: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingAddress: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },

      lastName: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },

      address: {
        type: String,
        required: true,
        trim: true,
      },
    },

    orderNumber: {
      type: Number,
      required: true,
      unique: true,
    },

    paymentMethod: {
      type: String,
      required: true,
      enum: [
        "Cash On Delivery",
        "Vodafone Cash",
      ],
      default: "Cash On Delivery",
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Canceled",
        "Processing",
        "Out for Delivery",
        "Delivered",
      ],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

ordersSchema.index({ user: 1, createdAt: -1 });
ordersSchema.index({ orderNumber: 1 }, { unique: true });
ordersSchema.index({ status: 1, createdAt: -1 });

const Orders =
  mongoose.models.Order || mongoose.model("Order", ordersSchema);

export default Orders;