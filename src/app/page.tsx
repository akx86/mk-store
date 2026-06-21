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
    // 🎨 Modern & Solid Theme (No blending, no clipping, no scroll reset)
    <div
      className="min-h-screen bg-[#f8fafc] text-slate-800 pb-12 selection:bg-indigo-200 selection:text-indigo-900 relative z-0"
      dir="rtl"
    >
      {/* Mesh Gradient خفيف في الخلفية */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-transparent -z-10 blur-3xl pointer-events-none"></div>

      {/* 1. الهيدر */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            {/* 🌟 اللوجو الدائري المحسن: زووم داخلي لتركيز الفوكس على الشعار وقص الخلفية */}
            <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full shadow-sm border border-slate-200 overflow-hidden group-hover:scale-105 transition-transform bg-[#0d1117] flex items-center justify-center">
              <Image
                src="/logo.jpeg"
                alt="MK Store Logo"
                fill
                sizes="(max-width: 768px) 48px, 56px"
                // 👈 scale-125 بتعمل زووم بنسبة 25% جوه الدايرة عشان تخفي الحواف وتكبر الشعار الفعلي
                className="object-cover scale-125 transition-transform duration-300"
                priority
              />
            </div>
            <span className="font-black text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 tracking-tight">
              MK Store
            </span>
          </Link>

          {/* أزرار تسجيل الدخول */}
          <div className="flex items-center">
            {session ? (
              <details className="relative group cursor-pointer list-none">
                <summary className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm outline-none hover:border-indigo-300 transition-all">
                  <span className="text-sm font-bold text-slate-700">
                    مرحباً،{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                      {session.user.name}
                    </span>
                  </span>
                </summary>

                <div className="absolute left-0 mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl flex flex-col overflow-hidden z-50 p-2">
                  {session.user.role === "ADMIN" && (
                    <Link
                      href="/admin/categories"
                      className="px-4 py-3 text-sm font-bold text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-2 mb-1"
                    >
                      <span className="text-lg">⚡</span> لوحة الإدارة
                    </Link>
                  )}

                  {session.user.role !== "ADMIN" && (
                    <div className="px-3 py-3 flex items-center justify-between bg-slate-50 rounded-xl mb-1">
                      <span className="text-xs text-slate-500 font-bold">
                        الحالة:
                      </span>
                      {session.user.role === "PENDING_MERCHANT" ? (
                        <span className="text-[10px] bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full font-black shadow-sm">
                          مراجعة
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-black shadow-sm">
                          معتمد
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-1">
                    <ShopLogoutButton />
                  </div>
                </div>
              </details>
            ) : (
              <Link
                href="/register"
                className="relative inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 text-sm font-black text-white hover:from-blue-500 hover:to-indigo-500 transition-all shadow-[0_8px_20px_-6px_rgba(79,70,229,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(79,70,229,0.6)] hover:-translate-y-0.5"
              >
                تسجيل كتاجر
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* رسالة التاجر المعلقة */}
      {session?.user?.role === "PENDING_MERCHANT" && (
        <div className="max-w-4xl mx-auto px-4 mt-8">
          <div className="bg-white border border-orange-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
              <span className="text-white text-lg animate-pulse">⏳</span>
            </div>
            <p className="text-sm md:text-base font-bold text-slate-700">
              مرحباً يا{" "}
              <span className="text-orange-600">
                {session?.user?.name?.split(" ")[0] || "تاجر"}
              </span>
              ! حسابك قيد المراجعة. ستظهر لك أسعار الجملة قريباً.
            </p>
          </div>
        </div>
      )}

      {/* 2. قسم العنوان الرئيسي */}
      <section className="max-w-4xl mx-auto px-4 mt-16 text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight !leading-tight">
          أحدث التقنيات <br className="md:hidden" /> بين يديك
        </h1>
        <p className="text-slate-500 text-base md:text-lg max-w-xl mx-auto font-medium">
          اكتشف تشكيلة واسعة من الهواتف الذكية والإكسسوارات بأسعار الجملة
          والقطاعي.
        </p>
        <div className="pt-4">
          <SearchBar defaultSearch={search} />
        </div>
      </section>

      {/* 3. شريط الأقسام */}
      <section className="max-w-7xl mx-auto px-4 mt-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            الأقسام
          </h2>
        </div>

        {/* 🛠️ حل مشكلة القص: إضافة pt-4 (padding-top) للكونتينر */}
        <div className="flex overflow-x-auto pt-4 pb-8 gap-5 hide-scrollbar snap-x px-2">
          {/* 🛠️ حل مشكلة الاسكرول: إضافة scroll={false} للينك */}
          <Link
            href="/"
            scroll={false}
            className="flex-shrink-0 flex flex-col items-center gap-4 group snap-start w-28 md:w-32"
          >
            <div
              className={`relative w-28 h-28 md:w-32 md:h-32 rounded-[2rem] flex items-center justify-center transition-all duration-300 ${!categoryId ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_10px_25px_-5px_rgba(79,70,229,0.4)] text-white transform -translate-y-2" : "bg-white border border-slate-200 shadow-sm text-slate-400 hover:shadow-md hover:border-indigo-200 hover:-translate-y-1"}`}
            >
              <svg
                className="w-10 h-10"
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
              className={`text-sm font-black transition-colors ${!categoryId ? "text-indigo-600" : "text-slate-500 group-hover:text-indigo-500"}`}
            >
              الكل
            </span>
          </Link>

          {categories.map((cat: any) => (
            // 🛠️ حل مشكلة الاسكرول: إضافة scroll={false} للينك
            <Link
              key={cat._id}
              href={`/?category=${cat._id}`}
              scroll={false}
              className="flex-shrink-0 flex flex-col items-center gap-4 group snap-start w-28 md:w-32 relative"
            >
              {/* 🌟 إضافة بادج القسم المميز */}
              {cat.isFeatured && (
                <div className="absolute -top-3 z-30 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1 border-2 border-white transform rotate-[-3deg]">
                  <span>⭐</span> مميز
                </div>
              )}

              <div
                className={`relative w-28 h-28 md:w-32 md:h-32 rounded-[2rem] overflow-hidden flex items-center justify-center transition-all duration-300 ${categoryId === cat._id ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_10px_25px_-5px_rgba(79,70,229,0.4)] transform -translate-y-2 ring-4 ring-indigo-100" : "bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 hover:-translate-y-1"}`}
              >
                <div
                  className={`absolute inset-0 z-10 transition-opacity ${categoryId === cat._id ? "bg-indigo-900/20" : "bg-gradient-to-t from-slate-900/10 to-transparent opacity-0 group-hover:opacity-100"}`}
                ></div>
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 112px, 128px"
                    className="object-cover group-hover:scale-110 transition-transform duration-500 z-0"
                  />
                ) : (
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest z-0 flex flex-col items-center gap-1">
                    <span className="text-2xl">📁</span>
                  </div>
                )}
              </div>
              <span
                className={`text-sm font-black text-center line-clamp-1 transition-colors ${categoryId === cat._id ? "text-indigo-600" : "text-slate-500 group-hover:text-indigo-500"}`}
              >
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. شبكة المنتجات (Solid White Cards) */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        {products.length === 0 ? (
          <div className="text-center text-slate-500 py-20 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
            <span className="block text-5xl mb-4 opacity-50">🔍</span>
            <p className="font-bold text-lg">لا توجد منتجات مطابقة لبحثك.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {products.map((prod: any) => (
              <Link
                href={`/product/${prod._id}`}
                key={prod._id}
                className="block group"
              >
                {/* 🛠️ حل الكروت السايحة: خلفية بيضاء صريحة، بوردر واضح، وشادو ثابت */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-[1.5rem] overflow-hidden h-full flex flex-col hover:border-indigo-300 hover:shadow-[0_15px_35px_-10px_rgba(79,70,229,0.2)] transition-all duration-300 transform group-hover:-translate-y-1">
                  <div className="relative aspect-square overflow-hidden flex items-center justify-center bg-slate-50 border-b border-slate-100">
                    {/* 🌟 إضافة بادج المنتج المميز */}
                    {prod.isFeatured && (
                      <div className="absolute top-2 right-2 z-20 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <span>🔥</span> مميز
                      </div>
                    )}

                    {prod.images?.[0] ? (
                      <Image
                        src={prod.images[0]}
                        alt={prod.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        // التعديل الجذري: object-cover بدل contain، وشيلنا الـ mix-blend عشان الألوان تفضل طبيعية
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-slate-400 text-xs font-semibold">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* بيانات المنتج */}
                  <div className="p-4 flex flex-col flex-1 bg-white">
                    <div className="text-[10px] text-indigo-500 font-black mb-1.5 tracking-widest uppercase truncate">
                      {prod.category}
                    </div>
                    <h3 className="font-bold text-slate-800 line-clamp-2 text-xs md:text-sm leading-relaxed min-h-[2.5rem] group-hover:text-indigo-600 transition-colors">
                      {prod.title}
                    </h3>

                    <div className="mt-auto pt-4 flex items-end justify-between border-t border-slate-100">
                      <div className="flex flex-col">
                        <span className="font-black text-xl md:text-2xl text-slate-900 tracking-tight">
                          {prod.price}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-0.5">
                          EGP
                        </span>
                      </div>

                      {prod.isWholesale && (
                        <span className="text-[10px] bg-slate-900 text-white px-3 py-1.5 rounded-full font-black tracking-widest shadow-sm">
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

      {/* 5. التصفح */}
      {totalPages > 1 && (
        <div className="mt-16">
          <Pagination currentPage={page} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
