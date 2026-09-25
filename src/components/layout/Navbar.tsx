"use client";

import BottomNavbar from "./BottomNavbar";
import Link from "next/link";
import { getProducts } from "@/services/api";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

import {
  getCartItemCount,
  getCartTotal,
  LOCAL_LIST_CHANGE_EVENT,
} from "@/lib/localStore";

import styles from "./Navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  const getLocalizedValue = (
    value: any,
    locale: "ar" | "en"
  ): string => {
    if (!value) return "";

    if (typeof value === "string") {
      return value;
    }

    return value[locale] || value.en || value.ar || "";
  };

  const segments = pathname?.split("/").filter(Boolean) || [];

  const currentLocale: "ar" | "en" =
    segments[0] === "en" ? "en" : "ar";

  const otherLocale = currentLocale === "ar" ? "en" : "ar";

  const currentPath =
    segments.length > 1
      ? `/${segments.slice(1).join("/")}`
      : "";

  const languageHref = `/${otherLocale}${currentPath}`;

  /*
   * تحديث بيانات السلة من localStorage
   */
  useEffect(() => {
    const syncCart = () => {
      setCartItemsCount(getCartItemCount());
      setCartTotal(getCartTotal());
    };

    // تحميل البيانات عند فتح Navbar
    syncCart();

    // التحديث عند تغيير السلة داخل نفس الصفحة
    window.addEventListener(
      LOCAL_LIST_CHANGE_EVENT,
      syncCart
    );

    // التحديث عند تغيير localStorage من تبويب آخر
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener(
        LOCAL_LIST_CHANGE_EVENT,
        syncCart
      );

      window.removeEventListener("storage", syncCart);
    };
  }, []);

  /*
   * البحث عن المنتجات
   */
  useEffect(() => {
    const searchTerm = search.trim();

    if (!searchTerm) {
      setSearchResults([]);
      setShowSearchResults(false);
      setIsSearching(false);

      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsSearching(true);
        setShowSearchResults(true);

        const response = await getProducts({
          search: searchTerm,
          active: true,
        });

        const products = Array.isArray(response)
          ? response
          : response?.products ||
            response?.data ||
            [];

        setSearchResults(products);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const socialLinks = [
    {
      name: "YouTube",
      href: "https://youtube.com",
      icon: <FaYoutube />,
      className: "youtube",
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/profile.php?id=61566761378486",
      icon: <FaFacebookF />,
      className: "facebook",
    },
    {
      name: "Instagram",
      href: "https://instagram.com",
      icon: <FaInstagram />,
      className: "instagram",
    },
    {
      name: "WhatsApp",
      href: "https://wa.me/201142447767",
      icon: <FaWhatsapp />,
      className: "whatsapp",
    },
  ];

  return (
    <header className={styles.navbar}>
      <div className={styles.topBar}>
        <div className={styles.container}>
          {/* الشعار */}
          <div className={styles.logoWrapper}>
            <a
              href={`/${currentLocale}`}
              className={styles.logo}
              onClick={(event) => {
                event.preventDefault();

                window.location.assign(
                  `/${currentLocale}`
                );
              }}
            >
              <img
                src="/logo/logo.jpeg"
                alt={
                  currentLocale === "ar"
                    ? "تاتش وود"
                    : "Touch Wood"
                }
              />

              <span className={styles.companyName}>
                {currentLocale === "ar"
                  ? "تاتش وود للأثاث المكتبي"
                  : "Touch Wood Furniture"}
              </span>
            </a>
          </div>

          {/* البحث */}
          <div className={styles.searchWrapper}>
            <form
              className={styles.searchBox}
              onSubmit={(event) =>
                event.preventDefault()
              }
            >
              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                onFocus={() => {
                  if (search.trim()) {
                    setShowSearchResults(true);
                  }
                }}
                placeholder={
                  currentLocale === "ar"
                    ? "ابحث بالاسم أو التصنيف أو اللون"
                    : "Search by name, category, or color"
                }
                aria-label={
                  currentLocale === "ar"
                    ? "البحث بالاسم أو التصنيف أو اللون"
                    : "Search by name, category, or color"
                }
              />

              <span
                className={styles.searchIconWrapper}
              >
                <FiSearch
                  className={styles.searchIcon}
                />
              </span>

              {showSearchResults && (
                <div
                  className={styles.searchResults}
                  dir={
                    currentLocale === "ar"
                      ? "rtl"
                      : "ltr"
                  }
                >
                  {isSearching ? (
                    <div
                      className={styles.searchMessage}
                    >
                      {currentLocale === "ar"
                        ? "جاري البحث..."
                        : "Searching..."}
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((product) => {
                      const productName =
                        getLocalizedValue(
                          product.name,
                          currentLocale
                        );

                      const productDescription =
                        getLocalizedValue(
                          product.description,
                          currentLocale
                        );

                      const productImage =
                        product.media?.[0]?.url ||
                        product.media?.[0]?.secure_url ||
                        product.media?.[0]?.src ||
                        product.media?.[0]?.image ||
                        product.image ||
                        "/images/placeholder-product.jpg";

                      const productHref = `/${currentLocale}/products/${product.slug}`;

                      return (
                        <a
                          key={product._id}
                          href={productHref}
                          className={
                            styles.searchResultItem
                          }
                          onClick={() => {
                            setSearch("");
                            setShowSearchResults(false);
                            window.scrollTo(0, 0);
                          }}
                        >
                          <div
                            className={
                              styles.searchResultImageWrapper
                            }
                          >
                            <img
                              src={productImage}
                              alt={productName}
                              className={
                                styles.searchResultImage
                              }
                            />
                          </div>

                          <div
                            className={
                              styles.searchResultInfo
                            }
                          >
                            <span
                              className={
                                styles.searchResultName
                              }
                            >
                              {productName}
                            </span>

                            {product.category && (
                              <span
                                className={
                                  styles.searchResultCategory
                                }
                              >
                                {getLocalizedValue(
                                  product.category,
                                  currentLocale
                                )}
                              </span>
                            )}

                            <span
                              className={
                                styles.searchResultPrice
                              }
                            >
                              {Number(
                                product.price || 0
                              ).toLocaleString(
                                currentLocale === "ar"
                                  ? "ar-EG"
                                  : "en-US"
                              )}{" "}
                              {currentLocale === "ar"
                                ? "ج.م"
                                : "EGP"}
                            </span>
                          </div>
                        </a>
                      );
                    })
                  ) : (
                    <div
                      className={styles.searchMessage}
                    >
                      {currentLocale === "ar"
                        ? "لم يتم العثور على منتجات"
                        : "No products found"}
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* روابط التواصل الاجتماعي */}
          <div className={styles.socialLinks}>
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.socialLink} ${
                  styles[social.className]
                }`}
                aria-label={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>

          {/* خدمة العملاء */}
          <div className={styles.customerService}>
            <div className={styles.customerIcon}>
              <FiHeadphones />
            </div>

            <div className={styles.customerInfo}>
              <span>
                {currentLocale === "ar"
                  ? "خدمة العملاء"
                  : "Customer Service"}
              </span>

              <a href="tel:+201142447767">
                01142447767
              </a>
            </div>
          </div>

          {/* تغيير اللغة */}
          <a
            href={languageHref}
            className={styles.languageSwitcher}
            aria-label={
              currentLocale === "ar"
                ? "Switch to English"
                : "التبديل إلى العربية"
            }
          >
            <FiGlobe />

            <span>
              {currentLocale === "ar" ? "EN" : "عربي"}
            </span>
          </a>

          {/* السلة */}
          <Link
            href={`/${currentLocale}/cart`}
            className={styles.cart}
          >
            {cartItemsCount > 0 && (
              <span className={styles.cartBadge}>
                {cartItemsCount}
              </span>
            )}

            <span className={styles.cartTotal}>
              {cartTotal.toLocaleString(
                currentLocale === "ar"
                  ? "ar-EG"
                  : "en-US"
              )}{" "}
              {currentLocale === "ar"
                ? "ج.م"
                : "EGP"}
            </span>

            <span className={styles.cartIcon}>
              <FiShoppingCart />
            </span>
          </Link>
        </div>
      </div>

      {/* شريط التنقل للموبايل */}
      <BottomNavbar />
    </header>
  );
}