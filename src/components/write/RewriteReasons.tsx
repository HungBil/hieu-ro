export function RewriteReasons({ reasons }: { reasons: string[] }) {
  if (!reasons.length) return <p className="text-sm text-app-secondary">Chưa có giải thích ngắn cho câu này.</p>;

  return (
    <ul className="space-y-3 text-base leading-7 text-app-secondary">
      {reasons.slice(0, 3).map((reason, index) => (
        <li key={`${reason}-${index}`} className="flex gap-3">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <span>{reason}</span>
        </li>
      ))}
    </ul>
  );
}
