import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage =
      req.nextUrl.pathname.startsWith("/login") ||
      req.nextUrl.pathname.startsWith("/register");
    const isAdminPage = req.nextUrl.pathname.startsWith("/admin");

    // لو اليوزر رايح لصفحة تسجيل الدخول وهو أصلاً مسجل، نرجعه الرئيسية
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // لو اليوزر بيحاول يدخل لوحة التحكم وهو مش أدمن
    if (isAdminPage) {
      if (!isAuth) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url)); // نطرده للرئيسية
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // الـ Middleware هيشتغل بس لو الدالة دي رجعت true
      // بنخليها ترجع true دايماً عشان اللوجيك اللي فوق يشتغل براحته
      authorized: () => true,
    },
  },
);

// تحديد المسارات اللي الـ Middleware هيراقبها
export const config = {
  matcher: ["/admin/:path*", "/login", "/register"],
};
