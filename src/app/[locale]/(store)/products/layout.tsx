import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileTopNavbar from "@/components/layout/MobileTopNavbar";
import MobileBottomNavbar from "@/components/layout/MobileBottomNavbar";
export default function ProductsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />

      <MobileTopNavbar />

      <main>{children}</main>
<MobileBottomNavbar></MobileBottomNavbar>
      <Footer />
    </>
  );
}