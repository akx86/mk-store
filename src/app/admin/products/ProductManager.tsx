/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; // 🌟 ضروري عشان نعمل ريفريش للجدول
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
  const router = useRouter();
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
  const [isHidden, setIsHidden] = useState(product?.isHidden || false);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured || false);

  // 🌟 تعديل: دمجنا state الصور والملفات في state واحدة عشان نقدر نرتبهم ونمسح منهم بسهولة
  const [media, setMedia] = useState<{ url: string; file: File | null }[]>([]);

  // 🌟 تعديل: تحديث الـ useEffect ليتوافق مع الـ state الجديدة
  useEffect(() => {
    if (isOpen && product) {
      setTitle(product.title || "");
      setDescription(product.description || "");
      setRetailPrice(product.retailPrice || "");
      setWholesalePrice(product.wholesalePrice || "");
      setCategoryId(product.category?._id || "");
      setIsHidden(product.isHidden || false);
      setIsFeatured(product.isFeatured || false);

      // جلب الصور القديمة من الداتا بيز
      const existingMedia = (product.images || []).map((url: string) => ({
        url,
        file: null,
      }));
      setMedia(existingMedia);
    } else if (isOpen && !product) {
      setTitle("");
      setDescription("");
      setRetailPrice("");
      setWholesalePrice("");
      setCategoryId("");
      setIsHidden(false);
      setIsFeatured(false);
      setMedia([]);
    }
  }, [isOpen, product]);

  // 🌟 تنظيف الروابط الوهمية لعدم تسريب الذاكرة
  useEffect(() => {
    return () => {
      media.forEach((item) => {
        if (item.file) URL.revokeObjectURL(item.url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🌟 تعديل: دوال التعامل مع الصور (اختيار، حذف، سحب، إفلات)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const newFiles = Array.from(e.target.files);
    const newMediaItems = newFiles.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));
    setMedia((prev) => [...prev, ...newMediaItems]);
    e.target.value = ""; // تصفير الحقل لاختيار نفس الصورة مجدداً إن لزم
  };

  const removeImage = (indexToRemove: number) => {
    setMedia((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("dragIndex", index.toString());
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = Number(e.dataTransfer.getData("dragIndex"));
    if (dragIndex === dropIndex) return;

    const newMedia = [...media];
    const [draggedItem] = newMedia.splice(dragIndex, 1);
    newMedia.splice(dropIndex, 0, draggedItem);
    setMedia(newMedia);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!categoryId) throw new Error("يجب اختيار القسم أولاً");

      // 🌟 تعديل: اللوجيك الجديد للرفع بالترتيب الصحيح (بيحتفظ بالقديم ويرفع الجديد)
      const uploadPromises = media.map(async (item) => {
        if (item.file) {
          return await uploadImage(item.file);
        }
        return item.url;
      });

      const finalImageUrls = await Promise.all(uploadPromises);

      const productData = {
        title,
        description,
        retailPrice: Number(retailPrice),
        wholesalePrice: Number(wholesalePrice),
        category: categoryId,
        isHidden,
        isFeatured,
        images: finalImageUrls, // مصفوفة الصور المرتبة والنهائية
      };

      const res = product?._id
        ? await updateProduct(product._id, productData)
        : await createProduct(productData);

      if (res.error) throw new Error(res.error);

      setIsOpen(false);
      router.refresh(); // 🌟 تحديث الجدول فوراً بعد الحفظ
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
    router.refresh(); // تحديث الجدول بعد الحذف
  };

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2.5">
          <Label className="text-slate-700 font-bold">اسم المنتج</Label>
          <Input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all h-12 rounded-xl"
          />
        </div>
        <div className="space-y-2.5">
          <Label className="text-slate-700 font-bold">القسم</Label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all appearance-none cursor-pointer"
          >
            <option value="" disabled className="text-slate-500">
              اختر القسم...
            </option>
            {categories.map((cat) => (
              <option
                key={cat._id}
                value={cat._id}
                className="bg-white text-slate-900"
              >
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2.5 w-full ">
        <Label className="text-slate-700 font-bold">الوصف</Label>
        <textarea
          required
          value={description}
          rows={4}
          onChange={(e) => setDescription(e.target.value)}
          className="block w-full bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all rounded-xl p-4 text-sm resize-y"
        />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-2.5">
          <Label className="text-slate-700 font-bold">سعر القطاعي</Label>
          <Input
            type="number"
            required
            min="0"
            value={retailPrice}
            onChange={(e) => setRetailPrice(e.target.value)}
            dir="ltr"
            className="text-left bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 font-mono h-12 rounded-xl"
          />
        </div>
        <div className="space-y-2.5">
          <Label className="text-slate-700 font-bold">سعر الجملة</Label>
          <Input
            type="number"
            required
            min="0"
            value={wholesalePrice}
            onChange={(e) => setWholesalePrice(e.target.value)}
            dir="ltr"
            className="text-left bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 font-mono h-12 rounded-xl"
          />
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm">
        <div className="space-y-1">
          <Label
            className="text-slate-900 font-black text-sm cursor-pointer"
            onClick={() => setIsHidden(!isHidden)}
          >
            إخفاء المنتج (Out of Stock)
          </Label>
          <p className="text-[10px] text-slate-500 font-medium">
            تفعيل هذا الخيار سيمنع ظهور المنتج للعملاء في الكتالوج الرئيسي.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsHidden(!isHidden)}
          className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isHidden ? "bg-red-500" : "bg-slate-300"
          }`}
          role="switch"
          aria-checked={isHidden}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isHidden ? "-translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>
      {/* 🌟 حقل تثبيت المنتج (Featured) */}
      <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm mt-4">
        <div className="space-y-1">
          <Label
            className="text-amber-900 font-black text-sm cursor-pointer"
            onClick={() => setIsFeatured(!isFeatured)}
          >
            تثبيت في القمة (Featured) ⭐
          </Label>
          <p className="text-[10px] text-amber-700 font-medium">
            تفعيل هذا الخيار سيجعل المنتج يظهر دائماً في بداية الكتالوج.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsFeatured(!isFeatured)}
          className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isFeatured ? "bg-amber-500" : "bg-slate-300"
          }`}
          role="switch"
          aria-checked={isFeatured}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isFeatured ? "-translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className="space-y-2.5 bg-white border border-slate-200 p-4 rounded-xl shadow-sm mt-4">
        <Label className="text-slate-700 font-bold text-xs flex justify-between">
          <span>صور المنتج (اسحب للترتيب)</span>
        </Label>

        {/* 🌟 تعديل: تحديث حاوية الصور لدعم الترتيب والحذف */}
        <div className="flex flex-wrap gap-3 mt-3 min-h-[5rem] p-2 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
          {media.length > 0 ? (
            media.map((item, idx) => (
              <div
                key={idx}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, idx)}
                className="relative w-16 h-16 bg-white rounded-xl border border-slate-200 cursor-move overflow-hidden flex-shrink-0 shadow-sm group hover:border-indigo-400 transition-all"
              >
                <Image
                  src={item.url}
                  alt={`Preview ${idx + 1}`}
                  fill
                  className="object-cover"
                />

                {/* زرار الحذف اللي بيظهر بالهوفر */}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-red-500/90 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                  title="حذف الصورة"
                >
                  ✕
                </button>

                {/* رقم ترتيب الصورة عشان العميل يكون شايف */}
                <div className="absolute bottom-0 left-0 bg-slate-900/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-tr-lg">
                  {idx + 1}
                </div>
              </div>
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] font-medium text-center">
              لا توجد صور، اضغط أدناه للاختيار
            </div>
          )}
        </div>

        <div className="mt-3">
          <Input
            type="file"
            accept="image/*"
            multiple // 🌟 تفعيل اختيار أكثر من ملف
            onChange={handleFileChange}
            className="cursor-pointer w-full bg-white border-0 p-0 text-slate-500 file:bg-slate-100 file:text-slate-700 file:font-semibold file:border-0 file:rounded-lg file:px-4 file:py-2 hover:file:bg-slate-200 transition-all h-auto"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-0.5 shadow-sm transition-all h-12 rounded-xl font-bold text-base mt-4"
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
              className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 shadow-sm rounded-lg"
            >
              تعديل
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-slate-100 shadow-xl sm:max-w-xl rounded-[2rem] max-h-[90vh] overflow-y-auto hide-scrollbar">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-slate-900 tracking-tight text-right">
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
          className="bg-white border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 shadow-sm rounded-lg"
        >
          {isLoading ? "..." : "حذف"}
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow-md transition-all px-6 py-5 rounded-xl font-bold">
          + إضافة منتج
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-slate-100 shadow-xl sm:max-w-xl rounded-[2rem] max-h-[90vh] overflow-y-auto hide-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-slate-900 tracking-tight text-right">
            إضافة منتج جديد
          </DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
