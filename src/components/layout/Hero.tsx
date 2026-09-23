"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import styles from "./Hero.module.css";

export default function Hero() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0] === "en" ? "en" : "ar";

  const categories = [
    {
      id: "computer-tables",
      name: locale === "ar" ? "مكاتب وطاولات كمبيوتر" : "Computer Tables",
      image: "/categories/3.jpg",
      href: `/${locale}/category/computer-tables`,
    },
    {
      id: "office-chairs",
      name: locale === "ar" ? "كراسي" : "Chairs",
      image: "https://res.cloudinary.com/kxzrjmrk/image/upload/f_auto,q_auto/1",
      href: `/${locale}/category/office-chairs`,
    },
    {
      id: "office-seating-sets",
      name: locale === "ar" ? "انتريهات مكتبية" : "Office Seating Sets",
      image: "/categories/2.jpg",
      href: `/${locale}/category/office-seating-sets`,
    },
    {
      id: "working-stations",
      name: locale === "ar" ? "خلايا العمل" : "Working Stations",
      image: "/categories/4.jpg",
      href: `/${locale}/category/working-stations`,
    },
    {
      id: "reception-desks",
      name: locale === "ar" ? "كاونتر استقبال" : "Reception Desks",
      image: "/categories/5.jpg",
      href: `/${locale}/category/reception-desks`,
    },
    {
      id: "meeting-tables",
      name: locale === "ar" ? "ترابيزات اجتماعات" : "Meeting Tables",
      image: "/categories/6.jpg",
      href: `/${locale}/category/meeting-tables`,
    },
    {
      id: "office-furniture-accessories",
      name:
        locale === "ar"
          ? "اكسسوارات الأثاث المكتبي"
          : "Office Furniture Accessories",
      image: "/categories/7.jpg",
      href: `/${locale}/category/office-furniture-accessories`,
    },
  ];

  return (
    <section className={styles.hero}>
      <div className={styles.desktopCategories}>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={category.href}
            className={styles.category}
          >
            <div className={styles.imageWrapper}>
              <img src={category.image} alt={category.name} />
            </div>

            <span>{category.name}</span>
          </Link>
        ))}
      </div>

      <div className={styles.mobileCategories}>
        <Swiper
          modules={[Autoplay]}
          loop
          freeMode
          allowTouchMove
          slidesPerView={3.5}
          spaceBetween={16}
          speed={2500}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          }}
          dir="rtl"
        >
          {categories.map((category) => (
            <SwiperSlide key={category.id}>
              <Link
                href={category.href}
                className={styles.category}
              >
                <div className={styles.imageWrapper}>
                  <img
                    src={category.image}
                    alt={category.name}
                  />
                </div>

                <span>{category.name}</span>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}