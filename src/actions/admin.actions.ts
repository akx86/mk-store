/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import dbConnect from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 1. طبقة الحماية الداخلية (Security Check)
async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("عملية مرفوضة: صلاحيات غير كافية");
  }
}

export async function createProduct(productData: {
  title: string;
  description: string;
  images: string[];
  retailPrice: number;
  wholesalePrice: number;
  category: string; // ObjectId as string
}) {
  try {
    await verifyAdmin();
    await dbConnect();

    await Product.create(productData);

    revalidatePath("/admin/products");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ أثناء إضافة المنتج" };
  }
}

// جلب التجار قيد المراجعة
export async function getPendingMerchants() {
  try {
    await verifyAdmin();
    await dbConnect();

    const merchants = await User.find({ role: "PENDING_MERCHANT" })
      .sort({ createdAt: -1 })
      .lean();

    // 🧹 التنظيف الهندسي (Sanitization)
    const safeMerchants = merchants.map((m: any) => ({
      _id: m._id.toString(),
      name: m.name,
      email: m.email,
      storeName: m.storeName || "",
      phoneNumber: m.phoneNumber || "",
      storeAddress: m.storeAddress || "",
      storeImage: m.storeImage || "",
      createdAt: m.createdAt
        ? new Date(m.createdAt).toLocaleDateString("ar-EG")
        : "",
    }));

    return { success: true, merchants: safeMerchants };
  } catch (error: any) {
    return { error: error.message || "فشل في جلب قائمة التجار" };
  }
}

// 5. الموافقة على التاجر (Approve Merchant)
export async function approveMerchant(userId: string) {
  try {
    await verifyAdmin();
    await dbConnect();

    const user = await User.findByIdAndUpdate(
      userId,
      { role: "MERCHANT" },
      { new: true },
    );

    if (!user) throw new Error("المستخدم غير موجود");

    revalidatePath("/admin/merchants");

    return { success: true, message: "تمت الموافقة على التاجر بنجاح" };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ أثناء الموافقة" };
  }
}

export async function getProducts() {
  try {
    await dbConnect();

    // بنجيب المنتجات وبنعمل populate للقسم عشان نعرض اسمه
    const products = await Product.find({})
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    // 🧹 التنظيف الهندسي (Sanitization) لكل من الـ Product ID والـ Category ID
    const safeProducts = products.map((prod: any) => ({
      _id: prod._id.toString(),
      title: prod.title,
      description: prod.description,
      images: prod.images || [],
      retailPrice: prod.retailPrice,
      wholesalePrice: prod.wholesalePrice,
      // تأمين الكائن المدمج (Populated Object)
      category: prod.category
        ? {
            _id: prod.category._id.toString(),
            name: prod.category.name,
          }
        : null,
    }));

    return { success: true, products: safeProducts };
  } catch (error: any) {
    return { error: "فشل في جلب المنتجات" };
  }
}

// تعديل منتج
export async function updateProduct(
  id: string,
  updateData: Partial<{
    title: string;
    description: string;
    images: string[];
    retailPrice: number;
    wholesalePrice: number;
    category: string;
  }>,
) {
  try {
    await verifyAdmin();
    await dbConnect();

    await Product.findByIdAndUpdate(id, updateData);

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ أثناء تعديل المنتج" };
  }
}
// مسح قسم (محمي)
export async function deleteCategory(categoryId: string) {
  try {
    await verifyAdmin();
    await dbConnect();

    // فحص الـ Referential Integrity
    const linkedProducts = await Product.countDocuments({
      category: categoryId,
    });
    if (linkedProducts > 0) {
      throw new Error(
        "لا يمكن حذف هذا القسم لأنه يحتوي على منتجات، قم بنقلها أو حذفها أولاً",
      );
    }

    await Category.findByIdAndDelete(categoryId);

    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true, message: "تم حذف القسم بنجاح" };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ أثناء الحذف" };
  }
}

// مسح منتج
export async function deleteProduct(productId: string) {
  try {
    await verifyAdmin();
    await dbConnect();

    // 1. نجيب المنتج الأول عشان نعرف روابط الصور بتاعته
    const product = await Product.findById(productId);
    if (!product) throw new Error("المنتج غير موجود");

    // 2. نمسح الصور من Cloudinary
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map((imgUrl: string) => {
        // استخراج الـ public_id من الرابط
        // بنقسم الرابط بناءً على كلمة /upload/ وبناخد الجزء اللي بعدها، ونشيل منه الامتداد (.jpg أو .png)
        const parts = imgUrl.split("/upload/");
        if (parts.length === 2) {
          const publicIdWithExtension = parts[1].split("/").slice(1).join("/");
          const publicId = publicIdWithExtension.substring(
            0,
            publicIdWithExtension.lastIndexOf("."),
          );

          // إرسال طلب المسح لـ Cloudinary
          return cloudinary.uploader.destroy(publicId);
        }
        return Promise.resolve(); // لو الرابط مش مطابق لـ Cloudinary نعديه
      });

      // ننفذ كل طلبات المسح بالتوازي (عشان الأداء لو الموبايل ليه 5 صور)
      await Promise.all(deletePromises);
    }

    // 3. نمسح المنتج من الداتابيز
    await Product.findByIdAndDelete(productId);

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, message: "تم حذف المنتج وصوره بنجاح" };
  } catch (error: any) {
    return { error: error.message || "حدث خطأ أثناء حذف المنتج" };
  }
}

// 1. تحديث جلب الأقسام
export async function getCategories() {
  try {
    await dbConnect();
    const categories = await Category.find({}).sort({ createdAt: -1 }).lean();

    const safeCategories = categories.map((cat: any) => ({
      _id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug,
      image: cat.image || "", // 🔴 تمرير الصورة للكلاينت
    }));

    return { success: true, categories: safeCategories };
  } catch (error: any) {
    return { error: "فشل في جلب الأقسام" };
  }
}

// 2. تحديث الإنشاء (نستقبل الـ image)
export async function createCategory(data: {
  name: string;
  slug: string;
  image?: string;
}) {
  try {
    await dbConnect();
    await Category.create(data);
    revalidatePath("/");
    revalidatePath("/admin/categories");

    return { success: true };
  } catch (error: any) {
    return { error: "فشل في إضافة القسم" };
  }
}

// 3. تحديث التعديل (نستقبل الـ image)
export async function updateCategory(
  id: string,
  data: { name: string; slug: string; image?: string },
) {
  try {
    await dbConnect();
    await Category.findByIdAndUpdate(id, data);
    revalidatePath("/");
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    return { error: "فشل في تعديل القسم" };
  }
}
