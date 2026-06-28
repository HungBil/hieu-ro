import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingState } from "../../components/common/LoadingState";
import { supabase } from "../../lib/supabase";

export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function finish() {
      await supabase.auth.getSession();
      if (!cancelled) navigate("/app/write", { replace: true });
    }
    finish();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return <LoadingState label="Đang hoàn tất đăng nhập..." />;
}
