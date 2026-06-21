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
      // 🎨 Premium Solid Button (Trustworthy & Clean)
      className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
    >
      <MessageCircle
        size={24}
        className="group-hover:scale-110 transition-transform duration-300"
      />
      <span className="text-lg tracking-wide">طلب عبر واتساب</span>
    </button>
  );
}
