import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <main className="min-h-screen bg-app-bg px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col justify-center">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[18px] bg-primary text-xl font-bold text-white">HR</div>
          <h1 className="mt-4 text-2xl font-bold text-app-text">Hiểu Rõ</h1>
          <p className="mt-2 text-sm text-app-secondary">Viết rõ hơn, dễ hiểu hơn.</p>
        </div>
        <Outlet />
      </div>
    </main>
  );
}
