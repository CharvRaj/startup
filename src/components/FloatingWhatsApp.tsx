import { MessageCircle } from 'lucide-react';

export function FloatingWhatsApp() {
  const handleWhatsAppClick = () => {
    const phoneNumber = '919887196182';
    const message = encodeURIComponent('Hello! I would like to inquire about your beauty services.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 left-6 z-50 w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform group"
    >
      <MessageCircle className="w-8 h-8 text-white" />
      
      {/* Pulse Ring */}
      <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
      
      {/* Tooltip */}
      <div className="absolute -top-12 left-0 bg-black/80 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        WhatsApp Support
      </div>
    </button>
  );
}
