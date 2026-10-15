import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Upload, Clock, Check, Loader2, Shield, Mail, CheckCircle, FileText, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const AVAILABLE_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function AssociateWithUs() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    shopName: '', ownerName: '', email: '', phone: '',
    address: '', area: '', city: '', state: '',
    availableDays: [] as string[], openingTime: '10:00', closingTime: '20:00',
    acceptedTerms: false,
  });
  const [documents, setDocuments] = useState({
    proofDocument: null as File | null, proofType: 'utility' as 'utility' | 'rent',
    insidePhoto: null as File | null, outsidePhoto: null as File | null, otherPhoto: null as File | null,
  });
  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

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
    const { error } = await supabase.auth.signInWithOtp({ email: formData.email, options: { shouldCreateUser: true } });
    if (error) { toast({ title: 'OTP Error', description: error.message, variant: 'destructive' }); setSendingOtp(false); return; }
    setOtpSent(true);
    toast({ title: '📧 OTP Sent!', description: `Check ${formData.email}` });
    setSendingOtp(false);
  };

  const verifyOtp = async () => {
    if (otpCode.length < 4) { toast({ title: 'Enter OTP', variant: 'destructive' }); return; }
    setVerifyingOtp(true);
    const { error } = await supabase.auth.verifyOtp({ email: formData.email, token: otpCode, type: 'email' });
    if (error) { toast({ title: 'Invalid OTP', variant: 'destructive' }); setVerifyingOtp(false); return; }
    setOtpVerified(true);
    toast({ title: '✅ Email Verified!' });
    await supabase.auth.signOut();
    setVerifyingOtp(false);
  };

  const handleFileChange = (field: keyof typeof documents, file: File | null) =>
    setDocuments({ ...documents, [field]: file });

  const submitApplication = async () => {
    if (!formData.shopName || !formData.ownerName || !formData.email || !formData.phone || !formData.address) {
      toast({ title: 'Missing Fields', description: 'Fill all required fields', variant: 'destructive' }); return;
    }
    if (!otpVerified) { toast({ title: 'Verify email OTP first', variant: 'destructive' }); return; }
    if (!formData.acceptedTerms) { toast({ title: 'Accept Terms & Conditions', variant: 'destructive' }); return; }

    setLoading(true);
    try {
      const timestamp = Date.now();
      let proofDocUrl = '';
      const photoUrls: Record<string, string> = {};
      if (documents.proofDocument) {
        const ext = documents.proofDocument.name.split('.').pop() || 'pdf';
        proofDocUrl = await uploadFile(documents.proofDocument, `associate-docs/${timestamp}-${documents.proofType}.${ext}`);
      }
      if (documents.insidePhoto) photoUrls.insidePhoto = await uploadFile(documents.insidePhoto, `associate-photos/${timestamp}-inside.jpg`);
      if (documents.outsidePhoto) photoUrls.outsidePhoto = await uploadFile(documents.outsidePhoto, `associate-photos/${timestamp}-outside.jpg`);
      if (documents.otherPhoto) photoUrls.otherPhoto = await uploadFile(documents.otherPhoto, `associate-photos/${timestamp}-other.jpg`);

      const { error } = await supabase.from('associate_requests').insert({
        shop_name: formData.shopName, owner_name: formData.ownerName, email: formData.email, phone: formData.phone,
        address: formData.address, area: formData.area, city: formData.city, state: formData.state,
        available_days: formData.availableDays, opening_time: formData.openingTime || null, closing_time: formData.closingTime || null,
        proof_document_url: proofDocUrl || null, proof_type: documents.proofType,
        photos: Object.keys(photoUrls).length > 0 ? photoUrls : null, status: 'pending',
      });
      if (error) throw error;
      toast({ title: '🎉 Application Submitted!', description: 'We will review and contact you within 2–3 business days.' });
      navigate('/');
    } catch (error: any) {
      toast({ title: 'Submission Failed', description: error.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const toggleDay = (day: string) => setFormData({
    ...formData,
    availableDays: formData.availableDays.includes(day)
      ? formData.availableDays.filter(d => d !== day)
      : [...formData.availableDays, day],
  });

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0514, #1a0826, #0f1020)' }}>
      <main className="flex-1 pt-28 pb-20 px-4">
        <div className="container-custom max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full"
              style={{ background: 'rgba(190,24,93,0.15)', border: '1px solid rgba(190,24,93,0.3)' }}>
              <Store className="w-4 h-4 text-pink-400" />
              <span className="text-sm font-medium text-pink-300">Partnership Program</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4"
              style={{ background: 'linear-gradient(135deg, #f9a8d4, #fbbf24, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Associate With Us
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Join the Satguru Makeup Art family and grow your beauty business with us! 💼✨
            </p>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {[1, 2, 3, 4].map(num => (
              <div key={num} className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all"
                  style={step >= num
                    ? { background: 'linear-gradient(135deg, #be185d, #ec4899)', color: 'white', boxShadow: '0 0 16px rgba(190,24,93,0.4)' }
                    : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
                  {step > num ? <Check className="w-4 h-4" /> : num}
                </div>
                {num < 4 && <div className="w-12 h-0.5 transition-all" style={{ background: step > num ? '#be185d' : 'rgba(255,255,255,0.1)' }} />}
              </div>
            ))}
          </div>

          {/* Step 1: Shop Info */}
          {step === 1 && (
            <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
              <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <h2 className="text-white font-bold text-xl flex items-center gap-2">
                  <Store className="w-5 h-5 text-pink-400" /> Shop Information
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Shop Name *', key: 'shopName', placeholder: 'Beautiful Beauty Salon' },
                    { label: 'Owner Name *', key: 'ownerName', placeholder: 'Priya Sharma' },
                    { label: 'Email *', key: 'email', placeholder: 'shop@example.com', type: 'email' },
                    { label: 'Phone *', key: 'phone', placeholder: '+91 98765 43210' },
                  ].map(({ label, key, placeholder, type = 'text' }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-1.5 text-white/70">{label}</label>
                      <input type={type} value={(formData as any)[key]}
                        onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full h-11 px-4 rounded-xl text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-white/70">Shop Address *</label>
                  <textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Beauty Street, Main Market" rows={2}
                    className="w-full px-4 py-3 rounded-xl text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Area', key: 'area', placeholder: 'Central Area' },
                    { label: 'City', key: 'city', placeholder: 'Sirsa' },
                    { label: 'State', key: 'state', placeholder: 'Rajasthan' },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-1.5 text-white/70">{label}</label>
                      <input value={(formData as any)[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full h-11 px-4 rounded-xl text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    if (!formData.shopName || !formData.ownerName || !formData.email || !formData.phone || !formData.address) {
                      toast({ title: 'Missing Fields', description: 'Please fill all required fields', variant: 'destructive' }); return;
                    }
                    setStep(2);
                  }}
                  className="w-full h-12 rounded-xl font-semibold text-white mt-2"
                  style={{ background: 'linear-gradient(135deg, #be185d, #ec4899)' }}>
                  Continue to Working Hours →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Working Hours */}
          {step === 2 && (
            <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
              <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <h2 className="text-white font-bold text-xl flex items-center gap-2">
                  <Clock className="w-5 h-5 text-pink-400" /> Working Hours & Availability
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3 text-white/70">Available Days</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_DAYS.map(day => (
                      <button key={day} onClick={() => toggleDay(day)}
                        className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                        style={formData.availableDays.includes(day)
                          ? { background: 'linear-gradient(135deg, #be185d, #ec4899)', color: 'white' }
                          : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
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
                        className="w-full h-11 px-4 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', colorScheme: 'dark' }} />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 h-12 rounded-xl font-medium text-white/70 transition-all hover:text-white"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>← Back</button>
                  <button onClick={() => setStep(3)} className="flex-1 h-12 rounded-xl font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #be185d, #ec4899)' }}>Continue to Documents →</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {step === 3 && (
            <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
              <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <h2 className="text-white font-bold text-xl flex items-center gap-2">
                  <FileText className="w-5 h-5 text-pink-400" /> Documents (Optional)
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3 text-white/70">Shop Proof Document</label>
                  <div className="flex gap-3 mb-3">
                    {(['utility', 'rent'] as const).map(type => (
                      <button key={type} onClick={() => setDocuments({ ...documents, proofType: type })}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                        style={documents.proofType === type
                          ? { background: 'linear-gradient(135deg, #be185d, #ec4899)', color: 'white' }
                          : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {type === 'utility' ? '💡 Utility Bill' : '📋 Rent Agreement'}
                      </button>
                    ))}
                  </div>
                  <input type="file" accept="image/*,.pdf"
                    onChange={e => handleFileChange('proofDocument', e.target.files?.[0] || null)}
                    className="w-full text-white/60 text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-500/20 file:text-pink-300 hover:file:bg-pink-500/30" />
                  <p className="text-white/30 text-xs mt-1">PDF or Image accepted (optional)</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-white flex items-center gap-2"><Camera className="w-4 h-4 text-pink-400" />Shop Photos (Optional)</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {([['insidePhoto', 'Inside View'], ['outsidePhoto', 'Outside View'], ['otherPhoto', 'Other']] as const).map(([field, label]) => (
                      <div key={field}>
                        <label className="block text-xs text-white/50 mb-1">{label}</label>
                        <input type="file" accept="image/*"
                          onChange={e => handleFileChange(field, e.target.files?.[0] || null)}
                          className="w-full text-white/60 text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-white/10 file:text-white/70 hover:file:bg-white/20" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 h-12 rounded-xl font-medium text-white/70 transition-all hover:text-white"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>← Back</button>
                  <button onClick={() => setStep(4)} className="flex-1 h-12 rounded-xl font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #be185d, #ec4899)' }}>Verify & Submit →</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: OTP Verification + Terms */}
          {step === 4 && (
            <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
              <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <h2 className="text-white font-bold text-xl flex items-center gap-2">
                  <Shield className="w-5 h-5 text-pink-400" /> Verify Email & Submit
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {/* OTP Section */}
                <div className="rounded-2xl p-5" style={{ background: 'rgba(190,24,93,0.1)', border: '1px solid rgba(190,24,93,0.25)' }}>
                  <h4 className="font-semibold mb-1 text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-pink-400" />Email OTP Verification
                  </h4>
                  <p className="text-white/50 text-xs mb-4">OTP will be sent to <strong className="text-pink-300">{formData.email}</strong></p>
                  {!otpVerified ? (
                    !otpSent ? (
                      <button onClick={sendOtp} disabled={sendingOtp}
                        className="w-full h-11 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #be185d, #ec4899)' }}>
                        {sendingOtp ? <><Loader2 className="w-4 h-4 animate-spin" />Sending...</> : <><Mail className="w-4 h-4" />Send OTP</>}
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <input value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="Enter OTP"
                          className="w-full h-12 px-4 rounded-xl text-white text-center text-xl font-bold tracking-widest placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
                        <div className="flex gap-2">
                          <button onClick={verifyOtp} disabled={verifyingOtp || otpCode.length < 4}
                            className="flex-1 h-10 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #be185d, #ec4899)' }}>
                            {verifyingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" />Verify</>}
                          </button>
                          <button onClick={sendOtp} disabled={sendingOtp}
                            className="h-10 px-4 rounded-xl text-sm text-white/60 hover:text-white"
                            style={{ background: 'rgba(255,255,255,0.06)' }}>Resend</button>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}>
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-300 font-semibold">Email Verified!</span>
                    </div>
                  )}
                </div>

                {/* Terms */}
                <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h4 className="font-semibold mb-3 text-white">Terms & Conditions</h4>
                  <div className="max-h-28 overflow-y-auto text-sm text-white/50 mb-4 space-y-1">
                    <p>• Provide accurate and truthful information about your shop</p>
                    <p>• Maintain professional standards aligned with Satguru Makeup Art</p>
                    <p>• Share a percentage of earnings as per partnership agreement</p>
                    <p>• Allow periodic quality audits of services provided</p>
                    <p>• Adhere to brand guidelines and service quality standards</p>
                    <p>• Accept decisions made by Satguru Makeup Art management</p>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.acceptedTerms}
                      onChange={e => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                      className="w-5 h-5 accent-pink-500" />
                    <span className="text-sm text-white/80 font-medium">I agree to Terms & Conditions *</span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(3)} className="flex-1 h-12 rounded-xl font-medium text-white/70 hover:text-white"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>← Back</button>
                  <button onClick={submitApplication} disabled={loading || !formData.acceptedTerms || !otpVerified}
                    className="flex-1 h-12 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #be185d, #ec4899)' }}>
                    {loading
                      ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting...</>
                      : <><Check className="w-5 h-5" />Submit Application</>}
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
