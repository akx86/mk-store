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

// 🚀 موديول رفع صورة المحل إلى Cloudinary
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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) return;
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  // 🌟 دالة مسح صورة المحل
  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedFile(null);
    setPreviewUrl(null);
    const fileInput = document.getElementById(
      "store-image-input",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

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
      className="flex min-h-screen items-center justify-center bg-[#f5f5f7] text-slate-900 p-4 md:p-8 selection:bg-slate-200"
      dir="rtl"
    >
      <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-10 relative overflow-hidden">
        <div className="text-center mb-10 relative z-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            إنشاء حساب تاجر جديد
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            سجل بياناتك ومحلك للحصول على صلاحيات أسعار الجملة بعد مراجعة الإدارة
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 font-bold relative z-10 text-center">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm text-green-700 border border-green-200 text-center font-bold relative z-10 shadow-sm">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            <div className="space-y-5 bg-slate-50/50 border border-slate-100 p-6 rounded-[1.5rem]">
              <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-3 text-base flex items-center gap-2">
                <span className="text-lg opacity-80">👤</span> البيانات الشخصية
              </h3>

              <div className="space-y-2.5">
                <Label htmlFor="name" className="text-slate-700 font-bold">
                  الاسم بالكامل
                </Label>
                <Input
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-white border-slate-200 text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-slate-700 font-bold">
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
                  className="bg-white border-slate-200 text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all h-12 rounded-xl text-right placeholder-slate-400"
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="password" className="text-slate-700 font-bold">
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
                  className="bg-white border-slate-200 text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-5 bg-slate-50/50 border border-slate-100 p-6 rounded-[1.5rem]">
              <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-3 text-base flex items-center gap-2">
                <span className="text-lg opacity-80">🏪</span> بيانات المحل
                والتوثيق
              </h3>

              <div className="space-y-2.5">
                <Label htmlFor="storeName" className="text-slate-700 font-bold">
                  اسم المحل / السنترال
                </Label>
                <Input
                  id="storeName"
                  name="storeName"
                  required
                  value={formData.storeName}
                  onChange={handleChange}
                  className="bg-white border-slate-200 text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2.5">
                <Label
                  htmlFor="phoneNumber"
                  className="text-slate-700 font-bold"
                >
                  رقم الهاتف (واتساب)
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  dir="ltr"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="bg-white border-slate-200 text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all h-12 rounded-xl text-right"
                />
              </div>

              <div className="space-y-2.5">
                <Label
                  htmlFor="storeAddress"
                  className="text-slate-700 font-bold"
                >
                  عنوان المحل بالتفصيل
                </Label>
                <Input
                  id="storeAddress"
                  name="storeAddress"
                  required
                  value={formData.storeAddress}
                  onChange={handleChange}
                  className="bg-white border-slate-200 text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all h-12 rounded-xl"
                />
              </div>

              {/* حقل رفع الصورة المحدث */}
              <div className="space-y-2.5 bg-white border border-slate-200 p-4 rounded-xl mt-4 shadow-sm">
                <Label className="text-slate-700 text-xs font-bold">
                  صورة واجهة المحل أو الكارت
                </Label>
                <div className="flex flex-col gap-4 mt-2">
                  {previewUrl ? (
                    <div className="flex flex-col gap-2 w-20">
                      <div className="relative w-20 h-20 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                        <Image
                          src={previewUrl}
                          alt="Store Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="w-full text-[10px] h-7 font-bold shadow-sm"
                      >
                        حذف الصورة
                      </Button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-slate-50 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs font-medium shrink-0">
                      لا صورة
                    </div>
                  )}
                  <Input
                    id="store-image-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                    className="cursor-pointer text-xs flex-1 bg-white border-0 p-0 text-slate-500 file:bg-slate-100 file:text-slate-700 file:font-semibold file:border-0 file:rounded-lg file:px-4 file:py-2 file:mr-3 hover:file:bg-slate-200 transition-all h-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-0.5 shadow-sm transition-all py-7 text-lg font-bold rounded-[1rem] mt-4"
            disabled={isLoading || !!successMsg}
          >
            {isLoading ? "جاري رفع البيانات..." : "تقديم طلب التوثيق كتاجر"}
          </Button>

          <div className="text-center text-sm text-slate-500 font-medium">
            لديك حساب تاجر بالفعل؟{" "}
            <Link
              href="/login"
              className="text-slate-900 hover:underline font-black transition-colors"
            >
              سجل الدخول مباشرة
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
