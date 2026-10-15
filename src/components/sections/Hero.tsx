import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, Heart, ChevronLeft, ChevronRight, Star, Shield, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PromoSlide {
  id: string;
  badge: string;
  title: string;
  titleHighlight: string;
  description: string;
  primaryCta: string;
  primaryLink: string;
  secondaryCta: string;
  secondaryLink: string;
  image: string;
  imageAlt: string;
  floatingTag: string;
  floatingSubtag: string;
  ratingText?: string;
}

const PROMO_SLIDES: PromoSlide[] = [
  {
    id: 'doorstep-promo',
    badge: 'Your Beauty Ritual, At Your Doorstep',
    title: 'Your Moment of Beauty.',
    titleHighlight: 'Delivered Home.',
    description: 'From refreshing facials to complete beauty rituals, enjoy professional salon care in the comfort and privacy of your home.',
    primaryCta: 'Explore Beauty Services',
    primaryLink: '/doorstep-service',
    secondaryCta: 'Book Your Appointment',
    secondaryLink: '/#booking',
    image: '/images/banner-neutral.png',
    imageAlt: 'Woman enjoying serene, natural salon beauty treatment with radiant skin',
    floatingTag: 'Your Beauty, Your Comfort',
    floatingSubtag: 'Professional care at home',
    ratingText: '4.9 ★ (2,800+ Clients)',
  },
  {
    id: 'facial-promo',
    badge: 'Dermatologist-Approved Skincare',
    title: 'Hydra-Infusion Glow &',
    titleHighlight: 'Pure Relaxation.',
    description: 'Customized pore-cleansing, soothing facial massage, and botanical masks delivered by certified aestheticians.',
    primaryCta: 'Explore Home Services',
    primaryLink: '/doorstep-service',
    secondaryCta: 'View Facial Rituals',
    secondaryLink: '/doorstep-service',
    image: '/images/banner-appointment.png',
    imageAlt: 'Gentle facial skincare ritual performed with hygienic tools',
    floatingTag: '100% Hygienic Tools',
    floatingSubtag: 'Single-use sealed kit',
    ratingText: '4.9 ★ (1,420 Reviews)',
  },
  {
    id: 'mehndi-promo',
    badge: 'Organic Henna Artistry',
    title: 'Beautiful Mehndi,',
    titleHighlight: 'Made Personal.',
    description: 'From delicate Arabic patterns to intricate bridal artistry, celebrate every occasion with organic Sojat henna.',
    primaryCta: 'Explore Mehndi Designs',
    primaryLink: '/mehndi-service',
    secondaryCta: 'Book Mehndi Artist',
    secondaryLink: '/mehndi-service',
    image: '/images/mehndi-bridal.jpg',
    imageAlt: 'Detailed traditional Indian bridal henna on hand',
    floatingTag: 'Natural Sojat Cones',
    floatingSubtag: 'Rich dark mahogany stain',
    ratingText: '5.0 ★ (1,150 Brides)',
  },
];

export function Hero() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideTimer = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    slideTimer.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 7000);
    return () => clearInterval(slideTimer.current);
  }, []);

  const goToSlide = (idx: number) => {
    clearInterval(slideTimer.current);
    setCurrentSlide(idx);
  };

  const prevSlide = () => {
    clearInterval(slideTimer.current);
    setCurrentSlide((prev) => (prev - 1 + PROMO_SLIDES.length) % PROMO_SLIDES.length);
  };

  const nextSlide = () => {
    clearInterval(slideTimer.current);
    setCurrentSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
  };

  const slide = PROMO_SLIDES[currentSlide];

  return (
    <section
      id="home"
      className="relative pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32 md:pb-20 overflow-hidden"
      style={{ background: '#FFF9F5' }}
    >
      {/* Subtle Warm Backdrop Geometry */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(198,154,98,0.1) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(200,62,104,0.06) 0%, transparent 70%)' }}
        />
      </div>

      <div className="container-custom relative z-10">
        {/* Main E-Commerce Campaign Banner Card */}
        <div
          className="rounded-3xl sm:rounded-[36px] p-6 sm:p-10 md:p-14 lg:p-16 border shadow-xl relative overflow-hidden transition-all duration-500"
          style={{
            background: '#FFFFFF',
            borderColor: 'rgba(245,220,225,0.9)',
            boxShadow: '0 20px 50px -15px rgba(84,35,55,0.08)',
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            
            {/* Left Column: Heading, description, trust badges and CTAs */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-5 sm:space-y-6">
              
              {/* Trust Badge */}
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide"
                  style={{
                    background: '#F5DCE1',
                    color: '#542337',
                    border: '1px solid rgba(200,62,104,0.2)',
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C83E68]" />
                  {slide.badge}
                </span>

                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full hidden sm:inline-block"
                  style={{ background: '#FFF9F5', color: '#542337', border: '1px solid #F5DCE1' }}
                >
                  Doorstep &amp; Studio
                </span>
              </div>

              {/* Headline */}
              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.14]"
                style={{ color: '#342A29', fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {slide.title}{' '}
                <span
                  className="italic"
                  style={{
                    color: '#C83E68',
                  }}
                >
                  {slide.titleHighlight}
                </span>
              </h1>

              {/* Supporting Text */}
              <p
                className="text-base sm:text-lg leading-relaxed max-w-xl font-normal"
                style={{ color: '#542337', opacity: 0.85 }}
              >
                {slide.description}
              </p>

              {/* Small Trust Indicators */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
                {[
                  { text: 'Verified Beauty Professionals' },
                  { text: 'Hygienic Tools' },
                  { text: 'Flexible Appointments' },
                ].map(({ text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border"
                    style={{
                      background: '#FFF9F5',
                      borderColor: 'rgba(198,154,98,0.25)',
                      color: '#342A29',
                    }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C83E68]" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-3">
                <Button
                  onClick={() => {
                    if (slide.primaryLink.startsWith('/#')) {
                      const id = slide.primaryLink.replace('/#', '');
                      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      navigate(slide.primaryLink);
                    }
                  }}
                  className="h-13 px-8 text-sm font-bold text-white rounded-2xl shadow-lg transition-all duration-300 hover:scale-102 active:scale-98 flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #C83E68 0%, #A82E52 100%)',
                    boxShadow: '0 8px 24px -6px rgba(200,62,104,0.45)',
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  {slide.primaryCta}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>

                <Button
                  onClick={() => {
                    if (slide.secondaryLink.startsWith('/#')) {
                      const id = slide.secondaryLink.replace('/#', '');
                      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      navigate(slide.secondaryLink);
                    }
                  }}
                  variant="outline"
                  className="h-13 px-7 text-sm font-bold rounded-2xl border-2 transition-all duration-300 hover:bg-[#F5DCE1]/40 flex items-center justify-center gap-2"
                  style={{
                    borderColor: 'rgba(200,62,104,0.3)',
                    color: '#542337',
                    background: '#FFFFFF',
                  }}
                >
                  <Heart className="w-4 h-4 text-[#C83E68]" />
                  {slide.secondaryCta}
                </Button>
              </div>

              {/* Slide Navigation Controls */}
              <div className="flex items-center gap-4 pt-4 border-t border-[#F5DCE1]/70">
                <div className="flex gap-2">
                  {PROMO_SLIDES.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => goToSlide(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        currentSlide === idx ? 'w-8 bg-[#C83E68]' : 'w-2 bg-[#F5DCE1] hover:bg-[#C83E68]/40'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                  <button
                    onClick={prevSlide}
                    className="w-9 h-9 rounded-full border border-[#F5DCE1] bg-white flex items-center justify-center text-[#542337] hover:bg-[#F5DCE1] hover:text-[#C83E68] transition-colors shadow-xs"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="w-9 h-9 rounded-full border border-[#F5DCE1] bg-white flex items-center justify-center text-[#542337] hover:bg-[#F5DCE1] hover:text-[#C83E68] transition-colors shadow-xs"
                    aria-label="Next Slide"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: High-Quality Naturally Lit Beauty Treatment Photograph */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="relative w-full max-w-md lg:max-w-none">
                
                {/* Visual Editorial Frame */}
                <div
                  className="rounded-3xl overflow-hidden shadow-2xl relative border-4 transition-all duration-500"
                  style={{
                    borderColor: '#FFFFFF',
                    boxShadow: '0 25px 60px -15px rgba(84,35,55,0.15)',
                    background: '#FFF9F5',
                  }}
                >
                  <img
                    src={slide.image}
                    alt={slide.imageAlt}
                    className="w-full h-[360px] sm:h-[420px] md:h-[480px] lg:h-[520px] object-cover object-center transition-transform duration-700 hover:scale-102"
                    style={{
                      // Natural realistic colors, no purple or pink filter overlay
                      filter: 'none',
                      opacity: 1,
                    }}
                  />

                  {/* Floating Pill Card: "Your Beauty, Your Comfort" */}
                  <div
                    className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xs bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-[#F5DCE1] flex items-center gap-3"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #C83E68 0%, #C69A62 100%)' }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs sm:text-sm text-[#342A29] truncate">
                        {slide.floatingTag}
                      </p>
                      <p className="text-[11px] font-medium text-[#C83E68] truncate">
                        {slide.floatingSubtag}
                      </p>
                    </div>
                  </div>

                  {/* Optional Floating Rating Badge (Top Right) */}
                  {slide.ratingText && (
                    <div
                      className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border border-[#F5DCE1] flex items-center gap-1.5 text-[#342A29]"
                    >
                      <Star className="w-3.5 h-3.5 fill-[#C69A62] text-[#C69A62]" />
                      <span>{slide.ratingText}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
