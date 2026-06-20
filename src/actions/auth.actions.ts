/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface MerchantRegistrationData {
  name: string;
  email: string;
  password: string;
  storeName: string;
  phoneNumber: string;
  storeAddress: string;
}

export async function registerMerchant(data: MerchantRegistrationData) {
  try {
    await dbConnect();

    const { name, email, password, storeName, phoneNumber, storeAddress } =
      data;

    if (
      !name ||
      !email ||
      !password ||
      !storeName ||
      !phoneNumber ||
      !storeAddress
    ) {
      throw new Error("جميع الحقول مطلوبة");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("البريد الإلكتروني مسجل بالفعل");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "PENDING_MERCHANT",
      storeName,
      phoneNumber,
      storeAddress,
    });

    try {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: "mkmobile8561@gmail.com",
        subject: "🚨 طلب تسجيل تاجر جديد",
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; color: #333;">
            <h2>طلب تسجيل تاجر جديد</h2>
            <p>يوجد تاجر جديد في انتظار مراجعتك واعتمادك في لوحة التحكم:</p>
            <ul>
              <li><strong>اسم التاجر:</strong> ${name}</li>
              <li><strong>اسم المحل:</strong> ${storeName}</li>
              <li><strong>رقم الهاتف:</strong> ${phoneNumber}</li>
              <li><strong>العنوان:</strong> ${storeAddress}</li>
            </ul>
            <p style="margin-top: 20px;">قم بتسجيل الدخول كأدمن للموافقة عليه.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Resend Email Error:", emailError);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Registration Error:", error);
    return { error: error.message || "حدث خطأ أثناء تسجيل الحساب" };
  }
}
