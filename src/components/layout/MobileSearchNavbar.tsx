"use client";

import { usePathname } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import styles from "./MobileSearchNavbar.module.css";

export default function MobileSearchNavbar() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0] === "en" ? "en" : "ar";

  return (
    <div className={styles.searchNavbar}>
      <div className={styles.searchWrapper}>
        <input
          type="text"
          placeholder={
            locale === "ar"
              ? "ابحث عن منتج..."
              : "Search for a product..."
          }
          className={styles.searchInput}
        />

        <button
          type="button"
          className={styles.searchButton}
          aria-label={
            locale === "ar" ? "بحث" : "Search"
          }
        >
          <FiSearch />
        </button>
      </div>
    </div>
  );
}