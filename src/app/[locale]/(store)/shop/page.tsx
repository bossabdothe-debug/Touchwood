
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FiChevronLeft, FiChevronRight, FiSearch, FiSliders } from "react-icons/fi";

import ProductCard from "@/components/products/ProductCard";
import { getProducts } from "@/services/api";

import styles from "./Shop.module.css";

type Locale = "ar" | "en";

type Localized = {
  ar?: string;
  en?: string;
};

type ProductColor = {
  name?: string | Localized;
  label?: string | Localized;
  value?: string;
  hex?: string;
};

type Product = {
  _id: string;
  name: Localized;
  description?: Localized;
  slug: string;
  category: string;
  price: number;
  oldPrice?: number | null;
  stock: number;
  media?: {
    type?: "image" | "video";
    url: string;
    thumbnail?: string;
    alt?: Localized;
    isPrimary?: boolean;
  }[];
  rating?: number;
  reviewsCount?: number;
  colors?: ProductColor[];
  active?: boolean;
};

const PRODUCTS_PER_PAGE = 12;

const categories = [
  {
    value: "all",
    ar: "كل التصنيفات",
    en: "All Categories",
  },
  {
    value: "computer-desks",
    ar: "مكاتب وطاولات كمبيوتر",
    en: "Computer Desks",
  },
  {
    value: "chairs",
    ar: "كراسي",
    en: "Chairs",
  },
  {
    value: "office-sofas",
    ar: "انتريهات مكتبية",
    en: "Office Sofas",
  },
  {
    value: "work-cells",
    ar: "خلايا العمل",
    en: "Work Cells",
  },
  {
    value: "reception-counters",
    ar: "كاونتر استقبال",
    en: "Reception Counters",
  },
  {
    value: "meeting-tables",
    ar: "ترابيزات اجتماعات",
    en: "Meeting Tables",
  },
  {
    value: "office-accessories",
    ar: "إكسسوارات الأثاث المكتبي",
    en: "Office Accessories",
  },
];

const colorOptions = [
  { value: "all", ar: "كل الألوان", en: "All Colors" },
  { value: "أبيض", ar: "أبيض", en: "White" },
  { value: "أسود", ar: "أسود", en: "Black" },
  { value: "بني", ar: "بني", en: "Brown" },
  { value: "رمادي", ar: "رمادي", en: "Gray" },
  { value: "بيج", ar: "بيج", en: "Beige" },
  { value: "أزرق", ar: "أزرق", en: "Blue" },
];

function getLocalizedText(
  value: Localized | string | undefined,
  locale: Locale,
) {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  return value[locale] || value.ar || value.en || "";
}

function getProductColors(product: Product) {
  if (!Array.isArray(product.colors)) return [];

  return product.colors.map((color) => {
    const colorValue =
      color.name || color.label || color.value || "";

    return typeof colorValue === "string"
      ? colorValue.toLowerCase()
      : getLocalizedText(colorValue, "ar").toLowerCase();
  });
}

function getProductsArray(data: any): Product[] {
  const productsData = Array.isArray(data)
    ? data
    : data?.products ||
      data?.data?.products ||
      data?.data ||
      [];

  return Array.isArray(productsData) ? productsData : [];
}

export default function ShopPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const locale: Locale =
    params?.locale === "en" ? "en" : "ar";

  const isArabic = locale === "ar";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(
    searchParams.get("search") || "",
  );

  const [category, setCategory] = useState(
    searchParams.get("category") || "all",
  );

  const [selectedColor, setSelectedColor] = useState(
    searchParams.get("color") || "all",
  );

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);

  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1,
  );

  const [sortBy, setSortBy] = useState(
    searchParams.get("sort") || "default",
  );

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts({
          active: true,
        });

        setProducts(getProductsArray(data));
      } catch (err) {
        console.error("Failed to load shop products:", err);

        setError(
          isArabic
            ? "حدث خطأ أثناء تحميل المنتجات"
            : "Failed to load products",
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [isArabic]);

  const highestPrice = useMemo(() => {
    if (products.length === 0) return 100000;

    return Math.max(
      ...products.map((product) => Number(product.price) || 0),
      100000,
    );
  }, [products]);

  useEffect(() => {
    setMaxPrice(highestPrice);
  }, [highestPrice]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const productName = getLocalizedText(
        product.name,
        locale,
      ).toLowerCase();

     const productCategory = String(
  product.category || "",
)
  .toLowerCase()
  .trim();

      const matchesSearch =
        !normalizedSearch ||
        productName.includes(normalizedSearch) ||
        productCategory.includes(normalizedSearch);

      const normalizedProductCategory = String(
  product.category || "",
)
  .toLowerCase()
  .trim();

const normalizedSelectedCategory = category
  .toLowerCase()
  .trim();

const matchesCategory =
  category === "all" ||
  productCategory === category.toLowerCase().trim();

      const productPrice = Number(product.price) || 0;

      const matchesPrice =
        productPrice >= minPrice &&
        productPrice <= maxPrice;

      const productColors = getProductColors(product);

      const matchesColor =
        selectedColor === "all" ||
        productColors.some((color) =>
          color.includes(selectedColor.toLowerCase()),
        );

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesColor
      );
    });

    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    }

    if (sortBy === "name") {
      filtered.sort((a, b) => {
        const firstName = getLocalizedText(
          a.name,
          locale,
        );

        const secondName = getLocalizedText(
          b.name,
          locale,
        );

        return firstName.localeCompare(
          secondName,
          locale === "ar" ? "ar" : "en",
        );
      });
    }

    return filtered;
  }, [
    products,
    search,
    category,
    selectedColor,
    minPrice,
    maxPrice,
    sortBy,
    locale,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length / PRODUCTS_PER_PAGE,
    ),
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedProducts = useMemo(() => {
    const startIndex =
      (currentPage - 1) * PRODUCTS_PER_PAGE;

    return filteredProducts.slice(
      startIndex,
      startIndex + PRODUCTS_PER_PAGE,
    );
  }, [filteredProducts, currentPage]);

  const updateUrl = (
    nextPage = currentPage,
  ) => {
    const query = new URLSearchParams();

    if (search.trim()) {
      query.set("search", search.trim());
    }

    if (category !== "all") {
      query.set("category", category);
    }

    if (selectedColor !== "all") {
      query.set("color", selectedColor);
    }

    if (sortBy !== "default") {
      query.set("sort", sortBy);
    }

    if (nextPage > 1) {
      query.set("page", String(nextPage));
    }

    const queryString = query.toString();

   router.push(
  `/${locale}/shop${
    queryString ? `?${queryString}` : ""
  }`,
  { scroll: false },
);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrl(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    updateUrl(1);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setSelectedColor("all");
    setMinPrice(0);
    setMaxPrice(highestPrice);
    setSortBy("default");
    setCurrentPage(1);

    router.push(`/${locale}/shop`, {
      scroll: false,
    });
  };

  const getCategoryName = (value: string) => {
    const selectedCategory = categories.find(
      (item) => item.value === value,
    );

    return selectedCategory
      ? isArabic
        ? selectedCategory.ar
        : selectedCategory.en
      : value;
  };

  const pageTitle = isArabic
    ? "المتجر"
    : "Shop";

  const breadcrumbHome = isArabic
    ? "الرئيسية"
    : "Home";

  const breadcrumbShop = isArabic
    ? "المتجر"
    : "Shop";

  return (
    <main
      className={styles.page}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className={styles.container}>
        <nav
          className={styles.breadcrumbs}
          aria-label={
            isArabic
              ? "مسار التنقل"
              : "Breadcrumb"
          }
        >
          <Link href={`/${locale}`}>
            {breadcrumbHome}
          </Link>

          <span>/</span>

          <span className={styles.currentBreadcrumb}>
            {breadcrumbShop}
          </span>
        </nav>

        <header className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}>
              Touch Wood
            </span>

            <h1 className={styles.title}>
              {pageTitle}
            </h1>

            <p className={styles.description}>
              {isArabic
                ? "اكتشف مجموعة الأثاث المكتبي واختر ما يناسب احتياجاتك"
                : "Explore our office furniture collection and find what suits your needs"}
            </p>
          </div>

          <div className={styles.resultCount}>
            {filteredProducts.length}{" "}
            {isArabic ? "منتج" : "Products"}
          </div>
        </header>

        <section className={styles.shopLayout}>
          <aside className={styles.filters}>
            <div className={styles.filtersHeader}>
              <h2>
                {isArabic
                  ? "تصفية المنتجات"
                  : "Filter Products"}
              </h2>

              <FiSliders />
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="product-search">
                {isArabic
                  ? "البحث عن منتج"
                  : "Search Products"}
              </label>

              <div className={styles.searchInput}>
                <FiSearch />

                <input
                  id="product-search"
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setCurrentPage(1);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleFilterChange();
                    }
                  }}
                  placeholder={
                    isArabic
                      ? "ابحث بالاسم أو الكاتيجوري"
                      : "Search by name or category"
                  }
                />
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="category-filter">
                {isArabic
                  ? "التصنيف"
                  : "Category"}
              </label>

              <select
                id="category-filter"
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setCurrentPage(1);
                }}
              >
                {categories.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {isArabic ? item.ar : item.en}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="color-filter">
                {isArabic
                  ? "اللون"
                  : "Color"}
              </label>

              <select
                id="color-filter"
                value={selectedColor}
                onChange={(event) => {
                  setSelectedColor(event.target.value);
                  setCurrentPage(1);
                }}
              >
                {colorOptions.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {isArabic ? item.ar : item.en}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="sort-filter">
                {isArabic
                  ? "ترتيب المنتجات"
                  : "Sort Products"}
              </label>

              <select
                id="sort-filter"
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="default">
                  {isArabic
                    ? "الترتيب الافتراضي"
                    : "Default"}
                </option>

                <option value="price-low">
                  {isArabic
                    ? "السعر: من الأقل للأعلى"
                    : "Price: Low to High"}
                </option>

                <option value="price-high">
                  {isArabic
                    ? "السعر: من الأعلى للأقل"
                    : "Price: High to Low"}
                </option>

                <option value="name">
                  {isArabic
                    ? "الاسم"
                    : "Name"}
                </option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <div className={styles.priceHeader}>
                <label>
                  {isArabic
                    ? "نطاق السعر"
                    : "Price Range"}
                </label>

                <span>
                  {minPrice.toLocaleString()} -{" "}
                  {maxPrice.toLocaleString()}
                </span>
              </div>

              <div className={styles.rangeWrapper}>
                <input
                  type="range"
                  min="0"
                  max={highestPrice}
                  value={minPrice}
                  onChange={(event) => {
                    const value = Number(
                      event.target.value,
                    );

                    if (value <= maxPrice) {
                      setMinPrice(value);
                      setCurrentPage(1);
                    }
                  }}
                />

                <input
                  type="range"
                  min="0"
                  max={highestPrice}
                  value={maxPrice}
                  onChange={(event) => {
                    const value = Number(
                      event.target.value,
                    );

                    if (value >= minPrice) {
                      setMaxPrice(value);
                      setCurrentPage(1);
                    }
                  }}
                />
              </div>

              <div className={styles.priceValues}>
                <span>{minPrice.toLocaleString()}</span>
                <span>{maxPrice.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="button"
              className={styles.applyButton}
              onClick={handleFilterChange}
            >
              {isArabic
                ? "تطبيق الفلاتر"
                : "Apply Filters"}
            </button>

            <button
              type="button"
              className={styles.clearButton}
              onClick={clearFilters}
            >
              {isArabic
                ? "مسح جميع الفلاتر"
                : "Clear Filters"}
            </button>
          </aside>

          <section className={styles.productsSection}>
            <div className={styles.mobileFilterBar}>
              <span>
                {isArabic
                  ? `عرض ${filteredProducts.length} منتج`
                  : `Showing ${filteredProducts.length} products`}
              </span>

              <button
                type="button"
                onClick={() => {
                  document
                    .querySelector(
                      `.${styles.filters}`,
                    )
                    ?.classList.toggle(
                      styles.filtersOpen,
                    );
                }}
              >
                <FiSliders />

                {isArabic
                  ? "الفلاتر"
                  : "Filters"}
              </button>
            </div>

            {loading ? (
              <div className={styles.statusMessage}>
                {isArabic
                  ? "جاري تحميل المنتجات..."
                  : "Loading products..."}
              </div>
            ) : error ? (
              <div className={styles.statusMessage}>
                {error}
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className={styles.emptyState}>
                <h2>
                  {isArabic
                    ? "لم يتم العثور على منتجات"
                    : "No Products Found"}
                </h2>

                <p>
                  {isArabic
                    ? "جرّب تغيير البحث أو الفلاتر."
                    : "Try changing your search or filters."}
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                >
                  {isArabic
                    ? "عرض جميع المنتجات"
                    : "Show All Products"}
                </button>
              </div>
            ) : (
              <>
                <div className={styles.productsGrid}>
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav
                    className={styles.pagination}
                    aria-label={
                      isArabic
                        ? "ترقيم الصفحات"
                        : "Pagination"
                    }
                  >
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() =>
                        handlePageChange(
                          currentPage - 1,
                        )
                      }
                      aria-label={
                        isArabic
                          ? "الصفحة السابقة"
                          : "Previous page"
                      }
                    >
                      {isArabic ? (
                        <FiChevronRight />
                      ) : (
                        <FiChevronLeft />
                      )}
                    </button>

                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1,
                    ).map((page) => (
                      <button
                        key={page}
                        type="button"
                        className={
                          currentPage === page
                            ? styles.activePage
                            : ""
                        }
                        onClick={() =>
                          handlePageChange(page)
                        }
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={
                        currentPage === totalPages
                      }
                      onClick={() =>
                        handlePageChange(
                          currentPage + 1,
                        )
                      }
                      aria-label={
                        isArabic
                          ? "الصفحة التالية"
                          : "Next page"
                      }
                    >
                      {isArabic ? (
                        <FiChevronLeft />
                      ) : (
                        <FiChevronRight />
                      )}
                    </button>
                  </nav>
                )}
              </>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}