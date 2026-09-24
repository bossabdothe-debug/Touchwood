"use client";

import { usePathname } from "next/navigation";
import SecondHero from "@/components/layout/SecondHero";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileTopNavbar from "@/components/layout/MobileTopNavbar";
import MobileSearchNavbar from "@/components/layout/MobileSearchNavbar";
import MobileBottomNavbar from "@/components/layout/MobileBottomNavbar";
import Hero from "@/components/layout/Hero";
import FeaturedProducts from "@/components/products/FeaturedProducts";


export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAuthPage =
    pathname.endsWith("/login") ||
    pathname.endsWith("/register");

  return (
    <>
      <Navbar />

      <MobileTopNavbar />

      {isAuthPage ? (
        children
      ) : (
        <>
          <MobileSearchNavbar />

          <Hero />
<SecondHero/>
<FeaturedProducts></FeaturedProducts>
          {children}

          <MobileBottomNavbar />
        </>
      )}

      <Footer />
    </>
  );
}