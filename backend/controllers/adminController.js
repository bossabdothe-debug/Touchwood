import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Orders.js";
import mongoose from "mongoose";
import createNotification from "../utils/createNotification.js";

const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Out for Delivery",
  "Delivered",
  "Canceled",
];

const ALLOWED_STATUS_TRANSITIONS = {
  Pending: ["Processing", "Canceled"],
  Processing: ["Out for Delivery", "Canceled"],
  "Out for Delivery": ["Delivered"],
  Delivered: [],
  Canceled: [],
};

const PRODUCT_FIELDS = [
  "name",
  "description",
  "slug",
  "category",
  "price",
  "oldPrice",
  "serialNumber",
  "media",
  "colors",
  "stock",
  "specifications",
  "featured",
  "badge",
  "rating",
  "reviewsCount",
  "active",
];

const buildProductData = (body) => {
  const data = {};

  for (const field of PRODUCT_FIELDS) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }

  return data;
};

const validationMessage = (error) => {
  if (error?.name !== "ValidationError") {
    return null;
  }

  return Object.values(error.errors)
    .map((item) => item.message)
    .join(", ");
};

/* =========================================================
   DASHBOARD
========================================================= */

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalOrders,
      totalUsers,
      totalProducts,
      deliveredSalesResult,
      recentOrders,
      salesOverview,
      statusCountsResult,
    ] = await Promise.all([
      Order.countDocuments(),

      User.countDocuments({
        role: "user",
      }),

      Product.countDocuments(),

      Order.aggregate([
        {
          $match: {
            status: "Delivered",
          },
        },
        {
          $group: {
            _id: null,
            totalSales: {
              $sum: "$totalPrice",
            },
          },
        },
      ]),

      Order.find()
        .populate("user", "name email phone")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      Order.aggregate([
        {
          $match: {
            status: "Delivered",
          },
        },
        {
          $project: {
            totalPrice: 1,
            orderDate: "$createdAt",
          },
        },
        {
          $group: {
            _id: {
              year: {
                $year: "$orderDate",
              },
              month: {
                $month: "$orderDate",
              },
            },
            sales: {
              $sum: "$totalPrice",
            },
            orders: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]),

      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },
      ]),
    ]);

    const totalSales =
      deliveredSalesResult.length > 0
        ? deliveredSalesResult[0].totalSales
        : 0;

    const orderStatusStats = {
      Pending: 0,
      Processing: 0,
      "Out for Delivery": 0,
      Delivered: 0,
      Canceled: 0,
    };

    statusCountsResult.forEach((item) => {
      if (
        Object.prototype.hasOwnProperty.call(
          orderStatusStats,
          item._id
        )
      ) {
        orderStatusStats[item._id] = item.count;
      }
    });

    const formattedSalesOverview = salesOverview.map(
      (item) => ({
        year: item._id.year,
        month: item._id.month,
        sales: item.sales,
        orders: item.orders,
      })
    );

    return res.status(200).json({
      totalSales,
      totalOrders,
      totalUsers,
      totalProducts,
      recentOrders,
      salesOverview: formattedSalesOverview,
      orderStatusStats,
    });
  } catch (error) {
    console.error(
      "Admin dashboard error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error, please try again later",
    });
  }
};

/* =========================================================
   PRODUCTS
========================================================= */

export const getAdminProducts = async (
  req,
  res
) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      products,
    });
  } catch (error) {
    console.error(
      "Get admin products error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error, please try again later",
    });
  }
};

export const getAdminProductById = async (
  req,
  res
) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid product ID",
    });
  }

  try {
    const product = await Product.findById(id)
      .lean();

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      product,
    });
  } catch (error) {
    console.error(
      "Get admin product error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error, please try again later",
    });
  }
};

export const createAdminProduct = async (
  req,
  res
) => {
  try {
    const productData = buildProductData(
      req.body
    );

    /* =========================
       NAME
    ========================= */

    if (
      !productData.name ||
      typeof productData.name !== "object"
    ) {
      return res.status(400).json({
        message:
          "Product name in Arabic and English is required",
      });
    }

    /* =========================
       DESCRIPTION
    ========================= */

    if (
      !productData.description ||
      typeof productData.description !== "object"
    ) {
      return res.status(400).json({
        message:
          "Product description in Arabic and English is required",
      });
    }

    /* =========================
       SLUG
    ========================= */

    if (!productData.slug) {
      return res.status(400).json({
        message: "Product slug is required",
      });
    }

    /* =========================
       CATEGORY
       Category is a String,
       not an ObjectId
    ========================= */

    if (
      !productData.category ||
      typeof productData.category !== "string" ||
      !productData.category.trim()
    ) {
      return res.status(400).json({
        message: "Valid category is required",
      });
    }

    productData.category = productData.category
      .trim()
      .toLowerCase();

    /* =========================
       PRICE
    ========================= */

    if (
      productData.price === undefined ||
      productData.price === null ||
      productData.price === ""
    ) {
      return res.status(400).json({
        message: "Product price is required",
      });
    }

    /* =========================
       DUPLICATE CHECK
    ========================= */

    const duplicateConditions = [
      {
        slug: productData.slug
          .toString()
          .trim()
          .toLowerCase(),
      },
    ];

    if (productData.serialNumber) {
      duplicateConditions.push({
        serialNumber: productData.serialNumber
          .toString()
          .trim(),
      });
    }

    const existingProduct =
      await Product.findOne({
        $or: duplicateConditions,
      });

    if (existingProduct) {
      return res.status(409).json({
        message:
          "A product with the same slug or serialNumber already exists",
      });
    }

    /* =========================
       NORMALIZE DATA
    ========================= */

    productData.slug = productData.slug
      .toString()
      .trim()
      .toLowerCase();

    if (productData.serialNumber) {
      productData.serialNumber =
        productData.serialNumber
          .toString()
          .trim();
    }

    /* =========================
       CREATE PRODUCT
    ========================= */

    const product = await Product.create(
      productData
    );

    const createdProduct =
      await Product.findById(product._id).lean();

    return res.status(201).json({
      message:
        "Product created successfully",
      product: createdProduct,
    });
  } catch (error) {
    console.error(
      "Create admin product error:",
      error
    );

    const message = validationMessage(
      error
    );

    if (message) {
      return res.status(400).json({
        message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "A product with the same slug or serialNumber already exists",
      });
    }

    return res.status(500).json({
      message:
        "Server error, please try again later",
    });
  }
};

export const updateAdminProduct = async (
  req,
  res
) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid product ID",
    });
  }

  try {
    const productData = buildProductData(
      req.body
    );

    if (
      Object.keys(productData).length === 0
    ) {
      return res.status(400).json({
        message:
          "No product data provided",
      });
    }

    const existingProduct =
      await Product.findById(id);

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    /* =========================
       CATEGORY
    ========================= */

    if (productData.category !== undefined) {
      if (
        typeof productData.category !== "string" ||
        !productData.category.trim()
      ) {
        return res.status(400).json({
          message: "Valid category is required",
        });
      }

      productData.category =
        productData.category
          .trim()
          .toLowerCase();
    }

    /* =========================
       SLUG
    ========================= */

    if (productData.slug) {
      productData.slug =
        productData.slug
          .toString()
          .trim()
          .toLowerCase();

      const duplicateSlug =
        await Product.findOne({
          slug: productData.slug,
          _id: {
            $ne: id,
          },
        });

      if (duplicateSlug) {
        return res.status(409).json({
          message:
            "This product slug is already in use",
        });
      }
    }

    /* =========================
       SERIAL NUMBER
    ========================= */

    if (productData.serialNumber) {
      productData.serialNumber =
        productData.serialNumber
          .toString()
          .trim();

      const duplicateSerialNumber =
        await Product.findOne({
          serialNumber:
            productData.serialNumber,
          _id: {
            $ne: id,
          },
        });

      if (duplicateSerialNumber) {
        return res.status(409).json({
          message:
            "This product serialNumber is already in use",
        });
      }
    }

    /* =========================
       PREVIOUS STOCK
    ========================= */

    const previousStock =
      Number(existingProduct.stock || 0);

    const previousColors =
      existingProduct.colors || [];

    /* =========================
       UPDATE PRODUCT
    ========================= */

    const product =
      await Product.findByIdAndUpdate(
        id,
        {
          $set: productData,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    /* =========================
       STOCK NOTIFICATIONS
    ========================= */

    const newStock =
      Number(product.stock || 0);

    if (
      previousStock > 0 &&
      newStock === 0
    ) {
      await createNotification({
        type: "out_of_stock",
        title: "Product Out of Stock",
        message: `${
          product.name.en ||
          product.name.ar
        } is now out of stock.`,
        product: product._id,
      });
    } else if (
      previousStock > 5 &&
      newStock <= 5
    ) {
      await createNotification({
        type: "low_stock",
        title: "Low Product Stock",
        message: `${
          product.name.en ||
          product.name.ar
        } has only ${newStock} items left.`,
        product: product._id,
      });
    }

    /* =========================
       COLOR STOCK NOTIFICATIONS
    ========================= */

    const currentColors =
      product.colors || [];

    for (const color of currentColors) {
      const previousColor =
        previousColors.find(
          (item) =>
            item._id?.toString() ===
            color._id?.toString()
        );

      const previousColorStock =
        previousColor
          ? Number(
              previousColor.stock || 0
            )
          : 0;

      const currentColorStock =
        Number(color.stock || 0);

      if (
        previousColorStock > 0 &&
        currentColorStock === 0
      ) {
        await createNotification({
          type: "out_of_stock",
          title:
            "Product Color Out of Stock",
          message: `${
            product.name.en ||
            product.name.ar
          } - ${
            color.name.en ||
            color.name.ar
          } is now out of stock.`,
          product: product._id,
        });
      } else if (
        previousColorStock > 5 &&
        currentColorStock <= 5
      ) {
        await createNotification({
          type: "low_stock",
          title:
            "Low Product Color Stock",
          message: `${
            product.name.en ||
            product.name.ar
          } - ${
            color.name.en ||
            color.name.ar
          } has only ${currentColorStock} items left.`,
          product: product._id,
        });
      }
    }

    const updatedProduct =
      await Product.findById(
        product._id
      ).lean();

    return res.status(200).json({
      message:
        "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(
      "Update admin product error:",
      error
    );

    const message = validationMessage(
      error
    );

    if (message) {
      return res.status(400).json({
        message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "A product with the same slug or serialNumber already exists",
      });
    }

    return res.status(500).json({
      message:
        "Server error, please try again later",
    });
  }
};

export const deleteAdminProduct = async (
  req,
  res
) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid product ID",
    });
  }

  try {
    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const existingOrder =
      await Order.findOne({
        "products.product": id,
      });

    if (existingOrder) {
      return res.status(400).json({
        message:
          "This product cannot be deleted because it exists in an order",
      });
    }

    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      message:
        "Product deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete admin product error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error, please try again later",
    });
  }
};

/* =========================================================
   ORDERS
========================================================= */

export const getAdminOrders = async (
  req,
  res
) => {
  try {
    const orders = await Order.find()
      .populate(
        "user",
        "name email phone"
      )
      .populate(
        "products.product",
        "name slug price media"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      orders,
    });
  } catch (error) {
    console.error(
      "Get admin orders error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error, please try again later",
    });
  }
};

export const updateAdminOrderStatus =
  async (req, res) => {
    const { status } = req.body;
    const { id: orderId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        orderId
      )
    ) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const session =
      await mongoose.startSession();

    try {
      session.startTransaction();

      const order =
        await Order.findById(orderId)
          .session(session);

      if (!order) {
        await session.abortTransaction();

        return res.status(404).json({
          message: "Order not found",
        });
      }

      if (order.status === status) {
        await session.abortTransaction();

        return res.status(200).json({
          message:
            "Order status is already up to date",
        });
      }

      const allowedStatuses =
        ALLOWED_STATUS_TRANSITIONS[
          order.status
        ] || [];

      if (!allowedStatuses.includes(status)) {
        await session.abortTransaction();

        return res.status(400).json({
          message: `Cannot change order status from ${order.status} to ${status}`,
        });
      }

      if (status === "Canceled") {
        for (const item of order.products) {
          const product =
            await Product.findById(
              item.product
            ).session(session);

          if (!product) {
            continue;
          }

          if (item.colorId) {
            const color =
              product.colors.id(
                item.colorId
              );

            if (color) {
              color.stock += Number(
                item.quantity || 0
              );
            }
          } else {
            product.stock += Number(
              item.quantity || 0
            );
          }

          await product.save({
            session,
            validateBeforeSave: true,
          });
        }
      }

      order.status = status;

      await order.save({
        session,
        validateBeforeSave: true,
      });

      await session.commitTransaction();

      const updatedOrder =
        await Order.findById(orderId)
          .populate(
            "user",
            "name email phone"
          )
          .populate(
            "products.product",
            "name slug price media stock colors"
          )
          .lean();

      try {
        await createNotification({
          type: "order_status",
          title:
            "Order Status Updated",
          message: `Order #${updatedOrder.orderNumber} is now ${updatedOrder.status}.`,
          order: updatedOrder._id,
          user:
            updatedOrder.user?._id ||
            updatedOrder.user,
        });
      } catch (notificationError) {
        console.error(
          "Create order status notification error:",
          notificationError
        );
      }

      return res.status(200).json({
        message:
          "Order status updated successfully",
        order: updatedOrder,
      });
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      console.error(
        "Update admin order status error:",
        error
      );

      return res.status(500).json({
        message:
          "Server error, please try again later",
      });
    } finally {
      await session.endSession();
    }
  };

/* =========================================================
   USERS
========================================================= */

export const getAdminUsers = async (
  req,
  res
) => {
  try {
    const users = await User.find()
      .select(
        "name email phone role"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      users,
    });
  } catch (error) {
    console.error(
      "Get admin users error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error, please try again later",
    });
  }
};