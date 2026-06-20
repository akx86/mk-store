/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPendingMerchants } from "@/actions/admin.actions";
import ApproveButton from "./ApproveButton";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function MerchantsPage() {
  const res = await getPendingMerchants();
  const merchants = res.success ? res.merchants : [];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-500">
          طلبات تسجيل التجار
        </h1>
      </div>

      <div className="bg-[#0a0a0a] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-right min-w-[900px] whitespace-nowrap">
            <thead className="bg-slate-900/80 border-b border-slate-800">
              <tr>
                <th className="p-4 font-bold text-purple-400">المحل</th>
                <th className="p-4 font-bold text-purple-400">بيانات التاجر</th>
                <th className="p-4 font-bold text-purple-400">التواصل</th>
                <th className="p-4 font-bold text-purple-400">تاريخ الطلب</th>
                <th className="p-4 font-bold text-purple-400 text-center">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {merchants?.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-12 text-center text-slate-500 font-medium"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">🤝</span>
                      لا توجد طلبات معلقة حالياً.
                    </div>
                  </td>
                </tr>
              ) : (
                merchants?.map((merchant: any) => (
                  <tr
                    key={merchant._id}
                    className="hover:bg-slate-900/50 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        {merchant.storeImage ? (
                          <div className="relative w-12 h-12 rounded-xl border border-slate-700 overflow-hidden shrink-0">
                            <Image
                              src={merchant.storeImage}
                              alt={merchant.storeName}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-[#050505] rounded-xl flex items-center justify-center text-xs text-slate-600 border border-dashed border-slate-700 shrink-0">
                            لا صورة
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-200 text-sm md:text-base">
                            {merchant.storeName}
                          </div>
                          <div className="text-xs text-slate-500 truncate max-w-[200px] whitespace-normal">
                            {merchant.storeAddress}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-300 text-sm md:text-base">
                        {merchant.name}
                      </div>
                      <div className="text-sm text-slate-500 font-mono">
                        {merchant.email}
                      </div>
                    </td>
                    <td
                      className="p-4 font-mono text-cyan-400 text-sm"
                      dir="ltr"
                    >
                      {merchant.phoneNumber}
                    </td>
                    <td className="p-4 text-sm text-slate-500 font-mono">
                      {merchant.createdAt}
                    </td>
                    <td className="p-4 text-center">
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
