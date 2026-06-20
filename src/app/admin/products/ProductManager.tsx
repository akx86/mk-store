/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  createProduct,
  updateProduct,
  deleteProduct,
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

interface ProductManagerProps {
  categories: { _id: string; name: string }[];
  product?: any;
  isRowAction?: boolean;
}

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

  if (!res.ok) throw new Error("فشل رفع الصورة على السيرفر السحابي");
  const data = await res.json();
  return data.secure_url;
}

export default function ProductManager({
  categories,
  product,
  isRowAction,
}: ProductManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(product?.title || "");
  const [description, setDescription] = useState(product?.description || "");
  const [retailPrice, setRetailPrice] = useState(product?.retailPrice || "");
  const [wholesalePrice, setWholesalePrice] = useState(
    product?.wholesalePrice || "",
  );
  const [categoryId, setCategoryId] = useState(product?.category?._id || "");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    product?.images?.[0] || null,
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
      if (!categoryId) throw new Error("يجب اختيار القسم أولاً");

      let finalImageUrl = product?.images?.[0] || "";
      if (selectedFile) {
        finalImageUrl = await uploadImage(selectedFile);
      }

      const productData = {
        title,
        description,
        retailPrice: Number(retailPrice),
        wholesalePrice: Number(wholesalePrice),
        category: categoryId,
        images: finalImageUrl ? [finalImageUrl] : [],
      };

      const res = product?._id
        ? await updateProduct(product._id, productData)
        : await createProduct(productData);

      if (res.error) throw new Error(res.error);

      setIsOpen(false);
      if (!product) {
        setTitle("");
        setDescription("");
        setRetailPrice("");
        setWholesalePrice("");
        setCategoryId("");
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
    if (!product?._id || !confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    setIsLoading(true);
    const res = await deleteProduct(product._id);
    if (res.error) alert(res.error);
    setIsLoading(false);
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-5 mt-4 text-slate-200">
      {error && (
        <div className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-400">اسم المنتج</Label>
          <Input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-[#050505] border-slate-800 text-slate-100 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-400">القسم</Label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="flex h-10 w-full items-center justify-between rounded-md border border-slate-800 bg-[#050505] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          >
            <option value="" disabled className="text-slate-500">
              اختر القسم...
            </option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id} className="bg-[#0a0a0a]">
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-400">الوصف</Label>
        <Input
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-[#050505] border-slate-800 text-slate-100 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-400">سعر القطاعي</Label>
          <Input
            type="number"
            required
            min="0"
            value={retailPrice}
            onChange={(e) => setRetailPrice(e.target.value)}
            dir="ltr"
            className="text-left bg-[#050505] border-slate-800 text-slate-100 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-purple-400">سعر الجملة</Label>
          <Input
            type="number"
            required
            min="0"
            value={wholesalePrice}
            onChange={(e) => setWholesalePrice(e.target.value)}
            dir="ltr"
            className="text-left bg-[#050505] border-purple-500/30 text-purple-100 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 font-mono"
          />
        </div>
      </div>

      <div className="space-y-2 bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
        <Label className="text-slate-400">صورة المنتج</Label>
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          {previewUrl ? (
            <div className="relative w-20 h-20 bg-[#050505] rounded-xl border border-cyan-500/30 overflow-hidden flex-shrink-0">
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
        {isLoading ? "جاري الحفظ والرفع..." : "حفظ المنتج"}
      </Button>
    </form>
  );

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
          <DialogContent className="bg-[#0a0a0a] border-slate-800 text-slate-200 sm:max-w-xl max-h-[90vh] overflow-y-auto hide-scrollbar">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                تعديل المنتج
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-cyan-600/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all px-6">
          + إضافة منتج
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0a0a0a] border-slate-800 text-slate-200 sm:max-w-xl max-h-[90vh] overflow-y-auto hide-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            إضافة منتج جديد
          </DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
