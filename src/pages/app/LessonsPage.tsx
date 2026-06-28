import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { PageHeader } from "../../components/common/PageHeader";
import { DueLessonList } from "../../components/lessons/DueLessonList";
import { LessonCard } from "../../components/lessons/LessonCard";
import { getLessonStats, listDueLearningItems, reviewLearningItem } from "../../services/lessonService";
import type { LearningItem, RepetitionGrade } from "../../types/app";

export function LessonsPage() {
  const queryClient = useQueryClient();
  const dueQuery = useQuery({ queryKey: ["due-learning-items"], queryFn: listDueLearningItems });
  const statsQuery = useQuery({ queryKey: ["lesson-stats"], queryFn: getLessonStats });

  const reviewMutation = useMutation({
    mutationFn: ({ item, grade }: { item: LearningItem; grade: RepetitionGrade }) => reviewLearningItem({ item, grade }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["due-learning-items"] });
      await queryClient.invalidateQueries({ queryKey: ["lesson-stats"] });
    },
  });

  if (dueQuery.isLoading) return <LoadingState />;
  if (dueQuery.isError) return <ErrorState description="Không tải được bài học." />;

  const items = dueQuery.data || [];
  const current = items[0];
  const stats = statsQuery.data || { streak: 0, dueCount: items.length };

  return (
    <div>
      <PageHeader title="Học mỗi ngày, viết rõ tự nhiên" description="Các bài học nhỏ được tạo từ câu thật của bạn để luyện cách viết tiếng Việt rõ hơn." />
      <div className="mb-6 flex flex-wrap gap-3 text-sm text-app-secondary">
        <span className="rounded-full border border-app-border bg-white px-4 py-2">Chuỗi ngày: {stats.streak}</span>
        <span className="rounded-full border border-app-border bg-white px-4 py-2">Hôm nay cần ôn: {stats.dueCount}</span>
      </div>
      {!current ? (
        <EmptyState title="Chưa có bài học nào." description="Bạn có thể tạo bài học từ một câu đã viết lại." actionLabel="Viết lại câu đầu tiên" actionTo="/app/write" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
          <LessonCard
            item={current}
            progressLabel={`1 / ${items.length}`}
            reviewing={reviewMutation.isPending}
            onReview={(grade) => reviewMutation.mutate({ item: current, grade })}
          />
          <DueLessonList items={items} />
        </div>
      )}
      {reviewMutation.isError ? <div className="mt-5"><ErrorState description="Không lưu được kết quả ôn bài." /></div> : null}
    </div>
  );
}
