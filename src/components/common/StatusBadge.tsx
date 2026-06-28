import { cn } from "../../lib/utils";

const variants = {
  neutral: "border-app-border bg-white text-app-secondary",
  blue: "border-blue-100 bg-primary-soft text-primary",
  warning: "border-amber-100 bg-amber-50 text-amber-700",
  success: "border-green-100 bg-green-50 text-green-700",
  error: "border-red-100 bg-red-50 text-red-700",
};

export function StatusBadge({ children, variant = "neutral" }: { children: React.ReactNode; variant?: keyof typeof variants }) {
  return <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-medium", variants[variant])}>{children}</span>;
}
