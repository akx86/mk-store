/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCategories } from "@/actions/admin.actions";
import CategoryManager from "./CategoryManager";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const res = await getCategories();
  const categories = res.success ? res.categories : [];

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          إدارة الأقسام
        </h1>
      </div>

      {/* 🎨 Premium Minimalist Table Container */}
      <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-right whitespace-nowrap">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="p-4 md:p-5 font-bold text-slate-700">الصورة</th>
                <th className="p-4 md:p-5 font-bold text-slate-700">
                  اسم القسم
                </th>
                <th className="p-4 md:p-5 font-bold text-slate-700">
                  الرابط (Slug)
                </th>
                <th className="p-4 md:p-5 font-bold text-slate-700 text-center">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories?.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-12 text-center text-slate-500 font-medium"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-4xl opacity-50">📂</span>
                      لا توجد أقسام حالياً. ابدأ بإضافة قسم جديد.
                    </div>
                  </td>
                </tr>
              ) : (
                categories?.map((cat: any) => (
                  <tr
                    key={cat._id}
                    className="hover:bg-slate-50/50 transition-colors group bg-white"
                  >
                    {/* عرض الصورة المصغرة */}
                    <td className="p-4 md:p-5">
                      <div className="relative w-12 h-12 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center shadow-sm">
                        {cat.image ? (
                          <Image
                            src={cat.image}
                            alt={cat.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <span className="text-xs text-slate-400 font-bold">
                            لا صورة
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 md:p-5 font-bold text-slate-900">
                      {cat.name}
                    </td>
                    <td className="p-4 md:p-5 text-slate-500 text-sm dir-ltr text-left md:text-right font-medium">
                      {cat.slug}
                    </td>
                    <td className="p-4 md:p-5 text-center">
                      <CategoryManager category={cat} isRowAction />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8">
        <CategoryManager />
      </div>
    </div>
  );
}
