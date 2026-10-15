import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Copy, Share2, Gift, Users, CheckCircle, TrendingUp, Crown, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';

interface ReferralData {
  referral_code: string;
  referred_count: number;
  earned_points: number;
}

interface ReferralRecord {
  id: string;
  status: string;
  reward_points: number;
  created_at: string;
  referred_id: string;
}

export function Referral() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchReferralData();
  }, [user]);

  const fetchReferralData = async () => {
    try {
      // Get referral code from user_profiles
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('referral_code')
        .eq('id', user!.id)
        .single();

      let code = profile?.referral_code;

      // If no code, generate one
      if (!code) {
        code = `SATGURU${user!.id.slice(0, 6).toUpperCase()}`;
        await supabase.from('user_profiles').update({ referral_code: code }).eq('id', user!.id);
      }

      // Get referrals made by this user
      const { data: refs } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user!.id)
        .order('created_at', { ascending: false });

      const referralsList = refs || [];
      const earnedPoints = referralsList.filter(r => r.status === 'completed').length * 50;

      setReferralData({
        referral_code: code,
        referred_count: referralsList.length,
        earned_points: earnedPoints,
      });
      setReferrals(referralsList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (!referralData?.referral_code) return;
    navigator.clipboard.writeText(referralData.referral_code);
    setCopied(true);
    toast({ title: '✅ Copied!', description: 'Referral code copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    const link = `${window.location.origin}/signup?ref=${referralData?.referral_code}`;
    navigator.clipboard.writeText(link);
    toast({ title: '✅ Link Copied!', description: 'Referral link copied' });
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(`✨ Join me at Satguru Makeup Art! Use my referral code *${referralData?.referral_code}* when signing up and we both get 50 loyalty points!\n\nSign up: ${window.location.origin}/signup?ref=${referralData?.referral_code}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen mt-20"
      style={{ background: 'linear-gradient(135deg, #0f0514, #1a0826, #0f0a1e)' }}>
      {/* Hero */}
      <div className="relative overflow-hidden py-20 px-4">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #be185d, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />

        <div className="container-custom max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full"
            style={{ background: 'rgba(190,24,93,0.15)', border: '1px solid rgba(190,24,93,0.3)' }}>
            <Gift className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-medium text-pink-300">Referral Program</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4"
            style={{ background: 'linear-gradient(135deg, #f9a8d4, #fbbf24, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Refer & Earn ✨
          </h1>
          <p className="text-white/60 text-lg mb-10 max-w-lg mx-auto">
            Share your love for Satguru Makeup Art. Earn <strong className="text-pink-400">50 points</strong> for every friend who joins!
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { label: 'Friends Referred', value: referralData?.referred_count ?? 0, icon: Users, color: 'from-rose-400 to-pink-500' },
              { label: 'Points Earned', value: referralData?.earned_points ?? 0, icon: TrendingUp, color: 'from-violet-400 to-purple-500' },
              { label: 'Points / Referral', value: 50, icon: Crown, color: 'from-amber-400 to-yellow-500' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-2xl p-4 text-center"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{loading ? '—' : value}</p>
                <p className="text-white/40 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom max-w-4xl pb-20 px-4">
        {/* Referral Code Card */}
        <div className="rounded-3xl overflow-hidden mb-8 relative"
          style={{ background: 'linear-gradient(135deg, rgba(190,24,93,0.2), rgba(124,58,237,0.2))', border: '1px solid rgba(255,255,255,0.1)' }}>
          {/* Shimmer effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            <div className="absolute inset-0 animate-shimmer-load" style={{ opacity: 0.3 }} />
          </div>

          <div className="relative z-10 p-8 text-center">
            <p className="text-white/60 text-sm mb-3 uppercase tracking-widest">Your Referral Code</p>
            <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl mb-6"
              style={{ background: 'rgba(0,0,0,0.3)', border: '2px dashed rgba(255,255,255,0.2)' }}>
              <span className="font-mono text-3xl md:text-4xl font-black tracking-[0.3em]"
                style={{ background: 'linear-gradient(135deg, #f9a8d4, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {loading ? '...' : referralData?.referral_code}
              </span>
              <button onClick={copyCode}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all hover:scale-110"
                style={{ background: copied ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                {copied ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            {/* Share buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={copyCode}
                className="gap-2 font-semibold"
                style={{ background: 'linear-gradient(135deg, #be185d, #ec4899)', border: 'none', color: 'white' }}>
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy Code'}
              </Button>
              <Button onClick={copyLink} variant="outline"
                className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
                <ExternalLink className="w-4 h-4" />Copy Link
              </Button>
              <Button onClick={shareWhatsApp}
                className="gap-2 font-semibold"
                style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)', border: 'none', color: 'white' }}>
                <Share2 className="w-4 h-4" />Share on WhatsApp
              </Button>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { step: '01', title: 'Share Your Code', desc: 'Share your unique code via WhatsApp or copy the link to send to friends', icon: Share2, color: 'from-rose-500 to-pink-500' },
            { step: '02', title: 'Friend Signs Up', desc: 'Your friend creates an account using your referral code during signup', icon: Users, color: 'from-violet-500 to-purple-500' },
            { step: '03', title: 'Both Earn Points', desc: 'You both get 50 loyalty points instantly when they sign up & book', icon: Gift, color: 'from-amber-500 to-orange-500' },
          ].map(({ step, title, desc, icon: Icon, color }) => (
            <div key={step} className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-5xl font-black opacity-10 text-white">{step}</span>
              </div>
              <h3 className="font-bold text-white mb-2">{title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Referral history */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <h3 className="font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-pink-400" />
              Referral History ({referrals.length})
            </h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : referrals.length === 0 ? (
              <div className="text-center py-10">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-20 text-white" />
                <p className="text-white/50 mb-2">No referrals yet</p>
                <p className="text-white/30 text-sm">Share your code to start earning!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map((ref) => (
                  <div key={ref.id} className="flex items-center justify-between p-4 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">New Referral</p>
                        <p className="text-white/40 text-xs">{new Date(ref.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 font-bold text-sm">+{ref.reward_points} pts</span>
                      <Badge className={ref.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}>
                        {ref.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Button onClick={() => navigate('/profile')} variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 gap-2">
            <Crown className="w-4 h-4" />View My Profile & Points
          </Button>
        </div>
      </div>
    </div>
  );
}
