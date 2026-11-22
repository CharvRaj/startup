import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Crown, Heart, CheckCircle2, Phone, Calendar, ArrowRight,
  ShieldCheck, Clock, MapPin, ChevronDown, Star, MessageCircle, X,
  Eye, Scissors, Gem, Award, Check, Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';

interface BridalPackage {
  id: string;
  name: string;
  tagline: string;
  price: string;
  badge?: string;
  popular?: boolean;
  image: string;
  description: string;
  duration: string;
  features: string[];
  whatsAppText: string;
}

interface TimelineStep {
  step: number;
  timeframe: string;
  title: string;
  subtitle: string;
  description: string;
  treatments: string[];
  icon: string;
}

interface AddonService {
  name: string;
  price: string;
  tagline: string;
  description: string;
  popular?: boolean;
}

const BRIDAL_PACKAGES: BridalPackage[] = [
  {
    id: 'classic',
    name: 'Classic Bride',
    tagline: 'Timeless elegance with natural radiant glow',
    price: '₹15,000',
    duration: '2.5 - 3 Hours',
    image: '/images/bridal-gallery/satguru-bride-4.jpg',
    description: 'Perfect for the bride who loves understated, classic heritage beauty that stays fresh throughout the rituals.',
    features: [
      'High-Definition (HD) base makeup with skin prep',
      'Custom bridal hairstyle with floral or hair accessories setting',
      'Dupatta, veil & heritage jewellery setting',
      'Mink lashes & 16-hour smudge-free lip finishing',
      'Pre-bridal skin glow consultation',
      '1 Pre-bridal hydrating fruit facial session',
      'On-site studio or local venue assistance',
    ],
    whatsAppText: 'Hello Satguru Makeup Arts! I want to enquire about the Classic Bride Package (₹15,000). My wedding date is: ',
  },
  {
    id: 'signature',
    name: 'Signature Bride',
    tagline: 'Our most requested royal transformation',
    price: '₹25,000',
    badge: 'MOST LOVED',
    popular: true,
    duration: '3.5 - 4 Hours',
    image: '/images/bridal-gallery/satguru-bride-2.jpg',
    description: 'The definitive bridal experience. Ultra HD or Airbrush base with sculpted contouring, hair extensions, and a bridal trial.',
    features: [
      'Choice of Ultra HD or Luxury Airbrush waterproof base',
      'Advanced bridal hair styling with premium volume extensions',
      'Double dupatta draping & royal lehenga pleating',
      '3D lashes, sculpted contouring & glass-skin highlighter',
      '1 Complimentary bridal look trial at our Singhana studio',
      '3 Pre-bridal sessions (Fruit, De-tan & Gold radiance facials)',
      'Complimentary emergency bridal touch-up kit for pheras',
      'Dedicated senior bridal master artist',
    ],
    whatsAppText: 'Hello Satguru Makeup Arts! I would love to book the Signature Bride Package (₹25,000). My wedding date is: ',
  },
  {
    id: 'royal',
    name: 'Royal Empress Bride',
    tagline: 'Uncompromising luxury for the once-in-a-lifetime bride',
    price: '₹40,000',
    badge: 'ROYAL BESPOKE',
    duration: 'Full Day Care',
    image: '/images/bridal-gallery/satguru-bride-1.jpg',
    description: 'The pinnacle of bridal pampering. Includes two distinct looks, full pre-bridal body polishing, family makeup, and royal entourage care.',
    features: [
      'Everything included in Signature Package',
      'Second complete bridal look transition for Reception / Sangeet',
      '2 Comprehensive bridal trials before the wedding week',
      'Full pre-bridal regime: 3 luxury facials + full body polish & de-tan',
      'Intensive hair spa & restorative therapy 2 days prior',
      'Deluxe spa manicure & pedicure package',
      'Complimentary full party makeup for 1 immediate family member',
      'Senior master stylist on standby until departure (Vidai)',
    ],
    whatsAppText: 'Hello Satguru Makeup Arts! I am interested in the Royal Empress Bride Package (₹40,000). My wedding date is: ',
  },
];

const PRE_BRIDAL_TIMELINE: TimelineStep[] = [
  {
    step: 1,
    timeframe: '3 Months Before',
    title: 'Skin & Hair Architecture',
    subtitle: 'Foundation Consultation & Scalp Health',
    description: 'We analyze your skin tone, texture, sensitivity and bridal outfit palette to craft a customized glow schedule.',
    treatments: ['Detailed skin moisture & tone analysis', 'Scalp detox & protein hair spa', 'Personalized daily AM/PM skincare regimen'],
    icon: '✨',
  },
  {
    step: 2,
    timeframe: '1 Month Before',
    title: 'Hydrating Fruit Radiance',
    subtitle: 'Facial 1: Deep Cellular Hydration',
    description: 'Gentle fruit enzymes unclog deep pores, remove summer pigmentation, and restore skin barrier glow.',
    treatments: ['Antioxidant botanical scrub', 'Aroma steam & extraction', 'Nutrient fruit pack & face lymph drainage'],
    icon: '🌸',
  },
  {
    step: 3,
    timeframe: '15 Days Before',
    title: '24K Gold Luminosity',
    subtitle: 'Facial 2: Brightening & Even Tone',
    description: 'Infusion of 24K nano gold leaves to boost collagen synthesis, fade dark circles, and bring out royal inner luminescence.',
    treatments: ['De-tan herbal face & neck peel', 'Gold serum pressure-point massage', 'Collagen peptide firming mask'],
    icon: '👑',
  },
  {
    step: 4,
    timeframe: '2 Days Before',
    title: 'Instant-Glow & Velvet Prep',
    subtitle: 'Facial 3: Pre-Ceremony Calming',
    description: 'Zero-redness calming facial, pain-free precision threading, and silky waxing to create the glass canvas for wedding makeup.',
    treatments: ['Soothing ice-globe cooling therapy', 'Ultra-gentle threading & waxing', 'Hyaluronic moisture seal'],
    icon: '💎',
  },
  {
    step: 5,
    timeframe: 'The Big Day',
    title: 'Your Masterpiece Bridal Look',
    subtitle: 'Flawless 18-Hour Wedding Day Execution',
    description: 'Seamless skin prep, HD airbrush base, majestic hair styling, dupatta pin-setting, and bridal kit handover.',
    treatments: ['Cryo skin tightening prep', 'Transfer-resistant bridal base', 'Dupatta & lehenga symmetry draping'],
    icon: '👰',
  },
];

const ADDONS: AddonService[] = [
  {
    name: 'Party Makeup & Hair',
    price: 'From ₹3,500',
    tagline: 'Mother, Sisters & Bridesmaids',
    description: 'Flawless HD party makeup with matching hair do that harmonizes with the bride without overshadowing.',
    popular: true,
  },
  {
    name: 'Engagement or Reception Look',
    price: 'From ₹12,000',
    tagline: 'Cocktail & Sangeet Glamour',
    description: 'Modern, soft glam or glitter eye look styled with contemporary waves or chic Hollywood buns.',
    popular: true,
  },
  {
    name: 'Saree & Lehenga Draping',
    price: 'From ₹1,500',
    tagline: 'Razor-Sharp Symmetry',
    description: 'Iron-pressed pleats, secure pin-work, can-can fluffing, and dupatta locking that withstands hours of dancing.',
  },
  {
    name: 'Hair Spa & Smoothing Therapy',
    price: 'From ₹2,000',
    tagline: 'Deep Restorative Shine',
    description: 'Intense keratin conditioning, split-end smoothing, and mirror-shine gloss before the wedding rituals.',
  },
  {
    name: 'Mehendi Day Fresh Look',
    price: 'From ₹6,000',
    tagline: 'Dewy & Floral Chic',
    description: 'Lightweight waterproof base, floral braid styling, and fresh dewy cheeks built for day rituals.',
  },
  {
    name: 'Bridal Family Combo Package',
    price: 'Custom Quote',
    tagline: 'Entourage & Relatives Bundle',
    description: 'Special discounted group packages for 4+ family members with dedicated on-site assistant artists.',
  },
];

const LOOKS_GALLERY = [
  {
    id: 1,
    src: '/images/bridal-gallery/satguru-bride-1.jpg',
    category: 'velvet',
    title: 'Royal Velvet Empress',
    outfit: 'Deep Crimson & Zardozi Velvet',
    details: 'Heavy Kundan bib, statement mathapatti, 3D lashes and velvety matte lips.',
  },
  {
    id: 2,
    src: '/images/bridal-gallery/satguru-bride-2.jpg',
    category: 'velvet',
    title: 'Heritage Velvet Glow',
    outfit: 'Wine Velvet with Floral Border',
    details: 'Sheer scalloped dupatta drape, luminous golden eye contour, delicate floral bun.',
  },
  {
    id: 3,
    src: '/images/bridal-gallery/satguru-bride-3.jpg',
    category: 'regal',
    title: 'Classic Scarlet Heritage',
    outfit: 'Traditional Scarlet Red & Gold',
    details: 'Multi-strand pearl rani haar, immaculate winged eyeliner, signature red bindi.',
  },
  {
    id: 4,
    src: '/images/bridal-gallery/satguru-bride-4.jpg',
    category: 'poshak',
    title: 'Rajputana Royal Poshak',
    outfit: 'Imperial Saffron Rajputi Poshak',
    details: 'Authentic Sheeshpatti, Borla, Aad necklace with soft kohl eyes and radiant cheek glow.',
  },
  {
    id: 5,
    src: '/images/bridal-gallery/satguru-bride-5.jpg',
    category: 'regal',
    title: 'Emerald & Maroon Majesty',
    outfit: 'Maroon Velvet with Mint Green Drops',
    details: 'Choker with emerald drops, double dupatta drape, kalire setting and dewy base.',
  },
  {
    id: 6,
    src: '/images/bridal-gallery/satguru-bride-6.jpg',
    category: 'velvet',
    title: 'Contemporary Wine Royalty',
    outfit: 'Rich Wine Zari Lehenga',
    details: 'Layered emerald necklace, bold pout, defined brow architecture and glass skin.',
  },
  {
    id: 7,
    src: '/images/bridal-gallery/satguru-bride-7.jpg',
    category: 'regal',
    title: 'Golden Belted Grandeur',
    outfit: 'Embroidered Waistbelt & Velvet',
    details: 'Royal Kamarbandh cinch, peach net dupatta drape, high-definition camera-ready finish.',
  },
  {
    id: 8,
    src: '/images/bridal-gallery/satguru-bride-8.jpg',
    category: 'reception',
    title: 'Crushed Velvet Diva',
    outfit: 'Crushed Wine Silk Lehenga',
    details: 'Statement hathphool, vintage nose ring, smoky plum shadow and sculpted cheekbones.',
  },
  {
    id: 9,
    src: '/images/bridal-gallery/satguru-bride-9.jpg',
    category: 'regal',
    title: 'Imperial Palace Bride',
    outfit: 'Heavy Handworked Maroon Ensemble',
    details: 'Golden latkan tassels, sheer veil framing, airbrush matte finish for flash photography.',
  },
  {
    id: 10,
    src: '/images/bridal-gallery/satguru-bride-10.jpg',
    category: 'entourage',
    title: 'The Royal Bridal Trio',
    outfit: 'Coordinated Sister & Bride Ensembles',
    details: 'Harmonious shades of vermilion, wine, and gold for the entire bridal entourage.',
  },
  {
    id: 16,
    src: '/images/bridal-gallery/satguru-bride-16.jpg',
    category: 'velvet',
    title: 'Royal Maroon Couture',
    outfit: 'Heavy Handcrafted Zari Velvet',
    details: 'Traditional temple jewelry, custom lehenga pleats, long-wear waterproof skin lock.',
  },
  {
    id: 17,
    src: '/images/bridal-gallery/satguru-bride-17.jpg',
    category: 'regal',
    title: 'Gilded Crimson Goddess',
    outfit: 'Double Bordered Royal Crimson',
    details: 'High-definition bridal glam, statement borla, sheer shimmer veil and flawless drape.',
  },
  {
    id: 18,
    src: '/images/bridal-gallery/satguru-bride-18.jpg',
    category: 'reception',
    title: 'Velvet Noir Radiance',
    outfit: 'Deep Wine Couture Lehenga',
    details: 'Luminous glass finish, precision lip contour, sculpted arches and regal demeanor.',
  },
];

const COMPARISON_ROWS = [
  { feature: 'High-Definition (HD) Base with Skin Prep', classic: '✓ Standard HD', signature: '✓ Ultra HD / Airbrush', royal: '✓ Ultra HD / Airbrush' },
  { feature: 'Waterproof & 18-Hour Flash-Proof Setting', classic: '✓', signature: '✓', royal: '✓' },
  { feature: 'Hair Styling & Volume Extensions', classic: 'Hairstyle only', signature: '✓ Extensions Included', royal: '✓ Extensions Included' },
  { feature: 'Lehenga, Double Dupatta & Jewellery Draping', classic: '✓', signature: '✓', royal: '✓' },
  { feature: 'Bridal Trial at Singhana Studio', classic: 'Paid Add-on', signature: '1 Complimentary Trial', royal: '2 Complete Trials' },
  { feature: 'Pre-Bridal Skincare Facials', classic: '1 Hydrating Session', signature: '3 Targeted Sessions', royal: '3 Sessions + Body Polish' },
  { feature: 'Hair Spa & Spa Mani-Pedi Treatment', classic: '—', signature: '—', royal: '✓ Complete Package' },
  { feature: 'Family Member Party Makeup Included', classic: '—', signature: '—', royal: '✓ 1 Free Look (Value ₹3.5k)' },
  { feature: 'Second Look for Reception / Sangeet', classic: '—', signature: '—', royal: '✓ Included' },
  { feature: 'Complimentary Touch-Up Kit for Mandap', classic: '—', signature: '✓ Included', royal: '✓ Included' },
];

const STEPS = [
  {
    num: '01',
    title: 'Connect & Share Date',
    desc: 'Send us your wedding date, venue location, and lehenga photos on WhatsApp.',
  },
  {
    num: '02',
    title: 'Book Studio Trial',
    desc: 'Visit our Singhana studio to test makeup textures, hairstyling, and draping.',
  },
  {
    num: '03',
    title: 'Lock In Your Date',
    desc: 'Confirm your custom package, add-ons, and artist slot with a simple advance.',
  },
  {
    num: '04',
    title: 'Glow on Your Big Day',
    desc: 'We arrive on time, keep you relaxed, and craft your picture-perfect bridal glow.',
  },
];

const BRIDAL_TICKER_ROW_1 = [
  'Royal Bridal Makeup',
  'Airbrush & Ultra HD Base',
  'Rajputana Poshak Styling',
  'Double Dupatta Setting',
  '24K Gold Pre-Bridal Radiance',
  'Hair Volume Extensions',
  'Mehendi Day Floral Look',
  'Sangeet Soft Glam',
  'Reception Velvet Diva',
  '18-Hour Waterproof Hold',
  'Cryo Skin Tightening Prep',
];

const BRIDAL_TICKER_ROW_2 = [
  'Singhana Studio & On-Location',
  '1,200+ Royal Brides',
  '100% Genuine MAC & Huda Beauty',
  'Certified Senior Bridal Artists',
  'Complimentary Mandap Touch-Up Kit',
  'Mother & Sister Family Makeup',
  'Razor-Sharp Saree Pleats',
  'Rajasthan & Haryana Doorstep',
  'Precision Brow & Lash Styling',
  '10+ Years Trust & Elegance',
];

const BRIDAL_PETALS = [
  { left: '4%', top: '15%', size: 16, rot: -25, delay: 0, dur: 5.5, color: '#b8863b' },
  { left: '12%', top: '65%', size: 12, rot: 30, delay: 1.2, dur: 4.8, color: '#e0558b' },
  { left: '20%', top: '28%', size: 18, rot: -15, delay: 0.5, dur: 6.0, color: '#7c1724' },
  { left: '30%', top: '75%', size: 10, rot: 40, delay: 2.1, dur: 5.2, color: '#b8863b' },
  { left: '42%', top: '12%', size: 14, rot: -35, delay: 1.8, dur: 4.5, color: '#e0558b' },
  { left: '55%', top: '68%', size: 16, rot: 20, delay: 0.3, dur: 5.8, color: '#b8863b' },
  { left: '68%', top: '22%', size: 11, rot: -45, delay: 2.5, dur: 4.9, color: '#7c1724' },
  { left: '78%', top: '82%', size: 15, rot: 50, delay: 0.8, dur: 5.4, color: '#e0558b' },
  { left: '88%', top: '18%', size: 13, rot: -20, delay: 1.5, dur: 6.2, color: '#b8863b' },
  { left: '94%', top: '60%', size: 17, rot: 35, delay: 2.0, dur: 5.0, color: '#7c1724' },
  { left: '26%', top: '88%', size: 12, rot: -50, delay: 1.1, dur: 4.7, color: '#b8863b' },
  { left: '62%', top: '85%', size: 14, rot: 25, delay: 1.7, dur: 5.3, color: '#e0558b' },
];

const FAQS = [
  {
    q: 'How early should I book my bridal makeup date?',
    a: 'We strongly recommend booking 2 to 6 months in advance, especially during the auspicious wedding muhurat season (October to March). Dates are secured on a first-come, advance-token basis.',
  },
  {
    q: 'Can Satguru artists travel to our wedding venue or hotel?',
    a: 'Yes, absolutely! We provide on-location bridal vanity services across Jaipur, Singhana, Jhunjhunu, Khetri, Sikar, and destination venues throughout Rajasthan and Haryana. Travel charges apply based on distance.',
  },
  {
    q: 'Is the bridal makeup trial included in the package?',
    a: 'One comprehensive look trial is included with the Signature Bride package, and two complete trials are included with the Royal Empress package. For Classic Bride, a trial can be scheduled as an optional add-on.',
  },
  {
    q: 'How long will the bridal makeup last during pheras and rituals?',
    a: 'Our bridal bases are 100% waterproof, sweat-resistant, and flash-photography tested. Using professional international brands (MAC, Kryolan, Huda Beauty, Charlotte Tilbury, NARS), your look stays intact for 16–20 hours without creasing or oxidizing.',
  },
  {
    q: 'Can we book party makeup for mother, sisters, and bridesmaids together?',
    a: 'Yes! We have an experienced team of senior artists to style your mother, sisters, and guests concurrently so the bridal party is ready simultaneously without any last-minute rush.',
  },
  {
    q: 'What are the advance payment and cancellation terms?',
    a: 'A 25% token advance confirms your date on our calendar. The remaining balance is payable on the function date. In case of genuine emergency rescheduling, we allow transfer of your deposit to an alternate available date.',
  },
];

export function GetReady() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);

  const filteredLooks = activeCategory === 'all'
    ? LOOKS_GALLERY
    : LOOKS_GALLERY.filter(item => item.category === activeCategory);

  const openWhatsApp = (msg: string) => {
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/919887196182?text=${encoded}`, '_blank');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0f0b0d] text-[#fdf8f4]' : 'bg-[#fffdfa] text-[#2d1b22]'}`}>
      
      {/* Inline Keyframes & Animations */}
      <style>{`
        @keyframes bridalPetalFloat {
          0%   { transform: translateY(0px) rotate(var(--r)) scale(1); opacity: 0.75; }
          25%  { transform: translateY(-16px) rotate(calc(var(--r) + 12deg)) scale(1.04); opacity: 0.95; }
          50%  { transform: translateY(-6px) rotate(calc(var(--r) - 8deg)) scale(0.96); opacity: 0.8; }
          75%  { transform: translateY(-20px) rotate(calc(var(--r) + 16deg)) scale(1.06); opacity: 0.95; }
          100% { transform: translateY(0px) rotate(var(--r)) scale(1); opacity: 0.75; }
        }
        @keyframes marqueeScrollLeft {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeScrollRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @keyframes sparklePulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 1px #e0558b); }
          50% { transform: scale(1.25); filter: drop-shadow(0 0 5px #e0558b); }
        }
        .bridal-marquee-left {
          display: flex;
          width: max-content;
          animation: marqueeScrollLeft 32s linear infinite;
        }
        .bridal-marquee-right {
          display: flex;
          width: max-content;
          animation: marqueeScrollRight 34s linear infinite;
        }
        .bridal-marquee-left:hover, .bridal-marquee-right:hover {
          animation-play-state: paused;
        }
        .sparkle-icon {
          animation: sparklePulse 2.8s ease-in-out infinite;
        }
      `}</style>

      {/* 1. ROYAL HERO SECTION */}
      <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
        {/* Subtle decorative background gradients */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-[#9C7228]/30 via-[#b8863b]/10 to-transparent blur-3xl" />
          <div className="absolute top-1/2 -right-32 w-[32rem] h-[32rem] rounded-full bg-gradient-to-bl from-[#7c1724]/25 via-[#9C7228]/15 to-transparent blur-3xl" />
        </div>

        {/* Floating Delicate Bridal Petals & Shimmer Specks */}
        {BRIDAL_PETALS.map((p, i) => (
          <span
            key={i}
            className="pointer-events-none absolute select-none hidden sm:block"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size * 1.6}px`,
              ['--r' as string]: `${p.rot}deg`,
              animation: `bridalPetalFloat ${p.dur}s ease-in-out ${p.delay}s infinite`,
              willChange: 'transform',
              zIndex: 1,
            }}
          >
            <svg viewBox="0 0 24 38" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
              <path
                d="M12 36 C4 28 0 20 2 11 C4 4 10 0 12 0 C14 0 20 4 22 11 C24 20 20 28 12 36Z"
                fill={p.color}
                fillOpacity="0.45"
              />
              <line x1="12" y1="2" x2="12" y2="34" stroke={p.color} strokeWidth="0.8" strokeOpacity="0.6" />
            </svg>
          </span>
        ))}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Royal Headline & CTAs */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#b8863b]/40 bg-[#b8863b]/10 backdrop-blur-sm text-[#b8863b] text-xs md:text-sm font-medium tracking-widest uppercase">
                <Crown className="w-4 h-4 text-[#b8863b]" />
                Satguru Bridals • Singhana & Jaipur
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-balance leading-[1.15]">
                Where Every Bride Becomes A{' '}
                <span className="bg-gradient-to-r from-[#b8863b] via-[#e3c487] to-[#d4af37] bg-clip-text text-transparent">
                  Masterpiece
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                Step into your fairy tale with couture bridal artistry, curated pre-bridal skin therapy, and razor-sharp jewellery draping crafted for Indian weddings.
              </p>

              {/* Key Highlights Pill Row */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs md:text-sm font-medium px-3 py-1.5 rounded-lg bg-[#b8863b]/10 text-[#b8863b] border border-[#b8863b]/25">
                  <Sparkles className="w-3.5 h-3.5" /> 100% International HD Products
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm font-medium px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                  <ShieldCheck className="w-3.5 h-3.5" /> 18-Hour Flash Waterproof Lock
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm font-medium px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25">
                  <Heart className="w-3.5 h-3.5" /> 1,200+ Happy Brides
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Button
                  onClick={() => openWhatsApp('Hello Satguru Makeup Arts! I want to check bridal slot availability for my wedding date:')}
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-[#b8863b] to-[#9C7228] hover:from-[#a8772a] hover:to-[#8a631f] text-white font-medium px-8 py-6 rounded-full shadow-lg shadow-[#b8863b]/25 transition-all transform hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Check Wedding Date Availability
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const el = document.getElementById('bridal-packages');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto border-[#b8863b]/40 hover:bg-[#b8863b]/10 font-medium px-6 py-6 rounded-full"
                >
                  Explore Bridal Packages
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Studio & Contact Mini Note */}
              <div className="pt-3 text-xs text-muted-foreground flex items-center justify-center lg:justify-start gap-4">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#b8863b]" /> Singhana Studio • Doorstep Rajasthan
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#b8863b]" /> +91 98871 96182
                </span>
              </div>

            </div>

            {/* Right Column: Arched Royal Bridal Frame */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group w-full max-w-sm sm:max-w-md">
                
                {/* Glowing Outer Aura */}
                <div className="absolute -inset-2 bg-gradient-to-tr from-[#b8863b]/30 via-[#d4af37]/20 to-[#7c1724]/30 rounded-t-[14rem] rounded-b-2xl blur-lg group-hover:blur-xl transition-all duration-500 opacity-70" />

                {/* Arched Picture Container */}
                <div className="relative overflow-hidden rounded-t-[14rem] rounded-b-2xl border-2 border-[#b8863b]/50 shadow-2xl bg-black/40">
                  <img
                    src="/images/bridal-gallery/satguru-bride-2.jpg"
                    alt="Satguru Royal Bride"
                    className="w-full h-[460px] sm:h-[520px] object-cover object-top transform group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Glass Tag at Bottom */}
                  <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/90 via-black/60 to-transparent backdrop-blur-sm text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-light text-[#e3c487] tracking-wider uppercase">Signature Satguru Bride</p>
                        <h4 className="text-lg font-serif font-bold">Royal Velvet & Zari Glamour</h4>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[#b8863b]/30 border border-[#b8863b] flex items-center justify-center text-[#e3c487]">
                        <Crown className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Rating Pill Badge */}
                <div className="absolute -bottom-4 -left-4 sm:-left-6 bg-background/95 border border-[#b8863b]/40 shadow-xl rounded-2xl p-3 flex items-center gap-3 backdrop-blur-md">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold flex items-center gap-1">
                      4.9 / 5.0
                      <span className="text-xs text-muted-foreground font-normal">(500+ reviews)</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Rajasthan&apos;s Trusted Bridal Choice</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. DUAL-ROW BRIDAL TICKER MARQUEE (HIGH FASHION RUNWAY STRIP) */}
      <section className="relative overflow-hidden py-4 sm:py-5 border-y border-[#b8863b]/30 bg-gradient-to-r from-[#fff9f4] via-[#fffdfa] to-[#fff9f4] dark:from-[#150f13] dark:via-[#1a1217] dark:to-[#150f13] select-none">
        {/* Subtle Edge Vignettes for smooth infinite emergence */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#fff9f4] dark:from-[#150f13] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#fff9f4] dark:from-[#150f13] to-transparent z-10 pointer-events-none" />

        <div className="space-y-2 sm:space-y-2.5">
          {/* Row 1: Leftward Scrolling Deep Maroon / Wine Ribbon */}
          <div className="overflow-hidden flex">
            <div className="bridal-marquee-left gap-8 sm:gap-12 items-center">
              {[...BRIDAL_TICKER_ROW_1, ...BRIDAL_TICKER_ROW_1].map((text, idx) => (
                <div key={idx} className="flex items-center gap-4 sm:gap-6 whitespace-nowrap">
                  <span className="font-serif font-semibold text-sm sm:text-base tracking-wide text-[#5e0a14] dark:text-[#f8d7dc]">
                    {text}
                  </span>
                  <span className="sparkle-icon text-[#e0558b] text-xs sm:text-sm">✦</span>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Rightward Scrolling Antique Imperial Gold Ribbon */}
          <div className="overflow-hidden flex">
            <div className="bridal-marquee-right gap-8 sm:gap-12 items-center">
              {[...BRIDAL_TICKER_ROW_2, ...BRIDAL_TICKER_ROW_2].map((text, idx) => (
                <div key={idx} className="flex items-center gap-4 sm:gap-6 whitespace-nowrap">
                  <span className="font-serif font-bold text-xs sm:text-sm tracking-wider uppercase text-[#a67c2e] dark:text-[#e8c37b]">
                    {text}
                  </span>
                  <span className="sparkle-icon text-[#e0558b] text-xs sm:text-sm">✦</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. LIVE BRIDAL STATS BAR */}
      <section className="py-8 border-b border-[#b8863b]/20 bg-[#b8863b]/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-serif font-bold text-[#b8863b]">1,200+</div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">Brides Transformed</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-serif font-bold text-[#b8863b]">18 Hrs</div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">Long-Wear Waterproof Hold</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-serif font-bold text-[#b8863b]">100%</div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">Original Luxury Brands</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-serif font-bold text-[#b8863b]">10+ Yrs</div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">Bridal Artistry Excellence</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SIGNATURE BRIDAL PACKAGES */}
      <section id="bridal-packages" className="py-20 md:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase text-[#b8863b] bg-[#b8863b]/10 border border-[#b8863b]/30">
              <Sparkles className="w-3.5 h-3.5" /> Curated Bridal Tiers
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold">
              Choose Your Signature Bridal Look
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Every package is tailored to your face shape, wedding lehenga, and ceremony lighting with meticulous perfection.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {BRIDAL_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative rounded-3xl flex flex-col justify-between overflow-hidden transition-all duration-300 border ${
                  pkg.popular
                    ? 'border-[#b8863b] shadow-2xl shadow-[#b8863b]/20 bg-gradient-to-b from-[#b8863b]/10 via-card to-card lg:-translate-y-4'
                    : 'border-border/60 hover:border-[#b8863b]/40 bg-card shadow-lg hover:shadow-xl'
                }`}
              >
                {/* Popular Ribbon */}
                {pkg.badge && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-[#b8863b] to-[#9C7228] text-white text-[11px] font-bold uppercase tracking-wider py-1.5 px-6 rounded-bl-2xl shadow-md">
                      {pkg.badge}
                    </div>
                  </div>
                )}

                <div>
                  {/* Package Top Image Preview */}
                  <div className="relative h-56 w-full overflow-hidden">
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                    
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-md flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#b8863b]" /> {pkg.duration}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-8 space-y-6">
                    <div>
                      <h3 className="text-2xl font-serif font-bold">{pkg.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{pkg.tagline}</p>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-serif font-bold text-[#b8863b]">{pkg.price}</span>
                      <span className="text-xs text-muted-foreground uppercase">/ Bride</span>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {pkg.description}
                    </p>

                    <div className="border-t border-border/50 pt-5 space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#b8863b]">Package Inclusions:</p>
                      <ul className="space-y-2.5">
                        {pkg.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                            <CheckCircle2 className="w-4 h-4 text-[#b8863b] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Bottom Action CTA */}
                <div className="p-6 sm:p-8 pt-0">
                  <Button
                    onClick={() => openWhatsApp(pkg.whatsAppText)}
                    className={`w-full py-6 rounded-2xl font-medium transition-all ${
                      pkg.popular
                        ? 'bg-gradient-to-r from-[#b8863b] to-[#9C7228] text-white hover:opacity-95 shadow-md shadow-[#b8863b]/25'
                        : 'bg-primary/10 text-primary hover:bg-[#b8863b] hover:text-white border border-[#b8863b]/30'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Book This Package
                  </Button>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. PACKAGE COMPARISON TABLE */}
      <section className="py-16 bg-[#b8863b]/5 border-y border-[#b8863b]/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold">Compare Packages Side-by-Side</h3>
            <p className="text-sm text-muted-foreground mt-2">Find the exact match for your wedding week rituals and entourage.</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-xl">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/80 bg-muted/40">
                  <th className="p-4 sm:p-5 font-serif font-bold text-base">Features & Treatments</th>
                  <th className="p-4 sm:p-5 font-serif font-bold text-base text-center">Classic<br/><span className="text-xs font-normal text-muted-foreground">₹15,000</span></th>
                  <th className="p-4 sm:p-5 font-serif font-bold text-base text-center text-[#b8863b]">Signature ⭐<br/><span className="text-xs font-normal text-[#b8863b]">₹25,000</span></th>
                  <th className="p-4 sm:p-5 font-serif font-bold text-base text-center">Royal Empress<br/><span className="text-xs font-normal text-muted-foreground">₹40,000</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 sm:p-5 font-medium text-xs sm:text-sm">{row.feature}</td>
                    <td className="p-4 sm:p-5 text-center text-xs sm:text-sm text-muted-foreground">{row.classic}</td>
                    <td className="p-4 sm:p-5 text-center text-xs sm:text-sm font-semibold text-[#b8863b] bg-[#b8863b]/5">{row.signature}</td>
                    <td className="p-4 sm:p-5 text-center text-xs sm:text-sm text-muted-foreground">{row.royal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* 5. PRE-BRIDAL SKINCARE & GLOW TIMELINE */}
      <section className="py-20 md:py-28 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase text-[#b8863b] bg-[#b8863b]/10 border border-[#b8863b]/30">
              <Sparkles className="w-3.5 h-3.5" /> Scientific Glow Plan
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold">
              Glow That Starts Weeks Before the Day
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              True bridal radiance isn&apos;t just painted on — it&apos;s cultivated through our step-by-step pre-bridal skin therapy roadmap.
            </p>
          </div>

          <div className="space-y-6">
            {PRE_BRIDAL_TIMELINE.map((item, idx) => (
              <div
                key={idx}
                className="relative rounded-3xl border border-border/70 bg-card p-6 sm:p-8 hover:border-[#b8863b]/50 transition-all duration-300 shadow-md hover:shadow-xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Step Num & Timeframe */}
                  <div className="md:col-span-3 flex md:flex-col items-center md:items-start justify-between gap-2 border-b md:border-b-0 md:border-r border-border/60 pb-4 md:pb-0 md:pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#b8863b]/15 text-[#b8863b] font-serif font-bold text-xl flex items-center justify-center border border-[#b8863b]/30">
                        {item.step}
                      </div>
                      <span className="text-2xl">{item.icon}</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#b8863b] uppercase tracking-wider block mt-2">Timeline</span>
                      <span className="text-sm font-bold">{item.timeframe}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="md:col-span-5 space-y-2">
                    <h4 className="text-xl font-serif font-bold">{item.title}</h4>
                    <p className="text-xs text-[#b8863b] font-medium">{item.subtitle}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>

                  {/* Treatments Pill Box */}
                  <div className="md:col-span-4 bg-muted/40 rounded-2xl p-4 border border-border/40">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Protocol Details:</p>
                    <ul className="space-y-1.5">
                      {item.treatments.map((t, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. ADD-ON SERVICES FOR THE WHOLE CELEBRATION */}
      <section className="py-20 bg-muted/30 border-y border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase text-[#b8863b] bg-[#b8863b]/10 border border-[#b8863b]/30">
              <Crown className="w-3.5 h-3.5" /> Full Entourage Care
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold">
              For The Whole Celebration
            </h2>
            <p className="text-base text-muted-foreground">
              From Mehendi night curls to mother-of-the-bride draping, we handle your family&apos;s styling under one trusted roof.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ADDONS.map((addon, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border/70 bg-card p-6 sm:p-7 flex flex-col justify-between hover:border-[#b8863b]/50 hover:shadow-lg transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#b8863b]/10 text-[#b8863b] border border-[#b8863b]/20">
                      {addon.tagline}
                    </span>
                    <span className="text-sm font-bold text-[#b8863b]">{addon.price}</span>
                  </div>
                  <h4 className="text-xl font-serif font-bold">{addon.name}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{addon.description}</p>
                </div>

                <div className="pt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openWhatsApp(`Hello Satguru Makeup Arts! I would like to enquire about add-on service: ${addon.name} (${addon.price})`)}
                    className="w-full border-[#b8863b]/30 hover:bg-[#b8863b]/10 text-xs font-medium"
                  >
                    Enquire on WhatsApp
                  </Button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. BRIDAL LOOKS WE LOVE (FILTERABLE HIGH-RES GALLERY) */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase text-[#b8863b] bg-[#b8863b]/10 border border-[#b8863b]/30">
              <Eye className="w-3.5 h-3.5" /> Real Satguru Brides
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold">
              Bridal Looks We Love
            </h2>
            <p className="text-base text-muted-foreground">
              Every photograph is 100% genuine work created by Satguru artists with real brides in our studio and wedding venues.
            </p>

            {/* Filter Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {[
                { id: 'all', label: 'All Royal Looks' },
                { id: 'velvet', label: 'Royal Velvet Maroon' },
                { id: 'regal', label: 'Heritage Scarlet & Zari' },
                { id: 'poshak', label: 'Rajputana Poshak' },
                { id: 'reception', label: 'Reception Glam' },
                { id: 'entourage', label: 'Bridal Entourage' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setActiveCategory(chip.id)}
                  className={`text-xs px-4 py-2 rounded-full font-medium transition-all ${
                    activeCategory === chip.id
                      ? 'bg-gradient-to-r from-[#b8863b] to-[#9C7228] text-white shadow-md'
                      : 'bg-muted/50 hover:bg-muted text-muted-foreground border border-border/50'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLooks.map((look) => (
              <div
                key={look.id}
                onClick={() => setSelectedImage(look)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card shadow-md hover:shadow-2xl transition-all duration-300"
              >
                <div className="aspect-[3/4] w-full overflow-hidden bg-muted/20">
                  <img
                    src={look.src}
                    alt={look.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                {/* Overlay Card Details */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-[#e3c487] mb-1">
                    {look.outfit}
                  </span>
                  <h4 className="text-lg font-serif font-bold">{look.title}</h4>
                  <p className="text-xs text-white/80 line-clamp-2 mt-1 font-light">{look.details}</p>
                  
                  <div className="pt-3 flex items-center justify-between text-xs text-[#e3c487]">
                    <span className="flex items-center gap-1 font-medium">
                      <Sparkles className="w-3.5 h-3.5" /> View Look
                    </span>
                    <span className="text-white/60 text-[10px]">Tap to inspect</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. FOUR EASY STEPS BOOKING PROCESS */}
      <section className="py-20 bg-[#b8863b]/5 border-y border-[#b8863b]/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h3 className="text-3xl font-serif font-bold">Four Easy Steps To Lock Your Date</h3>
            <p className="text-sm text-muted-foreground">Smooth, stress-free consultation from your first message to the final touch-up.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className="relative rounded-2xl border border-border/70 bg-card p-6 text-center space-y-3 shadow-md hover:border-[#b8863b]/50 transition-all"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-[#b8863b] to-[#9C7228] text-white font-serif font-bold text-lg flex items-center justify-center shadow-md shadow-[#b8863b]/20">
                  {s.num}
                </div>
                <h4 className="font-serif font-bold text-lg">{s.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 9. FAQ ACCORDION */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase text-[#b8863b] bg-[#b8863b]/10 border border-[#b8863b]/30">
              <ShieldCheck className="w-3.5 h-3.5" /> Clarity & Transparency
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold">Frequently Asked Bridal Questions</h2>
            <p className="text-sm text-muted-foreground">Everything you need to know before locking your dream date with us.</p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border/70 bg-card overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-serif font-bold text-base sm:text-lg hover:text-[#b8863b] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#b8863b] shrink-0 transition-transform duration-300 ${
                      activeFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 10. FINAL ROYAL BOOKING BANNER */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[#2a0e14] via-[#48141d] to-[#1c080d] text-white relative overflow-hidden">
        {/* Sparkle background elements */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#b8863b] blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="w-16 h-16 rounded-full bg-[#b8863b]/20 border border-[#b8863b] flex items-center justify-center mx-auto text-[#e3c487]">
            <Crown className="w-8 h-8" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold">
            Book Your Bridal Date Early
          </h2>

          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
            Our wedding muhurat dates fill up quickly. Connect directly with our Senior Bridal Artist on WhatsApp or call us to reserve your date.
          </p>

          <div className="pt-2 text-2xl sm:text-3xl font-serif font-bold text-[#e3c487]">
            +91 98871 96182
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              onClick={() => openWhatsApp('Hello Satguru Makeup Arts! I would like to book a bridal consultation for my wedding.')}
              size="lg"
              className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20ba5a] text-white font-medium px-8 py-6 rounded-full shadow-xl shadow-green-900/30 text-base"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Chat on WhatsApp Now
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/contact')}
              className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 font-medium px-8 py-6 rounded-full"
            >
              Visit Studio Contact Info
            </Button>
          </div>

          <p className="text-xs text-white/50 pt-4">
            Studio: Singhana, Jhunjhunu District, Rajasthan • Servicing All Rajasthan & Doorstep Venues
          </p>
        </div>
      </section>

      {/* LIGHTBOX MODAL FOR REAL GALLERY ZOOM */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-card rounded-2xl overflow-hidden shadow-2xl border border-[#b8863b]/40"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="max-h-[500px] overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="p-6 sm:p-8 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[#b8863b] bg-[#b8863b]/10 border border-[#b8863b]/30">
                    <Crown className="w-3.5 h-3.5" /> Real Satguru Bride
                  </div>
                  <h3 className="text-2xl font-serif font-bold">{selectedImage.title}</h3>
                  <p className="text-xs text-[#b8863b] font-medium">{selectedImage.outfit}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedImage.details}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-border/50">
                  <Button
                    onClick={() => {
                      openWhatsApp(`Hello Satguru Makeup Arts! I love the look '${selectedImage.title}' from your Get Ready gallery and want to recreate it for my wedding.`);
                      setSelectedImage(null);
                    }}
                    className="w-full bg-gradient-to-r from-[#b8863b] to-[#9C7228] text-white py-5 rounded-xl font-medium"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Enquire About This Exact Look
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
