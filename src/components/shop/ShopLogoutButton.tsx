"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function ShopLogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/20 transition-all"
      title="تسجيل الخروج"
    >
      <LogOut size={16} />
      <span>تسجيل الخروج</span>
    </button>
  );
}
