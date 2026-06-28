import { Link } from "react-router-dom";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
}) {
  return (
    <div className="rounded-card border border-dashed border-app-border bg-white px-6 py-10 text-center shadow-subtle">
      <p className="text-base font-semibold text-app-text">{title}</p>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-app-secondary">{description}</p> : null}
      {actionLabel && actionTo ? (
        <Link
          to={actionTo}
          className="mt-5 inline-flex h-11 items-center rounded-[14px] bg-primary px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
