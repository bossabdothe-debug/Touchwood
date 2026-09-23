"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHeart,
  FiShuffle,
  FiUser,
  FiChevronDown,
} from "react-icons/fi";
import styles from "./BottomNavbar.module.css";

export default function BottomNavbar() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0] === "en" ? "en" : "ar";

  const categories = [
    {
      label: locale === "ar" ? "مكاتب و طاولات كمبيوتر" : "Computer Tables",
      href: `/${locale}/category/computer-tables`,
    },
    {
      label: locale === "ar" ? "كراسي" : "Chairs",
      href: `/${locale}/category/office-chairs`,
      children: [
        {
          label: locale === "ar" ? "كراسي شبك" : "Mesh Chairs",
          href: `/${locale}/category/office-chairs/mesh-chairs`,
        },
        {
          label: locale === "ar" ? "كراسي جلد" : "Leather Chairs",
          href: `/${locale}/category/office-chairs/leather-chairs`,
        },
        {
          label: locale === "ar" ? "كراسي بار" : "Bar Chairs",
          href: `/${locale}/category/office-chairs/bar-chairs`,
        },
        {
          label: locale === "ar" ? "كراسي المعمل" : "Laboratory Chairs",
          href: `/${locale}/category/office-chairs/laboratory-chairs`,
        },
      ],
    },
    {
      label: locale === "ar" ? "انتريهات مكتبية" : "Office Seating Sets",
      href: `/${locale}/category/office-seating-sets`,
    },
    {
      label: locale === "ar" ? "خلايا العمل" : "Working Stations",
      href: `/${locale}/category/working-stations`,
    },
    {
      label: locale === "ar" ? "كاونتر استقبال" : "Reception Desks",
      href: `/${locale}/category/reception-desks`,
    },
    {
      label: locale === "ar" ? "ترابيزات اجتماعات" : "Meeting Tables",
      href: `/${locale}/category/meeting-tables`,
    },
    {
      label:
        locale === "ar"
          ? "اكسسوارات الاثاث المكتبي"
          : "Office Furniture Accessories",
      href: `/${locale}/category/office-furniture-accessories`,
    },
  ];

  return (
    <nav className={styles.bottomNavbar}>
      <div className={styles.container}>
        <div className={styles.categories}>
          {categories.map((category) => (
            <div
              key={category.label}
              className={`${styles.categoryItem} ${
                category.children ? styles.hasDropdown : ""
              }`}
            >
              <Link href={category.href} className={styles.categoryLink}>
                <span>{category.label}</span>

                {category.children && (
                  <FiChevronDown className={styles.chevron} />
                )}
              </Link>

              {category.children && (
                <div className={styles.dropdown}>
                  {category.children.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      className={styles.dropdownLink}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.accountActions}><div className={styles.accountActions}>
  <Link
    href={`/${locale}/wishlist`}
    className={styles.action}
    aria-label={locale === "ar" ? "المفضلة" : "Wishlist"}
  >
    <span className={styles.iconWrapper}>
      <FiHeart />
      <span className={styles.badge}>0</span>
    </span>
    <span>{locale === "ar" ? "المفضلة" : "Wishlist"}</span>
  </Link>

  <span className={styles.separator}>|</span>

  <Link
    href={`/${locale}/compare`}
    className={styles.action}
    aria-label={locale === "ar" ? "المقارنة" : "Compare"}
  >
    <span className={styles.iconWrapper}>
      <FiShuffle />
      <span className={styles.badge}>0</span>
    </span>
    <span>{locale === "ar" ? "المقارنة" : "Compare"}</span>
  </Link>

  <span className={styles.separator}>|</span>

  <Link
    href={`/${locale}/login`}
    className={styles.action}
    aria-label={locale === "ar" ? "الحساب" : "Account"}
  >
    <span className={styles.iconWrapper}>
      <FiUser />
    </span>
    <span>{locale === "ar" ? "الحساب" : "Account"}</span>
  </Link>
</div></div>
      </div>
    </nav>
  );
}