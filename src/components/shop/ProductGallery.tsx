"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  // بنحط أول صورة كـ State افتراضية
  const [activeImage, setActiveImage] = useState(images?.[0] || "");

  if (!images || images.length === 0) {
    return (
      <div className="w-full bg-slate-50/80 aspect-square rounded-[2rem] border border-slate-100 flex items-center justify-center p-8">
        <div className="text-slate-400 font-semibold tracking-widest uppercase flex flex-col items-center gap-2">
          <span className="text-4xl opacity-50">📵</span>
          <span>لا توجد صورة</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 🌟 الصورة الرئيسية الكبيرة */}
      <div className="relative w-full aspect-square bg-slate-50/80 rounded-[2rem] border border-slate-100 overflow-hidden flex items-center justify-center p-8 transition-all duration-500">
        <Image
          src={activeImage}
          alt={title}
          fill
          className="object-contain p-6 mix-blend-multiply transition-opacity duration-300"
          priority
        />
      </div>

      {/* 🌟 شريط الصور المصغرة (Thumbnails) */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar snap-x">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(img)}
              className={`relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden flex-shrink-0 snap-start bg-slate-50 transition-all duration-200 ${
                activeImage === img
                  ? "border-2 border-slate-900 shadow-sm opacity-100" // الصورة النشطة
                  : "border border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-400" // الصور غير النشطة
              }`}
            >
              <Image
                src={img}
                alt={`${title} - Thumbnail ${index + 1}`}
                fill
                className="object-cover mix-blend-multiply p-2"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
