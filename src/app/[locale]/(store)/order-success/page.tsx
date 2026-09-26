"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import styles from "./OrderSuccessPage.module.css";

export default function OrderSuccessPage() {
  const params = useParams();
  const searchParams =
    useSearchParams();

  const locale =
    typeof params?.locale ===
    "string"
      ? params.locale
      : "ar";

  const isArabic =
    locale === "ar";

  const orderNumber =
    searchParams.get(
      "orderNumber"
    );

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
        className={styles.card}
      >
        <div
          className={
            styles.logoMark
          }
        >
          <img
            src="/logo/logo.jpeg"
            alt="Touchwood"
          />
        </div>

        <div
          className={
            styles.successIcon
          }
        >
          ✓
        </div>

        <span
          className={
            styles.eyebrow
          }
        >
          TOUCHWOOD
        </span>

        <h1>
          {isArabic
            ? "تم استلام طلبك بنجاح"
            : "Your order has been placed"}
        </h1>

        <p
          className={
            styles.description
          }
        >
          {isArabic
            ? "شكرًا لك. تم تسجيل طلبك بنجاح، ويمكنك استخدام رقم الطلب عند التواصل مع الإدارة أو خدمة العملاء."
            : "Thank you. Your order has been successfully registered. Keep your order number when contacting our administration or customer service."}
        </p>

        <div
          className={
            styles.orderNumberBox
          }
        >
          <span>
            {isArabic
              ? "رقم الطلب"
              : "Order Number"}
          </span>

          <strong>
            {orderNumber ||
              "—"}
          </strong>
        </div>

        <p
          className={
            styles.note
          }
        >
          {isArabic
            ? "احتفظ بهذا الرقم للرجوع إلى طلبك."
            : "Keep this number for future reference."}
        </p>

        <div
          className={
            styles.actions
          }
        >
          <Link
            href={`/${locale}`}
            className={
              styles.primaryButton
            }
          >
            {isArabic
              ? "العودة للرئيسية"
              : "Back Home"}
          </Link>

          <Link
            href={`/${locale}/shop`}
            className={
              styles.secondaryButton
            }
          >
            {isArabic
              ? "متابعة التسوق"
              : "Continue Shopping"}
          </Link>
        </div>
      </div>
    </main>
  );
}