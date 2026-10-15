import { useEffect, useState } from 'react';
import { Hero } from '@/components/sections/Hero';
import { FestiveCategoryCanopy } from '@/components/sections/FestiveCategoryCanopy';
import { QuickGlowBanner } from '@/components/sections/QuickGlowBanner';
import { Services } from '@/components/sections/Services';
import { Gallery } from '@/components/sections/Gallery';
import { About } from '@/components/sections/About';
import { Booking } from '@/components/sections/Booking';
import { Reviews } from '@/components/sections/Reviews';
import { Location } from '@/components/sections/Location';
import { DoorstepBanner } from '@/components/sections/DoorstepBanner';
import { StoryBanners } from '@/components/StoryBanners';
import { FloatingVideo } from '@/components/FloatingVideo';
import { Sparkles, Gift, Crown, Zap, Users, Star, MapPin, Calendar, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { initScrollAnimations } from '@/lib/scroll-animations';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [dismissedAnn, setDismissedAnn] = useState<string[]>([]);
  const [aiRecs, setAiRecs] = useState<any>(null);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    const observer = initScrollAnimations();
    fetchAnnouncements();
    if (user) fetchPersonalizedRecs();
    return () => observer?.disconnect();
  }, [user]);

  const fetchPersonalizedRecs = async () => {
    if (!user) return;
    setLoadingRecs(true);
    const { data } = await supabase.from('user_profiles')
      .select('ai_recommendations, hair_type, skin_type, skin_color, hair_concerns, skin_concerns')
      .eq('id', user.id).single();
    if (data?.ai_recommendations?.recommendations?.length > 0) {
      setAiRecs(data.ai_recommendations);
    } else if (data?.hair_type || data?.skin_type) {
      // Trigger AI generation silently
      try {
        const { data: recs } = await supabase.functions.invoke('beauty-ai', { body: { beautyProfile: data } });
        if (recs?.recommendations) {
          setAiRecs(recs);
          await supabase.from('user_profiles').update({ ai_recommendations: recs }).eq('id', user.id);
        }
      } catch (e) { console.error('home recs:', e); }
    }
    setLoadingRecs(false);
  };

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .eq('active', true)
      .in('target_audience', ['all', 'customers'])
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(3);
    setAnnouncements(data || []);
  };

  const visibleAnn = announcements.filter(a => !dismissedAnn.includes(a.id));

  const annColors: Record<string, string> = {
    promo: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    info: 'linear-gradient(135deg, #2563eb, #4f46e5)',
    emergency: 'linear-gradient(135deg, #dc2626, #be123c)',
    policy: 'linear-gradient(135deg, #475569, #334155)',
    training: 'linear-gradient(135deg, #d97706, #ea580c)',
  };

  return (
    <div className="min-h-screen">
      {/* Announcements Banner */}
      {visibleAnn.length > 0 && (
        <div className="fixed top-[72px] left-0 right-0 z-30 pointer-events-none">
          <div className="container-custom max-w-4xl pt-2 space-y-2">
            {visibleAnn.slice(0, 2).map(ann => (
              <div key={ann.id} className="pointer-events-auto flex items-center gap-3 px-5 py-3"
                style={{
                  borderRadius: '16px',
                  background: annColors[ann.type] || annColors.promo,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  backdropFilter: 'blur(8px)',
                }}>
                <span className="text-lg flex-shrink-0">{ann.type === 'promo' ? '🎉' : ann.type === 'emergency' ? '🚨' : ann.type === 'training' ? '📚' : '📢'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{ann.title}</p>
                  <p className="text-white/70 text-xs truncate">{ann.message}</p>
                </div>
                {ann.pinned && <span className="text-white/60 text-xs bg-white/15 px-2 py-0.5 rounded-full flex-shrink-0">📌 Pinned</span>}
                <button onClick={() => setDismissedAnn(p => [...p, ann.id])} className="text-white/50 hover:text-white flex-shrink-0 transition-colors">
                  <span className="text-lg leading-none">×</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <Hero />
      <FestiveCategoryCanopy />
      <DoorstepBanner />
      <QuickGlowBanner />

      {/* Instagram-Style Story Banners */}
      <section className="section-padding scroll-reveal relative overflow-hidden transition-colors duration-300"
        style={{ background: 'var(--background)' }}>
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-fuchsia-500/20 border border-rose-500/30 text-rose-500 shadow-sm">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Latest Stories</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                    Live Updates
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Tap to explore recent bridal transformations, festive packages &amp; studio rituals
                </p>
              </div>
            </div>
          </div>
          <StoryBanners />
        </div>
      </section>

      {/* Premium Promotional Banners — Redesigned */}
      <section className="section-padding scroll-reveal relative overflow-hidden transition-colors duration-300 border-t border-border/40"
        style={{ background: 'hsl(var(--secondary) / 0.35)' }}>
        <div className="container-custom">

          {/* Top row — 3 Feature Banners (Heart-touching, theme-aware, green-line accented) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 stagger-children">

            {/* Banner 1: Loyalty Program */}
            <div
              onClick={() => navigate('/profile')}
              className="group relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-500 hover:-translate-y-2 p-7 bg-card border border-border/80 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col justify-between"
            >
              {/* Subtle Green Glow Line Effect at top */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent group-hover:via-emerald-400 group-hover:h-[3px] transition-all" />

              {/* Heart-touching soft radial ambient orb */}
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/10 to-rose-400/10 blur-2xl group-hover:scale-125 transition-transform" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 shadow-sm group-hover:scale-110 transition-transform">
                    <Gift className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                    Member Club
                  </span>
                </div>

                <h3 className="text-foreground font-bold text-xl mb-2 font-display group-hover:text-primary transition-colors">
                  Loyalty Rewards
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Earn points on every booking and redeem them for exclusive beauty discounts & gifts.
                </p>
              </div>

              <div className="relative z-10 pt-4 border-t border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">1 point = ₹1</span>
                  <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground flex items-center gap-1">
                  Redeem <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>

            {/* Banner 2: Premium VIP Services */}
            <div
              onClick={() => {
                const el = document.getElementById('services');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else navigate('/#services');
              }}
              className="group relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-500 hover:-translate-y-2 p-7 bg-card border border-border/80 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col justify-between"
            >
              {/* Subtle Green Glow Line Effect at top */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent group-hover:via-emerald-400 group-hover:h-[3px] transition-all" />

              {/* Heart-touching soft radial ambient orb */}
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-rose-500/10 to-amber-400/10 blur-2xl group-hover:scale-125 transition-transform" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20 shadow-sm group-hover:scale-110 transition-transform">
                    <Crown className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                    Artistry & Luxury
                  </span>
                </div>

                <h3 className="text-foreground font-bold text-xl mb-2 font-display group-hover:text-primary transition-colors">
                  VIP Treatment
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Experience bespoke beauty services from master artists with sanitized, disposable kits.
                </p>
              </div>

              <div className="relative z-10 pt-4 border-t border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-foreground">4.9 / 5.0</span>
                  <span className="text-xs text-muted-foreground">(2.4k+ reviews)</span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground flex items-center gap-1">
                  Explore <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>

            {/* Banner 3: Quick Service */}
            <div
              onClick={() => navigate('/doorstep')}
              className="group relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-500 hover:-translate-y-2 p-7 bg-card border border-border/80 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col justify-between"
            >
              {/* Subtle Green Glow Line Effect at top */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent group-hover:via-emerald-400 group-hover:h-[3px] transition-all" />

              {/* Heart-touching soft radial ambient orb */}
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-400/10 blur-2xl group-hover:scale-125 transition-transform" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    Doorstep & Studio
                  </span>
                </div>

                <h3 className="text-foreground font-bold text-xl mb-2 font-display group-hover:text-primary transition-colors">
                  Quick Service
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Same-day beauty slots & certified doorstep artists dispatched right to your home.
                </p>
              </div>

              <div className="relative z-10 pt-4 border-t border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-foreground">Serving 50+ Localities</span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground flex items-center gap-1">
                  Book <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </div>

          {/* Two Partner Banners (Heart-touching, modern salon aesthetic) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 scroll-reveal">

            {/* Join Our Team Banner */}
            <div
              onClick={() => navigate('/join-team')}
              className="cursor-pointer group relative overflow-hidden rounded-3xl p-7 sm:p-8 bg-card border border-border/80 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between"
            >
              {/* Green Glow Line Accent at top */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent group-hover:via-emerald-400 group-hover:h-[3px] transition-all" />

              {/* Faint luxury photo backdrop */}
              <div
                className="absolute right-0 bottom-0 top-0 w-2/5 bg-[url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80')] bg-cover bg-center opacity-[0.06] dark:opacity-[0.12] pointer-events-none group-hover:scale-105 transition-transform duration-700"
              />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm group-hover:scale-110 transition-transform">
                    <Star className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Careers at Satguru</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground font-display">Join Our Expert Team</h3>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-md">
                  Build your career with Satguru Makeup Art. Enjoy competitive pay, flexible hours, branded toolkits, and fast growth opportunities.
                </p>
              </div>

              <div className="relative z-10 flex items-center justify-between pt-4 border-t border-border/60">
                <span className="text-xs text-muted-foreground font-medium">Hiring Artists, Stylists & Mehndi Experts</span>
                <Button
                  className="text-xs font-semibold px-4 py-2 rounded-xl text-white shadow-md transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #c9956c 0%, #d4a574 100%)',
                  }}
                >
                  Apply Now
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>

            {/* Associate Partnership Banner */}
            <div
              onClick={() => navigate('/associate')}
              className="cursor-pointer group relative overflow-hidden rounded-3xl p-7 sm:p-8 bg-card border border-border/80 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between"
            >
              {/* Green Glow Line Accent at top */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent group-hover:via-emerald-400 group-hover:h-[3px] transition-all" />

              {/* Faint luxury photo backdrop */}
              <div
                className="absolute right-0 bottom-0 top-0 w-2/5 bg-[url('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80')] bg-cover bg-center opacity-[0.06] dark:opacity-[0.12] pointer-events-none group-hover:scale-105 transition-transform duration-700"
              />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-sm group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Salon Growth Network</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground font-display">Partner With Us</h3>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-md">
                  Expand your independent salon business. Join our verified partner network to receive premium client bookings and marketing support.
                </p>
              </div>

              <div className="relative z-10 flex items-center justify-between pt-4 border-t border-border/60">
                <span className="text-xs text-muted-foreground font-medium">For Salon Owners & Freelancers</span>
                <Button
                  className="text-xs font-semibold px-4 py-2 rounded-xl text-white shadow-md transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #be185d 0%, #9d174d 100%)',
                  }}
                >
                  Become Partner
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Large Feature Banner — Bridal */}
          <div
            className="relative overflow-hidden scroll-reveal-scale rounded-[28px] p-8 sm:p-12 border border-border/80 bg-gradient-to-br from-card via-card to-secondary/40 shadow-xl"
          >
            {/* Green glowing line accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

            {/* Decorative orbs */}
            <div className="absolute top-0 right-[20%] w-[260px] h-[260px] rounded-full pointer-events-none bg-gradient-to-br from-amber-500/10 to-rose-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-[10%] w-[220px] h-[220px] rounded-full pointer-events-none bg-gradient-to-br from-emerald-500/10 to-teal-500/10 blur-3xl" />

            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold">Limited Time Offer</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 font-display">
                Get 30% OFF on <span className="gradient-text italic">Bridal Packages</span>
              </h2>
              <p className="text-sm sm:text-base mb-8 max-w-xl mx-auto text-muted-foreground leading-relaxed">
                Book your special day with our premium bridal makeup services. Includes complimentary pre-bridal consultation & customized styling.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button
                  onClick={() => {
                    const bookingSection = document.getElementById('booking');
                    if (bookingSection) {
                      bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                      navigate('/');
                      setTimeout(() => {
                        const section = document.getElementById('booking');
                        section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }
                  }}
                  size="lg"
                  className="text-sm font-semibold text-white px-7 py-3 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Salon Now
                </Button>
                <Button
                  onClick={() => navigate('/contact')}
                  size="lg"
                  variant="outline"
                  className="text-sm font-semibold px-7 py-3 rounded-2xl border-border bg-card/70 hover:bg-secondary transition-all"
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Personalised Recommendations */}
      {user && (aiRecs?.recommendations?.length > 0 || loadingRecs) && (
        <section className="section-padding scroll-reveal transition-colors duration-300 border-t border-border/40"
          style={{ background: 'var(--background)' }}>
          <div className="container-custom">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(190,24,93,0.1), rgba(201,149,108,0.08))', border: '1px solid rgba(201,149,108,0.15)' }}>
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">✨ Recommended For You</h2>
                <p className="text-muted-foreground text-sm">Personalised picks based on your beauty profile</p>
              </div>
              <Button onClick={() => navigate('/profile')} variant="outline" size="sm" className="ml-auto text-xs rounded-xl"
                style={{ borderColor: 'rgba(201,149,108,0.2)' }}>Update Profile</Button>
            </div>
            {loadingRecs ? (
              <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiRecs?.recommendations?.slice(0, 6).map((rec: any, i: number) => (
                  <div key={i} className="group p-5 transition-all hover:-translate-y-1 hover:shadow-lg"
                    style={{
                      borderRadius: '20px',
                      background: 'rgba(255,255,255,0.8)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(201,149,108,0.1)',
                    }}>
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{rec.icon || '💄'}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-sm">{rec.service}</h4>
                          {rec.urgency === 'must_try' && <span className="text-xs px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full font-bold">Must Try</span>}
                          {rec.urgency === 'highly_recommended' && <span className="text-xs px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full font-bold">Top Pick</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{rec.reason}</p>
                        <p className="text-xs text-emerald-600 font-medium mb-3">✓ {rec.benefit}</p>
                        <button onClick={() => navigate(rec.type === 'doorstep' ? '/doorstep-service' : '/#booking')}
                          className="text-xs font-semibold text-white px-4 py-1.5 transition-all group-hover:scale-105"
                          style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #be185d, #a8154f)', boxShadow: '0 4px 12px rgba(190,24,93,0.25)' }}>
                          {rec.type === 'doorstep' ? 'Order Now' : 'Book Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {aiRecs?.tip && (
              <div className="mt-5 p-5" style={{
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(201,149,108,0.06), rgba(190,24,93,0.04))',
                border: '1px solid rgba(201,149,108,0.12)',
              }}>
                <p className="text-sm"><span className="font-bold text-primary">✨ Beauty Tip: </span><span className="text-muted-foreground">{aiRecs.tip}</span></p>
              </div>
            )}
          </div>
        </section>
      )}

      <Services />
      <Gallery />
      <About />
      <Booking />
      <Reviews />
      <Location />

      <FloatingVideo />
    </div>
  );
}
