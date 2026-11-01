import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, Eye, EyeOff, Store, User, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

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
        throw new Error('Invalid credentials or account not approved');
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
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0f0514, #1a0826, #0a0f1e)' }}>
      {/* Background glows */}
      <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #be185d, transparent 70%)' }} />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 mb-6 text-white/60 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-2xl animate-float"
            style={{ background: loginType === 'member' ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'linear-gradient(135deg, #be185d, #ec4899)' }}>
            {loginType === 'member' ? <User className="w-8 h-8 text-white" /> : <Store className="w-8 h-8 text-white" />}
          </div>
          <h1 className="font-display text-2xl font-bold mb-1"
            style={{ background: 'linear-gradient(135deg, #f9a8d4, #fbbf24, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Partner Portal
          </h1>
          <p className="text-white/50 text-sm">Sign in to your stylist or associate store dashboard</p>
        </div>

        {/* Toggle */}
        <div className="flex gap-1.5 mb-6 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
          {([['member', 'Member / Stylist', User], ['associate', 'Associate Store', Store]] as const).map(([type, label, Icon]) => (
            <button key={type} onClick={() => setLoginType(type)}
              className="flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              style={loginType === type
                ? { background: type === 'member' ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'linear-gradient(135deg, #be185d, #ec4899)', color: 'white' }
                : { color: 'rgba(255,255,255,0.5)' }}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin}
          className="rounded-3xl p-6 space-y-4"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/70"><Mail className="w-4 h-4 inline mr-1.5" />Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
              className="w-full h-12 px-4 rounded-xl text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', '--tw-ring-color': loginType === 'member' ? 'rgba(124,58,237,0.5)' : 'rgba(190,24,93,0.5)' } as any} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-white/70"><Lock className="w-4 h-4 inline mr-1.5" />Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password"
                className="w-full h-12 px-4 pr-12 rounded-xl text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
            style={{ background: loginType === 'member' ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'linear-gradient(135deg, #be185d, #ec4899)' }}>
            {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in...</> : <>Sign In to Dashboard</>}
          </button>
          <p className="text-center text-xs text-white/30">
            Credentials are assigned by admin after approval. Contact admin if you haven't received them.
          </p>
        </form>
      </div>
    </div>
  );
}
