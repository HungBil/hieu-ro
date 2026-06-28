import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { updatePasswordSchema } from "../../lib/validators";
import { logout, updatePassword } from "../../services/authService";

export function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const parsed = updatePasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message || "Vui lòng kiểm tra mật khẩu.");
      return;
    }

    setSubmitting(true);
    try {
      await updatePassword(parsed.data.password);
      await logout();
      setPassword("");
      setConfirmPassword("");
      setMessage("Đã đặt lại mật khẩu. Vui lòng đăng nhập lại.");
    } catch {
      setError("Không đặt lại được mật khẩu. Vui lòng mở lại link trong email.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-app-border bg-white p-6 shadow-subtle">
      <h2 className="text-2xl font-bold text-app-text">Đặt lại mật khẩu</h2>
      <p className="mt-2 text-sm leading-6 text-app-secondary">Nhập mật khẩu mới cho tài khoản của bạn.</p>
      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-app-text">Mật khẩu mới</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-[14px] border border-app-border px-4" autoComplete="new-password" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-app-text">Nhập lại mật khẩu</span>
          <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-2 h-11 w-full rounded-[14px] border border-app-border px-4" autoComplete="new-password" />
        </label>
        {message ? <p className="rounded-[14px] border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={submitting || Boolean(message)} className="w-full">
          {submitting ? "Đang lưu..." : "Lưu mật khẩu mới"}
        </Button>
      </div>
      <Link className="mt-5 block text-sm font-medium text-primary" to="/auth/login">Quay lại đăng nhập</Link>
    </form>
  );
}
