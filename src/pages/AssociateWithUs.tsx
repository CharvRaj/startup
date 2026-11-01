import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Store, Upload, Clock, Check, Loader2, Shield, Mail, CheckCircle2,
  FileText, Camera, Sparkles, ArrowRight, ArrowLeft, LogIn, UserPlus,
  HelpCircle, AlertCircle, Building2, MapPin, Phone, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';

const AVAILABLE_DAYS = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
];

export function AssociateWithUs() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();

  // Onboarding confirmation gate
  const [hasConfirmedIntent, setHasConfirmedIntent] = useState(false);
  const [existingApp, setExistingApp] = useState<any>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  // Form step
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: user?.username || '',
    email: user?.email || '',
    phone: '',
    address: '',
    area: '',
    city: '',
    state: '',
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    openingTime: '10:00',
    closingTime: '20:00',
    acceptedTerms: false,
  });

  // Uploaded documents state
  const [documents, setDocuments] = useState({
    proofDocument: null as File | null,
    proofType: 'utility' as 'utility' | 'rent' | 'aadhaar' | 'gst',
    insidePhoto: null as File | null,
    outsidePhoto: null as File | null,
    otherPhoto: null as File | null,
  });

  // Check if user already submitted an application
  useEffect(() => {
    const checkUserApplication = async () => {
      if (!user) {
        setCheckingExisting(false);
        return;
      }

      try {
        // 1. Check remote Supabase
        const { data } = await supabase
          .from('associate_requests')
          .select('*')
          .or(`email.eq.${user.email},phone.eq.${user.email}`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          setExistingApp(data);
        } else {
          // 2. Check local sync
          const localData = localStorage.getItem('satguru_my_partner_applications');
          if (localData) {
            const parsed = JSON.parse(localData);
            const found = parsed.find((a: any) => a.email === user.email || a.userId === user.id);
            if (found) setExistingApp(found);
          }
        }
      } catch (e) {
        console.warn('Error checking existing application:', e);
      } finally {
        setCheckingExisting(false);
      }
    };

    checkUserApplication();
  }, [user]);

  // Handle Intent Confirmation
  const handleConfirmIntent = () => {
    setHasConfirmedIntent(true);
    toast({
      title: "Good to see you! Let's get your journey started. ✨",
      description: "Welcome to BlindGlow by Satguru partner network. Please fill in your studio details below.",
      className: "bg-emerald-50 border-emerald-200 text-emerald-950",
    });
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const { error } = await supabase.storage
        .from('gallery')
        .upload(path, arrayBuffer, { contentType: file.type, upsert: true });

      if (error) {
        console.warn('Upload skipped, creating local object url fallback:', error.message);
        return URL.createObjectURL(file);
      }
      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path);
      return publicUrl;
    } catch {
      return URL.createObjectURL(file);
    }
  };

  const handleFileChange = (field: keyof typeof documents, file: File | null) => {
    setDocuments(prev => ({ ...prev, [field]: file }));
  };

  const toggleDay = (dayKey: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(dayKey)
        ? prev.availableDays.filter(d => d !== dayKey)
        : [...prev.availableDays, dayKey],
    }));
  };

  const submitApplication = async () => {
    if (!formData.shopName || !formData.ownerName || !formData.email || !formData.phone || !formData.address) {
      toast({ title: 'Missing Information', description: 'Please complete all required fields.', variant: 'destructive' });
      return;
    }
    if (!formData.acceptedTerms) {
      toast({ title: 'Terms Required', description: 'Please accept the BlindGlow Partner Terms & Conditions.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const timestamp = Date.now();
      let proofDocUrl = '';
      const photoUrls: Record<string, string> = {};

      if (documents.proofDocument) {
        const ext = documents.proofDocument.name.split('.').pop() || 'pdf';
        proofDocUrl = await uploadFile(documents.proofDocument, `associate-docs/${timestamp}-${documents.proofType}.${ext}`);
      }
      if (documents.insidePhoto) {
        photoUrls.insidePhoto = await uploadFile(documents.insidePhoto, `associate-photos/${timestamp}-inside.jpg`);
      }
      if (documents.outsidePhoto) {
        photoUrls.outsidePhoto = await uploadFile(documents.outsidePhoto, `associate-photos/${timestamp}-outside.jpg`);
      }
      if (documents.otherPhoto) {
        photoUrls.otherPhoto = await uploadFile(documents.otherPhoto, `associate-photos/${timestamp}-other.jpg`);
      }

      const insertPayload = {
        shop_name: formData.shopName,
        owner_name: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        area: formData.area || 'Main City',
        city: formData.city || 'Delhi / NCR',
        state: formData.state || 'India',
        available_days: formData.availableDays,
        opening_time: formData.openingTime || '10:00',
        closing_time: formData.closingTime || '20:00',
        proof_document_url: proofDocUrl || '/images/larana-spa-towels.jpg',
        proof_type: documents.proofType,
        photos: Object.keys(photoUrls).length > 0 ? photoUrls : { insidePhoto: '/images/larana-promo-facial.jpg' },
        status: 'pending',
        user_id: user?.id,
        created_at: new Date().toISOString(),
      };

      // 1. Try remote insert into Supabase (let Postgres assign valid UUID automatically)
      let finalId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `assoc-${Date.now()}`;
      try {
        const { data, error } = await supabase.from('associate_requests').insert(insertPayload).select('id').single();
        if (error) {
          console.warn('Remote associate insert warning:', error.message);
        } else if (data?.id) {
          finalId = data.id;
        }
      } catch (err: any) {
        console.warn('Remote associate insert warning:', err?.message);
      }

      const newRecord = {
        id: finalId,
        ...insertPayload,
      };

      // 2. Persist to local partner applications list for instant profile tracking
      const localApps = JSON.parse(localStorage.getItem('satguru_my_partner_applications') || '[]');
      localApps.unshift({
        ...newRecord,
        type: 'associate',
        submittedAt: new Date().toISOString(),
        userId: user?.id,
      });
      localStorage.setItem('satguru_my_partner_applications', JSON.stringify(localApps));
      window.dispatchEvent(new CustomEvent('satguru:partner_requests_updated'));

      toast({
        title: 'Application Submitted Successfully! 🎉',
        description: 'Your application is now under review. You can track live updates in your Profile.',
      });

      // Navigate to user profile where the new tracking section will immediately appear
      navigate('/profile');
    } catch (error: any) {
      toast({ title: 'Submission Failed', description: error.message || 'Please try again', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // 1. Loading check
  if (checkingExisting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6EE]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#C83E68]" />
          <p className="text-sm font-medium text-[#133826]">Loading partner portal...</p>
        </div>
      </div>
    );
  }

  // 2. If user is NOT logged in: Show luxury sign-in / signup gate
  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 bg-[#FAF6EE] text-[#133826] relative overflow-hidden">
        {/* Soft background glow orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-amber-200/35 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-rose-200/30 blur-3xl pointer-events-none" />

        <div className="max-w-xl mx-auto relative z-10 text-center mt-6 sm:mt-12">
          {/* Brand Icon */}
          <div className="w-16 h-16 rounded-full mx-auto mb-6 bg-gradient-to-tr from-amber-100 to-rose-100 border border-amber-300/60 shadow-md flex items-center justify-center">
            <Store className="w-8 h-8 text-[#C83E68]" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-amber-300/50 shadow-xs mb-4">
            <Sparkles className="w-4 h-4 text-[#C83E68]" />
            <span className="text-xs font-bold tracking-wider uppercase text-[#133826]">
              BlindGlow Partner Network
            </span>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-bold font-serif text-[#133826] mb-3 leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Associate With BlindGlow
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-8 max-w-md mx-auto">
            Expand your salon or beauty studio business with verified luxury bookings, marketing reach, and guaranteed doorstep clientele across your city.
          </p>

          {/* Sign In Required Box */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-[#E8D9C5] shadow-xl text-left space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center flex-shrink-0 text-[#C83E68]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#133826]">
                  Account Sign-In Required
                </h3>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  To securely attach your studio documentation, KYC verification, live booking pipeline, and payouts to your verified profile, please sign in or register before starting the application.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                onClick={() => navigate('/login?redirect=/associate')}
                className="h-12 rounded-2xl bg-[#133826] hover:bg-[#0c2419] text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In to Apply
              </Button>

              <Button
                onClick={() => navigate('/signup?redirect=/associate')}
                className="h-12 rounded-2xl bg-[#C83E68] hover:bg-[#a63054] text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Create Account
              </Button>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Dermat & ISO-Certified Partner Standards
              </span>
              <Link to="/contact" className="text-[#C83E68] hover:underline font-medium">
                Need Help?
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. If user ALREADY submitted an application: Let them track it directly
  if (existingApp && !hasConfirmedIntent) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 bg-[#FAF6EE] text-[#133826]">
        <div className="max-w-xl mx-auto text-center mt-8">
          <div className="w-16 h-16 rounded-full mx-auto mb-5 bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-700 shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#133826] mb-2">
            Application Already Active
          </h2>
          <p className="text-sm text-stone-600 mb-6">
            We already have your associate application for <strong className="text-[#133826]">{existingApp.shop_name || existingApp.shopName}</strong> under review.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-[#E8D9C5] shadow-lg text-left mb-6 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-500">Status:</span>
              <span className="px-3 py-1 rounded-full font-bold uppercase text-[11px] bg-amber-50 text-amber-800 border border-amber-200">
                {existingApp.status?.replace('_', ' ') || 'Pending'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-500">Submitted Email:</span>
              <span className="font-semibold text-stone-800">{existingApp.email}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-500">City:</span>
              <span className="font-semibold text-stone-800">{existingApp.city || 'Registered Studio'}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate('/profile')}
              className="h-12 px-6 rounded-2xl bg-[#133826] text-white hover:bg-[#0d261a] font-semibold text-sm shadow-md"
            >
              Track Status in Profile →
            </Button>
            <Button
              variant="outline"
              onClick={() => setHasConfirmedIntent(true)}
              className="h-12 px-6 rounded-2xl border-stone-300 text-stone-700 hover:bg-stone-50 text-sm font-semibold"
            >
              Submit Another Location
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Intent Confirmation Gate: "Are you really sure you want to fill this form?"
  if (!hasConfirmedIntent) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 bg-[#FAF6EE] text-[#133826] relative overflow-hidden flex items-center justify-center">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-[32px] p-7 sm:p-9 border border-[#E8D9C5] shadow-2xl text-center relative z-10">
          <div className="w-16 h-16 rounded-full mx-auto mb-5 bg-gradient-to-tr from-amber-100 via-rose-100 to-amber-200 border border-amber-300/70 flex items-center justify-center shadow-md">
            <Store className="w-8 h-8 text-[#C83E68]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#C83E68] text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>BlindGlow Partner Verification</span>
          </div>

          <h2
            className="text-2xl sm:text-3xl font-serif font-bold text-[#133826] mb-3 leading-snug"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Are you sure you want to fill the Associate Partner Form?
          </h2>

          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-6">
            You will be asked to provide your studio details, opening hours, and KYC verification documents (Aadhaar/Rent Proof & Studio Photos) for official onboarding.
          </p>

          <div className="space-y-3">
            <Button
              onClick={handleConfirmIntent}
              className="w-full h-12 rounded-2xl bg-[#C83E68] hover:bg-[#a63054] text-white font-bold text-sm shadow-lg shadow-rose-900/15 transition-all transform hover:-translate-y-0.5"
            >
              Yes, I Want to Fill the Form ✨
            </Button>

            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="w-full h-10 rounded-2xl text-stone-500 hover:text-stone-900 text-xs font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 5. The Redesigned Luxury Multi-Step Form
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-[#FAF6EE] text-[#133826] relative overflow-hidden">
      {/* Background radial orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-amber-100/50 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-rose-100/50 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-amber-300/60 shadow-xs mb-3 text-xs font-bold text-[#133826]">
            <Store className="w-4 h-4 text-[#C83E68]" />
            <span>BlindGlow by Satguru • Partner Studio Application</span>
          </div>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#133826] mb-2 tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Associate With Us
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto">
            Join the verified luxury beauty studio network. Complete all steps accurately for priority review within 2 business days.
          </p>
        </div>

        {/* Stepper Header */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-8 select-none">
          {[
            { num: 1, label: 'Studio Info' },
            { num: 2, label: 'Timings' },
            { num: 3, label: 'KYC & Photos' },
            { num: 4, label: 'Review & Submit' },
          ].map(({ num, label }) => (
            <div key={num} className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all shadow-xs ${
                  step === num
                    ? 'bg-[#C83E68] text-white ring-4 ring-rose-100'
                    : step > num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-stone-400 border border-stone-200'
                }`}
              >
                {step > num ? <Check className="w-4 h-4 stroke-[3]" /> : num}
              </div>
              <span className={`text-xs font-semibold hidden md:inline ${step === num ? 'text-[#133826]' : 'text-stone-400'}`}>
                {label}
              </span>
              {num < 4 && <div className={`w-6 sm:w-10 h-0.5 ${step > num ? 'bg-emerald-500' : 'bg-stone-200'}`} />}
            </div>
          ))}
        </div>

        {/* Main Card Container */}
        <div className="bg-white/95 backdrop-blur-md rounded-[28px] sm:rounded-[36px] border border-[#E8D9C5] shadow-xl p-6 sm:p-10">

          {/* ================= STEP 1: STUDIO DETAILS ================= */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <h2 className="text-xl font-serif font-bold text-[#133826] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#C83E68]" />
                  Studio & Owner Information
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Tell us about your beauty salon and primary point of contact.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Studio / Salon Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shopName}
                    onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                    placeholder="e.g. Bella Glow Luxury Studio"
                    className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C83E68]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Owner / Manager Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C83E68]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="studio@example.com"
                    className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C83E68]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Contact Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C83E68]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Complete Studio Address *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Shop #12, Ground Floor, Gold Crest Complex..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C83E68]/40 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Area / Locality
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={e => setFormData({ ...formData, area: e.target.value })}
                    placeholder="e.g. Model Town"
                    className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C83E68]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Sirsa / Jaipur"
                    className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C83E68]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Rajasthan"
                    className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C83E68]/40"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  onClick={() => {
                    if (!formData.shopName || !formData.ownerName || !formData.email || !formData.phone || !formData.address) {
                      toast({ title: 'Missing Information', description: 'Please fill all required fields.', variant: 'destructive' });
                      return;
                    }
                    setStep(2);
                  }}
                  className="h-12 px-8 rounded-2xl bg-[#C83E68] hover:bg-[#a63054] text-white font-bold text-sm shadow-md"
                >
                  Continue to Timings →
                </Button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: OPERATING HOURS ================= */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <h2 className="text-xl font-serif font-bold text-[#133826] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#C83E68]" />
                  Operating Hours & Availability
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Select your studio's operational days and slot hours.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Working Days (Click to toggle)
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {AVAILABLE_DAYS.map(day => {
                    const isSelected = formData.availableDays.includes(day.key);
                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => toggleDay(day.key)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-[#133826] text-white shadow-sm'
                            : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Opening Time
                  </label>
                  <input
                    type="time"
                    value={formData.openingTime}
                    onChange={e => setFormData({ ...formData, openingTime: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C83E68]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Closing Time
                  </label>
                  <input
                    type="time"
                    value={formData.closingTime}
                    onChange={e => setFormData({ ...formData, closingTime: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C83E68]/40"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="h-11 px-6 rounded-2xl border-stone-200 text-stone-700 text-xs font-semibold"
                >
                  ← Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="h-12 px-8 rounded-2xl bg-[#C83E68] hover:bg-[#a63054] text-white font-bold text-sm shadow-md"
                >
                  Continue to KYC & Photos →
                </Button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: KYC & PHOTOS ================= */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <h2 className="text-xl font-serif font-bold text-[#133826] flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#C83E68]" />
                  KYC Verification & Studio Photography
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Upload verification documents to complete partner compliance.
                </p>
              </div>

              {/* Proof Document Selection */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-[#133826]">Select KYC Document Type</span>
                    <p className="text-[11px] text-stone-500">Aadhaar, Utility Bill, Rent Agreement, or GST Certificate</p>
                  </div>
                  <select
                    value={documents.proofType}
                    onChange={e => setDocuments({ ...documents, proofType: e.target.value as any })}
                    className="h-9 px-3 rounded-lg border border-stone-200 bg-white text-xs font-semibold text-stone-800"
                  >
                    <option value="utility">Electricity / Utility Bill</option>
                    <option value="rent">Rent Agreement</option>
                    <option value="aadhaar">Owner Aadhaar / Government ID</option>
                    <option value="gst">GST Registration</option>
                  </select>
                </div>

                <div className="border-2 border-dashed border-stone-300 rounded-xl p-4 text-center hover:bg-white transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={e => handleFileChange('proofDocument', e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <FileText className="w-6 h-6 mx-auto text-[#C83E68] mb-1.5" />
                  <span className="text-xs font-bold text-stone-800 block">
                    {documents.proofDocument ? documents.proofDocument.name : 'Click to Upload KYC Document'}
                  </span>
                  <span className="text-[10px] text-stone-500">PDF, JPG, PNG up to 10MB</span>
                </div>
              </div>

              {/* Studio Photos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-stone-300 rounded-2xl p-4 text-center hover:bg-stone-50 transition-colors relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleFileChange('insidePhoto', e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Camera className="w-6 h-6 mx-auto text-amber-600 mb-1.5" />
                  <span className="text-xs font-bold text-stone-800 block">Inside Studio Photo</span>
                  <span className="text-[10px] text-stone-500">
                    {documents.insidePhoto ? documents.insidePhoto.name : 'Shows styling chairs / interior'}
                  </span>
                </div>

                <div className="border-2 border-dashed border-stone-300 rounded-2xl p-4 text-center hover:bg-stone-50 transition-colors relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleFileChange('outsidePhoto', e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Camera className="w-6 h-6 mx-auto text-amber-600 mb-1.5" />
                  <span className="text-xs font-bold text-stone-800 block">Exterior / Signboard Photo</span>
                  <span className="text-[10px] text-stone-500">
                    {documents.outsidePhoto ? documents.outsidePhoto.name : 'Front entrance & nameplate'}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="h-11 px-6 rounded-2xl border-stone-200 text-stone-700 text-xs font-semibold"
                >
                  ← Back
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  className="h-12 px-8 rounded-2xl bg-[#C83E68] hover:bg-[#a63054] text-white font-bold text-sm shadow-md"
                >
                  Review Application →
                </Button>
              </div>
            </div>
          )}

          {/* ================= STEP 4: REVIEW & SUBMIT ================= */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <h2 className="text-xl font-serif font-bold text-[#133826] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Review & Final Submission
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Please confirm your details before submitting for admin credential provisioning.
                </p>
              </div>

              <div className="rounded-2xl bg-stone-50 p-5 space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-stone-200/60">
                  <span className="text-stone-500">Studio Name:</span>
                  <span className="font-bold text-[#133826]">{formData.shopName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200/60">
                  <span className="text-stone-500">Owner / Representative:</span>
                  <span className="font-bold text-[#133826]">{formData.ownerName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200/60">
                  <span className="text-stone-500">Email & Contact:</span>
                  <span className="font-semibold text-stone-800">{formData.email} • {formData.phone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200/60">
                  <span className="text-stone-500">Address:</span>
                  <span className="font-medium text-stone-800 text-right max-w-xs">{formData.address}, {formData.city}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-500">KYC Status:</span>
                  <span className="font-bold text-emerald-700">
                    {documents.proofDocument ? `${documents.proofType.toUpperCase()} attached` : 'Pending physical verify'}
                  </span>
                </div>
              </div>

              {/* Terms Acceptance */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.acceptedTerms}
                  onChange={e => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-[#C83E68] focus:ring-[#C83E68]"
                />
                <span className="text-xs text-stone-600 leading-relaxed">
                  I confirm that all the information provided is accurate. I agree to uphold BlindGlow luxury quality, sanitized kits, and client safety standards.
                </span>
              </label>

              <div className="pt-4 flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setStep(3)}
                  disabled={loading}
                  className="h-11 px-6 rounded-2xl border-stone-200 text-stone-700 text-xs font-semibold"
                >
                  ← Back
                </Button>
                <Button
                  onClick={submitApplication}
                  disabled={loading}
                  className="h-12 px-9 rounded-2xl bg-[#C83E68] hover:bg-[#a63054] text-white font-bold text-sm shadow-lg shadow-rose-900/20"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </span>
                  ) : (
                    'Submit Application Now ✨'
                  )}
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
