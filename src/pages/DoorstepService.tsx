import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Search, ShieldCheck, Heart, Clock, Star,
  ChevronLeft, ChevronRight, X, ArrowRight, CheckCircle2,
  CalendarCheck2, Shield, ShoppingBag, Plus, Minus,
  Sparkle, Award, ThumbsUp, RefreshCw, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { useWishlistStore } from '@/stores/wishlist';
import { supabase } from '@/lib/supabase';
import {
  CatalogService,
  fetchAllCatalogServices,
  DISPLAY_CATEGORIES,
} from '@/lib/servicesCatalog';
import { ServiceDetailsModal } from '@/components/larana/ServiceDetailsModal';
import { GrabTheDeal } from '@/components/common/GrabTheDeal';
import { EditorialPromoBanner } from '@/components/common/EditorialPromoBanner';

// Static promos matching the reference carousel
const PROMO_CAROUSEL_ITEMS = [
  {
    id: 'promo-1',
    title: 'Glow & Refresh',
    subtitle: 'Facial Care Specials',
    ctaText: 'Explore Now',
    category: 'Facial & Clean-up',
    image: '/images/larana-promo-facial.jpg',
  },
  {
    id: 'promo-2',
    title: 'Hair Care Moments',
    subtitle: 'Healthy • Shiny • Beautiful',
    ctaText: 'Explore Now',
    category: 'Hair Care & Styling',
    image: '/images/larana-promo-hair.jpg',
  },
  {
    id: 'promo-3',
    title: 'Nail Art & Care',
    subtitle: 'Little Details, Big Joy',
    ctaText: 'Explore Now',
    category: 'Manicure & Pedicure',
    image: '/images/larana-promo-nails.jpg',
  },
  {
    id: 'promo-4',
    title: 'Royal Bridal Glow',
    subtitle: 'Luxury HD Artistry',
    ctaText: 'Explore Now',
    category: 'Makeup & Bridal',
    image: '/images/larana-bridal-art.jpg',
  },
];

// Reference Popular 4 Services with exact prices and discounts from image
const POPULAR_FEATURED_SERVICES = [
  {
    id: 'feat-hydra-glow',
    name: 'Hydrating Glow Facial',
    tag: 'Most Popular',
    category: 'Facial & Clean-up',
    description: 'Deep hydration for soft, radiant skin.',
    rating: 4.8,
    reviews: 248,
    duration: 60,
    price: 799,
    originalPrice: 1499,
    discountPercent: 47,
    image: '/images/larana-promo-facial.jpg',
  },
  {
    id: 'feat-hair-styling',
    name: 'Hair Styling',
    category: 'Hair Care & Styling',
    description: 'Trendy looks for every occasion.',
    rating: 4.7,
    reviews: 190,
    duration: 45,
    price: 1299,
    originalPrice: 1999,
    discountPercent: 35,
    image: '/images/larana-promo-hair.jpg',
  },
  {
    id: 'feat-mani-pedi',
    name: 'Manicure & Pedicure',
    category: 'Manicure & Pedicure',
    description: 'Soft hands and beautiful nails.',
    rating: 4.9,
    reviews: 312,
    duration: 60,
    price: 699,
    originalPrice: 999,
    discountPercent: 30,
    image: '/images/larana-promo-nails.jpg',
  },
  {
    id: 'feat-bridal-makeup',
    name: 'Bridal Makeup',
    tag: 'Trending',
    category: 'Makeup & Bridal',
    description: 'Traditional to modern bridal look.',
    rating: 4.8,
    reviews: 164,
    duration: 120,
    price: 2499,
    originalPrice: 3999,
    discountPercent: 29,
    image: '/images/larana-bridal-art.jpg',
  },
];


export function DoorstepService() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [allServices, setAllServices] = useState<CatalogService[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [addingId, setAddingId] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedService, setSelectedService] = useState<CatalogService | null>(null);

  // Carousel State
  const [promoIndex, setPromoIndex] = useState(0);

  useEffect(() => {
    loadServices();
    if (user) {
      loadCart();
    }
  }, [user]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await fetchAllCatalogServices();
      setAllServices(data);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('cart_items')
        .select('*, service:doorstep_services(*)')
        .eq('user_id', user.id);
      setCartItems(data || []);
    } catch (e) {
      console.warn('Failed to fetch cart:', e);
    }
  };

  const getCartQuantity = (id: string) => {
    const item = cartItems.find((i) => i.service_id === id);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = async (service: { id: string; name: string; price: number }) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to add treatments to your cart.',
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
          .from('cart_items')
          .update({ quantity: existing.quantity + 1 })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('cart_items')
          .insert({ user_id: user.id, service_id: service.id, quantity: 1 });
      }
      await loadCart();
      toast({
        title: 'Added to Cart',
        description: `${service.name} has been added.`,
      });
    } catch {
      // Optimistic update fallback
      setCartItems((prev) => {
        const found = prev.find((p) => p.service_id === service.id);
        if (found) {
          return prev.map((p) =>
            p.service_id === service.id ? { ...p, quantity: p.quantity + 1 } : p
          );
        }
        return [
          ...prev,
          { id: 'temp-' + Date.now(), user_id: user.id, service_id: service.id, quantity: 1, service },
        ];
      });
      toast({
        title: 'Added to Cart',
        description: `${service.name} has been added.`,
      });
    } finally {
      setAddingId(null);
    }
  };

  const handleUpdateQuantity = async (serviceId: string, delta: number) => {
    const item = cartItems.find((i) => i.service_id === serviceId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty < 1) {
      try {
        await supabase.from('cart_items').delete().eq('id', item.id);
      } catch {
        setCartItems((prev) => prev.filter((p) => p.service_id !== serviceId));
      }
    } else {
      try {
        await supabase.from('cart_items').update({ quantity: newQty }).eq('id', item.id);
      } catch {
        setCartItems((prev) =>
          prev.map((p) => (p.service_id === serviceId ? { ...p, quantity: newQty } : p))
        );
      }
    }
    await loadCart();
  };

  const handleWishlistClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const added = toggleWishlist(id);
    toast({
      title: added ? 'Saved to Wishlist' : 'Removed from Wishlist',
      description: 'You can view your saved treatments anytime.',
    });
  };

  const handleCategoryClick = (categoryLabel: string) => {
    setSelectedCategory(categoryLabel);
    const catalogEl = document.getElementById('catalog-grid-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Filtered Services for the comprehensive catalog grid
  const filteredCatalogServices = useMemo(() => {
    return allServices.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCat =
        selectedCategory === 'All' ||
        selectedCategory === 'All Services' ||
        s.displayCategory.toLowerCase() === selectedCategory.toLowerCase() ||
        s.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchSearch && matchCat;
    });
  }, [allServices, searchQuery, selectedCategory]);

  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, curr) => {
    const srv = allServices.find((x) => x.id === curr.service_id) || curr.service;
    return acc + (srv?.price || 0) * curr.quantity;
  }, 0);

  // Promo navigation
  const nextPromo = () => {
    setPromoIndex((prev) => (prev + 1) % PROMO_CAROUSEL_ITEMS.length);
  };
  const prevPromo = () => {
    setPromoIndex((prev) => (prev - 1 + PROMO_CAROUSEL_ITEMS.length) % PROMO_CAROUSEL_ITEMS.length);
  };


  return (
    <div
      className="min-h-screen text-[#2D1F1D] dark:text-[#F7F3EE] bg-[#FAF6F0] dark:bg-[#121015] transition-colors duration-300"
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* ========================================================
          1. EDITORIAL HERO BANNER (Exact reproduction of reference)
          ======================================================== */}
      <section className="pt-24 sm:pt-28 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div
            className="relative rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 md:p-14 lg:p-16 overflow-hidden border shadow-sm"
            style={{
              background: '#FDFBF7',
              borderColor: '#EFE6DE',
            }}
          >
            {/* Top-left subtle botanical leaf illustration */}
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
                <div className="tracking-[0.2em] uppercase text-xs sm:text-[13px] font-semibold text-[#8C776B]">
                  DOORSTEP BEAUTY SERVICES
                </div>

                {/* Main Heading */}
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-medium leading-[1.14] text-[#2D1F1D]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Professional Beauty Care, Now at Your{' '}
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
                  Relax, refresh and feel beautiful — with our expert beauty services, delivered to your home.
                </p>

                {/* Rose Luxury CTA Button */}
                <div className="pt-2">
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
                    Book Beauty at Home <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* 3 Pillars strip */}
                <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-[#4E3F37] font-medium">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#C83E68]" />
                    <span>Verified Professionals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkle className="w-4 h-4 text-[#C83E68]" />
                    <span>Hygienic &amp; Safe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarCheck2 className="w-4 h-4 text-[#C83E68]" />
                    <span>Flexible Booking</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Portrait in Arched Container */}
              <div className="lg:col-span-5 flex items-center justify-center relative">
                <div className="relative w-full max-w-md sm:max-w-lg flex items-center justify-center">
                  {/* Outer Arched Frame */}
                  <div
                    className="w-72 sm:w-80 md:w-96 h-80 sm:h-96 md:h-[430px] overflow-hidden shadow-xl relative"
                    style={{
                      borderRadius: '180px 180px 40px 40px',
                      background: '#F5EBE1',
                      border: '4px solid #FFFFFF',
                    }}
                  >
                    <img
                      src="/images/larana-hero-flower.jpg"
                      alt="Woman gently holding white flower with glowing skin"
                      className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                    />
                  </div>

                  {/* Floating Tag: Self Care Is Always a Good Idea */}
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
                      Self Care Is Always a Good Idea
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
          2. PROMO CAROUSEL (3 Editorial Cards side-by-side with slider)
          ======================================================== */}
      <section className="py-6 px-4 sm:px-6 lg:px-8">
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
                const item =
                  PROMO_CAROUSEL_ITEMS[(promoIndex + offset) % PROMO_CAROUSEL_ITEMS.length];
                return (
                  <div
                    key={item.id + '-' + offset}
                    onClick={() => handleCategoryClick(item.category)}
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
              {PROMO_CAROUSEL_ITEMS.map((_, i) => (
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
          2.5. GRAB THE DEAL (Reference Specials & Discounts)
          ======================================================== */}
      <GrabTheDeal
        section="doorstep"
        onSelectDeal={(discount, cat) => {
          if (cat && cat !== 'all') {
            const found = DISPLAY_CATEGORIES.find(c => c.label.toLowerCase().includes(cat.toLowerCase()));
            if (found) setSelectedCategory(found.label);
          }
          const el = document.getElementById('catalog-grid-section');
          el?.scrollIntoView({ behavior: 'smooth' });
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
              placeholder="Search facial, waxing, hair spa, makeup..."
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
            {DISPLAY_CATEGORIES.map((cat) => {
              const isSelected =
                selectedCategory === cat.label ||
                (selectedCategory === 'All' && cat.id === 'all');

              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.label)}
                  className="flex flex-col items-center gap-2.5 flex-shrink-0 group cursor-pointer"
                >
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden p-0.5 border-2 transition-all duration-300 ${
                      isSelected
                        ? 'border-[#A85842] ring-2 ring-[#A85842]/30 scale-105'
                        : 'border-[#EFE6DE] group-hover:border-[#A85842]/60 group-hover:scale-105'
                    }`}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#F5EBE1]">
                      <img
                        src={cat.image}
                        alt={cat.label}
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  </div>
                  <span
                    className={`text-xs sm:text-[13px] whitespace-nowrap text-center transition-colors ${
                      isSelected
                        ? 'font-bold text-[#A85842]'
                        : 'font-medium text-[#4E3F37] group-hover:text-[#A85842]'
                    }`}
                  >
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          5. POPULAR BEAUTY SERVICES (4 Cards matching reference)
          ======================================================== */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div className="text-left space-y-1">
              <span className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-[#8C776B]">
                FEATURED SERVICES
              </span>
              <h2
                className="text-2xl sm:text-3xl font-bold text-[#2D1F1D]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Popular Beauty Services
              </h2>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('All');
                const el = document.getElementById('catalog-grid-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs sm:text-sm font-semibold text-[#A85842] hover:underline flex items-center gap-1"
            >
              View All Services →
            </button>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {POPULAR_FEATURED_SERVICES.map((item) => {
              const qty = getCartQuantity(item.id);
              const isAdding = addingId === item.id;
              const wishlisted = isInWishlist(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    const srv = allServices.find((s) => s.id === item.id) || {
                      id: item.id,
                      name: item.name,
                      category: item.category,
                      displayCategory: item.category,
                      description: item.description,
                      price: item.price,
                      originalPrice: item.originalPrice,
                      discountPercent: item.discountPercent,
                      durationMinutes: item.duration,
                      imageUrl: item.image,
                      bannerUrls: [item.image],
                      rating: item.rating,
                      reviewCount: item.reviews,
                      available: true,
                      inclusions: [
                        'Sanitized single-use disposable kit',
                        'Dermatologically certified products',
                        'Post-care hydration & maintenance tips',
                      ],
                    };
                    setSelectedService(srv as CatalogService);
                  }}
                  className="group rounded-3xl overflow-hidden border shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col bg-white hover:-translate-y-1 cursor-pointer"
                  style={{
                    borderColor: '#EFE6DE',
                  }}
                >
                  {/* Image Container with Badges */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#F5EBE1]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Tag if any ('Most Popular' / 'Trending') */}
                    {item.tag && (
                      <div className="absolute top-3 left-3">
                        <span
                          className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold text-white tracking-wide"
                          style={{ background: '#A85842' }}
                        >
                          {item.tag}
                        </span>
                      </div>
                    )}

                    {/* Wishlist Heart */}
                    <button
                      onClick={(e) => handleWishlistClick(item.id, e)}
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
                      <p className="text-xs text-[#6B5A51] line-clamp-1 mt-1">
                        {item.description}
                      </p>

                      {/* Rating & Duration */}
                      <div className="flex items-center gap-3 pt-2 text-xs text-[#8C776B] font-medium">
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <strong className="text-[#2D1F1D]">{item.rating}</strong> ({item.reviews})
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {item.duration} mins
                        </span>
                      </div>
                    </div>

                    {/* Price & Action Button */}
                    <div className="pt-2 border-t border-[#EFE6DE]/60 space-y-2.5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg sm:text-xl font-bold text-[#2D1F1D]">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                        {item.originalPrice && (
                          <span className="text-xs text-[#A8988F] line-through">
                            ₹{item.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                        {item.discountPercent && (
                          <span className="text-[11px] font-semibold text-[#A85842] bg-[#F7EBE8] px-1.5 py-0.5 rounded">
                            {item.discountPercent}% OFF
                          </span>
                        )}
                      </div>

                      {qty > 0 ? (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-between rounded-full px-3 py-1.5 border"
                          style={{ borderColor: '#A85842', background: '#FDFBF7' }}
                        >
                          <button
                            onClick={() => handleUpdateQuantity(item.id, -1)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[#A85842] hover:bg-[#F7EBE8]"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-[#2D1F1D]">{qty} in cart</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[#A85842] hover:bg-[#F7EBE8]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item);
                          }}
                          disabled={isAdding}
                          className="w-full h-10 rounded-full text-xs font-semibold text-white shadow-xs transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-1.5"
                          style={{
                            background: '#A85842',
                          }}
                        >
                          {isAdding ? 'Adding…' : 'Book Now →'}
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
          6. TRUST / WHY CHOOSE SATGURU ART (Exact 4 pillars from image)
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
                  WHY CHOOSE SATGURU ART?
                </span>
                <h2
                  className="text-2xl sm:text-3xl font-bold text-[#2D1F1D] leading-snug"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  More Than Just Beauty.{' '}
                  <span className="italic block" style={{ color: '#B06550' }}>
                    It's a Comfort.
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-[#6B5A51] leading-relaxed">
                  We bring salon-like experience to your home with trusted professionals, premium products and personalized care.
                </p>
                <div className="pt-1">
                  <Button
                    onClick={() => navigate('/contact')}
                    className="h-10 px-6 rounded-full text-xs font-medium text-white shadow-xs hover:opacity-90 transition-opacity"
                    style={{ background: '#A85842' }}
                  >
                    Our Story →
                  </Button>
                </div>
              </div>

              {/* Right Column: 4 Trust Pillars with soft rounded icon containers */}
              <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4 text-left">
                {[
                  {
                    icon: ShieldCheck,
                    title: 'Verified Professionals',
                    desc: 'Background checked & trained',
                  },
                  {
                    icon: Sparkle,
                    title: 'Hygienic & Safe',
                    desc: 'Clean & sanitized tools',
                  },
                  {
                    icon: CalendarCheck2,
                    title: 'Flexible Booking',
                    desc: 'Easy rescheduling',
                  },
                  {
                    icon: Award,
                    title: 'Premium Products',
                    desc: 'Salon quality at home',
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="space-y-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-[#A85842] shadow-xs"
                      style={{ background: '#F7EBE8' }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4
                        className="font-bold text-sm sm:text-base text-[#2D1F1D] leading-tight"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {title}
                      </h4>
                      <p className="text-xs text-[#8C776B] mt-1">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          7. HIGH-FASHION EDITORIAL PROMO BANNER (Reference 2)
          ======================================================== */}
      <EditorialPromoBanner
        mode="doorstep"
        onCtaClick={() => {
          const el = document.getElementById('catalog-grid-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* ========================================================
          8. ALL DOORSTEP SERVICES CATALOGUE GRID (Full 35 items)
          ======================================================== */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[#EFE6DE]/80" id="catalog-grid-section">
        <div className="max-w-7xl mx-auto">
          {/* Header & Category Filter Pills */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="text-left space-y-1">
              <span className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-[#8C776B]">
                FULL CATALOGUE
              </span>
              <h2
                className="text-2xl sm:text-3xl font-bold text-[#2D1F1D]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Explore All Treatments ({filteredCatalogServices.length})
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
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-[#A85842]" />
              <p className="text-xs text-[#8C776B]">Loading verified salon services…</p>
            </div>
          ) : filteredCatalogServices.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-[#EFE6DE]">
              <Sparkles className="w-10 h-10 text-[#8C776B] mx-auto opacity-40" />
              <h3 className="font-bold text-lg text-[#2D1F1D]">No treatments found</h3>
              <p className="text-xs text-[#8C776B] max-w-sm mx-auto">
                Try searching with a different term or select "All Services" to browse our complete collection.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="rounded-full text-xs font-medium text-white"
                style={{ background: '#A85842' }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredCatalogServices.map((srv) => {
                const qty = getCartQuantity(srv.id);
                const isAdding = addingId === srv.id;
                const wishlisted = isInWishlist(srv.id);

                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedService(srv)}
                    className="group rounded-3xl overflow-hidden border shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col bg-white hover:-translate-y-1 cursor-pointer"
                    style={{
                      borderColor: '#EFE6DE',
                    }}
                  >
                    {/* Image with Wishlist Button */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#F5EBE1]">
                      <img
                        src={srv.imageUrl}
                        alt={srv.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />

                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => handleWishlistClick(srv.id, e)}
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
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between text-left space-y-3">
                      <div>
                        <h3
                          className="text-base font-bold text-[#2D1F1D] group-hover:text-[#A85842] transition-colors leading-snug line-clamp-1"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {srv.name}
                        </h3>
                        <p className="text-xs text-[#6B5A51] line-clamp-2 mt-1">
                          {srv.description}
                        </p>

                        {/* Rating & Duration */}
                        <div className="flex items-center gap-3 pt-2 text-xs text-[#8C776B] font-medium">
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <strong className="text-[#2D1F1D]">
                              {srv.rating ? srv.rating.toFixed(1) : '4.8'}
                            </strong>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {srv.durationMinutes || 45} mins
                          </span>
                        </div>
                      </div>

                      {/* Pricing & Add/Qty */}
                      <div className="pt-2 border-t border-[#EFE6DE]/60 space-y-2.5">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-[#2D1F1D]">
                            ₹{srv.price.toLocaleString('en-IN')}
                          </span>
                          {srv.originalPrice && (
                            <span className="text-xs text-[#A8988F] line-through">
                              ₹{srv.originalPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                          {srv.discountPercent && (
                            <span className="text-[11px] font-semibold text-[#A85842] bg-[#F7EBE8] px-1.5 py-0.5 rounded">
                              {srv.discountPercent}% OFF
                            </span>
                          )}
                        </div>

                        {qty > 0 ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-between rounded-full px-3 py-1.5 border"
                            style={{ borderColor: '#A85842', background: '#FDFBF7' }}
                          >
                            <button
                              onClick={() => handleUpdateQuantity(srv.id, -1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-[#A85842] hover:bg-[#F7EBE8]"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold text-[#2D1F1D]">{qty} in cart</span>
                            <button
                              onClick={() => handleUpdateQuantity(srv.id, 1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-[#A85842] hover:bg-[#F7EBE8]"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(srv);
                            }}
                            disabled={isAdding}
                            className="w-full h-9 rounded-full text-xs font-semibold text-white shadow-xs transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-1.5"
                            style={{ background: '#A85842' }}
                          >
                            {isAdding ? 'Adding…' : 'Book Now →'}
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
          9. SERVICE DETAILS MODAL
          ======================================================== */}
      {selectedService && (
        <ServiceDetailsModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onBookNow={(srv) => {
            handleAddToCart(srv);
            setSelectedService(null);
          }}
        />
      )}

      {/* ========================================================
          10. STICKY BOTTOM FLOATING CART BAR
          ======================================================== */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 animate-slide-up">
          <div
            className="rounded-full p-2.5 sm:p-3 shadow-2xl border flex items-center justify-between text-white backdrop-blur-md"
            style={{
              background: '#2D1F1D',
              borderColor: '#4A3B32',
              boxShadow: '0 20px 40px -10px rgba(45, 31, 29, 0.4)',
            }}
          >
            <div className="flex items-center gap-3 pl-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: '#A85842' }}>
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-[#D6C7BE]">
                  {totalCartCount} {totalCartCount === 1 ? 'treatment' : 'treatments'}
                </p>
                <p className="text-sm font-bold text-white">₹{totalCartPrice.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <Button
              onClick={() => navigate('/cart')}
              className="h-10 px-5 rounded-full text-xs font-semibold text-white transition-transform hover:scale-105 active:scale-95"
              style={{ background: '#A85842' }}
            >
              View Cart →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
