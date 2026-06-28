import type { ConsentScope } from "../../types/app";
import { Button } from "../common/Button";
import { PrivacyNote } from "../common/PrivacyNote";
import { ConsentSelector } from "./ConsentSelector";

export type SampleFormState = {
  original_text: string;
  context_note: string;
  intended_meaning: string;
  standard_vietnamese_text: string;
  consent_scope: ConsentScope;
};

export function SampleForm({
  value,
  submitting,
  error,
  piiWarning,
  onChange,
  onSubmit,
}: {
  value: SampleFormState;
  submitting?: boolean;
  error?: string | null;
  piiWarning?: string | null;
  onChange: (next: SampleFormState) => void;
  onSubmit: () => void;
}) {
  const update = <K extends keyof SampleFormState>(key: K, nextValue: SampleFormState[K]) => onChange({ ...value, [key]: nextValue });

  return (
    <section className="rounded-card border border-app-border bg-white p-6 shadow-subtle md:p-8">
      <div className="space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-app-text">Câu gốc</span>
          <textarea
            value={value.original_text}
            onChange={(event) => update("original_text", event.target.value)}
            placeholder="Nhập câu gốc bạn đã dùng..."
            className="mt-2 min-h-[120px] w-full rounded-[18px] border border-app-border p-4 text-base leading-7 focus:border-primary focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-app-text">Bối cảnh</span>
          <textarea
            value={value.context_note}
            onChange={(event) => update("context_note", event.target.value)}
            placeholder="Khi nào, ở đâu, với ai bạn đã dùng câu này?"
            className="mt-2 min-h-[96px] w-full rounded-[18px] border border-app-border p-4 text-base leading-7 focus:border-primary focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-app-text">Người viết muốn nói gì?</span>
          <textarea
            value={value.intended_meaning}
            onChange={(event) => update("intended_meaning", event.target.value)}
            placeholder="Bạn muốn diễn đạt ý gì bằng câu này?"
            className="mt-2 min-h-[96px] w-full rounded-[18px] border border-app-border p-4 text-base leading-7 focus:border-primary focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-app-text">Bản tiếng Việt phổ thông</span>
          <textarea
            value={value.standard_vietnamese_text}
            onChange={(event) => update("standard_vietnamese_text", event.target.value)}
            placeholder="Diễn đạt lại câu trên theo cách tiếng Việt phổ thông dễ hiểu."
            className="mt-2 min-h-[120px] w-full rounded-[18px] border border-app-border p-4 text-base leading-7 focus:border-primary focus:outline-none"
          />
        </label>
        <ConsentSelector value={value.consent_scope} onChange={(next) => update("consent_scope", next)} />
        <PrivacyNote>Hiểu Rõ tôn trọng quyền riêng tư của bạn. Không chia sẻ thông tin cá nhân nếu chưa có sự đồng ý.</PrivacyNote>
        {piiWarning ? <p className="rounded-[16px] border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-700">{piiWarning}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="button" onClick={onSubmit} disabled={submitting}>
          {submitting ? "Đang gửi..." : "Gửi mẫu chờ duyệt"}
        </Button>
      </div>
    </section>
  );
}
