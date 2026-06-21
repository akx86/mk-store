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
    // 🎨 Premium Minimalist Admin Container
    <div
      className="flex min-h-screen bg-[#f5f5f7] text-slate-900 flex-col md:flex-row selection:bg-slate-200"
      dir="rtl"
    >
      {/* 📱 Sidebar (أبيض صريح، بيفصل القوائم عن المحتوى) */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-l border-slate-200 flex flex-col z-20 shadow-sm">
        {/* Header Section */}
        <div className="p-6 border-b border-slate-100 bg-white">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            لوحة التحكم
          </h2>
          <div className="mt-3 flex items-center gap-2">
            {/* Live Indicator (Pulse) */}
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse"></span>
            <p className="text-sm text-slate-500 font-medium">
              مرحباً،{" "}
              <span className="font-bold text-slate-900">
                {session.user.name}
              </span>
            </p>
          </div>
        </div>

        {/* Navigation Links (نظيفة، تباين عالي عند الوقوف عليها) */}
        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto hide-scrollbar">
          <Link
            href="/admin/categories"
            className="p-3 text-sm font-bold text-slate-600 rounded-xl hover:text-slate-900 hover:bg-slate-50 transition-all group flex items-center gap-3"
          >
            <span className="text-xl group-hover:scale-110 transition-transform opacity-80">
              📂
            </span>
            إدارة الأقسام
          </Link>
          <Link
            href="/admin/products"
            className="p-3 text-sm font-bold text-slate-600 rounded-xl hover:text-slate-900 hover:bg-slate-50 transition-all group flex items-center gap-3"
          >
            <span className="text-xl group-hover:scale-110 transition-transform opacity-80">
              📱
            </span>
            إدارة المنتجات
          </Link>
          <Link
            href="/admin/merchants"
            className="p-3 text-sm font-bold text-slate-600 rounded-xl hover:text-slate-900 hover:bg-slate-50 transition-all group flex items-center gap-3"
          >
            <span className="text-xl group-hover:scale-110 transition-transform opacity-80">
              🤝
            </span>
            طلبات التجار
          </Link>
        </nav>

        {/* Footer Section */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full p-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <span className="text-lg">&rarr;</span> العودة للكتالوج
          </Link>

          {/* زر تسجيل الخروج محتاج يتعدل للثيم الفاتح لو كان متصمم للدارك */}
          <LogoutButton />
        </div>
      </aside>

      {/* 🖥️ Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
        {/* الحاوية اللي هيترندر فيها باقي الصفحات */}
        <div className="relative z-10 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
