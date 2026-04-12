/**
 * Main App Layout
 * Wraps all pages with header, footer, toast container
 */

import { Outlet } from "@tanstack/react-router";
import { ToastContainer } from "./ToastContainer";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useEffect } from "react";
import { useUIStore } from "../store";

export function AppLayout() {
  const { theme } = useUIStore();

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col bg-terrain-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <Footer />

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}
