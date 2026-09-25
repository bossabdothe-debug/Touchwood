
"use client";

import { categoryTranslations } from "@/constants/categoryTranslations";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";

import {
  Heart,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
  GitCompareArrows,
} from "lucide-react";

import { FaWhatsapp } from "react-icons/fa";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperInstance } from "swiper/types";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import {
  addCartItem,
  getProductBySlug,
  addFavorite,
  removeFavorite,
  getProducts,
  getProductReviews,getDemoProductReviews
} from "../../../../../services/api";

import ProductCard from "../../../../../components/products/ProductCard";
import styles from "./ProductDetails.module.css";

type Locale = "ar" | "en";

type Localized = {
  ar?: string;
  en?: string;
};

type Media = {
  url: string;
  thumbnail?: string;
  alt?: Localized;
  isPrimary?: boolean;
};

type Spec = {
  label: Localized;
  value: Localized;
};

type ProductColor = {
  _id?: string;
  name?: Localized | string;
  label?: Localized | string;
  color?: string;
  value?: string;
  hex?: string;
  code?: string;
};

type ReviewUser = {
  name?: string;
  firstName?: string;
  lastName?: string;
};

type Review = {
  _id: string;
  rating?: number;
  comment?: string;
  createdAt?: string;
  user?: ReviewUser;
  isDemo?: false;
};

type DemoReview = {
  _id: string;
  product?: string;
  name?: string;
  nameAr?: string;
  nameEn?: string;
  rating?: number;
  comment?: string;
  language?: "ar" | "en";
  isDemo: true;
  createdAt?: string;
};

type DisplayReview = Review | DemoReview;

type Product = {
  _id: string;
  slug?: string;
  name: Localized;
  description: Localized;
  price: number;
  oldPrice?: number | null;
  category: string;
  media?: Media[];
  specifications?: Spec[];
  colors?: ProductColor[];
  rating?: number;
  reviewsCount?: number;
  stock?: number;
};

const localText = (
  value: Localized | undefined,
  locale: Locale,
): string => {
  return value?.[locale] || value?.ar || value?.en || "";
};

function getCategoryLabel(
  category: string | undefined,
  locale: Locale,
): string {
  if (!category) return "";

  const translatedCategory = categoryTranslations[category];

  if (translatedCategory) {
    return translatedCategory[locale];
  }

  return category;
}

const t = (
  locale: Locale,
  ar: string,
  en: string,
): string => {
  return locale === "ar" ? ar : en;
};

const money = (
  value: number,
  locale: Locale,
): string => {
  return new Intl.NumberFormat(
    locale === "ar" ? "ar-EG" : "en-EG",
    {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 0,
    },
  ).format(value);
};

const normalizeReviews = <T,>(
  response: unknown,
): T[] => {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const value = response as {
    reviews?: unknown;
    data?: unknown;
  };

  if (Array.isArray(value.reviews)) {
    return value.reviews as T[];
  }

  if (Array.isArray(value.data)) {
    return value.data as T[];
  }

  if (
    value.data &&
    typeof value.data === "object"
  ) {
    const nested = value.data as {
      reviews?: unknown;
    };

    if (Array.isArray(nested.reviews)) {
      return nested.reviews as T[];
    }
  }

  return [];
};

const getColorName = (
  color: ProductColor,
  locale: Locale,
): string => {
  const name = color.name ?? color.label;

  if (typeof name === "string") {
    return name;
  }

  if (name && typeof name === "object") {
    return localText(name, locale);
  }

  return (
    color.hex ||
    color.color ||
    color.value ||
    t(locale, "لون", "Color")
  );
};

const getColorValue = (
  color: ProductColor,
): string => {
  return (
    color.hex ||
    color.color ||
    color.value ||
    color.code ||
    "#d1d5db"
  );
};

export default function ProductDetailsPage() {
  const params = useParams<{
    slug: string;
    locale?: string;
  }>();

  const locale: Locale =
    params.locale === "en" ? "en" : "ar";

  const isArabic = locale === "ar";

  const mainSwiper = useRef<SwiperInstance | null>(null);

  const [product, setProduct] =
    useState<Product | null>(null);

  const [related, setRelated] =
    useState<Product[]>([]);

  const [reviews, setReviews] =
  useState<DisplayReview[]>([]);

  const [selectedImage, setSelectedImage] =
    useState(0);

  const [quantity, setQuantity] =
    useState(1);

  const [selectedColor, setSelectedColor] =
    useState<string | null>(null);

  const [favorite, setFavorite] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setMessage("");

      try {
        const item = (
          await getProductBySlug(params.slug)
        ) as Product;

        if (cancelled) return;

        setProduct(item);
        setSelectedImage(0);
        setQuantity(1);
        setSelectedColor(null);

     const [
  reviewResult,
  demoReviewResult,
  relatedResult,
] = await Promise.allSettled([
  getProductReviews(item._id),

  getDemoProductReviews(item._id),

  getProducts({
    category: item.category,
    active: true,
  }),
]);

        if (cancelled) return;

      const realReviews =
  reviewResult.status === "fulfilled"
    ? normalizeReviews<Review>(
        reviewResult.value,
      )
    : [];

const allDemoReviews =
  demoReviewResult.status === "fulfilled"
    ? normalizeReviews<DemoReview>(
        demoReviewResult.value,
      )
    : [];

const localizedDemoReviews =
  allDemoReviews.filter(
    (review) =>
      review.isDemo === true &&
      (!review.language ||
        review.language === locale),
  );

setReviews([
  ...realReviews,
  ...localizedDemoReviews,
]);

        if (
          relatedResult.status === "fulfilled"
        ) {
          const response =
            relatedResult.value as
              | Product[]
              | { products?: Product[] };

          const products = Array.isArray(response)
            ? response
            : response.products || [];

          setRelated(
            products
              .filter(
                (relatedItem) =>
                  relatedItem._id !== item._id,
              )
              .slice(0, 8),
          );
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : t(
                  locale,
                  "تعذر تحميل المنتج",
                  "Unable to load product",
                ),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (params.slug) {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, [params.slug, locale]);

  const media = useMemo(
    () =>
      [...(product?.media || [])].sort(
        (a, b) =>
          Number(Boolean(b.isPrimary)) -
          Number(Boolean(a.isPrimary)),
      ),
    [product],
  );

  const reviewCount = reviews.length;

  const averageRating = reviewCount
    ? reviews.reduce(
        (sum, review) =>
          sum + Number(review.rating || 0),
        0,
      ) / reviewCount
    : 0;

  const stock = Math.max(
    0,
    Number(product?.stock ?? 0),
  );

  const isOutOfStock = stock === 0;

  const isLowStock =
    stock > 0 && stock <= 5;

  const stockMessage = isOutOfStock
    ? t(
        locale,
        "نفد المخزون",
        "Out of stock",
      )
    : isLowStock
      ? t(
          locale,
          `متبقي فقط ${stock} وحدات — المنتج على وشك النفاد`,
          `Only ${stock} units left — almost sold out`,
        )
      : t(
          locale,
          "متوفر في المخزون",
          "In stock",
        );

  const discountPercentage =
    product?.oldPrice &&
    product.oldPrice > product.price &&
    product.price >= 0
      ? Math.round(
          ((product.oldPrice - product.price) /
            product.oldPrice) *
            100,
        )
      : 0;

  const addToCart = async () => {
    if (!product) return;

    if (isOutOfStock) {
      setMessage(
        t(
          locale,
          "هذا المنتج غير متوفر حاليًا",
          "This product is out of stock",
        ),
      );

      return;
    }

    if (quantity > stock) {
      setMessage(
        t(
          locale,
          `الكمية المتاحة فقط ${stock} وحدات`,
          `Only ${stock} units are available`,
        ),
      );

      return;
    }

    try {
      const token =
        localStorage.getItem("token") || "";

      await addCartItem(
        token,
        product._id,
        quantity,
      );

      setMessage(
        t(
          locale,
          "تمت إضافة المنتج إلى السلة",
          "Product added to cart",
        ),
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : t(
              locale,
              "تعذر الإضافة إلى السلة",
              "Unable to add product to cart",
            ),
      );
    }
  };

  const toggleFavorite = async () => {
    if (!product) return;

    try {
      const token =
        localStorage.getItem("token") || "";

      if (favorite) {
        await removeFavorite(
          token,
          product._id,
        );
      } else {
        await addFavorite(
          token,
          product._id,
        );
      }

      setFavorite((value) => !value);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : t(
              locale,
              "يجب تسجيل الدخول أولًا",
              "Please log in first",
            ),
      );
    }
  };

  if (loading) {
  return (
    <main
      className={styles.state}
      dir={isArabic ? "rtl" : "ltr"}
      aria-busy="true"
      aria-live="polite"
    >
      <div className={styles.loadingContainer}>
        <div
          className={styles.loadingSpinner}
          aria-hidden="true"
        />

        <p className={styles.loadingText}>
          {t(
            locale,
            "جاري تحميل المنتج...",
            "Loading product...",
          )}
        </p>
      </div>
    </main>
  );
}

  if (!product) {
    return (
      <main className={styles.state}>
        {message ||
          t(
            locale,
            "المنتج غير موجود",
            "Product not found",
          )}
      </main>
    );
  }

  return (
    <main
      className={styles.page}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <nav
  className={`${styles.breadcrumbs} ${
    isArabic
      ? styles.breadcrumbsArabic
      : styles.breadcrumbsEnglish
  }`}
  dir={isArabic ? "rtl" : "ltr"}
  aria-label={t(locale, "مسار التنقل", "Breadcrumb")}
>
  {/* الرئيسية */}
  <a href={`/${locale}`}>
    {t(locale, "الرئيسية", "Home")}
  </a>

  <span className={styles.breadcrumbSeparator}>/</span>

  {/* التصنيف */}
  <a
    href={`/${locale}/shop?category=${encodeURIComponent(
      product.category,
    )}`}
  >
    {getCategoryLabel(product.category, locale)}
  </a>

  <span className={styles.breadcrumbSeparator}>/</span>

  {/* اسم المنتج */}
  <span className={styles.breadcrumbCurrent}>
    {localText(product.name, locale)}
  </span>
</nav>
      <section className={styles.topLayout}>
        <div className={styles.productArea}>
          <div
            className={styles.gallery}
            dir="ltr"
          >
            <div className={styles.imageWrapper}>
              {discountPercentage > 0 && (
                <span 
                  className={styles.discountBadge}
                >
                  {isArabic
                    ? `خصم %${discountPercentage}`
                    : `${discountPercentage}% OFF`}
                </span>
              )}

              <Swiper
                modules={[
                  Navigation,
                  Pagination,
                ]}
                navigation
                pagination={{
                  clickable: true,
                }}
                className={styles.mainSwiper}
                onSwiper={(swiper) => {
                  mainSwiper.current = swiper;
                }}
                onSlideChange={(swiper) => {
                  setSelectedImage(
                    swiper.activeIndex,
                  );
                }}
              >
                {(
                  media.length
                    ? media
                    : [{ url: "/logo.jpeg" }]
                ).map((item, index) => (
                  <SwiperSlide
                    key={`${item.url}-${index}`}
                  >
                    <div
                      className={styles.mainImage}
                    >
                      <img
                        src={item.url}
                        alt={
                          localText(
                            item.alt,
                            locale,
                          ) ||
                          localText(
                            product.name,
                            locale,
                          )
                        }
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {media.length > 1 && (
              <div className={styles.thumbnails}>
                {media.map((item, index) => (
                  <button
                    key={`${item.url}-${index}`}
                    type="button"
                    className={
                      index === selectedImage
                        ? styles.activeThumb
                        : styles.thumb
                    }
                    onClick={() =>
                      mainSwiper.current?.slideTo(
                        index,
                      )
                    }
                  >
                    <img
                      src={
                        item.thumbnail ||
                        item.url
                      }
                      alt=""
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.info}>
            <span className={styles.category}>
              {getCategoryLabel(
                product.category,
                locale,
              )}
            </span>

            <h1>
              {localText(
                product.name,
                locale,
              )}
            </h1>

            <a
              className={styles.rating}
              href="#reviews"
            >
              <Star
                size={18}
                fill="currentColor"
              />

              <span>
                {averageRating
                  ? averageRating.toFixed(1)
                  : "0.0"}
              </span>

              <span>
                ({reviewCount}{" "}
                {t(
                  locale,
                  "مراجعة",
                  "reviews",
                )}
                )
              </span>
            </a>

            <div className={styles.priceRow}>
              <strong>
                {money(
                  product.price,
                  locale,
                )}
              </strong>

              {product.oldPrice ? (
                <del>
                  {money(
                    product.oldPrice,
                    locale,
                  )}
                </del>
              ) : null}
            </div>

            {product.colors &&
              product.colors.length > 0 && (
                <div
                  className={
                    styles.colorsSection
                  }
                >
                  <h3
                    className={
                      styles.optionTitle
                    }
                  >
                    {t(
                      locale,
                      "اختر اللون",
                      "Choose color",
                    )}
                  </h3>

                  <div
                    className={
                      styles.colorsList
                    }
                  >
                    {product.colors.map(
                      (color, index) => {
                        const colorName =
                          getColorName(
                            color,
                            locale,
                          );

                        const colorValue =
                          getColorValue(color);

                        const colorId =
                          color._id ||
                          `${colorValue}-${index}`;

                        const isSelected =
                          selectedColor ===
                          colorId;

                        return (
                          <button
                            key={colorId}
                            type="button"
                            className={`${styles.colorOption} ${
                              isSelected
                                ? styles.selectedColor
                                : ""
                            }`}
                            onClick={() =>
                              setSelectedColor(
                                colorId,
                              )
                            }
                            aria-label={
                              colorName
                            }
                            aria-pressed={
                              isSelected
                            }
                          >
                            <span
                              className={
                                styles.colorCircle
                              }
                              style={{
                                backgroundColor:
                                  colorValue,
                              }}
                            />

                            <span
                              className={
                                styles.colorName
                              }
                            >
                              {colorName}
                            </span>
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>
              )}

            

            <div className={styles.actions}>
              <div
                className={styles.quantity}
              >
                <button
                  type="button"
                  disabled={
                    isOutOfStock ||
                    quantity <= 1
                  }
                  onClick={() =>
                    setQuantity(
                      Math.max(
                        1,
                        quantity - 1,
                      ),
                    )
                  }
                  aria-label={t(
                    locale,
                    "تقليل الكمية",
                    "Decrease quantity",
                  )}
                >
                  −
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  disabled={
                    isOutOfStock ||
                    quantity >= stock
                  }
                  onClick={() =>
                    setQuantity(
                      Math.min(
                        stock,
                        quantity + 1,
                      ),
                    )
                  }
                  aria-label={t(
                    locale,
                    "زيادة الكمية",
                    "Increase quantity",
                  )}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className={
                  styles.cartButton
                }
                onClick={addToCart}
                disabled={
                  isOutOfStock ||
                  quantity > stock
                }
              >
                <ShoppingCart size={19} />

                {isOutOfStock
                  ? t(
                      locale,
                      "نفد المخزون",
                      "Out of stock",
                    )
                  : t(
                      locale,
                      "أضف إلى السلة",
                      "Add to cart",
                    )}
              </button>

              <button
                type="button"
                className={
                  styles.iconButton
                }
                onClick={toggleFavorite}
                aria-label={t(
                  locale,
                  "المفضلة",
                  "Favorites",
                )}
              >
                <Heart
                  size={20}
                  fill={
                    favorite
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>

              <button
                type="button"
                className={
                  styles.iconButton
                }
                aria-label={t(
                  locale,
                  "المقارنة",
                  "Compare",
                )}
              >
                <GitCompareArrows
                  size={20}
                />
              </button>
            </div>
<div
              className={`${styles.stockStatus} ${
                isOutOfStock
                  ? styles.outOfStock
                  : isLowStock
                    ? styles.lowStock
                    : styles.inStock
              }`}
              role="status"
            >
              <span
                className={styles.stockDot}
              />

              <span>
                {stockMessage}
              </span>
            </div>
            {message && (
              <p className={styles.message}>
                {message}
              </p>
            )}

            <div
              className={styles.delivery}
            >
              <Truck size={20} />

              {t(
                locale,
                "شحن سريع لجميع انحاء الجمهورية بتكلفة 250 جنيه في فترة من 3 ل5 ايام عمل",
                "Reliable shipping and support",
              )}
            </div>
          </div>
        </div>

        <aside
          className={styles.sideCards}
        >
          <article
            className={styles.serviceCard}
          >
            <ShieldCheck size={30} />

            <div>
              <h2>
                {t(
                  locale,
                  "ضمان تاتش وود",
                  "Touch wood Warranty",
                )}
              </h2>

              <p>
                {t(
                  locale,
                  "تقدم تاتش وود ضماناً سارياً من تاريخ الفاتورة الشرائية لمدة 12 شهراً على جميع كراسي والأنتريهات المكتبية، وضماناً ممتداً لمدة 36 شهراً على كافة المكاتب من تصنيعنا.",
                  "Touch Wood offers a 12-month warranty starting from the date of purchase on all office chairs and sofas, and an extended 36-month warranty on all desks of our own manufacture.",
                )}
              </p>
            </div>
          </article>

          <article
            className={styles.serviceCard}
          >
            <FaWhatsapp size={31} />

            <div>
              <h2>
                {t(
                  locale,
                  "خدمة العملاء و دعم ما بعد البيع",
                  "Customer service",
                )}
              </h2>

              <p>
                {t(
                  locale,
                  "نوفر لكم دعمًا فنيًا متكاملاً وخدمة ما بعد البيع حرصًا على رضاكم التام، وللإجابة عن كافة استفساراتكم وملاحظاتكم فورًا تواصل معنا عبر WhatsApp للحصول على المساعدة.",
                  "Contact us on WhatsApp for assistance.",
                )}
              </p>

              <a
                href="https://wa.me/201142447767"
                target="_blank"
                rel="noreferrer"
              >
                <FaWhatsapp size={18} />
                01142447767
              </a>
            </div>
          </article>
        </aside>
      </section>

      <section
        className={styles.section}
      >
        <div
          className={styles.sectionHeading}
        >
          <h2>
            {t(
              locale,
              "المواصفات",
              "Specifications",
            )}
          </h2>
        </div>

        <div
          className={styles.specCard}
        >
          <div
            className={
              styles.descriptionBlock
            }
          >
            <h3>
              {t(
                locale,
                "وصف المنتج",
                "Product description",
              )}
            </h3>

            <p>
              {localText(
                product.description,
                locale,
              ) ||
                t(
                  locale,
                  "لا يوجد وصف متاح لهذا المنتج.",
                  "No description is available for this product.",
                )}
            </p>
          </div>

         
        </div>
      </section>

      <section
        className={styles.section}
        id="reviews"
      >
        <div
          className={styles.sectionHeading}
        >
          <h2>
            {t(
              locale,
              "مراجعات العملاء",
              "Customer reviews",
            )}
          </h2>
        </div>

        <div
          className={styles.reviews}
        >
          {reviews.length ? (
            reviews.map((review) => {
              const isDemoReview =
  review.isDemo === true;

const name = isDemoReview
  ? locale === "ar"
    ? review.nameAr ||
      review.name ||
      "عميل تجريبي"
    : review.nameEn ||
      review.name ||
      "Demo customer"
  : review.user?.name ||
    `${review.user?.firstName || t(locale, "عميل", "Customer")} ${
      review.user?.lastName || ""
    }`.trim();

             return (
  <article
    className={styles.review}
    key={`${isDemoReview ? "demo" : "real"}-${review._id}`}
  >
    <div className={styles.reviewHeader}>
      <strong>{name}</strong>

      {isDemoReview && (
        <span className={styles.demoBadge}>
          {t(
            locale,
            "مراجعة تجريبية",
            "Demo review",
          )}
        </span>
      )}
    </div>

    <div
      className={styles.reviewStars}
      aria-label={t(
        locale,
        `التقييم ${review.rating || 0} من 5`,
        `Rating ${review.rating || 0} out of 5`,
      )}
    >
      {"★".repeat(
        Math.round(review.rating || 0),
      )}
    </div>

    {review.comment && (
      <p>{review.comment}</p>
    )}
  </article>
);
            })
          ) : (
            <p
              className={
                styles.emptyText
              }
            >
              {t(
                locale,
                "لا توجد مراجعات لهذا المنتج حتى الآن.",
                "There are no reviews for this product yet.",
              )}
            </p>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section
          className={styles.section}
        >
          <div
            className={
              styles.sectionHeading
            }
          >
            <h2>
              {t(
                locale,
                "منتجات مقترحة",
                "Related products",
              )}
            </h2>
          </div>

          <Swiper
  dir={isArabic ? "rtl" : "rtl"}
  modules={[Navigation, Pagination]}
  navigation
  autoplay
  pagination={{ clickable: true }}
  spaceBetween={18}
  slidesPerView={2}
  breakpoints={{
    640: { slidesPerView: 2 },
    900: { slidesPerView: 3 },
    1200: { slidesPerView: 4 },
  }}
  className={`${styles.relatedSwiper} ${
    isArabic ? styles.relatedSwiperArabic : ""
  }`}
>
            {related.map((item) => (
              <SwiperSlide
                key={item._id}
              >
                <ProductCard
                  product={item as never}
                  locale={locale}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}
    </main>
  );
}