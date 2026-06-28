export function CommunityStats({ stats }: { stats: { total: number; askMeaning: number; feedback: number; shareSample: number } }) {
  const items = [
    { label: "Thảo luận", value: stats.total },
    { label: "Câu hỏi cần góp ý", value: stats.askMeaning + stats.feedback },
    { label: "Mẫu câu đã chia sẻ", value: stats.shareSample },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-[18px] border border-app-border bg-white p-4 shadow-subtle">
          <p className="text-2xl font-semibold text-app-text">{item.value}</p>
          <p className="mt-1 text-sm text-app-secondary">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
