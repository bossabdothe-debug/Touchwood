"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import styles from "./ComparePage.module.css";

import { getProducts } from "@/services/api";

import {
  addToCart,
  COMPARE_KEY,
  getStoredIds,
  LOCAL_LIST_CHANGE_EVENT,
  setStoredIds,
  type LocalProduct,
} from "@/lib/localStore";

type Locale = "ar" | "en";

type ApiProduct = LocalProduct & {
  featured?: boolean;
  active?: boolean;
};

function getProductName(
  product: LocalProduct,
  locale: Locale
): string {
  return (
    product.name?.[locale] ||
    product.name?.ar ||
    product.name?.en ||
    ""
  );
}

function getProductImage(
  product: LocalProduct
): string {
  const primaryImage = product.media?.find(
    (media) =>
      media.type === "image" &&
      media.isPrimary
  );

  return (
    primaryImage?.url ||
    product.media?.find(
      (media) => media.type === "image"
    )?.url ||
    ""
  );
}

function normalizeProducts(response: unknown): ApiProduct[] {
  if (Array.isArray(response)) {
    return response as ApiProduct[];
  }

  if (
    response &&
    typeof response === "object"
  ) {
    const data = response as {
      products?: unknown;
      data?: unknown;
    };

    if (Array.isArray(data.products)) {
      return data.products as ApiProduct[];
    }

    if (
      data.data &&
      typeof data.data === "object" &&
      Array.isArray(
        (data.data as { products?: unknown }).products
      )
    ) {
      return (
        (data.data as { products: ApiProduct[] })
          .products
      );
    }

    if (Array.isArray(data.data)) {
      return data.data as ApiProduct[];
    }
  }

  return [];
}

export default function ComparePage() {
  const params = useParams();

  const locale: Locale =
    params?.locale === "en" ? "en" : "ar";

  const isArabic = locale === "ar";

  const [compareIds, setCompareIds] = useState<string[]>(
    []
  );

  const [products, setProducts] = useState<
    ApiProduct[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [cartMessage, setCartMessage] =
    useState("");

  const readCompareIds = useCallback(() => {
    setCompareIds(getStoredIds(COMPARE_KEY));
  }, []);

  useEffect(() => {
    readCompareIds();

    const handleChange = () => {
      readCompareIds();
    };

    window.addEventListener(
      LOCAL_LIST_CHANGE_EVENT,
      handleChange
    );

    return () => {
      window.removeEventListener(
        LOCAL_LIST_CHANGE_EVENT,
        handleChange
      );
    };
  }, [readCompareIds]);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      if (compareIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await getProducts({
          active: true,
          limit: 1000,
        });

        if (cancelled) {
          return;
        }

        const allProducts =
          normalizeProducts(response);

        const compareSet =
          new Set(compareIds);

        const matchedProducts =
          allProducts.filter((product) =>
            compareSet.has(product._id)
          );

        const orderedProducts =
          compareIds
            .map((id) =>
              matchedProducts.find(
                (product) =>
                  product._id === id
              )
            )
            .filter(
              (
                product
              ): product is ApiProduct =>
                Boolean(product)
            );

        setProducts(orderedProducts);

      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load compare products:",
          err
        );

        setProducts([]);

        setError(
          isArabic
            ? "تعذر تحميل المنتجات للمقارنة"
            : "Unable to load comparison products"
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
  }, [compareIds, isArabic]);

  const removeFromCompare = (
    productId: string
  ) => {
    const nextIds = compareIds.filter(
      (id) => id !== productId
    );

    setStoredIds(
      COMPARE_KEY,
      nextIds
    );
  };

  const handleAddToCart = (
    product: ApiProduct
  ) => {
    addToCart(product, 1, null);

    setCartMessage(
      isArabic
        ? "تمت إضافة المنتج إلى السلة"
        : "Product added to cart"
    );

    window.setTimeout(() => {
      setCartMessage("");
    }, 2500);
  };

  const comparisonRows = useMemo(
    () => [
      {
        key: "price",
        label: isArabic
          ? "السعر"
          : "Price",
        render: (
          product: ApiProduct
        ) => (
          <strong className={styles.price}>
            {Number(product.price || 0).toLocaleString(
              isArabic ? "ar-EG" : "en-US"
            )}{" "}
            {isArabic ? "ج.م" : "EGP"}
          </strong>
        ),
      },
      {
        key: "oldPrice",
        label: isArabic
          ? "السعر قبل الخصم"
          : "Old price",
        render: (
          product: ApiProduct
        ) =>
          product.oldPrice ? (
            <span className={styles.oldPrice}>
              {Number(
                product.oldPrice
              ).toLocaleString(
                isArabic ? "ar-EG" : "en-US"
              )}{" "}
              {isArabic ? "ج.م" : "EGP"}
            </span>
          ) : (
            <span className={styles.emptyValue}>
              —
            </span>
          ),
      },
      {
        key: "rating",
        label: isArabic
          ? "التقييم"
          : "Rating",
        render: (
          product: ApiProduct
        ) =>
          typeof product.rating ===
          "number" ? (
            <span className={styles.rating}>
              <span>★</span>
              {product.rating.toFixed(1)}
            </span>
          ) : (
            <span className={styles.emptyValue}>
              —
            </span>
          ),
      },
      {
        key: "reviews",
        label: isArabic
          ? "عدد التقييمات"
          : "Reviews",
        render: (
          product: ApiProduct
        ) =>
          typeof product.reviewsCount ===
          "number" ? (
            <span>
              {product.reviewsCount.toLocaleString(
                isArabic
                  ? "ar-EG"
                  : "en-US"
              )}
            </span>
          ) : (
            <span className={styles.emptyValue}>
              —
            </span>
          ),
      },
      {
        key: "stock",
        label: isArabic
          ? "التوفر"
          : "Availability",
        render: (
          product: ApiProduct
        ) =>
          typeof product.stock ===
            "number" &&
          product.stock > 0 ? (
            <span className={styles.available}>
              {isArabic
                ? "متوفر"
                : "Available"}
            </span>
          ) : (
            <span className={styles.unavailable}>
              {isArabic
                ? "غير متوفر"
                : "Out of stock"}
            </span>
          ),
      },
      {
        key: "category",
        label: isArabic
          ? "الفئة"
          : "Category",
        render: (
          product: ApiProduct
        ) =>
          product.category || (
            <span className={styles.emptyValue}>
              —
            </span>
          ),
      },
    ],
    [isArabic]
  );

  return (
    <div
      className={styles.page}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {cartMessage && (
        <div
          className={styles.toast}
          role="status"
        >
          {cartMessage}
        </div>
      )}

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
          {isArabic
            ? "مقارنة المنتجات"
            : "Compare Products"}
        </span>
      </nav>

      <section className={styles.header}>
        <span className={styles.eyebrow}>
          Touchwood
        </span>

        <h1>
          {isArabic
            ? "مقارنة المنتجات"
            : "Compare Products"}
        </h1>

        <p>
          {isArabic
            ? "قارن المنتجات التي اخترتها واختر ما يناسبك."
            : "Compare your selected products and choose what suits you best."}
        </p>
      </section>

      {loading ? (
        <section className={styles.state}>
          <div className={styles.spinner} />

          <p>
            {isArabic
              ? "جاري تحميل المنتجات..."
              : "Loading products..."}
          </p>
        </section>
      ) : error ? (
        <section className={styles.state}>
          <div className={styles.stateIcon}>
            !
          </div>

          <h2>{error}</h2>

          <p>
            {isArabic
              ? "حاول تحديث الصفحة مرة أخرى."
              : "Please try refreshing the page."}
          </p>
        </section>
      ) : products.length === 0 ? (
        <section className={styles.empty}>
          <div className={styles.emptyIcon}>
            ⇄
          </div>

          <h2>
            {isArabic
              ? "لا توجد منتجات للمقارنة"
              : "No products to compare"}
          </h2>

          <p>
            {isArabic
              ? "أضف المنتجات إلى قائمة المقارنة لتظهر هنا."
              : "Add products to your comparison list to see them here."}
          </p>

          <a
            href={`/${locale}/shop`}
            className={styles.browseButton}
          >
            {isArabic
              ? "تصفح المنتجات"
              : "Browse products"}
          </a>
        </section>
      ) : (
        <section className={styles.compareSection}>
          <div className={styles.compareScroller}>
            <div
              className={styles.compareTable}
              style={{
                "--product-count":
                  products.length,
              } as React.CSSProperties}
            >
              <div
                className={
                  styles.cornerCell
                }
              >
                <span>
                  {isArabic
                    ? "تفاصيل المنتج"
                    : "Product details"}
                </span>
              </div>

              {products.map((product) => {
                const image =
                  getProductImage(
                    product
                  );

                const name =
                  getProductName(
                    product,
                    locale
                  );

                const productHref = `/${locale}/products/${
                  product.slug ||
                  product._id
                }`;

                return (
                  <div
                    className={
                      styles.productHeader
                    }
                    key={product._id}
                  >
                    <button
                      type="button"
                      className={
                        styles.removeButton
                      }
                      onClick={() =>
                        removeFromCompare(
                          product._id
                        )
                      }
                      aria-label={
                        isArabic
                          ? `إزالة ${name} من المقارنة`
                          : `Remove ${name} from comparison`
                      }
                    >
                      ×
                    </button>

                    <Link
                      href={productHref}
                      className={
                        styles.imageLink
                      }
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={name}
                          className={
                            styles.productImage
                          }
                        />
                      ) : (
                        <div
                          className={
                            styles.imagePlaceholder
                          }
                        >
                          {isArabic
                            ? "لا توجد صورة"
                            : "No image"}
                        </div>
                      )}
                    </Link>

                    <Link
                      href={productHref}
                      className={
                        styles.productName
                      }
                    >
                      {name}
                    </Link>
                  </div>
                );
              })}

              {comparisonRows.map(
                (row) => (
                  <div
                    className={
                      styles.comparisonRow
                    }
                    key={row.key}
                  >
                    <div
                      className={
                        styles.labelCell
                      }
                    >
                      {row.label}
                    </div>

                    {products.map(
                      (product) => (
                        <div
                          className={
                            styles.valueCell
                          }
                          key={`${row.key}-${product._id}`}
                        >
                          {row.render(
                            product
                          )}
                        </div>
                      )
                    )}
                  </div>
                )
              )}

              <div
                className={
                  styles.actionsRow
                }
              >
                <div
                  className={
                    styles.labelCell
                  }
                >
                  {isArabic
                    ? "الإجراء"
                    : "Action"}
                </div>

                {products.map(
                  (product) => (
                    <div
                      className={
                        styles.valueCell
                      }
                      key={`action-${product._id}`}
                    >
                      <button
                        type="button"
                        className={
                          styles.cartButton
                        }
                        onClick={() =>
                          handleAddToCart(
                            product
                          )
                        }
                        disabled={
                          typeof product.stock ===
                            "number" &&
                          product.stock <= 0
                        }
                      >
                        {isArabic
                          ? "أضف للسلة"
                          : "Add to cart"}
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}