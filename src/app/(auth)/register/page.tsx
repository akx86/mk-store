/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { registerMerchant } from "@/actions/auth.actions";
import { getCloudinarySignature } from "@/actions/cloudinary.actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
// 🚀 موديول رفع صورة المحل إلى Cloudinary مباشرة
async function uploadImage(file: File): Promise<string> {
  const { timestamp, signature, cloudName, apiKey, folder } =
    await getCloudinarySignature();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey!);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  formData.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!res.ok) throw new Error("فشل رفع صورة المحل على السيرفر السحابي");
  const data = await res.json();
  return data.secure_url;
}

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    storeName: "",
    phoneNumber: "",
    storeAddress: "",
  });

  // الـ States الخاصة بملف الصورة والمعاينة
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) return;
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      let finalImageUrl = "";
      if (selectedFile) {
        finalImageUrl = await uploadImage(selectedFile);
      }

      const merchantData = {
        ...formData,
        storeImage: finalImageUrl,
      };

      const res = await registerMerchant(merchantData);

      if (res?.error) {
        setError(res.error);
      } else {
        setSuccessMsg("تم تسجيل طلبك بنجاح! جاري تسجيل الدخول...");

        const signInRes = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (signInRes?.ok) {
          setTimeout(() => {
            router.push("/");
            router.refresh();
          }, 2000);
        } else {
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#050505] text-slate-200 p-4 md:p-8 selection:bg-purple-500/30"
      dir="rtl"
    >
      <div className="w-full max-w-4xl bg-[#0a0a0a] rounded-2xl shadow-2xl border border-slate-800 p-6 md:p-8 relative overflow-hidden">
        {/* توهج بنفسجي خفيف يناسب الهوية البصرية للتجار */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            إنشاء حساب تاجر جديد
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            سجل بياناتك ومحلك للحصول على صلاحيات أسعار الجملة بعد مراجعة الإدارة
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-400 border border-rose-500/20 font-medium relative z-10">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 rounded-lg bg-green-500/10 p-4 text-sm text-green-400 border border-green-500/20 text-center font-bold relative z-10 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* Responsive Grid System (موبايل فيرست بالكامل) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* 1. قسم البيانات الشخصية */}
            <div className="space-y-4 bg-slate-900/20 border border-slate-800/60 p-5 rounded-2xl">
              <h3 className="font-bold text-cyan-400 border-b border-slate-800 pb-2 text-base flex items-center gap-2">
                <span>👤</span> البيانات الشخصية
              </h3>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-400">
                  الاسم بالكامل
                </Label>
                <Input
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-[#050505] border-slate-800 text-slate-100 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-400">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  dir="ltr"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-[#050505] border-slate-800 text-slate-100 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-400">
                  كلمة المرور
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  dir="ltr"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-[#050505] border-slate-800 text-slate-100 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                />
              </div>
            </div>

            {/* 2. قسم بيانات التجارة والتوثيق */}
            <div className="space-y-4 bg-slate-900/20 border border-slate-800/60 p-5 rounded-2xl">
              <h3 className="font-bold text-purple-400 border-b border-slate-800 pb-2 text-base flex items-center gap-2">
                <span>🏪</span> بيانات المحل والتوثيق
              </h3>

              <div className="space-y-2">
                <Label htmlFor="storeName" className="text-slate-400">
                  اسم المحل / السنتر
                </Label>
                <Input
                  id="storeName"
                  name="storeName"
                  required
                  value={formData.storeName}
                  onChange={handleChange}
                  className="bg-[#050505] border-slate-800 text-slate-100 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-slate-400">
                  رقم الهاتف (للتواصل عبر واتساب)
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  dir="ltr"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="bg-[#050505] border-slate-800 text-slate-100 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeAddress" className="text-slate-400">
                  عنوان المحل بالتفصيل
                </Label>
                <Input
                  id="storeAddress"
                  name="storeAddress"
                  required
                  value={formData.storeAddress}
                  onChange={handleChange}
                  className="bg-[#050505] border-slate-800 text-slate-100 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                />
              </div>

              {/* حقل رفع صورة واجهة المحل أو الكارت الشخصي للتوثيق */}
              <div className="space-y-2 border border-slate-800/80 bg-[#050505] p-3 rounded-xl mt-2">
                <Label className="text-slate-400 text-xs font-bold">
                  صورة واجهة المحل أو الكارت الشخصي
                </Label>
                <div className="flex items-center gap-3 mt-1">
                  {previewUrl ? (
                    <div className="relative w-14 h-14 bg-[#0a0a0a] rounded-lg border border-purple-500/30 overflow-hidden shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                      <Image
                        src={previewUrl}
                        alt="Store Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 bg-[#0a0a0a] rounded-lg border border-dashed border-slate-700 flex items-center justify-center text-slate-600 text-[10px] shrink-0">
                      لا صورة
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                    className="cursor-pointer text-xs flex-1 bg-[#050505] border-slate-800 text-slate-400 file:bg-slate-800 file:text-slate-200 file:border-0 file:rounded file:px-3 file:py-1 file:mr-2 hover:file:bg-slate-700 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-purple-600/10 text-purple-400 border border-purple-500/30 hover:bg-purple-600/20 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all py-6 text-lg font-bold"
            disabled={isLoading || !!successMsg}
          >
            {isLoading
              ? "جاري رفع البيانات والتوثيق سحابياً..."
              : "تقديم طلب التوثيق كتاجر"}
          </Button>

          <div className="text-center text-sm text-slate-500 mt-4">
            لديك حساب تاجر بالفعل؟{" "}
            <Link
              href="/login"
              className="text-cyan-400 hover:underline font-bold transition-colors"
            >
              سجل الدخول مباشرة
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
