import { useState } from "react";
import type { UserSettings } from "../../types/app";
import { Button } from "../common/Button";

export function PrivacySettings({ settings, onSave, saving }: { settings: UserSettings; onSave: (input: Partial<UserSettings>) => Promise<void>; saving?: boolean }) {
  const [saveHistory, setSaveHistory] = useState(settings.save_history);
  const [allowLearningSuggestions, setAllowLearningSuggestions] = useState(settings.allow_learning_suggestions);
  const [allowNotifications, setAllowNotifications] = useState(settings.allow_notifications);
  const [dailyLearningTarget, setDailyLearningTarget] = useState(settings.daily_learning_target);

  return (
    <section className="rounded-card border border-app-border bg-white p-6 shadow-subtle">
      <h2 className="text-lg font-semibold text-app-text">Quyền riêng tư và học tập</h2>
      <div className="mt-5 space-y-4">
        <label className="flex items-start gap-3 text-sm leading-6 text-app-secondary">
          <input type="checkbox" className="mt-1" checked={saveHistory} onChange={(event) => setSaveHistory(event.target.checked)} />
          Lưu lịch sử viết lại để tôi có thể mở lại kết quả gần đây.
        </label>
        <label className="flex items-start gap-3 text-sm leading-6 text-app-secondary">
          <input type="checkbox" className="mt-1" checked={allowLearningSuggestions} onChange={(event) => setAllowLearningSuggestions(event.target.checked)} />
          Cho phép Hiểu Rõ gợi ý bài học nhỏ từ câu tôi đã viết lại.
        </label>
        <label className="flex items-start gap-3 text-sm leading-6 text-app-secondary">
          <input type="checkbox" className="mt-1" checked={allowNotifications} onChange={(event) => setAllowNotifications(event.target.checked)} />
          Nhắc tôi ôn bài học khi có nội dung cần ôn.
        </label>
        <label className="block text-sm text-app-secondary">
          Mục tiêu học mỗi ngày
          <input
            type="number"
            min={1}
            max={20}
            value={dailyLearningTarget}
            onChange={(event) => setDailyLearningTarget(Number(event.target.value))}
            className="mt-2 h-11 w-full rounded-[14px] border border-app-border px-4"
          />
        </label>
        <Button type="button" onClick={() => onSave({ save_history: saveHistory, allow_learning_suggestions: allowLearningSuggestions, allow_notifications: allowNotifications, daily_learning_target: dailyLearningTarget })} disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu cài đặt"}
        </Button>
      </div>
    </section>
  );
}
