"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  checkout,
} from "@/services/api";

import {
  clearCart,
  getCartItems,
  type CartItem,
} from "@/lib/localStore";

import styles from "./CheckoutPage.module.css";

const SHIPPING_COST = 250;

function getProductName(
  item: CartItem,
  locale: string
) {
  const name =
    item.product?.name;

  if (!name) {
    return "منتج";
  }

  return (
    name[
      locale as "ar" | "en"
    ] ||
    name.ar ||
    name.en ||
    "منتج"
  );
}

function getProductImage(
  item: CartItem
) {
  const media =
    item.product?.media;

  if (
    !Array.isArray(media) ||
    media.length === 0
  ) {
    return null;
  }

  const primary =
    media.find(
      (item) =>
        item.type === "image" &&
        item.isPrimary
    );

  if (primary?.url) {
    return primary.url;
  }

  const firstImage =
    media.find(
      (item) =>
        item.type === "image"
    );

  return (
    firstImage?.url ||
    media[0]?.url ||
    null
  );
}

function formatPrice(
  value: number,
  locale: string
) {
  return new Intl.NumberFormat(
    locale === "ar"
      ? "ar-EG"
      : "en-US",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }
  ).format(value);
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();

  const locale =
    typeof params?.locale ===
    "string"
      ? params.locale
      : "ar";

  const isArabic =
    locale === "ar";

  const [items, setItems] =
    useState<CartItem[]>([]);

  const [loaded, setLoaded] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [formData, setFormData] =
    useState({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      address: "",
      paymentMethod:
        "Cash On Delivery",
    });

  useEffect(() => {
    const cart =
      getCartItems();

    setItems(cart);
    setLoaded(true);

    if (cart.length === 0) {
      router.replace(
        `/${locale}/cart`
      );
    }
  }, [locale, router]);

  const productsTotal =
    useMemo(() => {
      return items.reduce(
        (total, item) =>
          total +
          Number(
            item.product.price || 0
          ) *
            item.quantity,
        0
      );
    }, [items]);

  const grandTotal =
    productsTotal +
    (items.length
      ? SHIPPING_COST
      : 0);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (items.length === 0) {
      setError(
        isArabic
          ? "السلة فارغة."
          : "Your cart is empty."
      );

      return;
    }

    setLoading(true);
    setError("");

    try {
      const token =
        localStorage.getItem(
          "token"
        );

      const orderData = {
        products:
          items.map((item) => ({
            productId:
              item.product._id,

            quantity:
              item.quantity,

            colorId:
              item.selectedColor ||
              null,
          })),

        paymentMethod:
          formData.paymentMethod,

        shippingAddress: {
          firstName:
            formData.firstName.trim(),

          lastName:
            formData.lastName.trim(),

          phone:
            formData.phone.trim(),

          email:
            formData.email
              .trim()
              .toLowerCase(),

          address:
            formData.address.trim(),
        },
      };

      const response =
        await checkout(
          token,
          orderData
        );

      const order =
        response?.order;

      if (
        !order ||
        !order.orderNumber
      ) {
        throw new Error(
          isArabic
            ? "تم إنشاء الطلب ولكن لم يتم استلام رقم الطلب."
            : "The order was created but no order number was returned."
        );
      }

      /*
       * Clear local cart only AFTER
       * successful backend order creation.
       */
      clearCart();

      router.replace(
        `/${locale}/order-success?orderNumber=${encodeURIComponent(
          String(order.orderNumber)
        )}`
      );
    } catch (err) {
      console.error(
        "Checkout error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : isArabic
          ? "حدث خطأ أثناء إنشاء الطلب."
          : "Something went wrong while creating the order."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!loaded) {
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
              : "Loading checkout..."}
          </p>
        </div>
      </main>
    );
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
            href={`/${locale}/cart`}
          >
            {isArabic
              ? "السلة"
              : "Cart"}
          </Link>

          <span>/</span>

          <strong>
            {isArabic
              ? "إتمام الطلب"
              : "Checkout"}
          </strong>
        </nav>

        <header
          className={styles.header}
        >
          <span
            className={styles.eyebrow}
          >
            TOUCHWOOD
          </span>

          <h1>
            {isArabic
              ? "إتمام الطلب"
              : "Complete Your Order"}
          </h1>

          <p>
            {isArabic
              ? "أدخل بيانات التوصيل ثم راجع تفاصيل طلبك قبل التأكيد."
              : "Enter your delivery information and review your order before confirming."}
          </p>
        </header>

        <form
          className={styles.layout}
          onSubmit={handleSubmit}
        >
          <section
            className={styles.formCard}
          >
            <div
              className={styles.cardHeader}
            >
              <div>
                <span
                  className={
                    styles.step
                  }
                >
                  01
                </span>

                <h2>
                  {isArabic
                    ? "بيانات العميل والتوصيل"
                    : "Customer & Delivery Information"}
                </h2>
              </div>
            </div>

            <div
              className={styles.fieldsGrid}
            >
              <label
                className={
                  styles.field
                }
              >
                <span>
                  {isArabic
                    ? "الاسم الأول"
                    : "First Name"}
                </span>

                <input
                  name="firstName"
                  value={
                    formData.firstName
                  }
                  onChange={
                    handleChange
                  }
                  required
                  autoComplete="given-name"
                  placeholder={
                    isArabic
                      ? "الاسم الأول"
                      : "First name"
                  }
                />
              </label>

              <label
                className={
                  styles.field
                }
              >
                <span>
                  {isArabic
                    ? "اسم العائلة"
                    : "Last Name"}
                </span>

                <input
                  name="lastName"
                  value={
                    formData.lastName
                  }
                  onChange={
                    handleChange
                  }
                  required
                  autoComplete="family-name"
                  placeholder={
                    isArabic
                      ? "اسم العائلة"
                      : "Last name"
                  }
                />
              </label>

              <label
                className={
                  styles.field
                }
              >
                <span>
                  {isArabic
                    ? "رقم الهاتف"
                    : "Phone Number"}
                </span>

                <input
                  name="phone"
                  type="tel"
                  value={
                    formData.phone
                  }
                  onChange={
                    handleChange
                  }
                  required
                  autoComplete="tel"
                  placeholder={
                    isArabic
                      ? "01xxxxxxxxx"
                      : "01xxxxxxxxx"
                  }
                />
              </label>

              <label
                className={
                  styles.field
                }
              >
                <span>
                  {isArabic
                    ? "البريد الإلكتروني"
                    : "Email Address"}
                </span>

                <input
                  name="email"
                  type="email"
                  value={
                    formData.email
                  }
                  onChange={
                    handleChange
                  }
                  required
                  autoComplete="email"
                  placeholder={
                    isArabic
                      ? "example@email.com"
                      : "example@email.com"
                  }
                />
              </label>

              <label
                className={`${styles.field} ${styles.fullField}`}
              >
                <span>
                  {isArabic
                    ? "عنوان التوصيل"
                    : "Delivery Address"}
                </span>

                <textarea
                  name="address"
                  value={
                    formData.address
                  }
                  onChange={
                    handleChange
                  }
                  required
                  rows={4}
                  autoComplete="street-address"
                  placeholder={
                    isArabic
                      ? "المحافظة، المدينة، الشارع، رقم المبنى..."
                      : "Governorate, city, street, building number..."
                  }
                />
              </label>
            </div>

            <div
              className={
                styles.paymentSection
              }
            >
              <div
                className={
                  styles.sectionTitle
                }
              >
                <span
                  className={
                    styles.step
                  }
                >
                  02
                </span>

                <h2>
                  {isArabic
                    ? "طريقة الدفع"
                    : "Payment Method"}
                </h2>
              </div>

              <label
                className={
                  styles.paymentOption
                }
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash On Delivery"
                  checked={
                    formData.paymentMethod ===
                    "Cash On Delivery"
                  }
                  onChange={
                    handleChange
                  }
                />

                <span>
                  {isArabic
                    ? "الدفع عند الاستلام"
                    : "Cash On Delivery"}
                </span>
              </label>

              <label
                className={
                  styles.paymentOption
                }
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Vodafone Cash"
                  checked={
                    formData.paymentMethod ===
                    "Vodafone Cash"
                  }
                  onChange={
                    handleChange
                  }
                />

                <span>
                  Vodafone Cash
                </span>
              </label>
            </div>

            {error && (
              <div
                className={
                  styles.error
                }
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className={
                styles.submitButton
              }
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className={
                      styles.buttonSpinner
                    }
                  />

                  {isArabic
                    ? "جاري إنشاء الطلب..."
                    : "Creating order..."}
                </>
              ) : (
                <>
                  {isArabic
                    ? "تأكيد وإتمام الطلب"
                    : "Confirm & Place Order"}
                </>
              )}
            </button>

            <p
              className={
                styles.securityNote
              }
            >
              {isArabic
                ? "سيتم التحقق من الأسعار والمخزون على الخادم قبل إنشاء الطلب."
                : "Prices and stock are verified on the server before your order is created."}
            </p>
          </section>

          <aside
            className={
              styles.summaryCard
            }
          >
            <div
              className={
                styles.cardHeader
              }
            >
              <div>
                <span
                  className={
                    styles.step
                  }
                >
                  03
                </span>

                <h2>
                  {isArabic
                    ? "مراجعة الطلب"
                    : "Review Order"}
                </h2>
              </div>
            </div>

            <div
              className={
                styles.itemsList
              }
            >
              {items.map(
                (item) => {
                  const name =
                    getProductName(
                      item,
                      locale
                    );

                  const image =
                    getProductImage(
                      item
                    );

                  return (
                    <div
                      className={
                        styles.item
                      }
                      key={`${item.product._id}-${item.selectedColor || "default"}`}
                    >
                      <div
                        className={
                          styles.itemImage
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
                          styles.itemInfo
                        }
                      >
                        <strong>
                          {name}
                        </strong>

                        <span>
                          {isArabic
                            ? `الكمية: ${item.quantity}`
                            : `Qty: ${item.quantity}`}
                        </span>

                        {item.selectedColor && (
                          <span>
                            {isArabic
                              ? "لون محدد"
                              : "Selected color"}
                          </span>
                        )}
                      </div>

                      <strong
                        className={
                          styles.itemPrice
                        }
                      >
                        {formatPrice(
                          Number(
                            item.product
                              .price
                          ) *
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

            <div
              className={
                styles.summaryRows
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
                    productsTotal,
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
                    SHIPPING_COST,
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
                styles.totalRow
              }
            >
              <span>
                {isArabic
                  ? "الإجمالي"
                  : "Total"}
              </span>

              <strong>
                {formatPrice(
                  grandTotal,
                  locale
                )}{" "}
                {isArabic
                  ? "ج.م"
                  : "EGP"}
              </strong>
            </div>

            <Link
              href={`/${locale}/cart`}
              className={
                styles.backToCart
              }
            >
              {isArabic
                ? "العودة إلى السلة"
                : "Back to Cart"}
            </Link>
          </aside>
        </form>
      </div>
    </main>
  );
}