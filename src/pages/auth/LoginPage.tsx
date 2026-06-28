import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginSchema } from "../../lib/validators";
import { login } from "../../services/authService";
import { Button } from "../../components/common/Button";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message || "Vui lòng kiểm tra thông tin.");
      return;
    }

    setSubmitting(true);
    try {
      await login(parsed.data);
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/app/write";
      navigate(from, { replace: true });
    } catch {
      setError("Không đăng nhập được. Vui lòng kiểm tra email và mật khẩu.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-app-border bg-white p-6 shadow-subtle">
      <h2 className="text-2xl font-bold text-app-text">Đăng nhập</h2>
      <p className="mt-2 text-sm leading-6 text-app-secondary">Tiếp tục viết rõ hơn cùng Hiểu Rõ.</p>
      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-app-text">Email</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 w-full rounded-[14px] border border-app-border px-4" autoComplete="email" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-app-text">Mật khẩu</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-[14px] border border-app-border px-4" autoComplete="current-password" />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </div>
      <div className="mt-5 space-y-2 text-sm text-app-secondary">
        <p>
          Chưa có tài khoản? <Link className="font-medium text-primary" to="/auth/register">Tạo tài khoản</Link>
        </p>
        <p>
          <Link className="font-medium text-primary" to="/auth/forgot-password">Quên mật khẩu?</Link>
        </p>
      </div>
    </form>
  );
}
