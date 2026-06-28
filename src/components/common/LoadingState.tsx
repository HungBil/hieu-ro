export function LoadingState({ label = "Đang tải..." }: { label?: string }) {
  return (
    <div className="flex min-h-[240px] items-center justify-center text-sm text-app-secondary" role="status" aria-live="polite">
      <div className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-app-border border-t-primary" />
      {label}
    </div>
  );
}
