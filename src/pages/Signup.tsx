import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles, Mail, Lock, User, ArrowLeft, Eye, EyeOff,
  Gift, CheckCircle2, ShieldCheck, Star, Send, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import { BrandLogo } from '@/components/common/BrandLogo';

export function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuthStore();
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', username: '', password: '', otp: '', referralCode: '' });
  const [resendTimer, setResendTimer] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const MAX_RESEND = 3;

  const handleSendOtp = async (e?: React.FormEvent, isResend = false) => {
    if (e) e.preventDefault();
    if (isResend && resendTimer > 0) {
      toast({ title: 'Please wait', description: `Resend in ${resendTimer}s`, variant: 'destructive' });
      return;
    }
    if (isResend && resendCount >= MAX_RESEND) {
      toast({ title: 'Limit Reached', description: 'Max resend attempts exceeded', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await authService.sendOtp(formData.email);
      setStep('verify');
      if (isResend) setResendCount(p => p + 1);
      setResendTimer(60);
      const iv = setInterval(() => setResendTimer(p => { if (p <= 1) { clearInterval(iv); return 0; } return p - 1; }), 1000);
      toast({ title: isResend ? 'OTP Resent!' : 'OTP Sent!', description: `4-digit code sent to ${formData.email}` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await authService.verifyOtpAndSetPassword(formData.email, formData.otp, formData.password, formData.username);
      login(authService.mapUser(user!));
      // If referral code provided, store it
      if (formData.referralCode.trim()) {
        await supabase.from('user_profiles').update({ referred_by: formData.referralCode.trim().toUpperCase() }).eq('id', user!.id);
      }
      navigate('/');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-14 px-4 sm:px-6" style={{ background: '#FAF6F0' }}>
      {/* Subtle background glow */}
      <div
        className="absolute top-0 right-1/4 w-[480px] h-[480px] rounded-full opacity-40 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #FDF0F4 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-0 left-1/4 w-[420px] h-[420px] rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #FCF9F1 0%, transparent 70%)' }}
      />

      <div className="relative z-10 w-full max-w-4xl">
        {/* Navigation Link back */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#7A6B69] hover:text-[#C83E68] transition-colors bg-white/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-[#F5DCE1] shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Storefront</span>
          </Link>
        </div>

        {/* Main 2-Column Split Card */}
        <div className="bg-white rounded-[32px] border border-[#F5DCE1] shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Brand Editorial Panel (5 cols) */}
          <div
            className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden text-[#342A29] border-b lg:border-b-0 lg:border-r border-[#F5DCE1]"
            style={{
              background: 'linear-gradient(165deg, #FCF9F5 0%, #FDF0F4 100%)',
            }}
          >
            <div>
              <div className="mb-8">
                <BrandLogo isLightMode={true} />
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-[#F5DCE1] text-[#C83E68] shadow-xs mb-4">
                <Gift className="w-3.5 h-3.5" />
                <span>Join BlindGlow Rewards</span>
              </div>

              <h2
                className="text-2xl sm:text-3xl font-bold leading-snug mb-3 text-[#342A29]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Create Your <span className="italic text-[#C83E68]">Beauty Account</span>
              </h2>

              <p className="text-xs sm:text-sm text-[#7A6B69] leading-relaxed mb-6">
                Earn 50 reward points upon signup, save favorite doorstep rituals, and book certified beauty artists at your door.
              </p>
            </div>

            {/* Perks list */}
            <div className="space-y-3 pt-6 border-t border-[#F5DCE1]">
              <div className="flex items-center gap-2.5 text-xs text-[#342A29] font-medium">
                <div className="w-6 h-6 rounded-full bg-[#FDF0F4] border border-[#F5DCE1] flex items-center justify-center text-[#C83E68] flex-shrink-0">
                  <Gift className="w-3.5 h-3.5" />
                </div>
                <span>50 Welcome Loyalty Points instantly</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#342A29] font-medium">
                <div className="w-6 h-6 rounded-full bg-[#FDF0F4] border border-[#F5DCE1] flex items-center justify-center text-[#C83E68] flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span>Exclusive seasonal member discounts</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#342A29] font-medium">
                <div className="w-6 h-6 rounded-full bg-[#FDF0F4] border border-[#F5DCE1] flex items-center justify-center text-[#C83E68] flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span>Priority booking slots for doorstep salon</span>
              </div>
            </div>
          </div>

          {/* Right Column: Sign Up Form (7 cols) */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-6">
                <h3
                  className="text-2xl font-bold text-[#342A29] mb-1"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {step === 'email' ? 'Create Account' : 'Verify Email'}
                </h3>
                <p className="text-xs sm:text-sm text-[#7A6B69]">
                  {step === 'email' ? 'Quick 1-minute registration with OTP verification' : `Enter the 4-digit verification code sent to ${formData.email}`}
                </p>
              </div>

              {step === 'email' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#342A29] uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#7A6B69] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <Input
                        required
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                        className="h-11 pl-10 bg-[#FAF6F0] border-[#F5DCE1] rounded-xl text-xs text-[#342A29] placeholder:text-[#7A6B69]/60 focus:bg-white focus:border-[#C83E68] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#342A29] uppercase tracking-wider mb-1.5">
                      Full Name / Username
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#7A6B69] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <Input
                        required
                        type="text"
                        placeholder="Choose a username"
                        value={formData.username}
                        onChange={(e) => setFormData((p) => ({ ...p, username: e.target.value }))}
                        className="h-11 pl-10 bg-[#FAF6F0] border-[#F5DCE1] rounded-xl text-xs text-[#342A29] placeholder:text-[#7A6B69]/60 focus:bg-white focus:border-[#C83E68] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#342A29] uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#7A6B69] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <Input
                        required
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min 6 characters"
                        minLength={6}
                        value={formData.password}
                        onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                        className="h-11 pl-10 pr-10 bg-[#FAF6F0] border-[#F5DCE1] rounded-xl text-xs text-[#342A29] placeholder:text-[#7A6B69]/60 focus:bg-white focus:border-[#C83E68] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A6B69] hover:text-[#342A29] transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#342A29] uppercase tracking-wider mb-1.5">
                      Referral Code (Optional)
                    </label>
                    <div className="relative">
                      <Gift className="w-4 h-4 text-[#7A6B69] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <Input
                        type="text"
                        placeholder="e.g. BLINDGLOW123"
                        value={formData.referralCode}
                        onChange={(e) => setFormData((p) => ({ ...p, referralCode: e.target.value.toUpperCase() }))}
                        className="h-11 pl-10 bg-[#FAF6F0] border-[#F5DCE1] rounded-xl text-xs text-[#342A29] placeholder:text-[#7A6B69]/60 focus:bg-white focus:border-[#C83E68] transition-all font-mono"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 text-xs font-bold text-white rounded-xl shadow-md transition-all duration-300 hover:brightness-105 active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
                    style={{
                      background: 'linear-gradient(135deg, #C83E68 0%, #A82E52 100%)',
                      boxShadow: '0 6px 18px -4px rgba(200,62,104,0.4)',
                    }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending Code...
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Verification Code</span>
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#FCF9F5] border border-[#F5DCE1] text-center mb-2">
                    <p className="text-xs text-[#7A6B69]">Verification code sent to</p>
                    <p className="font-bold text-sm text-[#342A29] mt-0.5">{formData.email}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#342A29] uppercase tracking-wider mb-1.5">
                      4-Digit OTP Code
                    </label>
                    <Input
                      required
                      type="text"
                      placeholder="0000"
                      maxLength={4}
                      value={formData.otp}
                      onChange={(e) => setFormData((p) => ({ ...p, otp: e.target.value }))}
                      className="h-14 text-center text-2xl tracking-[0.5em] font-mono bg-[#FAF6F0] border-[#F5DCE1] rounded-xl text-[#342A29] focus:bg-white focus:border-[#C83E68]"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 text-xs font-bold text-white rounded-xl shadow-md transition-all duration-300 hover:brightness-105 active:scale-[0.99] flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #C83E68 0%, #A82E52 100%)',
                      boxShadow: '0 6px 18px -4px rgba(200,62,104,0.4)',
                    }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Complete Registration</span>
                      </>
                    )}
                  </Button>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSendOtp(undefined, true)}
                      disabled={resendTimer > 0 || resendCount >= MAX_RESEND || loading}
                      className="flex-1 text-xs h-9 rounded-xl border-[#F5DCE1] text-[#7A6B69] hover:bg-[#FAF6F0]"
                    >
                      {resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend OTP'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep('email')}
                      className="flex-1 text-xs h-9 rounded-xl border-[#F5DCE1] text-[#7A6B69] hover:bg-[#FAF6F0]"
                    >
                      Change Email
                    </Button>
                  </div>
                </form>
              )}

              {/* Bottom Sign-in prompt */}
              <div className="mt-6 pt-5 border-t border-[#F5DCE1] text-center text-xs text-[#7A6B69]">
                <span>Already have an account? </span>
                <Link
                  to="/login"
                  className="font-bold text-[#C83E68] hover:underline inline-flex items-center gap-1"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
