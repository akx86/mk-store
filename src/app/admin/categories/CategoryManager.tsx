/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/actions/admin.actions";
import { getCloudinarySignature } from "@/actions/cloudinary.actions";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import imageCompression from "browser-image-compression";

interface CategoryManagerProps {
  category?: any;
  isRowAction?: boolean;
}

async function uploadImage(file: File): Promise<string> {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    initialQuality: 0.8,
  };

  try {
    const compressedFile = await imageCompression(file, options);

    const { timestamp, signature, cloudName, apiKey, folder } =
      await getCloudinarySignature();
    const formData = new FormData();

    formData.append("file", compressedFile);
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

    if (!res.ok) throw new Error("فشل رفع الصورة على السيرفر السحابي");
    const data = await res.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error during image processing/upload:", error);
    throw new Error("حدث خطأ أثناء معالجة أو رفع الصورة");
  }
}

export default function CategoryManager({
  category,
  isRowAction,
}: CategoryManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    category?.image || null,
  );

  useEffect(() => {
    if (!selectedFile) return;
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let finalImageUrl = category?.image || "";

      if (selectedFile) {
        finalImageUrl = await uploadImage(selectedFile);
      }

      const categoryData = { name, slug, image: finalImageUrl };

      let res;
      if (category?._id) {
        res = await updateCategory(category._id, categoryData);
      } else {
        res = await createCategory(categoryData);
      }

      if (res.error) throw new Error(res.error);

      setIsOpen(false);
      if (!category) {
        setName("");
        setSlug("");
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!category?._id || !confirm("هل أنت متأكد من حذف هذا القسم؟")) return;
    setIsLoading(true);
    const res = await deleteCategory(category._id);
    if (res.error) alert(res.error);
    setIsLoading(false);
  };

  // 🎨 Premium Minimalist Form Content
  const formContent = (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 mt-4 text-slate-900"
      dir="rtl"
    >
      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-100 p-3 rounded-xl font-bold text-center">
          {error}
        </div>
      )}

      <div className="space-y-2.5">
        <Label className="text-slate-700 font-bold">اسم القسم</Label>
        <Input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثال: هواتف ذكية"
          className="bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all h-12 rounded-xl"
        />
      </div>

      <div className="space-y-2.5">
        <Label className="text-slate-700 font-bold">الرابط (Slug)</Label>
        <Input
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          dir="ltr"
          placeholder="smart-phones"
          className="bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all text-left h-12 rounded-xl"
        />
      </div>

      {/* حقل رفع الصورة (Clean UI) */}
      <div className="space-y-2.5 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <Label className="text-slate-700 font-bold text-xs">صورة القسم</Label>
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          {previewUrl ? (
            <div className="relative w-16 h-16 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex-shrink-0 shadow-sm">
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs font-medium flex-shrink-0">
              لا صورة
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="cursor-pointer flex-1 bg-white border-0 p-0 text-slate-500 file:bg-slate-100 file:text-slate-700 file:font-semibold file:border-0 file:rounded-lg file:px-4 file:py-2 file:mr-3 hover:file:bg-slate-200 transition-all h-auto"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-0.5 shadow-sm transition-all h-12 rounded-xl font-bold text-base mt-2"
      >
        {isLoading ? "جاري الحفظ..." : "حفظ القسم"}
      </Button>
    </form>
  );

  // 1. أزرار الإجراءات داخل الجدول (Clean Row Actions)
  if (isRowAction) {
    return (
      <div className="flex justify-center gap-2">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 shadow-sm rounded-lg"
            >
              تعديل
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-slate-100 shadow-xl sm:max-w-md rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-slate-900 tracking-tight text-right">
                تعديل القسم
              </DialogTitle>
            </DialogHeader>
            {formContent}
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={isLoading}
          className="bg-white border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 shadow-sm rounded-lg"
        >
          {isLoading ? "..." : "حذف"}
        </Button>
      </div>
    );
  }

  // 2. زر إضافة قسم جديد الرئيسي (Primary Black Button)
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow-md transition-all px-6 py-5 rounded-xl font-bold">
          + إضافة قسم جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-slate-100 shadow-xl sm:max-w-md rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-slate-900 tracking-tight text-right">
            إضافة قسم جديد
          </DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
