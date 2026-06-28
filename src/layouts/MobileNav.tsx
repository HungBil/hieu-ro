import { NavLink } from "react-router-dom";
import { BookOpen, MessageSquare, PenLine, Settings, UsersRound } from "lucide-react";
import { cn } from "../lib/utils";

const items = [
  { to: "/app/write", label: "Viết", icon: PenLine },
  { to: "/app/lessons", label: "Học", icon: BookOpen },
  { to: "/app/samples", label: "Mẫu", icon: MessageSquare },
  { to: "/app/community", label: "Cộng đồng", icon: UsersRound },
  { to: "/app/settings", label: "Tài khoản", icon: Settings },
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-app-border bg-white px-2 py-2 lg:hidden">
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
