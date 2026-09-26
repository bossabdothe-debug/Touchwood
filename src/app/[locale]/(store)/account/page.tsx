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
  getOrders,
} from "@/services/api";

import styles from "./AccountPage.module.css";

type Order = {
  _id: string;
  orderNumber: number;
  subtotal: number;
  shipping: number;
  discount: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  products?: Array<{
    quantity: number;
    priceAtPurchase: number;
    product?: {
      name?: {
        ar?: string;
        en?: string;
      };
      media?: Array<{
        url?: string;
      }>;
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

function getStatusLabel(
  status: string,
  isArabic: boolean
) {
  const labels: Record<
    string,
    [string, string]
  > = {
    Pending: [
      "قيد المراجعة",
      "Pending",
    ],
    Processing: [
      "جاري التجهيز",
      "Processing",
    ],
    "Out for Delivery": [
      "خرج للتوصيل",
      "Out for Delivery",
    ],
    Delivered: [
      "تم التسليم",
      "Delivered",
    ],
    Canceled: [
      "ملغي",
      "Canceled",
    ],
  };

  return (
    labels[status]?.[
      isArabic ? 0 : 1
    ] || status
  );
}

export default function AccountPage() {
  const params = useParams();
  const router = useRouter();

  const locale =
    typeof params?.locale ===
    "string"
      ? params.locale
      : "ar";

  const isArabic =
    locale === "ar";

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadOrders =
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
            await getOrders(
              token
            );

          setOrders(
            Array.isArray(
              response?.orders
            )
              ? response.orders
              : []
          );
        } catch (err) {
          console.error(
            "Get orders error:",
            err
          );

          setError(
            err instanceof Error
              ? err.message
              : isArabic
              ? "تعذر تحميل الطلبات."
              : "Unable to load orders."
          );
        } finally {
          setLoading(false);
        }
      };

    loadOrders();
  }, [locale, router, isArabic]);

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

          <strong>
            {isArabic
              ? "حسابي"
              : "My Account"}
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
              TOUCHWOOD
            </span>

            <h1>
              {isArabic
                ? "حسابي"
                : "My Account"}
            </h1>

            <p>
              {isArabic
                ? "يمكنك هنا متابعة جميع طلباتك وحالة كل طلب."
                : "Track all your orders and their current status here."}
            </p>
          </div>
        </header>

        {loading ? (
          <div
            className={
              styles.loading
            }
          >
            <div
              className={
                styles.spinner
              }
            />

            <p>
              {isArabic
                ? "جاري تحميل الطلبات..."
                : "Loading orders..."}
            </p>
          </div>
        ) : error ? (
          <div
            className={
              styles.error
            }
          >
            {error}
          </div>
        ) : orders.length ===
          0 ? (
          <div
            className={
              styles.empty
            }
          >
            <div
              className={
                styles.emptyIcon
              }
            >
              #
            </div>

            <h2>
              {isArabic
                ? "لا توجد طلبات بعد"
                : "No orders yet"}
            </h2>

            <p>
              {isArabic
                ? "عندما تقوم بإنشاء طلب سيظهر هنا."
                : "Your orders will appear here once you place one."}
            </p>

            <Link
              href={`/${locale}/shop`}
              className={
                styles.primaryButton
              }
            >
              {isArabic
                ? "تصفح المنتجات"
                : "Browse Products"}
            </Link>
          </div>
        ) : (
          <div
            className={
              styles.ordersList
            }
          >
            {orders.map(
              (order) => {
                const firstProduct =
                  order.products?.[0]
                    ?.product;

                const productName =
                  firstProduct
                    ?.name?.[
                      locale as
                        | "ar"
                        | "en"
                    ] ||
                  firstProduct
                    ?.name?.ar ||
                  firstProduct
                    ?.name?.en ||
                  (isArabic
                    ? "منتجات الطلب"
                    : "Order items");

                return (
                  <article
                    key={
                      order._id
                    }
                    className={
                      styles.orderCard
                    }
                  >
                    <div
                      className={
                        styles.orderTop
                      }
                    >
                      <div>
                        <span
                          className={
                            styles.orderLabel
                          }
                        >
                          {isArabic
                            ? "رقم الطلب"
                            : "Order Number"}
                        </span>

                        <strong
                          className={
                            styles.orderNumber
                          }
                        >
                          #
                          {
                            order.orderNumber
                          }
                        </strong>
                      </div>

                      <span
                        className={`${styles.status} ${
                          styles[
                            `status${order.status.replace(
                              /[^a-zA-Z]/g,
                              ""
                            )}`
                          ] || ""
                        }`}
                      >
                        {getStatusLabel(
                          order.status,
                          isArabic
                        )}
                      </span>
                    </div>

                    <div
                      className={
                        styles.orderBody
                      }
                    >
                      <div>
                        <span>
                          {isArabic
                            ? "تاريخ الطلب"
                            : "Order Date"}
                        </span>

                        <strong>
                          {new Date(
                            order.createdAt
                          ).toLocaleDateString(
                            isArabic
                              ? "ar-EG"
                              : "en-US"
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          {isArabic
                            ? "المنتجات"
                            : "Products"}
                        </span>

                        <strong>
                          {productName}
                          {order.products &&
                          order.products.length >
                            1
                            ? ` + ${
                                order.products.length -
                                1
                              }`
                            : ""}
                        </strong>
                      </div>

                      <div>
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

                    <Link
                      href={`/${locale}/account/orders/${order._id}`}
                      className={
                        styles.detailsButton
                      }
                    >
                      {isArabic
                        ? "عرض تفاصيل الطلب"
                        : "View Order Details"}
                    </Link>
                  </article>
                );
              }
            )}
          </div>
        )}
      </div>
    </main>
  );
}