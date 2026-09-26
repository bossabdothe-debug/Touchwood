
const API_URL =
  "https://touchwood-production-70f9.up.railway.app/api";

const apiRequest = async (
  path,
  {
    method = "GET",
    token,
    body,
  } = {}
) => {
  const response = await fetch(
    `${API_URL}${path}`,
    {
      method,

      headers: {
        ...(body !== undefined
          ? {
              "Content-Type":
                "application/json",
            }
          : {}),

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },

      ...(body !== undefined
        ? {
            body: JSON.stringify(body),
          }
        : {}),
    }
  );

  const data =
    await response
      .json()
      .catch(() => ({}));

  /*
   * IMPORTANT:
   *
   * Only trigger session-expired
   * when this request actually used
   * an authentication token.
   *
   * This prevents normal login errors
   * such as "Invalid email or password"
   * from opening the expiration popup.
   */
  if (
    response.status === 401 &&
    token &&
    typeof window !==
      "undefined"
  ) {
    window.dispatchEvent(
      new CustomEvent(
        "touchwood-session-expired",
        {
          detail: {
            reason:
              "unauthorized",
          },
        }
      )
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        "حدث خطأ أثناء الاتصال بالخادم"
    );
  }

  return data;
};

/* المنتجات */

export const getProducts = async (params = {}) => {
  const query = new URLSearchParams();

  if (params.category) {
    query.set("category", params.category);
  }

  if (params.featured !== undefined) {
    query.set("featured", String(params.featured));
  }

  if (params.active !== undefined) {
    query.set("active", String(params.active));
  }

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.limit !== undefined) {
    query.set("limit", String(params.limit));
  }

  if (params.page !== undefined) {
    query.set("page", String(params.page));
  }

  const queryString = query.toString();

  return apiRequest(
    `/products${queryString ? `?${queryString}` : ""}`
  );
};

export const getProductById = async (id) => {
  return apiRequest(`/products/${id}`);
};

export const getProductBySlug = async (slug) => {
  return apiRequest(`/products/slug/${slug}`);
};

export const createProduct = async (
  token,
  productData
) => {
  return apiRequest("/products", {
    method: "POST",
    token,
    body: productData,
  });
};

export const updateProduct = async (
  token,
  productId,
  productData
) => {
  return apiRequest(`/products/${productId}`, {
    method: "PUT",
    token,
    body: productData,
  });
};

export const deleteProduct = async (
  token,
  productId
) => {
  return apiRequest(`/products/${productId}`, {
    method: "DELETE",
    token,
  });
};

/* رفع الصور */

export const createUploadUrl = async (
  token,
  fileName,
  contentType,
  folder = "products/gallery"
) => {
  return apiRequest("/uploads/presign", {
    method: "POST",
    token,
    body: {
      fileName,
      contentType,
      folder,
    },
  });
};

export const uploadImageToR2 = async (
  uploadUrl,
  file
) => {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(
      "Failed to upload image to storage"
    );
  }
};

export const deleteUpload = async (
  token,
  key
) => {
  return apiRequest("/uploads", {
    method: "DELETE",
    token,
    body: { key },
  });
};

/* المصادقة */

export const register = async (userData) => {
  return apiRequest("/user/register", {
    method: "POST",
    body: userData,
  });
};

export const logIn = async (userData) => {
  return apiRequest("/user/login", {
    method: "POST",
    body: userData,
  });
};

export const updateProfile = async (
  token,
  userData
) => {
  return apiRequest("/user/update", {
    method: "PUT",
    token,
    body: userData,
  });
};

export const changePassword = async (
  token,
  currentPassword,
  newPassword
) => {
  return apiRequest("/user/password", {
    method: "PUT",
    token,
    body: {
      currentPassword,
      newPassword,
    },
  });
};

/* الطلبات */

export const getOrders = async (token) => {
  return apiRequest("/orders", { token });
};

export const getOrderById = async (
  token,
  orderId
) => {
  return apiRequest(`/orders/${orderId}`, {
    token,
  });
};

export const cancelOrder = async (
  token,
  orderId
) => {
  return apiRequest(`/orders/${orderId}`, {
    method: "PATCH",
    token,
  });
};

export const checkout = async (
  token,
  orderData
) => {
  return apiRequest("/checkout", {
    method: "POST",
    token,
    body: orderData,
  });
};

/* السلة */

export const getCart = async (token) => {
  return apiRequest("/cart", { token });
};

export const addCartItem = async (
  token,
  productId,
  quantity = 1
) => {
  return apiRequest("/cart", {
    method: "POST",
    token,
    body: {
      productId,
      quantity,
    },
  });
};

export const updateCartItem = async (
  token,
  productId,
  quantity
) => {
  return apiRequest("/cart", {
    method: "PUT",
    token,
    body: {
      productId,
      quantity,
    },
  });
};

export const removeCartItem = async (
  token,
  productId
) => {
  return apiRequest(`/cart/${productId}`, {
    method: "DELETE",
    token,
  });
};

export const clearCart = async (token) => {
  return apiRequest("/cart", {
    method: "DELETE",
    token,
  });
};

/* المفضلة */

export const getFavorites = async (token) => {
  return apiRequest("/favorites", { token });
};

export const addFavorite = async (
  token,
  productId
) => {
  return apiRequest("/favorites", {
    method: "POST",
    token,
    body: { productId },
  });
};

export const removeFavorite = async (
  token,
  productId
) => {
  return apiRequest(`/favorites/${productId}`, {
    method: "DELETE",
    token,
  });
};

/* لوحة الأدمن */

export const getAdminDashboard = async (token) => {
  return apiRequest("/admin/dashboard", { token });
};

export const getAdminOrders = async (token) => {
  return apiRequest("/admin/orders", { token });
};

export const updateAdminOrderStatus = async (
  token,
  orderId,
  status
) => {
  return apiRequest(
    `/admin/orders/${orderId}/status`,
    {
      method: "PATCH",
      token,
      body: { status },
    }
  );
};

export const getAdminUsers = async (token) => {
  return apiRequest("/admin/users", { token });
};

export const getAdminNotifications = async (
  token
) => {
  return apiRequest("/admin/notifications", {
    token,
  });
};

export const markAdminNotificationAsRead = async (
  token,
  notificationId
) => {
  return apiRequest(
    `/admin/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      token,
    }
  );
};

export const markAllAdminNotificationsAsRead =
  async (token) => {
    return apiRequest(
      "/admin/notifications/read-all",
      {
        method: "PATCH",
        token,
      }
    );
  };

export const deleteAdminNotification = async (
  token,
  notificationId
) => {
  return apiRequest(
    `/admin/notifications/${notificationId}`,
    {
      method: "DELETE",
      token,
    }
  );
};

/* التقييمات */
export const getDemoProductReviews = async (productId) => {
  const response = await apiRequest(
    `/demo-reviews/product/${productId}`,
  );

  return Array.isArray(response)
    ? response
    : response?.reviews ||
        response?.data?.reviews ||
        response?.data ||
        [];
};
export const getProductReviews = async (
  productId
) => {
  const response = await apiRequest(
    `/reviews/product/${productId}`
  );

  return Array.isArray(response)
    ? response
    : response?.reviews ||
      response?.data?.reviews ||
      response?.data ||
      [];
};

export const getOrderReviewStatus = async (
  token,
  orderId
) => {
  return apiRequest(
    `/reviews/order/${orderId}/status`,
    { token }
  );
};

export const createReview = async (
  token,
  reviewData
) => {
  return apiRequest("/reviews", {
    method: "POST",
    token,
    body: reviewData,
  });
};

/* المنتجات المقترحة */

export const getRelatedProducts = async (
  category,
  currentProductId
) => {
  const response = await getProducts({
    category,
    active: true,
  });

  const products = Array.isArray(response)
    ? response
    : response?.products ||
      response?.data?.products ||
      response?.data ||
      [];

  return products.filter(
    (product) =>
      product._id !== currentProductId
  );
};