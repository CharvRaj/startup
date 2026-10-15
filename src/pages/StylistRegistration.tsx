import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Upload, Star, Calendar, Check, Sparkles, Loader2, Mail, Shield, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const SPECIALIZATIONS = [
  'Bridal Makeup', 'Party Makeup', 'Hair Styling', 'Hair Coloring',
  'Facial & Skincare', 'Mehndi Artist', 'Permanent Makeup', 'Nail Art', 'Spa Therapist',
];
const AVAILABLE_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function StylistRegistration() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1=info, 2=availability, 3=portfolio, 4=otp+terms
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', specialization: '', experienceYears: '', bio: '',
    availableDays: [] as string[], openingTime: '10:00', closingTime: '20:00',
  });
  const [documents, setDocuments] = useState({
    profilePhoto: null as File | null,
    work1: null as File | null, work2: null as File | null, work3: null as File | null,
  });

  const handleFileChange = (field: keyof typeof documents, file: File | null) =>
    setDocuments({ ...documents, [field]: file });

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const { error } = await supabase.storage.from('gallery').upload(path, arrayBuffer, { contentType: file.type, upsert: true });
    if (error) { console.warn('Upload skipped:', error.message); return ''; }
    const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path);
    return publicUrl;
  };

  const sendOtp = async () => {
    if (!formData.email) { toast({ title: 'Enter email first', variant: 'destructive' }); return; }
    setSendingOtp(true);
    // Try signInWithOtp — works for both existing and new emails
    const { error } = await supabase.auth.signInWithOtp({ email: formData.email, options: { shouldCreateUser: true } });
    if (error) { toast({ title: 'OTP Error', description: error.message, variant: 'destructive' }); setSendingOtp(false); return; }
    setOtpSent(true);
    toast({ title: '📧 OTP Sent!', description: `Check ${formData.email} for your 4-digit code` });
    setSendingOtp(false);
  };

  const verifyOtp = async () => {
    if (otpCode.length < 4) { toast({ title: 'Enter the OTP code', variant: 'destructive' }); return; }
    setVerifyingOtp(true);
    const { error } = await supabase.auth.verifyOtp({ email: formData.email, token: otpCode, type: 'email' });
    if (error) { toast({ title: 'Invalid OTP', description: 'Check code and try again', variant: 'destructive' }); setVerifyingOtp(false); return; }
    setOtpVerified(true);
    toast({ title: '✅ Email Verified!' });
    // Sign out — we only needed OTP for verification, not login
    await supabase.auth.signOut();
    setVerifyingOtp(false);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.specialization) {
      toast({ title: 'Missing Fields', variant: 'destructive' }); return;
    }
    if (!otpVerified) { toast({ title: 'Please verify your email OTP first', variant: 'destructive' }); return; }
    if (!acceptedTerms) { toast({ title: 'Accept Terms & Conditions', variant: 'destructive' }); return; }

    setLoading(true);
    try {
      const timestamp = Date.now();
      const portfolioUrls: string[] = [];
      for (const [key, label] of [['profilePhoto', 'profile'], ['work1', 'work1'], ['work2', 'work2'], ['work3', 'work3']] as [keyof typeof documents, string][]) {
        const file = documents[key];
        if (file) { const ext = file.name.split('.').pop() || 'jpg'; const url = await uploadFile(file, `stylist-docs/${timestamp}-${label}.${ext}`); if (url) portfolioUrls.push(url); }
      }
      const availability: any = {};
      formData.availableDays.forEach(day => { availability[day] = { start: formData.openingTime, end: formData.closingTime }; });

      const { error } = await supabase.from('stylist_requests').insert({
        full_name: formData.name, email: formData.email, phone: formData.phone,
        specialization: formData.specialization, experience_years: parseInt(formData.experienceYears) || 0,
        bio: formData.bio, portfolio_urls: portfolioUrls.length > 0 ? portfolioUrls : null,
        availability, status: 'pending',
      });
      if (error) throw error;
      toast({ title: '🎉 Application Submitted!', description: 'We will review and contact you within 3–5 business days.' });
      navigate('/');
    } catch (error: any) {
      toast({ title: 'Submission Failed', description: error.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const toggleDay = (day: string) => setFormData({ ...formData, availableDays: formData.availableDays.includes(day) ? formData.availableDays.filter(d => d !== day) : [...formData.availableDays, day] });

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0514, #1a0826, #0f1020)' }}>
      <main className="pt-28 pb-20 px-4">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full"
              style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
              <Star className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-300">Join Our Expert Team</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4"
              style={{ background: 'linear-gradient(135deg, #c084fc, #f9a8d4, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Join Our Team
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">Become a part of Satguru Makeup Art's expert team! 💼✨</p>
          </div>

          {/* Steps */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {[1, 2, 3, 4].map(num => (
              <div key={num} className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all"
                  style={step >= num
                    ? { background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white', boxShadow: '0 0 16px rgba(124,58,237,0.4)' }
                    : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
                  {step > num ? <Check className="w-4 h-4" /> : num}
                </div>
                {num < 4 && <div className="w-12 h-0.5 transition-all" style={{ background: step > num ? '#7c3aed' : 'rgba(255,255,255,0.1)' }} />}
              </div>
            ))}
          </div>

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
              <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <h2 className="text-white font-bold text-xl flex items-center gap-2"><User className="w-5 h-5 text-violet-400" /> Personal Information</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name *', key: 'name', placeholder: 'Priya Sharma' },
                    { label: 'Email *', key: 'email', placeholder: 'priya@example.com', type: 'email' },
                    { label: 'Phone *', key: 'phone', placeholder: '+91 98765 43210' },
                    { label: 'Years of Experience', key: 'experienceYears', placeholder: '5', type: 'number' },
                  ].map(({ label, key, placeholder, type = 'text' }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-1.5 text-white/70">{label}</label>
                      <input type={type} value={(formData as any)[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full h-11 px-4 rounded-xl text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-white/70">Specialization *</label>
                  <select value={formData.specialization} onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', colorScheme: 'dark' }}>
                    <option value="">Select specialization</option>
                    {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-white/70">Bio</label>
                  <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about your expertise..." rows={3}
                    className="w-full px-4 py-3 rounded-xl text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
                </div>
                <button onClick={() => { if (!formData.name || !formData.email || !formData.phone || !formData.specialization) { toast({ title: 'Fill required fields', variant: 'destructive' }); return; } setStep(2); }}
                  className="w-full h-12 rounded-xl font-semibold text-white" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                  Continue to Availability →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Availability */}
          {step === 2 && (
            <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
              <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <h2 className="text-white font-bold text-xl flex items-center gap-2"><Calendar className="w-5 h-5 text-violet-400" /> Availability</h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3 text-white/70">Available Days</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_DAYS.map(day => (
                      <button key={day} onClick={() => toggleDay(day)} className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                        style={formData.availableDays.includes(day) ? { background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white' } : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[['Opening Time', 'openingTime'], ['Closing Time', 'closingTime']].map(([label, key]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-1.5 text-white/70">{label}</label>
                      <input type="time" value={(formData as any)[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', colorScheme: 'dark' }} />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 h-12 rounded-xl font-medium text-white/70 hover:text-white" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>← Back</button>
                  <button onClick={() => setStep(3)} className="flex-1 h-12 rounded-xl font-semibold text-white" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>Continue to Portfolio →</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Portfolio */}
          {step === 3 && (
            <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
              <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <h2 className="text-white font-bold text-xl flex items-center gap-2"><Upload className="w-5 h-5 text-violet-400" /> Portfolio</h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/70">Profile Photo</label>
                  <input type="file" accept="image/*" onChange={e => handleFileChange('profilePhoto', e.target.files?.[0] || null)}
                    className="w-full text-white/60 text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-violet-500/20 file:text-violet-300 hover:file:bg-violet-500/30" />
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-white flex items-center gap-2"><Star className="w-4 h-4 text-violet-400" />Work Portfolio (Optional)</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {(['work1', 'work2', 'work3'] as const).map((key, i) => (
                      <div key={key}>
                        <label className="block text-xs text-white/50 mb-1">Work {i + 1}</label>
                        <input type="file" accept="image/*" onChange={e => handleFileChange(key, e.target.files?.[0] || null)}
                          className="w-full text-white/60 text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-white/10 file:text-white/70 hover:file:bg-white/20" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 h-12 rounded-xl font-medium text-white/70 hover:text-white" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>← Back</button>
                  <button onClick={() => setStep(4)} className="flex-1 h-12 rounded-xl font-semibold text-white" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>Verify & Submit →</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: OTP + Terms */}
          {step === 4 && (
            <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
              <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <h2 className="text-white font-bold text-xl flex items-center gap-2"><Shield className="w-5 h-5 text-violet-400" /> Verify Email & Terms</h2>
              </div>
              <div className="p-6 space-y-6">
                {/* OTP */}
                <div className="rounded-2xl p-5" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)' }}>
                  <h4 className="font-semibold mb-1 text-white flex items-center gap-2"><Mail className="w-4 h-4 text-violet-400" />Email OTP Verification</h4>
                  <p className="text-white/50 text-xs mb-4">Code will be sent to <strong className="text-violet-300">{formData.email}</strong></p>
                  {!otpVerified ? (
                    !otpSent ? (
                      <button onClick={sendOtp} disabled={sendingOtp}
                        className="w-full h-11 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                        {sendingOtp ? <><Loader2 className="w-4 h-4 animate-spin" />Sending...</> : <><Mail className="w-4 h-4" />Send OTP</>}
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <input value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter OTP"
                          className="w-full h-12 px-4 rounded-xl text-white text-center text-xl font-bold tracking-widest placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
                        <div className="flex gap-2">
                          <button onClick={verifyOtp} disabled={verifyingOtp || otpCode.length < 4}
                            className="flex-1 h-10 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                            {verifyingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" />Verify</>}
                          </button>
                          <button onClick={sendOtp} disabled={sendingOtp} className="h-10 px-4 rounded-xl text-sm text-white/60 hover:text-white" style={{ background: 'rgba(255,255,255,0.06)' }}>Resend</button>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}>
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-300 font-semibold">Email Verified Successfully!</span>
                    </div>
                  )}
                </div>

                {/* Terms */}
                <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h4 className="font-semibold mb-3 text-white">Terms & Conditions</h4>
                  <div className="max-h-28 overflow-y-auto text-sm text-white/50 mb-4 space-y-1">
                    <p>• Provide accurate personal and professional information</p>
                    <p>• Maintain professional standards aligned with Satguru Makeup Art</p>
                    <p>• Adhere to assigned schedules and commitments</p>
                    <p>• Accept brand guidelines and service quality standards</p>
                    <p>• Commission structure will be communicated upon approval</p>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="w-5 h-5 accent-violet-500" />
                    <span className="text-sm text-white/80 font-medium">I agree to the Terms & Conditions *</span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(3)} className="flex-1 h-12 rounded-xl font-medium text-white/70 hover:text-white" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>← Back</button>
                  <button onClick={handleSubmit} disabled={loading || !acceptedTerms || !otpVerified}
                    className="flex-1 h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                    {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting...</> : <><Sparkles className="w-4 h-4" />Submit Application</>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
