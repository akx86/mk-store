/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { approveMerchant } from "@/actions/admin.actions";
import { Button } from "@/components/ui/button";

export default function ApproveButton({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    if (
      !confirm(
        "هل أنت متأكد من الموافقة على هذا التاجر وإعطائه صلاحيات أسعار الجملة؟",
      )
    )
      return;

    setIsLoading(true);
    try {
      const res = await approveMerchant(userId);
      if (res.error) {
        alert(res.error);
      }
    } catch (error) {
      alert("حدث خطأ أثناء الموافقة");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 🎨 Clean Success Action Button
    <Button
      onClick={handleApprove}
      disabled={isLoading}
      className="bg-white border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 shadow-sm rounded-lg font-bold transition-all"
      size="sm"
    >
      {isLoading ? "جاري الاعتماد..." : "موافقة واعتماد"}
    </Button>
  );
}
