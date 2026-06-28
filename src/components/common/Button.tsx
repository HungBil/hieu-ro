import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-blue-700 border-primary",
  secondary: "bg-white text-app-text hover:bg-slate-50 border-app-border",
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
