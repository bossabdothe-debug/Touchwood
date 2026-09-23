"use client";
import BottomNavbar from "./BottomNavbar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa";
import {
  FiSearch,
  FiHeadphones,
  FiShoppingCart,
  FiGlobe,
} from "react-icons/fi";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [search, setSearch] = useState("");
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const currentLocale = segments[0] === "en" ? "en" : "ar";

  const otherLocale = currentLocale === "ar" ? "en" : "ar";

  const currentPath =
    segments.length > 1 ? `/${segments.slice(1).join("/")}` : "";

  const languageHref = `/${otherLocale}${currentPath}`;

  const cartItemsCount = 3;
  const cartTotal = 1250;

  const socialLinks = [
    {
      name: "YouTube",
      href: "https://youtube.com",
      icon: <FaYoutube />,    className: "youtube",

    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/profile.php?id=61566761378486",
      icon: <FaFacebookF />,    className: "facebook",

    },
    {
      name: "Instagram",
      href: "https://instagram.com",
      icon: <FaInstagram />,    className: "instagram",

    },
    {
      name: "WhatsApp",
      href: "https://wa.me/201142447767",
      icon: <FaWhatsapp />,    className: "whatsapp",

    },
  ];

  return (
    <header className={styles.navbar}>
      <div className={styles.topBar}>
        <div className={styles.container}>
          <div className={styles.logoWrapper}>
  <Link href={`/${currentLocale}`} className={styles.logo}>
    <img
      src="/logo/logo.jpeg"
      alt={currentLocale === "ar" ? "تاتش وود " : "Touch Wood"}
    />
    <span className={styles.companyName}>
      {currentLocale === "ar" ? "تاتش وود للأثاث المكتبي" : "Touch Wood Furniture"}
    </span>
  </Link>
</div>

          <div className={styles.searchWrapper}>
            <form className={styles.searchBox}>
              

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  currentLocale === "ar"
                    ? "ابحث عن منتج"
                    : "Search for a product"
                }
                aria-label={
                  currentLocale === "ar"
                    ? "البحث عن منتج"
                    : "Search for a product"
                }
              /><span className={styles.searchIconWrapper}>
  <FiSearch className={styles.searchIcon} />
</span>
            </form>
          </div>

          <div className={styles.socialLinks}>
            {socialLinks.map((social) => (
              <a
  key={social.name}
  href={social.href}
  target="_blank"
  rel="noopener noreferrer"
  className={`${styles.socialLink} ${styles[social.className]}`}
  aria-label={social.name}
>
  {social.icon}
</a>
            ))}
          </div>

          <div className={styles.customerService}>
            <div className={styles.customerIcon}>
              <FiHeadphones />
            </div>

            <div className={styles.customerInfo}>
              <span>
                {currentLocale === "ar" ? "خدمة العملاء" : "Customer Service"}
              </span>

              <a href="tel:+20 1142447767">01142447767</a>
            </div>
          </div>

          <Link
            href={languageHref}
            className={styles.languageSwitcher}
            aria-label={
              currentLocale === "ar"
                ? "Switch to English"
                : "التبديل إلى العربية"
            }
          >
            <FiGlobe />

            <span>{currentLocale === "ar" ? "EN" : "عربي"}</span>
          </Link>

          <Link
            href={`/${currentLocale}/cart`}
            className={styles.cart}
          >
            <span className={styles.cartBadge}>{cartItemsCount}</span>

            

            <span className={styles.cartTotal}>
              {cartTotal.toLocaleString(
                currentLocale === "ar" ? "ar-EG" : "en-US"
              )}{" "}
              {currentLocale === "ar" ? "ج.م" : "EGP"}
            </span><span className={styles.cartIcon}>
              <FiShoppingCart />
            </span>
          </Link>
        </div>
      </div><BottomNavbar />
    </header>
  );
}