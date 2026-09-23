"use client";

import { useState } from "react";
import AdminGuard from "./AdminGuard";
import AdminTopbar from "./AdminTopbar";
import AdminSidebar from "./AdminSidebar";
import "./admin.css";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="admin-layout">
        <AdminTopbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {sidebarOpen && (
          <button
            type="button"
            className="admin-sidebar-overlay"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="admin-main">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}

