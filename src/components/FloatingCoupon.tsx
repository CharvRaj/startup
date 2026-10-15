import { useState, useEffect } from 'react';
import { X, Gift, Sparkles } from 'lucide-react';

export function FloatingCoupon() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenCoupon = localStorage.getItem('coupon_seen');

    if (hasSeenCoupon) return; // ❌ Already shown once → never show again

    const timer = setTimeout(() => {
      setIsVisible(true);
      localStorage.setItem('coupon_seen', 'true'); // ✅ mark as shown
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('coupon_seen', 'true'); // ✅ ensure never again
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('SAVE25');

    const copyNotification = document.createElement('div');
    copyNotification.className =
      'fixed top-24 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[100]';
    copyNotification.innerHTML =
      '✅ Coupon code SAVE25 copied! Apply at checkout for 25% off';

    document.body.appendChild(copyNotification);

    setTimeout(() => {
      copyNotification.remove();
    }, 3000);

    handleClose();
  };

  if (!isVisible) return null;

  return (
        <div className="fixed bottom-24 right-4 md:right-8 z-50 w-80 md:w-96 animate-slide-left">
          <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 rounded-2xl shadow-2xl overflow-hidden">

            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 bg-white/20 rounded-full p-1.5 z-10"
            >
              <X className="text-white" size={18} />
            </button>

            <div className="p-6 text-white relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <Gift size={28} />
                </div>
                <div>
                  <p className="text-sm">Special Offer</p>
                  <h3 className="text-2xl font-bold">SAVE 25%</h3>
                </div>
              </div>

              <p className="text-sm mb-4">
                Apply coupon & get instant discount on all services
              </p>

              <div
                onClick={handleCopy}
                className="bg-white text-purple-600 rounded-xl p-4 cursor-pointer flex justify-between items-center"
              >
                <div>
                  <p className="text-xs uppercase">Coupon Code</p>
                  <p className="text-2xl font-bold">SAVE25</p>
                </div>
                <span className="font-semibold">COPY</span>
              </div>

              <p className="text-xs mt-3 text-center opacity-90">
                Valid on doorstep & mehndi services
              </p>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400" />
          </div>
        </div>
  );
}
