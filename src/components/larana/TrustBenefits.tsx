import React from 'react';
import { ShieldCheck, Sparkles, CalendarCheck, Award } from 'lucide-react';

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: 'Verified Professionals',
    description: 'Every beauty aesthetician is background-verified, trade-certified, and brings 5+ years of studio experience.',
  },
  {
    icon: Sparkles,
    title: 'Hygiene & Safety',
    description: '100% single-use disposable kits, sterilised tools, sealed cosmetic spatulas, and post-service sanitation.',
  },
  {
    icon: CalendarCheck,
    title: 'Flexible Booking',
    description: 'Seamless slot selection, free rescheduling up to 2 hours prior, and punctual doorstep arrival guarantee.',
  },
  {
    icon: Award,
    title: 'Premium Products',
    description: 'Only internationally renowned, authentic dermatologically tested formulations (MAC, Rica, L’Oréal, Cheryl’s).',
  },
];

export function TrustBenefits() {
  return (
    <section
      id="trust-benefits"
      className="py-14 sm:py-20 border-t"
      style={{
        background: '#FCF9F1',
        borderColor: '#E6DDDA',
      }}
    >
      <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span
            className="text-xs uppercase tracking-[0.16em] font-semibold"
            style={{ color: '#8C6754' }}
          >
            The Larana Promise
          </span>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              color: '#2D1F1D',
            }}
          >
            Why Choose Our Doorstep Care
          </h2>
          <p className="text-xs sm:text-sm text-[#5A4A42] mt-2 leading-relaxed">
            Salon-grade artistry and hospital-grade hygiene, tailored specifically for the comfort of your home.
          </p>
        </div>

        {/* 4 Benefits Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {BENEFITS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="p-6 sm:p-7 rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-start text-left"
              style={{
                background: '#FFFFFF',
                borderColor: '#E6DDDA',
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border shadow-xs"
                style={{
                  background: '#FFF8ED',
                  borderColor: 'rgba(199, 178, 153, 0.45)',
                  color: '#8C6754',
                }}
              >
                <Icon className="w-6 h-6" />
              </div>

              <h3
                className="text-base sm:text-lg font-bold mb-2"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: '#2D1F1D',
                }}
              >
                {title}
              </h3>

              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#5A4A42' }}>
                {description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
