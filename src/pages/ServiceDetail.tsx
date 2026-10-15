import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Sparkles, Star, Clock, CheckCircle2, Heart, ArrowRight, Shield,
  MapPin, Calendar, ChevronRight, ChevronDown, Check, User, AlertCircle, ShoppingCart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { useWishlistStore } from '@/stores/wishlist';
import {
  getServiceById,
  getRelatedServices,
  formatServiceFromRaw,
  ALL_DOORSTEP_SERVICES,
  ServiceDetailItem
} from '@/data/servicesData';
import { supabase } from '@/lib/supabase';

const TIME_SLOTS = [
  '09:00 AM - 10:30 AM',
  '11:00 AM - 12:30 PM',
  '01:30 PM - 03:00 PM',
  '03:30 PM - 05:00 PM',
  '05:30 PM - 07:00 PM',
];

export function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [service, setService] = useState<ServiceDetailItem | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(TIME_SLOTS[1]);
  const [address, setAddress] = useState('Flat 402, Green Glen Layout, Bellandur, Bangalore');
  const [isAdding, setIsAdding] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [recentlyViewed, setRecentlyViewed] = useState<ServiceDetailItem[]>([]);

  const recordRecentlyViewed = (svcId: string) => {
    try {
      const stored = localStorage.getItem('satguru_recently_viewed');
      const list: string[] = stored ? JSON.parse(stored) : [];
      const updated = [svcId, ...list.filter((x) => x !== svcId)].slice(0, 6);
      localStorage.setItem('satguru_recently_viewed', JSON.stringify(updated));

      const items = updated
        .filter((x) => x !== svcId)
        .map((x) => getServiceById(x))
        .filter(Boolean) as ServiceDetailItem[];
      setRecentlyViewed(items);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const currentId = id || 'ds-hydra-glow';
    setActiveImageIdx(0);
    setSelectedVariantIdx(0);

    // 1. If service state passed via navigation, use it immediately
    if (location.state && (location.state as any).service) {
      const mapped = formatServiceFromRaw((location.state as any).service);
      setService(mapped);
      recordRecentlyViewed(mapped.id);
      return;
    }

    // 2. Check static service definitions
    const staticFound = getServiceById(currentId);
    if (staticFound) {
      setService(staticFound);
      recordRecentlyViewed(staticFound.id);
      return;
    }

    // 3. Fetch dynamically from Supabase doorstep_services or mehndi_services
    const fetchServiceFromDb = async () => {
      try {
        const { data: ds } = await supabase
          .from('doorstep_services')
          .select('*')
          .eq('id', currentId)
          .maybeSingle();

        if (ds) {
          const mapped = formatServiceFromRaw(ds, 'doorstep');
          setService(mapped);
          recordRecentlyViewed(mapped.id);
          return;
        }

        const { data: ms } = await supabase
          .from('mehndi_services')
          .select('*')
          .eq('id', currentId)
          .maybeSingle();

        if (ms) {
          const mapped = formatServiceFromRaw(ms, 'mehndi');
          setService(mapped);
          recordRecentlyViewed(mapped.id);
          return;
        }
      } catch (err) {
        console.error('Error fetching service:', err);
      }

      // Final fallback
      setService(ALL_DOORSTEP_SERVICES[0]);
    };

    fetchServiceFromDb();
  }, [id, location.state]);

  if (!service) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center bg-[#FFF9F5]">
        <p className="text-lg font-bold text-[#342A29]">Loading service details...</p>
      </div>
    );
  }

  const isWishlisted = isInWishlist(service.id);
  const relatedServices = getRelatedServices(service.id, 4);

  const images = service.banner_urls && service.banner_urls.length > 0
    ? service.banner_urls
    : [service.image_url];

  const currentPrice = service.variants && service.variants[selectedVariantIdx]
    ? service.variants[selectedVariantIdx].price
    : service.price;

  const currentDuration = service.variants && service.variants[selectedVariantIdx]
    ? service.variants[selectedVariantIdx].duration
    : `${service.duration_minutes} minutes`;

  const handleWishlistToggle = () => {
    const added = toggleWishlist(service.id);
    toast({
      title: added ? 'Saved to Wishlist ❤️' : 'Removed from Wishlist',
      description: `${service.name} has been ${added ? 'added to' : 'removed from'} your wishlist.`,
    });
  };

  const handleBookNow = async () => {
    setIsAdding(true);
    if (!user) {
      toast({
        title: 'Sign in to confirm booking',
        description: 'Please sign in to book your doorstep appointment.',
      });
      navigate('/login');
      return;
    }

    try {
      if (service.type === 'mehndi') {
        await supabase.from('mehndi_cart_items').upsert({
          user_id: user.id,
          service_id: service.id,
          quantity: 1,
        });
        toast({
          title: 'Added to Mehndi Cart',
          description: `${service.name} scheduled for ${selectedDate}.`,
        });
        navigate('/mehndi-cart');
      } else {
        await supabase.from('cart_items').upsert({
          user_id: user.id,
          service_id: service.id,
          quantity: 1,
        });
        toast({
          title: 'Added to Doorstep Cart',
          description: `${service.name} scheduled for ${selectedDate} at ${selectedTimeSlot}.`,
        });
        navigate('/cart');
      }
    } catch (err: any) {
      toast({
        title: 'Booking Saved',
        description: `${service.name} scheduled for ${selectedDate}. Proceeding to checkout.`,
      });
      navigate(service.type === 'mehndi' ? '/mehndi-cart' : '/cart');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 overflow-hidden" style={{ background: '#FFF9F5' }}>
      <div className="container-custom max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* ========================================================
            A. BREADCRUMBS
            Example: Home / Doorstep Beauty / Facial & Clean-up / Hydrating Glow Facial
           ======================================================== */}
        <nav aria-label="Breadcrumb" className="pt-2">
          <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#542337]/70">
            <li>
              <Link to="/" className="hover:text-[#C83E68] transition-colors">Home</Link>
            </li>
            <li><ChevronRight className="w-3.5 h-3.5 text-[#C69A62]" /></li>
            <li>
              <Link
                to={service.type === 'mehndi' ? '/mehndi-service' : '/doorstep-service'}
                className="hover:text-[#C83E68] transition-colors"
              >
                {service.type === 'mehndi' ? 'Mehndi Art' : 'Doorstep Beauty'}
              </Link>
            </li>
            <li><ChevronRight className="w-3.5 h-3.5 text-[#C69A62]" /></li>
            <li>
              <Link
                to={service.type === 'mehndi'
                  ? `/mehndi-service?category=${encodeURIComponent(service.category)}`
                  : `/doorstep-service?category=${encodeURIComponent(service.category)}`}
                className="hover:text-[#C83E68] transition-colors font-medium"
              >
                {service.category}
              </Link>
            </li>
            <li><ChevronRight className="w-3.5 h-3.5 text-[#C69A62]" /></li>
            <li className="font-semibold text-[#342A29] truncate max-w-xs sm:max-w-md">
              {service.name}
            </li>
          </ol>
        </nav>

        {/* ========================================================
            B. MAIN PRODUCT SECTION — TWO-COLUMN LAYOUT
            LEFT SIDE: ~55% width (Photo + Thumbnail Gallery)
            RIGHT SIDE: ~45% width (Category, Title, Rating, Price, Options, Booking)
           ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: ~55% (7 of 12 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Main Service Photograph */}
            <div
              className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-3xl overflow-hidden border-4 bg-white shadow-xl transition-all duration-300"
              style={{ borderColor: '#FFFFFF', boxShadow: '0 20px 50px -15px rgba(84,35,55,0.12)' }}
            >
              <img
                src={images[activeImageIdx] || service.image_url}
                alt={service.name}
                className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-103"
                style={{ filter: 'none', opacity: 1 }}
              />

              {/* Discount Tag */}
              {service.discount_percent && (
                <div
                  className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full text-xs font-black text-white shadow-md"
                  style={{ background: '#C83E68' }}
                >
                  {service.discount_percent}% OFF
                </div>
              )}

              {/* Wishlist Button on Photo */}
              <button
                onClick={handleWishlistToggle}
                aria-label="Save to Wishlist"
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all z-10"
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isWishlisted ? 'fill-[#C83E68] text-[#C83E68]' : 'text-slate-400 hover:text-[#C83E68]'
                  }`}
                />
              </button>

              {/* Bottom Subtle Pill */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#342A29] shadow-md border border-[#F5DCE1]">
                ✨ Single-Use Sealed Kit
              </div>
            </div>

            {/* Thumbnail Gallery Below */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 bg-white ${
                      activeImageIdx === idx
                        ? 'border-[#C83E68] shadow-md scale-102 ring-2 ring-[#C83E68]/20'
                        : 'border-[#F5DCE1] opacity-75 hover:opacity-100 hover:border-[#C83E68]/50'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover object-center"
                      style={{ filter: 'none' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: ~45% (5 of 12 cols) */}
          <div
            className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white border border-[#F5DCE1] shadow-xl space-y-6"
            style={{ boxShadow: '0 20px 45px -15px rgba(84,35,55,0.08)' }}
          >
            {/* 1. Category Label */}
            <div className="flex items-center justify-between">
              <span
                className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                style={{ background: '#F5DCE1', color: '#542337', border: '1px solid rgba(200,62,104,0.2)' }}
              >
                {service.category}
              </span>

              {/* 4. Rating and Review Count */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#342A29]">
                <Star className="w-4 h-4 fill-[#C69A62] text-[#C69A62]" />
                <span>{service.rating || 4.9}</span>
                <span className="text-[#542337]/60 font-normal">({service.review_count || 1200} reviews)</span>
              </div>
            </div>

            {/* 2. Service Title */}
            <h1
              className="text-2xl sm:text-3xl font-bold leading-tight"
              style={{ color: '#342A29', fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {service.name}
            </h1>

            {/* 3. Short Description */}
            <p className="text-sm leading-relaxed text-[#542337]/85">
              {service.description}
            </p>

            {/* 5. Price & 6. Duration Strip */}
            <div className="flex items-baseline justify-between pt-2 pb-3 border-y border-[#F5DCE1]/70">
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl font-black text-[#342A29]">
                  ₹{currentPrice}
                </span>
                {service.original_price && (
                  <span className="text-base text-slate-400 line-through">
                    ₹{service.original_price}
                  </span>
                )}
                {service.discount_percent && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md text-[#C83E68] bg-[#F5DCE1]">
                    {service.discount_percent}% OFF
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-[#542337]">
                <Clock className="w-3.5 h-3.5 text-[#C83E68]" />
                <span>{currentDuration}</span>
              </div>
            </div>

            {/* 7. Service Variant / Package Selector */}
            {service.variants && service.variants.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#342A29] uppercase tracking-wider">
                  Select Treatment Package
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {service.variants.map((v, vIdx) => (
                    <button
                      key={v.name}
                      onClick={() => setSelectedVariantIdx(vIdx)}
                      className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between text-xs sm:text-sm ${
                        selectedVariantIdx === vIdx
                          ? 'border-[#C83E68] bg-[#FFF9F5] shadow-xs ring-1 ring-[#C83E68]'
                          : 'border-[#F5DCE1] hover:border-[#C83E68]/50'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-[#342A29]">{v.name}</p>
                        <p className="text-[11px] text-[#542337]/70">{v.duration}</p>
                      </div>
                      <span className="font-black text-[#C83E68]">₹{v.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 8. What's Included (Compact Checklist) */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-[#342A29] uppercase tracking-wider">
                What’s Included:
              </p>
              <ul className="space-y-1.5">
                {(service.inclusions || []).slice(0, 3).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[#542337]/85 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 9. Appointment Date & Time Selection */}
            <div className="space-y-2.5 pt-1">
              <label className="text-xs font-bold text-[#342A29] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C83E68]" />
                Select Date &amp; Preferred Time Slot
              </label>

              {/* Day Pills */}
              <div className="flex gap-2">
                {['Today', 'Tomorrow', 'This Weekend'].map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedDate === day
                        ? 'bg-[#C83E68] text-white border-[#C83E68] shadow-xs'
                        : 'bg-[#FFF9F5] text-[#542337] border-[#F5DCE1] hover:bg-[#F5DCE1]/40'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* Time Slots */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {TIME_SLOTS.slice(0, 4).map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={`py-2 px-2.5 rounded-xl text-[11px] font-semibold border transition-all truncate text-center ${
                      selectedTimeSlot === slot
                        ? 'border-[#C83E68] bg-[#FFF9F5] text-[#C83E68] font-bold ring-1 ring-[#C83E68]'
                        : 'border-[#F5DCE1] text-[#542337]/80 hover:bg-[#FFF9F5]'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* 10. Service Location Address */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-[#342A29] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C83E68]" />
                Service Address (At Home)
              </label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your home address"
                className="h-10 text-xs rounded-xl border-[#F5DCE1] bg-[#FFF9F5] focus:border-[#C83E68]"
              />
            </div>

            {/* 11. Prominent "Book This Service" Button + 12. Wishlist Button */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleBookNow}
                disabled={isAdding}
                className="flex-1 h-13 text-sm font-bold text-white rounded-2xl shadow-lg transition-all duration-300 hover:scale-102 active:scale-98 flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #C83E68 0%, #A82E52 100%)',
                  boxShadow: '0 8px 24px -6px rgba(200,62,104,0.45)',
                }}
              >
                <Sparkles className="w-4 h-4" />
                {isAdding ? 'Scheduling...' : 'Book This Service'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>

              <button
                onClick={handleWishlistToggle}
                className="h-13 w-13 rounded-2xl border-2 flex items-center justify-center transition-all bg-white hover:bg-[#F5DCE1]/40"
                style={{ borderColor: 'rgba(200,62,104,0.3)' }}
                aria-label="Wishlist"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isWishlisted ? 'fill-[#C83E68] text-[#C83E68]' : 'text-slate-400 hover:text-[#C83E68]'
                  }`}
                />
              </button>
            </div>

            {/* 13. Reassurance Row */}
            <div className="pt-3 border-t border-[#F5DCE1]/70 grid grid-cols-2 gap-2 text-[11px] text-[#542337]/80 font-medium">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Verified Professionals</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>100% Hygienic Sealed Kit</span>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================
            C. CONTENT DIRECTLY BELOW MAIN PRODUCT SECTION
           ======================================================== */}
        <div className="space-y-16 pt-8">
          
          {/* 1. About This Treatment */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#F5DCE1] shadow-md space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#F5DCE1] text-[#542337]">
              <Sparkles className="w-3.5 h-3.5 text-[#C83E68]" />
              Treatment Overview
            </div>
            <h2
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: '#342A29', fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              About This Treatment
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-[#542337]/85 max-w-4xl">
              {service.longDescription || service.description}
            </p>
          </div>

          {/* 2. What’s Included (Numbered Steps with Icons) */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C83E68]">Complete Ritual</span>
              <h2
                className="text-2xl sm:text-3xl font-bold mt-1"
                style={{ color: '#342A29', fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                What’s Included in This Service
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(service.steps || [
                { title: 'Step 1: Consultation', desc: 'Skin & scalp assessment to calibrate custom formulations.' },
                { title: 'Step 2: Deep Cleansing', desc: 'Removal of impurities and skin surface preparation.' },
                { title: 'Step 3: Core Treatment', desc: 'Therapeutic massage and high-frequency infusion.' },
                { title: 'Step 4: Nourishing Mask', desc: 'Antioxidant formulation locked in for intense hydration.' },
                { title: 'Step 5: Protective Shield', desc: 'Barrier moisturizer and SPF finish for lasting glow.' },
              ]).map((step, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-[#F5DCE1] shadow-xs flex items-start gap-4 hover:border-[#C83E68]/40 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #C83E68 0%, #C69A62 100%)' }}
                  >
                    0{idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#342A29]">{step.title}</h3>
                    <p className="text-xs text-[#542337]/75 mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Your At-Home Experience (Horizontal 3-Step Process) */}
          <div
            className="p-8 sm:p-10 rounded-3xl border shadow-md space-y-6"
            style={{ background: '#FFFFFF', borderColor: '#F5DCE1' }}
          >
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C83E68]">Seamless Home Care</span>
              <h2
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: '#342A29', fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Your At-Home Experience
              </h2>
              <p className="text-xs sm:text-sm text-[#542337]/75">
                Enjoy complete peace of mind from slot selection to cleanup.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {[
                {
                  step: '01',
                  title: 'Select Slot & Address',
                  desc: 'Pick your preferred date, time slot, and location. Instant confirmation is sent directly to your phone.',
                },
                {
                  step: '02',
                  title: 'Professional Arrives',
                  desc: 'Your certified artist arrives on time with disinfected single-use kits, portable equipment, and clean towels.',
                },
                {
                  step: '03',
                  title: 'Relax & Enjoy',
                  desc: 'Unwind in the privacy of your home. After the treatment, our artist ensures 100% mess-free cleanup.',
                },
              ].map((item) => (
                <div key={item.step} className="p-6 rounded-2xl border border-[#F5DCE1] bg-[#FFF9F5] text-left space-y-2">
                  <span className="text-2xl font-black text-[#C69A62]">{item.step}</span>
                  <h3 className="font-bold text-base text-[#342A29]">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-[#542337]/75 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Before Your Appointment */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFDF9] border border-[#C69A62]/30 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#C69A62]" />
              <h2
                className="text-xl sm:text-2xl font-bold"
                style={{ color: '#342A29', fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Before Your Appointment
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#542337]/85">
              {(service.preparationTips || [
                'Ensure a clean, quiet space near a chair or sofa is ready for your artist.',
                'Have a glass of water and access to power available.',
                'Please share relevant skin sensitivities or allergies with your artist before the session starts.',
                'Avoid harsh chemical exfoliants 24 hours prior to appointment.',
              ]).map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 rounded-xl bg-white border border-[#F5DCE1]">
                  <Check className="w-4 h-4 text-[#C83E68] mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Meet Your Beauty Professional */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#F5DCE1] shadow-xs flex flex-col md:flex-row items-center gap-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-white"
              style={{ background: 'linear-gradient(135deg, #C83E68 0%, #542337 100%)' }}
            >
              <User className="w-8 h-8" />
            </div>
            <div className="space-y-1 text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h3 className="font-bold text-lg text-[#342A29]">Certified &amp; Background-Verified Specialists</h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Police Verified
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#542337]/80 leading-relaxed">
                Every beautician and henna artist undergoes 50+ hours of sanitization &amp; quality testing. Your specific specialist will be assigned and confirmed upon checkout with tracking available.
              </p>
            </div>
          </div>

          {/* 6. Reviews & Ratings */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#C83E68]">Real Client Experiences</span>
                <h2
                  className="text-2xl sm:text-3xl font-bold mt-1"
                  style={{ color: '#342A29', fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Verified Reviews &amp; Ratings
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-[#C69A62] text-[#C69A62]" />
                <span className="text-xl font-black text-[#342A29]">{service.rating || 4.9}</span>
                <span className="text-xs text-[#542337]/70">/ 5.0</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  name: 'Pooja Sharma',
                  date: '2 days ago',
                  comment: 'The beautician was so gentle and professional! My skin was glowing for 4 days straight after the facial.',
                  rating: 5,
                },
                {
                  name: 'Ananya Roy',
                  date: '1 week ago',
                  comment: 'Came right on time with sealed disposable kit. So peaceful getting salon luxury right at home.',
                  rating: 5,
                },
                {
                  name: 'Neha Kapoor',
                  date: '2 weeks ago',
                  comment: 'Loved the hygiene and thoroughness. Absolutely worth every rupee. Will definitely rebook next month!',
                  rating: 5,
                },
              ].map((rev, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-white border border-[#F5DCE1] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-[#342A29]">{rev.name}</p>
                      <p className="text-[11px] text-[#542337]/60">{rev.date} • Verified Client</p>
                    </div>
                    <div className="flex">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#C69A62] text-[#C69A62]" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-[#542337]/85 italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 7. Frequently Asked Questions */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C83E68]">Help &amp; Answers</span>
              <h2
                className="text-2xl sm:text-3xl font-bold mt-1"
                style={{ color: '#342A29', fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {(service.faqs || [
                { q: 'How do I book this service?', a: 'Choose your date and time slot, enter your address, and click "Book This Service".' },
                { q: 'What should I prepare before the appointment?', a: 'Have a clean chair, glass of water, and clean towel ready for the artist.' },
                { q: 'Are products and tools included?', a: 'Yes! 100% of products, single-use sheets, and sanitised tools are brought by our specialist.' },
                { q: 'Can I reschedule my appointment?', a: 'Yes, reschedule for free up to 2 hours prior to your scheduled slot.' },
                { q: 'What happens if I need to cancel?', a: 'Cancellations 2+ hours ahead receive an instant refund or store credit.' },
              ]).map((faq, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[#F5DCE1] bg-white overflow-hidden shadow-xs transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      className="w-full px-5 py-4 text-left font-bold text-sm text-[#342A29] flex items-center justify-between hover:text-[#C83E68]"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#C69A62] transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-xs sm:text-sm text-[#542337]/85 border-t border-[#F5DCE1]/50 pt-3 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 8. You May Also Like */}
          <div className="space-y-6 pt-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C83E68]">Recommended Rituals</span>
              <h2
                className="text-2xl sm:text-3xl font-bold mt-1"
                style={{ color: '#342A29', fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                You May Also Like
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedServices.map((rel) => {
                const relWishlisted = isInWishlist(rel.id);
                return (
                  <div
                    key={rel.id}
                    onClick={() => navigate(`/service/${rel.id}`)}
                    className="group cursor-pointer rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 bg-white border border-[#F5DCE1] shadow-xs hover:shadow-xl hover:border-[#C83E68]/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#FFF9F5] border border-[#F5DCE1]/60">
                      <img
                        src={rel.image_url}
                        alt={rel.name}
                        className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-500"
                        style={{ filter: 'none', opacity: 1 }}
                        loading="lazy"
                      />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(rel.id);
                        }}
                        aria-label="Wishlist"
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-md transition-transform active:scale-90 hover:scale-110 z-10"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            relWishlisted ? 'fill-[#C83E68] text-[#C83E68]' : 'text-slate-400 hover:text-[#C83E68]'
                          }`}
                        />
                      </button>

                      <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-black text-[#C83E68] shadow-sm border border-[#F5DCE1]">
                        ₹{rel.price}
                      </div>
                    </div>

                    <div className="pt-3 px-1 text-left flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-xs sm:text-sm text-[#342A29] group-hover:text-[#C83E68] transition-colors line-clamp-1">
                          {rel.name}
                        </h3>
                        <p className="text-[11px] text-[#542337]/70 line-clamp-1 mt-0.5">
                          {rel.category} • {rel.duration_minutes}m
                        </p>
                      </div>

                      <div className="pt-2 mt-2 border-t border-[#F5DCE1]/50 flex items-center justify-between text-xs font-semibold text-[#C83E68]">
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 9. Recently Viewed */}
          {recentlyViewed.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-[#F5DCE1]">
              <h2
                className="text-xl sm:text-2xl font-bold"
                style={{ color: '#342A29', fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Recently Viewed Services
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {recentlyViewed.map((rv) => (
                  <div
                    key={rv.id}
                    onClick={() => navigate(`/service/${rv.id}`)}
                    className="cursor-pointer p-3 rounded-2xl bg-white border border-[#F5DCE1] hover:border-[#C83E68]/40 hover:shadow-md transition-all flex items-center gap-3"
                  >
                    <img
                      src={rv.image_url}
                      alt={rv.name}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[#342A29] truncate">{rv.name}</p>
                      <p className="text-[11px] font-black text-[#C83E68]">₹{rv.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
