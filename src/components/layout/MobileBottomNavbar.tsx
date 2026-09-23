"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHeart,
  FiShuffle,
  FiShoppingCart,
  FiUser,
  FiGlobe,
} from "react-icons/fi";
import styles from "./MobileBottomNavbar.module.css";

export default function MobileBottomNavbar() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0] === "en" ? "en" : "ar";

  const otherLocale = locale === "ar" ? "en" : "ar";

  const currentPath =
    segments.length > 1 ? `/${segments.slice(1).join("/")}` : "";

  const languageHref = `/${otherLocale}${currentPath}`;

  return (
    <nav className={styles.mobileBottomNavbar}>
      <div className={styles.container}>
        <Link
          href={`/${locale}/wishlist`}
          className={styles.action}
          aria-label={locale === "ar" ? "المفضلة" : "Wishlist"}
        >
          <span className={styles.iconWrapper}>
            <FiHeart />
            <span className={styles.badge}>0</span>
          </span>
          <span>
            {locale === "ar" ? "المفضلة" : "Wishlist"}
          </span>
        </Link>

        <Link
          href={`/${locale}/compare`}
          className={styles.action}
          aria-label={locale === "ar" ? "المقارنة" : "Compare"}
        >
          <span className={styles.iconWrapper}>
            <FiShuffle />
            <span className={styles.badge}>0</span>
          </span>
          <span>
            {locale === "ar" ? "المقارنة" : "Compare"}
          </span>
        </Link>

        <Link
          href={`/${locale}/cart`}
          className={styles.action}
          aria-label={locale === "ar" ? "السلة" : "Cart"}
        >
          <span className={styles.iconWrapper}>
            <FiShoppingCart />
            <span className={styles.badge}>0</span>
          </span>
          <span>
            {locale === "ar" ? "السلة" : "Cart"}
          </span>
        </Link>

        <Link
          href={`/${locale}/login`}
          className={styles.action}
          aria-label={locale === "ar" ? "الحساب" : "Account"}
        >
          <span className={styles.iconWrapper}>
            <FiUser />
          </span>
          <span>
            {locale === "ar" ? "الحساب" : "Account"}
          </span>
        </Link>

        <Link
          href={languageHref}
          className={styles.action}
          aria-label={
            locale === "ar"
              ? "التبديل إلى الإنجليزية"
              : "Switch to Arabic"
          }
        >
          <span className={styles.iconWrapper}>
            <FiGlobe />
          </span>
          <span>{locale === "ar" ? "EN" : "عربي"}</span>
        </Link>
      </div>
    </nav>
  );
}