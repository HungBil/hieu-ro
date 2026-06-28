import { EmptyState } from "../components/common/EmptyState";
import { LoadingState } from "../components/common/LoadingState";
import type { UserRole } from "../types/app";
import { useAuth } from "./useAuth";

export function RoleGuard({ allowed, children }: { allowed: UserRole[]; children: React.ReactNode }) {
  const { role, loading } = useAuth();

  if (loading) return <LoadingState />;
  if (!role || !allowed.includes(role)) {
    return (
      <EmptyState
        title="Bạn không có quyền truy cập trang này."
        description="Trang này chỉ dành cho tài khoản có vai trò phù hợp."
      />
    );
  }

  return <>{children}</>;
}
