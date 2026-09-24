"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FiHeart,
  FiShoppingCart,
  FiShuffle,
  FiStar,
  FiCheck,
} from "react-icons/fi";
import styles from "./ProductCard.module.css";

type Localized = {
  ar: string;
  en: string;
};

type Media = {
  type?: "image" | "video";
  url: string;
  storageKey?: string;
  thumbnail?: string;
  alt?: Localized;
  sortOrder?: number;
  isPrimary?: boolean;
};

type Product = {
  _id: string;
  name: Localized;
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

type ProductCardProps = {
  product: Product;
};

const categories: Record<string, Localized> = {
  "computer-desks": {
    ar: "مكاتب وطاولات كمبيوتر",
    en: "Computer Desks",
  },
  chairs: {
    ar: "كراسي",
    en: "Chairs",
  },
  "office-sofas": {
    ar: "انتريهات مكتبية",
    en: "Office Sofas",
  },
  "work-cells": {
    ar: "خلايا العمل",
    en: "Work Cells",
  },
  "reception-counters": {
    ar: "كاونتر استقبال",
    en: "Reception Counters",
  },
  "meeting-tables": {
    ar: "ترابيزات اجتماعات",
    en: "Meeting Tables",
  },
  "office-accessories": {
    ar: "إكسسوارات الأثاث المكتبي",
    en: "Office Accessories",
  },
};

const WISHLIST_KEY = "touchwood_wishlist";
const COMPARE_KEY = "touchwood_compare";

function getStoredIds(key: string): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(key);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed.map(String)
      : [];
  } catch {
    return [];
  }
}

function saveStoredIds(key: string, ids: string[]) {
  localStorage.setItem(key, JSON.stringify(ids));

  window.dispatchEvent(
    new CustomEvent("touchwood-local-list-change", {
      detail: {
        key,
        ids,
      },
    })
  );
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  const pathname = usePathname();

  const segments =
    pathname?.split("/").filter(Boolean) || [];

  const locale =
    segments[0] === "en" ? "en" : "ar";

  const [isFavorite, setIsFavorite] = useState(false);
  const [isCompared, setIsCompared] = useState(false);

  useEffect(() => {
    setIsFavorite(
      getStoredIds(WISHLIST_KEY).includes(product._id)
    );

    setIsCompared(
      getStoredIds(COMPARE_KEY).includes(product._id)
    );

    const handleLocalListChange = (event: Event) => {
      const customEvent =
        event as CustomEvent<{
          key: string;
          ids: string[];
        }>;

      if (customEvent.detail?.key === WISHLIST_KEY) {
        setIsFavorite(
          customEvent.detail.ids.includes(product._id)
        );
      }

      if (customEvent.detail?.key === COMPARE_KEY) {
        setIsCompared(
          customEvent.detail.ids.includes(product._id)
        );
      }
    };

    window.addEventListener(
      "touchwood-local-list-change",
      handleLocalListChange
    );

    return () => {
      window.removeEventListener(
        "touchwood-local-list-change",
        handleLocalListChange
      );
    };
  }, [product._id]);

  const productName =
    product.name?.[locale] ||
    product.name?.ar ||
    product.name?.en ||
    "منتج";

  const category = categories[product.category];

  const categoryName =
    category?.[locale] ||
    category?.ar ||
    product.category;

  const productHref = `/${locale}/product/${product.slug}`;

  const primaryImage = useMemo(() => {
    return (
      product.media?.find(
        (item) => item.isPrimary
      ) ||
      product.media?.find(
        (item) => item.type === "image"
      ) ||
      product.media?.[0]
    );
  }, [product.media]);

  const rating = Math.min(
    Math.max(Number(product.rating) || 0, 0),
    5
  );

  const reviewsCount =
    Number(product.reviewsCount) || 0;

  const oldPrice =
    Number(product.oldPrice) || 0;

  const currentPrice =
    Number(product.price) || 0;

  const discount =
    oldPrice > currentPrice
      ? Math.round(
          ((oldPrice - currentPrice) / oldPrice) * 100
        )
      : 0;

  const formattedPrice =
    currentPrice.toLocaleString(
      locale === "ar" ? "ar-EG" : "en-US"
    );

  const formattedOldPrice =
    oldPrice > currentPrice
      ? oldPrice.toLocaleString(
          locale === "ar" ? "ar-EG" : "en-US"
        )
      : null;

  const toggleWishlist = () => {
    const current = getStoredIds(WISHLIST_KEY);

    const next = current.includes(product._id)
      ? current.filter((id) => id !== product._id)
      : [...current, product._id];

    saveStoredIds(WISHLIST_KEY, next);

    setIsFavorite(next.includes(product._id));
  };

  const toggleCompare = () => {
    const current = getStoredIds(COMPARE_KEY);

    const next = current.includes(product._id)
      ? current.filter((id) => id !== product._id)
      : [...current, product._id];

    saveStoredIds(COMPARE_KEY, next);

    setIsCompared(next.includes(product._id));
  };

  const handleAddToCart = () => {
    const currentCart =
      getStoredIds("touchwood_cart");

    if (!currentCart.includes(product._id)) {
      saveStoredIds("touchwood_cart", [
        ...currentCart,
        product._id,
      ]);
    }
  };

  return (
    <article className={styles.card}>
      <div className={styles.imageContainer}>
        {discount > 0 && (
          <div className={styles.discountBadge}>
            -{discount}%
          </div>
        )}

        <div className={styles.topActions}>
          <button
            type="button"
            className={`${styles.actionButton} ${
              isFavorite
                ? styles.actionActive
                : ""
            }`}
            onClick={toggleWishlist}
            aria-label={
              locale === "ar"
                ? "إضافة إلى المفضلة"
                : "Add to wishlist"
            }
            aria-pressed={isFavorite}
          >
            <FiHeart
              className={
                isFavorite
                  ? styles.filledIcon
                  : ""
              }
            />
          </button>

          <button
            type="button"
            className={`${styles.actionButton} ${
              isCompared
                ? styles.actionActive
                : ""
            }`}
            onClick={toggleCompare}
            aria-label={
              locale === "ar"
                ? "إضافة إلى المقارنة"
                : "Add to compare"
            }
            aria-pressed={isCompared}
          >
            {isCompared ? (
              <FiCheck />
            ) : (
              <FiShuffle />
            )}
          </button>
        </div>

        <Link
          href={productHref}
          className={styles.imageLink}
        >
          {primaryImage?.url ? (
            <img
              src={primaryImage.url}
              alt={
                primaryImage.alt?.[locale] ||
                productName
              }
              className={styles.image}
            />
          ) : (
            <div className={styles.noImage}>
              <span>
                {locale === "ar"
                  ? "لا توجد صورة"
                  : "No image"}
              </span>
            </div>
          )}
        </Link>
      </div>

      <div className={styles.content}>
        <Link
          href={`/${locale}/category/${product.category}`}
          className={styles.category}
        >
          {categoryName}
        </Link>

        <Link
          href={productHref}
          className={styles.productName}
          title={productName}
        >
          {productName}
        </Link>

        <div className={styles.rating}>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <FiStar
                key={star}
                className={
                  star <= Math.round(rating)
                    ? styles.starActive
                    : styles.starInactive
                }
              />
            ))}
          </div>

          <span className={styles.ratingValue}>
            {rating.toFixed(1)}
          </span>

          <span className={styles.reviewsCount}>
            ({reviewsCount})
          </span>
        </div>

        <div className={styles.prices}>
          <span className={styles.currentPrice}>
            {formattedPrice}{" "}
            {locale === "ar" ? "ج.م" : "EGP"}
          </span>

          {formattedOldPrice && (
            <span className={styles.oldPrice}>
              {formattedOldPrice}{" "}
              {locale === "ar" ? "ج.م" : "EGP"}
            </span>
          )}
        </div>

        <button
          type="button"
          className={styles.cartButton}
          onClick={handleAddToCart}
        >
          <FiShoppingCart />

          <span>
            {locale === "ar"
              ? "إضافة إلى السلة"
              : "Add to cart"}
          </span>
        </button>
      </div>
    </article>
  );
}