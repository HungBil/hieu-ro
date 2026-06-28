import { Navigate, useLocation } from "react-router-dom";
import { LoadingState } from "../components/common/LoadingState";
import { useAuth } from "./useAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingState label="Đang kiểm tra đăng nhập..." />;
  if (!user) return <Navigate to="/auth/login" state={{ from: location }} replace />;
  return <>{children}</>;
}
