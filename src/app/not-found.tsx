"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiArrowLeft,
  FiArrowRight,
  FiHome,
  FiSearch,
} from "react-icons/fi";

import styles from "./NotFoundPage.module.css";

export default function NotFound() {
  const pathname = usePathname();

  const isEnglish = pathname?.startsWith("/en");
  const locale = isEnglish ? "en" : "ar";
  const isArabic = !isEnglish;

  const ArrowIcon = isArabic ? FiArrowLeft : FiArrowRight;

  return (
    <main className={styles.page} dir={isArabic ? "rtl" : "ltr"}>
      <div className={styles.backgroundCircleLarge} />
      <div className={styles.backgroundCircleSmall} />

      <section className={styles.content}>
        {/* Logo */}

        <div className={styles.logoWrapper}>
          <Image
            src="/images/logo.jpeg"
            alt="Touchwood"
            width={82}
            height={82}
            priority
          />
        </div>

        <span className={styles.brand}>
          TOUCH<span>WOOD</span>
        </span>

        {/* 404 */}

        <div className={styles.errorNumber} aria-hidden="true">
          <span>4</span>

          <div className={styles.zero}>
            <div className={styles.zeroInner}>
              
            </div>
          </div>

          <span>4</span>
        </div>

        {/* Text */}

        <div className={styles.text}>
          <span className={styles.eyebrow}>
            {isArabic
              ? "عفوًا، الصفحة غير موجودة"
              : "SORRY, PAGE NOT FOUND"}
          </span>

          <h1>
            {isArabic
              ? "يبدو أن هذه الصفحة لم تعد موجودة"
              : "Looks like you found an empty space."}
          </h1>

          <p>
            {isArabic
              ? "الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها. دعنا نساعدك في العثور على طريقك."
              : "The page you're looking for doesn't exist or may have been moved. Let us help you find your way."}
          </p>
        </div>

        {/* Actions */}

        <div className={styles.actions}>
          <a
            href={`/${locale}`}
            className={styles.primaryButton}
          >
            <FiHome aria-hidden="true" />

            <span>
              {isArabic ? "العودة للرئيسية" : "Back to Home"}
            </span>

            <ArrowIcon aria-hidden="true" />
          </a>

          <a
            href={`/${locale}/shop`}
            className={styles.secondaryButton}
          >
            <FiSearch aria-hidden="true" />

            <span>
              {isArabic ? "تصفح المنتجات" : "Browse Products"}
            </span>
          </a>
        </div>

        {/* Bottom brand statement */}

        
      </section>

      {/* Orange corner */}

      <div className={styles.orangeCorner} />
    </main>
  );
}