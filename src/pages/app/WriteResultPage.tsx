import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3 } from "lucide-react";
import { AmbiguityChips } from "../../components/write/AmbiguityChips";
import { LearningPointCards } from "../../components/write/LearningPointCards";
import { RewriteReasons } from "../../components/write/RewriteReasons";
import { RewriteResultCard } from "../../components/write/RewriteResultCard";
import { Button } from "../../components/common/Button";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { getCoachSession, savePhraseFromSession } from "../../services/coachService";
import { generateLessonFromSession } from "../../services/lessonService";

export function WriteResultPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);

  const sessionQuery = useQuery({
    queryKey: ["coach-session", sessionId],
    queryFn: () => getCoachSession(sessionId || ""),
    enabled: Boolean(sessionId),
  });

  const saveMutation = useMutation({
    mutationFn: () => savePhraseFromSession(sessionId || ""),
    onSuccess: async () => {
      setMessage("Đã lưu mẫu câu.");
      await queryClient.invalidateQueries({ queryKey: ["coach-session", sessionId] });
      await queryClient.invalidateQueries({ queryKey: ["saved-phrases"] });
    },
    onError: () => setMessage("Không thể lưu mẫu câu lúc này."),
  });

  const lessonMutation = useMutation({
    mutationFn: () => generateLessonFromSession(sessionId || ""),
    onSuccess: async () => {
      setMessage("Đã tạo bài học nhỏ.");
      await queryClient.invalidateQueries({ queryKey: ["due-learning-items"] });
    },
    onError: () => setMessage("Không thể tạo bài học lúc này."),
  });

  if (sessionQuery.isLoading) return <LoadingState />;
  if (sessionQuery.isError || !sessionQuery.data) return <ErrorState description="Không mở được kết quả này." />;

  const session = sessionQuery.data;
  const result = session.result_json;
  if (!result) return <ErrorState title="Chưa có kết quả." description="Phiên viết lại này chưa có dữ liệu kết quả." />;

  async function copyResult() {
    await navigator.clipboard.writeText(result?.rewritten_text || "");
    setMessage("Đã sao chép.");
  }

  return (
    <div>
      <PageHeader title="Kết quả viết lại" description="Bạn có thể sao chép, lưu mẫu câu hoặc tạo bài học nhỏ từ kết quả này." />
      {message ? <p className="mb-5 rounded-[16px] border border-blue-100 bg-primary-soft p-4 text-sm text-primary">{message}</p> : null}

      <div className="space-y-6">
        <section className="rounded-card border border-app-border bg-white p-5 shadow-subtle">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-app-secondary">Câu bạn viết</p>
            <Link to="/app/write" className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm text-primary hover:bg-primary-soft">
              <Edit3 className="h-4 w-4" aria-hidden="true" />
              Chỉnh lại
            </Link>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-app-text">{session.input_text}</p>
        </section>

        <RewriteResultCard
          result={result}
          onCopy={copyResult}
          onSave={() => saveMutation.mutate()}
          onCreateLesson={() => lessonMutation.mutate()}
          saving={saveMutation.isPending}
          creatingLesson={lessonMutation.isPending}
        />

        {result.should_ask_user ? (
          <section className="rounded-card border border-amber-100 bg-amber-50 p-5">
            <StatusBadge variant="warning">Cần thêm bối cảnh</StatusBadge>
            <p className="mt-3 text-sm leading-6 text-amber-800">Câu này còn chỗ chưa chắc. Bạn có thể trả lời thêm để Hiểu Rõ viết sát ý hơn.</p>
          </section>
        ) : null}

        <section className="rounded-card border border-app-border bg-white p-6 shadow-subtle">
          <h2 className="text-lg font-semibold text-app-text">Chỗ chưa chắc</h2>
          <div className="mt-4">
            <AmbiguityChips ambiguities={result.ambiguities || []} />
          </div>
        </section>

        <section className="rounded-card border border-app-border bg-white p-6 shadow-subtle">
          <h2 className="text-lg font-semibold text-app-text">Vì sao sửa như vậy</h2>
          <div className="mt-4">
            <RewriteReasons reasons={result.rewrite_reasons || []} />
          </div>
        </section>

        <section className="rounded-card border border-app-border bg-white p-6 shadow-subtle">
          <h2 className="text-lg font-semibold text-app-text">Bài học nhỏ</h2>
          <div className="mt-4">
            <LearningPointCards points={result.learning_points || []} onCreateLesson={() => lessonMutation.mutate()} />
          </div>
        </section>

        <div>
          <Button type="button" variant="secondary" onClick={() => lessonMutation.mutate()} disabled={lessonMutation.isPending}>
            Tạo bài học từ câu này
          </Button>
        </div>
      </div>
    </div>
  );
}
