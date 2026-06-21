/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPendingMerchants } from "@/actions/admin.actions";
import ApproveButton from "./ApproveButton";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function MerchantsPage() {
  const res = await getPendingMerchants();
  const merchants = res.success ? res.merchants : [];

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          طلبات تسجيل التجار
        </h1>
      </div>

      {/* 🎨 Premium Minimalist Table Container */}
      <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-right min-w-[900px] whitespace-nowrap">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="p-4 md:p-5 font-bold text-slate-700">المحل</th>
                <th className="p-4 md:p-5 font-bold text-slate-700">
                  بيانات التاجر
                </th>
                <th className="p-4 md:p-5 font-bold text-slate-700 text-left">
                  التواصل
                </th>
                <th className="p-4 md:p-5 font-bold text-slate-700">
                  تاريخ الطلب
                </th>
                <th className="p-4 md:p-5 font-bold text-slate-700 text-center">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {merchants?.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-12 text-center text-slate-500 font-medium"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-4xl opacity-50">🤝</span>
                      لا توجد طلبات معلقة حالياً.
                    </div>
                  </td>
                </tr>
              ) : (
                merchants?.map((merchant: any) => (
                  <tr
                    key={merchant._id}
                    className="hover:bg-slate-50/50 transition-colors group bg-white"
                  >
                    <td className="p-4 md:p-5">
                      <div className="flex items-center gap-4">
                        {merchant.storeImage ? (
                          <div className="relative w-12 h-12 rounded-xl border border-slate-200 overflow-hidden shrink-0 shadow-sm">
                            <Image
                              src={merchant.storeImage}
                              alt={merchant.storeName}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xs font-bold text-slate-400 border border-dashed border-slate-300 shrink-0">
                            لا صورة
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 text-sm md:text-base">
                            {merchant.storeName}
                          </div>
                          <div className="text-xs text-slate-500 font-medium truncate max-w-[200px] whitespace-normal">
                            {merchant.storeAddress}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 md:p-5">
                      <div className="font-bold text-slate-900 text-sm md:text-base">
                        {merchant.name}
                      </div>
                      <div className="text-sm text-slate-500 font-mono font-medium">
                        {merchant.email}
                      </div>
                    </td>
                    <td
                      className="p-4 md:p-5 font-mono text-slate-700 font-bold text-sm text-left"
                      dir="ltr"
                    >
                      {merchant.phoneNumber}
                    </td>
                    <td className="p-4 md:p-5 text-sm text-slate-500 font-mono font-medium">
                      {merchant.createdAt}
                    </td>
                    <td className="p-4 md:p-5 text-center">
                      <ApproveButton userId={merchant._id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
