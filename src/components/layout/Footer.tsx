import {
  Phone, Mail, MapPin, Instagram, Facebook, Twitter, Users,
  ArrowUpRight, Heart, Moon, Sun, ShieldCheck, Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { BrandLogo } from '@/components/common/BrandLogo';

export function Footer() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative overflow-hidden transition-colors duration-300 border-t"
      style={{
        background: theme === 'dark'
          ? 'linear-gradient(180deg, #131216 0%, #0D0C0F 100%)'
          : 'linear-gradient(180deg, #F9F5F0 0%, #F4ECE3 100%)',
        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(201,149,108,0.2)',
        color: theme === 'dark' ? '#EAE5DF' : '#3D342E',
      }}
    >
      {/* Delicate Gold accent line at top */}
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px]"
        style={{
          background: 'linear-gradient(90deg, transparent 5%, rgba(201,149,108,0.3) 30%, rgba(201,149,108,0.6) 50%, rgba(201,149,108,0.3) 70%, transparent 95%)',
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Top CTA Banner */}
        <div
          className="py-12 border-b"
          style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(201,149,108,0.15)' }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Premier Ladies Beauty Experience</span>
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold mb-2 text-foreground">
                Ready for Your <span className="gradient-text italic">Transformation?</span>
              </h3>
              <p className="text-sm text-muted-foreground">
                Book your personalized salon appointment or request doorstep artists today
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const el = document.querySelector('#booking');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else { navigate('/'); setTimeout(() => document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth' }), 100); }
                }}
                className="group flex items-center gap-2 px-6 py-3.5 text-white text-sm font-semibold rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-md"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #A83353 100%)',
                }}
              >
                Book Salon Now
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/doorstep-service')}
                className="px-5 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-200 border border-border/80 hover:bg-secondary/60 text-foreground"
              >
                Doorstep Service
              </button>
            </div>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div>
            <div className="mb-5">
              <BrandLogo isLightMode={theme === 'light'} />
            </div>
            <p className="text-sm leading-relaxed mb-6 text-muted-foreground">
              Satguru Makeup Art is your destination for bespoke bridal artistry, advanced skin therapies, doorstep services, and timeless festive elegance.
            </p>
            <div className="flex gap-2.5">
              {[
                { icon: Instagram, label: 'Instagram', href: '#' },
                { icon: Facebook, label: 'Facebook', href: '#' },
                { icon: Twitter, label: 'Twitter', href: '#' },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 border border-border/70 hover:scale-105 hover:text-primary hover:border-primary/40 bg-card/60 text-muted-foreground"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-5 text-primary">
              Explore Services
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Bridal Makeover Packages', to: '/#services' },
                { label: 'Doorstep Home Salon', to: '/doorstep-service' },
                { label: 'Specialist Mehndi Art', to: '/mehndi-service' },
                { label: 'VIP Membership Club', to: '/membership' },
                { label: 'Customer Reviews', to: '/reviews' },
                { label: '🎁 Refer & Earn Cash', to: '/referral' },
                { label: 'Contact & Studio Map', to: '/contact' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Partner & Stylists */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-5 text-primary">
              Partner & Careers
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Meet Our Certified Stylists', action: () => navigate('/stylists') },
                { label: '🔐 Partner Portal Login', action: () => navigate('/partner-login') },
                { label: '🎫 My Bookings & Query Desk', action: () => navigate('/profile') },
                { label: 'Join Our Artist Team', action: () => navigate('/join-team') },
                { label: 'Become a Salon Associate', action: () => navigate('/associate') },
                { label: 'Personalized Beauty Profile', action: () => navigate('/beauty-profile') },
                { label: 'Customer Help & Complaints', action: () => navigate('/complaints') },
              ].map(({ label, action }) => (
                <li key={label}>
                  <button
                    onClick={action}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors text-left"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio Contact & Location */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-5 text-primary">
              Studio Location
            </h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                <span>
                  Satguru Makeup Art & Beauty Studio<br />
                  Singhana, Rajasthan — 333516<br />
                  India
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="tel:+919887196182" className="hover:text-primary font-medium">
                  +91 98871 96182
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="mailto:info@satgurumakeupart.com" className="hover:text-primary">
                  info@satgurumakeupart.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Theme Switcher Section & Bottom Bar (requested by user) ── */}
        <div
          className="py-8 border-t flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(201,149,108,0.15)' }}
        >
          {/* Interactive Theme Switcher with Moon / Sun Icon */}
          <div className="flex items-center gap-3 bg-card/80 border border-border/70 p-1.5 rounded-2xl shadow-sm">
            <span className="text-xs font-medium text-muted-foreground pl-2 pr-1">
              Theme:
            </span>
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                theme === 'light'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-300" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark (Moon)</span>
            </button>
          </div>

          {/* Copyright & Made with love */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-muted-foreground">
            <span>© {currentYear} Satguru Makeup Art. All rights reserved.</span>
            <span className="hidden sm:inline opacity-30">•</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-primary fill-primary" /> for beauty enthusiasts
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
