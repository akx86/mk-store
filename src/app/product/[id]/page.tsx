import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductById } from "@/actions/shop.actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import WhatsAppButton from "@/components/shop/WhatsAppButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const res = await getProductById(params.id);
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
    // 🎨 Clean Cyberpunk Background للصفحة بالكامل
    <div
      className="min-h-screen bg-[#050505] py-8 md:py-12 selection:bg-cyan-500/30 text-slate-200"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* الحاوية الرئيسية للمنتج */}
        <div className="bg-[#0a0a0a] rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col md:flex-row relative group">
          {/* تأثير Glow خلفي خفيف للحاوية */}
          <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500/10 to-purple-600/10 blur-2xl z-0 pointer-events-none"></div>

          {/* 📱 قسم الصور (اليمين) */}
          <div className="w-full md:w-1/2 bg-slate-900/50 relative aspect-square md:aspect-auto p-8 flex items-center justify-center border-b md:border-b-0 md:border-l border-slate-800/80 z-10">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-contain p-6 drop-shadow-[0_0_25px_rgba(255,255,255,0.05)] hover:scale-105 transition-transform duration-500"
                priority
              />
            ) : (
              <div className="text-slate-600 font-medium tracking-widest uppercase flex flex-col items-center gap-2">
                <span className="text-4xl">📵</span>
                <span>لا توجد صورة</span>
              </div>
            )}
          </div>

          {/* 📝 قسم التفاصيل (اليسار) */}
          <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col z-10 bg-gradient-to-b from-[#0a0a0a] to-[#050505]">
            {/* البادج الخاص بالقسم */}
            <div className="mb-4">
              <span className="inline-block bg-cyan-500/10 text-cyan-400 text-xs font-bold px-4 py-1.5 rounded-full border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                {product.category?.name || "عام"}
              </span>
            </div>

            {/* عنوان المنتج */}
            <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 mb-6 leading-tight">
              {product.title}
            </h1>

            {/* منطقة السعر */}
            <div className="mb-8 pb-8 border-b border-slate-800/80">
              <div className="flex items-end gap-2">
                <span className="text-4xl md:text-5xl font-black text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  {displayPrice}
                </span>
                <span className="text-lg font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  EGP
                </span>
              </div>

              {/* رسالة التاجر (تأثير Cyberpunk Purple) */}
              {isMerchant && (
                <div className="mt-4 inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                  <span className="text-purple-400 text-sm font-bold">
                    ⚡ سعر الجملة مفعل لحسابك
                  </span>
                </div>
              )}
            </div>

            {/* الوصف */}
            <div className="flex-1 mb-8">
              <h3 className="font-bold text-slate-300 mb-3 text-lg border-b border-slate-800 pb-2 inline-block">
                المواصفات والتفاصيل
              </h3>
              <p className="text-slate-400 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                {product.description}
              </p>
            </div>

            {/* الإنتجريشن مع واتساب */}
            <div className="mt-auto pt-6 border-t border-slate-800/80">
              <WhatsAppButton
                productTitle={product.title}
                phoneNumber={WHATSAPP_NUMBER}
              />
              <p className="text-center text-xs text-slate-500 mt-4 font-medium">
                سيتم تحويلك إلى واتساب في نافذة آمنة 🔒
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
