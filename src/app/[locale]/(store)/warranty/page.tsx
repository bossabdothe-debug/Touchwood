"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiFileText,
  FiHeart,
  FiShield,
} from "react-icons/fi";

import styles from "./WarrantyPage.module.css";

type Locale = "ar" | "en";

const t = (locale: Locale, ar: string, en: string) =>
  locale === "ar" ? ar : en;

export default function WarrantyPage() {
  const params = useParams<{ locale?: string }>();

  const locale: Locale = params.locale === "en" ? "en" : "ar";
  const isArabic = locale === "ar";

  const ArrowIcon = isArabic ? FiArrowLeft : FiArrowRight;

  return (
    <main className={styles.page} dir={isArabic ? "rtl" : "ltr"}>
      {/* Breadcrumb */}

      <nav
        className={styles.breadcrumb}
        aria-label={isArabic ? "مسار التنقل" : "Breadcrumb"}
      >
        <Link href={`/${locale}`}>
          {t(locale, "الرئيسية", "Home")}
        </Link>

        <span>/</span>

        <span>
          {t(locale, "الضمان", "Warranty")}
        </span>
      </nav>

      {/* Hero */}

      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>
            WARRANTY
          </span>

          <h1>
            {t(
              locale,
              "ضمان تاتش وود",
              "Touchwood Warranty"
            )}
          </h1>

          <div className={styles.orangeLine} />

          <p>
            {t(
              locale,
              "تقدم تاتش وود ضماناً سارياً من تاريخ الفاتورة الشرائية لمدة 12 شهراً على جميع كراسي والأنتريهات المكتبية، وضماناً ممتداً لمدة 36 شهراً على كافة المكاتب من تصنيعنا.",
              "Touchwood provides a warranty starting from the purchase invoice date: 12 months on all office chairs and sofas, and an extended 36-month warranty on all desks manufactured by us."
            )}
          </p>
        </div>

        <div className={styles.heroImage}>
          <Image
            src="/images/warranty-hero.png"
            alt={t(
              locale,
              "أثاث مكتبي من تاتش وود",
              "Touchwood office furniture"
            )}
            fill
            priority
            sizes="(max-width: 800px) 100vw, 55vw"
          />

          <div className={styles.heroImageShade} />

          <div className={styles.shield}>
            <div className={styles.shieldInner}>
              <Image
                src="/images/logo.jpeg"
                alt="Touchwood"
                width={62}
                height={62}
              />

              <FiCheck aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      {/* Warranty Stats */}

      <section className={styles.stats}>
        <article className={styles.stat}>
          <div className={styles.statIcon}>
            <FiShield />
          </div>

          <strong>36</strong>

          <h3>
            {t(
              locale,
              "شهر ضمان على المكاتب",
              "Months Warranty on Desks"
            )}
          </h3>

          <p>
            {t(
              locale,
              "ضمان ممتد لمدة 36 شهراً على كافة المكاتب من تصنيعنا.",
              "Extended 36-month warranty on all desks manufactured by us."
            )}
          </p>
        </article>

        <article className={styles.stat}>
          <div className={styles.statIcon}>
            <FiHeart />
          </div>

          <strong>12</strong>

          <h3>
            {t(
              locale,
              "شهر ضمان على الكراسي والأنتريهات المكتبية",
              "Months Warranty on Chairs & Sofas"
            )}
          </h3>

          <p>
            {t(
              locale,
              "ضمان لمدة 12 شهراً من تاريخ الفاتورة الشرائية.",
              "12-month warranty starting from the purchase invoice date."
            )}
          </p>
        </article>

        <article className={styles.stat}>
          <div className={styles.statIcon}>
            <FiFileText />
          </div>

          <strong className={styles.dateText}>
            {t(locale, "من تاريخ", "FROM")}
          </strong>

          <h3>
            {t(
              locale,
              "الفاتورة الشرائية",
              "Purchase Invoice"
            )}
          </h3>

          <p>
            {t(
              locale,
              "يبدأ سريان الضمان من تاريخ الفاتورة الشرائية.",
              "The warranty starts from the purchase invoice date."
            )}
          </p>
        </article>

        <article className={styles.stat}>
          <div className={styles.statIcon}>
            <FiCheck />
          </div>

          <strong className={styles.qualityText}>
            {t(locale, "جودة", "QUALITY")}
          </strong>

          <h3>
            {t(locale, "مضمونة", "GUARANTEED")}
          </h3>

          <p>
            {t(
              locale,
              "منتجاتنا مصممة لتدوم وتلبي احتياجاتك العملية.",
              "Our products are designed to last and meet your practical needs."
            )}
          </p>
        </article>
      </section>

      {/* Details */}

      <section className={styles.details}>
        <div className={styles.detailsText}>
          <span className={styles.sectionLabel}>
            {t(locale, "تفاصيل الضمان", "WARRANTY DETAILS")}
          </span>

          <h2>
            {t(
              locale,
              "راحة بالك .. هي أولويتنا",
              "Your peace of mind comes first"
            )}
          </h2>

          <div className={styles.smallLine} />

          <p className={styles.detailsParagraph}>
            {t(
              locale,
              "نؤمن في تاتش وود بجودة منتجاتنا، لذلك نقدم لك ضماناً موثوقاً يغطي جميع الكراسي والأنتريهات المكتبية لمدة 12 شهراً، وضماناً ممتداً لمدة 36 شهراً على كافة المكاتب من تصنيعنا.",
              "At Touchwood, we believe in the quality of our products. That is why we provide a reliable warranty covering all office chairs and sofas for 12 months, with an extended 36-month warranty on all desks manufactured by us."
            )}
          </p>

          <div className={styles.checkList}>
            <div>
              <span>
                <FiCheck />
              </span>

              <p>
                {t(
                  locale,
                  "ضمان على الكراسي والأنتريهات المكتبية لمدة 12 شهراً.",
                  "12-month warranty on office chairs and sofas."
                )}
              </p>
            </div>

            <div>
              <span>
                <FiCheck />
              </span>

              <p>
                {t(
                  locale,
                  "ضمان ممتد على كافة المكاتب من تصنيعنا لمدة 36 شهراً.",
                  "Extended 36-month warranty on all desks manufactured by us."
                )}
              </p>
            </div>
          </div>

          <Link
            href={`/${locale}/contact`}
            className={styles.contactButton}
          >
            <span>
              {t(locale, "تواصل معنا", "Contact Us")}
            </span>

            <ArrowIcon />
          </Link>
        </div>

        <div className={styles.detailsImage}>
          <Image
            src="/images/warranty-detail.png"
            alt={t(
              locale,
              "مكتب من تاتش وود",
              "Touchwood desk"
            )}
            fill
            sizes="(max-width: 800px) 100vw, 55vw"
          />

          <div className={styles.imageOrangeBar} />

          <div className={styles.imageMessage}>
            <strong>
              {t(locale, "جودة تدوم", "QUALITY")}
            </strong>

            <strong>
              {t(locale, "معك", "THAT LASTS")}
            </strong>

            <div />

            <Image
              src="/images/logo.jpeg"
              alt="Touchwood"
              width={58}
              height={58}
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}

      <section className={styles.cta}>
        <div className={styles.ctaDecoration} />

        <div className={styles.ctaLogo}>
          <Image
            src="/images/logo.jpeg"
            alt="Touchwood"
            width={105}
            height={105}
          />
        </div>

        <div className={styles.ctaContent}>
          <span>TOUCHWOOD</span>

          <h2>
            {t(
              locale,
              "اختيارك الذكي لمكان أفضل",
              "The smart choice for a better space"
            )}
          </h2>

          <p>
            {t(
              locale,
              "اكتشف مجموعتنا من الأثاث المكتبي المصمم ليومك.",
              "Explore our office furniture collection designed for your everyday life."
            )}
          </p>

          <div className={styles.ctaLine} />

          <a
            href={`/${locale}/shop`}
            className={styles.productsButton}
          >
            <span>
              {t(locale, "تصفح المنتجات", "Browse Products")}
            </span>

            <ArrowIcon />
          </a>
        </div>
      </section>
    </main>
  );
}