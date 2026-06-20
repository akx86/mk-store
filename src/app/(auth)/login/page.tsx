/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else if (res?.ok) {
        router.push("/admin/categories");
        router.refresh();
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 🎨 Clean Cyberpunk Background
    <div
      className="flex min-h-screen items-center justify-center bg-[#050505] text-slate-200 p-4 selection:bg-cyan-500/30"
      dir="rtl"
    >
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-[#0a0a0a] p-8 shadow-2xl border border-slate-800 relative group">
        {/* تأثير نيون خلفي خفيف للكارت */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/10 to-purple-600/10 rounded-2xl blur-xl opacity-70 pointer-events-none"></div>

        <div className="text-center relative z-10">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">
            تسجيل الدخول
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            أدخل بيانات الحساب للمتابعة إلى لوحة التحكم
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-400 border border-rose-500/20 font-medium relative z-10">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-400">
              البريد الإلكتروني
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@catalog.com"
              dir="ltr"
              className="bg-[#050505] border-slate-800 text-slate-100 placeholder-slate-700 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-400">
              كلمة المرور
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              dir="ltr"
              className="bg-[#050505] border-slate-800 text-slate-100 placeholder-slate-700 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-cyan-600/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all py-6 font-bold text-base"
            disabled={isLoading}
          >
            {isLoading ? "جاري التحقق من الهوية..." : "دخول مباشر"}
          </Button>
        </form>
      </div>
    </div>
  );
}
