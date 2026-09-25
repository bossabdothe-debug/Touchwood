
"use client";

import "./FeaturedProducts.css";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import ProductCard from "./ProductCard";
import { getProducts } from "@/services/api";

type Locale = "ar" | "en";

type Localized = {
  ar: string;
  en: string;
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

  media?: {
    type?: "image" | "video";

    url: string;

    thumbnail?: string;

    alt?: Localized;

    sortOrder?: number;

    isPrimary?: boolean;
  }[];

  rating?: number;

  reviewsCount?: number;

  featured?: boolean;

  active?: boolean;
};

export default function FeaturedProducts() {
  const pathname = usePathname();

  const segments =
    pathname?.split("/").filter(Boolean) || [];

  const locale: Locale =
    segments[0] === "en" ? "en" : "ar";

  const isArabic = locale === "ar";

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const data = await getProducts({
          featured: true,
          active: true,
        });

        const productsData = Array.isArray(data)
          ? data
          : data?.products ||
            data?.data?.products ||
            data?.data ||
            [];

        setProducts(
          Array.isArray(productsData)
            ? productsData
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load featured products:",
          error
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section
      className="featured-products"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="featured-products__container">
        <div className="featured-products__header">
          <div>
            <span className="featured-products__eyebrow">
              {isArabic
                ? "عروض تاتش وود"
                : "Touch Wood Offers"}
            </span>

            <h2 className="featured-products__title">
              {isArabic
                ? "المنتجات المميزة"
                : "Featured Products"}
            </h2>

            <p className="featured-products__description">
              {isArabic
                ? "جمعنا لك أفضل عروض تاتش وود في مكان واحد"
                : "We have gathered Touch Wood's best offers in one place"}
            </p>
          </div>
        </div>

        {loading ? (
          <div
            className="featured-products__loading"
            role="status"
            aria-live="polite"
          >
            {isArabic
              ? "جاري تحميل المنتجات..."
              : "Loading products..."}
          </div>
        ) : (
          <Swiper
            modules={[Navigation, Autoplay]}
            dir={isArabic ? "rtl" : "ltr"}
            navigation
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
            }}
            loop={products.length > 4}
            spaceBetween={18}
            slidesPerView={2}
            breakpoints={{
              480: {
                slidesPerView: 1.5,
                spaceBetween: 14,
              },

              640: {
                slidesPerView: 2,
                spaceBetween: 16,
              },

              900: {
                slidesPerView: 3,
                spaceBetween: 18,
              },

              1200: {
                slidesPerView: 4,
                spaceBetween: 20,
              },
            }}
            className="featured-products__swiper"
          >
            {products.map((product) => (
              <SwiperSlide key={product._id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
}