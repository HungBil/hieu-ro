import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { registerSchema } from "../../lib/validators";
import { register, resendSignupConfirmation } from "../../services/authService";

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    const parsed = registerSchema.safeParse({ email, password, displayName: displayName || undefined });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message || "Vui lòng kiểm tra thông tin.");
      return;
    }

    setSubmitting(true);
    try {
      await register(parsed.data);
      setPassword("");
      setConfirmationEmail(parsed.data.email);
      setNotice("Nếu đây là email mới hoặc chưa xác nhận, vui lòng mở email xác nhận trước khi đăng nhập. Nếu email đã có tài khoản, hãy đăng nhập hoặc đặt lại mật khẩu.");
    } catch {
      setError("Không tạo được tài khoản. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError(null);
    setNotice(null);
    setResending(true);
    try {
      await resendSignupConfirmation(confirmationEmail || email);
      setNotice("Nếu tài khoản còn chờ xác nhận, email xác nhận đã được gửi lại. Nếu email đã xác nhận, hãy đăng nhập hoặc đặt lại mật khẩu.");
    } catch {
      setError("Không gửi lại được email xác nhận. Vui lòng thử lại sau.");
    } finally {
      setResending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-app-border bg-white p-6 shadow-subtle">
      <h2 className="text-2xl font-bold text-app-text">Tạo tài khoản Hiểu Rõ</h2>
      <p className="mt-2 text-sm leading-6 text-app-secondary">Tạo tài khoản rồi xác nhận email trước khi đăng nhập.</p>
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
        {notice ? (
          <div className="rounded-[14px] border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
            <p>{notice}</p>
            {confirmationEmail ? (
              <Button type="button" variant="secondary" onClick={handleResend} disabled={resending} className="mt-3">
                {resending ? "Đang gửi..." : "Gửi lại email xác nhận"}
              </Button>
            ) : null}
          </div>
        ) : null}
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
