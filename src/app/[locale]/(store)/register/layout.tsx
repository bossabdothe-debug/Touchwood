import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import MobileBottomNavbar from "@/components/layout/MobileBottomNavbar";
import MobileTopNavbar from "@/components/layout/MobileTopNavbar";
import Footer from "@/components/layout/Footer";

type CartLayoutProps = {
  children: ReactNode;
};

export default function CartLayout({ children }: CartLayoutProps) {
  return <main><Navbar></Navbar>
    <MobileTopNavbar></MobileTopNavbar>
    {children} <Footer></Footer> <MobileBottomNavbar></MobileBottomNavbar></main>;
}