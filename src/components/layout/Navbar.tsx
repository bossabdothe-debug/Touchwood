"use client";
import BottomNavbar from "./BottomNavbar";
import Link from "next/link";
import { getProducts } from "@/services/api";
import { usePathname } from "next/navigation";
import { useEffect,useState } from "react";
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
const [searchResults, setSearchResults] = useState<any[]>([]);
const [isSearching, setIsSearching] = useState(false);
const [showSearchResults, setShowSearchResults] = useState(false);
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
        : response?.products || response?.data || [];

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
  <a
  href={`/${currentLocale}`}
  className={styles.logo}
  onClick={(event) => {
    event.preventDefault();
    window.location.assign(`/${currentLocale}`);
  }}
>
  <img
    src="/logo/logo.jpeg"
    alt={currentLocale === "ar" ? "تاتش وود" : "Touch Wood"}
  />

  <span className={styles.companyName}>
    {currentLocale === "ar"
      ? "تاتش وود للأثاث المكتبي"
      : "Touch Wood Furniture"}
  </span>
</a>
</div>

          <div className={styles.searchWrapper}>
            <form
  className={styles.searchBox}
  onSubmit={(event) => event.preventDefault()}
>
  <input
    type="text"
    value={search}
    onChange={(event) => setSearch(event.target.value)}
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

  <span className={styles.searchIconWrapper}>
    <FiSearch className={styles.searchIcon} />
  </span>

  {showSearchResults && (
    <div
      className={styles.searchResults}
      dir={currentLocale === "ar" ? "rtl" : "ltr"}
    >
      {isSearching ? (
        <div className={styles.searchMessage}>
          {currentLocale === "ar"
            ? "جاري البحث..."
            : "Searching..."}
        </div>
      ) : searchResults.length > 0 ? (
        searchResults.map((product) => {
          const productName =
            typeof product.name === "object"
              ? product.name?.[currentLocale] ||
                product.name?.en ||
                product.name?.ar
              : product.name;

          const productHref = `/${currentLocale}/products/${product.slug}`;

          return (
            <a
              key={product._id}
              href={productHref}
              className={styles.searchResultItem}
              onClick={() => {
                setSearch("");
                setShowSearchResults(false);
                window.scrollTo(0, 0);
              }}
            >
              <span className={styles.searchResultName}>
                {productName}
              </span>

              {product.category && (
                <span className={styles.searchResultCategory}>
                  {product.category}
                </span>
              )}
            </a>
          );
        })
      ) : (
        <div className={styles.searchMessage}>
          {currentLocale === "ar"
            ? "لم يتم العثور على منتجات"
            : "No products found"}
        </div>
      )}
    </div>
  )}
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