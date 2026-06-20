import NextAuth, { AuthOptions, DefaultSession, DefaultUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { DefaultJWT } from "next-auth/jwt";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";

// 1. تمديد أنواع TypeScript عشان تفهم الـ role والـ id
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
  interface User extends DefaultUser {
    id: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
  }
}

// 2. إعدادات NextAuth
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1. التحقق الأساسي من وجود البيانات
        if (!credentials?.email || !credentials?.password) {
          throw new Error("البريد الإلكتروني وكلمة المرور مطلوبان");
        }

        // 2. فتح الاتصال بقاعدة البيانات
        await dbConnect();

        // 3. البحث عن المستخدم
        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("لا يوجد حساب مسجل بهذا البريد الإلكتروني");
        }

        // 4. مقارنة كلمة المرور
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) {
          throw new Error("كلمة المرور غير صحيحة");
        }

        // 5. إرجاع بيانات المستخدم (نقطة حاسمة في توافق الأنواع)
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // 1. عند تسجيل الدخول لأول مرة
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }

      // 2. المزامنة اللحظية (Real-time Sync)
      // في كل مرة الـ Middleware أو الـ Client بيطلب الـ Session، هنشيك على الرتبة من الداتابيز
      if (token?.email) {
        try {
          await dbConnect();
          const dbUser = await User.findOne({ email: token.email }).lean();
          if (dbUser) {
            token.role = dbUser.role; // تحديث الرتبة في التوكن لو اتغيرت
          }
        } catch (error) {
          console.error("JWT Sync Error:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // هنبني صفحة تسجيل الدخول قدام
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET, // لازم تضيف ده في ملف .env
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
