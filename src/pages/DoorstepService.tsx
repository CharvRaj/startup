import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Search, Plus, Minus, Sparkles, MapPin, Gift,
  Tag, Calendar, Heart, Clock, Star, Zap, ChevronRight, ChevronLeft,
  X, Shield, Check, ArrowRight, Bookmark, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { useWishlistStore } from '@/stores/wishlist';
import { supabase } from '@/lib/supabase';
import type { DoorstepService as DoorstepServiceType, CartItem } from '@/types';

const CATEGORY_ITEMS = [
  { name: 'All', icon: '⭐', image: '/images/banner-appointment.png' },
  { name: 'Face & Clean-up', icon: '✨', image: '/images/service-face.png' },
  { name: 'Hair & Styling', icon: '💇‍♀️', image: '/images/service-hair.png' },
  { name: 'Skin Glow & Detan', icon: '🌸', image: '/images/service-skincare.png' },
  { name: 'Facial Rituals', icon: '🧖‍♀️', image: '/images/service-facial.png' },
  { name: 'Nails & Pedicure', icon: '💅', image: '/images/banner-sunscreen.png' },
  { name: 'Bridal Artistry', icon: '👰', image: '/images/banner-elegant.png' },
  { name: 'Waxing & Threading', icon: '🪶', image: '/images/banner-relaxing.png' },
];

const INITIAL_DOORSTEP_SERVICES: (DoorstepServiceType & {
  original_price?: number;
  discount_percent?: number;
  rating?: number;
  review_count?: number;
  banner_urls?: string[];
  inclusions?: string[];
})[] = [
  {
    id: 'ds-hydra-glow',
    name: 'Hydra-Infusion Glow & Deep Pore Facial',
    category: 'Facial Rituals',
    description: 'High-frequency oxygen bubble infusion, ultrasonic blackhead extraction, and calming rose-quartz lymphatic massage.',
    price: 1499,
    original_price: 1999,
    discount_percent: 25,
    duration_minutes: 60,
    image_url: '/images/service-facial.png',
    banner_urls: ['/images/service-facial.png', '/images/banner-skincare.png', '/images/banner-relaxing.png'],
    inclusions: [
      'Double cleanse with botanical cleansing balm',
      'Ultrasonic pore skin-scrubber extraction',
      'Hyaluronic acid high-pressure cold oxygen spray',
      'Peel-off alginate rubber antioxidant mask',
      'Single-use sealed sanitization toolkit'
    ],
    rating: 4.9,
    review_count: 1420,
    available: true,
  },
  {
    id: 'ds-bridal-hd',
    name: 'Luxe Bridal HD Glow Makeup & Styling',
    category: 'Bridal Artistry',
    description: 'Signature HD water-resistant camera makeup using international MAC, Huda Beauty & Charlotte Tilbury products.',
    price: 3999,
    original_price: 5499,
    discount_percent: 27,
    duration_minutes: 120,
    image_url: '/images/service-face.png',
    banner_urls: ['/images/service-face.png', '/images/banner-appointment.png', '/images/banner-elegant.png'],
    inclusions: [
      'Skin-prep hydrating serum & pore-blurring base',
      'Custom 3D mink eyelashes application',
      'Hair crimping, puffing, extensions & floral styling',
      'Dupatta draping and jewelry pinning assistance',
      'Complimentary touchup kit (lipstick sample & blotting paper)'
    ],
    rating: 5.0,
    review_count: 2150,
    available: true,
  },
  {
    id: 'ds-keratin-spa',
    name: 'Organic Keratin Hair Spa & Scalp Therapy',
    category: 'Hair & Styling',
    description: 'Deep intensive protein moisture mask, hot ozone steam therapy, and 20-minute relaxing neck-shoulder acupressure.',
    price: 999,
    original_price: 1399,
    discount_percent: 29,
    duration_minutes: 45,
    image_url: '/images/service-hair.png',
    banner_urls: ['/images/service-hair.png', '/images/banner-beauty-spa.png', '/images/banner-service.png'],
    inclusions: [
      'Sulfate-free clarifying scalp wash',
      'Deep protein fiber restoration cream application',
      'Micro-mist hair steamer hydration bath',
      'Moroccan argan oil serum finish & blow dry'
    ],
    rating: 4.8,
    review_count: 980,
    available: true,
  },
  {
    id: 'ds-detan-body',
    name: 'Milk & Honey Anti-Tan Brightening Pack',
    category: 'Skin Glow & Detan',
    description: 'Kojic acid and lactic milk extracts gently dissolve stubborn UV tanning on face, neck, and arms.',
    price: 699,
    original_price: 999,
    discount_percent: 30,
    duration_minutes: 35,
    image_url: '/images/service-skincare.png',
    banner_urls: ['/images/service-skincare.png', '/images/banner-sunscreen.png', '/images/banner-neutral.png'],
    inclusions: [
      'Walnut & apricot micro-scrub exfoliation',
      'Active milk tan-removal pack with brush application',
      'Aloe vera soothing cool down gel massage',
      'SPF 50 broad spectrum sun shield shield'
    ],
    rating: 4.7,
    review_count: 840,
    available: true,
  },
  {
    id: 'ds-spa-pedicure',
    name: 'Crystal Jelly Spa Pedicure & Callus Peel',
    category: 'Nails & Pedicure',
    description: 'Aromatic therapeutic jelly soak, organic sugar scrub, heel buffering, cuticles care, and gel polish finish.',
    price: 799,
    original_price: 1199,
    discount_percent: 33,
    duration_minutes: 50,
    image_url: '/images/banner-sunscreen.png',
    banner_urls: ['/images/banner-sunscreen.png', '/images/banner-spa.png', '/images/banner-relaxing.png'],
    inclusions: [
      'Disinfected disposable pedicure tub liner',
      'Warm lavender essential crystal jelly bath',
      'Dead skin callus buffing & cuticle care',
      'Shea butter reflexology foot massage',
      'Long-lasting chip resistant nail lacquer'
    ],
    rating: 4.8,
    review_count: 670,
    available: true,
  },
  {
    id: 'ds-rica-wax',
    name: 'Italian Rica Aloe Wax (Full Arms & Legs)',
    category: 'Waxing & Threading',
    description: '100% colophony-free Italian liposoluble wax for sensitive skin. Minimal pain, zero redness, and silky smooth finish.',
    price: 849,
    original_price: 1200,
    discount_percent: 29,
    duration_minutes: 40,
    image_url: '/images/banner-relaxing.png',
    banner_urls: ['/images/banner-relaxing.png', '/images/service-facial.png', '/images/banner-neutral.png'],
    inclusions: [
      'Full arms and full legs coverage',
      'Pre-wax cleansing and oil absorbing powder',
      'Single-dip hygiene spatula guarantee',
      'Post-wax calming chamomile oil soothe'
    ],
    rating: 4.9,
    review_count: 1120,
    available: true,
  },
  {
    id: 'ds-clean-threading',
    name: 'Instant Fruit Clean-up + Eyebrows Threading',
    category: 'Face & Clean-up',
    description: 'Enzyme papain fruit cleanse followed by antimicrobial organic thread eyebrow contouring & upper lip clean.',
    price: 499,
    original_price: 699,
    discount_percent: 29,
    duration_minutes: 30,
    image_url: '/images/service-face.png',
    banner_urls: ['/images/service-face.png', '/images/banner-service.png', '/images/banner-spa.png'],
    inclusions: [
      'Papaya gentle skin brightening cleanser',
      'Herbal steam & whitehead removal',
      'Organic anti-bacterial thread shaping',
      'Cooling mint astringent lotion'
    ],
    rating: 4.8,
    review_count: 940,
    available: true,
  },
  {
    id: 'ds-party-glam',
    name: 'Evening Glam Cocktail Party Makeup',
    category: 'Face & Clean-up',
    description: 'Smokey or soft shimmer eye makeup with long-wearing dewy contour, setting mist, and elegant hair curls.',
    price: 1899,
    original_price: 2500,
    discount_percent: 24,
    duration_minutes: 75,
    image_url: '/images/banner-appointment.png',
    banner_urls: ['/images/banner-appointment.png', '/images/service-hair.png', '/images/banner-elegant.png'],
    inclusions: [
      'Customized eye look & waterproof mascara',
      'Flawless blend foundation & highlight',
      'Heat-styled loose beach waves or curls',
      'Setting spray lock for 12 hours'
    ],
    rating: 4.9,
    review_count: 1310,
    available: true,
  }
];

export function DoorstepService() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [services, setServices] = useState<any[]>(INITIAL_DOORSTEP_SERVICES);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc'>('recommended');
  const [durationFilter, setDurationFilter] = useState<'all' | 'under45' | '60plus'>('all');
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'details' | 'more-info' | 'hygiene'>('details');
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    fetchServices();
    if (user) fetchCart();
  }, [user]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('doorstep_services')
        .select('*')
        .eq('available', true)
        .order('category')
        .order('price');
      if (error) throw error;
      if (data && data.length > 0) {
        const mapped = data.map((item, i) => {
          const fallback = INITIAL_DOORSTEP_SERVICES[i % INITIAL_DOORSTEP_SERVICES.length];
          return {
            ...item,
            original_price: item.original_price || Math.round(item.price * 1.35),
            discount_percent: item.discount_percent || Math.round(((Math.round(item.price * 1.35) - item.price) / Math.round(item.price * 1.35)) * 100),
            duration_minutes: item.duration_minutes || fallback.duration_minutes || 45,
            image_url: item.image_url || fallback.image_url,
            banner_urls: item.banner_urls || fallback.banner_urls,
            inclusions: item.inclusions || fallback.inclusions,
            rating: item.rating || 4.8,
            review_count: item.review_count || 480 + (i * 90),
          };
        });
        setServices(mapped);
      } else {
        setServices(INITIAL_DOORSTEP_SERVICES);
      }
    } catch {
      setServices(INITIAL_DOORSTEP_SERVICES);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('cart_items')
        .select('*, service:doorstep_services(*)')
        .eq('user_id', user.id);
      setCartItems(data || []);
    } catch { /* silent */ }
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const added = toggleWishlist(id);
    toast({
      title: added ? 'Saved to Wishlist ❤️' : 'Removed from Wishlist',
      description: 'Quickly access from your profile',
    });
  };

  const addToCart = async (service: any) => {
    if (!user) {
      toast({ title: 'Login Required', description: 'Please login to add services to cart', variant: 'destructive' });
      navigate('/login');
      return;
    }
    setAddingId(service.id);
    try {
      const existingItem = cartItems.find(item => item.service_id === service.id);
      if (existingItem) {
        await supabase.from('cart_items').update({ quantity: existingItem.quantity + 1 }).eq('id', existingItem.id);
      } else {
        await supabase.from('cart_items').insert({ user_id: user.id, service_id: service.id, quantity: 1 });
      }
      await fetchCart();
      toast({ title: '🛒 Added to Cart!', description: service.name });
    } catch (error: any) {
      setCartItems(prev => {
        const found = prev.find(p => p.service_id === service.id);
        if (found) {
          return prev.map(p => p.service_id === service.id ? { ...p, quantity: p.quantity + 1 } : p);
        }
        return [...prev, { id: 'temp-' + Date.now(), user_id: user.id, service_id: service.id, quantity: 1, service }];
      });
      toast({ title: '🛒 Added to Cart!', description: service.name });
    } finally {
      setAddingId(null);
    }
  };

  const updateQuantity = async (serviceId: string, delta: number) => {
    const item = cartItems.find(i => i.service_id === serviceId);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty < 1) {
      try {
        await supabase.from('cart_items').delete().eq('id', item.id);
      } catch {
        setCartItems(prev => prev.filter(p => p.service_id !== serviceId));
      }
    } else {
      try {
        await supabase.from('cart_items').update({ quantity: newQty }).eq('id', item.id);
      } catch {
        setCartItems(prev => prev.map(p => p.service_id === serviceId ? { ...p, quantity: newQty } : p));
      }
    }
    await fetchCart();
  };

  let filteredServices = services.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchDuration = durationFilter === 'all'
      ? true
      : durationFilter === 'under45'
      ? (s.duration_minutes || 45) <= 45
      : (s.duration_minutes || 45) >= 60;
    const matchRating = (s.rating || 4.8) >= ratingFilter;
    return matchSearch && matchCat && matchDuration && matchRating;
  });

  if (sortBy === 'price-asc') {
    filteredServices = [...filteredServices].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filteredServices = [...filteredServices].sort((a, b) => b.price - a.price);
  }

  const getQty = (id: string) => cartItems.find(i => i.service_id === id)?.quantity || 0;
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cartItems.reduce((s, i) => {
    const srv = services.find(x => x.id === i.service_id) || (i.service as any);
    return s + (srv?.price || 0) * i.quantity;
  }, 0);

  return (
    <div className="min-h-screen" style={{ background: '#FFF9F5' }}>
      {/* Editorial Luxury Hero Banner */}
      <div className="pt-24 pb-10 px-4 sm:px-6">
        <div className="container-custom max-w-7xl">
          <div
            className="rounded-3xl sm:rounded-[36px] p-6 sm:p-10 md:p-12 border shadow-lg relative overflow-hidden"
            style={{
              background: '#FFFFFF',
              borderColor: '#F5DCE1',
              boxShadow: '0 20px 45px -15px rgba(84,35,55,0.06)',
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: '#F5DCE1', color: '#542337', border: '1px solid rgba(200,62,104,0.2)' }}>
                  <Sparkles className="w-3.5 h-3.5 text-[#C83E68]" />
                  Verified Salon Stylists &amp; Aestheticians at Your Doorstep
                </div>

                <h1
                  className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight"
                  style={{ color: '#342A29', fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Doorstep{' '}
                  <span className="italic" style={{ color: '#C83E68' }}>
                    Beauty &amp; Wellness
                  </span>
                </h1>

                <p className="text-sm sm:text-base leading-relaxed text-[#542337]/80 max-w-xl">
                  Enjoy professional salon care in the comfort and privacy of your home. Certified aestheticians arrive with single-use sealed kits, sanitized equipment, and premium skincare.
                </p>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  {[
                    { icon: Gift, text: 'Free Visit on Orders ₹499+' },
                    { icon: Star, text: 'Top 1% Rated Stylists' },
                    { icon: Shield, text: '100% Sanitized Tools & Kits' },
                    { icon: Clock, text: 'Doorstep in 30-45 Mins' },
                  ].map(({ icon: Icon, text }) => (
                    <div
                      key={text}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border"
                      style={{ background: '#FFF9F5', borderColor: '#F5DCE1', color: '#342A29' }}
                    >
                      <Icon className="w-3.5 h-3.5 text-[#C83E68]" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Natural photo */}
              <div className="lg:col-span-5 flex items-center justify-center">
                <div
                  className="rounded-3xl overflow-hidden border-4 shadow-xl w-full max-w-md relative"
                  style={{ borderColor: '#FFFFFF', boxShadow: '0 20px 40px -10px rgba(84,35,55,0.12)' }}
                >
                  <img
                    src="/images/banner-appointment.png"
                    alt="Doorstep beauty service treatment"
                    className="w-full h-64 sm:h-80 object-cover object-center"
                    style={{ filter: 'none', opacity: 1 }}
                  />
                  <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-md border border-[#F5DCE1] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-[#342A29]">Hydrating Glow Care</p>
                      <p className="text-[10px] text-[#542337]/70">Single-use sealed hygiene kit</p>
                    </div>
                    <span className="text-xs font-black text-[#C83E68]">From ₹499</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom max-w-7xl py-4 px-4 sm:px-6">
        {/* Cross-Promo Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div
            className="group relative overflow-hidden rounded-2xl cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            onClick={() => navigate('/mehndi-service')}
          >
            <div className="relative h-36 sm:h-40 overflow-hidden">
              <img src="/images/banner-elegant.png" alt="Mehndi Services" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(190,24,93,0.78) 0%, rgba(157,23,77,0.85) 100%)' }} />
              <div className="absolute inset-0 flex items-center px-6">
                <div className="text-white">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Heart className="w-5 h-5 text-rose-300 fill-rose-300 animate-pulse" />
                    <h3 className="font-display font-bold text-xl">Mehndi at Home</h3>
                  </div>
                  <p className="text-white/90 text-sm mb-3">Bridal, Arabic &amp; Festive Henna starting ₹399</p>
                  <span className="inline-flex items-center gap-1 bg-white text-pink-700 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                    Browse Mehndi Designs <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            className="group relative overflow-hidden rounded-2xl cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            onClick={() => { navigate('/'); setTimeout(() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
          >
            <div className="relative h-36 sm:h-40 overflow-hidden">
              <img src="/images/banner-beauty-spa.png" alt="Salon Booking" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.78) 0%, rgba(79,70,229,0.85) 100%)' }} />
              <div className="absolute inset-0 flex items-center px-6">
                <div className="text-white">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Calendar className="w-5 h-5 text-purple-300" />
                    <h3 className="font-display font-bold text-xl">Visit Our Salon Studio</h3>
                  </div>
                  <p className="text-white/90 text-sm mb-3">Private VIP lounges &amp; senior master stylists</p>
                  <span className="inline-flex items-center gap-1 bg-white text-purple-700 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                    Book Salon Slot <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Category Strip with Images (as uploaded by user) */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Explore Doorstep Categories
            </h2>
            <span className="text-xs text-muted-foreground font-medium">Scroll horizontally →</span>
          </div>

          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 scrollbar-hide -mx-2 px-2">
            {CATEGORY_ITEMS.map(cat => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex flex-col items-center gap-2 flex-shrink-0 transition-all duration-200 group ${
                    isSelected ? 'scale-105' : 'hover:scale-105'
                  }`}
                >
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all shadow-sm relative ${
                      isSelected
                        ? 'border-primary shadow-md shadow-primary/20 ring-2 ring-primary/30'
                        : 'border-border/70 hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition-colors" />
                    <span className="absolute bottom-1 right-1 text-xs bg-black/60 rounded px-1 text-white">
                      {cat.icon}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold whitespace-nowrap text-center max-w-[85px] leading-tight ${
                      isSelected ? 'text-primary font-bold' : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Filter Discovery Section */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search facials, hair spa, waxing…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 rounded-2xl border border-[#F5DCE1] shadow-xs text-sm bg-white focus:border-[#C83E68]"
            />
          </div>

          {/* Filter & Sort Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Left Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-[#342A29] uppercase tracking-wider text-[11px]">Duration:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'under45', label: '≤ 45 mins' },
                { id: '60plus', label: '60+ mins' },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDurationFilter(d.id as any)}
                  className={`px-3 py-1 rounded-full font-semibold border transition-all ${
                    durationFilter === d.id
                      ? 'bg-[#C83E68] text-white border-[#C83E68] shadow-xs'
                      : 'bg-white text-[#542337] border-[#F5DCE1] hover:bg-[#F5DCE1]/40'
                  }`}
                >
                  {d.label}
                </button>
              ))}

              <span className="font-bold text-[#342A29] uppercase tracking-wider text-[11px] ml-2">Rating:</span>
              {[
                { val: 0, label: 'All' },
                { val: 4.8, label: '4.8★ & up' },
              ].map((r) => (
                <button
                  key={r.val}
                  onClick={() => setRatingFilter(r.val)}
                  className={`px-3 py-1 rounded-full font-semibold border transition-all ${
                    ratingFilter === r.val
                      ? 'bg-[#C83E68] text-white border-[#C83E68] shadow-xs'
                      : 'bg-white text-[#542337] border-[#F5DCE1] hover:bg-[#F5DCE1]/40'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Right Sort Controls */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#342A29] uppercase tracking-wider text-[11px]">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-8 px-3 rounded-xl border border-[#F5DCE1] bg-white text-xs font-semibold text-[#342A29] focus:outline-none focus:border-[#C83E68]"
              >
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Counter */}
        <div className="flex items-center justify-between text-xs text-[#542337]/75 mb-6 font-medium">
          <span>
            Showing <strong className="text-[#342A29]">{filteredServices.length}</strong> doorstep treatments
            {selectedCategory !== 'All' && <span> in <span className="text-[#C83E68] font-bold">{selectedCategory}</span></span>}
          </span>
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <Shield className="w-3.5 h-3.5" /> 100% Mess-Free • Clean Up Guarantee
          </span>
        </div>

        {/* E-Commerce Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 mb-16">
          {filteredServices.map((service) => {
            const qty = getQty(service.id);
            const isAdding = addingId === service.id;
            const wishlisted = isInWishlist(service.id);
            const originalPrice = service.original_price || Math.round(service.price * 1.35);
            const discountPct = service.discount_percent || Math.round(((originalPrice - service.price) / originalPrice) * 100);

            return (
              <div
                key={service.id}
                onClick={() => navigate('/service/' + service.id, { state: { service } })}
                className="group rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-[#F5DCE1] hover:border-[#C83E68]/40 flex flex-col hover:-translate-y-1 cursor-pointer"
                style={{ background: '#FFFFFF' }}
              >
                {/* Image Container with Wishlist + Blue '+' Button + Minutes bar */}
                <div className="relative h-40 sm:h-48 overflow-hidden bg-[#FFF9F5]">
                  <img
                    src={service.image_url || '/images/service-facial.png'}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    style={{ filter: 'none', opacity: 1 }}
                  />

                  {/* Bookmark / Wishlist Icon (Top Left) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleBookmark(service.id, e); }}
                    className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md shadow-sm flex items-center justify-center transition-colors z-10"
                    title="Save to Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${wishlisted ? 'fill-[#C83E68] text-[#C83E68]' : 'text-slate-400 hover:text-[#C83E68]'}`} />
                  </button>

                  {/* '+' Add Button (Top Right) */}
                  {qty === 0 ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); addToCart(service); }}
                      disabled={isAdding}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl bg-[#C83E68] hover:bg-[#A82E52] text-white shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-10"
                      title="Quick Add"
                    >
                      {isAdding ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Plus className="w-5 h-5 font-bold" />
                      )}
                    </button>
                  ) : (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-2.5 right-2.5 bg-white/95 rounded-xl shadow-md p-0.5 flex items-center gap-1 z-10 border border-[#F5DCE1]"
                    >
                      <button
                        onClick={() => updateQuantity(service.id, -1)}
                        className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-rose-100 text-gray-700 flex items-center justify-center text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold px-1 text-foreground">{qty}</span>
                      <button
                        onClick={() => updateQuantity(service.id, 1)}
                        className="w-6 h-6 rounded-lg bg-[#C83E68] hover:bg-[#A82E52] text-white flex items-center justify-center text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Duration Pill at bottom edge of image */}
                  <div className="absolute bottom-0 inset-x-0 bg-slate-100/95 py-1 text-center border-t border-slate-200/60">
                    <span className="text-xs font-semibold text-slate-700 tracking-wide">
                      {service.duration_minutes || 45} mins
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Badge row: Service Delivery & Rating badge */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        10 MINS ARRIVAL
                      </span>
                      <div className="flex items-center gap-1 bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[11px] font-bold shadow-xs">
                        <Star className="w-3 h-3 fill-white text-white" />
                        <span>{service.rating || 4.8}</span>
                        <span className="text-white/80 font-normal text-[10px]">({service.review_count || 1100})</span>
                      </div>
                    </div>

                    {/* Title: 2-line max ellipsis */}
                    <h3 className="font-bold text-sm sm:text-base text-[#342A29] leading-snug line-clamp-2 mb-1 group-hover:text-[#C83E68] transition-colors">
                      {service.name}
                    </h3>

                    {/* Subtitle / Description */}
                    <p className="text-xs text-[#542337]/75 line-clamp-1 mb-2">
                      {service.description || 'Professional home salon service'}
                    </p>
                  </div>

                  {/* Discount & Price row */}
                  <div className="pt-2 border-t border-[#F5DCE1]/60">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-emerald-600">
                        {discountPct}% OFF
                      </span>
                      <div className="flex-1 border-t border-dashed border-emerald-300" />
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-[#342A29]">
                        ₹{service.price}
                      </span>
                      {originalPrice > service.price && (
                        <span className="text-xs text-muted-foreground line-through font-medium">
                          ₹{originalPrice}
                        </span>
                      )}
                    </div>

                    {/* View Details Action Link */}
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate('/service/' + service.id, { state: { service } }); }}
                      className="mt-2.5 w-full py-1.5 px-3 rounded-xl border border-[#F5DCE1] text-xs font-bold text-[#C83E68] hover:bg-[#F5DCE1]/40 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-5 inset-x-0 z-40 px-4">
          <div
            className="container-custom max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-primary/20 flex items-center justify-between gap-4 animate-slide-up"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-md">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">
                  {cartCount} {cartCount === 1 ? 'Service' : 'Services'} Added
                </p>
                <p className="text-xs text-muted-foreground">
                  Total: <strong className="text-primary text-sm">₹{cartTotal}</strong>
                </p>
              </div>
            </div>

            <Button
              onClick={() => navigate('/cart')}
              className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 py-2.5 shadow-lg flex items-center gap-2"
            >
              View Cart &amp; Book
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* E-Commerce Product Detail Modal (Left Images, Right Details) */}
      {selectedService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedService(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col md:flex-row border border-border/40"
            style={{ background: '#FDF7F2' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 text-foreground hover:bg-primary hover:text-white shadow-md flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Side: Service Images / Banners Carousel */}
            <div className="w-full md:w-1/2 p-5 sm:p-7 flex flex-col justify-between bg-white/60 border-b md:border-b-0 md:border-r border-border/40">
              <div>
                {/* Main Image */}
                <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden shadow-md mb-3 bg-muted/20">
                  <img
                    src={
                      (selectedService.banner_urls && selectedService.banner_urls[activeBannerIdx]) ||
                      selectedService.image_url ||
                      '/images/service-facial.png'
                    }
                    alt={selectedService.name}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
                    {selectedService.category}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    <span>{selectedService.duration_minutes || 45} Minutes Treatment</span>
                  </div>
                </div>

                {/* Banner Thumbnails */}
                {selectedService.banner_urls && selectedService.banner_urls.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {selectedService.banner_urls.map((banner: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setActiveBannerIdx(idx)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                          activeBannerIdx === idx ? 'border-primary ring-2 ring-primary/30' : 'border-border opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={banner} alt="Thumbnail" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Hygiene Guarantee Box */}
              <div className="mt-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
                  <Shield className="w-4 h-4 text-amber-600" />
                  Medical-Grade Sanitization Kit
                </div>
                <p className="text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
                  Every aesthetician carries a sealed single-use kit opened in front of you. 100% disposable sheets, sanitized headbands & sterilized brushes.
                </p>
              </div>
            </div>

            {/* Right Side: Details & Add to Cart */}
            <div className="w-full md:w-1/2 p-5 sm:p-7 flex flex-col justify-between">
              <div>
                {/* Header info */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 bg-emerald-600 text-white px-2.5 py-0.5 rounded-md text-xs font-bold shadow-xs">
                    <Star className="w-3 h-3 fill-white text-white" />
                    <span>{selectedService.rating || 4.8}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-semibold">
                    ({selectedService.review_count || 980} Verified Bookings)
                  </span>
                </div>

                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  {selectedService.name}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {selectedService.description}
                </p>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mb-5 p-3 rounded-2xl bg-white/80 border border-border/50">
                  <span className="text-3xl font-black text-primary">
                    ₹{selectedService.price}
                  </span>
                  {selectedService.original_price && selectedService.original_price > selectedService.price && (
                    <>
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{selectedService.original_price}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Save ₹{selectedService.original_price - selectedService.price} ({selectedService.discount_percent}%)
                      </span>
                    </>
                  )}
                </div>

                {/* Tabs: Details vs More Info vs Hygiene */}
                <div className="flex border-b border-border/60 mb-4 gap-4 text-xs font-bold">
                  {[
                    { id: 'details', label: "What's Included" },
                    { id: 'more-info', label: 'More Banners & Info' },
                    { id: 'hygiene', label: 'Safety Checklist' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`pb-2 transition-colors border-b-2 -mb-[1px] ${
                        activeTab === tab.id
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab 1: What's Included */}
                {activeTab === 'details' && (
                  <div className="space-y-2 mb-6">
                    {(selectedService.inclusions || [
                      'Professional certified aesthetician with tool station',
                      'Disposable bed roll & sanitized protective drape',
                      'Dermatologically tested branded consumables',
                      'Zero-waste mess clean-up after service',
                    ]).map((inc: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-foreground/90">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 2: More Info & Banners */}
                {activeTab === 'more-info' && (
                  <div className="space-y-3 mb-6 text-xs text-muted-foreground">
                    <p>
                      <strong>Doorstep Setup:</strong> All our stylists arrive with portable ring lights, multi-plug extension cords, and warm towel steamers. You only need to provide a chair and power outlet.
                    </p>
                    <p>
                      <strong>Products Guarantee:</strong> We only use 100% genuine sealed single-dose products from MAC, Kryolan, O3+, and Lotus Professional.
                    </p>
                  </div>
                )}

                {/* Tab 3: Safety Checklist */}
                {activeTab === 'hygiene' && (
                  <div className="space-y-2 mb-6 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <Shield className="w-4 h-4 text-emerald-600" /> COVID &amp; Skin Safety Protocols:
                    </div>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Double-masked artist with sanitized gloves</li>
                      <li>Sterilized scissors &amp; tweezers using UV barbicide</li>
                      <li>Disposable wax strips &amp; wooden spatulas (no double dipping)</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border/50 flex items-center gap-3">
                {getQty(selectedService.id) > 0 ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-border rounded-xl bg-white shadow-sm p-1">
                      <button
                        onClick={() => updateQuantity(selectedService.id, -1)}
                        className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center font-bold"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-bold text-sm">
                        {getQty(selectedService.id)}
                      </span>
                      <button
                        onClick={() => updateQuantity(selectedService.id, 1)}
                        className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-bold"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <Button
                      onClick={() => { setSelectedService(null); navigate('/cart'); }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-12"
                    >
                      Go to Cart (₹{cartTotal})
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => addToCart(selectedService)}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-xl h-12 shadow-lg flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add Service to Cart • ₹{selectedService.price}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
