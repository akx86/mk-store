/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from "react";
import Image from "next/image";
import { getProducts, getCategories } from "@/actions/admin.actions";
import ProductManager from "./ProductManager";

export const dynamic = "force-dynamic";

// 1. كومبوننت منفصل لجلب وعرض الجدول (يسمح بالـ Streaming)
async function ProductsTable({ categories }: { categories: any[] }) {
  const res = await getProducts();
  const products = res.success ? res.products : [];

  if (products.length === 0) {
    return (
      <div className="bg-[#0a0a0a] rounded-2xl border border-slate-800 p-12 text-center text-slate-500 shadow-2xl">
        <div className="flex flex-col items-center gap-3">
          <span className="text-5xl">📱</span>
          <p className="font-medium text-lg">لا توجد منتجات حالياً.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden">
      <div className="overflow-x-auto hide-scrollbar">
        <table className="w-full text-right min-w-[800px] whitespace-nowrap">
          <thead className="bg-slate-900/80 border-b border-slate-800">
            <tr>
              <th className="p-4 font-bold text-cyan-400">الصورة</th>
              <th className="p-4 font-bold text-cyan-400">اسم المنتج</th>
              <th className="p-4 font-bold text-cyan-400">القسم</th>
              <th className="p-4 font-bold text-cyan-400">
                السعر (قطاعي / جملة)
              </th>
              <th className="p-4 font-bold text-cyan-400 text-center">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {products.map((prod: any) => (
              <tr
                key={prod._id}
                className="hover:bg-slate-900/50 transition-colors group"
              >
                <td className="p-4">
                  {prod.images?.[0] ? (
                    <div className="relative w-12 h-12 bg-[#050505] rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
                      <Image
                        src={prod.images[0]}
                        alt={prod.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-[#050505] rounded-lg border border-dashed border-slate-700 flex items-center justify-center text-[10px] text-slate-500">
                      لا صورة
                    </div>
                  )}
                </td>
                <td className="p-4 font-bold text-slate-200">{prod.title}</td>
                <td className="p-4 text-slate-400 text-sm">
                  <span className="bg-slate-800 px-2 py-1 rounded text-xs">
                    {prod.category?.name || "بدون قسم"}
                  </span>
                </td>
                <td className="p-4 text-sm flex flex-col gap-1">
                  <div className="text-slate-200 font-bold">
                    {prod.retailPrice}{" "}
                    <span className="text-[10px] text-slate-500">قطاعي</span>
                  </div>
                  <div className="text-purple-400 font-bold">
                    {prod.wholesalePrice}{" "}
                    <span className="text-[10px] text-purple-500/50">جملة</span>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <ProductManager
                    product={prod}
                    categories={categories}
                    isRowAction
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 2. الصفحة الرئيسية (الـ Layout العام)
export default async function ProductsPage() {
  const catRes = await getCategories();
  const categories = catRes.success ? catRes.categories : [];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
          إدارة المنتجات
        </h1>
        <ProductManager categories={categories} />
      </div>

      <Suspense
        fallback={
          <div className="bg-[#0a0a0a] rounded-2xl shadow-2xl p-12 text-center text-cyan-500 animate-pulse border border-cyan-500/20 font-bold">
            جاري تحميل المنتجات...
          </div>
        }
      >
        <ProductsTable categories={categories} />
      </Suspense>
    </div>
  );
}
