import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // فحص أمني إضافي (Defense in Depth) بجانب الـ Middleware
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    // 🎨 Clean Cyberpunk Main Container
    <div
      className="flex min-h-screen bg-[#050505] text-slate-200 flex-col md:flex-row selection:bg-cyan-500/30"
      dir="rtl"
    >
      {/* 📱 Sidebar (Top on mobile, Side on desktop) */}
      <aside className="w-full md:w-64 bg-[#0a0a0a] border-b md:border-b-0 md:border-l border-slate-800 flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        {/* Header Section */}
        <div className="p-6 border-b border-slate-800/80 bg-gradient-to-b from-slate-900/50 to-transparent">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-wide">
            لوحة التحكم
          </h2>
          <div className="mt-3 flex items-center gap-2">
            {/* Live Indicator (Pulse) */}
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></span>
            <p className="text-sm text-slate-400">
              مرحباً،{" "}
              <span className="font-bold text-slate-200">
                {session.user.name}
              </span>
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto hide-scrollbar">
          <Link
            href="/admin/categories"
            className="p-3 text-sm font-bold text-slate-400 rounded-xl hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30 transition-all group flex items-center gap-3"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">
              📂
            </span>
            إدارة الأقسام
          </Link>
          <Link
            href="/admin/products"
            className="p-3 text-sm font-bold text-slate-400 rounded-xl hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30 transition-all group flex items-center gap-3"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">
              📱
            </span>
            إدارة المنتجات
          </Link>
          <Link
            href="/admin/merchants"
            className="p-3 text-sm font-bold text-slate-400 rounded-xl hover:text-purple-400 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30 transition-all group flex items-center gap-3"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">
              🤝
            </span>
            طلبات التجار
          </Link>
        </nav>

        {/* Footer Section */}
        <div className="p-6 border-t border-slate-800/80 bg-gradient-to-t from-slate-900/50 to-transparent flex flex-col gap-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full p-2 text-sm font-bold text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <span className="text-lg">&rarr;</span> العودة للكتالوج
          </Link>

          {/* تأكد من تحديث زر LogoutButton ليتماشى مع الثيم الداكن */}
          <LogoutButton />
        </div>
      </aside>

      {/* 🖥️ Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
        {/* Glow خلفي خفيف في منطقة المحتوى لكسر الملل */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-cyan-500/5 blur-[120px] pointer-events-none z-0"></div>

        {/* الحاوية اللي هيترندر فيها باقي الصفحات */}
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}
