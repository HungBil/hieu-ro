import { Link, Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <main className="app-shell-bg min-h-screen px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col justify-center">
        <Link to="/" className="mb-8 block text-center" aria-label="Về homepage Hiểu Rõ">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-white p-2 shadow-subtle">
            <img src="/images/logo-mark.png" alt="" width={512} height={512} decoding="sync" className="h-full w-full object-contain" />
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-normal text-app-text">Hiểu Rõ</h1>
          <p className="mt-2 text-sm text-app-secondary">Viết rõ hơn, dễ hiểu hơn.</p>
        </Link>
        <Outlet />
      </div>
    </main>
  );
}
