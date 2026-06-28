import { Link, NavLink, useNavigate } from "react-router-dom";
import { BookOpen, Edit3, LogOut, Moon, PenLine, Settings } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../auth/useAuth";

const navItems = [
  { to: "/app/write", label: "Dịch câu", icon: PenLine },
  { to: "/app/lessons", label: "Bài học", icon: BookOpen },
];

export function Sidebar() {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate("/auth/login", { replace: true });
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r border-white/70 bg-white/[0.82] px-4 py-5 shadow-[12px_0_40px_rgba(16,32,30,0.05)] backdrop-blur-xl lg:flex lg:flex-col">
      <Link to="/" className="flex items-center gap-3 rounded-lg px-2 py-2 text-app-text" aria-label="Về homepage Hiểu Rõ">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1.5 shadow-subtle">
          <img src="/images/logo-mark.png" alt="" width={512} height={512} decoding="sync" className="h-full w-full object-contain" />
        </span>
        <span className="text-lg font-black">Hiểu Rõ</span>
      </Link>

      <Link to="/app/write" className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0f5f59]">
        <Edit3 className="h-4 w-4" aria-hidden="true" />
        Dịch câu mới
      </Link>

      <nav className="mt-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex h-11 items-center gap-3 rounded-[14px] px-3 text-sm font-medium transition",
                isActive ? "bg-primary-soft text-primary" : "text-app-secondary hover:bg-white hover:text-app-text",
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
                isActive ? "bg-primary-soft text-primary" : "text-app-secondary hover:bg-white hover:text-app-text",
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
        <button type="button" onClick={handleLogout} className="flex h-11 w-full items-center gap-3 rounded-[14px] px-3 text-sm font-medium text-app-secondary transition hover:bg-white hover:text-app-text">
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
