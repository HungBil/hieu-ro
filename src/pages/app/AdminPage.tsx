import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { PageHeader } from "../../components/common/PageHeader";
import { getAdminCounts } from "../../services/adminService";

export function AdminPage() {
  const countsQuery = useQuery({ queryKey: ["admin-counts"], queryFn: getAdminCounts });

  return (
    <div>
      <PageHeader title="Quản trị" description="Theo dõi trạng thái thật của hệ thống. Không hiển thị dữ liệu giả." />
      {countsQuery.isLoading ? <LoadingState /> : null}
      {countsQuery.isError ? <ErrorState description="Không tải được dữ liệu quản trị." /> : null}
      {countsQuery.data ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Người dùng", countsQuery.data.users],
            ["Phiên viết lại", countsQuery.data.sessions],
            ["LLM runs", countsQuery.data.llmRuns],
            ["Mẫu chờ duyệt", countsQuery.data.pendingSamples],
          ].map(([label, value]) => (
            <div key={label} className="rounded-card border border-app-border bg-white p-5 shadow-subtle">
              <p className="text-2xl font-semibold text-app-text">{value}</p>
              <p className="mt-1 text-sm text-app-secondary">{label}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
