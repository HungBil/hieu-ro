export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="mb-8">
      <h1 className="text-[32px] font-bold leading-10 tracking-[-0.02em] text-app-text">{title}</h1>
      {description ? <p className="mt-3 max-w-2xl text-base leading-7 text-app-secondary">{description}</p> : null}
    </header>
  );
}
