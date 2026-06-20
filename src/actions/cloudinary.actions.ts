"use server";

import { v2 as cloudinary } from "cloudinary";

// إعداد Cloudinary باستخدام متغيرات البيئة
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function getCloudinarySignature() {
  try {
    // 1. تحديد وقت الطلب
    const timestamp = Math.round(new Date().getTime() / 1000);

    // 2. إعداد المتغيرات اللي عايزين نشفرها (زي المجلد اللي هنحفظ فيه الصور)
    const paramsToSign = {
      timestamp,
      folder: "phone-catalog", // اسم المجلد اللي هيتكريت في Cloudinary
    };

    // 3. توليد التوقيع باستخدام الـ Secret Key
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!,
    );

    // 4. إرجاع البيانات اللي الـ Frontend محتاجها عشان يرفع الصورة
    return {
      timestamp,
      signature,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      folder: "phone-catalog",
    };
  } catch (error) {
    console.error("Error generating Cloudinary signature:", error);
    throw new Error("فشل في توليد توقيع رفع الصور");
  }
}
