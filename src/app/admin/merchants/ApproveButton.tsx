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
    <Button
      onClick={handleApprove}
      disabled={isLoading}
      className="bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all font-bold tracking-wide"
      size="sm"
    >
      {isLoading ? "جاري الاعتماد..." : "موافقة واعتماد"}
    </Button>
  );
}
