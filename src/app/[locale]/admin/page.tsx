"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "next/navigation";
import {
  BarChart3,
  Box,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  Eye,
  PackageCheck,
  ShoppingBag,
  Truck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import {
  getAdminDashboard,
} from "@/services/api";
import "./dashboard.css";

type Locale = "ar" | "en";

type SalesOverview = {
  date: string;
  sales: number;
  orders: number;
};

type DashboardStats = {
  totalSales?: number;
  totalOrders?: number;
  totalUsers?: number;
  totalProducts?: number;
  recentOrders?: Order[];
  salesOverview?: SalesOverview[];
  orderStatusStats?: {
    Pending?: number;
    Processing?: number;
    "Out for Delivery"?: number;
    Delivered?: number;
    Canceled?: number;
  };
};

type OrderProduct = {
  _id?: string;
  name?: string;
  quantity?: number;
  price?: number;
  product?: {
    _id?: string;
    name?: string;
    price?: number;
    images?: string[];
  };
};

type OrderUser = {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
};

type Order = {
  _id: string;
  orderNumber?: string;
  status?: string;
  totalPrice?: number;
  total?: number;
  createdAt: string;
  paymentMethod?: string;
  shippingAddress?: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
  };
  user?: OrderUser | null;
  products?: OrderProduct[];
  items?: OrderProduct[];
};

const text = (
  locale: Locale,
  ar: string,
  en: string
) => (locale === "ar" ? ar : en);

const formatCurrency = (
  value: number,
  locale: Locale
) => {
  return new Intl.NumberFormat(
    locale === "ar"
      ? "ar-EG"
      : "en-US",
    {
      maximumFractionDigits: 0,
    }
  ).format(value || 0);
};

const getOrderTotal = (
  order: Order
) => {
  return Number(
    order.totalPrice ??
      order.total ??
      0
  );
};

const getOrderProducts = (
  order: Order
) => {
  return order.products || order.items || [];
};

const getEgyptDate = (
  dateString: string
) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      timeZone: "Africa/Cairo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(date);
};

const getEgyptDateKey = (
  dateString: string
) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const parts =
    new Intl.DateTimeFormat(
      "en-GB",
      {
        timeZone: "Africa/Cairo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).formatToParts(date);

  const year =
    parts.find(
      (item) => item.type === "year"
    )?.value || "";

  const month =
    parts.find(
      (item) => item.type === "month"
    )?.value || "";

  const day =
    parts.find(
      (item) => item.type === "day"
    )?.value || "";

  return `${year}-${month}-${day}`;
};

const getStatusLabel = (
  status: string | undefined,
  locale: Locale
) => {
  const labels: Record<
    string,
    [string, string]
  > = {
    Pending: [
      "قيد الانتظار",
      "Pending",
    ],
    Processing: [
      "قيد التجهيز",
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

  const current =
    labels[status || ""] || [
      status || "—",
      status || "—",
    ];

  return locale === "ar"
    ? current[0]
    : current[1];
};

const getPaymentLabel = (
  paymentMethod: string | undefined,
  locale: Locale
) => {
  const labels: Record<
    string,
    [string, string]
  > = {
    "Cash On Delivery": [
      "الدفع عند الاستلام",
      "Cash On Delivery",
    ],
    "Vodafone Cash": [
      "فودافون كاش",
      "Vodafone Cash",
    ],
  };

  const current =
    labels[paymentMethod || ""] || [
      paymentMethod || "—",
      paymentMethod || "—",
    ];

  return locale === "ar"
    ? current[0]
    : current[1];
};

const getDateParts = (
  dateKey: string
) => {
  const [
    year,
    month,
    day,
  ] = dateKey
    .split("-")
    .map(Number);

  return {
    year,
    month,
    day,
  };
};

const formatDayLabel = (
  dateKey: string,
  locale: Locale
) => {
  const {
    year,
    month,
    day,
  } = getDateParts(dateKey);

  return new Intl.DateTimeFormat(
    locale === "ar"
      ? "ar-EG"
      : "en-US",
    {
      day: "numeric",
      month: "short",
      timeZone: "Africa/Cairo",
    }
  ).format(
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    )
  );
};

const formatMonthLabel = (
  year: number,
  month: number,
  locale: Locale
) => {
  return new Intl.DateTimeFormat(
    locale === "ar"
      ? "ar-EG"
      : "en-US",
    {
      month: "short",
      year: "numeric",
      timeZone: "Africa/Cairo",
    }
  ).format(
    new Date(
      Date.UTC(
        year,
        month - 1,
        1
      )
    )
  );
};

const shiftDate = (
  dateKey: string,
  amount: number
) => {
  const {
    year,
    month,
    day,
  } = getDateParts(dateKey);

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  );

  date.setUTCDate(
    date.getUTCDate() + amount
  );

  return date
    .toISOString()
    .slice(0, 10);
};

const getTodayKey = () => {
  const parts =
    new Intl.DateTimeFormat(
      "en-GB",
      {
        timeZone: "Africa/Cairo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).formatToParts(new Date());

  const year =
    parts.find(
      (item) => item.type === "year"
    )?.value || "";

  const month =
    parts.find(
      (item) => item.type === "month"
    )?.value || "";

  const day =
    parts.find(
      (item) => item.type === "day"
    )?.value || "";

  return `${year}-${month}-${day}`;
};

export default function AdminDashboardPage() {
  const params = useParams<{
    locale?: string;
  }>();

  const locale: Locale =
    params.locale === "en"
      ? "en"
      : "ar";

  const isArabic =
    locale === "ar";

  const [
    dashboard,
    setDashboard,
  ] = useState<DashboardStats | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    period,
    setPeriod,
  ] = useState("30");

  const [
    selectedOrder,
    setSelectedOrder,
  ] = useState<Order | null>(
    null
  );

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") ||
        ""
      : "";

  useEffect(() => {
    const loadDashboard =
      async () => {
        if (!token) {
          setError(
            text(
              locale,
              "انتهت جلسة تسجيل الدخول",
              "Your session has expired"
            )
          );

          setLoading(false);
          return;
        }

        try {
          const response =
            await getAdminDashboard(
              token
            );

          setDashboard(response);
        } catch (requestError) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : text(
                  locale,
                  "تعذر تحميل الداشبورد",
                  "Unable to load dashboard"
                )
          );
        } finally {
          setLoading(false);
        }
      };

    loadDashboard();
  }, []);

  const chartData = useMemo(() => {
    const source =
      dashboard?.salesOverview || [];

    const today =
      getTodayKey();

    if (
      period === "7" ||
      period === "30"
    ) {
      const days =
        Number(period);

      const startDate =
        shiftDate(
          today,
          -(days - 1)
        );

      const sourceMap =
        new Map(
          source.map(
            (item) => [
              item.date,
              item,
            ]
          )
        );

      return Array.from(
        {
          length: days,
        },
        (_, index) => {
          const date =
            shiftDate(
              startDate,
              index
            );

          const item =
            sourceMap.get(date);

          return {
            key: date,
            label: formatDayLabel(
              date,
              locale
            ),
            orders:
              item?.orders || 0,
            sales:
              item?.sales || 0,
          };
        }
      );
    }

    const months =
      period === "6"
        ? 6
        : 12;

    const grouped =
      new Map<
        string,
        {
          year: number;
          month: number;
          orders: number;
          sales: number;
        }
      >();

    source.forEach(
      (item) => {
        const {
          year,
          month,
        } = getDateParts(
          item.date
        );

        const key = `${year}-${String(
          month
        ).padStart(2, "0")}`;

        const current =
          grouped.get(key) || {
            year,
            month,
            orders: 0,
            sales: 0,
          };

        current.orders +=
          item.orders || 0;

        current.sales +=
          item.sales || 0;

        grouped.set(
          key,
          current
        );
      }
    );

    const currentDate =
      new Date();

    const currentYear =
      Number(
        new Intl.DateTimeFormat(
          "en-US",
          {
            timeZone:
              "Africa/Cairo",
            year: "numeric",
          }
        ).format(currentDate)
      );

    const currentMonth =
      Number(
        new Intl.DateTimeFormat(
          "en-US",
          {
            timeZone:
              "Africa/Cairo",
            month: "numeric",
          }
        ).format(currentDate)
      );

    const result = [];

    for (
      let index = months - 1;
      index >= 0;
      index--
    ) {
      const date =
        new Date(
          Date.UTC(
            currentYear,
            currentMonth - 1,
            1
          )
        );

      date.setUTCMonth(
        date.getUTCMonth() -
          index
      );

      const year =
        date.getUTCFullYear();

      const month =
        date.getUTCMonth() + 1;

      const key = `${year}-${String(
        month
      ).padStart(2, "0")}`;

      const item =
        grouped.get(key);

      result.push({
        key,
        label:
          formatMonthLabel(
            year,
            month,
            locale
          ),
        orders:
          item?.orders || 0,
        sales:
          item?.sales || 0,
      });
    }

    return result;
  }, [
    dashboard,
    period,
    locale,
  ]);

  const maxOrders =
    Math.max(
      ...chartData.map(
        (item) => item.orders
      ),
      1
    );

  const statuses = [
    {
      key: "Pending",
      labelAr: "قيد الانتظار",
      labelEn: "Pending",
      icon: Clock3,
      className:
        "dashboard-status-pending",
    },
    {
      key: "Processing",
      labelAr: "قيد التجهيز",
      labelEn: "Processing",
      icon: PackageCheck,
      className:
        "dashboard-status-processing",
    },
    {
      key: "Out for Delivery",
      labelAr: "خرج للتوصيل",
      labelEn: "Out for Delivery",
      icon: Truck,
      className:
        "dashboard-status-delivery",
    },
    {
      key: "Delivered",
      labelAr: "تم التسليم",
      labelEn: "Delivered",
      icon: CheckCircle2,
      className:
        "dashboard-status-delivered",
    },
    {
      key: "Canceled",
      labelAr: "ملغي",
      labelEn: "Canceled",
      icon: XCircle,
      className:
        "dashboard-status-canceled",
    },
  ];

  const stats = [
    {
      titleAr: "إجمالي المبيعات",
      titleEn: "Total Sales",
      value: `${formatCurrency(
        Number(
          dashboard?.totalSales || 0
        ),
        locale
      )} EGP`,
      icon: DollarSign,
      className:
        "dashboard-stat-sales",
    },
    {
      titleAr: "إجمالي الطلبات",
      titleEn: "Total Orders",
      value: formatCurrency(
        Number(
          dashboard?.totalOrders || 0
        ),
        locale
      ),
      icon: ShoppingBag,
      className:
        "dashboard-stat-orders",
    },
    {
      titleAr: "إجمالي المستخدمين",
      titleEn: "Total Users",
      value: formatCurrency(
        Number(
          dashboard?.totalUsers || 0
        ),
        locale
      ),
      icon: Users,
      className:
        "dashboard-stat-users",
    },
    {
      titleAr: "إجمالي المنتجات",
      titleEn: "Total Products",
      value: formatCurrency(
        Number(
          dashboard?.totalProducts || 0
        ),
        locale
      ),
      icon: Box,
      className:
        "dashboard-stat-products",
    },
  ];

  if (loading) {
    return (
      <main
        className="dashboard-page"
        dir={
          isArabic
            ? "rtl"
            : "ltr"
        }
      >
        <div className="dashboard-loading">
          {text(
            locale,
            "جاري تحميل الداشبورد...",
            "Loading dashboard..."
          )}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main
        className="dashboard-page"
        dir={
          isArabic
            ? "rtl"
            : "ltr"
        }
      >
        <div className="dashboard-error">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main
      className="dashboard-page"
      dir={
        isArabic
          ? "rtl"
          : "ltr"
      }
    >
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              TOUCHWOOD
            </span>

            <h1>
              {text(
                locale,
                "لوحة التحكم",
                "Dashboard"
              )}
            </h1>

            <p>
              {text(
                locale,
                "نظرة عامة على أداء المتجر والطلبات",
                "Overview of your store performance and orders"
              )}
            </p>
          </div>

          <div className="dashboard-date">
            <CalendarDays size={17} />

            {new Intl.DateTimeFormat(
              locale === "ar"
                ? "ar-EG"
                : "en-US",
              {
                timeZone:
                  "Africa/Cairo",
                day: "numeric",
                month: "long",
                year: "numeric",
              }
            ).format(new Date())}
          </div>
        </header>

        <section className="dashboard-stats-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                className={`dashboard-stat-card ${stat.className}`}
                key={stat.titleEn}
              >
                <div className="dashboard-stat-top">
                  <div className="dashboard-stat-icon">
                    <Icon size={21} />
                  </div>
                </div>

                <div className="dashboard-stat-content">
                  <span>
                    {text(
                      locale,
                      stat.titleAr,
                      stat.titleEn
                    )}
                  </span>

                  <strong>
                    {stat.value}
                  </strong>
                </div>
              </div>
            );
          })}
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <div>
              <h2>
                {text(
                  locale,
                  "حالات الطلبات",
                  "Order Status"
                )}
              </h2>

              <p>
                {text(
                  locale,
                  "توزيع جميع الطلبات حسب الحالة الحالية",
                  "All orders grouped by their current status"
                )}
              </p>
            </div>
          </div>

          <div className="dashboard-status-grid">
            {statuses.map((status) => {
              const Icon = status.icon;

              const count =
                dashboard
                  ?.orderStatusStats?.[
                  status.key as keyof typeof dashboard.orderStatusStats
                ] || 0;

              return (
                <div
                  className={`dashboard-status-card ${status.className}`}
                  key={status.key}
                >
                  <div className="dashboard-status-icon">
                    <Icon size={20} />
                  </div>

                  <div className="dashboard-status-info">
                    <span>
                      {text(
                        locale,
                        status.labelAr,
                        status.labelEn
                      )}
                    </span>

                    <strong>
                      {formatCurrency(
                        Number(count),
                        locale
                      )}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="dashboard-performance-grid">
          <div className="dashboard-performance-card">
            <div className="dashboard-card-header">
              <div>
                <h2>
                  {text(
                    locale,
                    "أداء المتجر",
                    "Store Performance"
                  )}
                </h2>

                <p>
                  {text(
                    locale,
                    "عدد الطلبات خلال الفترة المحددة",
                    "Number of orders during the selected period"
                  )}
                </p>
              </div>

              <div className="dashboard-period-filter">
                <button
                  type="button"
                  className={
                    period === "7"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setPeriod("7")
                  }
                >
                  {text(
                    locale,
                    "7 أيام",
                    "7 Days"
                  )}
                </button>

                <button
                  type="button"
                  className={
                    period === "30"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setPeriod("30")
                  }
                >
                  {text(
                    locale,
                    "30 يومًا",
                    "30 Days"
                  )}
                </button>

                <button
                  type="button"
                  className={
                    period === "6"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setPeriod("6")
                  }
                >
                  {text(
                    locale,
                    "6 أشهر",
                    "6 Months"
                  )}
                </button>

                <button
                  type="button"
                  className={
                    period === "12"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setPeriod("12")
                  }
                >
                  {text(
                    locale,
                    "12 شهرًا",
                    "12 Months"
                  )}
                </button>
              </div>
            </div>

            <div className="dashboard-chart">
              {chartData.length ===
              0 ? (
                <div className="dashboard-empty">
                  {text(
                    locale,
                    "لا توجد بيانات متاحة",
                    "No data available"
                  )}
                </div>
              ) : (
                <div className="dashboard-chart-bars">
                  {chartData.map(
                    (item) => {
                      const height =
                        Math.max(
                          (item.orders /
                            maxOrders) *
                            100,
                          item.orders > 0
                            ? 7
                            : 0
                        );

                      return (
                        <div
                          className="dashboard-chart-column"
                          key={item.key}
                        >
                          <div className="dashboard-chart-value">
                            {item.orders}
                          </div>

                          <div className="dashboard-chart-track">
                            <div
                              className="dashboard-chart-bar"
                              style={{
                                height: `${height}%`,
                              }}
                            />
                          </div>

                          <span>
                            {item.label}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-recent-card">
            <div className="dashboard-card-header">
              <div>
                <h2>
                  {text(
                    locale,
                    "أحدث الطلبات",
                    "Recent Orders"
                  )}
                </h2>

                <p>
                  {text(
                    locale,
                    "آخر الطلبات المسجلة في المتجر",
                    "Latest orders placed in the store"
                  )}
                </p>
              </div>
            </div>

            <div className="dashboard-recent-list">
              {(dashboard?.recentOrders ||
                []).length === 0 ? (
                <div className="dashboard-empty">
                  {text(
                    locale,
                    "لا توجد طلبات حتى الآن",
                    "No orders yet"
                  )}
                </div>
              ) : (
                dashboard?.recentOrders?.map(
                  (order) => (
                    <button
                      type="button"
                      className="dashboard-order-row"
                      key={order._id}
                      onClick={() =>
                        setSelectedOrder(
                          order
                        )
                      }
                    >
                      <div className="dashboard-order-main">
                        <div className="dashboard-order-icon">
                          <ShoppingBag
                            size={17}
                          />
                        </div>

                        <div>
                          <strong>
                            {order.orderNumber ||
                              `#${order._id
                                .slice(
                                  -6
                                )
                                .toUpperCase()}`}
                          </strong>

                          <span>
                            {order.user?.name ||
                              order
                                .shippingAddress
                                ?.name ||
                              text(
                                locale,
                                "ضيف",
                                "Guest"
                              )}
                          </span>
                        </div>
                      </div>

                      <div className="dashboard-order-side">
                        <strong>
                          {formatCurrency(
                            getOrderTotal(
                              order
                            ),
                            locale
                          )}{" "}
                          EGP
                        </strong>

                        <span>
                          {getEgyptDate(
                            order.createdAt
                          )}
                        </span>
                      </div>

                      <Eye
                        size={17}
                        className="dashboard-order-eye"
                      />
                    </button>
                  )
                )
              )}
            </div>
          </div>
        </section>
      </div>

      {selectedOrder && (
        <div
          className="dashboard-modal-overlay"
          onMouseDown={() =>
            setSelectedOrder(null)
          }
        >
          <div
            className="dashboard-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="dashboard-modal-header">
              <div>
                <span>
                  {text(
                    locale,
                    "تفاصيل الطلب",
                    "Order Details"
                  )}
                </span>

                <h2>
                  {selectedOrder.orderNumber ||
                    `#${selectedOrder._id
                      .slice(-6)
                      .toUpperCase()}`}
                </h2>
              </div>

              <button
                type="button"
                className="dashboard-modal-close"
                onClick={() =>
                  setSelectedOrder(null)
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="dashboard-modal-body">
              <div className="dashboard-modal-grid">
                <div className="dashboard-modal-item">
                  <span>
                    {text(
                      locale,
                      "العميل",
                      "Customer"
                    )}
                  </span>

                  <strong>
                    {selectedOrder.user
                      ?.name ||
                      selectedOrder
                        .shippingAddress
                        ?.name ||
                      text(
                        locale,
                        "ضيف",
                        "Guest"
                      )}
                  </strong>
                </div>

                <div className="dashboard-modal-item">
                  <span>
                    {text(
                      locale,
                      "الهاتف",
                      "Phone"
                    )}
                  </span>

                  <strong>
                    {selectedOrder.user
                      ?.phone ||
                      selectedOrder
                        .shippingAddress
                        ?.phone ||
                      "—"}
                  </strong>
                </div>

                <div className="dashboard-modal-item">
                  <span>
                    {text(
                      locale,
                      "الحالة",
                      "Status"
                    )}
                  </span>

                  <strong>
                    {getStatusLabel(
                      selectedOrder.status,
                      locale
                    )}
                  </strong>
                </div>

                <div className="dashboard-modal-item">
                  <span>
                    {text(
                      locale,
                      "طريقة الدفع",
                      "Payment"
                    )}
                  </span>

                  <strong>
                    {getPaymentLabel(
                      selectedOrder.paymentMethod,
                      locale
                    )}
                  </strong>
                </div>
              </div>

              <div className="dashboard-modal-address">
                <span>
                  {text(
                    locale,
                    "عنوان الشحن",
                    "Shipping Address"
                  )}
                </span>

                <strong>
                  {[
                    selectedOrder
                      .shippingAddress
                      ?.address,
                    selectedOrder
                      .shippingAddress
                      ?.city,
                  ]
                    .filter(Boolean)
                    .join(" - ") ||
                    "—"}
                </strong>
              </div>

              <div className="dashboard-modal-products">
                <div className="dashboard-modal-products-title">
                  {text(
                    locale,
                    "المنتجات",
                    "Products"
                  )}
                </div>

                {getOrderProducts(
                  selectedOrder
                ).map(
                  (product, index) => {
                    const productName =
                      product.name ||
                      product.product
                        ?.name ||
                      text(
                        locale,
                        "منتج",
                        "Product"
                      );

                    const productPrice =
                      Number(
                        product.price ??
                          product.product
                            ?.price ??
                          0
                      );

                    const quantity =
                      Number(
                        product.quantity ||
                          1
                      );

                    return (
                      <div
                        className="dashboard-modal-product"
                        key={
                          product._id ||
                          product.product
                            ?._id ||
                          `${productName}-${index}`
                        }
                      >
                        <div>
                          <strong>
                            {productName}
                          </strong>

                          <span>
                            {text(
                              locale,
                              "الكمية",
                              "Qty"
                            )}{" "}
                            {quantity}
                          </span>
                        </div>

                        <strong>
                          {formatCurrency(
                            productPrice *
                              quantity,
                            locale
                          )}{" "}
                          EGP
                        </strong>
                      </div>
                    );
                  }
                )}
              </div>

              <div className="dashboard-modal-total">
                <span>
                  {text(
                    locale,
                    "الإجمالي",
                    "Total"
                  )}
                </span>

                <strong>
                  {formatCurrency(
                    getOrderTotal(
                      selectedOrder
                    ),
                    locale
                  )}{" "}
                  EGP
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}