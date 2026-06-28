import { NavLink } from "react-router-dom";
import { BookOpen, PenLine, Settings } from "lucide-react";
import { cn } from "../lib/utils";

const items = [
  { to: "/app/write", label: "Dịch", icon: PenLine },
  { to: "/app/lessons", label: "Học", icon: BookOpen },
  { to: "/app/settings", label: "Tài khoản", icon: Settings },
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-white/70 bg-white/[0.88] px-2 py-2 shadow-[0_-12px_36px_rgba(16,32,30,0.08)] backdrop-blur-xl lg:hidden">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => cn("flex flex-col items-center gap-1 rounded-[12px] px-2 py-2 text-xs", isActive ? "bg-primary-soft text-primary" : "text-app-secondary")}
        >
          <item.icon className="h-4 w-4" aria-hidden="true" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
