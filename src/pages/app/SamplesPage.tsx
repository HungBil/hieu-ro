import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "../../components/common/Button";
import { SavedPhraseList } from "../../components/samples/SavedPhraseList";
import { deleteSavedPhrase, listSavedPhrases } from "../../services/sampleService";
import { generateLessonFromSession } from "../../services/lessonService";

export function SamplesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const savedQuery = useQuery({ queryKey: ["saved-phrases"], queryFn: listSavedPhrases });

  const deleteMutation = useMutation({
    mutationFn: deleteSavedPhrase,
    onSuccess: async () => {
      setMessage("Đã xóa mẫu câu.");
      await queryClient.invalidateQueries({ queryKey: ["saved-phrases"] });
    },
  });

  const lessonMutation = useMutation({
    mutationFn: (sessionId: string) => generateLessonFromSession(sessionId),
    onSuccess: async () => {
      setMessage("Đã tạo bài học nhỏ.");
      await queryClient.invalidateQueries({ queryKey: ["due-learning-items"] });
    },
  });

  const filtered = useMemo(() => {
    const items = savedQuery.data || [];
    if (!search.trim()) return items;
    const query = search.trim().toLowerCase();
    return items.filter((item) => `${item.original_text} ${item.rewritten_text}`.toLowerCase().includes(query));
  }, [savedQuery.data, search]);

  return (
    <div>
      <PageHeader title="Mẫu câu đã lưu" description="Những câu bạn đã lưu sẽ xuất hiện ở đây để luyện lại sau." />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="block flex-1">
          <span className="sr-only">Tìm mẫu câu</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mẫu câu..." className="h-11 w-full rounded-[14px] border border-app-border bg-white px-4" />
        </label>
        <Button type="button" variant="secondary" onClick={() => window.location.assign("/app/samples/new")}>Đóng góp mẫu câu</Button>
      </div>
      {message ? <p className="mb-5 rounded-[16px] border border-blue-100 bg-primary-soft p-4 text-sm text-primary">{message}</p> : null}
      {savedQuery.isLoading ? <LoadingState /> : null}
      {savedQuery.isError ? <ErrorState description="Không tải được mẫu câu đã lưu." /> : null}
      {savedQuery.data && savedQuery.data.length === 0 ? (
        <EmptyState title="Bạn chưa lưu mẫu câu nào." description="Những câu đã lưu sẽ xuất hiện ở đây để bạn luyện lại sau." actionLabel="Viết lại câu đầu tiên" actionTo="/app/write" />
      ) : null}
      {savedQuery.data && savedQuery.data.length > 0 && filtered.length === 0 ? <EmptyState title="Không tìm thấy mẫu câu phù hợp." /> : null}
      {filtered.length > 0 ? (
        <SavedPhraseList
          items={filtered}
          onDelete={(id) => deleteMutation.mutate(id)}
          onCreateLesson={(sessionId) => sessionId && lessonMutation.mutate(sessionId)}
        />
      ) : null}
    </div>
  );
}
