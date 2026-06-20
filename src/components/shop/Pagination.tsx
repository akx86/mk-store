"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button"; // بنستخدم أزرار Shadcn اللي نزلناها

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({
  currentPage,
  totalPages,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    // التأكد إننا مش بنخرج بره الحدود
    if (newPage < 1 || newPage > totalPages) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());

    // تحديث الرابط، والـ scroll: false بتمنع الصفحة إنها تنط لفوق بشكل مزعج (اختياري)
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  };

  return (
    <div className="flex items-center justify-center gap-4 mt-12 pb-8">
      <Button
        variant="outline"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="w-24 border-gray-300 text-gray-700 hover:bg-gray-50"
      >
        التالي
      </Button>

      <span className="text-sm font-medium text-gray-600">
        صفحة {currentPage} من {totalPages}
      </span>

      <Button
        variant="outline"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="w-24 border-gray-300 text-gray-700 hover:bg-gray-50"
      >
        السابق
      </Button>
    </div>
  );
}
