import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Flame, Clock, Check, ArrowRight, ShieldCheck,
  Gift, Heart, Copy, Star, CheckCircle2, Award, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';

export interface DiwaliFreeGift {
  title: string;
  worth: string;
  items: string[];
}

export interface DiwaliOfferItem {
  id: string;
  ribbonText: string;
  discount: string;
  titleLine1: string;
  titleLine2: string;
  price: string;
  originalPrice: string;
  duration: string;
  sanitized: string;
  image: string;
  type: 'doorstep' | 'mehndi';
  features: string[];
  freeGift: DiwaliFreeGift;
}

export function DiwaliLanding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [copiedCode, setCopiedCode] = useState(false);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);

  const copyCoupon = () => {
    navigator.clipboard.writeText('SHUBHGLOW');
    setCopiedCode(true);
    toast({
      title: 'Diwali VIP Code Copied! 🪔',
      description: 'Use code SHUBHGLOW at checkout for Flat 40% OFF + Complimentary Gold Kit.',
    });
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleBookService = async (offer: DiwaliOfferItem) => {
    setBookingLoading(offer.id);

    const parsedPrice = parseInt(offer.price.replace(/[^\d]/g, ''), 10) || 1299;
    const parsedOriginalPrice = parseInt(offer.originalPrice.replace(/[^\d]/g, ''), 10) || 2199;
    const parsedDuration = parseInt(offer.duration.replace(/[^\d]/g, ''), 10) || 75;

    // 1. Build the Diwali Cart Item
    const diwaliItem = {
      id: `diwali-${offer.id}`,
      service_id: offer.id,
      quantity: 1,
      user_id: user?.id || 'guest',
      created_at: new Date().toISOString(),
      service: {
        id: offer.id,
        name: `${offer.titleLine1} ${offer.titleLine2}`,
        category: offer.type === 'mehndi' ? 'Bridal & Arabic Mehndi' : 'Diwali Mahotsav Special',
        price: parsedPrice,
        original_price: parsedOriginalPrice,
        duration_minutes: parsedDuration,
        image_url: offer.image,
        description: `${offer.features.join(' • ')} + Includes Free ${offer.freeGift.title} (Worth ${offer.freeGift.worth})`,
        available: true,
      },
      isDiwaliPackage: true,
      freeGift: {
        title: offer.freeGift.title,
        worth: offer.freeGift.worth,
        items: offer.freeGift.items,
      }
    };

    // 2. Save Free Gift metadata in localStorage
    try {
      const giftData = {
        offerId: offer.id,
        offerName: `${offer.titleLine1} ${offer.titleLine2}`,
        freeGiftTitle: offer.freeGift.title,
        freeGiftValue: offer.freeGift.worth,
        items: offer.freeGift.items,
        packagePrice: parsedPrice,
        packageOriginalPrice: parsedOriginalPrice,
        packageImage: offer.image,
        packageType: offer.type,
        addedAt: new Date().toISOString()
      };
      localStorage.setItem('blindglow_diwali_free_gift', JSON.stringify(giftData));
    } catch (e) {
      console.warn('Failed to save free gift:', e);
    }

    // 3. Save into local cart storage (bulletproof for guests & logged-in users alike)
    const storageKey = offer.type === 'mehndi' ? 'satguru_local_mehndi_cart' : 'satguru_local_cart';
    try {
      const existingRaw = localStorage.getItem(storageKey);
      let currentItems: any[] = existingRaw ? JSON.parse(existingRaw) : [];
      const foundIdx = currentItems.findIndex((it) => it.service_id === offer.id || it.id === `diwali-${offer.id}`);
      if (foundIdx >= 0) {
        currentItems[foundIdx].quantity = (currentItems[foundIdx].quantity || 1) + 1;
      } else {
        currentItems.push(diwaliItem);
      }
      localStorage.setItem(storageKey, JSON.stringify(currentItems));
      window.dispatchEvent(new Event('satguru_cart_updated'));
    } catch (e) {
      console.warn('Local cart storage error:', e);
    }

    // 4. Background Supabase Sync if logged in
    if (user) {
      try {
        if (offer.type === 'mehndi') {
          await supabase.from('mehndi_cart_items').insert({
            user_id: user.id,
            service_id: 'm-bridal-royal',
            quantity: 1,
          });
        } else {
          await supabase.from('cart_items').insert({
            user_id: user.id,
            service_id: 'ds-hydra-glow',
            quantity: 1,
          });
        }
      } catch {
        // Silently handled by local storage fallback
      }
    }

    // 5. Success toast and instant navigation to the respective cart
    toast({
      title: 'Diwali Package Added to Cart! 🪔',
      description: `${offer.titleLine1} ${offer.titleLine2} + Your FREE ${offer.freeGift.title} (Worth ${offer.freeGift.worth}) added at ₹0!`,
    });

    setBookingLoading(null);
    if (offer.type === 'mehndi') {
      navigate('/mehndi-cart');
    } else {
      navigate('/cart');
    }
  };

  const categories = [
    {
      id: 'cat-1',
      title: 'Glow & Grace',
      subtitle: 'Lakshmi Puja Facial',
      image: '/images/diwali/cat-glow-grace.png',
      route: '/doorstep-service',
    },
    {
      id: 'cat-2',
      title: 'Pure Henna',
      subtitle: 'Arabic Mehndi',
      image: '/images/diwali/cat-pure-henna.png',
      route: '/mehndi-service',
    },
    {
      id: 'cat-3',
      title: 'Shubh Shringar',
      subtitle: 'Festive Makeup',
      image: '/images/diwali/cat-shubh-shringar.png',
      route: '/doorstep-service',
    },
    {
      id: 'cat-4',
      title: 'Gold Radiance',
      subtitle: '24K Gold Facial',
      image: '/images/diwali/cat-gold-radiance.png',
      route: '/doorstep-service',
    },
    {
      id: 'cat-5',
      title: 'Festive Eyes',
      subtitle: 'Glamorous Eye Makeup',
      image: '/images/diwali/cat-festive-eyes.png',
      route: '/doorstep-service',
    },
  ];

  // STRICTLY 3 CARDS ONLY (as required: "don't add more card ,only new design and the offer like which you mention that is free get add in card")
  const offers: DiwaliOfferItem[] = [
    {
      id: 'offer-gold-facial',
      ribbonText: 'Most Popular',
      discount: '40% OFF',
      titleLine1: 'Lakshmi Puja',
      titleLine2: '24K Gold Facial',
      price: '₹1,299',
      originalPrice: '₹2,199',
      duration: '75 min',
      sanitized: 'Sanitized Single-use Kit',
      image: '/images/diwali/offer-gold-facial.png',
      type: 'doorstep',
      features: [
        'Pure 24K gold foil infusion & deep lymphatic massage',
        'Herbal steam exfoliation & ultrasonic blackhead clearing',
        'Certified Senior Esthetician at your doorstep',
      ],
      freeGift: {
        title: '24K Gold Face Serum & Radiance Mask Kit',
        worth: '₹499',
        items: [
          '24K Gold Radiance Face Serum (15ml)',
          'Gold Collagen Peel-Off Sheet Mask',
          'Complimentary Gold Lip Plump Pad',
        ],
      },
    },
    {
      id: 'offer-bridal-henna',
      ribbonText: 'Festive Special',
      discount: '42% OFF',
      titleLine1: 'Shubh Shringar',
      titleLine2: 'Bridal & Arabic Henna',
      price: '₹1,599',
      originalPrice: '₹2,799',
      duration: '90 min',
      sanitized: 'Organic Chemical-Free Henna',
      image: '/images/diwali/offer-bridal-henna.png',
      type: 'mehndi',
      features: [
        '100% triple-filtered Sojat organic henna leaves',
        'Intricate royal Arabic & floral peacock motifs',
        'Dark ruby stain guarantee with clove vapor sealing',
      ],
      freeGift: {
        title: 'Organic Henna Care & Cones Kit',
        worth: '₹399',
        items: [
          '2x Handcrafted Sojat Organic Henna Cones',
          'Ayurvedic Color Intensifier Oil (20ml)',
          'Complimentary Clove Steam Treatment',
        ],
      },
    },
    {
      id: 'offer-family-makeover',
      ribbonText: 'Family Combo',
      discount: '45% OFF',
      titleLine1: 'Maha Diwali',
      titleLine2: 'Ghar-Pooja Makeover (3 Persons)',
      price: '₹3,499',
      originalPrice: '₹6,499',
      duration: '180 min',
      sanitized: '2 Senior Artists Dispatched',
      image: '/images/diwali/offer-family-makeover.png',
      type: 'doorstep',
      features: [
        'HD Festive Makeup & Hair Styling for 3 Persons',
        'Saree/Dupatta drape styling & royal bindi setting',
        'Premium MAC, Huda & Anastasia Beverly Hills cosmetics',
      ],
      freeGift: {
        title: 'Deluxe Festive Glow Hamper & Threading',
        worth: '₹999',
        items: [
          'Eyebrow & Upper Lip Threading for 3 Persons',
          'Luxury Scented Rose Face Mist (100ml)',
          'Organic Festive Ubtan & Diya Keepsake Set',
        ],
      },
    },
  ];

  return (
    <div className="min-h-screen text-[#133826] dark:text-[#F7F3EE] relative overflow-hidden select-none bg-[#FAF6EE] dark:bg-[#121015] transition-colors duration-300">
      {/* Refined Smooth Keyframes */}
      <style>{`
        @keyframes lanternSwayL {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes lanternSwayR {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-3deg); }
        }
        @keyframes diyaFlicker {
          0%, 100% {
            transform: scale(1) skewX(0deg);
            filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.95)) drop-shadow(0 0 22px rgba(234, 88, 12, 0.7));
          }
          25% {
            transform: scale(1.08, 0.94) skewX(2deg) translateY(-1px);
            filter: drop-shadow(0 0 14px rgba(251, 191, 36, 1)) drop-shadow(0 0 28px rgba(249, 115, 22, 0.85));
          }
          50% {
            transform: scale(0.95, 1.05) skewX(-2deg) translateY(-2px);
            filter: drop-shadow(0 0 9px rgba(245, 158, 11, 0.85));
          }
          75% {
            transform: scale(1.04, 0.98) skewX(1.5deg);
            filter: drop-shadow(0 0 15px rgba(253, 224, 71, 0.95)) drop-shadow(0 0 26px rgba(234, 88, 12, 0.8));
          }
        }
        @keyframes softPetalFloat {
          0% {
            transform: translateY(-20px) translateX(0) rotate(0deg);
            opacity: 0;
          }
          15% { opacity: 0.85; }
          90% { opacity: 0.85; }
          100% {
            transform: translateY(900px) translateX(65px) rotate(420deg);
            opacity: 0;
          }
        }
        @keyframes shimmerGlow {
          0%, 100% { opacity: 0.95; }
          50% { opacity: 0.75; }
        }
        .sway-lantern-left {
          animation: lanternSwayL 5s ease-in-out infinite;
          transform-origin: top center;
        }
        .sway-lantern-right {
          animation: lanternSwayR 5.5s ease-in-out infinite;
          transform-origin: top center;
        }
        .flame-live-flicker {
          animation: diyaFlicker 1.4s ease-in-out infinite;
          transform-origin: bottom center;
        }
        .petal-float-1 { animation: softPetalFloat 13s linear infinite; }
        .petal-float-2 { animation: softPetalFloat 16s linear infinite 3s; }
        .petal-float-3 { animation: softPetalFloat 11s linear infinite 5s; }
        .petal-float-4 { animation: softPetalFloat 15s linear infinite 2s; }
        .petal-float-5 { animation: softPetalFloat 18s linear infinite 7s; }
      `}</style>

      {/* Floating Rose/Lotus Petals in Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        <div className="petal-float-1 absolute left-[10%] -top-8 w-4 h-4 rounded-full bg-rose-400/65 blur-[0.5px]" />
        <div className="petal-float-2 absolute left-[32%] -top-8 w-3 h-3 rounded-full bg-rose-300/75" />
        <div className="petal-float-3 absolute left-[60%] -top-8 w-4 h-4 rounded-full bg-pink-400/70" />
        <div className="petal-float-4 absolute left-[80%] -top-8 w-3 h-3 rounded-full bg-rose-300/75" />
        <div className="petal-float-5 absolute left-[92%] -top-8 w-4.5 h-4.5 rounded-full bg-pink-400/65" />
      </div>

      {/* Warm Ambient Radial Glowing Orbs */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-amber-200/30 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full bg-rose-200/25 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[700px] h-[500px] rounded-full bg-orange-100/35 blur-[130px] pointer-events-none" />

      {/* Main Campaign Canvas Container */}
      <div className="relative max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16 z-10">

        {/* URGENCY FESTIVE BOOKING STRIP */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#8C6510] via-[#C5A059] to-[#8C6510] p-[1.5px] shadow-sm">
          <div className="bg-[#FFFDF8] dark:bg-[#1A1721] rounded-[15px] px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-600"></span>
              </span>
              <p className="text-xs sm:text-sm font-bold text-[#133826] dark:text-[#F7F3EE]">
                <span className="text-[#B82850] uppercase tracking-wide">Diwali Rush Alert:</span> 84% slots reserved for Dhanteras & Diwali Eve!
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-700/50">
              <Gift className="w-3.5 h-3.5 text-[#B82850]" />
              <span>Free Gift Included With Every Package Below</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            1. TOP MUGHAL FESTIVE ARCH & HERO SECTION
            ======================================================== */}
        <div
          className="relative w-full rounded-[40px] md:rounded-[48px] overflow-hidden border border-[#E8D9C6] dark:border-[rgba(197,160,89,0.3)] shadow-[0_20px_60px_rgba(180,120,60,0.12)] p-6 sm:p-10 md:p-12 mb-10 bg-gradient-to-b from-[#FFFDF8] via-[#FAF3E8] to-[#F7EDE1] dark:from-[#1E1925] dark:via-[#191520] dark:to-[#131018]"
        >
          {/* Detailed Mughal Arch Vector Filigree in Background */}
          <div className="absolute inset-0 pointer-events-none select-none opacity-30">
            <svg viewBox="0 0 1000 650" className="w-full h-full" preserveAspectRatio="none">
              <path
                d="M 80 650 L 80 220 Q 80 80 500 60 Q 920 80 920 220 L 920 650"
                fill="none"
                stroke="#C69A62"
                strokeWidth="1.8"
                strokeDasharray="4 6"
              />
              <path
                d="M 120 650 L 120 250 Q 120 110 500 95 Q 880 110 880 250 L 880 650"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="1.2"
              />
              {/* Scalloped Arch Crest */}
              <circle cx="500" cy="50" r="16" fill="none" stroke="#D4AF37" strokeWidth="1.5" />
              <circle cx="500" cy="50" r="6" fill="#D4AF37" />
            </svg>
          </div>

          {/* Hanging Brass Lantern Left */}
          <div className="sway-lantern-left absolute top-0 left-4 sm:left-8 z-20 pointer-events-none w-10 sm:w-14">
            <svg viewBox="0 0 60 120" className="w-full h-auto drop-shadow-lg">
              <line x1="30" y1="0" x2="30" y2="40" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="2 3" />
              <circle cx="30" cy="40" r="3" fill="#B45309" />
              <path d="M 15 48 L 30 38 L 45 48 Z" fill="#D97706" stroke="#92400E" strokeWidth="1" />
              <rect x="18" y="48" width="24" height="36" rx="3" fill="#FEF08A" opacity="0.9" stroke="#B45309" strokeWidth="1" />
              <ellipse cx="30" cy="66" rx="5" ry="9" fill="#F59E0B" className="flame-live-flicker" />
              <ellipse cx="30" cy="66" rx="2.5" ry="5" fill="#FFFFFF" />
              <path d="M 16 84 L 30 92 L 44 84 Z" fill="#D97706" />
              <circle cx="30" cy="95" r="2.5" fill="#B45309" />
            </svg>
          </div>

          {/* Hanging Brass Lantern Right */}
          <div className="sway-lantern-right absolute top-0 right-4 sm:right-8 z-20 pointer-events-none w-10 sm:w-14">
            <svg viewBox="0 0 60 120" className="w-full h-auto drop-shadow-lg">
              <line x1="30" y1="0" x2="30" y2="40" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="2 3" />
              <circle cx="30" cy="40" r="3" fill="#B45309" />
              <path d="M 15 48 L 30 38 L 45 48 Z" fill="#D97706" stroke="#92400E" strokeWidth="1" />
              <rect x="18" y="48" width="24" height="36" rx="3" fill="#FEF08A" opacity="0.9" stroke="#B45309" strokeWidth="1" />
              <ellipse cx="30" cy="66" rx="5" ry="9" fill="#F59E0B" className="flame-live-flicker" />
              <ellipse cx="30" cy="66" rx="2.5" ry="5" fill="#FFFFFF" />
              <path d="M 16 84 L 30 92 L 44 84 Z" fill="#D97706" />
              <circle cx="30" cy="95" r="2.5" fill="#B45309" />
            </svg>
          </div>

          {/* Top Center Hanging Diya */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-10 sm:w-12">
            <svg viewBox="0 0 50 60" className="w-full h-auto drop-shadow-md">
              <line x1="25" y1="0" x2="25" y2="28" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="2 2" />
              <g className="flame-live-flicker" transform="translate(25, 26)">
                <path d="M 0 16 C -6 11 -6 5 0 0 C 6 5 6 11 0 16 Z" fill="#EA580C" />
                <path d="M 0 14 C -3 9 -3 4 0 1 C 3 4 3 9 0 14 Z" fill="#FDE047" />
                <ellipse cx="0" cy="11" rx="1" ry="2" fill="#FFFFFF" />
              </g>
              <path d="M 10 38 C 10 50 40 50 40 38 Z" fill="#D97706" stroke="#B45309" strokeWidth="1" />
              <ellipse cx="25" cy="38" rx="15" ry="3" fill="#92400E" />
            </svg>
          </div>

          {/* Brand Logo Row */}
          <div className="relative z-10 flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-100 to-amber-200 border border-amber-400/50 flex items-center justify-center shadow-xs">
                <svg viewBox="0 0 40 40" className="w-5 h-5">
                  <path d="M 20 6 C 24 16 28 22 20 34 C 12 22 16 16 20 6 Z" fill="#D97706" />
                  <path d="M 20 14 C 28 18 34 26 26 34 C 20 30 20 22 20 14 Z" fill="#F59E0B" opacity="0.85" />
                  <path d="M 20 14 C 12 18 6 26 14 34 C 20 30 20 22 20 14 Z" fill="#F59E0B" opacity="0.85" />
                </svg>
              </div>

              <div className="text-left">
                <span
                  className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#133826] block leading-none"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  BlindGlow
                </span>
                <span className="text-[10px] tracking-[0.22em] uppercase text-[#8C776B] font-semibold block mt-1">
                  — by Satguru —
                </span>
              </div>
            </div>

            {/* Shubh Coupon Pill Button */}
            <div
              onClick={copyCoupon}
              className="cursor-pointer group flex items-center gap-2 px-4 py-2 rounded-full bg-white/85 hover:bg-white border border-[#E8D9C5] shadow-xs hover:border-[#C83E68] transition-all text-xs text-[#133826]"
            >
              <Gift className="w-4 h-4 text-[#C83E68]" />
              <span className="text-[11px] text-[#8C776B] hidden sm:inline">Use Code:</span>
              <span className="font-mono text-xs font-bold text-[#C83E68] bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
                SHUBHGLOW
              </span>
              {copiedCode ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-[#8C776B] group-hover:text-[#C83E68]" />
              )}
            </div>
          </div>

          {/* Hero Grid: Left Indian Beauty with Lit Diya | Right Headline */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">

            {/* Left: Indian Beauty holding Glowing Diya */}
            <div className="lg:col-span-5 flex items-center justify-center relative">
              <div className="relative w-72 sm:w-80 md:w-88">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-300/40 via-yellow-200/50 to-rose-200/35 blur-3xl pointer-events-none transform scale-110" />

                <div className="relative rounded-[32px] overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] bg-[#FDF4E7]">
                  <img
                    src="/images/diwali/girl-holding-diya-hd.png?v=clean2026"
                    alt="Indian woman holding glowing diya in celebration of Diwali"
                    className="w-full h-full object-cover object-center transform hover:scale-103 transition-transform duration-700"
                  />
                  <div className="absolute top-[68%] left-[78%] -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-amber-400/40 blur-md pointer-events-none animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Right: Campaign Headline & Content */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-4 sm:space-y-5">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 border border-amber-400/70 shadow-xs">
                <Flame className="w-3.5 h-3.5 text-amber-700 fill-amber-700 animate-pulse" />
                <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-amber-950">
                  BlindGlow Diwali Mahotsav 2026
                </span>
                <Flame className="w-3.5 h-3.5 text-amber-700 fill-amber-700 animate-pulse" />
              </div>

              <div>
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-[#133826] leading-[1.1] tracking-tight"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Illuminate Your
                  <span className="block mt-1 font-serif text-[#133826]">
                    Radiance This
                  </span>
                </h1>

                <div className="mt-1 sm:mt-2">
                  <span
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.6rem] font-normal leading-none tracking-normal inline-block"
                    style={{
                      fontFamily: "'Playfair Display', 'Brush Script MT', Georgia, cursive",
                      fontStyle: 'italic',
                      color: '#B82850',
                      textShadow: '0 4px 20px rgba(184, 40, 80, 0.22)',
                    }}
                  >
                    Diwali
                  </span>
                </div>
              </div>

              <p className="text-sm sm:text-base md:text-lg text-[#3D5647] font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Welcome Goddess Lakshmi with radiant salon skin, couture bridal henna, and guaranteed complimentary festive gifts delivered to your doorstep.
              </p>

              <div className="flex items-center justify-center lg:justify-start gap-2.5 pt-1">
                <div className="h-[1px] w-14 bg-gradient-to-r from-transparent via-amber-400 to-amber-500" />
                <Sparkles className="w-4 h-4 text-amber-600" />
                <div className="h-[1px] w-14 bg-gradient-to-l from-transparent via-amber-400 to-amber-500" />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. FIVE BEAUTY CATEGORY TILES ROW
            ======================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-10">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(cat.route)}
              className="group p-3 rounded-2xl bg-white border border-[#E8D9C5] shadow-xs hover:shadow-md hover:border-[#C83E68] transition-all duration-300 cursor-pointer flex flex-col items-center text-center hover:-translate-y-1"
            >
              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#FAF2EA] mb-2.5 border border-[#F0E2D2]">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                />
              </div>

              <h3
                className="text-xs sm:text-sm font-bold text-[#133826] group-hover:text-[#B82850] transition-colors leading-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {cat.title}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-[#6B5A51] mt-0.5 font-medium leading-tight">
                {cat.subtitle}
              </p>
            </div>
          ))}
        </div>

        {/* ========================================================
            3. EXACTLY THREE FESTIVE OFFER CARDS WITH FREE GIFT INCLUDED
            (STRICT REQUIREMENT: NO EXTRA CARDS, FREE GIFT CLEARLY IN CARD)
            ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-stretch">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="group relative rounded-[28px] overflow-hidden bg-white border-2 border-[#E8D9C5] hover:border-[#D4AF37] shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5"
            >
              {/* Top Golden Curved Ribbon Banner */}
              <div className="absolute top-0 inset-x-0 z-20 flex justify-center pointer-events-none">
                <div
                  className="px-5 py-1.5 rounded-b-xl shadow-xs border-x border-b border-amber-400/60 flex items-center gap-1.5 text-xs font-bold text-amber-950 uppercase tracking-wider"
                  style={{
                    background: 'linear-gradient(180deg, #FDE68A 0%, #F59E0B 100%)',
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-950" />
                  <span>{offer.ribbonText}</span>
                </div>
              </div>

              {/* Service Photography with Metallic Gold Discount Seal */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#FBF2E6]">
                <img
                  src={offer.image}
                  alt={`${offer.titleLine1} ${offer.titleLine2}`}
                  className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700"
                />

                {/* Circular Metallic Gold Discount Seal */}
                <div className="absolute bottom-3 right-3 z-10">
                  <div
                    className="w-13 h-13 sm:w-14 sm:h-14 rounded-full flex flex-col items-center justify-center text-center shadow-lg border border-amber-300"
                    style={{
                      background: 'radial-gradient(circle at 35% 30%, #FEF08A 0%, #F59E0B 75%, #B45309 100%)',
                    }}
                  >
                    <span className="text-xs sm:text-sm font-black text-amber-950 leading-none">
                      {offer.discount.split(' ')[0]}
                    </span>
                    <span className="text-[9px] font-black uppercase text-amber-950/80 leading-none">
                      OFF
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  {/* Title & Price Header */}
                  <div className="text-center">
                    <h3
                      className="text-lg sm:text-xl font-bold text-[#133826] leading-tight"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      <span>{offer.titleLine1}</span>
                      <span className="block text-[#B82850]">{offer.titleLine2}</span>
                    </h3>

                    {/* Pricing */}
                    <div className="mt-2.5 flex items-baseline justify-center gap-2">
                      <span className="text-2xl sm:text-3xl font-black text-[#14532D] tracking-tight">
                        {offer.price}
                      </span>
                      <span className="text-sm font-medium text-[#7C8B82] line-through">
                        {offer.originalPrice}
                      </span>
                    </div>

                    {/* Sanitized kit & duration info */}
                    <div className="mt-2 flex items-center justify-center gap-2 text-xs font-medium text-[#5A6D61]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#14532D]" />
                        {offer.duration}
                      </span>
                      <span className="text-[#C2D1C8]">|</span>
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#14532D]" />
                        {offer.sanitized}
                      </span>
                    </div>
                  </div>

                  {/* Feature Highlights */}
                  <div className="mt-3.5 pt-3 border-t border-[#F0E4D3] space-y-1.5 text-left">
                    {offer.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11.5px] text-[#3D5647]">
                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0 stroke-[2.5]" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* ========================================================
                      PROMINENT COMPLIMENTARY FREE GIFT CALLOUT IN CARD
                      ======================================================== */}
                  <div className="mt-4 rounded-2xl p-3.5 bg-gradient-to-br from-[#FFF9EE] via-[#FFF3D6] to-[#FFEAB8] border-2 border-dashed border-[#D4AF37] shadow-xs relative">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-950 bg-amber-300/90 px-2 py-0.5 rounded-full border border-amber-400">
                        <Gift className="w-3 h-3 text-amber-900 animate-bounce" />
                        Free Gift Included
                      </span>
                      <span className="text-[11px] font-extrabold text-[#14532D] bg-[#DCFCE7] px-2 py-0.5 rounded-md border border-[#86EFAC]">
                        Worth {offer.freeGift.worth} • FREE
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-amber-950 text-left leading-snug">
                      🎁 {offer.freeGift.title}
                    </h4>

                    <div className="mt-2 space-y-1 text-left">
                      {offer.freeGift.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-center gap-1.5 text-[11px] text-amber-900">
                          <CheckCircle2 className="w-3 h-3 text-amber-700 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-amber-300/70 flex items-center justify-between text-[10px] font-semibold text-amber-950">
                      <span>✓ Automatically packed &amp; delivered at ₹0</span>
                      <span className="text-emerald-700 font-bold">Claimed in Cart</span>
                    </div>
                  </div>
                </div>

                {/* Rose-Ruby Rounded Booking Button */}
                <div className="pt-2">
                  <Button
                    onClick={() => handleBookService(offer)}
                    disabled={bookingLoading === offer.id}
                    className="w-full h-11 rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase text-white shadow-md transition-all duration-300 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2 cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #B82850 0%, #991B3A 100%)',
                      boxShadow: '0 6px 18px -4px rgba(184, 40, 80, 0.4)',
                    }}
                  >
                    <span>{bookingLoading === offer.id ? 'Reserving Slot…' : 'Book Package + Free Gift'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ========================================================
            4. BOTTOM BENEFITS STRIP WITH CORNER LOTUSES
            ======================================================== */}
        <div className="relative">
          {/* Corner Pink Lotus - Left */}
          <div className="absolute -left-3 -bottom-2 z-20 pointer-events-none w-14 sm:w-20">
            <svg viewBox="0 0 100 80" className="w-full h-auto drop-shadow-md">
              <path d="M 50 15 C 40 35 30 50 50 65 C 70 50 60 35 50 15 Z" fill="#F43F5E" />
              <path d="M 50 25 C 32 38 18 50 35 68 C 45 62 48 45 50 25 Z" fill="#FB7185" />
              <path d="M 50 25 C 68 38 82 50 65 68 C 55 62 52 45 50 25 Z" fill="#FB7185" />
              <path d="M 50 35 C 22 45 10 60 25 72 C 38 68 45 52 50 35 Z" fill="#FDA4AF" />
              <path d="M 50 35 C 78 45 90 60 75 72 C 62 68 55 52 50 35 Z" fill="#FDA4AF" />
              <ellipse cx="50" cy="68" rx="8" ry="4" fill="#E11D48" />
            </svg>
          </div>

          {/* Corner Pink Lotus - Right */}
          <div className="absolute -right-3 -bottom-2 z-20 pointer-events-none w-14 sm:w-20">
            <svg viewBox="0 0 100 80" className="w-full h-auto drop-shadow-md">
              <path d="M 50 15 C 40 35 30 50 50 65 C 70 50 60 35 50 15 Z" fill="#F43F5E" />
              <path d="M 50 25 C 32 38 18 50 35 68 C 45 62 48 45 50 25 Z" fill="#FB7185" />
              <path d="M 50 25 C 68 38 82 50 65 68 C 55 62 52 45 50 25 Z" fill="#FB7185" />
              <path d="M 50 35 C 22 45 10 60 25 72 C 38 68 45 52 50 35 Z" fill="#FDA4AF" />
              <path d="M 50 35 C 78 45 90 60 75 72 C 62 68 55 52 50 35 Z" fill="#FDA4AF" />
              <ellipse cx="50" cy="68" rx="8" ry="4" fill="#E11D48" />
            </svg>
          </div>

          {/* Benefits Box */}
          <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-6 bg-white border border-[#E8D9C5] shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-center text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-[#B82850] flex-shrink-0">
                <Sparkles className="w-5 h-5 fill-rose-200" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#133826]">
                Guaranteed Diwali Slot Delivery
              </span>
            </div>

            <div className="flex items-center justify-center gap-3 md:border-x md:border-[#E8D9C5] md:px-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#133826]">
                100% Safe &amp; Skin-Organic Products
              </span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-[#B82850] flex-shrink-0">
                <Heart className="w-5 h-5 fill-rose-200" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#133826]">
                Over 10,000+ Happy Home Experiences
              </span>
            </div>
          </div>
        </div>

        {/* Golden Rangoli Mandala Ornament */}
        <div className="mt-8 flex justify-center opacity-40 select-none pointer-events-none">
          <svg width="200" height="44" viewBox="0 0 200 44" fill="none">
            <path d="M 0 22 Q 50 6 100 22 Q 150 38 200 22" stroke="#C69A62" strokeWidth="1.2" />
            <circle cx="100" cy="22" r="5" fill="#C69A62" />
            <circle cx="75" cy="20" r="3" fill="#C69A62" />
            <circle cx="125" cy="20" r="3" fill="#C69A62" />
            <circle cx="50" cy="18" r="2" fill="#C69A62" />
            <circle cx="150" cy="18" r="2" fill="#C69A62" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default DiwaliLanding;
