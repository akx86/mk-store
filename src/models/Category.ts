import mongoose, { Document, Schema } from "mongoose";

// 1. تعريف الـ Interface الخاص بـ TypeScript
export interface ICategory extends Document {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2. بناء الـ Schema
const CategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, default: "" },
  },
  { timestamps: true }, // بيضيف createdAt و updatedAt تلقائياً
);

// 3. التصدير مع حل مشكلة الـ Hot Reloading
const Category =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
