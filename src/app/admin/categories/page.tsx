/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCategories } from "@/actions/admin.actions";
import CategoryManager from "./CategoryManager";
import Image from "next/image"; // ضفناه عشان نعرض الصور في الجدول

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const res = await getCategories();
  const categories = res.success ? res.categories : [];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
          إدارة الأقسام
        </h1>
      </div>

      {/* 🎨 Cyberpunk Table Container */}
      <div className="bg-[#0a0a0a] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-right whitespace-nowrap">
            <thead className="bg-slate-900/80 border-b border-slate-800">
              <tr>
                {/* ضفنا عمود الصورة للتجربة البصرية */}
                <th className="p-4 font-bold text-cyan-400">الصورة</th>
                <th className="p-4 font-bold text-cyan-400">اسم القسم</th>
                <th className="p-4 font-bold text-cyan-400">الرابط (Slug)</th>
                <th className="p-4 font-bold text-cyan-400 text-center">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {categories?.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-12 text-center text-slate-500 font-medium"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">📂</span>
                      لا توجد أقسام حالياً. ابدأ بإضافة قسم جديد.
                    </div>
                  </td>
                </tr>
              ) : (
                categories?.map((cat: any) => (
                  <tr
                    key={cat._id}
                    className="hover:bg-slate-900/50 transition-colors group"
                  >
                    {/* عرض الصورة المصغرة */}
                    <td className="p-4">
                      <div className="relative w-12 h-12 bg-[#050505] rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
                        {cat.image ? (
                          <Image
                            src={cat.image}
                            alt={cat.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-xs text-slate-600">No Img</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-200">
                      {cat.name}
                    </td>
                    <td className="p-4 text-slate-500 text-sm dir-ltr text-left md:text-right">
                      {cat.slug}
                    </td>
                    <td className="p-4 text-center">
                      <CategoryManager category={cat} isRowAction />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6">
        <CategoryManager />
      </div>
    </div>
  );
}
