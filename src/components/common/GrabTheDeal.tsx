import React from 'react';
import { ArrowUpRight, Sparkles, Tag, Gift } from 'lucide-react';

interface GrabTheDealProps {
  section?: 'doorstep' | 'mehndi';
  onSelectDeal?: (discount: number, category?: string) => void;
}

export const GrabTheDeal: React.FC<GrabTheDealProps> = ({ section = 'doorstep', onSelectDeal }) => {
  const isMehndi = section === 'mehndi';

  const deals = [
    {
      id: 'deal-50',
      prefix: 'UP TO',
      discountNum: '50%',
      discountSuffix: 'OFF',
      highlightColor: 'text-[#a3e635]', // vibrant lime from reference
      sparkleColor: 'text-[#d9f99d]',
      subtext: isMehndi ? 'Bridal Mehndi Packages & Family Combos' : 'Full Body Glow & Cleanup Combos',
      code: isMehndi ? 'HENNA50' : 'GLOW50',
      tag: 'MEGA DEAL',
      // Forest/emerald gradient matching image 1
      gradient: 'from-[#0a2f1d] via-[#103e27] to-[#14532d]',
      glow: 'shadow-[0_12px_32px_rgba(16,185,129,0.22)]',
      border: 'border-emerald-500/25',
      discountVal: 50,
      targetCategory: isMehndi ? 'bridal' : 'cleanup',
    },
    {
      id: 'deal-30',
      prefix: 'UP TO',
      discountNum: '30%',
      discountSuffix: 'OFF',
      highlightColor: 'text-[#bef264]', // bright lime yellow from reference
      sparkleColor: 'text-[#fef08a]',
      subtext: isMehndi ? 'Arabic & Indo-Western Henna Art' : 'Hydra Facial & Premium Waxing',
      code: isMehndi ? 'ARABIC30' : 'PAMPER30',
      tag: 'TRENDING',
      // Warm sunset terracotta/crimson gradient matching image 1
      gradient: 'from-[#7c201d] via-[#991b1b] to-[#c2410c]',
      glow: 'shadow-[0_12px_32px_rgba(234,88,12,0.22)]',
      border: 'border-rose-500/25',
      discountVal: 30,
      targetCategory: isMehndi ? 'arabic' : 'facial',
    },
    {
      id: 'deal-first',
      prefix: 'FIRST TIME',
      discountNum: 'DISCOUNT',
      discountSuffix: 'FLAT ₹400 OFF',
      highlightColor: 'text-white',
      sparkleColor: 'text-sky-200',
      subtext: 'Applicable on first booking above ₹999',
      code: 'SATGURUFIRST',
      tag: 'WELCOME GIFT',
      // Royal blue/fuchsia gradient matching image 1
      gradient: 'from-[#0369a1] via-[#3730a3] to-[#86198f]',
      glow: 'shadow-[0_12px_32px_rgba(168,85,247,0.22)]',
      border: 'border-sky-400/25',
      discountVal: 20,
      targetCategory: 'all',
    },
  ];

  const handleClick = (deal: typeof deals[0]) => {
    if (onSelectDeal) {
      onSelectDeal(deal.discountVal, deal.targetCategory);
    } else {
      const catalogEl = document.getElementById('catalog-grid') || document.getElementById('services-catalog');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <section className="py-6 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl md:text-3xl font-sans font-extrabold text-stone-900 tracking-tight">
              Grab the deal
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              <Gift className="w-3 h-3 text-rose-600" />
              Limited Time
            </span>
          </div>
          <p className="text-xs md:text-sm text-stone-500 mt-0.5">
            Handpicked door-to-door luxury savings and VIP festival specials
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-stone-600 bg-stone-100/80 px-3 py-1.5 rounded-full border border-stone-200">
          <Tag className="w-3.5 h-3.5 text-rose-600" />
          <span>Auto-applied at checkout</span>
        </div>
      </div>

      {/* 3 Reference Deal Cards — matching reference image layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {deals.map((deal) => (
          <div
            key={deal.id}
            onClick={() => handleClick(deal)}
            className={`group relative overflow-hidden rounded-[26px] md:rounded-[30px] p-6 md:p-7 cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 bg-gradient-to-br ${deal.gradient} ${deal.glow} border ${deal.border} text-white flex flex-col justify-between min-h-[240px] md:min-h-[260px] select-none`}
          >
            {/* Ambient blur orbs behind */}
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-black/25 blur-xl pointer-events-none" />

            {/* Top Row: Prefix + Tag */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[11px] md:text-xs font-black tracking-[0.22em] text-white/95 uppercase">
                {deal.prefix}
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white">
                {deal.tag}
              </span>
            </div>

            {/* Center: Exact Big Discount Typography matching Image 1 */}
            <div className="relative z-10 my-auto py-2">
              {deal.id === 'deal-first' ? (
                <div>
                  <h3 className="text-3xl sm:text-4xl md:text-[2.6rem] font-black tracking-tight leading-none text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
                    {deal.discountNum}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Sparkles className="w-4 h-4 text-sky-200 animate-pulse" />
                    <span className="text-xl sm:text-2xl font-black text-sky-200">
                      {deal.discountSuffix}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Sparkles className={`w-4 h-4 md:w-5 md:h-5 ${deal.sparkleColor} animate-pulse`} />
                    <span
                      className={`text-4xl sm:text-5xl md:text-[3.4rem] font-black tracking-tight leading-none ${deal.highlightColor} drop-shadow-[0_3px_12px_rgba(0,0,0,0.4)]`}
                    >
                      {deal.discountNum}
                    </span>
                    <Sparkles className={`w-3.5 h-3.5 ${deal.sparkleColor} opacity-75`} />
                  </div>
                  <span className="text-3xl sm:text-4xl md:text-[2.6rem] font-black tracking-tight leading-none text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] mt-0.5">
                    {deal.discountSuffix}
                  </span>
                </div>
              )}

              <p className="text-xs md:text-sm text-white/80 mt-2.5 line-clamp-1 font-medium">
                {deal.subtext}
              </p>
            </div>

            {/* Bottom Row: Voucher Code & Exact Circular Arrow Button from Image 1 */}
            <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-white/70">Use Code:</span>
                <span className="text-xs font-mono font-bold tracking-wider text-white bg-black/40 px-2.5 py-0.5 rounded border border-white/20">
                  {deal.code}
                </span>
              </div>

              {/* Exact circular arrow button from Image 1 */}
              <div className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition-all duration-200 group-hover:scale-110 group-hover:bg-white group-hover:text-stone-900 shadow-lg">
                <ArrowUpRight className="w-5 h-5 stroke-[2.5] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
