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
    // 🎨 Premium Minimalist Light Background (Matches Product Details)
    <div
      className="flex min-h-screen items-center justify-center bg-[#f5f5f7] text-slate-900 p-4 selection:bg-slate-200"
      dir="rtl"
    >
      {/* حاوية اللوجين: أبيض نقي، حواف ناعمة، وظل خفيف جداً يبرز الكارت */}
      <div className="w-full max-w-md space-y-8 rounded-[2rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative group">
        <div className="text-center relative z-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            تسجيل الدخول
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            أدخل بيانات الحساب للمتابعة إلى لوحة التحكم
          </p>
        </div>

        {/* رسالة الخطأ: ألوان هادية ومناسبة للعين في الفواتح */}
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 font-bold relative z-10 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div className="space-y-2.5">
            <Label htmlFor="email" className="text-slate-700 font-bold">
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
              // حقول إدخال نظيفة جداً بتدي إطار غامق عند التركيز (Focus)
              className="bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all text-right h-12 rounded-xl"
            />
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="password" className="text-slate-700 font-bold">
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
              className="bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all h-12 rounded-xl"
            />
          </div>

          {/* زر الأكشن: صلب، لون قوي (أسود)، وبيرتفع لفوق خفيف جداً للفت الانتباه */}
          <Button
            type="submit"
            className="w-full bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-0.5 shadow-sm transition-all h-12 rounded-xl font-bold text-base mt-2"
            disabled={isLoading}
          >
            {isLoading ? "جاري التحقق من الهوية..." : "دخول مباشر"}
          </Button>
        </form>
      </div>
    </div>
  );
}
