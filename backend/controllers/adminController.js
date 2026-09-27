import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Orders.js";
import mongoose from "mongoose";
import createNotification from "../utils/createNotification.js";
import bcrypt from "bcryptjs";


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

export const getDashboardStats = async (
  req,
  res
) => {
  try {
    const [
      totalOrders,
      totalUsers,
      totalProducts,
      deliveredSalesResult,
      recentOrders,
      statusCountsResult,
      salesOverview,
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
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .populate(
          "user",
          "name email phone role"
        )
        .populate(
          "products.product",
          "name price images"
        )
        .lean(),

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

      Order.aggregate([
        {
          $match: {
            createdAt: {
              $exists: true,
              $ne: null,
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "Africa/Cairo",
              },
            },
            sales: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "Delivered",
                    ],
                  },
                  {
                    $ifNull: [
                      "$totalPrice",
                      0,
                    ],
                  },
                  0,
                ],
              },
            },
            orders: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),
    ]);

    const orderStatusStats = {
      Pending: 0,
      Processing: 0,
      "Out for Delivery": 0,
      Delivered: 0,
      Canceled: 0,
    };

    statusCountsResult.forEach(
      (item) => {
        if (
          Object.prototype.hasOwnProperty.call(
            orderStatusStats,
            item._id
          )
        ) {
          orderStatusStats[item._id] =
            item.count;
        }
      }
    );

    return res.status(200).json({
      totalSales:
        deliveredSalesResult[0]
          ?.totalSales || 0,

      totalOrders,

      totalUsers,

      totalProducts,

      recentOrders,

      salesOverview:
        salesOverview.map(
          (item) => ({
            date: item._id,
            sales: item.sales,
            orders: item.orders,
          })
        ),

      orderStatusStats,
    });
  } catch (error) {
    console.error(
      "Get dashboard stats error:",
      error
    );

    return res.status(500).json({
      message:
        "حدث خطأ في الخادم، يرجى المحاولة مرة أخرى لاحقًا",
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

/* =========================================================
   ORDERS
========================================================= */

const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Out for Delivery",
  "Delivered",
  "Canceled",
];

const PAYMENT_METHODS = [
  "Cash On Delivery",
  "Vodafone Cash",
];

const RESERVED_ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Out for Delivery",
];

const normalizeAddress = (address = {}) => ({
  firstName: String(address.firstName || "").trim(),
  lastName: String(address.lastName || "").trim(),
  phone: String(address.phone || "").trim(),
  email: String(address.email || "").trim().toLowerCase(),
  address: String(address.address || "").trim(),
});

const validateAddress = (address) => {
  const normalized = normalizeAddress(address);

  const fields = [
    "firstName",
    "lastName",
    "phone",
    "email",
    "address",
  ];

  for (const field of fields) {
    if (!normalized[field]) {
      return `${field} is required`;
    }
  }

  return null;
};

const normalizeOrderProducts = (products) => {
  if (!Array.isArray(products) || products.length === 0) {
    return null;
  }

  const normalized = [];

  for (const item of products) {
    if (
      !item ||
      !item.product ||
      !mongoose.Types.ObjectId.isValid(item.product)
    ) {
      throw new Error("Invalid product ID");
    }

    const quantity = Number(item.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Invalid product quantity");
    }

    let colorId = null;

    if (
      item.colorId !== undefined &&
      item.colorId !== null &&
      item.colorId !== ""
    ) {
      if (!mongoose.Types.ObjectId.isValid(item.colorId)) {
        throw new Error("Invalid color ID");
      }

      colorId = item.colorId;
    }

    normalized.push({
      product: item.product,
      colorId,
      quantity,
    });
  }

  return normalized;
};

const restoreOrderStock = async (
  order,
  session
) => {
  for (const item of order.products || []) {
    const product = await Product.findById(
      item.product
    ).session(session);

    if (!product) {
      continue;
    }

    const quantity = Number(item.quantity || 0);

    if (item.colorId) {
      const color = product.colors.id(
        item.colorId
      );

      if (color) {
        color.stock += quantity;
      }
    } else {
      product.stock += quantity;
    }

    await product.save({
      session,
      validateBeforeSave: true,
    });
  }
};

const reserveOrderStock = async (
  products,
  session
) => {
  const normalized =
    normalizeOrderProducts(products);

  if (!normalized) {
    throw new Error(
      "Order products are required"
    );
  }

  const orderProducts = [];
  let subtotal = 0;

  for (const item of normalized) {
    const product =
      await Product.findById(
        item.product
      ).session(session);

    if (!product) {
      throw new Error(
        "Product not found"
      );
    }

    let selectedColor = null;

    if (item.colorId) {
      selectedColor =
        product.colors.id(
          item.colorId
        );

      if (!selectedColor) {
        throw new Error(
          "Selected product color was not found"
        );
      }

      if (
        selectedColor.stock <
        item.quantity
      ) {
        throw new Error(
          `Insufficient stock for ${product.name?.en || product.name?.ar || "product"}`
        );
      }

      selectedColor.stock -=
        item.quantity;
    } else {
      if (
        product.stock <
        item.quantity
      ) {
        throw new Error(
          `Insufficient stock for ${product.name?.en || product.name?.ar || "product"}`
        );
      }

      product.stock -=
        item.quantity;
    }

    await product.save({
      session,
      validateBeforeSave: true,
    });

    subtotal +=
      Number(product.price || 0) *
      item.quantity;

    orderProducts.push({
      product: product._id,
      colorId: selectedColor
        ? selectedColor._id
        : null,
      colorName: selectedColor
        ? {
            ar:
              selectedColor.name?.ar ||
              "",
            en:
              selectedColor.name?.en ||
              "",
          }
        : {
            ar: "",
            en: "",
          },
      colorHex:
        selectedColor?.hex || "",
      quantity: item.quantity,
      priceAtPurchase:
        Number(product.price || 0),
    });
  }

  return {
    orderProducts,
    subtotal,
  };
};

const generateOrderNumber = async (
  session
) => {
  let orderNumber;
  let exists = true;

  while (exists) {
    orderNumber =
      Math.floor(
        100000 +
          Math.random() * 900000
      );

    exists =
      Boolean(
        await Order.findOne({
          orderNumber,
        }).session(session)
      );
  }

  return orderNumber;
};

const populateAdminOrder = async (
  orderId
) => {
  return Order.findById(orderId)
    .populate(
      "user",
      "name email phone role"
    )
    .populate(
      "products.product",
      "name slug price media stock colors"
    )
    .lean();
};

export const getAdminOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await Order.find()
        .populate(
          "user",
          "name email phone role"
        )
        .populate(
          "products.product",
          "name slug price media stock colors"
        )
        .sort({
          createdAt: -1,
        })
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

export const getAdminOrderById =
  async (req, res) => {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    try {
      const order =
        await populateAdminOrder(id);

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      return res.status(200).json({
        order,
      });
    } catch (error) {
      console.error(
        "Get admin order error:",
        error
      );

      return res.status(500).json({
        message:
          "Server error, please try again later",
      });
    }
  };

export const createAdminOrder =
  async (req, res) => {
    const session =
      await mongoose.startSession();

    try {
      const {
        user = null,
        products,
        shippingAddress,
        paymentMethod,
        shipping = 250,
        discount = 0,
        status = "Pending",
      } = req.body;

      if (
        user !== null &&
        user !== "" &&
        !mongoose.Types.ObjectId.isValid(user)
      ) {
        return res.status(400).json({
          message: "Invalid user ID",
        });
      }

      if (
        !PAYMENT_METHODS.includes(
          paymentMethod
        )
      ) {
        return res.status(400).json({
          message: "Invalid payment method",
        });
      }

      if (
        !ORDER_STATUSES.includes(status)
      ) {
        return res.status(400).json({
          message: "Invalid order status",
        });
      }

      const addressError =
        validateAddress(
          shippingAddress
        );

      if (addressError) {
        return res.status(400).json({
          message: addressError,
        });
      }

      const shippingValue =
        Number(shipping);

      const discountValue =
        Number(discount);

      if (
        !Number.isFinite(
          shippingValue
        ) ||
        shippingValue < 0
      ) {
        return res.status(400).json({
          message:
            "Invalid shipping amount",
        });
      }

      if (
        !Number.isFinite(
          discountValue
        ) ||
        discountValue < 0
      ) {
        return res.status(400).json({
          message:
            "Invalid discount amount",
        });
      }

      session.startTransaction();

      let orderProducts = [];
      let subtotal = 0;

      if (
        status !== "Canceled"
      ) {
        const result =
          await reserveOrderStock(
            products,
            session
          );

        orderProducts =
          result.orderProducts;

        subtotal =
          result.subtotal;
      } else {
        const normalized =
          normalizeOrderProducts(
            products
          );

        if (!normalized) {
          throw new Error(
            "Order products are required"
          );
        }

        for (const item of normalized) {
          const product =
            await Product.findById(
              item.product
            ).session(session);

          if (!product) {
            throw new Error(
              "Product not found"
            );
          }

          const color =
            item.colorId
              ? product.colors.id(
                  item.colorId
                )
              : null;

          if (
            item.colorId &&
            !color
          ) {
            throw new Error(
              "Selected product color was not found"
            );
          }

          orderProducts.push({
            product:
              product._id,
            colorId:
              color?._id || null,
            colorName: color
              ? {
                  ar:
                    color.name?.ar ||
                    "",
                  en:
                    color.name?.en ||
                    "",
                }
              : {
                  ar: "",
                  en: "",
                },
            colorHex:
              color?.hex || "",
            quantity:
              item.quantity,
            priceAtPurchase:
              Number(
                product.price || 0
              ),
          });

          subtotal +=
            Number(
              product.price || 0
            ) *
            item.quantity;
        }
      }

      const totalPrice =
        subtotal +
        shippingValue -
        discountValue;

      if (totalPrice < 0) {
        throw new Error(
          "Invalid order total"
        );
      }

      const orderNumber =
        await generateOrderNumber(
          session
        );

      const [order] =
        await Order.create(
          [
            {
              user:
                user || null,
              products:
                orderProducts,
              subtotal,
              shipping:
                shippingValue,
              discount:
                discountValue,
              totalPrice,
              shippingAddress:
                normalizeAddress(
                  shippingAddress
                ),
              orderNumber,
              paymentMethod,
              status,
            },
          ],
          {
            session,
          }
        );

      await session.commitTransaction();

      const populatedOrder =
        await populateAdminOrder(
          order._id
        );

      return res.status(201).json({
        message:
          "Order created successfully",
        order:
          populatedOrder,
      });
    } catch (error) {
      if (
        session.inTransaction()
      ) {
        await session.abortTransaction();
      }

      console.error(
        "Create admin order error:",
        error
      );

      return res.status(400).json({
        message:
          error.message ||
          "Unable to create order",
      });
    } finally {
      await session.endSession();
    }
  };

export const updateAdminOrder =
  async (req, res) => {
    const session =
      await mongoose.startSession();

    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          message: "Invalid order ID",
        });
      }

      const {
        user = null,
        products,
        shippingAddress,
        paymentMethod,
        shipping = 250,
        discount = 0,
        status = "Pending",
      } = req.body;

      if (
        user !== null &&
        user !== "" &&
        !mongoose.Types.ObjectId.isValid(user)
      ) {
        return res.status(400).json({
          message: "Invalid user ID",
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

      if (
        !ORDER_STATUSES.includes(
          status
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid order status",
        });
      }

      const addressError =
        validateAddress(
          shippingAddress
        );

      if (addressError) {
        return res.status(400).json({
          message:
            addressError,
        });
      }

      const shippingValue =
        Number(shipping);

      const discountValue =
        Number(discount);

      if (
        !Number.isFinite(
          shippingValue
        ) ||
        shippingValue < 0
      ) {
        return res.status(400).json({
          message:
            "Invalid shipping amount",
        });
      }

      if (
        !Number.isFinite(
          discountValue
        ) ||
        discountValue < 0
      ) {
        return res.status(400).json({
          message:
            "Invalid discount amount",
        });
      }

      session.startTransaction();

      const order =
        await Order.findById(id)
          .session(session);

      if (!order) {
        await session.abortTransaction();

        return res.status(404).json({
          message:
            "Order not found",
        });
      }

      const oldStatus =
        order.status;

      if (
        RESERVED_ORDER_STATUSES.includes(
          oldStatus
        )
      ) {
        await restoreOrderStock(
          order,
          session
        );
      }

      const normalized =
        normalizeOrderProducts(
          products
        );

      if (!normalized) {
        throw new Error(
          "Order products are required"
        );
      }

      let orderProducts = [];
      let subtotal = 0;

      if (
        status !== "Canceled"
      ) {
        const result =
          await reserveOrderStock(
            normalized,
            session
          );

        orderProducts =
          result.orderProducts;

        subtotal =
          result.subtotal;
      } else {
        for (const item of normalized) {
          const product =
            await Product.findById(
              item.product
            ).session(session);

          if (!product) {
            throw new Error(
              "Product not found"
            );
          }

          const color =
            item.colorId
              ? product.colors.id(
                  item.colorId
                )
              : null;

          if (
            item.colorId &&
            !color
          ) {
            throw new Error(
              "Selected product color was not found"
            );
          }

          orderProducts.push({
            product:
              product._id,
            colorId:
              color?._id || null,
            colorName: color
              ? {
                  ar:
                    color.name?.ar ||
                    "",
                  en:
                    color.name?.en ||
                    "",
                }
              : {
                  ar: "",
                  en: "",
                },
            colorHex:
              color?.hex || "",
            quantity:
              item.quantity,
            priceAtPurchase:
              Number(
                product.price || 0
              ),
          });

          subtotal +=
            Number(
              product.price || 0
            ) *
            item.quantity;
        }
      }

      const totalPrice =
        subtotal +
        shippingValue -
        discountValue;

      if (totalPrice < 0) {
        throw new Error(
          "Invalid order total"
        );
      }

      order.user =
        user || null;

      order.products =
        orderProducts;

      order.subtotal =
        subtotal;

      order.shipping =
        shippingValue;

      order.discount =
        discountValue;

      order.totalPrice =
        totalPrice;

      order.shippingAddress =
        normalizeAddress(
          shippingAddress
        );

      order.paymentMethod =
        paymentMethod;

      order.status =
        status;

      await order.save({
        session,
        validateBeforeSave:
          true,
      });

      await session.commitTransaction();

      const updatedOrder =
        await populateAdminOrder(
          order._id
        );

      return res.status(200).json({
        message:
          "Order updated successfully",
        order:
          updatedOrder,
      });
    } catch (error) {
      if (
        session.inTransaction()
      ) {
        await session.abortTransaction();
      }

      console.error(
        "Update admin order error:",
        error
      );

      return res.status(400).json({
        message:
          error.message ||
          "Unable to update order",
      });
    } finally {
      await session.endSession();
    }
  };

export const deleteAdminOrder =
  async (req, res) => {
    const session =
      await mongoose.startSession();

    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          message: "Invalid order ID",
        });
      }

      session.startTransaction();

      const order =
        await Order.findById(id)
          .session(session);

      if (!order) {
        await session.abortTransaction();

        return res.status(404).json({
          message:
            "Order not found",
        });
      }

      if (
        RESERVED_ORDER_STATUSES.includes(
          order.status
        )
      ) {
        await restoreOrderStock(
          order,
          session
        );
      }

      await Order.findByIdAndDelete(
        id
      ).session(session);

      await session.commitTransaction();

      return res.status(200).json({
        message:
          "Order deleted successfully",
      });
    } catch (error) {
      if (
        session.inTransaction()
      ) {
        await session.abortTransaction();
      }

      console.error(
        "Delete admin order error:",
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

export const updateAdminOrderStatus =
  async (req, res) => {
    const session =
      await mongoose.startSession();

    try {
      const { id } =
        req.params;

      const { status } =
        req.body;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid order ID",
        });
      }

      if (
        !ORDER_STATUSES.includes(
          status
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid order status",
        });
      }

      session.startTransaction();

      const order =
        await Order.findById(id)
          .session(session);

      if (!order) {
        await session.abortTransaction();

        return res.status(404).json({
          message:
            "Order not found",
        });
      }

      if (
        order.status === status
      ) {
        await session.commitTransaction();

        const sameOrder =
          await populateAdminOrder(
            id
          );

        return res.status(200).json({
          message:
            "Order status is already up to date",
          order: sameOrder,
        });
      }

      const oldReserved =
        RESERVED_ORDER_STATUSES.includes(
          order.status
        );

      const newReserved =
        RESERVED_ORDER_STATUSES.includes(
          status
        );

      if (
        oldReserved &&
        !newReserved
      ) {
        await restoreOrderStock(
          order,
          session
        );
      }

      if (
        !oldReserved &&
        newReserved
      ) {
        const result =
          await reserveOrderStock(
            order.products.map(
              (item) => ({
                product:
                  item.product,
                colorId:
                  item.colorId,
                quantity:
                  item.quantity,
              })
            ),
            session
          );

        order.products =
          result.orderProducts;
      }

      order.status =
        status;

      await order.save({
        session,
        validateBeforeSave:
          true,
      });

      await session.commitTransaction();

      const updatedOrder =
        await populateAdminOrder(
          id
        );

      return res.status(200).json({
        message:
          "Order status updated successfully",
        order:
          updatedOrder,
      });
    } catch (error) {
      if (
        session.inTransaction()
      ) {
        await session.abortTransaction();
      }

      console.error(
        "Update admin order status error:",
        error
      );

      return res.status(400).json({
        message:
          error.message ||
          "Unable to update order status",
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
        "name email phone role createdAt"
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

export const getAdminSettings = async (
  req,
  res
) => {
  try {
    const userId = req.user?.id;

    if (
      !userId ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId)
      .select("name email role")
      .lean();

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error(
      "Get admin settings error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error, please try again later",
    });
  }
};

export const updateAdminSettings = async (
  req,
  res
) => {
  try {
    const userId = req.user?.id;

    if (
      !userId ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const {
      name,
      email,
      currentPassword,
      newPassword,
    } = req.body;

    const user = await User.findById(userId).select(
      "+password"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (
      name !== undefined
    ) {
      const normalizedName = String(name).trim();

      if (
        normalizedName.length < 2 ||
        normalizedName.length > 50
      ) {
        return res.status(400).json({
          message:
            "Name must be between 2 and 50 characters",
        });
      }

      user.name = normalizedName;
    }

    if (
      email !== undefined
    ) {
      const normalizedEmail = String(email)
        .trim()
        .toLowerCase();

      if (
        normalizedEmail.length < 5 ||
        normalizedEmail.length > 150 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          normalizedEmail
        )
      ) {
        return res.status(400).json({
          message: "Invalid email address",
        });
      }

      const existingUser =
        await User.findOne({
          email: normalizedEmail,
          _id: {
            $ne: userId,
          },
        });

      if (existingUser) {
        return res.status(409).json({
          message:
            "This email is already in use",
        });
      }

      user.email = normalizedEmail;
    }

    if (
      newPassword !== undefined &&
      String(newPassword).length > 0
    ) {
      if (
        !currentPassword ||
        String(currentPassword).length === 0
      ) {
        return res.status(400).json({
          message:
            "Current password is required",
        });
      }

      const passwordMatches =
        await bcrypt.compare(
          String(currentPassword),
          user.password
        );

      if (!passwordMatches) {
        return res.status(400).json({
          message:
            "Current password is incorrect",
        });
      }

      if (
        String(newPassword).length < 8
      ) {
        return res.status(400).json({
          message:
            "New password must be at least 8 characters",
        });
      }

      user.password =
        await bcrypt.hash(
          String(newPassword),
          12
        );
    }

    await user.save();

    return res.status(200).json({
      message:
        "Settings updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Update admin settings error:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "This email is already in use",
      });
    }

    const message =
      validationMessage(error);

    if (message) {
      return res.status(400).json({
        message,
      });
    }

    return res.status(500).json({
      message:
        "Server error, please try again later",
    });
  }
};