
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileTopNavbar from "@/components/layout/MobileTopNavbar";
import MobileBottomNavbar from "@/components/layout/MobileBottomNavbar";
import Hero from "@/components/layout/Hero";
export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />

      <MobileTopNavbar />
<Hero></Hero>
      <main>{children}</main>

      <MobileBottomNavbar />

      <Footer />
    </>
  );
}