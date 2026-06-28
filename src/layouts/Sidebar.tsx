import { Link, NavLink, useNavigate } from "react-router-dom";
import { BookOpen, Edit3, Home, LogOut, MessageSquare, Moon, PenLine, Settings, UsersRound } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../auth/useAuth";

const navItems = [
  { to: "/app/write", label: "Viết lại", icon: PenLine },
  { to: "/app/lessons", label: "Bài học", icon: BookOpen },
  { to: "/app/samples", label: "Mẫu câu", icon: MessageSquare },
  { to: "/app/community", label: "Cộng đồng", icon: UsersRound },
];

export function Sidebar() {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate("/auth/login", { replace: true });
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r border-app-border bg-white px-4 py-5 lg:flex lg:flex-col">
      <Link to="/app/write" className="flex items-center gap-3 rounded-[16px] px-2 py-2 text-app-text">
        <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-primary text-white">
          <Home className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="text-lg font-semibold">Hiểu Rõ</span>
      </Link>

      <Link to="/app/write" className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-primary px-4 text-sm font-semibold text-white transition hover:bg-blue-700">
        <Edit3 className="h-4 w-4" aria-hidden="true" />
        Viết mới
      </Link>

      <nav className="mt-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex h-11 items-center gap-3 rounded-[14px] px-3 text-sm font-medium transition",
                isActive ? "bg-primary-soft text-primary" : "text-app-secondary hover:bg-slate-50 hover:text-app-text",
              )
            }
          >
            <item.icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-1 border-t border-app-border pt-4">
        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            cn(
              "flex h-11 items-center gap-3 rounded-[14px] px-3 text-sm font-medium transition",
              isActive ? "bg-primary-soft text-primary" : "text-app-secondary hover:bg-slate-50 hover:text-app-text",
            )
          }
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
          {profile?.display_name || "Tài khoản"}
        </NavLink>
        <div className="flex h-11 items-center gap-3 rounded-[14px] px-3 text-sm font-medium text-app-secondary">
          <Moon className="h-4 w-4" aria-hidden="true" />
          Giao diện sáng
        </div>
        <button type="button" onClick={handleLogout} className="flex h-11 w-full items-center gap-3 rounded-[14px] px-3 text-sm font-medium text-app-secondary transition hover:bg-slate-50 hover:text-app-text">
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
