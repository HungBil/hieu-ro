import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-[#0f5f59] border-primary shadow-[0_10px_24px_rgba(15,118,110,0.18)]",
  secondary: "bg-white/[0.86] text-app-text hover:bg-white border-app-border",
  ghost: "border-transparent bg-transparent text-app-secondary hover:bg-slate-100",
  danger: "bg-red-600 text-white hover:bg-red-700 border-red-600",
};

export function Button({ className, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-[14px] border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
