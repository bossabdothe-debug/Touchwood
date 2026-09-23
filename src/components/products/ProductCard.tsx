"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHeart,
  FiShoppingCart,
  FiShuffle,
  FiStar,
} from "react-icons/fi";
import styles from "./ProductCard.module.css";

type ProductCardProps = {
  product: {
    _id: string;
    name: {
      ar: string;
      en: string;
    };
    category: {
      name: {
        ar: string;
        en: string;
      };
      slug: string;
    };
    price: number;
    oldPrice?: number;
    rating: number;
    reviewsCount: number;
    image: string;
    slug?: string;
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0] === "en" ? "en" : "ar";

  const productName = product.name[locale];
  const categoryName = product.category.name[locale];

  const productHref = `/${locale}/product/${
    product.slug || product._id
  }`;

  const formattedPrice = product.price.toLocaleString(
    locale === "ar" ? "ar-EG" : "en-US"
  );

  const formattedOldPrice = product.oldPrice
    ? product.oldPrice.toLocaleString(
        locale === "ar" ? "ar-EG" : "en-US"
      )
    : null;

  const rating = Math.min(Math.max(product.rating, 0), 5);

  return (
    <article className={styles.card}>
      <div className={styles.imageContainer}>
        <Link
          href={productHref}
          className={styles.imageLink}
          aria-label={productName}
        >
          <img
            src={product.image}
            alt={productName}
            className={styles.image}
          />
        </Link>

        <div className={styles.sideActions}>
          <button
            type="button"
            className={styles.actionButton}
            aria-label={
              locale === "ar" ? "إضافة إلى المفضلة" : "Add to wishlist"
            }
          >
            <FiHeart />
          </button>

          <button
            type="button"
            className={styles.actionButton}
            aria-label={
              locale === "ar" ? "إضافة إلى المقارنة" : "Add to compare"
            }
          >
            <FiShuffle />
          </button>
        </div>

        <button
          type="button"
          className={styles.cartButton}
          aria-label={
            locale === "ar" ? "إضافة إلى السلة" : "Add to cart"
          }
        >
          <FiShoppingCart />
          <span>
            {locale === "ar" ? "إضافة إلى السلة" : "Add to cart"}
          </span>
        </button>
      </div>

      <div className={styles.content}>
        <Link href={productHref} className={styles.productName}>
          {productName}
        </Link>

        <Link
          href={`/${locale}/category/${product.category.slug}`}
          className={styles.category}
        >
          {categoryName}
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
            ({product.reviewsCount})
          </span>
        </div>

        <div className={styles.prices}>
          <span className={styles.currentPrice}>
            {formattedPrice} {locale === "ar" ? "ج.م" : "EGP"}
          </span>

          {formattedOldPrice && (
            <span className={styles.oldPrice}>
              {formattedOldPrice} {locale === "ar" ? "ج.م" : "EGP"}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}