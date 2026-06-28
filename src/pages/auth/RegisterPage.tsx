import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { registerSchema } from "../../lib/validators";
import { register } from "../../services/authService";

export function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = registerSchema.safeParse({ email, password, displayName: displayName || undefined });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message || "Vui lòng kiểm tra thông tin.");
      return;
    }

    setSubmitting(true);
    try {
      await register(parsed.data);
      navigate("/app/write", { replace: true });
    } catch {
      setError("Không tạo được tài khoản. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-app-border bg-white p-6 shadow-subtle">
      <h2 className="text-2xl font-bold text-app-text">Tạo tài khoản Hiểu Rõ</h2>
      <p className="mt-2 text-sm leading-6 text-app-secondary">Viết rõ hơn, học tự nhiên hơn, và lưu lại tiến bộ của bạn.</p>
      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-app-text">Tên hiển thị</span>
          <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="mt-2 h-11 w-full rounded-[14px] border border-app-border px-4" autoComplete="name" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-app-text">Email</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 w-full rounded-[14px] border border-app-border px-4" autoComplete="email" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-app-text">Mật khẩu</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-[14px] border border-app-border px-4" autoComplete="new-password" />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Đang tạo..." : "Tạo tài khoản"}
        </Button>
      </div>
      <p className="mt-5 text-sm text-app-secondary">
        Đã có tài khoản? <Link className="font-medium text-primary" to="/auth/login">Đăng nhập</Link>
      </p>
    </form>
  );
}
