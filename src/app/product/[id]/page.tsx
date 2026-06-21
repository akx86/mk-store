import { notFound } from "next/navigation";
import { getProductById } from "@/actions/shop.actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import WhatsAppButton from "@/components/shop/WhatsAppButton";
import ProductGallery from "@/components/shop/ProductGallery"; // 🌟 استيراد مكون معرض الصور المشترك

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const res = await getProductById(resolvedParams.id);
  const product = res.product;

  if (!product) {
    return { title: "منتج غير موجود | MK Store" };
  }

  return {
    title: `${product.title} | MK Store`,
    description: `اكتشف مواصفات وسعر ${product.title}`,
    openGraph: {
      title: product.title,
      description: `اطلب ${product.title} الآن من MK Store`,
      images: product.images?.[0] ? [product.images[0]] : ["/logo.jpeg"],
      type: "article",
    },
  };
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  const res = await getProductById(productId);
  if (!res.success || !res.product) {
    notFound();
  }

  const product = res.product;

  const session = await getServerSession(authOptions);
  const isMerchant = session?.user?.role === "MERCHANT";
  const displayPrice = isMerchant
    ? product.wholesalePrice
    : product.retailPrice;

  // 🔴 رقم الواتساب
  const WHATSAPP_NUMBER = "201272167809";

  return (
    // 🎨 Premium Minimalist Muted Theme (Apple/Zara Style)
    <div
      className="min-h-screen bg-[#f5f5f7] py-8 md:py-12 selection:bg-slate-300 selection:text-slate-900 text-slate-900"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* الحاوية الرئيسية للمنتج (أبيض نقي وظل ناعم) */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row relative group">
          {/* 📱 قسم الصور (اليمين - تم استبداله بمعرض الصور التفاعلي الجديد) */}
          {/* تم تغيير items-center إلى items-start ليعطي سكرول انسيابي متناسق مع نزول الصور الصغيرة لأسفل */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex items-start justify-center border-b md:border-b-0 md:border-l border-slate-100 z-10">
            <ProductGallery
              images={product.images || []}
              title={product.title}
            />
          </div>

          {/* 📝 قسم التفاصيل (اليسار - أبيض صريح) */}
          <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col z-10 bg-white">
            {/* البادج الخاص بالقسم */}
            <div className="mb-4">
              <span className="inline-block bg-slate-100 text-slate-600 text-xs font-bold px-4 py-1.5 rounded-full border border-slate-200">
                {product.category?.name || "عام"}
              </span>
            </div>

            {/* عنوان المنتج */}
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
              {product.title}
            </h1>

            {/* منطقة السعر */}
            <div className="mb-6">
              <div className="flex items-end gap-2">
                <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                  {displayPrice}
                </span>
                <span className="text-lg font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  EGP
                </span>
              </div>

              {/* رسالة التاجر (Premium Black Badge) */}
              {isMerchant && (
                <div className="mt-4 inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl shadow-sm">
                  <span className="text-white text-sm font-bold tracking-wide">
                    ⚡ سعر الجملة مفعل لحسابك
                  </span>
                </div>
              )}
            </div>

            {/* الخط الفاصل النظيف */}
            <hr className="border-slate-200 mb-6" />

            {/* الوصف */}
            <div className="flex-1 mb-8">
              <h3 className="font-bold text-slate-900 mb-4 text-lg">
                المواصفات والتفاصيل
              </h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm md:text-base font-medium">
                {product.description}
              </p>
            </div>

            {/* الإنتجريشن مع واتساب */}
            <div className="mt-auto pt-6 border-t border-slate-100">
              <WhatsAppButton
                productTitle={product.title}
                phoneNumber={WHATSAPP_NUMBER}
              />
              <p className="text-center text-xs text-slate-400 mt-4 font-semibold">
                سيتم تحويلك إلى واتساب في نافذة آمنة 🔒
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
