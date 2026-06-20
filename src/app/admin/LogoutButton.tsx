"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const handleLogout = async () => {
    // signOut بتمسح الـ Session من المتصفح وبتحولك لصفحة اللوجين تلقائياً
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold py-3 px-4 mt-4 rounded-xl border border-rose-500/20 hover:border-rose-500/50 transition-all group"
    >
      <LogOut
        size={18}
        className="group-hover:-translate-x-1 transition-transform"
      />
      <span>تسجيل الخروج</span>
    </button>
  );
}
