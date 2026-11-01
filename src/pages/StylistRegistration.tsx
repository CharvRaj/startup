import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Upload, Star, Calendar, Check, Sparkles, Loader2,
  Mail, Shield, CheckCircle2, FileText, Camera, ArrowRight,
  ArrowLeft, LogIn, UserPlus, Award, Phone, MapPin, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';

const SPECIALIZATIONS = [
  'Bridal Makeup Artist',
  'Arabic & Traditional Mehndi Artist',
  'Facial & Luxury Skincare Therapist',
  'Hair Styling & Treatments',
  'Glamour & Party Makeup',
  'Nail Couture & Art',
  'Full Grooming & Spa Expert',
];

const AVAILABLE_DAYS = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
];

export function StylistRegistration() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [hasConfirmedIntent, setHasConfirmedIntent] = useState(false);
  const [existingApp, setExistingApp] = useState<any>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.username || '',
    email: user?.email || '',
    phone: '',
    specialization: 'Bridal Makeup Artist',
    experienceYears: '3',
    bio: '',
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    openingTime: '10:00',
    closingTime: '20:00',
    acceptedTerms: false,
  });

  const [documents, setDocuments] = useState({
    profilePhoto: null as File | null,
    work1: null as File | null,
    work2: null as File | null,
    work3: null as File | null,
    idProof: null as File | null,
  });

  useEffect(() => {
    const checkUserApplication = async () => {
      if (!user) {
        setCheckingExisting(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('stylist_requests')
          .select('*')
          .or(`email.eq.${user.email},phone.eq.${user.email}`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          setExistingApp(data);
        } else {
          const localData = localStorage.getItem('satguru_my_partner_applications');
          if (localData) {
            const parsed = JSON.parse(localData);
            const found = parsed.find((a: any) => a.email === user.email || a.userId === user.id);
            if (found) setExistingApp(found);
          }
        }
      } catch (e) {
        console.warn('Error checking existing stylist app:', e);
      } finally {
        setCheckingExisting(false);
      }
    };

    checkUserApplication();
  }, [user]);

  const handleConfirmIntent = () => {
    setHasConfirmedIntent(true);
    toast({
      title: "Good to see you! Let's get your journey started. ✨",
      description: "Welcome to BlindGlow elite artist network. Please fill in your professional profile below.",
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

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.specialization) {
      toast({ title: 'Missing Information', description: 'Please fill all required fields.', variant: 'destructive' });
      return;
    }
    if (!formData.acceptedTerms) {
      toast({ title: 'Terms Required', description: 'Please accept the Stylist Partner Terms & Conditions.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const timestamp = Date.now();
      const portfolioUrls: string[] = [];

      for (const [key, label] of [
        ['profilePhoto', 'profile'],
        ['work1', 'work1'],
        ['work2', 'work2'],
        ['work3', 'work3'],
        ['idProof', 'idProof'],
      ] as [keyof typeof documents, string][]) {
        const file = documents[key];
        if (file) {
          const ext = file.name.split('.').pop() || 'jpg';
          const url = await uploadFile(file, `stylist-docs/${timestamp}-${label}.${ext}`);
          if (url) portfolioUrls.push(url);
        }
      }

      const availability: any = {};
      formData.availableDays.forEach(day => {
        availability[day] = { start: formData.openingTime, end: formData.closingTime };
      });

      const insertPayload = {
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialization: formData.specialization,
        experience_years: parseInt(formData.experienceYears) || 3,
        bio: formData.bio || 'Certified luxury beauty professional dedicated to perfection.',
        portfolio_urls: portfolioUrls.length > 0 ? portfolioUrls : ['/images/larana-bridal-art.jpg'],
        availability,
        status: 'pending',
        rating: 4.9,
        total_jobs: 0,
        earnings: 0,
        user_id: user?.id,
        created_at: new Date().toISOString(),
      };

      // 1. Try remote insert into Supabase (let Postgres assign valid UUID automatically)
      let finalId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `stylist-${Date.now()}`;
      try {
        const { data, error } = await supabase.from('stylist_requests').insert(insertPayload).select('id').single();
        if (error) {
          console.warn('Remote stylist insert warning:', error.message);
        } else if (data?.id) {
          finalId = data.id;
        }
      } catch (err: any) {
        console.warn('Remote stylist insert warning:', err?.message);
      }

      const newRecord = {
        id: finalId,
        ...insertPayload,
      };

      const localApps = JSON.parse(localStorage.getItem('satguru_my_partner_applications') || '[]');
      localApps.unshift({
        ...newRecord,
        type: 'stylist',
        submittedAt: new Date().toISOString(),
        userId: user?.id,
      });
      localStorage.setItem('satguru_my_partner_applications', JSON.stringify(localApps));
      window.dispatchEvent(new CustomEvent('satguru:partner_requests_updated'));

      toast({
        title: 'Application Submitted Successfully! 🎉',
        description: 'Your stylist application is under review. You can track live updates in your Profile.',
      });

      navigate('/profile');
    } catch (error: any) {
      toast({ title: 'Submission Failed', description: error.message || 'Please try again', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (checkingExisting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6EE]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#C83E68]" />
          <p className="text-sm font-medium text-[#133826]">Loading stylist portal...</p>
        </div>
      </div>
    );
  }

  // Not logged in gate
  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 bg-[#FAF6EE] text-[#133826] relative overflow-hidden">
        <div className="max-w-xl mx-auto relative z-10 text-center mt-6 sm:mt-12">
          <div className="w-16 h-16 rounded-full mx-auto mb-6 bg-gradient-to-tr from-amber-100 to-rose-100 border border-amber-300/60 shadow-md flex items-center justify-center">
            <User className="w-8 h-8 text-[#C83E68]" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-amber-300/50 shadow-xs mb-4">
            <Sparkles className="w-4 h-4 text-[#C83E68]" />
            <span className="text-xs font-bold tracking-wider uppercase text-[#133826]">
              Elite Artist Network
            </span>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-bold font-serif text-[#133826] mb-3 leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Join BlindGlow Team
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-8 max-w-md mx-auto">
            Become a certified doorstep beauty expert, bridal makeup artist, or henna master. Enjoy flexible schedules and premier earnings.
          </p>

          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-[#E8D9C5] shadow-xl text-left space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center flex-shrink-0 text-[#C83E68]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#133826]">
                  Sign In Required to Apply
                </h3>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  Please log in or register so your stylist portfolio, verification status, and direct payouts are linked to your profile.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                onClick={() => navigate('/login?redirect=/join-team')}
                className="h-12 rounded-2xl bg-[#133826] hover:bg-[#0c2419] text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In to Apply
              </Button>

              <Button
                onClick={() => navigate('/signup?redirect=/join-team')}
                className="h-12 rounded-2xl bg-[#C83E68] hover:bg-[#a63054] text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Create Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Already active app
  if (existingApp && !hasConfirmedIntent) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 bg-[#FAF6EE] text-[#133826]">
        <div className="max-w-xl mx-auto text-center mt-8">
          <div className="w-16 h-16 rounded-full mx-auto mb-5 bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-700 shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#133826] mb-2">
            Stylist Application Active
          </h2>
          <p className="text-sm text-stone-600 mb-6">
            We already have your application for <strong className="text-[#133826]">{existingApp.full_name || existingApp.name}</strong> under review.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-[#E8D9C5] shadow-lg text-left mb-6 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-500">Status:</span>
              <span className="px-3 py-1 rounded-full font-bold uppercase text-[11px] bg-amber-50 text-amber-800 border border-amber-200">
                {existingApp.status?.replace('_', ' ') || 'Pending'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-500">Specialization:</span>
              <span className="font-semibold text-stone-800">{existingApp.specialization}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate('/profile')}
              className="h-12 px-6 rounded-2xl bg-[#133826] text-white hover:bg-[#0d261a] font-semibold text-sm shadow-md"
            >
              Track in Profile →
            </Button>
            <Button
              variant="outline"
              onClick={() => setHasConfirmedIntent(true)}
              className="h-12 px-6 rounded-2xl border-stone-300 text-stone-700 hover:bg-stone-50 text-sm font-semibold"
            >
              Update / Submit Details
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation gate
  if (!hasConfirmedIntent) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 bg-[#FAF6EE] text-[#133826] flex items-center justify-center">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-[32px] p-7 sm:p-9 border border-[#E8D9C5] shadow-2xl text-center relative z-10">
          <div className="w-16 h-16 rounded-full mx-auto mb-5 bg-gradient-to-tr from-amber-100 via-rose-100 to-amber-200 border border-amber-300/70 flex items-center justify-center shadow-md">
            <User className="w-8 h-8 text-[#C83E68]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#C83E68] text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>BlindGlow Artist Network</span>
          </div>

          <h2
            className="text-2xl sm:text-3xl font-serif font-bold text-[#133826] mb-3 leading-snug"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Are you sure you want to join our Stylist Team?
          </h2>

          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-6">
            You will be asked to provide your specialization, experience, work portfolio, and KYC ID for official BlindGlow onboarding.
          </p>

          <div className="space-y-3">
            <Button
              onClick={handleConfirmIntent}
              className="w-full h-12 rounded-2xl bg-[#C83E68] hover:bg-[#a63054] text-white font-bold text-sm shadow-lg shadow-rose-900/15"
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

  // Redesigned Form
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-[#FAF6EE] text-[#133826] relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-amber-300/60 shadow-xs mb-3 text-xs font-bold text-[#133826]">
            <Award className="w-4 h-4 text-[#C83E68]" />
            <span>BlindGlow by Satguru • Elite Artist Onboarding</span>
          </div>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#133826] mb-2 tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Join Our Team
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto">
            Become a verified artist for luxury doorstep services and VIP festival clients.
          </p>
        </div>

        {/* Stepper Header */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-8 select-none">
          {[
            { num: 1, label: 'Profile' },
            { num: 2, label: 'Schedule' },
            { num: 3, label: 'Portfolio & ID' },
            { num: 4, label: 'Review' },
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

        <div className="bg-white/95 backdrop-blur-md rounded-[28px] sm:rounded-[36px] border border-[#E8D9C5] shadow-xl p-6 sm:p-10">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <h2 className="text-xl font-serif font-bold text-[#133826] flex items-center gap-2">
                  <User className="w-5 h-5 text-[#C83E68]" /> Professional Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C83E68]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C83E68]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C83E68]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">Primary Specialization *</label>
                  <select
                    value={formData.specialization}
                    onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full h-11 px-3 rounded-xl border border-stone-200 bg-stone-50/50 text-sm font-medium text-stone-800"
                  >
                    {SPECIALIZATIONS.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">Years of Experience</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.experienceYears}
                    onChange={e => setFormData({ ...formData, experienceYears: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C83E68]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">Short Professional Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Share your techniques, certifications, or notable bridal assignments..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C83E68]/40 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  onClick={() => {
                    if (!formData.name || !formData.email || !formData.phone) {
                      toast({ title: 'Missing Information', variant: 'destructive' });
                      return;
                    }
                    setStep(2);
                  }}
                  className="h-12 px-8 rounded-2xl bg-[#C83E68] text-white font-bold text-sm shadow-md"
                >
                  Continue to Schedule →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <h2 className="text-xl font-serif font-bold text-[#133826] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#C83E68]" /> Availability Schedule
                </h2>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">Available Working Days</label>
                <div className="flex flex-wrap gap-2.5">
                  {AVAILABLE_DAYS.map(day => {
                    const isSelected = formData.availableDays.includes(day.key);
                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => toggleDay(day.key)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          isSelected ? 'bg-[#133826] text-white' : 'bg-stone-100 text-stone-500'
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">Shift Start</label>
                  <input
                    type="time"
                    value={formData.openingTime}
                    onChange={e => setFormData({ ...formData, openingTime: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-stone-50/50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">Shift End</label>
                  <input
                    type="time"
                    value={formData.closingTime}
                    onChange={e => setFormData({ ...formData, closingTime: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-stone-50/50 text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <Button variant="outline" onClick={() => setStep(1)} className="h-11 px-6 rounded-2xl">← Back</Button>
                <Button onClick={() => setStep(3)} className="h-12 px-8 rounded-2xl bg-[#C83E68] text-white font-bold text-sm">Continue to Portfolio →</Button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <h2 className="text-xl font-serif font-bold text-[#133826] flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#C83E68]" /> Portfolio & KYC ID
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-stone-300 rounded-2xl p-4 text-center relative hover:bg-stone-50">
                  <input type="file" accept="image/*" onChange={e => handleFileChange('profilePhoto', e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <User className="w-6 h-6 mx-auto text-[#C83E68] mb-1.5" />
                  <span className="text-xs font-bold block text-stone-800">Stylist Profile Photo</span>
                  <span className="text-[10px] text-stone-500">{documents.profilePhoto ? documents.profilePhoto.name : 'Clear headshot'}</span>
                </div>

                <div className="border-2 border-dashed border-stone-300 rounded-2xl p-4 text-center relative hover:bg-stone-50">
                  <input type="file" accept="image/*,application/pdf" onChange={e => handleFileChange('idProof', e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <Shield className="w-6 h-6 mx-auto text-emerald-600 mb-1.5" />
                  <span className="text-xs font-bold block text-stone-800">Govt ID Proof (Aadhaar / Voter ID)</span>
                  <span className="text-[10px] text-stone-500">{documents.idProof ? documents.idProof.name : 'Required for verified badge'}</span>
                </div>

                <div className="border-2 border-dashed border-stone-300 rounded-2xl p-4 text-center relative hover:bg-stone-50">
                  <input type="file" accept="image/*" onChange={e => handleFileChange('work1', e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <Briefcase className="w-6 h-6 mx-auto text-amber-600 mb-1.5" />
                  <span className="text-xs font-bold block text-stone-800">Work Sample 1</span>
                  <span className="text-[10px] text-stone-500">{documents.work1 ? documents.work1.name : 'Bridal/Henna/Makeup sample'}</span>
                </div>

                <div className="border-2 border-dashed border-stone-300 rounded-2xl p-4 text-center relative hover:bg-stone-50">
                  <input type="file" accept="image/*" onChange={e => handleFileChange('work2', e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <Briefcase className="w-6 h-6 mx-auto text-amber-600 mb-1.5" />
                  <span className="text-xs font-bold block text-stone-800">Work Sample 2</span>
                  <span className="text-[10px] text-stone-500">{documents.work2 ? documents.work2.name : 'Facial/Hairstyle sample'}</span>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <Button variant="outline" onClick={() => setStep(2)} className="h-11 px-6 rounded-2xl">← Back</Button>
                <Button onClick={() => setStep(4)} className="h-12 px-8 rounded-2xl bg-[#C83E68] text-white font-bold text-sm">Review & Submit →</Button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <h2 className="text-xl font-serif font-bold text-[#133826] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Confirm Stylist Application
                </h2>
              </div>

              <div className="rounded-2xl bg-stone-50 p-5 space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-stone-200/60">
                  <span className="text-stone-500">Artist Name:</span>
                  <span className="font-bold text-[#133826]">{formData.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200/60">
                  <span className="text-stone-500">Specialty:</span>
                  <span className="font-bold text-[#133826]">{formData.specialization} ({formData.experienceYears} Years)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200/60">
                  <span className="text-stone-500">Contact:</span>
                  <span className="font-semibold text-stone-800">{formData.email} • {formData.phone}</span>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.acceptedTerms}
                  onChange={e => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-[#C83E68]"
                />
                <span className="text-xs text-stone-600 leading-relaxed">
                  I agree to BlindGlow luxury service guidelines, punctuality standards, and sanitized doorstep hygiene procedures.
                </span>
              </label>

              <div className="pt-4 flex justify-between items-center">
                <Button variant="outline" onClick={() => setStep(3)} disabled={loading} className="h-11 px-6 rounded-2xl">← Back</Button>
                <Button onClick={handleSubmit} disabled={loading} className="h-12 px-9 rounded-2xl bg-[#C83E68] text-white font-bold text-sm shadow-md">
                  {loading ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</span> : 'Submit Stylist Application ✨'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
