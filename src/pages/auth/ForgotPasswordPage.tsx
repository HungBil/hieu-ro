import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { resetPassword } from "../../services/authService";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setSubmitting(true);
    try {
      await resetPassword(email);
      setMessage("Nếu email tồn tại, Hiểu Rõ đã gửi hướng dẫn đặt lại mật khẩu.");
    } catch {
      setError("Không gửi được hướng dẫn lúc này. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-app-border bg-white p-6 shadow-subtle">
      <h2 className="text-2xl font-bold text-app-text">Quên mật khẩu</h2>
      <p className="mt-2 text-sm leading-6 text-app-secondary">Nhập email để nhận hướng dẫn đặt lại mật khẩu.</p>
      <label className="mt-6 block">
        <span className="text-sm font-medium text-app-text">Email</span>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 w-full rounded-[14px] border border-app-border px-4" />
      </label>
      {message ? <p className="mt-4 text-sm text-green-700">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={submitting} className="mt-5 w-full">
        {submitting ? "Đang gửi..." : "Gửi hướng dẫn"}
      </Button>
      <Link className="mt-5 block text-sm font-medium text-primary" to="/auth/login">Quay lại đăng nhập</Link>
    </form>
  );
}
