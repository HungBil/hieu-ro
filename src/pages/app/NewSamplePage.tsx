import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { PageHeader } from "../../components/common/PageHeader";
import { ErrorState } from "../../components/common/ErrorState";
import { SampleForm, type SampleFormState } from "../../components/samples/SampleForm";
import { detectSensitiveInfoClient } from "../../lib/utils";
import { sampleSchema } from "../../lib/validators";
import { createWritingSample } from "../../services/sampleService";

const initialState: SampleFormState = {
  original_text: "",
  context_note: "",
  intended_meaning: "",
  standard_vietnamese_text: "",
  consent_scope: "internal_only",
};

export function NewSamplePage() {
  const [form, setForm] = useState<SampleFormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const detection = useMemo(() => detectSensitiveInfoClient(`${form.original_text}\n${form.context_note}\n${form.intended_meaning}\n${form.standard_vietnamese_text}`), [form]);

  const mutation = useMutation({
    mutationFn: createWritingSample,
    onSuccess: () => {
      setSubmitted(true);
      setForm(initialState);
    },
    onError: () => setError("Không gửi được mẫu lúc này. Vui lòng thử lại."),
  });

  function submit() {
    setError(null);
    const parsed = sampleSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message || "Vui lòng kiểm tra nội dung.");
      return;
    }
    mutation.mutate({ ...parsed.data, contains_sensitive_info: detection.hasSensitiveInfo });
  }

  return (
    <div>
      <PageHeader title="Đóng góp mẫu câu" description="Chia sẻ cách bạn diễn đạt trong đời sống thực. Cùng nhau xây dựng kho dữ liệu ngôn ngữ tự nhiên." />
      {submitted ? (
        <div className="mb-6 rounded-card border border-green-100 bg-green-50 p-5 text-sm leading-6 text-green-700">
          Mẫu câu đã được gửi chờ duyệt. <Link className="font-medium underline" to="/app/samples">Quay lại mẫu câu đã lưu</Link>
        </div>
      ) : null}
      <SampleForm
        value={form}
        submitting={mutation.isPending}
        error={error}
        piiWarning={detection.hasSensitiveInfo ? `Có thể có thông tin riêng tư: ${detection.categories.join(", ")}. Vui lòng ẩn thông tin trước khi gửi nếu cần.` : null}
        onChange={setForm}
        onSubmit={submit}
      />
      {mutation.isError ? <div className="mt-5"><ErrorState description="Không lưu được mẫu câu." /></div> : null}
    </div>
  );
}
