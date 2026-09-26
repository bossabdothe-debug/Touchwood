"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiHeart,
  FiHome,
  FiShield,
} from "react-icons/fi";

import styles from "./AboutPage.module.css";

type Locale = "ar" | "en";

const t = (locale: Locale, ar: string, en: string) =>
  locale === "ar" ? ar : en;

export default function AboutPage() {
  const params = useParams<{ locale?: string }>();

  const locale: Locale = params.locale === "en" ? "en" : "ar";
  const isArabic = locale === "ar";

  const ArrowIcon = isArabic ? FiArrowLeft : FiArrowRight;

  return (
    <main className={styles.page} dir={isArabic ? "rtl" : "ltr"}>
      {/* =========================
          Breadcrumb
      ========================== */}
      <nav
        className={styles.breadcrumb}
        aria-label={isArabic ? "مسار التنقل" : "Breadcrumb"}
      >
        <Link href={`/${locale}`}>
          {t(locale, "الرئيسية", "Home")}
        </Link>

        <span>/</span>

        <span>
          {t(locale, "من نحن", "About Us")}
        </span>
      </nav>

      {/* =========================
          Hero
      ========================== */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.logoCard}>
            <Image
              src="/images/logo.jpeg"
              alt="Touchwood"
              width={348}
              height={348}
              priority
              className={styles.logoImage}
            />
          </div>

          <div className={styles.logoCaption}>
            <span>TOUCHWOOD</span>
            <small>
              {t(
                locale,
                "الأثاث الذي يصنع الفرق",
                "Furniture that makes a difference"
              )}
            </small>
          </div>
        </div>

        <div className={styles.heroContent}>
          <span className={styles.overline}>
            {t(locale, "من نحن", "ABOUT TOUCHWOOD")}
          </span>

          <h1>
            {t(
              locale,
              "مساحتك تستحق أثاثًا يشبهها.",
              "Your space deserves furniture that feels like you."
            )}
          </h1>

          <p>
            {t(
              locale,
              "في Touchwood نقدم أثاثًا يجمع بين التصميم العملي، التفاصيل الجميلة، والجودة التي تجعل القطعة جزءًا حقيقيًا من منزلك.",
              "At Touchwood, we bring together practical design, beautiful details and lasting quality to create furniture that truly belongs in your home."
            )}
          </p>

          <div className={styles.heroActions}>
            <Link
              href={`/${locale}/products`}
              className={styles.primaryButton}
            >
              <span>
                {t(locale, "اكتشف منتجاتنا", "Explore Products")}
              </span>

              <ArrowIcon aria-hidden="true" />
            </Link>

            <div className={styles.heroNote}>
              <FiCheck aria-hidden="true" />
              <span>
                {t(
                  locale,
                  "تصميم • جودة • راحة",
                  "Design • Quality • Comfort"
                )}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          Intro
      ========================== */}
      <section className={styles.intro}>
        <div className={styles.introNumber}>01</div>

        <div className={styles.introContent}>
          <span className={styles.overline}>
            {t(locale, "قصتنا", "OUR STORY")}
          </span>

          <h2>
            {t(
              locale,
              "نؤمن أن الأثاث ليس مجرد قطعة.",
              "We believe furniture is more than a piece."
            )}
          </h2>

          <div className={styles.introText}>
            <p>
              {t(
                locale,
                "كل قطعة أثاث تدخل منزلك تصبح جزءًا من يومك. لهذا نهتم بأن تكون القطعة جميلة في شكلها، عملية في استخدامها، ومريحة في حضورها.",
                "Every piece of furniture becomes part of your everyday life. That is why we care about making every piece beautiful, practical and comfortable."
              )}
            </p>

            <p>
              {t(
                locale,
                "هدفنا هو أن نمنحك اختيارات تساعدك على بناء مساحة تحمل طابعك الخاص وتعيش معك لفترة طويلة.",
                "Our goal is to give you choices that help create a space with your own character — a space made to last."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* =========================
          Green Statement
      ========================== */}
      <section className={styles.statement}>
        <div className={styles.statementLogo}>
          <Image
            src="/images/logo.jpeg"
            alt=""
            width={170}
            height={170}
            className={styles.statementLogoImage}
          />
        </div>

        <div className={styles.statementContent}>
          <span className={styles.statementOverline}>
            {t(locale, "لماذا Touchwood؟", "WHY TOUCHWOOD?")}
          </span>

          <h2>
            {t(
              locale,
              "لأن التفاصيل هي التي تجعل المكان مكانك.",
              "Because details are what make a space yours."
            )}
          </h2>

          <p>
            {t(
              locale,
              "نختار التصميمات بعناية ونضع تجربة الاستخدام في المقدمة، لنقدم لك أثاثًا يناسب الحياة اليومية وليس مجرد صورة جميلة.",
              "We carefully select our designs and put everyday experience first, creating furniture that works for real life — not just for a beautiful picture."
            )}
          </p>
        </div>
      </section>

      {/* =========================
          Values
      ========================== */}
      <section className={styles.values}>
        <div className={styles.valuesHeading}>
          <span className={styles.overline}>
            {t(locale, "قيمنا", "OUR VALUES")}
          </span>

          <h2>
            {t(
              locale,
              "ما نهتم به في كل قطعة.",
              "What matters in every piece."
            )}
          </h2>
        </div>

        <div className={styles.valuesGrid}>
          <article className={styles.valueCard}>
            <div className={styles.valueIcon}>
              <FiHome aria-hidden="true" />
            </div>

            <span className={styles.valueNumber}>01</span>

            <h3>
              {t(locale, "تصميم عملي", "Practical Design")}
            </h3>

            <p>
              {t(
                locale,
                "تصميمات جميلة ومناسبة للاستخدام اليومي.",
                "Beautiful designs made for everyday living."
              )}
            </p>
          </article>

          <article className={styles.valueCard}>
            <div className={styles.valueIcon}>
              <FiShield aria-hidden="true" />
            </div>

            <span className={styles.valueNumber}>02</span>

            <h3>
              {t(locale, "جودة نهتم بها", "Quality First")}
            </h3>

            <p>
              {t(
                locale,
                "نركز على التفاصيل التي تجعل القطعة تستحق مكانها في منزلك.",
                "We focus on details that make every piece worth its place in your home."
              )}
            </p>
          </article>

          <article className={styles.valueCard}>
            <div className={styles.valueIcon}>
              <FiHeart aria-hidden="true" />
            </div>

            <span className={styles.valueNumber}>03</span>

            <h3>
              {t(locale, "اختيار بعناية", "Carefully Selected")}
            </h3>

            <p>
              {t(
                locale,
                "نختار منتجاتنا بعناية لتناسب مختلف الأذواق والمساحات.",
                "Our products are carefully selected for different styles and spaces."
              )}
            </p>
          </article>
        </div>
      </section>

      {/* =========================
          Mission
      ========================== */}
      <section className={styles.mission}>
        <div className={styles.missionSide}>
          <span>02</span>
          <div />
        </div>

        <div className={styles.missionContent}>
          <span className={styles.overline}>
            {t(locale, "رؤيتنا", "OUR VISION")}
          </span>

          <h2>
            {t(
              locale,
              "أن نصنع مساحات أجمل للحياة.",
              "Creating better spaces for living."
            )}
          </h2>

          <p>
            {t(
              locale,
              "نريد أن تكون Touchwood وجهتك لاختيار الأثاث الذي يجمع بين الشكل الجميل والاستخدام الحقيقي، مع تجربة بسيطة وواضحة من البداية إلى النهاية.",
              "We want Touchwood to be your destination for furniture that combines beautiful design with real functionality, supported by a simple and clear experience from start to finish."
            )}
          </p>
        </div>
      </section>

      {/* =========================
          CTA
      ========================== */}
      <section className={styles.cta}>
        <div className={styles.ctaLogo}>
          <Image
            src="/images/logo.jpeg"
            alt=""
            width={90}
            height={90}
            className={styles.ctaLogoImage}
          />
        </div>

        <div className={styles.ctaContent}>
          <span>
            {t(locale, "اكتشف Touchwood", "DISCOVER TOUCHWOOD")}
          </span>

          <h2>
            {t(
              locale,
              "جاهز لتجعل مساحتك تشبهك؟",
              "Ready to make your space feel like you?"
            )}
          </h2>
        </div>

        <Link
          href={`/${locale}/products`}
          className={styles.ctaButton}
        >
          <span>
            {t(locale, "تصفح المنتجات", "Browse Products")}
          </span>

          <ArrowIcon aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}