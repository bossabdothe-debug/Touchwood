
"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Settings,
  LogOut,
  X,
} from "lucide-react";

type AdminSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AdminSidebar({
  isOpen,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();

  const locale = params?.locale === "en" ? "en" : "ar";
  const isArabic = locale === "ar";

  const navigation = [
    {
      label: isArabic ? "لوحة التحكم" : "Dashboard",
      href: `/${locale}/admin`,
      icon: LayoutDashboard,
    },
    {
      label: isArabic ? "الطلبات" : "Orders",
      href: `/${locale}/admin/orders`,
      icon: ShoppingBag,
    },
    {
      label: isArabic ? "المنتجات" : "Products",
      href: `/${locale}/admin/products`,
      icon: Package,
    },
    {
      label: isArabic ? "المستخدمون" : "Users",
      href: `/${locale}/admin/users`,
      icon: Users,
    },
    {
      label: isArabic ? "الإعدادات" : "Settings",
      href: `/${locale}/admin/settings`,
      icon: Settings,
    },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}/admin`) {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    onClose();

    router.replace(`/${locale}/login`);
  };

  return (
    <aside
      className={`admin-sidebar ${
        isOpen ? "admin-sidebar-open" : ""
      }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="admin-sidebar-header">
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-brand-mark">
            T
          </div>

          <div>
            <strong>Touchwood</strong>
            <span>
              {isArabic
                ? "لوحة الإدارة"
                : "Admin Panel"}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="admin-sidebar-close"
          onClick={onClose}
          aria-label={
            isArabic
              ? "إغلاق القائمة"
              : "Close menu"
          }
        >
          <X size={22} />
        </button>
      </div>

      <nav className="admin-sidebar-nav">
        <span className="admin-sidebar-section-title">
          {isArabic ? "الإدارة" : "Management"}
        </span>

        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`admin-sidebar-link ${
                active
                  ? "admin-sidebar-link-active"
                  : ""
              }`}
            >
              <Icon size={20} strokeWidth={1.9} />

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="admin-sidebar-bottom">
        <div className="admin-sidebar-divider" />

        <button
          type="button"
          className="admin-sidebar-logout"
          onClick={handleLogout}
        >
          <LogOut size={20} strokeWidth={1.9} />

          <span>
            {isArabic
              ? "تسجيل الخروج"
              : "Logout"}
          </span>
        </button>
      </div>
    </aside>
  );
}

