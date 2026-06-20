/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import Image from "next/image";
import { getShopData } from "@/actions/shop.actions";
import SearchBar from "@/components/shop/SearchBar";
import Pagination from "@/components/shop/Pagination";
import ShopLogoutButton from "@/components/shop/ShopLogoutButton";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; category?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const search = params.search || "";
  const categoryId = params.category || "";

  const res = await getShopData(page, search, categoryId);
  const categories = res.categories || [];
  const products = res.products || [];
  const totalPages = res.totalPages || 1;
  const session = await getServerSession(authOptions);

  return (
    // 🎨 Clean Cyberpunk Background
    <div
      className="min-h-screen bg-[#050505] text-slate-200 pb-12 selection:bg-cyan-500/30"
      dir="rtl"
    >
      {/* 1. الهيدر (Sticky & Blurred) */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 bg-[#050505] rounded-xl border border-slate-700 flex items-center justify-center overflow-hidden group-hover:border-cyan-500/50 transition-colors p-1 shadow-sm">
              <Image
                src="/logo.jpeg"
                alt="MK Store Logo"
                fill
                sizes="44px"
                className="object-contain rounded-lg"
                priority
              />
            </div>
            <span className="font-bold text-lg text-slate-100 tracking-wide">
              MK Store
            </span>
          </Link>

          {/* أزرار تسجيل الدخول والمستخدم */}
          <div className="flex items-center">
            {session ? (
              <details className="relative group cursor-pointer list-none">
                <summary className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#050505] border border-slate-800 outline-none hover:border-cyan-500/50 transition-colors">
                  <span className="text-sm font-medium text-slate-300">
                    مرحباً،{" "}
                    <span className="text-cyan-400 font-bold">
                      {session.user.name}
                    </span>
                  </span>
                </summary>

                <div className="absolute left-0 mt-2 w-56 bg-[#0a0a0a] border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden z-50">
                  {session.user.role === "ADMIN" && (
                    <Link
                      href="/admin/categories"
                      className="px-4 py-3 text-sm font-bold text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border-b border-slate-800 transition-colors flex items-center gap-2"
                    >
                      <span className="text-lg">⚡</span> لوحة تحكم الإدارة
                    </Link>
                  )}

                  {session.user.role !== "ADMIN" && (
                    <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        حالة الحساب:
                      </span>
                      {session.user.role === "PENDING_MERCHANT" ? (
                        <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded">
                          قيد المراجعة
                        </span>
                      ) : (
                        <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded">
                          تاجر معتمد
                        </span>
                      )}
                    </div>
                  )}

                  <div className="p-2">
                    <ShopLogoutButton />
                  </div>
                </div>
              </details>
            ) : (
              <Link
                href="/register"
                className="relative inline-flex h-10 items-center justify-center rounded-lg bg-cyan-600/10 px-6 text-sm font-bold text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all overflow-hidden"
              >
                تسجيل كتاجر
              </Link>
            )}
          </div>
        </div>
      </header>
      {session?.user?.role === "PENDING_MERCHANT" && (
        <div className="max-w-7xl mx-auto px-4 mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-center gap-3 shadow-[0_0_15px_rgba(249,115,22,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]"></div>
            <span className="text-2xl animate-pulse">⏳</span>
            <p className="text-sm md:text-base font-bold text-orange-400">
              مرحباً يا {session?.user?.name?.split(" ")[0] || "تاجر"}! حسابك
              كتاجر قيد المراجعة حالياً. ستظهر لك أسعار الجملة فور اعتماد
              الإدارة لطلبك.
            </p>
          </div>
        </div>
      )}

      <section className="max-w-4xl mx-auto px-4 mt-12 text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-500">
          أحدث التقنيات بين يديك
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
          تصفح أقوى الهواتف والإكسسوارات بأسعار الجملة والقطاعي مع أسرع خدمة
          عملاء
        </p>
        <div className="pt-4">
          <SearchBar defaultSearch={search} />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 mt-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            الأقسام
          </h2>
        </div>

        <div className="flex overflow-x-auto pb-6 gap-4 md:gap-6 hide-scrollbar snap-x">
          {/* كارت "الكل" */}
          <Link
            href="/"
            className="flex-shrink-0 flex flex-col items-center gap-3 group snap-start w-28 md:w-32"
          >
            <div
              className={`relative w-28 h-28 md:w-32 md:h-32 rounded-2xl flex items-center justify-center border transition-all duration-300 ${!categoryId ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]" : "bg-[#0a0a0a] border-slate-800 group-hover:border-slate-600 group-hover:bg-slate-900/50"}`}
            >
              <svg
                className={`w-12 h-12 transition-colors ${!categoryId ? "text-cyan-400" : "text-slate-500 group-hover:text-cyan-500"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </div>
            <span
              className={`text-sm font-bold transition-colors ${!categoryId ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"}`}
            >
              الكل
            </span>
          </Link>

          {categories.map((cat: any) => (
            <Link
              key={cat._id}
              href={`/?category=${cat._id}`}
              className="flex-shrink-0 flex flex-col items-center gap-3 group snap-start w-28 md:w-32"
            >
              <div
                className={`relative w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden flex items-center justify-center border transition-all duration-300 ${categoryId === cat._id ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]" : "bg-[#0a0a0a] border-slate-800 group-hover:border-slate-600 group-hover:bg-slate-900/50"}`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent z-10 opacity-60 pointer-events-none"></div>

                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 112px, 128px"
                    className="object-cover group-hover:scale-110 transition-transform duration-500 z-0"
                  />
                ) : (
                  <div className="text-[10px] text-slate-600 font-medium uppercase tracking-widest z-0 flex flex-col items-center gap-1">
                    <span className="text-xl">📁</span>
                  </div>
                )}
              </div>

              <span
                className={`text-sm font-bold text-center line-clamp-1 transition-colors ${categoryId === cat._id ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"}`}
              >
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 mt-8">
        {products.length === 0 ? (
          <div className="text-center text-slate-500 py-16 bg-[#0a0a0a] rounded-2xl border border-slate-800">
            لا توجد منتجات مطابقة لبحثك.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {products.map((prod: any) => (
              <Link
                href={`/product/${prod._id}`}
                key={prod._id}
                className="block group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>

                <div className="relative bg-[#0a0a0a] border border-slate-800 rounded-2xl overflow-hidden h-full flex flex-col group-hover:border-slate-700 transition-colors">
                  <div className="relative aspect-square bg-[#050505] overflow-hidden flex items-center justify-center">
                    {prod.images?.[0] ? (
                      <Image
                        src={prod.images[0]}
                        alt={prod.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-slate-700 text-xs font-medium">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex flex-col flex-1 border-t border-slate-800/80 bg-gradient-to-b from-[#0a0a0a] to-[#050505]">
                    <div className="text-[10px] text-cyan-500 font-bold mb-1 tracking-wider uppercase truncate">
                      {prod.category}
                    </div>
                    <h3 className="font-semibold text-slate-200 line-clamp-2 text-xs md:text-sm leading-relaxed min-h-[2.5rem]">
                      {prod.title}
                    </h3>
                    <div className="mt-auto pt-3 flex items-end justify-between">
                      <div className="flex flex-col">
                        <span className="font-black text-lg md:text-xl text-cyan-400">
                          {prod.price}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                          EGP
                        </span>
                      </div>

                      {prod.isWholesale && (
                        <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-1 rounded shadow-[0_0_8px_rgba(168,85,247,0.15)] font-bold">
                          جملة
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {totalPages > 1 && (
        <div className="mt-12">
          <Pagination currentPage={page} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
