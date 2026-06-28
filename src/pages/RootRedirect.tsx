import { Navigate } from "react-router-dom";
import { LoadingState } from "../components/common/LoadingState";
import { useAuth } from "../auth/useAuth";

export function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingState />;
  return <Navigate to={user ? "/app/write" : "/auth/login"} replace />;
}
