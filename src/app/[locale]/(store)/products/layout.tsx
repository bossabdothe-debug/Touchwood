import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileTopNavbar from "@/components/layout/MobileTopNavbar";
import MobileBottomNavbar from "@/components/layout/MobileBottomNavbar";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";

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
      <WhatsAppFloatingButton></WhatsAppFloatingButton>

<MobileBottomNavbar></MobileBottomNavbar>
      <Footer />
    </>
  );
}