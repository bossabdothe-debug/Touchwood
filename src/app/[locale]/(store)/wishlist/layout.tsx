import type { ReactNode } from "react";
import MobileSearchNavbar from "@/components/layout/MobileSearchNavbar";
import Navbar from "@/components/layout/Navbar";
import MobileBottomNavbar from "@/components/layout/MobileBottomNavbar";
import MobileTopNavbar from "@/components/layout/MobileTopNavbar";
type WishlistLayoutProps = {
  children: ReactNode;
};

export default function WishlistLayout({
  children,
}: WishlistLayoutProps) {
  return (
    <main className="wishlistLayout">
      <Navbar></Navbar>
<MobileTopNavbar></MobileTopNavbar>
<MobileSearchNavbar></MobileSearchNavbar>
      {children}
      <MobileBottomNavbar></MobileBottomNavbar>
    </main>
  );
}