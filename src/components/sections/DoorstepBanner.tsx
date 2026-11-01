import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Shield, Heart, CheckCircle2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DoorstepBanner() {
  const navigate = useNavigate();

  return (
    <section className="py-14 sm:py-20 overflow-hidden relative bg-[#FFF9F5] dark:bg-[#121015] transition-colors duration-300">
      <div className="container-custom space-y-12 sm:space-y-16">
        
        {/* ========================================================
            BANNER A: DOORSTEP BEAUTY
            Background: warm ivory with subtle blush accent
            Heading: "Salon Luxury, At Your Doorstep"
            Description: "Your favourite beauty treatments, thoughtfully delivered to your home."
            Highlights: Facials & Skin Care, Hair & Body Care, Manicure & Pedicure
            CTA: "Explore Home Services"
           ======================================================== */}
        <div
          className="rounded-3xl sm:rounded-[36px] p-6 sm:p-10 md:p-12 lg:p-14 border border-[#F5DCE1] dark:border-[rgba(197,160,89,0.25)] bg-white dark:bg-[#1A1721] shadow-xl relative overflow-hidden transition-all duration-300"
          style={{
            boxShadow: '0 20px 45px -15px rgba(84,35,55,0.07)',
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                  style={{ background: '#F5DCE1', color: '#542337', border: '1px solid rgba(200,62,104,0.2)' }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C83E68]" />
                  Doorstep Beauty Care
                </span>
                <span
                  className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                  style={{ background: '#FFF9F5', color: '#542337', border: '1px solid #F5DCE1' }}
                >
                  Single-Use Sanitized Kits
                </span>
              </div>

              <h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
                style={{ color: '#342A29', fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Salon Luxury,{' '}
                <span
                  className="italic"
                  style={{ color: '#C83E68' }}
                >
                  At Your Doorstep
                </span>
              </h2>

              <p className="text-sm sm:text-base leading-relaxed max-w-xl" style={{ color: '#542337', opacity: 0.85 }}>
                Your favourite beauty treatments, thoughtfully delivered to your home. Certified aestheticians arrive with sealed, single-use disposable kits and salon-grade equipment.
              </p>

              {/* Three Service Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {[
                  { title: 'Facials & Skin Care', sub: 'Hydrating glow rituals' },
                  { title: 'Hair & Body Care', sub: 'Spa relaxation at home' },
                  { title: 'Manicure & Pedicure', sub: 'Sanitized nail therapy' },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="p-3.5 rounded-2xl border"
                    style={{ background: '#FFF9F5', borderColor: '#F5DCE1' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-[#C83E68] flex-shrink-0" />
                      <p className="font-bold text-xs sm:text-sm text-[#342A29] leading-tight">{item.title}</p>
                    </div>
                    <p className="text-[11px] text-[#542337]/75 pl-6">{item.sub}</p>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
                <Button
                  onClick={() => navigate('/doorstep-service')}
                  className="h-12 px-8 text-sm font-bold text-white rounded-2xl shadow-lg transition-all duration-300 hover:scale-102 flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #C83E68 0%, #A82E52 100%)',
                    boxShadow: '0 8px 24px -6px rgba(200,62,104,0.4)',
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  Explore Home Services
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>

                <Button
                  onClick={() => navigate('/doorstep-service')}
                  variant="outline"
                  className="h-12 px-6 text-sm font-bold rounded-2xl border transition-all text-[#542337] hover:bg-[#F5DCE1]/40"
                  style={{ borderColor: 'rgba(200,62,104,0.3)', background: '#FFFFFF' }}
                >
                  View All Treatments
                </Button>
              </div>

              {/* Verified Trust Strip */}
              <div className="flex items-center gap-4 pt-1 text-xs text-[#542337]/80 font-medium">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#C69A62] text-[#C69A62]" />
                  <strong className="text-[#342A29]">4.9 / 5.0</strong> (2,800+ Doorstep Clients)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  Verified &amp; Insured Artists
                </span>
              </div>
            </div>

            {/* Right Side: Real Beauty Treatment Photograph */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="relative w-full max-w-md">
                <div
                  className="rounded-3xl overflow-hidden shadow-2xl border-4 transition-all duration-500"
                  style={{ borderColor: '#FFFFFF', boxShadow: '0 20px 45px -12px rgba(84,35,55,0.14)' }}
                >
                  <img
                    src="/images/larana-hero-flower.jpg"
                    alt="Facial skincare treatment at home"
                    className="w-full h-80 sm:h-96 md:h-[420px] object-cover object-center"
                    style={{ filter: 'none', opacity: 1 }}
                  />
                  {/* Floating Tag */}
                  <div
                    className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-[#F5DCE1] flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-[#342A29]">Hydrating Glow Facial</p>
                      <p className="text-[11px] text-[#542337]/75">Single-use sealed hygiene kit</p>
                    </div>
                    <span className="text-base font-black text-[#C83E68]">₹1,499</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            BANNER B: MEHNDI ART
            Background: warm ivory with terracotta & henna-brown accents
            Heading: "Beautiful Mehndi, Made Personal"
            Description: "From delicate Arabic patterns to intricate bridal artistry, celebrate every occasion with beautiful henna."
            Highlights: Bridal Mehndi, Arabic Designs, Festive & Traditional Art
            CTA: "Explore Mehndi Designs"
           ======================================================== */}
        <div
          className="rounded-3xl sm:rounded-[36px] p-6 sm:p-10 md:p-12 lg:p-14 border border-[rgba(200,100,50,0.25)] dark:border-[rgba(197,160,89,0.25)] bg-[#FFFDF9] dark:bg-[#1A1721] shadow-xl relative overflow-hidden transition-all duration-300"
          style={{
            boxShadow: '0 20px 45px -15px rgba(139,69,19,0.1)',
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                  style={{ background: 'rgba(139,69,19,0.08)', color: '#8B4513', border: '1px solid rgba(139,69,19,0.22)' }}
                >
                  <Heart className="w-3.5 h-3.5 text-amber-700 fill-amber-700/20" />
                  Organic Henna Artistry
                </span>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full text-amber-900 bg-amber-50 border border-amber-200">
                  100% Organic Sojat Cones
                </span>
              </div>

              <h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
                style={{ color: '#342A29', fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Beautiful Mehndi,{' '}
                <span
                  className="italic"
                  style={{
                    color: '#C86432',
                  }}
                >
                  Made Personal
                </span>
              </h2>

              <p className="text-sm sm:text-base leading-relaxed max-w-xl text-slate-600">
                From delicate Arabic patterns to intricate bridal artistry, celebrate every occasion with beautiful henna. Triple-filtered chemical-free cones with guaranteed deep mahogany stain.
              </p>

              {/* Three Service Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {[
                  { title: 'Bridal Mehndi', sub: 'Royal customized motifs' },
                  { title: 'Arabic Designs', sub: 'Flowing negative space' },
                  { title: 'Festive & Traditional Art', sub: 'Teej, Karwa Chauth & Puja' },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="p-3.5 rounded-2xl border"
                    style={{ background: '#FFFDF9', borderColor: 'rgba(200,100,50,0.25)' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-amber-700 flex-shrink-0" />
                      <p className="font-bold text-xs sm:text-sm text-[#342A29] leading-tight">{item.title}</p>
                    </div>
                    <p className="text-[11px] text-amber-800/75 pl-6">{item.sub}</p>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
                <Button
                  onClick={() => navigate('/mehndi-service')}
                  className="h-12 px-8 text-sm font-bold text-white rounded-2xl shadow-lg transition-all duration-300 hover:scale-102 flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #8B4513 0%, #C86432 100%)',
                    boxShadow: '0 8px 24px -6px rgba(139,69,19,0.35)',
                  }}
                >
                  <Heart className="w-4 h-4" />
                  Explore Mehndi Designs
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>

                <Button
                  onClick={() => navigate('/mehndi-service')}
                  variant="outline"
                  className="h-12 px-6 text-sm font-bold rounded-2xl border transition-all text-amber-900 hover:bg-amber-50"
                  style={{ borderColor: 'rgba(139,69,19,0.3)', background: '#FFFFFF' }}
                >
                  Book Mehndi Artist
                </Button>
              </div>

              {/* Trust Quality Indicators */}
              <div className="flex items-center gap-4 pt-1 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#C69A62] text-[#C69A62]" />
                  <strong className="text-[#342A29]">5.0 / 5.0</strong> (1,150+ Brides)
                </span>
                <span>•</span>
                <span>Zero Chemicals • Skin-Safe for All</span>
              </div>
            </div>

            {/* Right Side: Dedicated Hand Henna Artwork Photograph */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="relative w-full max-w-md">
                <div
                  className="rounded-3xl overflow-hidden shadow-2xl border-4 transition-all duration-500"
                  style={{ borderColor: '#FFFFFF', boxShadow: '0 20px 45px -12px rgba(139,69,19,0.2)' }}
                >
                  <img
                    src="/images/mehndi-traditional.jpg"
                    alt="Detailed henna artwork on hand"
                    className="w-full h-80 sm:h-96 md:h-[420px] object-cover object-center"
                    style={{ filter: 'none', opacity: 1 }}
                  />
                  {/* Floating Product Tag */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-amber-100 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-[#342A29]">Traditional Bridal Mehndi</p>
                      <p className="text-[11px] text-slate-500">Includes Clove care kit &amp; lemon mist</p>
                    </div>
                    <span className="text-base font-black text-amber-900">₹3,499</span>
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
