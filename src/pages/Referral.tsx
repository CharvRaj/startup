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
    toast({ title: 'Copied!', description: 'Referral code copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    const link = `${window.location.origin}/signup?ref=${referralData?.referral_code}`;
    navigator.clipboard.writeText(link);
    toast({ title: 'Link Copied!', description: 'Referral link copied' });
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(`Join me at BlindGlow By Satguru! Use my referral code *${referralData?.referral_code}* when signing up and we both get 50 loyalty points!\n\nSign up: ${window.location.origin}/signup?ref=${referralData?.referral_code}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen mt-20" style={{ background: '#FAF6F0' }}>
      {/* Hero */}
      <div className="relative overflow-hidden py-16 px-4">
        {/* Background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 opacity-30 blur-3xl pointer-events-none rounded-full"
          style={{ background: 'radial-gradient(circle, #FDF0F4, transparent 70%)' }} />

        <div className="container-custom max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-[#FDF0F4] border border-[#F5DCE1]">
            <Gift className="w-4 h-4 text-[#C83E68]" />
            <span className="text-xs font-semibold text-[#C83E68]">BlindGlow Referral Rewards</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3 text-[#342A29] flex items-center justify-center gap-2">
            <span>Refer & Earn</span>
            <Sparkles className="w-7 h-7 text-[#C83E68] inline" />
          </h1>
          <p className="text-[#7A6B69] text-base mb-8 max-w-lg mx-auto">
            Share your love for BlindGlow By Satguru. Earn <strong className="text-[#C83E68]">50 reward points</strong> for every friend who joins & books!
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { label: 'Friends Referred', value: referralData?.referred_count ?? 0, icon: Users, color: 'from-[#C83E68] to-[#E55B82]' },
              { label: 'Points Earned', value: referralData?.earned_points ?? 0, icon: TrendingUp, color: 'from-[#C69A62] to-[#DFC19A]' },
              { label: 'Points / Referral', value: 50, icon: Crown, color: 'from-[#C83E68] to-[#C69A62]' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-2xl p-4 text-center bg-white border border-[#F5DCE1] shadow-sm">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-2 text-white shadow-sm`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-[#342A29]">{loading ? '—' : value}</p>
                <p className="text-[#7A6B69] text-xs mt-1 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom max-w-4xl pb-20 px-4">
        {/* Referral Code Card */}
        <div className="rounded-3xl overflow-hidden mb-8 relative bg-white border border-[#F5DCE1] shadow-md p-8 text-center">
          <p className="text-[#7A6B69] text-xs font-semibold mb-3 uppercase tracking-widest">Your Exclusive Referral Code</p>
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl mb-6 bg-[#FCF9F5] border-2 border-dashed border-[#F5DCE1]">
            <span className="font-mono text-3xl md:text-4xl font-black tracking-[0.25em] text-[#C83E68]">
              {loading ? '...' : referralData?.referral_code}
            </span>
            <button onClick={copyCode}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[#C83E68] transition-all hover:scale-110 bg-[#FDF0F4] border border-[#F5DCE1]">
              {copied ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          {/* Share buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={copyCode}
              className="gap-2 font-semibold text-white shadow-sm"
              style={{ background: 'linear-gradient(135deg, #C83E68 0%, #A82E52 100%)' }}>
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
            <Button onClick={copyLink} variant="outline"
              className="gap-2 border-[#F5DCE1] bg-white text-[#342A29] hover:bg-[#FAF6F0]">
              <ExternalLink className="w-4 h-4 text-[#C83E68]" />Copy Link
            </Button>
            <Button onClick={shareWhatsApp}
              className="gap-2 font-semibold text-white shadow-sm"
              style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)' }}>
              <Share2 className="w-4 h-4" />Share on WhatsApp
            </Button>
          </div>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { step: '01', title: 'Share Your Code', desc: 'Share your unique code via WhatsApp or copy the link to send to friends', icon: Share2, color: 'from-[#C83E68] to-[#E55B82]' },
            { step: '02', title: 'Friend Signs Up', desc: 'Your friend creates an account using your referral code during signup', icon: Users, color: 'from-[#C69A62] to-[#DFC19A]' },
            { step: '03', title: 'Both Earn Points', desc: 'You both get 50 loyalty points instantly when they sign up & book', icon: Gift, color: 'from-[#C83E68] to-[#C69A62]' },
          ].map(({ step, title, desc, icon: Icon, color }) => (
            <div key={step} className="rounded-2xl p-6 bg-white border border-[#F5DCE1] shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 text-white shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-4xl font-black text-[#F5DCE1]">{step}</span>
              </div>
              <h3 className="font-bold text-[#342A29] mb-2">{title}</h3>
              <p className="text-[#7A6B69] text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Referral history */}
        <div className="rounded-2xl overflow-hidden bg-white border border-[#F5DCE1] shadow-sm">
          <div className="p-6 border-b border-[#F5DCE1]">
            <h3 className="font-bold text-[#342A29] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#C83E68]" />
              Referral History ({referrals.length})
            </h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-[#C83E68]" /></div>
            ) : referrals.length === 0 ? (
              <div className="text-center py-10">
                <Users className="w-16 h-16 mx-auto mb-4 text-[#F5DCE1]" />
                <p className="text-[#7A6B69] font-medium mb-1">No referrals yet</p>
                <p className="text-[#7A6B69]/70 text-xs">Share your code above to start earning rewards!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map((ref) => (
                  <div key={ref.id} className="flex items-center justify-between p-4 rounded-xl bg-[#FCF9F5] border border-[#F5DCE1]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C83E68] to-[#E55B82] flex items-center justify-center text-white">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[#342A29] font-medium text-sm">New Referral</p>
                        <p className="text-[#7A6B69] text-xs">{new Date(ref.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#C83E68] font-bold text-sm">+{ref.reward_points} pts</span>
                      <Badge className={ref.status === 'completed' ? 'bg-[#FDF0F4] text-[#C83E68] border-[#F5DCE1]' : 'bg-amber-50 text-amber-700 border-amber-200'}>
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
            className="bg-white border-[#F5DCE1] text-[#342A29] hover:bg-[#FAF6F0] gap-2 rounded-xl">
            <Crown className="w-4 h-4 text-[#C69A62]" />View My Profile & Points
          </Button>
        </div>
      </div>
    </div>
  );
}
