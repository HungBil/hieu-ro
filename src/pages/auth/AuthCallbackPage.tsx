import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingState } from "../../components/common/LoadingState";
import { supabase } from "../../lib/supabase";

export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function finish() {
      const params = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const isRecovery = params.get("type") === "recovery" || hash.get("type") === "recovery";
      await supabase.auth.getSession();
      if (!cancelled) navigate(isRecovery ? "/auth/update-password" : "/app/write", { replace: true });
    }
    finish();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return <LoadingState label="Đang hoàn tất đăng nhập..." />;
}
