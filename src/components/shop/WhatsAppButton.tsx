"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  productTitle: string;
  phoneNumber: string;
}

export default function WhatsAppButton({
  productTitle,
  phoneNumber,
}: WhatsAppButtonProps) {
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const handleWhatsAppClick = () => {
    const message = `السلام عليكم، أريد الاستفسار عن هذا المنتج:\n*${productTitle}*\n\nرابط المنتج: ${currentUrl}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      // 🎨 Cyberpunk Neon Green Button
      className="relative w-full flex items-center justify-center gap-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 font-bold py-4 px-6 rounded-xl border border-green-500/30 hover:border-green-400/60 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-300 group overflow-hidden"
    >
      {/* تأثير إضاءة خفيف بيتحرك جوه الزرار */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-green-400/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>

      <MessageCircle
        size={24}
        className="group-hover:scale-110 transition-transform duration-300"
      />
      <span className="text-lg tracking-wide z-10">طلب عبر واتساب</span>
    </button>
  );
}
