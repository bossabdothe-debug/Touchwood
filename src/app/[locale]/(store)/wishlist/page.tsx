"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/navigation";
import { FiHeart, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useParams } from "next/navigation";

import ProductCard from "@/components/products/ProductCard";
import { getProducts } from "@/services/api";
import {
  getStoredIds,
  WISHLIST_KEY,
  LOCAL_LIST_CHANGE_EVENT,
} from "@/lib/localStore";

import styles from "./WishlistPage.module.css";

type Locale = "ar" | "en";

type Localized = {
  ar?: string;
  en?: string;
};

type Media = {
  type?: "image" | "video";
  url: string;
  thumbnail?: string;
  alt?: Localized;
  isPrimary?: boolean;
};

type Product = {
  _id: string;
  name: {
    ar: string;
    en: string;
  };
  description?: Localized;
  slug: string;
  category: string;
  price: number;
  oldPrice?: number | null;
  serialNumber?: string;
  stock: number;
  media?: Media[];
  rating?: number;
  reviewsCount?: number;
  featured?: boolean;
  active?: boolean;
};

type ProductsResponse =
  | Product[]
  | {
      products?: Product[];
    };

const t = (
  locale: Locale,
  arabic: string,
  english: string
) => {
  return locale === "ar" ? arabic : english;
};

export default function WishlistPage() {
  const params = useParams<{ locale?: string }>();

  const locale: Locale =
    params.locale === "en" ? "en" : "ar";

  const isArabic = locale === "ar";

  const [products, setProducts] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshWishlistIds = useCallback(() => {
    setWishlistIds(getStoredIds(WISHLIST_KEY));
  }, []);

  useEffect(() => {
    refreshWishlistIds();

    const handleWishlistChange = (event: Event) => {
      const customEvent = event as CustomEvent<{
        key?: string;
        ids?: string[];
      }>;

      if (
        customEvent.detail?.key === WISHLIST_KEY &&
        Array.isArray(customEvent.detail.ids)
      ) {
        setWishlistIds(customEvent.detail.ids);
        return;
      }

      refreshWishlistIds();
    };

    window.addEventListener(
      LOCAL_LIST_CHANGE_EVENT,
      handleWishlistChange
    );

    return () => {
      window.removeEventListener(
        LOCAL_LIST_CHANGE_EVENT,
        handleWishlistChange
      );
    };
  }, [refreshWishlistIds]);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const response = (await getProducts({
          active: true,
        })) as ProductsResponse;

        if (cancelled) return;

        const allProducts = Array.isArray(response)
          ? response
          : response.products || [];

        setProducts(allProducts);
      } catch (loadError) {
        if (cancelled) return;

        setError(
          loadError instanceof Error
            ? loadError.message
            : t(
                locale,
                "تعذر تحميل المنتجات",
                "Unable to load products"
              )
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [locale]);

  const wishlistProducts = products.filter((product) =>
    wishlistIds.includes(product._id)
  );

  const pageTitle = t(
    locale,
    "قائمة المفضلة",
    "Wishlist"
  );

  const pageDescription = t(
    locale,
    "المنتجات التي اخترتها لتعود إليها لاحقًا",
    "Products you saved to view later"
  );

  const countLabel = t(
    locale,
    wishlistProducts.length === 1
      ? "منتج واحد"
      : "منتجات",
    wishlistProducts.length === 1
      ? "product"
      : "products"
  );

  const emptyTitle = t(
    locale,
    "قائمة المفضلة فارغة",
    "Your wishlist is empty"
  );

  const emptyDescription = t(
    locale,
    "ابدأ بإضافة المنتجات التي تعجبك إلى قائمة المفضلة",
    "Start adding products you love to your wishlist"
  );

  const browseProductsLabel = t(
    locale,
    "تصفح المنتجات",
    "Browse products"
  );

  const backIcon = isArabic ? (
    <FiArrowLeft aria-hidden="true" />
  ) : (
    <FiArrowRight aria-hidden="true" />
  );

  return (
    <main
      className={styles.page}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Breadcrumb */}
      <nav
        className={styles.breadcrumb}
        aria-label={
          isArabic
            ? "مسار التنقل"
            : "Breadcrumb"
        }
      >
        <a href={`/${locale}`}>
          {isArabic
            ? "الرئيسية"
            : "Home"}
        </a>

        <span
          className={
            styles.breadcrumbSeparator
          }
        >
          /
        </span>

        <span>
          {pageTitle}
        </span>
      </nav>

      {/* Page Header */}
      <section className={styles.header}>
        <span className={styles.eyebrow}>
          Touchwood
        </span>

        <h1>{pageTitle}</h1>

      </section>

      {loading ? (
        <section className={styles.state}>
          <span className={styles.loader} />

          <p>
            {t(
              locale,
              "جاري تحميل قائمة المفضلة...",
              "Loading your wishlist..."
            )}
          </p>
        </section>
      ) : error ? (
        <section className={styles.state}>
          <p className={styles.error}>{error}</p>
        </section>
      ) : wishlistProducts.length === 0 ? (
        <section className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <FiHeart aria-hidden="true" />
          </div>

          <h2>{emptyTitle}</h2>

          <p>{emptyDescription}</p>

          <a
            href={`/${locale}/shop`}
            className={styles.browseButton}
          >
            <span>{browseProductsLabel}</span>
            {backIcon}
          </a>
        </section>
      ) : (
        <section className={styles.productsSection}>
          <div className={styles.sectionHeader}>
            <h2>
              {t(
                locale,
                "المنتجات المحفوظة",
                "Saved products"
              )}
            </h2>

            <span className={styles.productsCount}>
              {wishlistProducts.length} {countLabel}
            </span>
          </div>

          <div className={styles.productsGrid}>
            {wishlistProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}