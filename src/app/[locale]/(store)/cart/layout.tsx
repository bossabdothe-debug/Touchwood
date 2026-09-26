import type { ReactNode } from "react";
import MobileSearchNavbar from "@/components/layout/MobileSearchNavbar";
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
   <MobileSearchNavbar></MobileSearchNavbar>
    {children} <Footer></Footer> <MobileBottomNavbar></MobileBottomNavbar></main>;
}