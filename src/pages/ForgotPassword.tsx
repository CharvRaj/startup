import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';

type Step = 'email' | 'otp' | 'password' | 'success';

export function ForgotPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>('email');
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
  });

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.sendOtp(formData.email);
      toast({
        title: 'OTP Sent!',
        description: 'Please check your email for the verification code',
      });
      setStep('otp');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      await authService.verifyOtpAndSetPassword(
        formData.email,
        formData.otp,
        formData.password
      );
      
      setStep('success');
      toast({
        title: 'Password Reset Successful!',
        description: 'You can now login with your new password',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-14 px-4" style={{ background: '#FAF6F0' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center gap-2 mb-6 text-xs font-semibold text-[#7A6B69] hover:text-[#C83E68] transition-colors bg-white/80 px-3.5 py-1.5 rounded-full border border-[#F5DCE1] shadow-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Login
          </Link>
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#FDF0F4] border border-[#F5DCE1] flex items-center justify-center text-[#C83E68]">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-display text-2xl font-bold text-[#342A29]">
              BlindGlow By Satguru
            </span>
          </div>
          <p className="text-[#7A6B69] text-xs">Reset your password with verified OTP</p>
        </div>

        <Card className="rounded-3xl border border-[#F5DCE1] shadow-lg bg-white overflow-hidden">
          <CardHeader className="pb-3 border-b border-[#F5DCE1]">
            <CardTitle className="text-xl text-center text-[#342A29]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {step === 'email' && 'Forgot Password'}
              {step === 'otp' && 'Enter Verification Code'}
              {step === 'password' && 'Set New Password'}
              {step === 'success' && 'Password Reset Complete'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            {step === 'email' && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <Input
                    required
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="input-luxury"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    We'll send a verification code to your email
                  </p>
                </div>

                <Button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={(e) => { e.preventDefault(); setStep('password'); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Enter OTP
                  </label>
                  <Input
                    required
                    type="text"
                    placeholder="Enter 4-digit code"
                    maxLength={4}
                    value={formData.otp}
                    onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '') }))}
                    className="input-luxury text-center text-2xl tracking-widest"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Check your email for the verification code
                  </p>
                </div>

                <Button type="submit" disabled={formData.otp.length !== 4} className="btn-primary w-full">
                  Continue
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('email')}
                  className="w-full"
                >
                  Change Email
                </Button>
              </form>
            )}

            {step === 'password' && (
              <form onSubmit={handleVerifyAndResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    New Password
                  </label>
                  <Input
                    required
                    type="password"
                    placeholder="Enter new password (min 6 characters)"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="input-luxury"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Confirm New Password
                  </label>
                  <Input
                    required
                    type="password"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="input-luxury"
                  />
                </div>

                <Button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('otp')}
                  className="w-full"
                >
                  Back
                </Button>
              </form>
            )}

            {step === 'success' && (
              <div className="text-center space-y-4 py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="font-semibold text-xl">Password Reset Successful!</h3>
                <p className="text-muted-foreground">
                  Your password has been successfully reset. You can now login with your new password.
                </p>
                <Button onClick={() => navigate('/login')} className="btn-primary w-full">
                  Go to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
