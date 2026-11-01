import React from 'react';
import { Percent, ChevronRight, Sparkles } from 'lucide-react';

interface EditorialPromoBannerProps {
  mode?: 'doorstep' | 'mehndi';
  onCtaClick?: () => void;
}

export const EditorialPromoBanner: React.FC<EditorialPromoBannerProps> = ({
  mode = 'doorstep',
  onCtaClick,
}) => {
  const isMehndi = mode === 'mehndi';

  const defaultClick = () => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      const el = document.getElementById('catalog-grid') || document.getElementById('services-catalog');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Content tuned for Doorstep vs Mehndi matching Reference Image 2
  const bannerData = isMehndi
    ? {
        discountTag: 'Up to 40% off',
        title: 'Royal Bridal & Arabic Henna',
        subtitle: 'Intricate artistry with 100% natural, deep-staining organic Sojat leaves',
        brands: ['ORGANIC SOJAT', 'TRIPLE FILTERED', 'DARK STAIN GUARANTEE'],
        ctaText: 'EXPLORE DESIGNS',
        // High quality bridal henna background image
        bgImage: '/images/larana-bridal-art.jpg',
        fallbackBg: 'from-[#451a03] via-[#78350f] to-[#291307]',
        badgeBg: 'bg-white/95 text-stone-900 border border-stone-200',
      }
    : {
        discountTag: 'Up to 40% off',
        title: 'Lifted Eye Looks',
        subtitle: 'Couture doorstep eye makeup & facials with international dermat-tested formulations',
        brands: ['SWISS BEAUTY', 'M•A•C', 'LAKMÉ'],
        ctaText: 'SHOP NOW',
        // High quality luxury makeup eye portrait from reference
        bgImage: '/images/lifted-eye-looks.jpg',
        fallbackBg: 'from-[#3b151e] via-[#632034] to-[#2b0c16]',
        badgeBg: 'bg-white/95 text-stone-900 border border-stone-200',
      };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
      <div
        onClick={defaultClick}
        className="group relative w-full h-[280px] sm:h-[320px] md:h-[380px] rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer shadow-[0_16px_40px_rgba(0,0,0,0.12)] border border-stone-200/60 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
      >
        {/* Background Image with soft zoom effect */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
          style={{
            backgroundImage: `url(${bannerData.bgImage})`,
          }}
        />

        {/* Ambient Dark/Warm Vignette Overlay to ensure text readability matching Reference 2 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />

        {/* Top-Left Pill: "% Up to 40% off" exactly like Reference Image 2 */}
        <div className="absolute top-5 left-5 md:top-6 md:left-7 z-10">
          <div
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-tight shadow-md backdrop-blur-md ${bannerData.badgeBg}`}
          >
            <div className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center">
              <Percent className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
            <span>{bannerData.discountTag}</span>
          </div>
        </div>

        {/* Top-Right Decorative VIP indicator */}
        <div className="absolute top-5 right-5 md:top-6 md:right-7 z-10 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/90 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>BlindGlow Exclusive</span>
        </div>

        {/* Centered Content: Title, Brands & Sleek CTA Button matching Reference Image 2 */}
        <div className="absolute inset-x-0 bottom-6 md:bottom-8 z-10 flex flex-col items-center justify-end text-center px-4">
          {/* Main Title */}
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif font-bold text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] max-w-2xl leading-tight">
            {bannerData.title}
          </h2>

          <p className="text-xs sm:text-sm text-stone-200/90 font-light max-w-xl mt-1.5 mb-3 hidden sm:block drop-shadow-sm">
            {bannerData.subtitle}
          </p>

          {/* Luxury Brand / Standard Row with Dividers matching Reference Image 2 */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 mb-4 text-[10px] sm:text-xs md:text-sm font-extrabold tracking-[0.2em] uppercase text-stone-200/90">
            {bannerData.brands.map((brand, idx) => (
              <React.Fragment key={brand}>
                <span className="hover:text-white transition-colors">{brand}</span>
                {idx < bannerData.brands.length - 1 && (
                  <span className="text-stone-400 font-normal">|</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Sleek CTA Button matching Reference Image 2: Black pill with uppercase text and > */}
          <div className="inline-flex items-center gap-2 bg-stone-950 text-white hover:bg-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-200 border border-stone-700/60 shadow-[0_8px_20px_rgba(0,0,0,0.4)] group-hover:scale-105 group-hover:border-rose-400/50">
            <span>{bannerData.ctaText}</span>
            <ChevronRight className="w-4 h-4 text-stone-300 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

