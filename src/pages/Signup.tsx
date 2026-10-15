import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, ArrowLeft, Eye, EyeOff, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';

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
      toast({ title: isResend ? '✅ OTP Resent!' : '✅ OTP Sent!', description: `4-digit code sent to ${formData.email}` });
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0514] via-[#1a0826] to-[#0a0f1e]" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse-slow"
        style={{ background: 'radial-gradient(circle, #be185d 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl animate-pulse-slow"
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', animationDelay: '1.5s' }} />
      {['💄', '✨', '💅', '🌸', '👑'].map((em, i) => (
        <div key={i} className="absolute text-2xl opacity-20 animate-float select-none pointer-events-none"
          style={{ top: `${10 + i * 16}%`, right: `${5 + (i % 2) * 88}%`, animationDelay: `${i * 0.6}s` }}>
          {em}
        </div>
      ))}

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 text-white/60 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-violet-500/40 animate-float">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold mb-1"
            style={{ background: 'linear-gradient(135deg, #f9a8d4, #fbbf24, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Satguru Makeup Art
          </h1>
          <p className="text-white/50 text-sm">
            {step === 'email' ? 'Create your account' : 'Verify your email'}
          </p>
        </div>

        <Card className="border border-white/10 shadow-2xl"
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-center text-white">
              {step === 'email' ? 'Join Us ✨' : 'Enter OTP'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 'email' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/80"><Mail className="w-4 h-4 inline mr-1.5" />Email Address</label>
                  <Input required type="email" placeholder="your@email.com" value={formData.email}
                    onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                    className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-violet-400 focus:bg-white/15" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/80"><User className="w-4 h-4 inline mr-1.5" />Username</label>
                  <Input required type="text" placeholder="Choose a username" value={formData.username}
                    onChange={(e) => setFormData(p => ({ ...p, username: e.target.value }))}
                    className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-violet-400 focus:bg-white/15" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/80"><Lock className="w-4 h-4 inline mr-1.5" />Password</label>
                  <div className="relative">
                    <Input required type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" minLength={6}
                      value={formData.password} onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                      className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-violet-400 focus:bg-white/15 pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/80"><Gift className="w-4 h-4 inline mr-1.5" />Referral Code (Optional)</label>
                  <Input type="text" placeholder="e.g. SATGURU123ABC" value={formData.referralCode}
                    onChange={(e) => setFormData(p => ({ ...p, referralCode: e.target.value.toUpperCase() }))}
                    className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-violet-400 focus:bg-white/15 font-mono tracking-wider" />
                  <p className="text-white/30 text-xs mt-1">Both you and your friend earn 50 loyalty points!</p>
                </div>
                <Button type="submit" disabled={loading}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 border-0 shadow-lg shadow-violet-500/30 transition-all hover:-translate-y-0.5">
                  {loading ? <span className="flex items-center gap-2"><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending...</span> : 'Send Verification Code ✉️'}
                </Button>
                <p className="text-center text-sm text-white/50">
                  Already have an account?{' '}
                  <Link to="/login" className="text-violet-300 hover:text-violet-200 font-medium transition-colors">Sign In</Link>
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="text-center p-4 rounded-2xl border border-white/10 bg-white/5 mb-2">
                  <p className="text-sm text-white/60">Code sent to</p>
                  <p className="font-semibold text-white">{formData.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/80">4-Digit Verification Code</label>
                  <Input required type="text" placeholder="0000" maxLength={4} value={formData.otp}
                    onChange={(e) => setFormData(p => ({ ...p, otp: e.target.value }))}
                    className="h-16 text-center text-3xl tracking-[0.6em] font-mono bg-white/10 border-white/20 text-white placeholder:text-white/20 focus:border-violet-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/80"><Gift className="w-4 h-4 inline mr-1.5" />Referral Code (Optional)</label>
                  <Input type="text" placeholder="e.g. SATGURU123ABC" value={formData.referralCode}
                    onChange={(e) => setFormData(p => ({ ...p, referralCode: e.target.value.toUpperCase() }))}
                    className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-violet-400 focus:bg-white/15 font-mono tracking-wider" />
                  <p className="text-white/30 text-xs mt-1">Both you and your friend earn 50 loyalty points!</p>
                </div>
                <Button type="submit" disabled={loading}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 border-0 shadow-lg shadow-violet-500/30 transition-all hover:-translate-y-0.5">
                  {loading ? <span className="flex items-center gap-2"><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Verifying...</span> : 'Complete Registration 🎉'}
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => handleSendOtp(undefined, true)}
                    disabled={resendTimer > 0 || resendCount >= MAX_RESEND || loading}
                    className="flex-1 text-sm border-white/20 text-white/70 hover:bg-white/10 bg-transparent">
                    {resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend OTP'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setStep('email')}
                    className="flex-1 text-sm border-white/20 text-white/70 hover:bg-white/10 bg-transparent">Change Email</Button>
                </div>
                <p className="text-xs text-center text-white/30">{resendCount}/{MAX_RESEND} resend attempts used</p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
