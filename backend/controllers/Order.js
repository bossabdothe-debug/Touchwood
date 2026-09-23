import Order from "../models/Orders.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({
      user: userId,
    })
      .populate("products.product")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      message: "Server Error, please try again later",
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      user: userId,
      _id: orderId,
    }).populate("products.product");

    if (!order) {
      return res.status(404).json({
        message: "There is no Order for this user",
      });
    }

    return res.status(200).json({
      order,
    });
  } catch (error) {
    console.error("Get order by id error:", error);

    return res.status(500).json({
      message: "Server Error, please try again later",
    });
  }
};

export const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    session.startTransaction();

    const order = await Order.findOne({
      user: userId,
      _id: orderId,
    }).session(session);

    if (!order) {
      await session.abortTransaction();

      return res.status(404).json({
        message: "Order has not been found",
      });
    }

    if (order.status !== "Pending") {
      await session.abortTransaction();

      return res.status(400).json({
        message: "Order can not be canceled",
      });
    }

    for (const item of order.products) {
      const product = await Product.findById(item.product).session(
        session
      );

      if (!product) {
        continue;
      }

      if (item.colorId) {
        const color = product.colors.id(item.colorId);

        if (color) {
          color.stock += item.quantity;
        } else {
          product.stock += item.quantity;
        }
      } else {
        product.stock += item.quantity;
      }

      await product.save({
        session,
      });
    }

    order.status = "Canceled";

    await order.save({
      session,
    });

    await session.commitTransaction();

    const populatedOrder = await Order.findById(order._id).populate(
      "products.product"
    );

    return res.status(200).json({
      message: "Your order has been canceled",
      order: populatedOrder,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error("Cancel order error:", error);

    return res.status(500).json({
      message: "Server error, please try again later",
    });
  } finally {
    await session.endSession();
  }
};

export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const userId = req.user.id;

    const {
      products,
      shippingAddress,
      orderNumber,
      paymentMethod,
      shipping = 0,
      discount = 0,
      couponCode = null,
    } = req.body;

    if (
      !shippingAddress ||
      typeof shippingAddress !== "object"
    ) {
      return res.status(400).json({
        message: "Shipping address is required",
      });
    }

    const requiredAddressFields = [
      "firstName",
      "lastName",
      "phone",
      "email",
      "address",
    ];

    for (const field of requiredAddressFields) {
      if (
        !shippingAddress[field] ||
        String(shippingAddress[field]).trim() === ""
      ) {
        return res.status(400).json({
          message: `${field} is required`,
        });
      }
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        message: "Order products are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (
      orderNumber === undefined ||
      orderNumber === null ||
      !Number.isFinite(Number(orderNumber))
    ) {
      return res.status(400).json({
        message: "Valid order number is required",
      });
    }

    const validPaymentMethods = [
      "Cash On Delivery",
      "Visa",
      "Vodafone Cash",
    ];

    if (
      paymentMethod &&
      !validPaymentMethods.includes(paymentMethod)
    ) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    const shippingValue = Number(shipping);
    const discountValue = Number(discount);

    if (
      !Number.isFinite(shippingValue) ||
      shippingValue < 0
    ) {
      return res.status(400).json({
        message: "Invalid shipping amount",
      });
    }

    if (
      !Number.isFinite(discountValue) ||
      discountValue < 0
    ) {
      return res.status(400).json({
        message: "Invalid discount amount",
      });
    }

    const normalizedProducts = [];

    for (const item of products) {
      if (
        !item.product ||
        !mongoose.Types.ObjectId.isValid(item.product)
      ) {
        return res.status(400).json({
          message: "Invalid product ID",
        });
      }

      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          message: "Invalid product quantity",
        });
      }

      const product = await Product.findOne({
        _id: item.product,
        active: true,
      }).session(session);

      if (!product) {
        return res.status(404).json({
          message: "One of the products was not found",
        });
      }

      let color = null;

      if (item.colorId) {
        if (
          !mongoose.Types.ObjectId.isValid(
            item.colorId
          )
        ) {
          return res.status(400).json({
            message: "Invalid color ID",
          });
        }

        color = product.colors.id(item.colorId);

        if (!color) {
          return res.status(404).json({
            message: "Selected product color was not found",
          });
        }

        if (color.stock < quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${product.name.ar || product.name.en}`,
          });
        }

        color.stock -= quantity;
      } else {
        if (product.stock < quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${product.name.ar || product.name.en}`,
          });
        }

        product.stock -= quantity;
      }

      await product.save({
        session,
      });

      normalizedProducts.push({
        product: product._id,
        colorId: color ? color._id : null,
        colorName: color
          ? {
              ar: color.name.ar,
              en: color.name.en,
            }
          : {
              ar: "",
              en: "",
            },
        colorHex: color ? color.hex : "",
        quantity,
        priceAtPurchase: product.price,
      });
    }

    const subtotal = normalizedProducts.reduce(
      (total, item) => {
        return (
          total +
          item.priceAtPurchase * item.quantity
        );
      },
      0
    );

    if (discountValue > subtotal) {
      return res.status(400).json({
        message: "Discount cannot exceed subtotal",
      });
    }

    const totalPrice =
      subtotal +
      shippingValue -
      discountValue;

    if (totalPrice < 0) {
      return res.status(400).json({
        message: "Invalid total price",
      });
    }

    session.startTransaction();

    const order = new Order({
      user: userId,
      products: normalizedProducts,
      subtotal,
      shipping: shippingValue,
      discount: discountValue,
      couponCode,
      totalPrice,
      shippingAddress: {
        firstName: shippingAddress.firstName.trim(),
        lastName: shippingAddress.lastName.trim(),
        phone: shippingAddress.phone.trim(),
        email: shippingAddress.email.trim().toLowerCase(),
        address: shippingAddress.address.trim(),
      },
      orderNumber: Number(orderNumber),
      paymentMethod:
        paymentMethod || "Cash On Delivery",
    });

    await order.save({
      session,
    });

    await session.commitTransaction();

    const populatedOrder = await Order.findById(
      order._id
    ).populate("products.product");

    return res.status(201).json({
      message: "Order created successfully",
      order: populatedOrder,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error("Create order error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Order number already exists",
      });
    }

    return res.status(500).json({
      message: "Server error, please try again later",
    });
  } finally {
    await session.endSession();
  }
};