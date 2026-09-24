
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Heart,
  MessageCircle,
  Scale,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
} from "lucide-react";

import {
  addCartItem,
  getProductBySlug,
  addFavorite,
  removeFavorite,
  getProducts,
} from "../../../../../services/api";

import styles from "./ProductDetails.module.css";

type Localized = {
  ar?: string;
  en?: string;
};

type Media = {
  type?: string;
  url: string;
  thumbnail?: string;
  alt?: Localized;
  isPrimary?: boolean;
};

type Spec = {
  label: Localized;
  value: Localized;
};

type Review = {
  _id: string;
  rating?: number;
  comment?: string;
  createdAt?: string;
  user?: {
    name?: string;
    firstName?: string;
    lastName?: string;
  };
};

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
  rating?: number;
  reviewsCount?: number;
  stock?: number;
  reviews?: Review[];
};

const ar = (value?: Localized) =>
  value?.ar || value?.en || "";

const money = (value = 0) =>
  `${new Intl.NumberFormat("ar-EG").format(value)} ج.م`;

export default function ProductDetailsPage() {
  const params = useParams<{
    slug: string;
    locale?: string;
  }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const item = await getProductBySlug(params.slug);

        setProduct(item);

        const products = await getProducts({
          category: item.category,
          active: true,
        });

        const list = Array.isArray(products)
          ? products
          : products.products || [];

        setRelated(
          list
            .filter((p: Product) => p._id !== item._id)
            .slice(0, 4)
        );
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "تعذر تحميل المنتج"
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) load();
  }, [params.slug]);

  const media = useMemo(
    () =>
      [...(product?.media || [])].sort(
        (a, b) =>
          Number(Boolean(b.isPrimary)) -
          Number(Boolean(a.isPrimary))
      ),
    [product]
  );

  const currentImage =
    media[selectedImage]?.url || "/logo.jpeg";

  const addToCart = async () => {
    if (!product) return;

    try {
      const token = localStorage.getItem("token") || "";

      await addCartItem(token, product._id, quantity);

      setMessage("تمت إضافة المنتج إلى السلة");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "تعذر الإضافة إلى السلة"
      );
    }
  };

  const toggleFavorite = async () => {
    if (!product) return;

    try {
      const token = localStorage.getItem("token") || "";

      if (favorite) {
        await removeFavorite(token, product._id);
      } else {
        await addFavorite(token, product._id);
      }

      setFavorite(!favorite);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "يجب تسجيل الدخول أولاً"
      );
    }
  };

  if (loading) {
    return (
      <main className={styles.state}>
        جاري تحميل المنتج...
      </main>
    );
  }

  if (!product) {
    return (
      <main className={styles.state}>
        {message || "المنتج غير موجود"}
      </main>
    );
  }

  return (
    <main className={styles.page} dir="rtl">
      {/* تفاصيل المنتج */}
      <section className={styles.productSection}>
        <div className={styles.gallery} dir="ltr">
          <div className={styles.mainImage}>
            <img
              src={currentImage}
              alt={
                ar(media[selectedImage]?.alt) ||
                ar(product.name)
              }
            />
          </div>

          <div className={styles.thumbnails}>
            {media.map((item, index) => (
              <button
                key={`${item.url}-${index}`}
                className={
                  index === selectedImage
                    ? styles.activeThumb
                    : styles.thumb
                }
                onClick={() => setSelectedImage(index)}
              >
                <img
                  src={item.thumbnail || item.url}
                  alt=""
                />
              </button>
            ))}
          </div>
        </div>

        <div className={styles.info}>
          <span className={styles.category}>
            {product.category}
          </span>

          <h1>{ar(product.name)}</h1>

          <div className={styles.rating}>
            <Star size={17} fill="currentColor" />

            {product.rating || 0}

            <span>
              (
              {product.reviewsCount ||
                product.reviews?.length ||
                0}{" "}
              مراجعة)
            </span>
          </div>

          <div className={styles.priceRow}>
            <strong>{money(product.price)}</strong>

            {product.oldPrice ? (
              <del>{money(product.oldPrice)}</del>
            ) : null}
          </div>

          <p className={styles.description}>
            {ar(product.description)}
          </p>

          <div className={styles.actions}>
            <div className={styles.quantity}>
              <button
                onClick={() =>
                  setQuantity(Math.max(1, quantity - 1))
                }
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>

            <button
              className={styles.cartButton}
              onClick={addToCart}
            >
              <ShoppingCart size={19} />
              أضف إلى السلة
            </button>

            <button
              className={styles.iconButton}
              onClick={toggleFavorite}
              aria-label="المفضلة"
            >
              <Heart
                size={20}
                fill={favorite ? "currentColor" : "none"}
              />
            </button>

            <button
              className={styles.iconButton}
              aria-label="المقارنة"
            >
              <Scale size={20} />
            </button>
          </div>

          {message && (
            <p className={styles.message}>{message}</p>
          )}

          <div className={styles.delivery}>
            <Truck size={20} />
            <span>شحن ودعم موثوق لطلبك</span>
          </div>
        </div>
      </section>

      {/* الضمان والدعم */}
      <section className={styles.serviceGrid}>
        <article className={styles.serviceCard}>
          <ShieldCheck size={28} />

          <div>
            <h2>ضمان جودة المنتجات</h2>

            <p>
              تتمتع جميع كراسي المكتب والانتريهات المكتبية
              بضمان لمدة 12 شهراً من تاريخ الفاتورة.
            </p>

            <p>
              تتمتع جميع المكاتب المكتبية المصنعة لدينا
              بضمان لمدة 36 شهراً من تاريخ الفاتورة.
            </p>
          </div>
        </article>

        <article className={styles.serviceCard}>
          <img
            src="https://zakariafurniture.com/wp-content/uploads/2025/01/overview.svg"
            alt=""
          />

          <div>
            <h2>دعم وخدمة ما بعد البيع</h2>

            <p>
              نقدّم دعمًا فنيًا وخدمة ما بعد البيع لضمان
              رضاكم التام ومعالجة أي استفسارات أو ملاحظات
              في أسرع وقت.
            </p>

            <a
              href="https://wa.me/201142447767"
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} />
              01142447767
            </a>
          </div>
        </article>
      </section>

      {/* الوصف والمواصفات */}
      <section className={styles.contentSection}>
        <h2>المواصفات والوصف</h2>

        <p className={styles.longDescription}>
          {ar(product.description)}
        </p>

        {product.specifications?.length ? (
          <div className={styles.specs}>
            {product.specifications.map((spec, index) => (
              <div
                className={styles.specRow}
                key={index}
              >
                <span>{ar(spec.label)}</span>
                <strong>{ar(spec.value)}</strong>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* مراجعات العملاء */}
      <section className={styles.contentSection}>
        <h2>مراجعات العملاء</h2>

        <div className={styles.reviews}>
          {(product.reviews || []).length ? (
            product.reviews!.map((review) => (
              <article
                className={styles.review}
                key={review._id}
              >
                <strong>
                  {review.user?.name ||
                    `${review.user?.firstName || "عميل"} ${
                      review.user?.lastName || ""
                    }`}
                </strong>

                <div className={styles.rating}>
                  {"★".repeat(review.rating || 0)}
                </div>

                <p>{review.comment}</p>
              </article>
            ))
          ) : (
            <p>لا توجد مراجعات لهذا المنتج حتى الآن.</p>
          )}
        </div>
      </section>

      {/* المنتجات المقترحة */}
      <section className={styles.contentSection}>
        <h2>منتجات مقترحة</h2>

        <div className={styles.relatedGrid}>
          {related.map((item) => (
            <a
              href={`/${params.locale || "ar"}/products/${
                item.slug || item._id
              }`}
              className={styles.relatedCard}
              key={item._id}
            >
              <img
                src={
                  item.media?.find((m) => m.isPrimary)?.url ||
                  item.media?.[0]?.url ||
                  "/logo.jpeg"
                }
                alt={ar(item.name)}
              />

              <h3>{ar(item.name)}</h3>

              <strong>{money(item.price)}</strong>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}