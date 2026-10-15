import React from 'react';
import { Sparkles, ShieldCheck, HeartHandshake, CalendarCheck2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  onBookClick?: () => void;
}

export function HeroSection({ onBookClick }: HeroSectionProps) {
  const navigate = useNavigate();

  const handleCtaClick = () => {
    if (onBookClick) {
      onBookClick();
    } else {
      const el = document.getElementById('catalogue-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/doorstep-service');
      }
    }
  };

  return (
    <section
      id="hero"
      className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 md:pt-36 md:pb-24 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FFF8ED 0%, #FCF9F1 60%, #F4F2F0 100%)',
      }}
    >
      {/* Delicate background ambient accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full blur-3xl opacity-40"
          style={{ background: 'radial-gradient(circle, #FFE7D9 0%, #FFC9AE 40%, transparent 75%)' }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-[480px] h-[480px] rounded-full blur-3xl opacity-35"
          style={{ background: 'radial-gradient(circle, #E6DDDA 0%, #C7B299 45%, transparent 75%)' }}
        />
      </div>

      <div className="container-custom relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Brand copy, CTA & Trust indicators */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-7 text-left">
            
            {/* Small Brand Eyebrow */}
            <div className="inline-flex items-center gap-2">
              <span
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold tracking-[0.16em] uppercase"
                style={{
                  background: '#FFE7D9',
                  color: '#4A3B32',
                  border: '1px solid rgba(199, 178, 153, 0.45)',
                }}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C7B299]" />
                BEAUTY AT YOUR DOORSTEP
              </span>
            </div>

            {/* Headline with refined serif */}
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-[3.65rem] font-bold tracking-tight leading-[1.15]"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: '#2D1F1D',
              }}
            >
              Professional Beauty Care,{' '}
              <span
                className="italic font-normal block sm:inline"
                style={{ color: '#8C6754' }}
              >
                Now at Your Doorstep.
              </span>
            </h1>

            {/* Supporting Description */}
            <p
              className="text-base sm:text-lg leading-relaxed max-w-xl font-normal"
              style={{ color: '#5A4A42' }}
            >
              Relax, refresh, and feel beautiful — with trusted beauty professionals bringing your favourite treatments to your home.
            </p>

            {/* Primary Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Button
                onClick={handleCtaClick}
                className="h-13 sm:h-14 px-8 sm:px-10 text-sm sm:text-base font-semibold text-white rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5"
                style={{
                  background: 'linear-gradient(135deg, #4A3B32 0%, #2D1F1D 100%)',
                  boxShadow: '0 10px 25px -8px rgba(45, 31, 29, 0.35)',
                }}
              >
                <span>Book Beauty at Home</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>

              <button
                onClick={() => {
                  const el = document.getElementById('categories-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="h-13 sm:h-14 px-7 text-sm font-semibold rounded-2xl border transition-all duration-300 hover:bg-[#F4F2F0] flex items-center justify-center"
                style={{
                  borderColor: 'rgba(199, 178, 153, 0.6)',
                  color: '#4A3B32',
                  background: '#FFFFFF',
                }}
              >
                Explore Treatments
              </button>
            </div>

            {/* Supporting Trust Indicators */}
            <div className="pt-4 border-t border-[#E6DDDA]/70 flex flex-wrap items-center gap-3 sm:gap-5">
              {[
                { icon: ShieldCheck, title: 'Verified Professionals' },
                { icon: Sparkles, title: 'Hygiene & Safety' },
                { icon: CalendarCheck2, title: 'Flexible Booking' },
              ].map(({ icon: Icon, title }) => (
                <div
                  key={title}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium"
                  style={{
                    background: '#FFFFFF',
                    borderColor: 'rgba(199, 178, 153, 0.4)',
                    color: '#3A2E2B',
                  }}
                >
                  <Icon className="w-4 h-4 text-[#8C6754]" />
                  <span>{title}</span>
                </div>
              ))}
            </div>

          </div>

          {/* Right Column: Large realistic beauty portrait photograph */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="relative w-full max-w-md lg:max-w-none">
              
              {/* Backing decorative shape */}
              <div
                className="absolute -inset-3 sm:-inset-4 rounded-[36px] opacity-70 transform rotate-1 transition-transform group-hover:rotate-0"
                style={{
                  background: 'linear-gradient(135deg, #FFE7D9 0%, #E6DDDA 100%)',
                }}
              />

              {/* Main Portrait Frame */}
              <div
                className="relative rounded-3xl sm:rounded-[32px] overflow-hidden shadow-2xl border-4 transition-all duration-500"
                style={{
                  borderColor: '#FFFFFF',
                  boxShadow: '0 24px 60px -15px rgba(45, 31, 29, 0.15)',
                  background: '#FFF8ED',
                }}
              >
                <img
                  src="/images/larana-hero-portrait.png"
                  alt="Editorial beauty portrait of a woman enjoying gentle professional skincare care"
                  className="w-full h-[400px] sm:h-[480px] md:h-[520px] lg:h-[560px] object-cover object-top transition-transform duration-700 hover:scale-105"
                  loading="eager"
                />

                {/* Subtle Floating Trust Badge on image */}
                <div
                  className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xs rounded-2xl p-3.5 shadow-xl border flex items-center gap-3 backdrop-blur-md"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderColor: 'rgba(199, 178, 153, 0.5)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #8C6754 0%, #4A3B32 100%)' }}
                  >
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs sm:text-sm truncate" style={{ color: '#2D1F1D' }}>
                      Doorstep Salon Care
                    </p>
                    <p className="text-[11px] truncate font-medium" style={{ color: '#8C6754' }}>
                      Single-use sanitized toolkits
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
