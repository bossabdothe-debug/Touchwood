import mongoose from "mongoose";
import Product from "../models/Product.js";
import Order from "../models/Orders.js";
import createNotification from "../utils/createNotification.js";

const SHIPPING_COST = 250;

const PAYMENT_METHODS = [
  "Cash On Delivery",
  "Vodafone Cash",
];

const normalizeText = (value) =>
  String(value || "").trim();

const isValidName = (value) => {
  const name = normalizeText(value);

  return (
    name.length >= 2 &&
    name.length <= 50 &&
    /^[\p{L}\s'-]+$/u.test(name)
  );
};

const isValidEmail = (value) => {
  const email = normalizeText(value);

  return (
    email.length >= 5 &&
    email.length <= 150 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email
    )
  );
};

const isValidPhone = (value) => {
  const phone = normalizeText(value);

  return /^\d{11}$/.test(phone);
};

const isValidAddress = (value) => {
  const address = normalizeText(value);

  return (
    address.length >= 5 &&
    address.length <= 300 &&
    !/[\u0000-\u001F\u007F]/.test(
      address
    )
  );
};

export const checkout = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    const userId =
      req.user?.id || null;

    if (
      userId &&
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      return res.status(400).json({
        message: "Invalid user",
      });
    }

    const {
      products,
      paymentMethod,
      shippingAddress,
      couponCode,
    } = req.body;

    if (
      !Array.isArray(products) ||
      products.length === 0
    ) {
      return res.status(400).json({
        message: "Your cart is empty",
      });
    }

    if (
      !shippingAddress ||
      typeof shippingAddress !== "object"
    ) {
      return res.status(400).json({
        message:
          "Shipping information is required",
      });
    }

    const firstName =
      normalizeText(
        shippingAddress.firstName
      );

    const lastName =
      normalizeText(
        shippingAddress.lastName
      );

    const phone =
      normalizeText(
        shippingAddress.phone
      );

    const email =
      normalizeText(
        shippingAddress.email
      ).toLowerCase();

    const address =
      normalizeText(
        shippingAddress.address
      );

    if (!firstName) {
      return res.status(400).json({
        message:
          "First name is required",
        code: "INVALID_FIRST_NAME",
      });
    }

    if (!isValidName(firstName)) {
      return res.status(400).json({
        message:
          "First name contains invalid characters",
        code: "INVALID_FIRST_NAME",
      });
    }

    if (!lastName) {
      return res.status(400).json({
        message:
          "Last name is required",
        code: "INVALID_LAST_NAME",
      });
    }

    if (!isValidName(lastName)) {
      return res.status(400).json({
        message:
          "Last name contains invalid characters",
        code: "INVALID_LAST_NAME",
      });
    }

    if (!phone) {
      return res.status(400).json({
        message:
          "Phone number is required",
        code: "INVALID_PHONE",
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        message:
          "Phone number must contain exactly 11 digits",
        code: "INVALID_PHONE",
      });
    }

    if (!email) {
      return res.status(400).json({
        message:
          "Email is required",
        code: "INVALID_EMAIL",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message:
          "Invalid email address",
        code: "INVALID_EMAIL",
      });
    }

    if (!address) {
      return res.status(400).json({
        message:
          "Address is required",
        code: "INVALID_ADDRESS",
      });
    }

    if (!isValidAddress(address)) {
      return res.status(400).json({
        message:
          "Invalid address",
        code: "INVALID_ADDRESS",
      });
    }

    if (
      !PAYMENT_METHODS.includes(
        paymentMethod
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid payment method",
      });
    }

    const normalizedItems = [];

    for (const item of products) {
      if (
        !item ||
        !item.productId ||
        !mongoose.Types.ObjectId.isValid(
          item.productId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid product ID",
        });
      }

      const quantity = Number(
        item.quantity
      );

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          message:
            "Invalid product quantity",
        });
      }

      let colorId = null;

      if (
        item.colorId !== null &&
        item.colorId !== undefined &&
        item.colorId !== ""
      ) {
        if (
          !mongoose.Types.ObjectId.isValid(
            item.colorId
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid color ID",
          });
        }

        colorId = item.colorId;
      }

      normalizedItems.push({
        productId: item.productId,
        quantity,
        colorId,
      });
    }

    const uniqueItems = new Map();

    for (const item of normalizedItems) {
      const key = `${item.productId}_${
        item.colorId || "default"
      }`;

      if (uniqueItems.has(key)) {
        uniqueItems.get(
          key
        ).quantity += item.quantity;
      } else {
        uniqueItems.set(key, {
          ...item,
        });
      }
    }

    const cartItems =
      Array.from(
        uniqueItems.values()
      );

    session.startTransaction();

    const orderProducts = [];
    const outOfStockProducts = [];
    const lowStockProducts = [];

    let subtotal = 0;

    for (const item of cartItems) {
      const product =
        await Product.findOne({
          _id: item.productId,
          active: true,
        }).session(session);

      if (!product) {
        await session.abortTransaction();

        return res.status(404).json({
          message:
            "One of the products is no longer available",
          productId:
            item.productId,
        });
      }

      let selectedColor = null;

      if (item.colorId) {
        selectedColor =
          product.colors.id(
            item.colorId
          );

        if (!selectedColor) {
          await session.abortTransaction();

          return res.status(400).json({
            message:
              "The selected color is no longer available",
            productId:
              product._id,
            colorId:
              item.colorId,
          });
        }

        if (
          selectedColor.stock <
          item.quantity
        ) {
          await session.abortTransaction();

          return res.status(400).json({
            message:
              "Insufficient stock for selected color",
            productId:
              product._id,
            colorId:
              selectedColor._id,
            availableStock:
              selectedColor.stock,
          });
        }

        selectedColor.stock -=
          item.quantity;

        if (
          selectedColor.stock === 0
        ) {
          outOfStockProducts.push({
            id: product._id,
            name: product.name,
            colorId:
              selectedColor._id,
            colorName:
              selectedColor.name,
          });
        } else if (
          selectedColor.stock <= 5
        ) {
          lowStockProducts.push({
            id: product._id,
            name: product.name,
            colorId:
              selectedColor._id,
            colorName:
              selectedColor.name,
            stock:
              selectedColor.stock,
          });
        }
      } else {
        if (
          product.stock <
          item.quantity
        ) {
          await session.abortTransaction();

          return res.status(400).json({
            message:
              "Insufficient product stock",
            productId:
              product._id,
            availableStock:
              product.stock,
          });
        }

        product.stock -=
          item.quantity;

        if (product.stock === 0) {
          outOfStockProducts.push({
            id: product._id,
            name: product.name,
            colorId: null,
            colorName: null,
          });
        } else if (
          product.stock <= 5
        ) {
          lowStockProducts.push({
            id: product._id,
            name: product.name,
            colorId: null,
            colorName: null,
            stock: product.stock,
          });
        }
      }

      await product.save({
        session,
      });

      const itemTotal =
        product.price *
        item.quantity;

      subtotal += itemTotal;

      orderProducts.push({
        product: product._id,

        colorId: selectedColor
          ? selectedColor._id
          : null,

        colorName: selectedColor
          ? {
              ar:
                selectedColor.name.ar,
              en:
                selectedColor.name.en,
            }
          : {
              ar: "",
              en: "",
            },

        colorHex:
          selectedColor
            ? selectedColor.hex
            : "",

        quantity:
          item.quantity,

        priceAtPurchase:
          product.price,
      });
    }

    const shipping =
      SHIPPING_COST;

    let discount = 0;
    let appliedCouponCode = null;

    if (
      couponCode &&
      typeof couponCode ===
        "string" &&
      couponCode.trim()
    ) {
      const code =
        couponCode
          .trim()
          .toUpperCase();

      if (code === "WELCOME10") {
        discount =
          subtotal * 0.1;

        appliedCouponCode =
          code;
      } else {
        await session.abortTransaction();

        return res.status(400).json({
          message:
            "Invalid discount code",
        });
      }
    }

    const totalPrice =
      subtotal +
      shipping -
      discount;

    if (totalPrice < 0) {
      await session.abortTransaction();

      return res.status(400).json({
        message:
          "Invalid order total",
      });
    }

    let orderNumber;
    let orderNumberExists = true;

    while (orderNumberExists) {
      orderNumber =
        Math.floor(
          100000 +
            Math.random() *
              900000
        );

      const existingOrder =
        await Order.findOne({
          orderNumber,
        }).session(session);

      orderNumberExists =
        Boolean(existingOrder);
    }

    const [newOrder] =
      await Order.create(
        [
          {
            user: userId,

            orderNumber,

            products:
              orderProducts,

            subtotal,

            shipping,

            discount,

            couponCode:
              appliedCouponCode,

            totalPrice,

            shippingAddress: {
              firstName,

              lastName,

              phone,

              email,

              address,
            },

            paymentMethod,

            status:
              "Pending",
          },
        ],
        {
          session,
        }
      );

    await session.commitTransaction();

    for (const product of outOfStockProducts) {
      await createNotification({
        type: "out_of_stock",

        title:
          "Product Out of Stock",

        message: `${
          product.name.en ||
          product.name.ar
        } is now out of stock.`,

        product:
          product.id,
      });
    }

    for (const product of lowStockProducts) {
      if (
        !outOfStockProducts.some(
          (item) =>
            item.id.toString() ===
            product.id.toString()
        )
      ) {
        await createNotification({
          type: "low_stock",

          title:
            "Low Product Stock",

          message: `${
            product.name.en ||
            product.name.ar
          } has only ${
            product.stock
          } items left.`,

          product:
            product.id,
        });
      }
    }

    await createNotification({
      type: "new_order",

      title:
        "New Order Received",

      message:
        `New order #${newOrder.orderNumber} has been placed.`,

      order:
        newOrder._id,

      user:
        userId,
    });

    const populatedOrder =
      await Order.findById(
        newOrder._id
      ).populate(
        "products.product",
        "name slug price media"
      );

    return res.status(201).json({
      message:
        "Order has been placed",

      order:
        populatedOrder,

      pricing: {
        subtotal,

        shipping,

        discount,

        couponCode:
          appliedCouponCode,

        total:
          totalPrice,
      },

      customerType:
        userId
          ? "user"
          : "guest",
    });
  } catch (error) {
    if (
      session.inTransaction()
    ) {
      await session.abortTransaction();
    }

    console.error(
      "Checkout transaction error:",
      error
    );

    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        message:
          "Order number already exists",
      });
    }

    return res.status(500).json({
      message:
        "Server error",
    });
  } finally {
    await session.endSession();
  }
};