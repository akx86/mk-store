/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getProductById(id: string) {
  try {
    await dbConnect();

    const product = await Product.findOne({
      _id: id,
      isHidden: { $ne: true },
    })
      .populate("category", "name slug")
      .lean();

    if (!product) return { error: "المنتج غير موجود" };

    return { success: true, product };
  } catch (error: any) {
    return { error: "حدث خطأ أثناء جلب تفاصيل المنتج" };
  }
}
export async function getProductsByCategorySlug(slug: string) {
  try {
    await dbConnect();

    const category = await Category.findOne({ slug }).lean();

    if (!category) {
      return { error: "القسم غير موجود" };
    }

    const products = await Product.find({
      category: category._id,
      isHidden: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .populate("category", "name slug")
      .lean();

    return { success: true, categoryName: category.name, products };
  } catch (error: any) {
    return { error: "حدث خطأ أثناء جلب المنتجات" };
  }
}

export async function getShopData(
  page: number = 1,
  search: string = "",
  categoryId: string = "",
) {
  try {
    await dbConnect();
    const limit = 10;
    const skip = (page - 1) * limit;

    const query: any = {};
    query.isHidden = { $ne: true };
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (categoryId) {
      query.category = categoryId;
    }

    const [categories, products, totalProducts] = await Promise.all([
      Category.find({}).lean(),
      Product.find(query)
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    const session = await getServerSession(authOptions);
    const isMerchant = session?.user?.role === "MERCHANT";

    const safeCategories = categories.map((c: any) => ({
      _id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      image: c.image || "",
    }));

    const safeProducts = products.map((p: any) => ({
      _id: p._id.toString(),
      title: p.title,
      images: p.images || [],
      category: p.category?.name || "",
      price: isMerchant ? p.wholesalePrice : p.retailPrice,
      isWholesale: isMerchant,
    }));

    return {
      success: true,
      categories: safeCategories,
      products: safeProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
    };
  } catch (error: any) {
    return { error: "حدث خطأ أثناء جلب البيانات" };
  }
}
