
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FiSearch, FiX } from "react-icons/fi";
import styles from "./MobileSearchNavbar.module.css";
import { getProducts } from "@/services/api";

const getLocalizedValue = (value, locale) => {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  return (
    value[locale] ||
    value.en ||
    value.ar ||
    ""
  );
};

const getProductImage = (product) => {
  const firstMedia = product?.media?.[0];

  if (!firstMedia) {
    return (
      product?.image ||
      "/images/placeholder-product.jpg"
    );
  }

  if (typeof firstMedia === "string") {
    return firstMedia;
  }

  return (
    firstMedia.url ||
    firstMedia.secure_url ||
    firstMedia.src ||
    firstMedia.image ||
    firstMedia.path ||
    "/images/placeholder-product.jpg"
  );
};

export default function MobileSearchNavbar() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0] === "en" ? "en" : "ar";

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] =
    useState(false);

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
            response?.data?.products ||
            response?.data ||
            [];

        setSearchResults(
          Array.isArray(products) ? products : []
        );
      } catch (error) {
        console.error("Mobile search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleProductClick = () => {
    setSearch("");
    setSearchResults([]);
    setShowSearchResults(false);

    window.scrollTo(0, 0);
  };

  const clearSearch = () => {
    setSearch("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  return (
    <div
      className={styles.searchNavbar}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className={styles.searchWrapper}>
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
            locale === "ar"
              ? "ابحث عن منتج..."
              : "Search for a product..."
          }
          className={styles.searchInput}
          aria-label={
            locale === "ar"
              ? "البحث عن منتج"
              : "Search for a product"
          }
        />

        {search.trim() && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={clearSearch}
            aria-label={
              locale === "ar"
                ? "مسح البحث"
                : "Clear search"
            }
          >
            <FiX />
          </button>
        )}

        <button
          type="button"
          className={styles.searchButton}
          aria-label={
            locale === "ar" ? "بحث" : "Search"
          }
          onClick={() => {
            if (search.trim()) {
              setShowSearchResults(true);
            }
          }}
        >
          <FiSearch />
        </button>

        {showSearchResults && (
          <div className={styles.searchResults}>
            {isSearching ? (
              <div className={styles.searchMessage}>
                {locale === "ar"
                  ? "جاري البحث..."
                  : "Searching..."}
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((product) => {
                const productName = getLocalizedValue(
                  product.name,
                  locale
                );

                const productCategory =
                  getLocalizedValue(
                    product.category,
                    locale
                  );

                const productImage =
                  getProductImage(product);

                const productHref = `/${locale}/products/${product.slug}`;

                const formattedPrice = Number(
                  product.price || 0
                ).toLocaleString(
                  locale === "ar" ? "ar-EG" : "en-US"
                );

                return (
                  <a
                    key={product._id}
                    href={productHref}
                    className={styles.searchResultItem}
                    onClick={handleProductClick}
                  >
                    <div
                      className={
                        styles.searchResultImageWrapper
                      }
                    >
                      <img
                        src={productImage}
                        alt={productName}
                        className={styles.searchResultImage}
                        loading="lazy"
                      />
                    </div>

                    <div
                      className={styles.searchResultInfo}
                    >
                      <span
                        className={styles.searchResultName}
                      >
                        {productName}
                      </span>

                      {productCategory && (
                        <span
                          className={
                            styles.searchResultCategory
                          }
                        >
                          {productCategory}
                        </span>
                      )}

                      <span
                        className={styles.searchResultPrice}
                      >
                        {formattedPrice}{" "}
                        {locale === "ar" ? "ج.م" : "EGP"}
                      </span>
                    </div>
                  </a>
                );
              })
            ) : (
              <div className={styles.searchMessage}>
                {locale === "ar"
                  ? "لم يتم العثور على منتجات"
                  : "No products found"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}