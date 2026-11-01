import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Check, Sparkles, TrendingUp, Gift, Star, Zap, Shield, Clock, Heart, Award, Medal, Trophy, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import type { MembershipPlan, UserMembership } from '@/types';

const TIER_CONFIG: Record<string, { gradient: string; badge: string; icon: any; glow: string; text: string }> = {
  bronze:   { gradient: 'from-[#B55B33] to-[#D4AF70]', badge: 'bg-[#FDF0F4] text-[#B55B33]', icon: Award, glow: 'shadow-[#F5DCE1]', text: 'text-[#B55B33]' },
  silver:   { gradient: 'from-[#7A706A] to-[#A39992]', badge: 'bg-stone-100 text-stone-800',   icon: Medal, glow: 'shadow-stone-200',  text: 'text-[#5C4D4A]' },
  gold:     { gradient: 'from-[#C69A62] to-[#E5A855]', badge: 'bg-amber-50 text-amber-900',   icon: Trophy, glow: 'shadow-amber-200', text: 'text-[#B57C32]' },
  platinum: { gradient: 'from-[#C83E68] to-[#992244]', badge: 'bg-[#F5DCE1] text-[#C83E68]', icon: Gem, glow: 'shadow-pink-200', text: 'text-[#C83E68]' },
  diamond:  { gradient: 'from-[#43152E] to-[#6E1C48]', badge: 'bg-[#FDF0F4] text-[#43152E]', icon: Crown, glow: 'shadow-[#F5DCE1]', text: 'text-[#43152E]' },
};

export function Membership() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [userMembership, setUserMembership] = useState<UserMembership | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
    if (user) fetchUserMembership();
  }, [user]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('active', true)
        .order('display_order');
      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMembership = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_memberships')
        .select('*, plan:membership_plans(*)')
        .eq('user_id', user.id)
        .eq('active', true)
        .gte('end_date', new Date().toISOString())
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      setUserMembership(data || null);
    } catch { /* no active membership */ }
  };

  const cfg = (tier: string) => TIER_CONFIG[tier] || TIER_CONFIG.bronze;

  return (
    <div className="min-h-screen" style={{ background: '#FAF6F0' }}>
      {/* Hero */}
      <div className="relative overflow-hidden pt-28 pb-16 px-6 text-center border-b border-[#F5DCE1]" style={{ background: '#FFF9F5' }}>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 tracking-wide"
            style={{ background: '#F5DCE1', color: '#542337', border: '1px solid rgba(200,62,104,0.2)' }}
          >
            <Crown className="w-3.5 h-3.5 text-[#C83E68]" />
            Exclusive VIP Club
          </div>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight leading-tight"
            style={{ color: '#342A29', fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Elevate Your <span className="italic" style={{ color: '#C83E68' }}>Beauty Experience</span>
          </h1>
          <p className="text-base sm:text-lg max-w-2xl mx-auto mb-8 font-normal" style={{ color: '#542337', opacity: 0.85 }}>
            Enjoy up to 30% savings on every salon &amp; doorstep service, multiplied loyalty points, and VIP priority booking.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {['10–30% Off All Services', 'Priority Artist Allocation', 'Multiplied Loyalty Points', 'Exclusive Member Gifts'].map(f => (
              <div
                key={f}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border"
                style={{ background: '#FFFFFF', borderColor: '#F5DCE1', color: '#342A29' }}
              >
                <Check className="w-3.5 h-3.5 text-[#C83E68]" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom max-w-7xl py-12 px-4">
        {/* Active Membership Banner */}
        {userMembership && (userMembership.plan as MembershipPlan) && (
          <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${cfg((userMembership.plan as MembershipPlan).tier).gradient} p-6 sm:p-8 mb-10 shadow-lg border border-[#F5DCE1]`}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  {(() => { const ActiveIcon = cfg((userMembership.plan as MembershipPlan).tier).icon; return <ActiveIcon className="w-8 h-8 text-white" />; })()}
                </div>
                <div className="text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-xl">{(userMembership.plan as MembershipPlan).name}</h3>
                    <Badge className="bg-white/30 text-white border-0 text-xs flex items-center gap-1"><Check className="w-3 h-3" /> Active</Badge>
                  </div>
                  <p className="text-white/80 text-sm">
                    Valid until {new Date(userMembership.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-white">
                <div className="text-center">
                  <p className="text-3xl font-black">{(userMembership.plan as MembershipPlan).discount_percentage}%</p>
                  <p className="text-xs text-white/80">Discount</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black">{(userMembership.plan as MembershipPlan).points_multiplier}x</p>
                  <p className="text-xs text-white/80">Points</p>
                </div>
                <Button
                  onClick={() => navigate('/doorstep-service')}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm rounded-xl font-semibold"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Shop Now
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Plans */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse border border-border/40">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4" />
                <div className="h-5 bg-gray-200 rounded mb-3 w-3/4 mx-auto" />
                <div className="h-8 bg-gray-200 rounded mb-4 w-1/2 mx-auto" />
                <div className="space-y-2">
                  {[1,2,3].map(j => <div key={j} className="h-3 bg-gray-100 rounded" />)}
                </div>
                <div className="h-10 bg-gray-200 rounded-xl mt-6" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
            {plans.map((plan, idx) => {
              const c = cfg(plan.tier);
              const isPopular = plan.tier === 'gold';
              const isCurrent = userMembership?.plan_id === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-3xl overflow-hidden border transition-all duration-300 hover:-translate-y-2 flex flex-col group ${
                    isPopular ? 'border-[#C69A62] shadow-xl ring-2 ring-[#C69A62]/20 scale-102' : 'border-[#F5DCE1] shadow-sm hover:shadow-lg'
                  }`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {isPopular && (
                    <div className="absolute top-0 inset-x-0 flex justify-center -translate-y-px z-10">
                      <div className="bg-[#C69A62] text-white text-[11px] font-bold px-3 py-0.5 rounded-b-xl flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-current" />
                        MOST POPULAR
                      </div>
                    </div>
                  )}

                  {/* Tier color bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${c.gradient}`} />

                  {/* Header */}
                  <div className="p-6 text-center border-b border-border/30">
                    <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mb-4 shadow-lg ${c.glow} group-hover:scale-110 transition-transform duration-300`}>
                      <c.icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-foreground">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1 mb-1">
                      <span className={`text-4xl font-black ${c.text}`}>₹{plan.price}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">for {plan.validity_days} days</p>
                    <div className="flex justify-center gap-4 mt-4 pt-3 border-t border-border/30">
                      <div className="text-center">
                        <p className={`text-2xl font-black ${c.text}`}>{plan.discount_percentage}%</p>
                        <p className="text-xs text-muted-foreground">Off</p>
                      </div>
                      <div className="h-8 w-px bg-border/40" />
                      <div className="text-center">
                        <p className={`text-2xl font-black ${c.text}`}>{plan.points_multiplier}x</p>
                        <p className="text-xs text-muted-foreground">Points</p>
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="p-5 flex-1">
                    <ul className="space-y-2.5">
                      {(plan.benefits as string[]).map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${c.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-foreground leading-tight">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="p-5 pt-0">
                    {isCurrent ? (
                      <div className="w-full py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 font-semibold text-sm flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" />
                        Your Current Plan
                      </div>
                    ) : (
                      <button
                        onClick={() => navigate(`/membership-payment?planId=${plan.id}&name=${encodeURIComponent(plan.name)}&price=${plan.price}&validity=${plan.validity_days}`)}
                        className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:shadow-md active:scale-95 ${
                          isPopular
                            ? `bg-gradient-to-r ${c.gradient} text-white hover:opacity-90 shadow-lg`
                            : `bg-gradient-to-r ${c.gradient} text-white hover:opacity-90`
                        }`}
                      >
                        <Zap className="w-4 h-4" />
                        Subscribe Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Why Membership */}
        <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 rounded-3xl p-10 border border-violet-100">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold mb-3">Why Our Members Love It</h2>
            <p className="text-muted-foreground">Join thousands of happy members enjoying premium beauty services</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Gift, title: 'Exclusive Benefits', desc: 'Priority booking, birthday gifts, and special seasonal offers', color: 'text-rose-500', bg: 'bg-rose-50' },
              { icon: TrendingUp, title: 'Save Up to 30%', desc: 'Significant discounts on all salon, doorstep, and mehndi services', color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { icon: Sparkles, title: 'VIP Treatment', desc: 'Personal consultant, early access to new services and events', color: 'text-violet-500', bg: 'bg-violet-50' },
              { icon: Shield, title: 'Guaranteed Quality', desc: 'Top-rated artists, premium products, satisfaction guaranteed', color: 'text-blue-500', bg: 'bg-blue-50' },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-white/80 hover:shadow-md transition-shadow text-center">
                <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-7 h-7 ${color}`} />
                </div>
                <h4 className="font-bold mb-2">{title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
