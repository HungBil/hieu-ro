export function ErrorState({ title = "Có lỗi xảy ra.", description = "Vui lòng thử lại." }: { title?: string; description?: string }) {
  return (
    <div className="rounded-card border border-red-100 bg-red-50 px-6 py-5 text-sm text-red-700" role="alert">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 leading-6">{description}</p>
    </div>
  );
}
