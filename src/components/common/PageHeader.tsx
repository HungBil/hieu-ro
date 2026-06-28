export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="motion-reveal mb-8">
      <h1 className="text-[32px] font-black leading-10 tracking-normal text-app-text">{title}</h1>
      {description ? <p className="mt-3 max-w-2xl text-base leading-7 text-app-secondary">{description}</p> : null}
    </header>
  );
}
