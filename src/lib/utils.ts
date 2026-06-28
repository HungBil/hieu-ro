import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateVi(value: string | Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatRelativeTimeVi(value: string | Date) {
  const date = new Date(value).getTime();
  const diffSeconds = Math.round((date - Date.now()) / 1000);
  const abs = Math.abs(diffSeconds);
  const rtf = new Intl.RelativeTimeFormat("vi-VN", { numeric: "auto" });

  if (abs < 60) return rtf.format(diffSeconds, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSeconds / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSeconds / 3600), "hour");
  return rtf.format(Math.round(diffSeconds / 86400), "day");
}

export function clampText(value: string, max = 160) {
  if (value.length <= max) return value;
  return `${value.slice(0, max).trim()}…`;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function detectSensitiveInfoClient(text: string) {
  const categories: string[] = [];
  if (/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(text)) categories.push("email");
  if (/(https?:\/\/|www\.)/i.test(text)) categories.push("liên kết");
  if (/(\+?84|0)(\d[\s.-]?){8,10}/.test(text)) categories.push("số điện thoại");
  if (/\b\d{9,12}\b/.test(text)) categories.push("dãy số định danh hoặc tài khoản");
  return {
    hasSensitiveInfo: categories.length > 0,
    categories,
  };
}
