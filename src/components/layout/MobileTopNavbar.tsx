"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FiChevronDown,
  FiMenu,
  FiUser,
  FiX,
} from "react-icons/fi";
import styles from "./MobileTopNavbar.module.css";

export default function MobileTopNavbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [chairsOpen, setChairsOpen] = useState(false);

  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0] === "en" ? "en" : "ar";

  const otherLocale = locale === "ar" ? "en" : "ar";

  const currentPath =
    segments.length > 1 ? `/${segments.slice(1).join("/")}` : "";

  const languageHref = `/${otherLocale}${currentPath}`;

  const categories = [
    {
      label: locale === "ar" ? "مكاتب و طاولات كمبيوتر" : "Computer Tables",
      href: `/${locale}/shop?category=computer-desks`,
    },
    {
      label: locale === "ar" ? "كراسي" : "Chairs",
      href: `/${locale}/shop?category=chairs`,
      children: [
        {
          label: locale === "ar" ? "كراسي شبك" : "Mesh Chairs",
      href: `/${locale}/shop?category=chairs`,
        },
        {
          label: locale === "ar" ? "كراسي جلد" : "Leather Chairs",
      href: `/${locale}/shop?category=chairs`,
        },
        {
          label: locale === "ar" ? "كراسي بار" : "Bar Chairs",
      href: `/${locale}/shop?category=chairs`,
        },
        {
          label: locale === "ar" ? "كراسي المعمل" : "Laboratory Chairs",
      href: `/${locale}/shop?category=chairs`,
        },
      ],
    },
    {
      label: locale === "ar" ? "انتريهات مكتبية" : "Office Seating Sets",
      href: `/${locale}/shop?category=office-sofas`,
    },
    {
      label: locale === "ar" ? "خلايا العمل" : "Working Stations",
      href: `/${locale}/shop?category=work-cells`,
    },
    {
      label: locale === "ar" ? "كاونتر استقبال" : "Reception Desks",
      href: `/${locale}/shop?category=reception-counters`,
    },
    {
      label: locale === "ar" ? "ترابيزات اجتماعات" : "Meeting Tables",
      href: `/${locale}/shop?category=meeting-tables`,
    },
    {
      label:
        locale === "ar"
          ? "اكسسوارات الاثاث المكتبي"
          : "Office Furniture Accessories",
      href: `/${locale}/shop?category=office-accessories`,
    },
  ];

  const closeMenu = () => {
    setMenuOpen(false);
    setChairsOpen(false);
  };

  return (
    <>
      <header className={styles.mobileNavbar}>
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setMenuOpen(true)}
            aria-label={locale === "ar" ? "فتح القائمة" : "Open menu"}
          >
            <FiMenu />
          </button>

       <a
  href={`/${locale}`}
  className={styles.logo}
  onClick={(event) => {
    event.preventDefault();
    closeMenu();
    window.location.assign(`/${locale}`);
  }}
>
  <Image
    src="/logo/logo.jpeg"
    alt={locale === "ar" ? "تاتش وود" : "Touch Wood"}
    width={180}
    height={68}
    priority
  />

  <span className={styles.companyName}>
    {locale === "ar"
      ? "تاتش وود للأثاث المكتبي"
      : "Touch Wood Furniture"}
  </span>
</a>

          <Link
            href={`/${locale}/login`}
            className={styles.userButton}
            aria-label={locale === "ar" ? "الحساب" : "Account"}
          >
            <FiUser />
          </Link>
        </div>
      </header>

      {menuOpen && (
        <div className={styles.menuLayer}>
          <button
            type="button"
            className={styles.overlay}
            onClick={closeMenu}
            aria-label={locale === "ar" ? "إغلاق القائمة" : "Close menu"}
          />

          <aside className={styles.sideMenu}>
            <div className={styles.menuHeader}>
              <span>
                {locale === "ar" ? "التصنيفات" : "Categories"}
              </span>

              <button
                type="button"
                className={styles.closeButton}
                onClick={closeMenu}
                aria-label={locale === "ar" ? "إغلاق" : "Close"}
              >
                <FiX />
              </button>
            </div>

            <div className={styles.menuContent}>
              {categories.map((category) => (
                <div
                  key={category.label}
                  className={styles.menuItem}
                >
                  {category.children ? (
                    <>
                      <div className={styles.categoryWithChildren}>
                        <a
                          href={category.href}
                          className={styles.menuLink}
                          onClick={closeMenu}
                        >
                          {category.label}
                        </a>

                        <button
                          type="button"
                          className={`${styles.categoryToggle} ${
                            chairsOpen ? styles.categoryToggleOpen : ""
                          }`}
                          onClick={() =>
                            setChairsOpen((current) => !current)
                          }
                          aria-label={
                            locale === "ar"
                              ? "عرض أنواع الكراسي"
                              : "Show chair types"
                          }
                        >
                          <FiChevronDown />
                        </button>
                      </div>

                      <div
                        className={`${styles.subMenu} ${
                          chairsOpen ? styles.subMenuOpen : ""
                        }`}
                      >
                        {category.children.map((child) => (
                          <a
                            key={child.label}
                            href={child.href}
                            className={styles.subMenuLink}
                            onClick={closeMenu}
                          >
                            {child.label}
                          </a>
                        ))}
                      </div>
                    </>
                  ) : (
                    <a
                      href={category.href}
                      className={styles.menuLink}
                      onClick={closeMenu}
                    >
                      {category.label}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}