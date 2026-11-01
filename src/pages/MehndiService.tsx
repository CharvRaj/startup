import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Search, ShieldCheck, Heart, Clock, Star,
  ChevronLeft, ChevronRight, X, ArrowRight, CheckCircle2,
  CalendarCheck2, ShoppingBag, Plus, Minus,
  Sparkle, Award, ThumbsUp, RefreshCw, Crown, Palette, Users, Flower2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { useWishlistStore } from '@/stores/wishlist';
import { supabase } from '@/lib/supabase';
import { CatalogService } from '@/lib/servicesCatalog';
import { ServiceDetailsModal } from '@/components/larana/ServiceDetailsModal';
import { GrabTheDeal } from '@/components/common/GrabTheDeal';
import { EditorialPromoBanner } from '@/components/common/EditorialPromoBanner';

export interface MehndiServiceItem {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  original_price: number;
  discount_percent: number;
  duration_minutes: number;
  image_url: string;
  banner_urls: string[];
  inclusions: string[];
  rating: number;
  review_count: number;
  available: boolean;
}

export interface MehndiCartItem {
  id: string;
  user_id: string;
  service_id: string;
  quantity: number;
  service?: MehndiServiceItem;
}

// 7 Luxury Photographic Categories matching Doorstep style
const MEHNDI_CATEGORIES = [
  { name: 'All Services', icon: Sparkles, image: '/images/mehndi-traditional.jpg', count: 10 },
  { name: 'Bridal Mehndi', icon: Crown, image: '/images/mehndi-bridal.jpg', count: 3 },
  { name: 'Arabic Design', icon: Palette, image: '/images/mehndi-arabic.jpg', count: 2 },
  { name: 'Indo-Western', icon: Star, image: '/images/mehndi-traditional.jpg', count: 2 },
  { name: 'Finger & Feet', icon: Heart, image: '/images/mehndi-engagement.jpg', count: 1 },
  { name: 'Minimalist & Floral', icon: Flower2, image: '/images/mehndi-minimal.jpg', count: 1 },
  { name: 'Family & Guests', icon: Users, image: '/images/mehndi-festival.jpg', count: 1 },
];

// Promotional editorial cards carousel (3 visible side-by-side)
const MEHNDI_PROMOS = [
  {
    id: 'mp-1',
    title: 'Royal Bridal Art',
    subtitle: 'Raja-Rani & Dhol Motifs',
    ctaText: 'View Packages',
    category: 'Bridal Mehndi',
    image: '/images/larana-bridal-art.jpg',
  },
  {
    id: 'mp-2',
    title: 'Modern Arabic Flow',
    subtitle: 'Dubai Lace & Geometric Mesh',
    ctaText: 'Explore Now',
    category: 'Arabic Design',
    image: '/images/mehndi-arabic.jpg',
  },
  {
    id: 'mp-3',
    title: 'Sangeet Party Combos',
    subtitle: 'Festive Group Booking at Home',
    ctaText: 'Book Group',
    category: 'Family & Guests',
    image: '/images/mehndi-festival.jpg',
  },
  {
    id: 'mp-4',
    title: 'Lotus Lattice Feet',
    subtitle: 'Anklet Payal Elegance',
    ctaText: 'See Artistry',
    category: 'Finger & Feet',
    image: '/images/mehndi-engagement.jpg',
  },
];

const INITIAL_MEHNDI_SERVICES: MehndiServiceItem[] = [
  {
    id: 'm-bridal-royal',
    name: 'Royal Bridal Full Arms & Feet Mehndi',
    category: 'Bridal Mehndi',
    description: 'Intricate Raja-Rani motifs, customized bride-groom portrait detailing, and peacock storytelling for hands and feet.',
    price: 3499,
    original_price: 4999,
    discount_percent: 30,
    duration_minutes: 240,
    image_url: '/images/mehndi-bridal.jpg',
    banner_urls: ['/images/mehndi-bridal.jpg', '/images/larana-bridal-art.jpg', '/images/mehndi-engagement.jpg'],
    inclusions: [
      'Both hands elbow-length bridal coverage',
      'Both feet mid-calf intricate work',
      '100% Organic certified Rajasthani henna cones',
      'Complimentary lemon-sugar spray & clove fumigation kit',
      'Free touch-up session before wedding',
    ],
    rating: 4.9,
    review_count: 1420,
    available: true,
  },
  {
    id: 'm-arabic-elegance',
    name: 'Modern Arabic Floral Fusion Flow',
    category: 'Arabic Design',
    description: 'Bold flowing shaded vine patterns with shaded floral petals, geometric mesh wrists, and fingertip caps.',
    price: 799,
    original_price: 1199,
    discount_percent: 33,
    duration_minutes: 60,
    image_url: '/images/mehndi-arabic.jpg',
    banner_urls: ['/images/mehndi-arabic.jpg', '/images/mehndi-minimal.jpg'],
    inclusions: [
      'Both hands front & back wrist coverage',
      'Chemical-free natural dark henna guarantee',
      'Quick drying formulation (stains in 24 hours)',
      'Complimentary nilgiri essential oil application',
    ],
    rating: 4.8,
    review_count: 980,
    available: true,
  },
  {
    id: 'm-indo-western',
    name: 'Indo-Western Mandala Cuff Design',
    category: 'Indo-Western',
    description: 'Chic concentric mandala centerpieces paired with lace-glove bracelets and trendy minimalist finger jewelry work.',
    price: 649,
    original_price: 899,
    discount_percent: 28,
    duration_minutes: 45,
    image_url: '/images/mehndi-traditional.jpg',
    banner_urls: ['/images/mehndi-traditional.jpg', '/images/mehndi-bridal.jpg'],
    inclusions: [
      'Palms and back of both hands',
      'Precise symmetrical mandala art',
      'Natural Sojat leaf extract cones',
      'Sanitized single-use kit',
    ],
    rating: 4.7,
    review_count: 730,
    available: true,
  },
  {
    id: 'm-feet-anklet',
    name: 'Bridal Payal & Feet Lotus Lattice',
    category: 'Finger & Feet',
    description: 'Ornamental payal-effect anklet border with delicate lotus medallions, toe caps, and leafy arches.',
    price: 1199,
    original_price: 1699,
    discount_percent: 29,
    duration_minutes: 90,
    image_url: '/images/mehndi-engagement.jpg',
    banner_urls: ['/images/mehndi-engagement.jpg', '/images/mehndi-bridal.jpg'],
    inclusions: [
      'Both feet ankle-height intricate detailing',
      'No-slip organic formula',
      'Sugar-lemon glazing kit included',
      'Deep mahogany stain result',
    ],
    rating: 4.9,
    review_count: 610,
    available: true,
  },
  {
    id: 'm-minimalist-chic',
    name: 'Minimalist Ring Band & Wrist Tattoo',
    category: 'Minimalist & Floral',
    description: 'Subtle boho micro-leaves, delicate band rings on fingers, and sleek wrist watch accents for college & office.',
    price: 399,
    original_price: 599,
    discount_percent: 33,
    duration_minutes: 30,
    image_url: '/images/mehndi-minimal.jpg',
    banner_urls: ['/images/mehndi-minimal.jpg', '/images/mehndi-arabic.jpg'],
    inclusions: [
      'Both hands minimalist finger & wrist work',
      'Fast 15-minute drying henna',
      'Natural herbal color development',
    ],
    rating: 4.8,
    review_count: 512,
    available: true,
  },
  {
    id: 'm-guest-group',
    name: 'Festive Sangeet Group Package (5 Persons)',
    category: 'Family & Guests',
    description: 'Dedicated artist for your pre-wedding sangeet, karwa chauth, or teej party. One hand front or back for 5 guests.',
    price: 1999,
    original_price: 2999,
    discount_percent: 33,
    duration_minutes: 150,
    image_url: '/images/mehndi-festival.jpg',
    banner_urls: ['/images/mehndi-festival.jpg', '/images/mehndi-traditional.jpg'],
    inclusions: [
      'Coverage for up to 5 family members or friends',
      'Choice between Arabic floral or delicate peacock bells',
      'Certified artist comes to your door with supplies',
      'Free organic cones for everyone',
    ],
    rating: 4.9,
    review_count: 890,
    available: true,
  },
  {
    id: 'm-peacock-bridal',
    name: 'Heritage Marwari Dhol-Shehnai Bridal Set',
    category: 'Bridal Mehndi',
    description: 'Timeless Marwari tradition featuring holy kalash, shehnai, dhol drums, elephant processions, and divine Radha-Krishna motifs.',
    price: 4999,
    original_price: 6999,
    discount_percent: 29,
    duration_minutes: 300,
    image_url: '/images/larana-bridal-art.jpg',
    banner_urls: ['/images/larana-bridal-art.jpg', '/images/mehndi-bridal.jpg'],
    inclusions: [
      'Elbow-length arms front and back',
      'Full feet coverage up to calves',
      'Groom name hidden puzzle incorporation',
      'Personalized consultation before date',
      'Premium herbal eucalyptus organic henna',
    ],
    rating: 5.0,
    review_count: 1105,
    available: true,
  },
  {
    id: 'm-gulf-rose',
    name: 'Khafif Gulf Rose Shade Mehndi',
    category: 'Arabic Design',
    description: 'Exquisite negative space contouring, shaded antique rose petals, and thin netting lines loved across Dubai and Mumbai.',
    price: 899,
    original_price: 1299,
    discount_percent: 31,
    duration_minutes: 60,
    image_url: '/images/mehndi-arabic.jpg',
    banner_urls: ['/images/mehndi-arabic.jpg', '/images/mehndi-traditional.jpg'],
    inclusions: [
      'Both hands wrist to fingertips',
      'High-contrast shading technique',
      'All organic herbal ingredients',
    ],
    rating: 4.8,
    review_count: 674,
    available: true,
  },
  {
    id: 'm-bel-contemporary',
    name: 'Contemporary Bel & Botanical Vine Art',
    category: 'Indo-Western',
    description: 'Delicate climbing vines starting from index finger winding across forearm with shaded leafy blooms.',
    price: 549,
    original_price: 799,
    discount_percent: 31,
    duration_minutes: 40,
    image_url: '/images/mehndi-traditional.jpg',
    banner_urls: ['/images/mehndi-traditional.jpg'],
    inclusions: [
      'One arm full side trailing bel',
      'Organic henna with no chemicals',
      'Free post-care balm',
    ],
    rating: 4.7,
    review_count: 420,
    available: true,
  },
  {
    id: 'm-deluxe-bridal-trousseau',
    name: 'BlindGlow Signature Diamond Bridal Suite',
    category: 'Bridal Mehndi',
    description: 'Ultra-luxurious bespoke bridal design with 2 master senior artists, 3D shading, customized love story timeline, and complimentary mother-of-bride package.',
    price: 6499,
    original_price: 8999,
    discount_percent: 28,
    duration_minutes: 360,
    image_url: '/images/mehndi-bridal.jpg',
    banner_urls: ['/images/mehndi-bridal.jpg', '/images/larana-bridal-art.jpg'],
    inclusions: [
      '2 Master Artists working simultaneously (saves 2+ hours)',
      'Upper bicep to fingertip intricate detailing',
      'Calf to toe bridal foot coverage',
      'Personal story portraits (proposal, wedding date)',
      'Complimentary Mehndi for Mother & Sister of bride',
    ],
    rating: 5.0,
    review_count: 530,
    available: true,
  },
];

export function MehndiService() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  const [services, setServices] = useState<MehndiServiceItem[]>(INITIAL_MEHNDI_SERVICES);
  const [cartItems, setCartItems] = useState<MehndiCartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Services');
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [promoIndex, setPromoIndex] = useState(0);
  const [selectedService, setSelectedService] = useState<CatalogService | null>(null);

  // Auto slide promo carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % MEHNDI_PROMOS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextPromo = () => setPromoIndex((p) => (p + 1) % MEHNDI_PROMOS.length);
  const prevPromo = () => setPromoIndex((p) => (p - 1 + MEHNDI_PROMOS.length) % MEHNDI_PROMOS.length);

  // Load cart items on mount & user change
  useEffect(() => {
    fetchCart();
    fetchRemoteServices();
  }, [user]);

  const fetchRemoteServices = async () => {
    try {
      const { data, error } = await supabase
        .from('mehndi_services')
        .select('*')
        .eq('available', true);

      if (data && data.length > 0 && !error) {
        setServices(data as MehndiServiceItem[]);
      }
    } catch {
      // Fallback to rich initial services
    }
  };

  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('mehndi_cart_items')
        .select('*')
        .eq('user_id', user.id);

      if (!error && data) {
        setCartItems(data);
      }
    } catch {
      /* silent */
    }
  };

  const addToCart = async (service: MehndiServiceItem) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please sign in to add bridal & doorstep mehndi to your cart',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setAddingId(service.id);
    try {
      const existing = cartItems.find((i) => i.service_id === service.id);
      if (existing) {
        await supabase
          .from('mehndi_cart_items')
          .update({ quantity: existing.quantity + 1 })
          .eq('id', existing.id);
      } else {
        await supabase.from('mehndi_cart_items').insert({
          user_id: user.id,
          service_id: service.id,
          quantity: 1,
        });
      }
      await fetchCart();
      toast({
        title: 'Added to Mehndi Cart!',
        description: service.name,
      });
    } catch {
      // Local fallback
      setCartItems((prev) => {
        const found = prev.find((p) => p.service_id === service.id);
        if (found) {
          return prev.map((p) =>
            p.service_id === service.id ? { ...p, quantity: p.quantity + 1 } : p
          );
        }
        return [
          ...prev,
          {
            id: 'temp-' + Date.now(),
            user_id: user.id,
            service_id: service.id,
            quantity: 1,
            service,
          },
        ];
      });
      toast({ title: 'Added to Cart!', description: service.name });
    } finally {
      setAddingId(null);
    }
  };

  const updateQuantity = async (serviceId: string, delta: number) => {
    const item = cartItems.find((i) => i.service_id === serviceId);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty < 1) {
      try {
        await supabase.from('mehndi_cart_items').delete().eq('id', item.id);
      } catch {
        // local
      }
      setCartItems((prev) => prev.filter((p) => p.service_id !== serviceId));
    } else {
      try {
        await supabase
          .from('mehndi_cart_items')
          .update({ quantity: newQty })
          .eq('id', item.id);
      } catch {
        // local
      }
      setCartItems((prev) =>
        prev.map((p) => (p.service_id === serviceId ? { ...p, quantity: newQty } : p))
      );
    }
    await fetchCart();
  };

  const getQty = (id: string) => cartItems.find((i) => i.service_id === id)?.quantity || 0;
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cartItems.reduce((s, i) => {
    const srv = services.find((x) => x.id === i.service_id) || i.service;
    return s + (srv?.price || 0) * i.quantity;
  }, 0);

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat =
        selectedCategory === 'All' ||
        selectedCategory === 'All Services' ||
        s.category.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchSearch && matchCat;
    });
  }, [services, searchQuery, selectedCategory]);

  // Featured 3 popular packages
  const popularServices = useMemo(() => {
    return services.slice(0, 3);
  }, [services]);

  const openServiceModal = (item: MehndiServiceItem) => {
    const mapped: CatalogService = {
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      originalPrice: item.original_price,
      discount: item.discount_percent ? `${item.discount_percent}% OFF` : undefined,
      duration: `${item.duration_minutes} mins`,
      durationMinutes: item.duration_minutes,
      imageUrl: item.image_url,
      bannerUrls: item.banner_urls || [item.image_url],
      rating: item.rating,
      reviewCount: item.review_count,
      description: item.description,
      available: item.available,
      inclusions: item.inclusions || [
        '100% Pure Organic Sojat Henna',
        'Deep Mahogany Stain Guarantee',
        'Sanitized single-use applicator cones',
        'Free Clove & Lemon-Sugar Glazing kit',
      ],
    };
    setSelectedService(mapped);
  };

  return (
    <div className="min-h-screen text-[#2D1F1D] dark:text-[#F7F3EE] bg-[#FAF6F0] dark:bg-[#121015] relative transition-colors duration-300">
      {/* Subtle heart-touching ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-rose-200/20 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-amber-200/25 blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-80 h-80 rounded-full bg-orange-100/30 blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* ========================================================
            1. HERO SECTION (Editorial Split Layout Matching Doorstep)
            ======================================================== */}
        <section className="pt-24 sm:pt-28 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div
              className="rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 md:p-14 relative overflow-hidden border shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #FFFDFB 0%, #FAF2EA 60%, #F5EBE1 100%)',
                borderColor: '#EFE6DE',
              }}
            >
              {/* Botanical Henna Vine Outline */}
              <div className="absolute top-2 left-3 sm:top-4 sm:left-6 opacity-25 pointer-events-none select-none">
                <svg width="90" height="90" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M10 90C30 70 45 40 45 10C55 40 70 70 90 90C70 85 50 82 10 90Z"
                    stroke="#8C776B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path d="M45 10C45 45 35 70 10 90" stroke="#8C776B" strokeWidth="1.5" />
                  <path d="M45 40C30 35 22 25 20 18" stroke="#8C776B" strokeWidth="1.5" />
                  <path d="M48 55C62 50 72 40 75 30" stroke="#8C776B" strokeWidth="1.5" />
                </svg>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
                {/* Left Column: Heading, Subtitle & Badges */}
                <div className="lg:col-span-7 space-y-6 text-left">
                  {/* Eyebrow Label */}
                  <div className="tracking-[0.2em] uppercase text-xs sm:text-[13px] font-semibold text-[#8C776B] flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#C83E68]" />
                    <span>ARTISANAL HENNA & DOORSTEP MEHNDI</span>
                  </div>

                  {/* Main Heading */}
                  <h1
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.3rem] font-medium leading-[1.14] text-[#2D1F1D]"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Pure Organic Henna, Crafted with Passion at Your{' '}
                    <span
                      className="italic font-normal"
                      style={{
                        color: '#B06550',
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}
                    >
                      Doorstep
                    </span>
                  </h1>

                  {/* Subtitle Description */}
                  <p className="text-sm sm:text-base md:text-lg text-[#6B5A51] max-w-xl leading-relaxed">
                    Intricate bridal storytelling, modern Arabic flow, and festive family artistry — handcrafted with 100% natural Rajasthani Sojat leaves for deep, mahogany stains.
                  </p>

                  {/* Rose Luxury CTA Button */}
                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <Button
                      onClick={() => {
                        const el = document.getElementById('catalog-grid-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="h-12 sm:h-13 px-8 text-sm sm:text-base font-medium rounded-full text-white shadow-md transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, #C83E68 0%, #A82E52 100%)',
                        boxShadow: '0 8px 20px -6px rgba(200, 62, 104, 0.4)',
                      }}
                    >
                      Book Mehndi Artist <ArrowRight className="w-4 h-4" />
                    </Button>

                    <button
                      onClick={() => {
                        const el = document.getElementById('popular-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-xs sm:text-sm font-semibold text-[#8C776B] hover:text-[#2D1F1D] underline underline-offset-4"
                    >
                      View Bridal Specials
                    </button>
                  </div>

                  {/* 3 Pillars strip */}
                  <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-[#4E3F37] font-medium">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#C83E68]" />
                      <span>100% Organic Sojat Cones</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkle className="w-4 h-4 text-[#C83E68]" />
                      <span>Dark Stain Guarantee</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarCheck2 className="w-4 h-4 text-[#C83E68]" />
                      <span>At-Home Master Artists</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Hero Portrait in Arched Container */}
                <div className="lg:col-span-5 flex items-center justify-center relative">
                  <div className="relative w-full max-w-md sm:max-w-lg flex items-center justify-center">
                    {/* Outer Arched Frame with Real Indian Bride / Henna model */}
                    <div
                      className="w-72 sm:w-80 md:w-96 h-80 sm:h-96 md:h-[430px] overflow-hidden shadow-xl relative"
                      style={{
                        borderRadius: '180px 180px 40px 40px',
                        background: '#F5EBE1',
                        border: '4px solid #FFFFFF',
                      }}
                    >
                      <img
                        src="/images/larana-bridal-art.jpg"
                        alt="Graceful bride with intricate bridal henna on hands and arms"
                        className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                      />
                    </div>

                    {/* Floating Heart-touching Tag */}
                    <div
                      className="absolute -right-2 sm:-right-4 top-1/3 -translate-y-1/2 p-4 sm:p-5 rounded-full shadow-lg border text-center select-none"
                      style={{
                        background: 'rgba(255, 252, 248, 0.95)',
                        borderColor: '#EFE6DE',
                        backdropFilter: 'blur(8px)',
                        maxWidth: '150px',
                      }}
                    >
                      <p
                        className="text-xs sm:text-sm italic font-normal text-[#4E3F37] leading-tight"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        Henna Artistry with Love
                      </p>
                      <div className="text-center mt-1">
                        <Heart className="w-4 h-4 text-[#A85842] fill-[#A85842]/20 inline-block" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            2. PROMO CAROUSEL (3 Editorial Cards with Slider)
            ======================================================== */}
        <section className="py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="relative">
              {/* Prev Button */}
              <button
                onClick={prevPromo}
                className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md border border-[#EFE6DE] flex items-center justify-center text-[#4E3F37] hover:bg-[#FAF6F0] transition-transform active:scale-90"
                aria-label="Previous promotional card"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Next Button */}
              <button
                onClick={nextPromo}
                className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md border border-[#EFE6DE] flex items-center justify-center text-[#4E3F37] hover:bg-[#FAF6F0] transition-transform active:scale-90"
                aria-label="Next promotional card"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* 3 Visible Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[0, 1, 2].map((offset) => {
                  const item = MEHNDI_PROMOS[(promoIndex + offset) % MEHNDI_PROMOS.length];
                  return (
                    <div
                      key={item.id + '-' + offset}
                      onClick={() => {
                        setSelectedCategory(item.category);
                        const el = document.getElementById('catalog-grid-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="group rounded-3xl overflow-hidden p-4 sm:p-5 flex items-center gap-4 sm:gap-5 border shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer"
                      style={{
                        background: '#FDFBF7',
                        borderColor: '#EFE6DE',
                      }}
                    >
                      {/* Left Thumbnail with soft curve */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden flex-shrink-0 bg-[#F5EBE1]">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Right Details */}
                      <div className="flex-1 min-w-0 text-left space-y-1">
                        <h3
                          className="text-base sm:text-lg font-bold text-[#2D1F1D] truncate"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {item.title}
                        </h3>
                        <p className="text-xs text-[#8C776B] truncate font-medium">
                          {item.subtitle}
                        </p>
                        <div className="pt-2">
                          <span className="text-xs font-semibold text-[#A85842] group-hover:underline inline-flex items-center gap-1">
                            {item.ctaText} →
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Dots */}
              <div className="flex justify-center items-center gap-2 pt-5">
                {MEHNDI_PROMOS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPromoIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      promoIndex === i ? 'w-5 bg-[#A85842]' : 'bg-[#D6C7BE]'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            2.5. GRAB THE DEAL COMPONENT (Reference Image 1)
            ======================================================== */}
        <GrabTheDeal
          section="mehndi"
          onSelectDeal={(discount, cat) => {
            if (cat && cat !== 'all') {
              const found = MEHNDI_CATEGORIES.find((c) =>
                c.name.toLowerCase().includes(cat.toLowerCase())
              );
              if (found) setSelectedCategory(found.name);
            }
            const el = document.getElementById('catalog-grid-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* ========================================================
            3. SLIM SEARCH BAR
            ======================================================== */}
        <section className="py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div
              className="flex items-center rounded-full px-5 py-2 sm:py-2.5 border shadow-xs bg-white transition-all focus-within:shadow-md"
              style={{
                borderColor: '#EFE6DE',
              }}
            >
              <Search className="w-4 h-4 text-[#8C776B] mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search bridal mehndi, arabic, mandala, sangeet, feet art..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-xs sm:text-sm text-[#2D1F1D] placeholder:text-[#A8988F] outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[#8C776B] hover:text-[#2D1F1D] mr-2 p-1"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => {
                  const el = document.getElementById('catalog-grid-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-xs hover:opacity-90 transition-opacity"
                style={{ background: '#A85842' }}
                aria-label="Submit search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================
            4. CIRCULAR PHOTOGRAPHIC CATEGORIES
            ======================================================== */}
        <section className="py-6 px-4 sm:px-6 lg:px-8" id="categories-section">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-start sm:justify-center gap-5 sm:gap-7 overflow-x-auto pb-4 pt-1 scrollbar-hide -mx-2 px-2">
              {MEHNDI_CATEGORIES.map((cat) => {
                const isSelected =
                  selectedCategory === cat.name ||
                  (cat.name === 'All Services' && selectedCategory === 'All');

                return (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setSelectedCategory(cat.name === 'All Services' ? 'All' : cat.name);
                    }}
                    className="flex flex-col items-center gap-2 group flex-shrink-0 focus:outline-none"
                  >
                    {/* Circular Thumbnail with border */}
                    <div
                      className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full p-1 transition-all duration-300 ${
                        isSelected
                          ? 'ring-2 ring-offset-2 ring-[#A85842] scale-105'
                          : 'group-hover:scale-105'
                      }`}
                      style={{
                        background: isSelected ? '#A85842' : '#F5EBE1',
                      }}
                    >
                      <div className="w-full h-full rounded-full overflow-hidden bg-white">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    </div>

                    {/* Label below */}
                    <span
                      className={`text-xs sm:text-[13px] font-medium transition-colors max-w-[85px] sm:max-w-[100px] text-center leading-tight ${
                        isSelected ? 'text-[#A85842] font-bold' : 'text-[#6B5A51] group-hover:text-[#2D1F1D]'
                      }`}
                    >
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================
            5. POPULAR MEHNDI PACKAGES GRID
            ======================================================== */}
        <section className="py-10 px-4 sm:px-6 lg:px-8" id="popular-section">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="text-left space-y-1">
                <span className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-[#8C776B]">
                  MOST REQUESTED
                </span>
                <h2
                  className="text-2xl sm:text-3xl font-bold text-[#2D1F1D]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Signature Bridal & Festive Specials
                </h2>
              </div>

              <button
                onClick={() => {
                  setSelectedCategory('All');
                  const el = document.getElementById('catalog-grid-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs sm:text-sm font-semibold text-[#A85842] hover:underline hidden sm:inline-block"
              >
                View all ({services.length}) →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularServices.map((item) => {
                const qty = getQty(item.id);
                const isAdding = addingId === item.id;
                const wishlisted = isInWishlist(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => openServiceModal(item)}
                    className="group rounded-3xl overflow-hidden border shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col bg-white hover:-translate-y-1 cursor-pointer"
                    style={{
                      borderColor: '#EFE6DE',
                    }}
                  >
                    {/* Image Container with Badges */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#F5EBE1]">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Tag */}
                      <div className="absolute top-3 left-3">
                        <span
                          className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold text-white tracking-wide"
                          style={{ background: '#A85842' }}
                        >
                          {item.discount_percent}% OFF
                        </span>
                      </div>

                      {/* Wishlist Heart */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const added = toggleWishlist(item.id);
                          toast({
                            title: added ? 'Saved to Wishlist' : 'Removed from Wishlist',
                            description: item.name,
                          });
                        }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#2D1F1D] hover:bg-white shadow-xs transition-transform active:scale-90"
                        aria-label="Save to wishlist"
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            wishlisted ? 'fill-[#A85842] text-[#A85842]' : 'text-[#8C776B]'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Body Content */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between text-left space-y-3">
                      <div>
                        <h3
                          className="text-base sm:text-lg font-bold text-[#2D1F1D] group-hover:text-[#A85842] transition-colors"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {item.name}
                        </h3>
                        <p className="text-xs text-[#6B5A51] line-clamp-2 mt-1">
                          {item.description}
                        </p>

                        {/* Rating & Duration */}
                        <div className="flex items-center gap-3 pt-2 text-xs text-[#8C776B] font-medium">
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <strong className="text-[#2D1F1D]">{item.rating}</strong> ({item.review_count})
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {item.duration_minutes} mins
                          </span>
                        </div>
                      </div>

                      {/* Pricing & Add/Qty Button */}
                      <div className="pt-3 border-t border-[#EFE6DE] flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg sm:text-xl font-bold text-[#2D1F1D]">
                              ₹{item.price}
                            </span>
                            {item.original_price && (
                              <span className="text-xs text-[#8C776B] line-through">
                                ₹{item.original_price}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-emerald-700 font-semibold">
                            Organic Sojat Henna
                          </span>
                        </div>

                        {qty > 0 ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 rounded-full px-2 py-1 border shadow-xs"
                            style={{
                              background: '#FDFBF7',
                              borderColor: '#A85842',
                            }}
                          >
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#F5EBE1] text-[#2D1F1D]"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-[#A85842] px-1">{qty}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#F5EBE1] text-[#2D1F1D]"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item);
                            }}
                            disabled={isAdding}
                            className="h-9 px-4 rounded-full text-xs font-semibold text-white shadow-xs hover:opacity-90"
                            style={{ background: '#A85842' }}
                          >
                            {isAdding ? 'Adding…' : 'Book Mehndi →'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================
            6. TRUST / WHY CHOOSE BLINDGLOW MEHNDI (4 Pillars)
            ======================================================== */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div
              className="rounded-[32px] sm:rounded-[36px] p-6 sm:p-10 md:p-12 border shadow-xs"
              style={{
                background: '#FDFBF7',
                borderColor: '#EFE6DE',
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Left Column: Heading, Subtitle & 'Our Story' button */}
                <div className="lg:col-span-4 text-left space-y-4">
                  <span className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-[#8C776B]">
                    WHY CHOOSE BLINDGLOW MEHNDI?
                  </span>
                  <h2
                    className="text-2xl sm:text-3xl font-bold text-[#2D1F1D] leading-snug"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Ancient Tradition.{' '}
                    <span className="italic block" style={{ color: '#B06550' }}>
                      Couture Elegance.
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6B5A51] leading-relaxed">
                    We deliver the royal bridal henna experience directly to your living room. No chemicals, zero synthetic dyes, and certified master artists who respect your auspicious rituals.
                  </p>
                  <div>
                    <Button
                      onClick={() => navigate('/about')}
                      variant="outline"
                      className="rounded-full text-xs sm:text-sm font-medium px-5 border-[#D6C7BE] text-[#4E3F37] hover:bg-[#F5EBE1]"
                    >
                      Our Artistry Promise →
                    </Button>
                  </div>
                </div>

                {/* Right 2x2 Pillars Grid */}
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 text-left">
                  {[
                    {
                      icon: Award,
                      title: '100% Organic Sojat Cones',
                      desc: 'Triple-filtered natural henna powder sourced directly from Sojat farms, infused with pure nilgiri & eucalyptus oils.',
                    },
                    {
                      icon: ShieldCheck,
                      title: 'Chemical & PPD Free',
                      desc: 'No black henna, zero chemical accelerators. Completely safe for expectant mothers, sensitive skin, and young girls.',
                    },
                    {
                      icon: ThumbsUp,
                      title: 'Deep Mahogany Stain',
                      desc: 'Our botanical formulation develops a rich, lustrous dark maroon-brown stain that lasts for 10-15 days with complimentary glazing kit.',
                    },
                    {
                      icon: CheckCircle2,
                      title: 'Doorstep Master Artists',
                      desc: 'Senior bridal artisans arrive on time with cushioned armrests, sanitized single-use cones, and cleanup supplies.',
                    },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div
                      key={title}
                      className="p-5 rounded-2xl bg-white border flex items-start gap-3.5 shadow-2xs hover:shadow-sm transition-all"
                      style={{ borderColor: '#EFE6DE' }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: '#FAF2EA' }}
                      >
                        <Icon className="w-5 h-5" style={{ color: '#A85842' }} />
                      </div>
                      <div>
                        <h4
                          className="text-sm sm:text-base font-bold text-[#2D1F1D]"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {title}
                        </h4>
                        <p className="text-xs text-[#8C776B] mt-1 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            7. EDITORIAL PROMO BANNER (Reference Image 2)
            ======================================================== */}
        <EditorialPromoBanner
          mode="mehndi"
          onCtaClick={() => {
            const el = document.getElementById('catalog-grid-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* ========================================================
            8. FULL MEHNDI CATALOGUE GRID
            ======================================================== */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[#EFE6DE]/80" id="catalog-grid-section">
          <div className="max-w-7xl mx-auto">
            {/* Header & Category Filter Pills */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div className="text-left space-y-1">
                <span className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-[#8C776B]">
                  COMPLETE COLLECTION
                </span>
                <h2
                  className="text-2xl sm:text-3xl font-bold text-[#2D1F1D]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Explore All Mehndi Designs ({filteredServices.length})
                </h2>
              </div>

              {/* Active Category Display */}
              {selectedCategory !== 'All' && selectedCategory !== 'All Services' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#8C776B]">Filtered by:</span>
                  <span className="text-xs font-semibold text-[#A85842] bg-[#F7EBE8] px-3 py-1 rounded-full flex items-center gap-1.5">
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory('All')}>
                      <X className="w-3.5 h-3.5 hover:opacity-75" />
                    </button>
                  </span>
                </div>
              )}
            </div>

            {/* Service Cards Grid */}
            {filteredServices.length === 0 ? (
              <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-[#EFE6DE]">
                <Sparkles className="w-10 h-10 text-[#8C776B] mx-auto opacity-40" />
                <h3 className="font-bold text-lg text-[#2D1F1D]">No mehndi packages found</h3>
                <p className="text-xs text-[#8C776B] max-w-sm mx-auto">
                  Try searching with a different term or select "All Services" to browse our complete catalog.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="rounded-full text-xs font-medium px-5"
                  style={{ background: '#A85842' }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredServices.map((service) => {
                  const qty = getQty(service.id);
                  const isAdding = addingId === service.id;
                  const wishlisted = isInWishlist(service.id);

                  return (
                    <div
                      key={service.id}
                      onClick={() => openServiceModal(service)}
                      className="group rounded-3xl overflow-hidden border shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col bg-white hover:-translate-y-1 cursor-pointer"
                      style={{
                        borderColor: '#EFE6DE',
                      }}
                    >
                      {/* Image Thumbnail */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#F5EBE1]">
                        <img
                          src={service.image_url}
                          alt={service.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Category Badge */}
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-white/95 text-[#2D1F1D] shadow-xs backdrop-blur-xs">
                            {service.category}
                          </span>
                        </div>

                        {/* Wishlist Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const added = toggleWishlist(service.id);
                            toast({
                              title: added ? 'Saved to Wishlist' : 'Removed from Wishlist',
                              description: service.name,
                            });
                          }}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#2D1F1D] hover:bg-white shadow-xs transition-transform active:scale-90"
                          aria-label="Save to wishlist"
                        >
                          <Heart
                            className={`w-4 h-4 transition-colors ${
                              wishlisted ? 'fill-[#A85842] text-[#A85842]' : 'text-[#8C776B]'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between text-left space-y-3">
                        <div>
                          <h3
                            className="text-base font-bold text-[#2D1F1D] group-hover:text-[#A85842] transition-colors line-clamp-1"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                          >
                            {service.name}
                          </h3>

                          <p className="text-xs text-[#6B5A51] line-clamp-2 mt-1 leading-relaxed">
                            {service.description}
                          </p>

                          {/* Duration & Rating */}
                          <div className="flex items-center gap-3 pt-2 text-xs text-[#8C776B] font-medium">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {service.duration_minutes} mins
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <strong className="text-[#2D1F1D]">{service.rating}</strong> (
                              {service.review_count})
                            </span>
                          </div>

                          {/* Inclusions preview */}
                          {service.inclusions && service.inclusions.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-[#F5EBE1] space-y-1">
                              {service.inclusions.slice(0, 2).map((inc, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-1.5 text-[11px] text-[#4E3F37] truncate"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-[#A85842] flex-shrink-0" />
                                  <span className="truncate">{inc}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Price & Add to Cart */}
                        <div className="pt-3 border-t border-[#EFE6DE] flex items-center justify-between">
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-base sm:text-lg font-bold text-[#2D1F1D]">
                                ₹{service.price}
                              </span>
                              {service.original_price && (
                                <span className="text-xs text-[#8C776B] line-through">
                                  ₹{service.original_price}
                                </span>
                              )}
                            </div>
                            {service.discount_percent && (
                              <span className="text-[10px] text-emerald-700 font-semibold">
                                Save {service.discount_percent}%
                              </span>
                            )}
                          </div>

                          {qty > 0 ? (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-2 rounded-full px-2 py-1 border shadow-xs"
                              style={{
                                background: '#FDFBF7',
                                borderColor: '#A85842',
                              }}
                            >
                              <button
                                onClick={() => updateQuantity(service.id, -1)}
                                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#F5EBE1] text-[#2D1F1D]"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-[#A85842] px-1">{qty}</span>
                              <button
                                onClick={() => updateQuantity(service.id, 1)}
                                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#F5EBE1] text-[#2D1F1D]"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(service);
                              }}
                              disabled={isAdding}
                              size="sm"
                              className="rounded-full text-xs font-semibold text-white shadow-xs hover:opacity-90 px-3.5"
                              style={{ background: '#A85842' }}
                            >
                              {isAdding ? 'Adding…' : 'Add +'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ========================================================
            9. FLOATING BOTTOM CART BAR
            ======================================================== */}
        {cartCount > 0 && (
          <div className="fixed bottom-4 inset-x-0 z-40 px-4 max-w-2xl mx-auto animate-fade-in-up">
            <div
              className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl flex items-center justify-between text-white backdrop-blur-md"
              style={{
                background: 'linear-gradient(135deg, #2D1F1D 0%, #1A1211 100%)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#C83E68] flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-stone-300">
                    {cartCount} {cartCount === 1 ? 'Design' : 'Designs'} Added
                  </p>
                  <p className="text-base sm:text-lg font-bold text-white">₹{cartTotal}</p>
                </div>
              </div>

              <Button
                onClick={() => navigate('/cart')}
                className="h-10 sm:h-11 px-5 sm:px-6 rounded-full text-xs sm:text-sm font-semibold text-white shadow-md hover:opacity-90 inline-flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #C83E68 0%, #A82E52 100%)',
                }}
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Service Details Modal */}
        <ServiceDetailsModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onBookNow={(s) => {
            const raw = services.find((x) => x.id === s.id);
            if (raw) addToCart(raw);
            setSelectedService(null);
          }}
        />
      </div>
    </div>
  );
}
export default MehndiService;
