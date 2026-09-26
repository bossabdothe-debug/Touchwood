"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiMapPin,
  FiPackage,
  FiTruck,
} from "react-icons/fi";

import styles from "./ShippingPage.module.css";

type Locale = "ar" | "en";

const t = (locale: Locale, ar: string, en: string) =>
  locale === "ar" ? ar : en;

export default function ShippingPage() {
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
          {t(locale, "الشحن والتوصيل", "Shipping & Delivery")}
        </span>
      </nav>

      {/* Hero */}

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>
            SHIPPING & DELIVERY
          </span>

          <h1>
            {t(
              locale,
              "شحن سريع إلى جميع أنحاء الجمهورية",
              "Fast shipping across Egypt"
            )}
          </h1>

          <div className={styles.orangeLine} />

          <p>
            {t(
              locale,
              "نحرص على وصول طلبك إليك بسرعة وأمان، مع خدمة شحن متاحة لجميع أنحاء الجمهورية.",
              "We make sure your order reaches you quickly and safely, with shipping available across Egypt."
            )}
          </p>

          <div className={styles.heroInfo}>
            <div>
              <strong>250</strong>
              <span>
                {t(locale, "جنيه", "EGP")}
              </span>
            </div>

            <div className={styles.heroInfoDivider} />

            <div>
              <strong>3–5</strong>
              <span>
                {t(locale, "أيام عمل", "Business Days")}
              </span>
            </div>
          </div>
        </div>

        {/* SVG Illustration */}

        <div className={styles.heroIllustration}>
          <div className={styles.circleOne} />
          <div className={styles.circleTwo} />

          <svg
            className={styles.truckSvg}
            viewBox="0 0 700 430"
            role="img"
            aria-label={t(
              locale,
              "شاحنة توصيل",
              "Delivery truck"
            )}
          >
            {/* Road */}

            <path
              d="M75 350H625"
              fill="none"
              stroke="#183d2b"
              strokeWidth="10"
              strokeLinecap="round"
            />

            <path
              d="M115 372H220"
              fill="none"
              stroke="#ef8116"
              strokeWidth="5"
              strokeLinecap="round"
            />

            <path
              d="M480 372H585"
              fill="none"
              stroke="#ef8116"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Truck Body */}

            <path
              d="M105 170
                 C105 158 115 148 127 148
                 H425
                 C438 148 448 158 448 171
                 V316
                 H105
                 Z"
              fill="#315f2b"
            />

            {/* Orange upper body */}

            <path
              d="M105 170
                 C105 158 115 148 127 148
                 H425
                 C438 148 448 158 448 171
                 V195
                 H105
                 Z"
              fill="#3f7a35"
            />

            {/* Truck front */}

            <path
              d="M448 205
                 H520
                 C531 205 541 211 547 221
                 L594 287
                 C598 293 600 300 600 308
                 V316
                 H448
                 Z"
              fill="#ef8116"
            />

            {/* Front window */}

            <path
              d="M470 221
                 H516
                 C521 221 526 224 530 229
                 L555 263
                 H470
                 Z"
              fill="#e9f1eb"
            />

            {/* Window reflection */}

            <path
              d="M480 226H507L520 257H492Z"
              fill="#ffffff"
              opacity=".55"
            />

            {/* Cargo box */}

            <rect
              x="130"
              y="175"
              width="282"
              height="115"
              rx="5"
              fill="#f8faf8"
            />

            <rect
              x="130"
              y="175"
              width="282"
              height="115"
              rx="5"
              fill="none"
              stroke="#d5ded8"
              strokeWidth="4"
            />

            {/* Logo */}

            <circle
              cx="271"
              cy="232"
              r="43"
              fill="#183d2b"
            />

            <circle
              cx="271"
              cy="232"
              r="35"
              fill="#315f2b"
            />

            <path
              d="M249 205
                 C239 205 233 214 233 224
                 V249
                 C233 259 240 266 250 266
                 H264
                 V245
                 H252
                 C249 245 247 243 247 239
                 V222
                 C247 217 250 214 254 214
                 H272
                 C286 214 296 222 299 235
                 L303 251
                 H289
                 L286 238
                 C284 231 279 228 272 228
                 H258
                 V245
                 H276
                 V259
                 H249"
              fill="none"
              stroke="#ffffff"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Package */}

            <path
              d="M173 278L205 258L237 278L205 298Z"
              fill="#ef8116"
            />

            <path
              d="M173 278V311L205 330V298Z"
              fill="#d96f0e"
            />

            <path
              d="M237 278V311L205 330V298Z"
              fill="#f69a42"
            />

            <path
              d="M205 258V298"
              stroke="#ffffff"
              strokeWidth="4"
            />

            {/* Truck bumper */}

            <path
              d="M570 316H614"
              fill="none"
              stroke="#183d2b"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Wheels */}

            <circle
              cx="190"
              cy="319"
              r="42"
              fill="#183d2b"
            />

            <circle
              cx="190"
              cy="319"
              r="20"
              fill="#ffffff"
            />

            <circle
              cx="190"
              cy="319"
              r="9"
              fill="#ef8116"
            />

            <circle
              cx="515"
              cy="319"
              r="42"
              fill="#183d2b"
            />

            <circle
              cx="515"
              cy="319"
              r="20"
              fill="#ffffff"
            />

            <circle
              cx="515"
              cy="319"
              r="9"
              fill="#ef8116"
            />

            {/* Motion lines */}

            <path
              d="M75 205H40"
              stroke="#ef8116"
              strokeWidth="7"
              strokeLinecap="round"
            />

            <path
              d="M85 230H28"
              stroke="#315f2b"
              strokeWidth="7"
              strokeLinecap="round"
            />

            <path
              d="M76 255H48"
              stroke="#ef8116"
              strokeWidth="7"
              strokeLinecap="round"
            />

            {/* Location pin */}

            <path
              d="M606 112
                 C606 91 623 74 644 74
                 C665 74 682 91 682 112
                 C682 141 644 170 644 170
                 C644 170 606 141 606 112Z"
              fill="#ef8116"
            />

            <circle
              cx="644"
              cy="111"
              r="12"
              fill="#ffffff"
            />
          </svg>

          <div className={styles.deliveryBadge}>
            <FiTruck />
            <span>
              {t(locale, "توصيل سريع", "Fast Delivery")}
            </span>
          </div>
        </div>
      </section>

      {/* Main Information */}

      <section className={styles.shippingInfo}>
        <div className={styles.infoIntro}>
          <span className={styles.sectionLabel}>
            {t(locale, "الشحن والتوصيل", "SHIPPING & DELIVERY")}
          </span>

          <h2>
            {t(
              locale,
              "طلبك في طريقه إليك",
              "Your order is on its way"
            )}
          </h2>

          <div className={styles.smallLine} />

          <p>
            {t(
              locale,
              "نوفر خدمة شحن سريعة لجميع أنحاء الجمهورية بتكلفة ثابتة قدرها 250 جنيه، ويستغرق وصول الطلب من 3 إلى 5 أيام عمل.",
              "We offer fast shipping across Egypt for a fixed cost of 250 EGP. Orders are delivered within 3 to 5 business days."
            )}
          </p>
        </div>

        <div className={styles.infoCards}>
          <article className={styles.infoCard}>
            <div className={styles.cardIcon}>
              <FiTruck />
            </div>

            <div>
              <span>01</span>

              <h3>
                {t(
                  locale,
                  "شحن سريع",
                  "Fast Shipping"
                )}
              </h3>

              <p>
                {t(
                  locale,
                  "نوصل طلباتك إلى جميع أنحاء الجمهورية.",
                  "We deliver your orders across Egypt."
                )}
              </p>
            </div>
          </article>

          <article className={styles.infoCard}>
            <div className={styles.cardIcon}>
              <FiMapPin />
            </div>

            <div>
              <span>02</span>

              <h3>
                {t(
                  locale,
                  "جميع أنحاء الجمهورية",
                  "Nationwide Delivery"
                )}
              </h3>

              <p>
                {t(
                  locale,
                  "خدمة الشحن متاحة لجميع المحافظات.",
                  "Shipping is available across all governorates."
                )}
              </p>
            </div>
          </article>

          <article className={styles.infoCard}>
            <div className={styles.cardIcon}>
              <FiPackage />
            </div>

            <div>
              <span>03</span>

              <h3>
                {t(
                  locale,
                  "3 إلى 5 أيام عمل",
                  "3 to 5 Business Days"
                )}
              </h3>

              <p>
                {t(
                  locale,
                  "مدة التوصيل المتوقعة من 3 إلى 5 أيام عمل.",
                  "Expected delivery time is 3 to 5 business days."
                )}
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* Cost Section */}

      <section className={styles.costSection}>
        <div className={styles.costBox}>
          <div className={styles.costIcon}>
            <FiTruck />
          </div>

          <div className={styles.costText}>
            <span>
              {t(
                locale,
                "تكلفة الشحن",
                "SHIPPING COST"
              )}
            </span>

            <strong>250</strong>

            <small>
              {t(locale, "جنيه مصري", "EGP")}
            </small>
          </div>

          <div className={styles.costDivider} />

          <div className={styles.costText}>
            <span>
              {t(
                locale,
                "مدة التوصيل",
                "DELIVERY TIME"
              )}
            </span>

            <strong>3–5</strong>

            <small>
              {t(locale, "أيام عمل", "BUSINESS DAYS")}
            </small>
          </div>
        </div>
      </section>

      {/* Final CTA */}

      <section className={styles.cta}>
        <div className={styles.ctaCircle} />

        <div className={styles.ctaLogo}>
          <Image
            src="/images/logo.jpeg"
            alt="Touchwood"
            width={100}
            height={100}
          />
        </div>

        <div className={styles.ctaContent}>
          <span>TOUCHWOOD</span>

          <h2>
            {t(
              locale,
              "اختر ما يناسبك ودع الباقي علينا",
              "Choose what you love. We'll handle the rest."
            )}
          </h2>

          <p>
            {t(
              locale,
              "اكتشف منتجات تاتش وود واستمتع بتجربة شراء سهلة.",
              "Explore Touchwood products and enjoy an easy shopping experience."
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