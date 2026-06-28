import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-app-bg">
      <Sidebar />
      <main className="pb-24 lg:pl-[260px] lg:pb-0">
        <div className="mx-auto min-h-screen max-w-[960px] px-5 py-10 md:px-8 lg:py-16">
          <Outlet />
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
