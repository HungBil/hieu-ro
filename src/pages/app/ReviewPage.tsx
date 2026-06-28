import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "../../components/common/Button";
import { StatusBadge } from "../../components/common/StatusBadge";
import { listReviewQueue, updateSampleReview } from "../../services/reviewService";
import type { WritingSample } from "../../types/app";

function ReviewCard({
  sample,
  onReview,
  reviewing,
}: {
  sample: WritingSample;
  onReview: (input: { status: "approved" | "rejected" | "needs_changes"; sample: WritingSample; note?: string; is_anonymized: boolean; contains_sensitive_info: boolean }) => void;
  reviewing?: boolean;
}) {
  const [note, setNote] = useState("");
  const [anonymized, setAnonymized] = useState(sample.is_anonymized);
  const [sensitive, setSensitive] = useState(sample.contains_sensitive_info);

  return (
    <article className="rounded-card border border-app-border bg-white p-5 shadow-subtle">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge variant="warning">{sample.status}</StatusBadge>
        <StatusBadge>{sample.consent_scope}</StatusBadge>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-app-secondary">Câu gốc</p>
          <p className="mt-2 whitespace-pre-wrap text-base leading-7 text-app-text">{sample.original_text}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-primary">Bản phổ thông</p>
          <p className="mt-2 whitespace-pre-wrap text-base leading-7 text-app-text">{sample.standard_vietnamese_text}</p>
        </div>
      </div>
      {sample.context_note ? <p className="mt-4 text-sm leading-6 text-app-secondary"><strong>Bối cảnh:</strong> {sample.context_note}</p> : null}
      {sample.intended_meaning ? <p className="mt-2 text-sm leading-6 text-app-secondary"><strong>Ý định:</strong> {sample.intended_meaning}</p> : null}
      <div className="mt-5 space-y-3 border-t border-app-border pt-4">
        <label className="flex items-center gap-2 text-sm text-app-secondary">
          <input type="checkbox" checked={anonymized} onChange={(event) => setAnonymized(event.target.checked)} />
          Đã ẩn danh
        </label>
        <label className="flex items-center gap-2 text-sm text-app-secondary">
          <input type="checkbox" checked={sensitive} onChange={(event) => setSensitive(event.target.checked)} />
          Còn thông tin riêng tư hoặc nhạy cảm
        </label>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ghi chú duyệt..." className="min-h-[88px] w-full rounded-[16px] border border-app-border p-3 text-sm" />
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => onReview({ status: "approved", sample, note, is_anonymized: anonymized, contains_sensitive_info: sensitive })} disabled={reviewing || !anonymized || sensitive}>
            Duyệt
          </Button>
          <Button type="button" variant="secondary" onClick={() => onReview({ status: "needs_changes", sample, note, is_anonymized: anonymized, contains_sensitive_info: sensitive })} disabled={reviewing}>
            Cần sửa
          </Button>
          <Button type="button" variant="danger" onClick={() => onReview({ status: "rejected", sample, note, is_anonymized: anonymized, contains_sensitive_info: sensitive })} disabled={reviewing}>
            Từ chối
          </Button>
        </div>
      </div>
    </article>
  );
}

export function ReviewPage() {
  const queryClient = useQueryClient();
  const queueQuery = useQuery({ queryKey: ["review-queue"], queryFn: listReviewQueue });
  const mutation = useMutation({
    mutationFn: (input: { sample: WritingSample; status: "approved" | "rejected" | "needs_changes"; note?: string; is_anonymized: boolean; contains_sensitive_info: boolean }) =>
      updateSampleReview({
        sampleId: input.sample.id,
        status: input.status,
        review_note: input.note,
        is_anonymized: input.is_anonymized,
        contains_sensitive_info: input.contains_sensitive_info,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["review-queue"] });
    },
  });

  return (
    <div>
      <PageHeader title="Duyệt mẫu câu" description="Chỉ đưa mẫu vào kho tri thức khi đã được duyệt, ẩn danh và không còn thông tin riêng tư." />
      {queueQuery.isLoading ? <LoadingState /> : null}
      {queueQuery.isError ? <ErrorState description="Không tải được hàng chờ duyệt." /> : null}
      {queueQuery.data && queueQuery.data.length === 0 ? <EmptyState title="Không có mẫu câu chờ duyệt." /> : null}
      {queueQuery.data && queueQuery.data.length > 0 ? (
        <div className="space-y-4">
          {queueQuery.data.map((sample) => (
            <ReviewCard
              key={sample.id}
              sample={sample}
              reviewing={mutation.isPending}
              onReview={(input) => mutation.mutate(input)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
