import { contextOptions, toneOptions } from "../../lib/constants";
import type { ContextType, ToneType } from "../../types/app";
import { Button } from "../common/Button";
import { PrivacyNote } from "../common/PrivacyNote";

export function RewriteComposer({
  inputText,
  contextType,
  tone,
  submitting,
  error,
  onInputChange,
  onContextChange,
  onToneChange,
  onSubmit,
}: {
  inputText: string;
  contextType: ContextType;
  tone: ToneType;
  submitting: boolean;
  error?: string | null;
  onInputChange: (value: string) => void;
  onContextChange: (value: ContextType) => void;
  onToneChange: (value: ToneType) => void;
  onSubmit: () => void;
}) {
  return (
    <section className="rounded-composer border border-app-border bg-white p-5 shadow-subtle md:p-6">
      <label className="sr-only" htmlFor="rewrite-input">
        Câu cần dịch sang tiếng Việt phổ thông
      </label>
      <textarea
        id="rewrite-input"
        value={inputText}
        onChange={(event) => onInputChange(event.target.value)}
        placeholder="Ví dụ: Ở pháp người cap trộm tiền trung anh điếc may tiền bảo vệ"
        className="min-h-[180px] w-full resize-y rounded-[18px] border border-transparent bg-slate-50 p-5 text-base leading-7 text-app-text placeholder:text-app-muted focus:border-primary focus:bg-white focus:outline-none"
        maxLength={3000}
      />
      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex items-center gap-2 text-sm text-app-secondary">
            <span>Ngữ cảnh</span>
            <select
              value={contextType}
              onChange={(event) => onContextChange(event.target.value as ContextType)}
              className="h-10 rounded-[12px] border border-app-border bg-white px-3 text-sm text-app-text"
            >
              {contextOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-app-secondary">
            <span>Cách diễn đạt</span>
            <select
              value={tone}
              onChange={(event) => onToneChange(event.target.value as ToneType)}
              className="h-10 rounded-[12px] border border-app-border bg-white px-3 text-sm text-app-text"
            >
              {toneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Button onClick={onSubmit} disabled={submitting} className="w-full md:w-auto">
          {submitting ? "Đang dịch..." : "Dịch câu"}
        </Button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <div className="mt-5">
        <PrivacyNote>Dữ liệu của bạn chỉ được lưu khi bạn chọn lưu.</PrivacyNote>
      </div>
    </section>
  );
}
