import { MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function FloatingWhatsApp() {
  const location = useLocation();

  // Hide on virtual studio to avoid covering shade palettes
  const isStudioPage = ['/virtual-studio', '/beauty-studio', '/blindglow-ai', '/ai-glow'].some(p => location.pathname.startsWith(p));
  if (isStudioPage) return null;

  const handleWhatsAppClick = () => {
    const phoneNumber = '919887196182';
    const message = encodeURIComponent('Hello! I would like to inquire about your beauty services.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      aria-label="WhatsApp Support"
      className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-50 w-12 h-12 sm:w-14 sm:h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
    >
      <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
      
      {/* Pulse Ring */}
      <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
      
      {/* Tooltip */}
      <div className="absolute -top-10 left-0 bg-black/80 text-white text-xs px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        WhatsApp Support
      </div>
    </button>
  );
}
