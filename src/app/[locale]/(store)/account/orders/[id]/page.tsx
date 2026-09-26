"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  cancelOrder,
  getOrderById,
} from "@/services/api";

import styles from "./OrderDetailsPage.module.css";

type Order = {
  _id: string;
  orderNumber: number;
  subtotal: number;
  shipping: number;
  discount: number;
  totalPrice: number;
  status: string;
  paymentMethod: string;
  createdAt: string;

  shippingAddress: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
  };

  products: Array<{
    product?: {
      name?: {
        ar?: string;
        en?: string;
      };
      media?: Array<{
        url?: string;
      }>;
    };
    quantity: number;
    priceAtPurchase: number;
    colorName?: {
      ar?: string;
      en?: string;
    };
  }>;
};

function formatPrice(
  value: number,
  locale: string
) {
  return new Intl.NumberFormat(
    locale === "ar"
      ? "ar-EG"
      : "en-US",
    {
      maximumFractionDigits: 0,
    }
  ).format(value);
}

function getStatus(
  status: string,
  isArabic: boolean
) {
  const map: Record<
    string,
    string
  > = {
    Pending: isArabic
      ? "قيد المراجعة"
      : "Pending",

    Processing: isArabic
      ? "جاري التجهيز"
      : "Processing",

    "Out for Delivery": isArabic
      ? "خرج للتوصيل"
      : "Out for Delivery",

    Delivered: isArabic
      ? "تم التسليم"
      : "Delivered",

    Canceled: isArabic
      ? "ملغي"
      : "Canceled",
  };

  return map[status] || status;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const locale =
    typeof params?.locale ===
    "string"
      ? params.locale
      : "ar";

  const orderId =
    typeof params?.id ===
    "string"
      ? params.id
      : "";

  const isArabic =
    locale === "ar";

  const [order, setOrder] =
    useState<Order | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [canceling, setCanceling] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadOrder =
      async () => {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          router.replace(
            `/${locale}/login`
          );
          return;
        }

        try {
          const response =
            await getOrderById(
              token,
              orderId
            );

          setOrder(
            response?.order ||
              null
          );
        } catch (err) {
          console.error(
            "Get order error:",
            err
          );

          setError(
            err instanceof Error
              ? err.message
              : isArabic
              ? "تعذر تحميل الطلب."
              : "Unable to load order."
          );
        } finally {
          setLoading(false);
        }
      };

    if (orderId) {
      loadOrder();
    }
  }, [
    orderId,
    locale,
    router,
    isArabic,
  ]);

  const handleCancel =
    async () => {
      if (
        !order ||
        order.status !==
          "Pending"
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          isArabic
            ? "هل أنت متأكد من إلغاء الطلب؟"
            : "Are you sure you want to cancel this order?"
        );

      if (!confirmed) {
        return;
      }

      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        router.replace(
          `/${locale}/login`
        );

        return;
      }

      setCanceling(true);
      setError("");

      try {
        const response =
          await cancelOrder(
            token,
            order._id
          );

        setOrder(
          response?.order ||
            order
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : isArabic
            ? "تعذر إلغاء الطلب."
            : "Unable to cancel the order."
        );
      } finally {
        setCanceling(false);
      }
    };

  if (loading) {
    return (
      <main
        className={styles.page}
        dir={
          isArabic
            ? "rtl"
            : "ltr"
        }
      >
        <div
          className={styles.loading}
        >
          <div
            className={
              styles.spinner
            }
          />

          <p>
            {isArabic
              ? "جاري تحميل الطلب..."
              : "Loading order..."}
          </p>
        </div>
      </main>
    );
  }

  if (error && !order) {
    return (
      <main
        className={styles.page}
        dir={
          isArabic
            ? "rtl"
            : "ltr"
        }
      >
        <div
          className={
            styles.container
          }
        >
          <div
            className={
              styles.error
            }
          >
            {error}
          </div>

          <Link
            href={`/${locale}/account`}
            className={
              styles.backButton
            }
          >
            {isArabic
              ? "العودة إلى الحساب"
              : "Back to Account"}
          </Link>
        </div>
      </main>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <main
      className={styles.page}
      dir={
        isArabic
          ? "rtl"
          : "ltr"
      }
    >
      <div
        className={
          styles.container
        }
      >
        <nav
          className={
            styles.breadcrumb
          }
        >
          <Link
            href={`/${locale}`}
          >
            {isArabic
              ? "الرئيسية"
              : "Home"}
          </Link>

          <span>/</span>

          <Link
            href={`/${locale}/account`}
          >
            {isArabic
              ? "حسابي"
              : "My Account"}
          </Link>

          <span>/</span>

          <strong>
            #{order.orderNumber}
          </strong>
        </nav>

        <header
          className={styles.header}
        >
          <div>
            <span
              className={
                styles.eyebrow
              }
            >
              {isArabic
                ? "تفاصيل الطلب"
                : "ORDER DETAILS"}
            </span>

            <h1>
              #{order.orderNumber}
            </h1>

            <p>
              {new Date(
                order.createdAt
              ).toLocaleDateString(
                isArabic
                  ? "ar-EG"
                  : "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </p>
          </div>

          <span
            className={
              styles.status
            }
          >
            {getStatus(
              order.status,
              isArabic
            )}
          </span>
        </header>

        {error && (
          <div
            className={
              styles.error
            }
          >
            {error}
          </div>
        )}

        <div
          className={
            styles.layout
          }
        >
          <section
            className={
              styles.card
            }
          >
            <h2>
              {isArabic
                ? "المنتجات"
                : "Products"}
            </h2>

            <div
              className={
                styles.products
              }
            >
              {order.products.map(
                (item, index) => {
                  const name =
                    item.product
                      ?.name?.[
                      locale as
                        | "ar"
                        | "en"
                    ] ||
                    item.product
                      ?.name?.ar ||
                    item.product
                      ?.name?.en ||
                    (isArabic
                      ? "منتج"
                      : "Product");

                  const image =
                    item.product
                      ?.media?.[0]
                      ?.url;

                  const color =
                    item.colorName?.[
                      locale as
                        | "ar"
                        | "en"
                    ];

                  return (
                    <div
                      key={`${item.product ? name : "product"}-${index}`}
                      className={
                        styles.product
                      }
                    >
                      <div
                        className={
                          styles.productImage
                        }
                      >
                        {image ? (
                          <img
                            src={image}
                            alt={name}
                          />
                        ) : (
                          <span>
                            {isArabic
                              ? "لا صورة"
                              : "No image"}
                          </span>
                        )}
                      </div>

                      <div
                        className={
                          styles.productInfo
                        }
                      >
                        <strong>
                          {name}
                        </strong>

                        <span>
                          {isArabic
                            ? `الكمية: ${item.quantity}`
                            : `Quantity: ${item.quantity}`}
                        </span>

                        {color && (
                          <span>
                            {isArabic
                              ? `اللون: ${color}`
                              : `Color: ${color}`}
                          </span>
                        )}
                      </div>

                      <strong
                        className={
                          styles.productPrice
                        }
                      >
                        {formatPrice(
                          item.priceAtPurchase *
                            item.quantity,
                          locale
                        )}{" "}
                        {isArabic
                          ? "ج.م"
                          : "EGP"}
                      </strong>
                    </div>
                  );
                }
              )}
            </div>
          </section>

          <aside
            className={
              styles.side
            }
          >
            <section
              className={
                styles.card
              }
            >
              <h2>
                {isArabic
                  ? "بيانات التوصيل"
                  : "Delivery Information"}
              </h2>

              <div
                className={
                  styles.address
                }
              >
                <strong>
                  {
                    order
                      .shippingAddress
                      .firstName
                  }{" "}
                  {
                    order
                      .shippingAddress
                      .lastName
                  }
                </strong>

                <span>
                  {
                    order
                      .shippingAddress
                      .phone
                  }
                </span>

                <span>
                  {
                    order
                      .shippingAddress
                      .email
                  }
                </span>

                <span>
                  {
                    order
                      .shippingAddress
                      .address
                  }
                </span>
              </div>
            </section>

            <section
              className={
                styles.card
              }
            >
              <h2>
                {isArabic
                  ? "ملخص الطلب"
                  : "Order Summary"}
              </h2>

              <div
                className={
                  styles.summary
                }
              >
                <div>
                  <span>
                    {isArabic
                      ? "المنتجات"
                      : "Products"}
                  </span>

                  <strong>
                    {formatPrice(
                      order.subtotal,
                      locale
                    )}{" "}
                    {isArabic
                      ? "ج.م"
                      : "EGP"}
                  </strong>
                </div>

                <div>
                  <span>
                    {isArabic
                      ? "الشحن"
                      : "Shipping"}
                  </span>

                  <strong>
                    {formatPrice(
                      order.shipping,
                      locale
                    )}{" "}
                    {isArabic
                      ? "ج.م"
                      : "EGP"}
                  </strong>
                </div>

                {order.discount >
                  0 && (
                  <div>
                    <span>
                      {isArabic
                        ? "الخصم"
                        : "Discount"}
                    </span>

                    <strong>
                      -
                      {formatPrice(
                        order.discount,
                        locale
                      )}{" "}
                      {isArabic
                        ? "ج.م"
                        : "EGP"}
                    </strong>
                  </div>
                )}

                <div
                  className={
                    styles.total
                  }
                >
                  <span>
                    {isArabic
                      ? "الإجمالي"
                      : "Total"}
                  </span>

                  <strong>
                    {formatPrice(
                      order.totalPrice,
                      locale
                    )}{" "}
                    {isArabic
                      ? "ج.م"
                      : "EGP"}
                  </strong>
                </div>
              </div>

              <div
                className={
                  styles.payment
                }
              >
                {isArabic
                  ? "طريقة الدفع:"
                  : "Payment:"}{" "}
                {order.paymentMethod ===
                "Cash On Delivery"
                  ? isArabic
                    ? "الدفع عند الاستلام"
                    : "Cash On Delivery"
                  : "Vodafone Cash"}
              </div>

              {order.status ===
                "Pending" && (
                <button
                  type="button"
                  className={
                    styles.cancelButton
                  }
                  onClick={
                    handleCancel
                  }
                  disabled={
                    canceling
                  }
                >
                  {canceling
                    ? isArabic
                      ? "جاري الإلغاء..."
                      : "Canceling..."
                    : isArabic
                    ? "إلغاء الطلب"
                    : "Cancel Order"}
                </button>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}