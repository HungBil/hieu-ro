import { ShieldCheck } from "lucide-react";

export function PrivacyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-sm leading-6 text-app-secondary">
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
