import { useState } from 'react';
import { Sparkles, ArrowRight, Heart, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWishlistStore } from '@/stores/wishlist';
import { useToast } from '@/hooks/use-toast';

interface CategoryItem {
  id: string;
  name: string;
  tagline: string;
  startingPrice: string;
  image: string;
  alt: string;
  targetCategory: string;
  section: 'doorstep' | 'mehndi';
}

const DOORSTEP_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-facial',
    name: 'Facial & Clean-up',
    tagline: 'Herbal & deep pore cleansing',
    startingPrice: '₹499',
    image: '/images/service-face.png',
    alt: 'Gentle facial cleanse and skin purification',
    targetCategory: 'Face & Clean-up',
    section: 'doorstep',
  },
  {
    id: 'cat-skinglow',
    name: 'Skin Glow & Detan',
    tagline: 'Hydra-infusion & anti-tan packs',
    startingPrice: '₹699',
    image: '/images/service-skincare.png',
    alt: 'Skin glow hydration and anti-tan therapy',
    targetCategory: 'Skin Glow & Detan',
    section: 'doorstep',
  },
  {
    id: 'cat-hairspa',
    name: 'Hair Spa & Styling',
    tagline: 'Keratin nourishment & blowout',
    startingPrice: '₹799',
    image: '/images/service-hair.png',
    alt: 'Hair spa nourishment and blowout styling',
    targetCategory: 'Hair & Styling',
    section: 'doorstep',
  },
  {
    id: 'cat-waxing',
    name: 'Waxing & Threading',
    tagline: 'Gentle Rica wax & brow shaping',
    startingPrice: '₹349',
    image: '/images/category-waxing.jpg',
    alt: 'Gentle waxing and threading care',
    targetCategory: 'Waxing & Threading',
    section: 'doorstep',
  },
  {
    id: 'cat-nails',
    name: 'Manicure & Pedicure',
    tagline: 'Callus peel & relaxing foot spa',
    startingPrice: '₹599',
    image: '/images/category-nails.jpg',
    alt: 'Sanitized spa manicure and pedicure',
    targetCategory: 'Nails & Pedicure',
    section: 'doorstep',
  },
  {
    id: 'cat-bodyspa',
    name: 'Body Spa & Massage',
    tagline: 'Aromatherapy oil relaxation',
    startingPrice: '₹1,499',
    image: '/images/banner-relaxing.png',
    alt: 'Body spa therapy and soothing relaxation',
    targetCategory: 'Body Spa & Massage',
    section: 'doorstep',
  },
  {
    id: 'cat-bridal',
    name: 'Bridal Beauty',
    tagline: 'Complete HD pre-bridal packages',
    startingPrice: '₹3,999',
    image: '/images/category-bridal.jpg',
    alt: 'Royal Indian bridal beauty and shringar',
    targetCategory: 'Bridal Artistry',
    section: 'doorstep',
  },
  {
    id: 'cat-makeup',
    name: 'Makeup at Home',
    tagline: 'Party, cocktail & festive glam',
    startingPrice: '₹1,899',
    image: '/images/banner-neutral.png',
    alt: 'Professional party makeup at home',
    targetCategory: 'Makeup Services',
    section: 'doorstep',
  },
];

const MEHNDI_CATEGORIES: CategoryItem[] = [
  {
    id: 'mcat-bridal',
    name: 'Bridal Mehndi',
    tagline: 'Full arms & feet royal story',
    startingPrice: '₹3,499',
    image: '/images/mehndi-bridal.jpg',
    alt: 'Intricate bridal henna design on hands',
    targetCategory: 'Bridal Mehndi',
    section: 'mehndi',
  },
  {
    id: 'mcat-arabic',
    name: 'Arabic Mehndi',
    tagline: 'Flowing negative space florals',
    startingPrice: '₹799',
    image: '/images/mehndi-arabic.jpg',
    alt: 'Arabic shaded floral henna pattern on hand',
    targetCategory: 'Arabic Design',
    section: 'mehndi',
  },
  {
    id: 'mcat-rajasthani',
    name: 'Rajasthani/Marwari Mehndi',
    tagline: 'Heritage peacock & dhol motifs',
    startingPrice: '₹1,199',
    image: '/images/mehndi-traditional.jpg',
    alt: 'Heritage Rajasthani Marwari henna design on hands',
    targetCategory: 'Indo-Western',
    section: 'mehndi',
  },
  {
    id: 'mcat-minimal',
    name: 'Minimal Mehndi',
    tagline: 'Boho cuffs, rings & wrist lace',
    startingPrice: '₹399',
    image: '/images/mehndi-minimal.jpg',
    alt: 'Minimalist hand henna finger rings',
    targetCategory: 'Minimalist & Floral',
    section: 'mehndi',
  },
  {
    id: 'mcat-festival',
    name: 'Festival Mehndi',
    tagline: 'Teej, Karwa Chauth & Diwali',
    startingPrice: '₹599',
    image: '/images/mehndi-festival.jpg',
    alt: 'Festival henna art for celebratory occasions',
    targetCategory: 'Family & Guests',
    section: 'mehndi',
  },
  {
    id: 'mcat-engagement',
    name: 'Engagement & Party Mehndi',
    tagline: 'Delicate mandala & backhand art',
    startingPrice: '₹999',
    image: '/images/mehndi-engagement.jpg',
    alt: 'Engagement ceremony henna art',
    targetCategory: 'Indo-Western',
    section: 'mehndi',
  },
];

export function FestiveCategoryCanopy() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'doorstep' | 'mehndi'>('doorstep');
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const handleCardClick = (cat: CategoryItem) => {
    if (cat.section === 'doorstep') {
      navigate(`/doorstep-service?category=${encodeURIComponent(cat.targetCategory)}`);
    } else {
      navigate(`/mehndi-service?category=${encodeURIComponent(cat.targetCategory)}`);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent, cat: CategoryItem) => {
    e.stopPropagation();
    const added = toggleWishlist(cat.id);
    toast({
      title: added ? 'Saved to Wishlist' : 'Removed from Wishlist',
      description: `${cat.name} has been ${added ? 'added to' : 'removed from'} your wishlist.`,
    });
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 overflow-hidden relative bg-[#FFF9F5] dark:bg-[#121015] transition-colors duration-300">
      <div className="container-custom space-y-10 sm:space-y-14">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-[#F5DCE1] dark:bg-[#2A202A] text-[#542337] dark:text-[#E8DEC8] border border-[rgba(200,62,104,0.2)] dark:border-[rgba(197,160,89,0.3)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C83E68] dark:text-[#E8C37B]" />
            Personalised Rituals
          </div>

          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#342A29] dark:text-[#F7F3EE]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Find Your Perfect <span className="italic text-[#C83E68] dark:text-[#E8C37B]">Beauty Ritual</span>
          </h2>

          <p className="text-sm sm:text-base max-w-xl mx-auto text-[#542337]/85 dark:text-[#C7B7A6]">
            Explore treatments designed around your beauty goals.
          </p>

          {/* Category Section Switcher */}
          <div className="inline-flex p-1.5 rounded-2xl bg-white dark:bg-[#1A1721] border border-[#F5DCE1] dark:border-[rgba(197,160,89,0.25)] shadow-xs mt-3">
            <button
              onClick={() => setActiveTab('doorstep')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'doorstep'
                  ? 'text-white shadow-md'
                  : 'text-[#542337] hover:text-[#C83E68]'
              }`}
              style={{
                background: activeTab === 'doorstep' ? 'linear-gradient(135deg, #C83E68 0%, #A82E52 100%)' : 'transparent',
              }}
            >
              <Sparkles className="w-4 h-4" />
              Doorstep Beauty ({DOORSTEP_CATEGORIES.length})
            </button>
            <button
              onClick={() => setActiveTab('mehndi')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'mehndi'
                  ? 'text-white shadow-md'
                  : 'text-[#542337] hover:text-[#C86432]'
              }`}
              style={{
                background: activeTab === 'mehndi' ? 'linear-gradient(135deg, #8B4513 0%, #C86432 100%)' : 'transparent',
              }}
            >
              <Heart className="w-4 h-4" />
              Mehndi Art ({MEHNDI_CATEGORIES.length})
            </button>
          </div>
        </div>

        {/* ========================================================
            CATEGORY SECTION 1: DOORSTEP BEAUTY (8 Categories)
           ======================================================== */}
        {activeTab === 'doorstep' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className="text-xl sm:text-2xl font-bold"
                  style={{ color: '#342A29', fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Doorstep Beauty Categories
                </h3>
                <p className="text-xs sm:text-sm text-[#542337]/75">
                  8 personalized home salon treatments tailored for wellness
                </p>
              </div>

              <button
                onClick={() => navigate('/doorstep-service')}
                className="text-xs sm:text-sm font-bold flex items-center gap-1 group"
                style={{ color: '#C83E68' }}
              >
                View Full Catalog
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Responsive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {DOORSTEP_CATEGORIES.map((cat) => {
                const wishlisted = isInWishlist(cat.id);
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleCardClick(cat)}
                    className="group cursor-pointer rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 bg-white border border-[#F5DCE1] shadow-xs hover:shadow-xl hover:border-[#C83E68]/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative"
                  >
                    {/* Image Container with Natural Colors */}
                    <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#FFF9F5] border border-[#F5DCE1]/60">
                      <img
                        src={cat.image}
                        alt={cat.alt}
                        className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-500"
                        style={{ filter: 'none', opacity: 1 }}
                        loading="lazy"
                      />

                      {/* Wishlist Heart Icon (Top Right) */}
                      <button
                        onClick={(e) => handleWishlistToggle(e, cat)}
                        aria-label="Save to Wishlist"
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-md transition-transform active:scale-90 hover:scale-110 z-10"
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            wishlisted ? 'fill-[#C83E68] text-[#C83E68]' : 'text-slate-400 hover:text-[#C83E68]'
                          }`}
                        />
                      </button>

                      {/* Price Pill (Bottom Left) */}
                      <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-black shadow-sm border border-[#F5DCE1]" style={{ color: '#C83E68' }}>
                        From {cat.startingPrice}
                      </div>
                    </div>

                    {/* Category Label Area Below Image */}
                    <div className="pt-3 px-1 text-left flex-1 flex flex-col justify-between">
                      <div>
                        <h4
                          className="font-bold text-sm sm:text-base group-hover:text-[#C83E68] transition-colors line-clamp-1"
                          style={{ color: '#342A29' }}
                        >
                          {cat.name}
                        </h4>
                        <p className="text-xs text-[#542337]/75 line-clamp-1 mt-0.5">
                          {cat.tagline}
                        </p>
                      </div>

                      <div className="pt-2.5 mt-2 border-t border-[#F5DCE1]/50 flex items-center justify-between text-xs font-semibold" style={{ color: '#C83E68' }}>
                        <span>Explore</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            CATEGORY SECTION 2: MEHNDI ART (6 Categories)
           ======================================================== */}
        {activeTab === 'mehndi' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className="text-xl sm:text-2xl font-bold"
                  style={{ color: '#342A29', fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Mehndi Art Categories
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Authentic hand henna artwork with 100% natural organic Sojat cones
                </p>
              </div>

              <button
                onClick={() => navigate('/mehndi-service')}
                className="text-xs sm:text-sm font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 group"
              >
                View Mehndi Catalog
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Responsive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
              {MEHNDI_CATEGORIES.map((cat) => {
                const wishlisted = isInWishlist(cat.id);
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleCardClick(cat)}
                    className="group cursor-pointer rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 bg-white border border-amber-200/70 shadow-xs hover:shadow-xl hover:border-amber-400 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative"
                  >
                    {/* Actual Hand Henna Photo */}
                    <div className="relative aspect-[4/3] sm:aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-amber-50/50 border border-amber-100">
                      <img
                        src={cat.image}
                        alt={cat.alt}
                        className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-500"
                        style={{ filter: 'none', opacity: 1 }}
                        loading="lazy"
                      />

                      {/* Wishlist Heart Icon (Top Right) */}
                      <button
                        onClick={(e) => handleWishlistToggle(e, cat)}
                        aria-label="Save to Wishlist"
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-md transition-transform active:scale-90 hover:scale-110 z-10"
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            wishlisted ? 'fill-[#C83E68] text-[#C83E68]' : 'text-slate-400 hover:text-[#C83E68]'
                          }`}
                        />
                      </button>

                      {/* Price Badge */}
                      <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-black text-amber-900 shadow-sm border border-amber-200">
                        Starts {cat.startingPrice}
                      </div>
                    </div>

                    {/* Label Area Below Image */}
                    <div className="pt-3 px-1 text-left flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-[#342A29] group-hover:text-amber-900 transition-colors line-clamp-1">
                          {cat.name}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {cat.tagline}
                        </p>
                      </div>

                      <div className="pt-2.5 mt-2 border-t border-amber-100 flex items-center justify-between text-xs font-semibold text-amber-800 group-hover:text-amber-900">
                        <span>Explore Designs</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
