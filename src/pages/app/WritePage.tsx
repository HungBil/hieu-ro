import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { rewriteSchema } from "../../lib/validators";
import { formatRelativeTimeVi } from "../../lib/utils";
import { analyzeWriting, listRecentCoachSessions } from "../../services/coachService";
import type { ContextType, ToneType } from "../../types/app";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { PageHeader } from "../../components/common/PageHeader";
import { RewriteComposer } from "../../components/write/RewriteComposer";

export function WritePage() {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [contextType, setContextType] = useState<ContextType>("general");
  const [tone, setTone] = useState<ToneType>("polite");
  const [formError, setFormError] = useState<string | null>(null);

  const recentQuery = useQuery({ queryKey: ["recent-coach-sessions"], queryFn: listRecentCoachSessions });

  const analyzeMutation = useMutation({
    mutationFn: analyzeWriting,
    onSuccess: (data) => {
      navigate(`/app/write/${data.session_id}`);
    },
    onError: () => {
      setFormError("Hiểu Rõ chưa xử lý được câu này. Bạn có thể thử lại hoặc thêm bối cảnh.");
    },
  });

  function submit() {
    setFormError(null);
    const parsed = rewriteSchema.safeParse({ input_text: inputText, context_type: contextType, tone });
    if (!parsed.success) {
      setFormError(parsed.error.errors[0]?.message || "Vui lòng kiểm tra nội dung.");
      return;
    }
    analyzeMutation.mutate(parsed.data as { input_text: string; context_type: ContextType; tone: ToneType });
  }

  return (
    <div>
      <PageHeader title="Viết rõ hơn, dễ hiểu hơn" description="Hiểu Rõ giúp bạn diễn đạt ý rõ ràng, đúng ngữ cảnh và dễ hiểu hơn." />
      <RewriteComposer
        inputText={inputText}
        contextType={contextType}
        tone={tone}
        submitting={analyzeMutation.isPending}
        error={formError}
        onInputChange={setInputText}
        onContextChange={setContextType}
        onToneChange={setTone}
        onSubmit={submit}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => { setContextType("personal_message"); setTone("polite"); }} className="h-9 rounded-full border border-app-border bg-white px-4 text-sm text-app-secondary transition hover:bg-primary-soft hover:text-primary">
          Tin nhắn lịch sự
        </button>
        <button type="button" onClick={() => setTone("formal")} className="h-9 rounded-full border border-app-border bg-white px-4 text-sm text-app-secondary transition hover:bg-primary-soft hover:text-primary">
          Giải thích rõ hơn
        </button>
        <button type="button" onClick={() => setContextType("school")} className="h-9 rounded-full border border-app-border bg-white px-4 text-sm text-app-secondary transition hover:bg-primary-soft hover:text-primary">
          Tạo bài học từ câu này
        </button>
      </div>

      <section className="mt-10">
        <h2 className="text-base font-semibold text-app-text">Gần đây</h2>
        <div className="mt-4">
          {recentQuery.isLoading ? <LoadingState label="Đang tải nội dung gần đây..." /> : null}
          {recentQuery.isError ? <ErrorState description="Không tải được nội dung gần đây." /> : null}
          {recentQuery.data && recentQuery.data.length === 0 ? <EmptyState title="Chưa có nội dung gần đây." description="Hãy thử viết lại câu đầu tiên của bạn." /> : null}
          {recentQuery.data && recentQuery.data.length > 0 ? (
            <div className="space-y-3">
              {recentQuery.data.map((session) => (
                <Link key={session.id} to={`/app/write/${session.id}`} className="block rounded-[18px] border border-app-border bg-white p-4 shadow-subtle transition hover:border-primary">
                  <p className="line-clamp-2 text-sm leading-6 text-app-text">{session.rewritten_text || session.input_text}</p>
                  <p className="mt-2 text-xs text-app-muted">{formatRelativeTimeVi(session.created_at)}</p>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
