import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CheckCircle2, MessageSquare, PenLine, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../auth/useAuth";

const steps = [
  {
    icon: PenLine,
    title: "Hiểu trật tự ký hiệu",
    text: "Đọc câu theo ý, thời gian, quan hệ sở hữu và bối cảnh trước khi sửa chữ.",
  },
  {
    icon: BookOpen,
    title: "Chuyển sang tiếng Việt phổ thông",
    text: "Gợi ý câu rõ hơn mà vẫn giữ ý của người viết, không phán xét.",
  },
  {
    icon: ShieldCheck,
    title: "Học lại bằng câu thật",
    text: "Rút ra điểm cần nhớ từ chính câu đã viết: trật tự từ, từ gần đúng, ngữ cảnh.",
  },
];

export function HomePage() {
  const { user } = useAuth();
  const primaryTo = user ? "/app/write" : "/auth/register";
  const primaryLabel = user ? "Vào trang viết" : "Bắt đầu viết thử";

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-app-text">
      <section className="relative isolate min-h-[88svh] overflow-hidden bg-[#071513] text-white md:min-h-[92svh]">
        <img
          src="/images/home-hero-writing.png"
          alt=""
          className="hero-image-drift absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,12,11,0.96)_0%,rgba(5,18,17,0.86)_34%,rgba(5,18,17,0.38)_66%,rgba(5,18,17,0.16)_100%)]" />
        <div className="hero-ink-motion absolute inset-0" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <Link to="/" className="flex items-center gap-3 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1.5 shadow-[0_10px_30px_rgba(255,255,255,0.16)]">
              <img src="/images/logo-mark.png" alt="" width={512} height={512} decoding="sync" className="h-full w-full object-contain" />
            </span>
            <span className="text-lg font-semibold">Hiểu Rõ</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/auth/login" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white sm:inline-flex">
              Đăng nhập
            </Link>
            <Link to={primaryTo} className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-[#071513] transition hover:-translate-y-0.5 hover:bg-[#f4d38a]">
              {primaryLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto flex max-w-7xl items-center px-5 pb-20 pt-16 md:px-8 md:pb-24 md:pt-24">
          <div className="max-w-3xl">
            <p className="motion-reveal inline-flex items-center gap-2 rounded-full border border-white/[0.15] bg-white/10 px-4 py-2 text-sm font-semibold text-[#d3fff6] backdrop-blur">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Cầu nối tiếng Việt viết cho cộng đồng người điếc
            </p>
            <h1 className="display-type motion-reveal motion-delay-1 mt-7 max-w-3xl text-5xl font-black leading-[0.92] tracking-normal text-white sm:text-7xl lg:text-[104px]">
              Viết rõ, không làm mất cách nghĩ.
            </h1>
              <p className="motion-reveal motion-delay-2 mt-6 max-w-xl text-lg leading-8 text-white/[0.78] md:text-xl">
              Hiểu Rõ chuyển câu chịu ảnh hưởng ngôn ngữ ký hiệu hoặc thiếu trật tự từ sang tiếng Việt phổ thông, nhẹ nhàng và không phán xét.
            </p>
            <div className="motion-reveal motion-delay-3 mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to={primaryTo} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#f4d38a] px-6 text-sm font-black text-[#071513] transition hover:-translate-y-0.5 hover:bg-white">
                {user ? "Vào trang viết" : "Thử chuyển câu"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/auth/login" className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/[0.16]">
                Tôi đã có tài khoản
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="app-shell-bg px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="motion-reveal">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Vấn đề không phải là “sai tiếng Việt”</p>
            <h2 className="display-type mt-4 max-w-xl text-4xl font-black leading-tight tracking-normal text-app-text md:text-6xl">
              Nhiều câu đi theo logic ký hiệu, không theo trật tự văn viết.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-app-secondary">
              Ứng dụng tìm ý chính, từ gần đúng và quan hệ giữa các phần câu trước khi gợi ý bản tiếng Việt phổ thông.
            </p>
            <div className="mt-8 border-l-2 border-primary pl-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-app-muted">Câu gốc</p>
              <p className="mt-2 text-lg font-black leading-7 text-app-text">Ở pháp người cap trộm tiền trung anh điếc may tiền bảo vệ</p>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-primary">Có thể là</p>
              <p className="mt-2 text-lg leading-8 text-app-secondary">Ở Pháp, có người cắp trộm tiền của một anh điếc, nhưng may là có bảo vệ.</p>
            </div>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="motion-reveal hover-lift flex gap-4 rounded-lg border border-white/70 bg-white/[0.78] p-5 shadow-subtle backdrop-blur"
                style={{ animationDelay: `${120 + index * 80}ms` }}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                  <step.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-app-text">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-app-secondary">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#071513] px-5 py-16 text-white md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="overflow-hidden rounded-lg">
            <img src="/images/home-lesson-flow.png" alt="" className="h-full w-full object-cover transition duration-700 hover:scale-[1.03]" />
          </div>
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-[#f4d38a]">
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
              Riêng tư, tôn trọng, có người duyệt
            </p>
            <h2 className="display-type mt-4 text-4xl font-black leading-tight tracking-normal md:text-6xl">
              Không biến người viết thành lỗi cần sửa.
            </h2>
            <div className="mt-6 space-y-4 text-base leading-7 text-white/[0.76]">
              <p>Hiểu Rõ tách rõ phần viết cá nhân, bài học cá nhân và mẫu câu được đồng ý đóng góp để cộng đồng học từ ví dụ an toàn hơn.</p>
              <p className="flex gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#8ee9dc]" aria-hidden="true" />
                Mục tiêu là làm rõ ý trong tiếng Việt viết, không chấm điểm hay gắn nhãn khả năng ngôn ngữ của người điếc.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="app-shell-bg px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 border-t border-app-border pt-10 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Bắt đầu từ một câu thật</p>
            <h2 className="display-type mt-3 text-3xl font-black tracking-normal text-app-text md:text-5xl">Dán câu khó hiểu. Nhận bản rõ hơn và điểm cần học.</h2>
          </div>
          <Link to={primaryTo} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#0f5f59]">
            {primaryLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
