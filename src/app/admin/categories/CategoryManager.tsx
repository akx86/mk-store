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

  // 🎨 Cyberpunk Form Content
  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-5 mt-4 text-slate-200">
      {error && (
        <div className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg font-medium">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-slate-400">اسم القسم</Label>
        <Input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثال: هواتف ذكية"
          className="bg-[#050505] border-slate-800 text-slate-100 placeholder-slate-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-slate-400">الرابط (Slug)</Label>
        <Input
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          dir="ltr"
          placeholder="smart-phones"
          className="bg-[#050505] border-slate-800 text-slate-100 placeholder-slate-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-left"
        />
      </div>

      {/* حقل رفع الصورة (Dark UI) */}
      <div className="space-y-2 bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
        <Label className="text-slate-400">صورة القسم</Label>
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          {previewUrl ? (
            <div className="relative w-20 h-20 bg-[#050505] rounded-xl border border-cyan-500/30 overflow-hidden flex-shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 bg-[#050505] rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-slate-500 text-xs flex-shrink-0">
              لا صورة
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="cursor-pointer flex-1 bg-[#050505] border-slate-800 text-slate-300 file:bg-slate-800 file:text-slate-200 file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 hover:file:bg-slate-700 transition-all"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-cyan-600/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all py-6 text-lg font-bold"
      >
        {isLoading ? "جاري الحفظ..." : "حفظ القسم"}
      </Button>
    </form>
  );

  // 1. أزرار الإجراءات داخل الجدول
  if (isRowAction) {
    return (
      <div className="flex justify-center gap-2">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
            >
              تعديل
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0a0a0a] border-slate-800 text-slate-200 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
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
          className="bg-transparent border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
        >
          {isLoading ? "..." : "حذف"}
        </Button>
      </div>
    );
  }

  // 2. زر إضافة قسم جديد الرئيسي
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-cyan-600/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all px-6">
          + إضافة قسم جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0a0a0a] border-slate-800 text-slate-200 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            إضافة قسم جديد
          </DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
