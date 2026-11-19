import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Mail, Lock, Eye, EyeOff, Store, User, ArrowLeft, ShieldCheck, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { BrandLogo } from '@/components/common/BrandLogo';

type LoginType = 'member' | 'associate';

export function PartnerLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loginType, setLoginType] = useState<LoginType>('member');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const table = loginType === 'member' ? 'stylist_requests' : 'associate_requests';
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('approved_email', email.toLowerCase().trim())
        .eq('approved_password', password)
        .eq('status', 'approved')
        .single();

      if (error || !data) {
        throw new Error('Invalid credentials or account pending approval');
      }

      if (loginType === 'member') {
        sessionStorage.setItem('member_session', data.id);
        navigate(`/member-dashboard?id=${data.id}`);
        toast({ title: 'Welcome back!', description: `Hello, ${data.full_name}` });
      } else {
        sessionStorage.setItem('associate_session', data.id);
        navigate(`/associate-dashboard?id=${data.id}`);
        toast({ title: 'Welcome back!', description: `Hello, ${data.owner_name}` });
      }
    } catch (error: any) {
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F3] text-[#43152E] flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-4">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#43152E]/70 hover:text-[#D81B60] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
        <Link
          to="/training-academy"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D81B60] hover:underline bg-[#FDF0F4] border border-[#F8DCE4] px-3 py-1.5 rounded-full"
        >
          <GraduationCap className="w-3.5 h-3.5" /> Training Academy
        </Link>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md mx-auto my-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3">
            <BrandLogo />
          </div>
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-[#FDF0F4] border border-[#F8DCE4] text-[#D81B60] shadow-xs">
            {loginType === 'member' ? <User className="w-7 h-7 text-[#D81B60]" /> : <Store className="w-7 h-7 text-[#D81B60]" />}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#43152E]">
            Partner Portal
          </h1>
          <p className="text-[#43152E]/60 text-xs sm:text-sm mt-1">
            Sign in to your stylist dashboard or associate salon terminal
          </p>
        </div>

        {/* Toggle */}
        <div className="flex gap-1.5 mb-5 p-1 rounded-2xl bg-white border border-[#F8DCE4] shadow-2xs">
          {([['member', 'Doorstep Stylist', User], ['associate', 'Associate Salon', Store]] as const).map(([type, label, Icon]) => {
            const isActive = loginType === type;
            return (
              <button
                key={type}
                onClick={() => setLoginType(type)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isActive
                    ? 'bg-[#D81B60] text-white shadow-xs'
                    : 'text-[#43152E]/70 hover:text-[#43152E] hover:bg-[#FFF9F3]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F8DCE4] shadow-sm space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-[#43152E] mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#D81B60]" /> Registered Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="stylist@satguru.in"
              className="w-full h-11 px-4 rounded-xl text-sm bg-[#FFF9F3] border border-[#F8DCE4] text-[#43152E] placeholder:text-[#43152E]/30 focus:outline-none focus:ring-2 focus:ring-[#D81B60]/30 focus:border-[#D81B60]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#43152E] mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#D81B60]" /> Security Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-4 pr-11 rounded-xl text-sm bg-[#FFF9F3] border border-[#F8DCE4] text-[#43152E] placeholder:text-[#43152E]/30 focus:outline-none focus:ring-2 focus:ring-[#D81B60]/30 focus:border-[#D81B60]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#43152E]/40 hover:text-[#43152E]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-2xl font-bold text-white text-sm bg-[#D81B60] hover:bg-[#c21554] flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>Sign In to Terminal</>
            )}
          </button>

          <div className="pt-2 text-center text-[11px] text-[#43152E]/60 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D81B60]" />
            Official credentials provided upon verification & onboarding
          </div>
        </form>
      </div>

      {/* Footer info */}
      <div className="text-center text-xs text-[#43152E]/50 pt-4">
        © {new Date().getFullYear()} BlindGlow By Satguru. Partner Management System.
      </div>
    </div>
  );
}
