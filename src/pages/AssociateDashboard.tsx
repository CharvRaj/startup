import { AssociateTrainingSection } from '@/components/training/AssociateTrainingSection';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Store, Star, Package, Activity, MessageSquare, User, LogOut, Power, MapPin,
  CheckCircle, XCircle, Clock, Loader2, Calendar, GraduationCap, TrendingUp, BarChart3,
  Megaphone, AlertTriangle, QrCode, ScanLine, Key, Lock, Eye, EyeOff, Search, Filter,
  Phone, ExternalLink, Copy, Check, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw,
  Home, ChevronDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface AssociateProfile {
  id: string; shop_name: string; owner_name: string; email: string; phone: string;
  address: string; area: string; city: string; state: string;
  rating: number; total_jobs: number; earnings: number; is_active: boolean; status: string;
}

export function AssociateDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const associateId = searchParams.get('id');

  const [profile, setProfile] = useState<AssociateProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'qr-verify' | 'training' | 'analytics' | 'profile' | 'support' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubject, setSupportSubject] = useState('');
  const [submittingSupport, setSubmittingSupport] = useState(false);
  // Password change
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<{ weekly: any[]; trend: any[] }>({ weekly: [], trend: [] });
  const [scanResult, setScanResult] = useState<any>(null);
  const [manualQr, setManualQr] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Filters for Bookings
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    const session = sessionStorage.getItem('associate_session');
    if (!session && !associateId) { navigate('/partner-login'); return; }
    const id = associateId || session;
    if (id) loadProfile(id);
  }, []);

  const loadProfile = async (id: string) => {
    const { data } = await supabase.from('associate_requests').select('*').eq('id', id).single();
    if (!data || data.status !== 'approved') {
      toast({ title: 'Access Denied', description: 'Profile not approved', variant: 'destructive' });
      navigate('/');
      return;
    }
    setProfile(data);
    setIsOnline(data.is_active ?? true);
    sessionStorage.setItem('associate_session', id);

    const { data: bData } = await supabase.from('bookings').select('*')
      .eq('shop_id', data.id).order('created_at', { ascending: false }).limit(50);
    const bookingList = bData || [];
    setBookings(bookingList);
    buildAnalytics(bookingList);

    const { data: ann } = await supabase.from('announcements')
      .select('*').eq('active', true)
      .in('target_audience', ['all', 'associates'])
      .order('created_at', { ascending: false }).limit(3);
    setAnnouncements(ann || []);

    setLoading(false);
  };

  const buildAnalytics = (bookings: any[]) => {
    const weekly: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      weekly[d.toLocaleDateString('en-IN', { weekday: 'short' })] = 0;
    }
    bookings.forEach(b => {
      const k = new Date(b.created_at).toLocaleDateString('en-IN', { weekday: 'short' });
      if (weekly[k] !== undefined) weekly[k]++;
    });
    const trend: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      trend[d.toLocaleDateString('en-IN', { month: 'short' })] = 0;
    }
    bookings.forEach(b => {
      const k = new Date(b.created_at).toLocaleDateString('en-IN', { month: 'short' });
      if (trend[k] !== undefined) trend[k]++;
    });
    setAnalyticsData({
      weekly: Object.entries(weekly).map(([day, count]) => ({ day, count })),
      trend: Object.entries(trend).map(([month, count]) => ({ month, count })),
    });
  };

  const toggleOnlineStatus = async () => {
    if (!profile) return;
    const next = !isOnline;
    setIsOnline(next);
    await supabase.from('associate_requests').update({ is_active: next }).eq('id', profile.id);
    toast({ title: next ? 'Salon is now Open & Active' : 'Salon is now Closed' });
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId);
      if (error) throw error;
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      toast({ title: 'Status Updated', description: `Booking marked as ${newStatus.toUpperCase()}` });
      if (scanResult?.data?.id === bookingId) {
        setScanResult({ ...scanResult, data: { ...scanResult.data, status: newStatus } });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update status', variant: 'destructive' });
    }
  };

  const lookupQrCode = async (codeOverride?: string) => {
    const q = (codeOverride !== undefined ? codeOverride : manualQr).trim();
    if (!q) {
      toast({ title: 'Please enter a code or booking ID', variant: 'destructive' });
      return;
    }
    setIsVerifying(true);
    let foundBooking: any = null;

    // Search by qr_code, id, phone or name
    const { data: byQr } = await supabase.from('bookings').select('*').eq('qr_code', q).single();
    if (byQr) foundBooking = byQr;

    if (!foundBooking) {
      const { data: byId } = await supabase.from('bookings').select('*').eq('id', q).single();
      if (byId) foundBooking = byId;
    }

    if (!foundBooking && profile?.id) {
      const { data: byPhone } = await supabase.from('bookings').select('*').eq('shop_id', profile.id).eq('phone', q).limit(1);
      if (byPhone?.[0]) foundBooking = byPhone[0];
    }

    if (!foundBooking) {
      const local = bookings.find(b =>
        b.qr_code === q ||
        b.id === q ||
        b.phone?.includes(q) ||
        b.name?.toLowerCase().includes(q.toLowerCase())
      );
      if (local) foundBooking = local;
    }

    setScanResult(foundBooking ? { found: true, data: foundBooking } : { found: false, queried: q });
    setIsVerifying(false);
  };

  // Filtered & sorted bookings
  const filteredBookings = useMemo(() => {
    return bookings
      .filter(b => {
        const status = b.status?.toLowerCase() || 'pending';
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'in_progress' && (status === 'in_progress' || status === 'active' || status === 'confirmed')) ||
          status === statusFilter;

        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          b.name?.toLowerCase().includes(q) ||
          b.phone?.includes(q) ||
          b.service?.toLowerCase().includes(q) ||
          b.id?.toLowerCase().includes(q) ||
          b.qr_code?.toLowerCase().includes(q);

        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        const tA = new Date(a.created_at || a.preferred_date).getTime();
        const tB = new Date(b.created_at || b.preferred_date).getTime();
        return sortBy === 'newest' ? tB - tA : tA - tB;
      });
  }, [bookings, searchQuery, statusFilter, sortBy]);

  const statusCounts = useMemo(() => {
    return {
      all: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      in_progress: bookings.filter(b => b.status === 'in_progress' || b.status === 'active').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
    };
  }, [bookings]);

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 6) { toast({ title: 'Min 6 characters', variant: 'destructive' }); return; }
    if (newPassword !== confirmPassword) { toast({ title: 'Passwords do not match', variant: 'destructive' }); return; }
    setChangingPassword(true);
    const session = sessionStorage.getItem('associate_session');
    if (session) {
      const { error } = await supabase.from('associate_requests').update({ approved_password: newPassword }).eq('id', session);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
      else { toast({ title: 'Password Updated!' }); setNewPassword(''); setConfirmPassword(''); }
    }
    setChangingPassword(false);
  };

  const submitSOS = async () => {
    if (!profile) return;
    navigator.geolocation.getCurrentPosition(async pos => {
      await supabase.from('sos_requests').insert({
        requester_type: 'associate', requester_id: profile.id,
        latitude: pos.coords.latitude, longitude: pos.coords.longitude,
        message: 'SOS from associate dashboard', status: 'active'
      });
      toast({ title: 'SOS Sent!', description: 'Admin has been notified.', variant: 'destructive' });
    }, async () => {
      await supabase.from('sos_requests').insert({ requester_type: 'associate', requester_id: profile.id, message: 'SOS', status: 'active' });
      toast({ title: 'SOS Sent!', variant: 'destructive' });
    });
  };

  const submitSupport = async () => {
    if (!supportSubject || !supportMessage) { toast({ title: 'Please fill all fields', variant: 'destructive' }); return; }
    setSubmittingSupport(true);
    await supabase.from('support_tickets').insert({
      requester_type: 'associate', requester_id: profile?.id,
      subject: supportSubject, message: supportMessage, status: 'open',
    });
    toast({ title: 'Support ticket submitted!' });
    setSupportSubject(''); setSupportMessage('');
    setSubmittingSupport(false);
  };

  const completedBookings = bookings.filter(b => b.status === 'completed');

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF9F3]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-[#F8DCE4] flex items-center justify-center shadow-xs">
          <Loader2 className="w-6 h-6 animate-spin text-[#D81B60]" />
        </div>
        <p className="text-xs font-semibold text-[#43152E]">Opening Associate Dashboard...</p>
      </div>
    </div>
  );
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#FFF9F3] text-[#43152E] font-sans antialiased">
      {/* ── Top Header Matching User Dashboard ── */}
      <header className="h-20 bg-white/90 backdrop-blur-md border-b border-[#F8DCE4] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            {/* Lotus / Store Logo Box */}
            <div className="w-10 h-10 rounded-2xl bg-[#FDF0F4] border border-[#F8DCE4] text-[#D81B60] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Store className="w-5 h-5 text-[#D81B60]" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm tracking-wider text-[#43152E] leading-tight">
                {profile.shop_name}
              </div>
              <div className="text-[8px] uppercase tracking-widest text-[#B55B33] font-semibold">
                SATGURU ASSOCIATE PARTNER
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FFF9F3] border border-[#F8DCE4] text-xs font-semibold text-[#43152E] hover:bg-[#F8DCE4] hover:text-[#D81B60] transition-all shadow-2xs"
            title="Go to Home"
          >
            <Home className="w-3.5 h-3.5 text-[#D81B60]" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          <button
            onClick={submitSOS}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />SOS
          </button>

          <button
            onClick={toggleOnlineStatus}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-2xs border ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
            }`}
          >
            <Power className="w-3.5 h-3.5" />{isOnline ? 'Salon Open' : 'Salon Closed'}
          </button>

          <button
            onClick={() => { sessionStorage.removeItem('associate_session'); navigate('/'); }}
            className="w-10 h-10 rounded-full bg-[#FFF9F3] border border-[#F8DCE4] flex items-center justify-center text-[#43152E] hover:bg-[#F8DCE4] hover:text-[#D81B60] transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Announcement Banner */}
        {announcements.length > 0 && (
          <div className="rounded-3xl p-4.5 flex items-start gap-3 bg-[#FFFDF0] border border-amber-200/80 shadow-xs">
            <Megaphone className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-900 font-bold text-sm">{announcements[0].title}</p>
              <p className="text-amber-800/80 text-xs mt-0.5 leading-relaxed">{announcements[0].message}</p>
            </div>
          </div>
        )}

        {/* ── Hero Profile Card matching User Dashboard ── */}
        <div className="rounded-3xl p-6 sm:p-7 bg-white border border-[#F8DCE4] shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FDF0F4] border border-[#F8DCE4] text-[#D81B60] flex items-center justify-center text-3xl shadow-xs">
                <Store className="w-7 h-7 text-[#D81B60]" />
              </div>
              <div>
                <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#43152E]">{profile.shop_name}</h1>
                <p className="text-[#D81B60] font-semibold text-sm">Owner: {profile.owner_name}</p>
                <p className="text-[#43152E]/70 text-xs mt-1 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#D81B60]" />{profile.area}, {profile.city} • <span className="text-[#B55B33] font-bold">⭐ {profile.rating?.toFixed(1) || '5.0'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {isOnline ? '● Accepting Appointments' : '○ Closed for Bookings'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#F8DCE4]">
            {[
              { label: 'Total Bookings', value: bookings.length, icon: Package, bg: 'bg-rose-50 text-[#D81B60]' },
              { label: 'Completed', value: completedBookings.length, icon: CheckCircle, bg: 'bg-emerald-50 text-emerald-700' },
              { label: 'This Month', value: bookings.filter(b => new Date(b.created_at) > new Date(Date.now() - 30*86400000)).length, icon: Calendar, bg: 'bg-purple-50 text-purple-700' },
              { label: 'Partner Rating', value: `${profile.rating?.toFixed(1) || '5.0'} / 5.0`, icon: Star, bg: 'bg-amber-50 text-amber-700' },
            ].map(({ label, value, icon: Icon, bg }) => (
              <div key={label} className="p-3.5 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4]/80 flex items-center gap-3 shadow-2xs">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 shadow-2xs`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[#43152E] font-bold text-base leading-tight">{value}</p>
                  <p className="text-[#43152E]/60 text-xs font-medium">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: 'overview', label: 'Dashboard', icon: Activity },
            { id: 'bookings', label: 'Bookings', icon: Package, badge: bookings.length },
            { id: 'qr-verify', label: 'QR Scanner', icon: QrCode },
            { id: 'training', label: 'Staff Training', icon: GraduationCap },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'profile', label: 'Salon Profile', icon: Store },
            { id: 'support', label: 'Support', icon: MessageSquare },
            { id: 'settings', label: 'Settings', icon: Key },
          ].map(({ id, label, icon: Icon, badge }: any) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm whitespace-nowrap transition-all shadow-2xs ${
                  isActive
                    ? 'bg-[#D81B60] text-white shadow-sm border border-[#D81B60]'
                    : 'bg-white text-[#43152E]/80 border border-[#F8DCE4] hover:bg-[#FDF0F4] hover:text-[#D81B60]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {badge !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#F8DCE4] text-[#D81B60]'
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Associate Training Section */}
        {activeTab === 'training' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-[#FFF9F3] via-[#FDF0F4] to-[#FFF9F3] rounded-3xl p-5 border border-[#F8DCE4] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#F8DCE4] flex items-center justify-center text-[#D81B60] shadow-2xs shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[#43152E] font-bold text-sm sm:text-base flex items-center gap-2">
                    Satguru Associate Training Academy
                    <span className="text-[10px] bg-[#D81B60] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">New Page</span>
                  </h3>
                  <p className="text-xs text-[#43152E]/70 mt-0.5">
                    Explore the dedicated full-page Academy portal for interactive video courses, procedure checklists, and verifiable credentials.
                  </p>
                </div>
              </div>
              <Link
                to={`/training-academy?role=associate&id=${profile.id}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#D81B60] hover:bg-[#c21554] text-white text-xs font-bold transition-all shadow-xs shrink-0"
              >
                Open Full Academy Page <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <AssociateTrainingSection
              associateId={profile.id}
              associateName={profile.owner_name || profile.shop_name}
            />
          </div>
        )}

        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Recent Bookings Card */}
              <div className="bg-white rounded-3xl p-6 border border-[#F8DCE4] shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F8DCE4]/60">
                  <h3 className="text-[#43152E] font-bold text-sm sm:text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#D81B60]" />Recent Salon Bookings
                  </h3>
                  <button onClick={() => setActiveTab('bookings')} className="text-xs text-[#D81B60] hover:underline flex items-center gap-1 font-bold">
                    View all ({bookings.length}) <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {bookings.slice(0, 5).map(b => (
                    <div key={b.id} className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4]/70">
                      <div className="min-w-0 pr-2">
                        <p className="text-[#43152E] text-sm font-bold truncate">{b.name}</p>
                        <p className="text-[#43152E]/60 text-xs truncate">{b.service} • {new Date(b.preferred_date).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 border ${
                        b.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  ))}
                  {bookings.length === 0 && <p className="text-muted-foreground text-xs text-center py-6">No bookings yet</p>}
                </div>
              </div>

              {/* QR Scanner Quick Card */}
              <div className="bg-white rounded-3xl p-6 border border-[#F8DCE4] shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F8DCE4]/60">
                  <h3 className="text-[#43152E] font-bold text-sm sm:text-base flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-[#D81B60]" />QR Booking Verify
                  </h3>
                  <button onClick={() => setActiveTab('qr-verify')} className="text-xs text-[#D81B60] hover:underline font-bold">
                    Full Station →
                  </button>
                </div>
                <div className="space-y-3">
                  <input
                    value={manualQr}
                    onChange={e => setManualQr(e.target.value)}
                    placeholder="Enter QR code / Booking ID / Phone..."
                    className="w-full h-11 px-4 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4] text-xs sm:text-sm text-[#43152E] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#D81B60]/20 font-mono"
                    onKeyDown={(e) => { if (e.key === 'Enter') lookupQrCode(); }}
                  />
                  <button
                    onClick={() => lookupQrCode()}
                    disabled={isVerifying}
                    className="w-full h-11 rounded-2xl bg-[#D81B60] hover:bg-[#c2185b] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ScanLine className="w-4 h-4" />Verify Booking</>}
                  </button>
                  {scanResult && (
                    <div className={`rounded-2xl p-4 border ${
                      scanResult.found
                        ? 'bg-emerald-50/90 border-emerald-200 text-[#133826]'
                        : 'bg-rose-50/90 border-rose-200 text-[#881337]'
                    }`}>
                      {scanResult.found ? (
                        <div>
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-sm flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-600 inline" /> Valid Booking</p>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono uppercase font-bold">{scanResult.data.status}</span>
                          </div>
                          <p className="text-[#43152E] text-sm font-bold mt-1.5">{scanResult.data.name}</p>
                          <p className="text-[#43152E]/70 text-xs">{scanResult.data.service} • {new Date(scanResult.data.preferred_date).toLocaleDateString()}</p>
                          <p className="text-[#43152E]/70 text-xs">{scanResult.data.preferred_time} • {scanResult.data.phone}</p>
                          {scanResult.data.status !== 'completed' && (
                            <button
                              onClick={() => updateBookingStatus(scanResult.data.id, 'completed')}
                              className="mt-3 w-full py-2 rounded-xl bg-[#133826] hover:bg-[#0c2419] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed Now
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="font-bold text-xs flex items-center gap-1.5"><XCircle className="w-4 h-4 inline" /> Booking not found for "{scanResult.queried}"</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Salon Open / Closed Strip */}
            <div className={`rounded-3xl p-6 border shadow-sm ${
              isOnline
                ? 'bg-emerald-50/60 border-emerald-200'
                : 'bg-rose-50/60 border-rose-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-bold text-base sm:text-lg flex items-center gap-2 ${
                    isOnline ? 'text-emerald-900' : 'text-rose-900'
                  }`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    {isOnline ? 'Salon is Open & Accepting Bookings' : 'Salon is Currently Closed'}
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                    {isOnline ? 'Customers can find and book appointments at your parlour.' : 'Toggle on when you are ready to receive walk-ins and bookings.'}
                  </p>
                </div>
                <button
                  onClick={toggleOnlineStatus}
                  className="w-14 h-7 rounded-full relative transition-all shadow-inner"
                  style={{ background: isOnline ? '#10b981' : '#d1d5db' }}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow-sm ${isOnline ? 'left-8' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── QR Verify Dedicated Tab ── */}
        {activeTab === 'qr-verify' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F8DCE4] shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#F8DCE4]">
              <div className="w-12 h-12 rounded-2xl bg-[#FDF0F4] border border-[#F8DCE4] text-[#D81B60] flex items-center justify-center shadow-xs">
                <QrCode className="w-6 h-6 text-[#D81B60]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#43152E]">Customer QR Code & Order Verifier</h3>
                <p className="text-[#43152E]/60 text-xs sm:text-sm">Scan customer ticket or enter booking code to verify arrival and validate service completion.</p>
              </div>
            </div>

            <div className="max-w-xl space-y-4">
              <div className="relative">
                <input
                  value={manualQr}
                  onChange={e => setManualQr(e.target.value)}
                  placeholder="Paste QR string, Booking ID, or customer phone..."
                  className="w-full h-12 px-4 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4] text-xs sm:text-sm text-[#43152E] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#D81B60]/20 font-mono"
                  onKeyDown={(e) => { if (e.key === 'Enter') lookupQrCode(); }}
                />
                {manualQr && (
                  <button
                    onClick={() => { setManualQr(''); setScanResult(null); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#D81B60] text-xs px-2 py-1 font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => lookupQrCode()}
                  disabled={isVerifying}
                  className="flex-1 min-w-[160px] h-11 rounded-2xl bg-[#D81B60] hover:bg-[#c2185b] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-4 h-4" />Verify Booking</>}
                </button>
                <button
                  onClick={() => {
                    if (bookings[0]) {
                      const target = bookings[0].qr_code || bookings[0].id;
                      setManualQr(target);
                      lookupQrCode(target);
                    } else {
                      toast({ title: 'No bookings to test' });
                    }
                  }}
                  className="px-4 h-11 rounded-2xl text-xs font-semibold text-[#43152E] bg-[#FFF9F3] hover:bg-[#FDF0F4] border border-[#F8DCE4] flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#D81B60]" /> Test Latest Booking
                </button>
              </div>

              {scanResult && (
                <div className={`mt-6 rounded-2xl p-5 sm:p-6 border ${
                  scanResult.found
                    ? 'bg-emerald-50/80 border-emerald-200 text-[#133826]'
                    : 'bg-rose-50/80 border-rose-200 text-[#881337]'
                }`}>
                  {scanResult.found ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                        <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span>Verified Valid Booking</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          scanResult.data.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {scanResult.data.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground text-xs block">Customer Name</span>
                          <span className="text-[#43152E] font-bold text-base">{scanResult.data.name}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs block">Phone Number</span>
                          <a href={`tel:${scanResult.data.phone}`} className="text-[#D81B60] hover:underline font-mono font-semibold flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" /> {scanResult.data.phone}
                          </a>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs block">Service Booked</span>
                          <span className="text-[#43152E] font-semibold">{scanResult.data.service}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs block">Appointment Date & Time</span>
                          <span className="text-[#43152E] font-semibold">
                            {new Date(scanResult.data.preferred_date).toLocaleDateString()} at {scanResult.data.preferred_time || 'Scheduled slot'}
                          </span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-muted-foreground text-xs block">Booking Reference ID</span>
                          <span className="font-mono text-xs text-[#43152E]/80 break-all">{scanResult.data.id}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-wrap gap-2">
                        {scanResult.data.status !== 'in_progress' && scanResult.data.status !== 'completed' && (
                          <button
                            onClick={() => updateBookingStatus(scanResult.data.id, 'in_progress')}
                            className="flex-1 h-10 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            Mark In Progress
                          </button>
                        )}
                        {scanResult.data.status !== 'completed' && (
                          <button
                            onClick={() => updateBookingStatus(scanResult.data.id, 'completed')}
                            className="flex-1 h-10 rounded-xl bg-[#133826] hover:bg-[#0c2419] text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Check className="w-4 h-4" /> Verify & Complete Service
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <XCircle className="w-6 h-6 text-rose-500 shrink-0" />
                      <div>
                        <p className="font-bold text-sm">Booking Not Found</p>
                        <p className="text-xs text-muted-foreground">Could not find any match for identifier: <span className="font-mono text-[#43152E] font-bold">{scanResult.queried}</span></p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Bookings Tab with Search & Filters ── */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="bg-white rounded-3xl p-5 border border-[#F8DCE4] shadow-sm">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by customer name, phone, service, ID..."
                    className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4] text-xs sm:text-sm text-[#43152E] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#D81B60]/20"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#43152E] text-xs">
                      ✕
                    </button>
                  )}
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#43152E]/70 hidden sm:inline font-semibold">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="h-11 px-3.5 rounded-2xl text-[#43152E] text-xs bg-[#FFF9F3] border border-[#F8DCE4] focus:outline-none font-semibold"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>

              {/* Status Chips */}
              <div className="flex items-center gap-1.5 sm:gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'all', label: 'All', count: statusCounts.all },
                  { id: 'pending', label: 'Pending', count: statusCounts.pending },
                  { id: 'confirmed', label: 'Confirmed', count: statusCounts.confirmed },
                  { id: 'in_progress', label: 'In Progress', count: statusCounts.in_progress },
                  { id: 'completed', label: 'Completed', count: statusCounts.completed },
                  { id: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
                ].map(({ id, label, count }) => {
                  const isActive = statusFilter === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setStatusFilter(id as any)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-2xs ${
                        isActive
                          ? 'bg-[#D81B60] text-white shadow-xs'
                          : 'bg-[#FFF9F3] text-[#43152E]/80 border border-[#F8DCE4] hover:bg-[#FDF0F4]'
                      }`}
                    >
                      <span>{label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#F8DCE4] text-[#D81B60]'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bookings List */}
            <div className="space-y-3">
              {filteredBookings.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-[#F8DCE4] shadow-sm">
                  <Package className="w-16 h-16 text-[#F8DCE4] mx-auto mb-4" />
                  <p className="text-[#43152E] font-bold">No bookings found</p>
                  <p className="text-muted-foreground text-xs mt-1">Try clearing your search query or switching the status filter.</p>
                </div>
              ) : filteredBookings.map(b => (
                <div key={b.id} className="bg-white rounded-3xl p-5 border border-[#F8DCE4] shadow-xs hover:shadow-sm transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[#43152E] font-bold text-base">{b.name}</p>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                          b.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : b.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : b.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <p className="text-[#D81B60] text-sm font-semibold">{b.service}</p>
                      <p className="text-[#43152E]/70 text-xs flex items-center gap-2 font-medium">
                        <span>📅 {new Date(b.preferred_date).toLocaleDateString()}</span>
                        <span>⏰ {b.preferred_time || 'Slot scheduled'}</span>
                      </p>
                      <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground font-mono">
                        <span>ID: {b.id.slice(0, 8)}...</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(b.id);
                            toast({ title: 'Copied booking ID' });
                          }}
                          className="hover:text-[#D81B60] flex items-center gap-1 font-semibold"
                        >
                          <Copy className="w-3 h-3" /> Copy
                        </button>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 pt-2 sm:pt-0">
                      {b.phone && (
                        <a
                          href={`tel:${b.phone}`}
                          className="px-3.5 py-1.5 rounded-2xl bg-[#FDF0F4] hover:bg-[#F8DCE4] border border-[#F8DCE4] text-[#D81B60] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#D81B60]" /> Call Client
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setManualQr(b.qr_code || b.id);
                          setActiveTab('qr-verify');
                          lookupQrCode(b.qr_code || b.id);
                        }}
                        className="px-3.5 py-1.5 rounded-2xl text-xs font-semibold text-[#43152E] hover:text-[#D81B60] bg-[#FFF9F3] hover:bg-[#FDF0F4] border border-[#F8DCE4] flex items-center gap-1.5 transition-all shadow-2xs"
                      >
                        <QrCode className="w-3.5 h-3.5 text-[#D81B60]" /> Verify Ticket
                      </button>
                      {b.status !== 'completed' && (
                        <button
                          onClick={() => updateBookingStatus(b.id, 'completed')}
                          className="px-3.5 py-1.5 rounded-2xl bg-[#133826] hover:bg-[#0c2419] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" /> Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Analytics Tab ── */}
        {activeTab === 'analytics' && (
          <div className="space-y-5">
            <div className="bg-white rounded-3xl p-6 border border-[#F8DCE4] shadow-sm">
              <h3 className="text-[#43152E] font-bold text-base mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#D81B60]" />Weekly Bookings
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analyticsData.weekly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F8DCE4" />
                  <XAxis dataKey="day" tick={{ fill: '#43152E', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#43152E', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#FFF9F3', border: '1px solid #F8DCE4', borderRadius: 16, color: '#43152E' }} labelStyle={{ color: '#D81B60', fontWeight: 'bold' }} />
                  <Bar dataKey="count" name="Bookings" fill="#D81B60" radius={[8,8,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-[#F8DCE4] shadow-sm">
              <h3 className="text-[#43152E] font-bold text-base mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />Monthly Trend
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={analyticsData.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F8DCE4" />
                  <XAxis dataKey="month" tick={{ fill: '#43152E', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#43152E', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#FFF9F3', border: '1px solid #F8DCE4', borderRadius: 16 }} labelStyle={{ color: '#D81B60', fontWeight: 'bold' }} />
                  <Line type="monotone" dataKey="count" stroke="#D81B60" strokeWidth={3} dot={{ fill: '#D81B60', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Salon Profile Tab ── */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F8DCE4] shadow-sm space-y-4">
            <h3 className="text-[#43152E] font-bold text-lg flex items-center gap-2 pb-3 border-b border-[#F8DCE4]">
              <Store className="w-5 h-5 text-[#D81B60]" />Registered Salon Profile
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Shop / Salon Name', value: profile.shop_name },
                { label: 'Owner Name', value: profile.owner_name },
                { label: 'Email Address', value: profile.email },
                { label: 'Contact Phone', value: profile.phone },
                { label: 'Address', value: profile.address },
                { label: 'Area', value: profile.area },
                { label: 'City', value: profile.city },
                { label: 'State', value: profile.state },
                { label: 'Salon Rating', value: `${profile.rating?.toFixed(1) || '5.0'} / 5.0` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2.5 border-b border-[#F8DCE4]/60 last:border-0 text-sm">
                  <span className="text-muted-foreground font-medium">{label}</span>
                  <span className="text-[#43152E] font-bold">{value || '—'}</span>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-xs text-center pt-2">Contact Satguru Admin Support to update registered salon credentials.</p>
          </div>
        )}

        {/* ── Settings Tab ── */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F8DCE4] shadow-sm space-y-5">
            <h3 className="text-[#43152E] font-bold text-lg flex items-center gap-2 pb-3 border-b border-[#F8DCE4]">
              <Lock className="w-5 h-5 text-[#D81B60]" />Change Account Password
            </h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold text-[#43152E] uppercase tracking-wider mb-1.5">New Password (min 6 characters)</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full h-11 px-4 pr-10 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4] text-xs sm:text-sm text-[#43152E] focus:outline-none focus:ring-2 focus:ring-[#D81B60]/20"
                  />
                  <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#43152E]">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#43152E] uppercase tracking-wider mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full h-11 px-4 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4] text-xs sm:text-sm text-[#43152E] focus:outline-none focus:ring-2 focus:ring-[#D81B60]/20"
                />
              </div>
              <button
                onClick={changePassword}
                disabled={changingPassword}
                className="w-full h-11 rounded-2xl bg-[#D81B60] hover:bg-[#c2185b] font-bold text-white text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Key className="w-4 h-4" />Update Password</>}
              </button>
            </div>
          </div>
        )}

        {/* ── Support Tab ── */}
        {activeTab === 'support' && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F8DCE4] shadow-sm space-y-5">
            <h3 className="text-[#43152E] font-bold text-lg flex items-center gap-2 pb-3 border-b border-[#F8DCE4]">
              <MessageSquare className="w-5 h-5 text-[#D81B60]" />Support Ticket & Helpdesk
            </h3>
            <div className="space-y-4 max-w-lg">
              <input
                value={supportSubject}
                onChange={e => setSupportSubject(e.target.value)}
                placeholder="Subject of query..."
                className="w-full h-11 px-4 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4] text-xs sm:text-sm text-[#43152E] focus:outline-none focus:ring-2 focus:ring-[#D81B60]/20"
              />
              <textarea
                value={supportMessage}
                onChange={e => setSupportMessage(e.target.value)}
                placeholder="Describe your issue or request in detail..."
                rows={4}
                className="w-full px-4 py-3 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4] text-xs sm:text-sm text-[#43152E] focus:outline-none focus:ring-2 focus:ring-[#D81B60]/20 resize-none"
              />
              <button
                onClick={submitSupport}
                disabled={submittingSupport}
                className="w-full h-11 rounded-2xl bg-[#D81B60] hover:bg-[#c2185b] font-bold text-white text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                {submittingSupport ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Support Ticket'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}