"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiStar, FiX, FiZoomIn } from "react-icons/fi";
import styles from "./Reviews.module.css";

const reviews = [
  {
    id: 1,
    image: "/reviews/1.jpg",
  },
  {
    id: 2,
    image: "/reviews/2.jpg",
  },
  {
    id: 3,
    image: "/reviews/3.jpg",
  },
  {
    id: 4,
    image: "/reviews/4.jpg",
  },
  {
    id: 5,
    image: "/reviews/8.jpg",
  },
  {
    id: 6,
    image: "/reviews/6.jpg",
  },
];
 
export default function ReviewsPage() {
  const pathname = usePathname();
  const [selectedReview, setSelectedReview] = useState<string | null>(null);

  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0] === "en" ? "en" : "ar";
  const isArabic = locale === "ar";

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} />

        <div className={styles.heroContent}>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <FiStar key={star} />
            ))}
          </div>

          <span className={styles.eyebrow}>
            {isArabic ? "تجارب عملائنا" : "Customer Experiences"}
          </span>

          <h1>
            {isArabic ? "آراء عملائنا عن تاتش وود" : "What Our Customers Say"}
          </h1>

          <p>
            {isArabic
              ? "نفخر بثقة عملائنا وتجاربهم مع منتجات تاتش وود."
              : "We are proud of our customers' trust and their experiences with Touch Wood."}
          </p>
        </div>
      </section>

      <section className={styles.reviewsSection}>
        <div className={styles.sectionHeader}>
          <span>
            {isArabic ? "آراء حقيقية من عملائنا" : "Real Customer Reviews"}
          </span>

          <h2>
            {isArabic
              ? "شوف بنفسك تجارب عملائنا"
              : "See What Our Customers Experienced"}
          </h2>
        </div>

        <div className={styles.reviewsGrid}>
          {reviews.map((review) => (
            <button
              key={review.id}
              type="button"
              className={styles.reviewCard}
              onClick={() => setSelectedReview(review.image)}
              aria-label={
                isArabic
                  ? "عرض المراجعة بالحجم الكامل"
                  : "View review in full size"
              }
            >
              <Image
                src={review.image}
                alt={
                  isArabic
                    ? `مراجعة عميل ${review.id}`
                    : `Customer review ${review.id}`
                }
                fill
                sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
              />

              <span className={styles.zoomIcon}>
                <FiZoomIn />
              </span>
            </button>
          ))}
        </div>
      </section>

      {selectedReview && (
        <div
          className={styles.modal}
          onClick={() => setSelectedReview(null)}
        >
          <button
            type="button"
            className={styles.closeButton}
            onClick={() => setSelectedReview(null)}
            aria-label={isArabic ? "إغلاق" : "Close"}
          >
            <FiX />
          </button>

          <div
            className={styles.modalImage}
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={selectedReview}
              alt={isArabic ? "مراجعة عميل" : "Customer review"}
              fill
              sizes="95vw"
            />
          </div>
        </div>
      )}
    </main>
  );
}