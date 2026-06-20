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
        className="w-full h-12 pl-4 pr-12 rounded-xl border border-slate-800 bg-[#0a0a0a] text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-cyan-400 transition-colors"
        aria-label="بحث"
      >
        <Search size={20} />
      </button>
    </form>
  );
}
