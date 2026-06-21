/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from "react";
import Image from "next/image";
import { getProducts, getCategories } from "@/actions/admin.actions";
import ProductManager from "./ProductManager";

export const dynamic = "force-dynamic";

async function ProductsTable({ categories }: { categories: any[] }) {
  const res = await getProducts();
  const products = res.success ? res.products : [];

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-[1.5rem] border border-slate-100 p-12 text-center text-slate-500 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <span className="text-5xl opacity-50">📱</span>
          <p className="font-bold text-lg text-slate-700">
            لا توجد منتجات حالياً.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto hide-scrollbar">
        <table className="w-full text-right min-w-[800px] whitespace-nowrap">
          <thead className="bg-slate-50/80 border-b border-slate-100">
            <tr>
              <th className="p-4 md:p-5 font-bold text-slate-700">الصورة</th>
              <th className="p-4 md:p-5 font-bold text-slate-700">
                اسم المنتج
              </th>
              <th className="p-4 md:p-5 font-bold text-slate-700">القسم</th>
              <th className="p-4 md:p-5 font-bold text-slate-700">السعر</th>
              <th className="p-4 md:p-5 font-bold text-slate-700 text-center">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((prod: any) => (
              <tr
                key={prod._id}
                className="hover:bg-slate-50/50 transition-colors group bg-white"
              >
                <td className="p-4 md:p-5">
                  <div className="relative w-12 h-12 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center shadow-sm">
                    {prod.images?.[0] ? (
                      <Image
                        src={prod.images[0]}
                        alt={prod.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold">
                        لا صورة
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 md:p-5 font-bold text-slate-900">
                  {prod.title}
                </td>
                <td className="p-4 md:p-5 text-slate-500 text-sm font-medium">
                  <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600">
                    {prod.category?.name || "بدون قسم"}
                  </span>
                </td>
                <td className="p-4 md:p-5 text-sm">
                  <div className="font-bold text-slate-900">
                    {prod.retailPrice}{" "}
                    <span className="text-[10px] text-slate-400 font-medium">
                      قطاعي
                    </span>
                  </div>
                  <div className="font-bold text-slate-600">
                    {prod.wholesalePrice}{" "}
                    <span className="text-[10px] text-slate-400 font-medium">
                      جملة
                    </span>
                  </div>
                </td>
                <td className="p-4 md:p-5 text-center">
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

export default async function ProductsPage() {
  const catRes = await getCategories();
  const categories = catRes.success ? catRes.categories : [];

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          إدارة المنتجات
        </h1>
        <ProductManager categories={categories} />
      </div>

      <Suspense
        fallback={
          <div className="bg-white rounded-[1.5rem] p-12 text-center text-slate-400 border border-slate-100 shadow-sm font-bold">
            جاري تحميل المنتجات...
          </div>
        }
      >
        <ProductsTable categories={categories} />
      </Suspense>
    </div>
  );
}
