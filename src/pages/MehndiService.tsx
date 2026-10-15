import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Search, Plus, Minus, Sparkles, Heart,
  Calendar, MapPin, Star, Tag, Gift, ChevronRight, Clock,
  X, Shield, Check, ArrowRight, Bookmark, Info, Flame, ThumbsUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { useWishlistStore } from '@/stores/wishlist';
import { supabase } from '@/lib/supabase';

interface MehndiServiceItem {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price: number;
  original_price?: number;
  discount_percent?: number;
  duration_minutes?: number;
  image_url: string | null;
  banner_urls?: string[];
  inclusions?: string[];
  rating?: number;
  review_count?: number;
  available: boolean;
}

interface MehndiCartItem {
  id: string;
  user_id: string;
  service_id: string;
  quantity: number;
  service?: MehndiServiceItem;
}

const MEHNDI_CATEGORIES = [
  { name: 'All', icon: '⭐', image: '/images/mehndi-traditional.jpg' },
  { name: 'Bridal Mehndi', icon: '👰', image: '/images/mehndi-bridal.jpg' },
  { name: 'Arabic Design', icon: '✨', image: '/images/mehndi-arabic.jpg' },
  { name: 'Indo-Western', icon: '💫', image: '/images/mehndi-traditional.jpg' },
  { name: 'Finger & Feet', icon: '🌸', image: '/images/mehndi-engagement.jpg' },
  { name: 'Minimalist & Floral', icon: '🌿', image: '/images/mehndi-minimal.jpg' },
  { name: 'Family & Guests', icon: '🎉', image: '/images/mehndi-festival.jpg' },
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
    banner_urls: [
      '/images/mehndi-bridal.jpg',
      '/images/mehndi-traditional.jpg',
      '/images/mehndi-engagement.jpg'
    ],
    inclusions: [
      'Both hands elbow-length bridal coverage',
      'Both feet mid-calf intricate work',
      '100% Organic certified Rajasthani henna cones',
      'Complimentary lemon-sugar spray & clove fumigation kit',
      'Free touch-up session before wedding'
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
    banner_urls: [
      '/images/mehndi-arabic.jpg',
      '/images/mehndi-minimal.jpg',
      '/images/mehndi-traditional.jpg'
    ],
    inclusions: [
      'Both hands front & back wrist coverage',
      'Chemical-free natural dark henna guarantee',
      'Quick drying formulation (stains in 24 hours)',
      'Complimentary nilgiri essential oil application'
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
    banner_urls: [
      '/images/mehndi-traditional.jpg',
      '/images/mehndi-bridal.jpg',
      '/images/mehndi-festival.jpg'
    ],
    inclusions: [
      'Palms and back of both hands',
      'Precise symmetrical mandala art',
      'Natural sojat leaf extract cones',
      'Sanitized single-use kit'
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
    banner_urls: [
      '/images/mehndi-engagement.jpg',
      '/images/mehndi-bridal.jpg',
      '/images/mehndi-traditional.jpg'
    ],
    inclusions: [
      'Both feet ankle-height intricate detailing',
      'No-slip organic formula',
      'Sugar-lemon glazing kit included',
      'Deep mahogany stain result'
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
    banner_urls: [
      '/images/mehndi-minimal.jpg',
      '/images/mehndi-arabic.jpg'
    ],
    inclusions: [
      'Both hands minimalist finger & wrist work',
      'Fast 15-minute drying henna',
      'Natural herbal color development'
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
    banner_urls: [
      '/images/mehndi-festival.jpg',
      '/images/mehndi-traditional.jpg'
    ],
    inclusions: [
      'Coverage for up to 5 family members or friends',
      'Choice between Arabic floral or delicate peacock bells',
      'Certified artist comes to your door with supplies',
      'Free organic cones for everyone'
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
    image_url: '/images/banner-neutral.png',
    banner_urls: [
      '/images/banner-neutral.png',
      '/images/banner-appointment.png',
      '/images/banner-elegant.png'
    ],
    inclusions: [
      'Elbow-length arms front and back',
      'Full feet coverage up to calves',
      'Groom name hidden puzzle incorporation',
      'Personalized consultation before date',
      'Premium herbal eucalyptus organic henna'
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
    image_url: '/images/banner-sunscreen.png',
    banner_urls: [
      '/images/banner-sunscreen.png',
      '/images/banner-service.png'
    ],
    inclusions: [
      'Both hands wrist to fingertips',
      'High-contrast shading technique',
      'All organic herbal ingredients'
    ],
    rating: 4.8,
    review_count: 674,
    available: true,
  }
];

export function MehndiService() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [services, setServices] = useState<MehndiServiceItem[]>(INITIAL_MEHNDI_SERVICES);
  const [cartItems, setCartItems] = useState<MehndiCartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<MehndiServiceItem | null>(null);
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
        .from('mehndi_services')
        .select('*')
        .eq('available', true)
        .order('category')
        .order('price');
      if (error) throw error;
      if (data && data.length > 0) {
        // Merge with initial rich structure
        const mapped: MehndiServiceItem[] = data.map((item, i) => {
          const fallback = INITIAL_MEHNDI_SERVICES[i % INITIAL_MEHNDI_SERVICES.length];
          return {
            id: item.id,
            category: item.category || fallback.category,
            name: item.name,
            description: item.description || fallback.description,
            price: item.price,
            original_price: item.original_price || Math.round(item.price * 1.35),
            discount_percent: item.discount_percent || Math.round(((Math.round(item.price * 1.35) - item.price) / Math.round(item.price * 1.35)) * 100),
            duration_minutes: item.duration_minutes || fallback.duration_minutes || 60,
            image_url: item.image_url || fallback.image_url,
            banner_urls: item.banner_urls || fallback.banner_urls,
            inclusions: item.inclusions || fallback.inclusions,
            rating: item.rating || 4.9,
            review_count: item.review_count || 450 + (i * 85),
            available: item.available ?? true,
          };
        });
        setServices(mapped);
      } else {
        setServices(INITIAL_MEHNDI_SERVICES);
      }
    } catch {
      setServices(INITIAL_MEHNDI_SERVICES);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('mehndi_cart_items')
        .select('*, service:mehndi_services(*)')
        .eq('user_id', user.id);
      setCartItems(data || []);
    } catch { /* silent */ }
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const added = toggleWishlist(id);
    toast({
      title: added ? 'Saved to Wishlist ❤️' : 'Removed from Wishlist',
      description: 'You can quickly access this later',
    });
  };

  const addToCart = async (service: MehndiServiceItem) => {
    if (!user) {
      toast({ title: 'Login Required', description: 'Please login to add mehndi services to cart', variant: 'destructive' });
      navigate('/login');
      return;
    }
    setAddingId(service.id);
    try {
      const existing = cartItems.find(i => i.service_id === service.id);
      if (existing) {
        await supabase.from('mehndi_cart_items').update({ quantity: existing.quantity + 1 }).eq('id', existing.id);
      } else {
        await supabase.from('mehndi_cart_items').insert({ user_id: user.id, service_id: service.id, quantity: 1 });
      }
      await fetchCart();
      toast({ title: '✨ Added to Cart!', description: service.name });
    } catch (error: any) {
      // Local cart fallback
      setCartItems(prev => {
        const found = prev.find(p => p.service_id === service.id);
        if (found) {
          return prev.map(p => p.service_id === service.id ? { ...p, quantity: p.quantity + 1 } : p);
        }
        return [...prev, { id: 'temp-' + Date.now(), user_id: user.id, service_id: service.id, quantity: 1, service }];
      });
      toast({ title: '✨ Added to Mehndi Cart!', description: service.name });
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
        await supabase.from('mehndi_cart_items').delete().eq('id', item.id);
      } catch {
        setCartItems(prev => prev.filter(p => p.service_id !== serviceId));
      }
    } else {
      try {
        await supabase.from('mehndi_cart_items').update({ quantity: newQty }).eq('id', item.id);
      } catch {
        setCartItems(prev => prev.map(p => p.service_id === serviceId ? { ...p, quantity: newQty } : p));
      }
    }
    await fetchCart();
  };

  const filteredServices = services.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCat = selectedCategory === 'All' || s.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const getQty = (id: string) => cartItems.find(i => i.service_id === id)?.quantity || 0;
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cartItems.reduce((s, i) => {
    const srv = services.find(x => x.id === i.service_id) || i.service;
    return s + (srv?.price || 0) * i.quantity;
  }, 0);

  return (
    <div className="min-h-screen" style={{ background: '#FDF7F2' }}>
      {/* Hero Banner with real background image */}
      <div className="relative overflow-hidden pt-24 pb-14 px-4 sm:px-6">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/images/banner-elegant.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.32) saturate(0.8)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(157,23,77,0.7) 0%, rgba(30,10,20,0.85) 60%, rgba(201,149,108,0.35) 100%)',
          }}
        />

        <div className="relative z-10 container-custom max-w-5xl text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-1.5 rounded-full mb-4 text-xs sm:text-sm font-medium border border-white/20">
            <Heart className="w-4 h-4 text-rose-300 fill-rose-300 animate-pulse" />
            100% Pure Organic Sojat Henna • Dark Stain Guarantee
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-3 tracking-tight">
            Artisanal <span style={{ color: '#e8c49a' }}>Mehndi</span> Studio & Doorstep
          </h1>
          <p className="text-base sm:text-lg text-white/90 mb-7 max-w-2xl mx-auto leading-relaxed">
            From intricate bridal storytelling to contemporary floral lace — handcrafted by master henna artists at your home.
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {[
              { icon: Sparkles, text: 'Chemical-Free Natural Cones' },
              { icon: Clock, text: 'On-Time Artist Arrival' },
              { icon: Shield, text: 'Sanitized Single-Use Kits' },
              { icon: Gift, text: 'Free Nilgiri & Clove Kit' },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="bg-white/12 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border border-white/15"
              >
                <Icon className="w-3.5 h-3.5 text-amber-300" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real Banner Strip */}
      <div
        className="py-3.5 border-y border-border/30 overflow-hidden"
        style={{ background: 'linear-gradient(90deg, rgba(190,24,93,0.06), rgba(201,149,108,0.1), rgba(190,24,93,0.06))' }}
      >
        <div className="container-custom flex items-center gap-4 overflow-x-auto scrollbar-hide">
          {['/images/banner-appointment.png', '/images/banner-neutral.png', '/images/banner-service.png', '/images/banner-spa.png'].map((img, i) => (
            <img
              key={i}
              src={img}
              alt="Mehndi showcase"
              className="h-16 sm:h-20 w-44 sm:w-56 rounded-xl object-cover flex-shrink-0 border border-border/40 shadow-sm"
            />
          ))}
          <div className="flex-shrink-0 text-xs text-muted-foreground font-semibold px-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500" /> Book for Weddings, Sangeet, Karwa Chauth &amp; Festivals
          </div>
        </div>
      </div>

      <div className="container-custom max-w-7xl py-8 px-4 sm:px-6">
        {/* Horizontal Category Strip with Images (as requested) */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-600" />
              Explore Mehndi Styles
            </h2>
            <span className="text-xs text-muted-foreground font-medium">Scroll horizontally →</span>
          </div>

          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 scrollbar-hide -mx-2 px-2">
            {MEHNDI_CATEGORIES.map(cat => {
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
                        ? 'border-rose-600 shadow-md shadow-rose-600/20 ring-2 ring-rose-600/30'
                        : 'border-border/70 hover:border-rose-400/60'
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
                      isSelected ? 'text-rose-600 font-bold' : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search bridal mehndi, arabic designs, finger cuffs, rates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 rounded-2xl border border-border/70 shadow-sm text-sm"
            style={{ background: 'rgba(255,255,255,0.9)' }}
          />
        </div>

        {/* Counter */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-6 font-medium">
          <span>
            Showing <strong className="text-foreground">{filteredServices.length}</strong> designs
            {selectedCategory !== 'All' && <span> in <span className="text-rose-600 font-bold">{selectedCategory}</span></span>}
          </span>
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <Shield className="w-3.5 h-3.5" /> Doorstep Artist Arrival within 45 Mins
          </span>
        </div>

        {/* E-Commerce Cards Grid — Faithful to user's uploaded mockup */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 mb-16">
          {filteredServices.map((service) => {
            const qty = getQty(service.id);
            const isAdding = addingId === service.id;
            const wishlisted = isInWishlist(service.id);
            const originalPrice = service.original_price || Math.round(service.price * 1.3);
            const discountPct = service.discount_percent || Math.round(((originalPrice - service.price) / originalPrice) * 100);

            return (
              <div
                key={service.id}
                onClick={() => navigate('/service/' + service.id, { state: { service } })}
                className="group rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-amber-200/60 hover:border-amber-400 flex flex-col hover:-translate-y-1 cursor-pointer"
                style={{ background: '#FFFFFF' }}
              >
                {/* Image Container with Wishlist + Blue/Accent '+' Button + Minutes bar */}
                <div className="relative h-40 sm:h-48 overflow-hidden bg-amber-50/50">
                  <img
                    src={service.image_url || '/images/mehndi-traditional.jpg'}
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

                  {/* '+' Add Button (Top Right — as in uploaded card) */}
                  {qty === 0 ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); addToCart(service); }}
                      disabled={isAdding}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl bg-amber-800 hover:bg-amber-900 text-white shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-10"
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
                      className="absolute top-2.5 right-2.5 bg-white/95 rounded-xl shadow-md p-0.5 flex items-center gap-1 z-10 border border-border"
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
                        className="w-6 h-6 rounded-lg bg-amber-800 hover:bg-amber-900 text-white flex items-center justify-center text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Duration Pill at bottom edge of image */}
                  <div className="absolute bottom-0 inset-x-0 bg-amber-50/95 py-1 text-center border-t border-amber-200/60">
                    <span className="text-xs font-semibold text-amber-900 tracking-wide">
                      {service.duration_minutes || 60} mins
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Badge row: Service Delivery & Rating badge */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900">
                        AT HOME
                      </span>
                      <div className="flex items-center gap-1 bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[11px] font-bold shadow-xs">
                        <Star className="w-3 h-3 fill-white text-white" />
                        <span>{service.rating || 4.9}</span>
                        <span className="text-white/80 font-normal text-[10px]">({service.review_count || 320})</span>
                      </div>
                    </div>

                    {/* Title: 2-line max ellipsis */}
                    <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug line-clamp-2 mb-1 group-hover:text-amber-800 transition-colors">
                      {service.name}
                    </h3>

                    {/* Subtitle / Description */}
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                      {service.description || 'Natural organic dark stain mehndi cone'}
                    </p>
                  </div>

                  {/* Discount & Price row */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-emerald-600">
                        {discountPct}% OFF
                      </span>
                      <div className="flex-1 border-t border-dashed border-emerald-300" />
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-foreground">
                        ₹{service.price}
                      </span>
                      {originalPrice > service.price && (
                        <span className="text-xs text-muted-foreground line-through font-medium">
                          ₹{originalPrice}
                        </span>
                      )}
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate('/service/' + service.id, { state: { service } }); }}
                      className="mt-2.5 w-full py-1.5 px-3 rounded-xl border border-amber-200 text-xs font-bold text-amber-900 hover:bg-amber-50 transition-colors flex items-center justify-center gap-1.5"
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
            className="container-custom max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-rose-200 flex items-center justify-between gap-4 animate-slide-up"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">
                  {cartCount} {cartCount === 1 ? 'Design' : 'Designs'} Added
                </p>
                <p className="text-xs text-muted-foreground">
                  Total: <strong className="text-rose-600 text-sm">₹{cartTotal}</strong>
                </p>
              </div>
            </div>

            <Button
              onClick={() => navigate('/mehndi-cart')}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl px-6 py-2.5 shadow-lg flex items-center gap-2"
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
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 text-foreground hover:bg-rose-600 hover:text-white shadow-md flex items-center justify-center transition-colors"
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
                      '/images/banner-appointment.png'
                    }
                    alt={selectedService.name}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-rose-700 shadow-sm">
                    {selectedService.category}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    <span>{selectedService.duration_minutes || 60} Minutes Service</span>
                  </div>
                </div>

                {/* Banner Thumbnails */}
                {selectedService.banner_urls && selectedService.banner_urls.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {selectedService.banner_urls.map((banner, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveBannerIdx(idx)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                          activeBannerIdx === idx ? 'border-rose-600 ring-2 ring-rose-600/30' : 'border-border opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={banner} alt="Thumbnail" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Guarantees Box */}
              <div className="mt-5 p-4 rounded-2xl bg-rose-50 border border-rose-200/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-rose-800">
                  <Shield className="w-4 h-4 text-rose-600" />
                  Satguru Authentic Guarantee
                </div>
                <p className="text-rose-900/80 leading-relaxed">
                  100% triple-filtered Sojat henna powder infused with pure Eucalyptus, Clove, and Tea Tree essential oils. Safe for all skin types, pregnant women & kids.
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
                    <span>{selectedService.rating || 4.9}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-semibold">
                    ({selectedService.review_count || 1200} Customer Reviews)
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
                  <span className="text-3xl font-black text-rose-700">
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
                    { id: 'hygiene', label: 'Stain Tips' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`pb-2 transition-colors border-b-2 -mb-[1px] ${
                        activeTab === tab.id
                          ? 'border-rose-600 text-rose-600'
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
                      'Artist home visit with all organic cones',
                      'Application with fine nozzle for laser precision',
                      'Nilgiri & Clove oil activation mist',
                      'Post-care dark stain instructions sheet',
                    ]).map((inc, i) => (
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
                      <strong>Doorstep Procedure:</strong> Artist arrives with a sanitized roll mat, disposable hand rests, and freshly mixed organic henna paste made 24 hours prior for optimum lawsone dye release.
                    </p>
                    <p>
                      <strong>Design Customization:</strong> You can show custom Pinterest or Instagram reference photos to the artist during the session.
                    </p>
                  </div>
                )}

                {/* Tab 3: Stain Tips */}
                {activeTab === 'hygiene' && (
                  <div className="space-y-2 mb-6 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <Flame className="w-4 h-4 text-amber-600" /> For the Darkest Stain:
                    </div>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Keep henna on skin for at least 6 to 8 hours.</li>
                      <li>Scrape off with mustard oil or butter — avoid water for 24 hours.</li>
                      <li>Inhale warm clove steam fumes over the hands for deep burgundy tone.</li>
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
                        className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <Button
                      onClick={() => { setSelectedService(null); navigate('/mehndi-cart'); }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-12"
                    >
                      Go to Cart (₹{cartTotal})
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => addToCart(selectedService)}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl h-12 shadow-lg flex items-center justify-center gap-2"
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
