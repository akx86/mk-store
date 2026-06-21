"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBar({
  defaultSearch,
}: {
  defaultSearch: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [term, setTerm] = useState(defaultSearch);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (term.trim()) {
      params.set("search", term.trim());
    } else {
      params.delete("search");
    }

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="relative max-w-lg mx-auto flex items-center group"
    >
      <input
        type="text"
        placeholder="ابحث عن موبايل، شاحن، جراب..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="w-full h-12 pl-4 pr-12 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-900 transition-colors"
        aria-label="بحث"
      >
        <Search size={20} />
      </button>
    </form>
  );
}
