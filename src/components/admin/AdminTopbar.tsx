"use client";

import Image from "next/image";
import { Bell, Globe, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./AdminTopbar.module.css";

type AdminTopbarProps = {
  onMenuClick: () => void;
};

type AdminUser = {
  name?: string;
  email?: string;
  role?: string;
};

export default function AdminTopbar({
  onMenuClick,
}: AdminTopbarProps) {
  const [user, setUser] = useState<AdminUser | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      setUser(null);
    }
  }, []);

  const adminName = user?.name || "Admin";
  const adminInitial = adminName.charAt(0).toUpperCase();

  const pathSegments = pathname.split("/").filter(Boolean);

  const currentLocale =
    pathSegments[0] === "en" ? "en" : "ar";

  const otherLocale =
    currentLocale === "ar" ? "en" : "ar";

  const handleLanguageChange = () => {
    const newPath = [
      otherLocale,
      ...pathSegments.slice(1),
    ].join("/");

    router.push(`/${newPath}`);
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.leftSection}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>

        <div className={styles.logoWrapper}>
          <Image
            src="/logo/logo.jpeg"
            alt="Touch Wood"
            width={115}
            height={44}
            priority
            className={styles.logo}
          />

          <span className={styles.brandName}>
            {currentLocale === "ar"
              ? "تاتش وود للأثاث المكتبي"
              : "Touch Wood Furniture"}
          </span>
        </div>
      </div>

      <div className={styles.rightSection}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={handleLanguageChange}
          aria-label="Change language"
        >
          <Globe size={21} />

          <span>
            {currentLocale === "ar" ? "EN" : "AR"}
          </span>
        </button>

        <button
          type="button"
          className={styles.iconButton}
          aria-label="Notifications"
        >
          <Bell size={21} />

          <span className={styles.notificationBadge}>
            0
          </span>
        </button>

        <div className={styles.separator} />

        <div className={styles.profile}>
          <div className={styles.profileAvatar}>
            {adminInitial}
          </div>

          <div className={styles.profileInfo}>
            <span className={styles.profileName}>
              {adminName}
            </span>

            <span className={styles.profileRole}>
              {currentLocale === "ar"
                ? user?.role === "admin"
                  ? "مدير النظام"
                  : "مدير"
                : user?.role === "admin"
                  ? "Administrator"
                  : "Admin"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}