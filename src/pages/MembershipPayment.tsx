import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Crown, CreditCard, CheckCircle, Loader2, User, Mail, Phone, MapPin, Sparkles, ArrowLeft, Gift, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';

type Step = 'details' | 'summary' | 'success';

const PLAN_BENEFITS: Record<string, string[]> = {
  'Bronze': ['10% discount on all services', 'Priority booking', '1x points multiplier'],
  'Silver': ['15% discount on all services', 'Priority booking', '1.5x points multiplier', 'Free consultation'],
  'Gold': ['20% discount on all services', 'VIP priority booking', '2x points multiplier', 'Monthly facial', 'Free hair treatment'],
  'Platinum': ['25% discount on all services', 'Dedicated stylist', '3x points multiplier', 'Monthly full package', 'Home visits'],
  'Diamond': ['30% discount + exclusive access', 'Personal beauty concierge', '5x points multiplier', 'Unlimited services', 'Bridal package discount'],
};

export function MembershipPayment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<Step>('details');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: user?.username || '', email: user?.email || '', phone: '', address: '' });
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [usePoints, setUsePoints] = useState(false);

  const planId = searchParams.get('planId');
  const planName = searchParams.get('name') || 'Membership';
  const price = parseInt(searchParams.get('price') || '0');
  const validityDays = parseInt(searchParams.get('validity') || '30');
  const discountPct = parseInt(searchParams.get('discount') || '0');
  const bonusPoints = Math.floor(price / 5);
  const planKey = Object.keys(PLAN_BENEFITS).find(k => planName.toLowerCase().includes(k.toLowerCase())) || 'Bronze';
  const benefits = PLAN_BENEFITS[planKey] || [];

  // Points discount (up to 10% of price, max 200 points)
  const maxPointsToUse = Math.min(loyaltyPoints, Math.floor(price * 0.1), 200);
  const pointsDiscount = usePoints ? maxPointsToUse : 0;
  const finalPrice = Math.max(0, price - pointsDiscount);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setFormData(p => ({ ...p, name: user.username, email: user.email }));
    supabase.from('loyalty_points').select('points').eq('user_id', user.id).single()
      .then(({ data }) => setLoyaltyPoints(data?.points || 0))
      .catch(() => {});
  }, [user]);

  const handleActivate = async () => {
    if (!user || !planId) return;
    setLoading(true);
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + validityDays);

      const { error } = await supabase.from('user_memberships').insert({
        user_id: user.id,
        plan_id: planId,
        end_date: endDate.toISOString(),
        active: true,
      });
      if (error) throw error;

      // Handle loyalty points
      const { data: loyalty } = await supabase.from('loyalty_points').select('*').eq('user_id', user.id).single();
      if (loyalty) {
        const newPoints = loyalty.points - pointsDiscount + bonusPoints;
        await supabase.from('loyalty_points').update({
          points: Math.max(0, newPoints),
          lifetime_points: loyalty.lifetime_points + bonusPoints,
        }).eq('user_id', user.id);
      } else {
        await supabase.from('loyalty_points').insert({ user_id: user.id, points: bonusPoints, lifetime_points: bonusPoints });
      }

      await supabase.from('loyalty_transactions').insert({
        user_id: user.id, points: bonusPoints, type: 'earned', reason: `${planName} Membership activated`,
      });
      if (pointsDiscount > 0) {
        await supabase.from('loyalty_transactions').insert({
          user_id: user.id, points: -pointsDiscount, type: 'redeemed', reason: `Redeemed for ${planName}`,
        });
      }

      setStep('success');
    } catch (e: any) {
      toast({ title: 'Activation Failed', description: e.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  if (!user) return null;

  const tierGradients: Record<string, string> = {
    Bronze: 'from-orange-400 to-amber-500',
    Silver: 'from-gray-400 to-slate-500',
    Gold: 'from-yellow-400 to-amber-500',
    Platinum: 'from-purple-400 to-violet-500',
    Diamond: 'from-cyan-400 to-blue-500',
  };
  const tierGrad = tierGradients[planKey] || tierGradients.Bronze;

  return (
    <div className="min-h-screen mt-20"
      style={{ background: 'linear-gradient(135deg, #0f0514, #1a0826, #0f0a1e)' }}>
      {/* Blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(circle, #be185d, transparent 70%)' }} />
      <div className="fixed bottom-0 left-0 w-80 h-80 rounded-full opacity-8 pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />

      <div className="container-custom max-w-2xl py-12 px-4 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => step === 'details' ? navigate('/membership') : setStep('details')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Activate Membership</h1>
            <p className="text-white/50 text-sm">{planName}</p>
          </div>
        </div>

        {/* Step indicator */}
        {step !== 'success' && (
          <div className="flex items-center gap-2 mb-8">
            {[{ id: 'details', label: 'Details' }, { id: 'summary', label: 'Review' }].map((s, i, arr) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step === s.id ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white' : step === 'summary' && i === 0 ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/40'}`}>
                  {step === 'summary' && i === 0 ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm ${step === s.id ? 'text-white font-medium' : 'text-white/40'}`}>{s.label}</span>
                {i < arr.length - 1 && <div className="w-8 h-px bg-white/20 mx-1" />}
              </div>
            ))}
          </div>
        )}

        {/* Success Screen */}
        {step === 'success' && (
          <div className="text-center py-12">
            <div className={`w-28 h-28 rounded-3xl mx-auto mb-6 flex items-center justify-center animate-float shadow-2xl bg-gradient-to-br ${tierGrad}`}>
              <Crown className="w-14 h-14 text-white" />
            </div>
            <h2 className="font-display text-3xl font-bold mb-2"
              style={{ background: 'linear-gradient(135deg, #f9a8d4, #fbbf24, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Welcome to {planName}! 🎉
            </h2>
            <p className="text-white/60 mb-8">Your membership is now active. Enjoy exclusive benefits!</p>

            <div className="rounded-2xl p-6 mb-8 text-left"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-pink-400" />Your {planName} Benefits
              </h3>
              <div className="space-y-2">
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />{b}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-white/50 text-sm">Bonus points earned</span>
                <span className="text-emerald-400 font-bold">+{bonusPoints} points</span>
              </div>
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <Button onClick={() => navigate('/profile')} className="gap-2 font-semibold"
                style={{ background: 'linear-gradient(135deg, #be185d, #ec4899)', border: 'none', color: 'white' }}>
                <User className="w-4 h-4" />View Membership Card
              </Button>
              <Button onClick={() => navigate('/')} variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 gap-2">
                <Sparkles className="w-4 h-4" />Explore Services
              </Button>
            </div>
          </div>
        )}

        {/* Step 1: Details */}
        {step === 'details' && (
          <div className="space-y-5">
            {/* Plan card */}
            <div className={`rounded-2xl p-6 bg-gradient-to-br ${tierGrad} relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8" />
              <div className="relative z-10">
                <Crown className="w-8 h-8 text-white mb-2" />
                <h3 className="text-white font-bold text-xl">{planName}</h3>
                <p className="text-white/80 text-sm">{validityDays} days validity • {discountPct}% off all services</p>
                <p className="text-white text-3xl font-black mt-3">₹{price}</p>
              </div>
            </div>

            {/* Billing form */}
            <div className="rounded-2xl p-6 space-y-4"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 className="font-semibold text-white mb-4">Billing Information</h3>
              <div>
                <label className="text-white/60 text-sm mb-1.5 block flex items-center gap-1.5"><User className="w-3 h-3" />Full Name</label>
                <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Your name" className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11" />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-1.5 block flex items-center gap-1.5"><Mail className="w-3 h-3" />Email</label>
                <Input value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  type="email" placeholder="email@example.com" className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11" />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-1.5 block flex items-center gap-1.5"><Phone className="w-3 h-3" />Phone</label>
                <Input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                  type="tel" placeholder="+91 98765 43210" className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11" />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-1.5 block flex items-center gap-1.5"><MapPin className="w-3 h-3" />Address (optional)</label>
                <Input value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                  placeholder="Your address" className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11" />
              </div>
            </div>

            {/* Loyalty points */}
            {loyaltyPoints >= 10 && (
              <div className="rounded-2xl p-5 flex items-center justify-between"
                style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Use Loyalty Points</p>
                    <p className="text-emerald-400 text-xs">Save ₹{maxPointsToUse} using {maxPointsToUse} points</p>
                  </div>
                </div>
                <button onClick={() => setUsePoints(!usePoints)}
                  className={`w-12 h-6 rounded-full transition-all relative ${usePoints ? 'bg-emerald-500' : 'bg-white/20'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${usePoints ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>
            )}

            <Button onClick={() => setStep('summary')} disabled={!formData.name || !formData.email}
              className="w-full h-12 font-semibold text-base"
              style={{ background: 'linear-gradient(135deg, #be185d, #ec4899)', border: 'none', color: 'white' }}>
              Review Order →
            </Button>
          </div>
        )}

        {/* Step 2: Summary */}
        {step === 'summary' && (
          <div className="space-y-5">
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className={`p-5 bg-gradient-to-r ${tierGrad}`}>
                <div className="flex items-center gap-3">
                  <Crown className="w-6 h-6 text-white" />
                  <h3 className="font-bold text-white text-lg">Order Summary</h3>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Plan</span>
                  <span className="text-white font-medium">{planName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Validity</span>
                  <span className="text-white font-medium">{validityDays} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Customer</span>
                  <span className="text-white font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Payment</span>
                  <span className="text-white font-medium">Pay at Salon</span>
                </div>
                <div className="border-t border-white/10 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Subtotal</span>
                    <span className="text-white">₹{price}</span>
                  </div>
                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-400">Points Discount ({maxPointsToUse} pts)</span>
                      <span className="text-emerald-400">- ₹{pointsDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10">
                    <span className="text-white">Total</span>
                    <span style={{ background: 'linear-gradient(135deg, #f9a8d4, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      ₹{finalPrice}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Bonus Points Earned</span>
                    <span className="text-emerald-400">+{bonusPoints} pts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-pink-400" />What You Get</h4>
              <div className="space-y-2">
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />{b}
                  </div>
                ))}
              </div>
            </div>

            {/* Activation date */}
            <div className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: 'rgba(190,24,93,0.1)', border: '1px solid rgba(190,24,93,0.2)' }}>
              <Calendar className="w-5 h-5 text-pink-400 flex-shrink-0" />
              <div>
                <p className="text-white text-sm font-medium">Active from today</p>
                <p className="text-white/50 text-xs">Expires: {new Date(Date.now() + validityDays * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            {/* Security note */}
            <div className="flex items-center gap-2 text-center justify-center text-white/30 text-xs">
              <Shield className="w-3.5 h-3.5" />
              Secure activation • Pay in person at the salon
            </div>

            <Button onClick={handleActivate} disabled={loading}
              className="w-full h-12 font-semibold text-base"
              style={{ background: 'linear-gradient(135deg, #be185d, #ec4899)', border: 'none', color: 'white' }}>
              {loading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />Activating...</> : <><Crown className="w-5 h-5 mr-2" />Activate {planName} ✨</>}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
