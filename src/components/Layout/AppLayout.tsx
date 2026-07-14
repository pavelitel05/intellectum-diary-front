import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Layout/Sidebar";
import { Header } from "@/components/Layout/Header";
import { AppFooter } from "@/components/Layout/AppFooter";

export function AppLayout() {
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface dark:bg-surface-dark">
      <Sidebar mobileOpen={mobileNav} onCloseMobile={() => setMobileNav(false)} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header onOpenMenu={() => setMobileNav(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
