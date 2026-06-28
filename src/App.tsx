import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { RoleGuard } from "./auth/RoleGuard";
import { AppLayout } from "./layouts/AppLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { AuthCallbackPage } from "./pages/auth/AuthCallbackPage";
import { UpdatePasswordPage } from "./pages/auth/UpdatePasswordPage";
import { WritePage } from "./pages/app/WritePage";
import { WriteResultPage } from "./pages/app/WriteResultPage";
import { LessonsPage } from "./pages/app/LessonsPage";
import { SamplesPage } from "./pages/app/SamplesPage";
import { NewSamplePage } from "./pages/app/NewSamplePage";
import { CommunityPage } from "./pages/app/CommunityPage";
import { CommunityPostPage } from "./pages/app/CommunityPostPage";
import { SettingsPage } from "./pages/app/SettingsPage";
import { ReviewPage } from "./pages/app/ReviewPage";
import { AdminPage } from "./pages/app/AdminPage";
import { EmptyState } from "./components/common/EmptyState";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="callback" element={<AuthCallbackPage />} />
        <Route path="update-password" element={<UpdatePasswordPage />} />
      </Route>
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/write" replace />} />
        <Route path="write" element={<WritePage />} />
        <Route path="write/:sessionId" element={<WriteResultPage />} />
        <Route path="lessons" element={<LessonsPage />} />
        <Route path="samples" element={<SamplesPage />} />
        <Route path="samples/new" element={<NewSamplePage />} />
        <Route path="community" element={<CommunityPage />} />
        <Route path="community/:postId" element={<CommunityPostPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="review" element={<RoleGuard allowed={["reviewer", "admin"]}><ReviewPage /></RoleGuard>} />
        <Route path="admin" element={<RoleGuard allowed={["admin"]}><AdminPage /></RoleGuard>} />
      </Route>
      <Route path="*" element={<main className="min-h-screen bg-app-bg p-6"><EmptyState title="Không tìm thấy trang." actionLabel="Về trang viết lại" actionTo="/app/write" /></main>} />
    </Routes>
  );
}
