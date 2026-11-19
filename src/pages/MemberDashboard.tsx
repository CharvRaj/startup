import { StylistTrainingAcademy } from '@/components/training/StylistTrainingAcademy';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles, Star, Package, UserCheck, Radio, TrendingUp, Bell, User, LogOut, Power, MapPin,
  CheckCircle, Clock, MessageSquare, Activity, Award, Loader2, GraduationCap,
  BarChart3, Calendar, Phone, Eye, EyeOff, Megaphone, Wallet, AlertTriangle, Key, Lock,
  ChevronLeft, ChevronRight, QrCode, ScanLine, Search, Filter, ExternalLink, Copy, Check,
  CheckCircle2, ArrowRight, ShieldCheck, RefreshCw, XCircle, Home, ChevronDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface MemberProfile {
  id: string; full_name: string; email: string; phone: string; specialization: string;
  experience_years: number; bio: string; rating: number; total_jobs: number;
  earnings: number; is_active: boolean; status: string; portfolio_urls?: string[];
  latitude?: number; longitude?: number;
}

interface Job {
  id: string;
  order_number?: string;
  customer_name?: string;
  name?: string;
  service?: string;
  services?: any[];
  status: string;
  created_at: string;
  total?: number;
  total_amount?: number;
  preferred_date?: string;
  booking_date?: string;
  preferred_time?: string;
  time_slot?: string;
  address?: string;
  phone?: string;
  customer_phone?: string;
  qr_code?: string;
  _source_table?: 'doorstep_orders' | 'mehndi_orders';
}

export function MemberDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const memberId = searchParams.get('id');

  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'qr-verify' | 'training' | 'analytics' | 'profile' | 'support' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [locationSharing, setLocationSharing] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubject, setSupportSubject] = useState('');
  const [submittingSupport, setSubmittingSupport] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<{ weekly: any[]; trend: any[] }>({ weekly: [], trend: [] });

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const locationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // QR verification and search/filter states
  const [manualQr, setManualQr] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'cancelled'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    const session = sessionStorage.getItem('member_session');
    if (!session && !memberId) { navigate('/partner-login'); return; }
    const id = memberId || session;
    if (id) loadProfile(id);
  }, []);

  const loadProfile = async (id: string) => {
    const { data } = await supabase.from('stylist_requests').select('*').eq('id', id).single();
    if (!data || data.status !== 'approved') {
      toast({ title: 'Access Denied', description: 'Profile not approved or not found', variant: 'destructive' });
      navigate('/');
      return;
    }
    setProfile(data);
    setIsOnline(data.is_active ?? true);
    sessionStorage.setItem('member_session', id);

    // Log attendance (login)
    await supabase.from('attendance_logs').insert({ stylist_id: id, action: 'login' });

    loadJobs(id);
    loadAnnouncements();
    setLoading(false);
  };

  const loadJobs = async (id: string) => {
    const [d, m] = await Promise.all([
      supabase.from('doorstep_orders').select('*').eq('executive_id', id).order('created_at', { ascending: false }).limit(50),
      supabase.from('mehndi_orders').select('*').eq('executive_id', id).order('created_at', { ascending: false }).limit(50),
    ]);
    const dList = (d.data || []).map(item => ({ ...item, _source_table: 'doorstep_orders' as const }));
    const mList = (m.data || []).map(item => ({ ...item, _source_table: 'mehndi_orders' as const }));
    const all = [...dList, ...mList].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setJobs(all);
    buildAnalytics(all);
  };

  const buildAnalytics = (jobs: any[]) => {
    // Weekly earnings (last 7 days)
    const weekly: Record<string, { jobs: number; earnings: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = d.toLocaleDateString('en-IN', { weekday: 'short' });
      weekly[k] = { jobs: 0, earnings: 0 };
    }
    jobs.forEach(j => {
      const k = new Date(j.created_at).toLocaleDateString('en-IN', { weekday: 'short' });
      if (weekly[k]) {
        weekly[k].jobs++;
        weekly[k].earnings += Number(j.total || j.total_amount || 0);
      }
    });

    const trend: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const k = d.toLocaleDateString('en-IN', { month: 'short' });
      trend[k] = 0;
    }
    jobs.forEach(j => {
      const k = new Date(j.created_at).toLocaleDateString('en-IN', { month: 'short' });
      if (trend[k] !== undefined) trend[k]++;
    });

    setAnalyticsData({
      weekly: Object.entries(weekly).map(([day, v]) => ({ day, ...v })),
      trend: Object.entries(trend).map(([month, count]) => ({ month, count })),
    });
  };

  const loadAnnouncements = async () => {
    const { data } = await supabase.from('announcements')
      .select('*').eq('active', true)
      .in('target_audience', ['all', 'stylists'])
      .order('created_at', { ascending: false }).limit(5);
    setAnnouncements(data || []);
  };

  const toggleOnlineStatus = async () => {
    if (!profile) return;
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    await supabase.from('stylist_requests').update({ is_active: newStatus }).eq('id', profile.id);
    await supabase.from('attendance_logs').insert({ stylist_id: profile.id, action: newStatus ? 'online' : 'offline' });
    toast({ title: newStatus ? 'You are now Online & Available' : 'You are now Offline' });
    if (!newStatus && locationSharing) stopLocationSharing();
  };

  const updateJobStatus = async (jobId: string, newStatus: string, sourceTable?: 'doorstep_orders' | 'mehndi_orders') => {
    try {
      const table = sourceTable || (jobs.find(j => j.id === jobId)?._source_table || 'doorstep_orders');
      const { error } = await supabase.from(table).update({ status: newStatus }).eq('id', jobId);
      if (error) {
        const altTable = table === 'doorstep_orders' ? 'mehndi_orders' : 'doorstep_orders';
        await supabase.from(altTable).update({ status: newStatus }).eq('id', jobId);
      }
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
      toast({ title: 'Status Updated', description: `Job marked as ${newStatus.replace(/_/g, ' ').toUpperCase()}` });
      if (scanResult?.data?.id === jobId) {
        setScanResult({ ...scanResult, data: { ...scanResult.data, status: newStatus } });
      }
    } catch (err: any) {
      toast({ title: 'Error updating job', description: err.message, variant: 'destructive' });
    }
  };

  const lookupQrCode = async (codeOverride?: string) => {
    const q = (codeOverride !== undefined ? codeOverride : manualQr).trim();
    if (!q) {
      toast({ title: 'Please enter order #, QR string, or phone', variant: 'destructive' });
      return;
    }
    setIsVerifying(true);
    let foundJob: any = null;

    const local = jobs.find(j =>
      j.order_number?.toLowerCase() === q.toLowerCase() ||
      j.qr_code === q ||
      j.id === q ||
      j.phone?.includes(q) ||
      j.customer_phone?.includes(q) ||
      (j.customer_name || j.name)?.toLowerCase().includes(q.toLowerCase())
    );
    if (local) foundJob = local;

    if (!foundJob) {
      const { data: dOrder } = await supabase.from('doorstep_orders').select('*')
        .or(`order_number.eq.${q},qr_code.eq.${q},id.eq.${q},phone.eq.${q}`).limit(1);
      if (dOrder?.[0]) foundJob = { ...dOrder[0], _source_table: 'doorstep_orders' };
    }

    if (!foundJob) {
      const { data: mOrder } = await supabase.from('mehndi_orders').select('*')
        .or(`order_number.eq.${q},qr_code.eq.${q},id.eq.${q},phone.eq.${q}`).limit(1);
      if (mOrder?.[0]) foundJob = { ...mOrder[0], _source_table: 'mehndi_orders' };
    }

    setScanResult(foundJob ? { found: true, data: foundJob } : { found: false, queried: q });
    setIsVerifying(false);
  };

  const filteredJobs = useMemo(() => {
    return jobs
      .filter(j => {
        const status = j.status?.toLowerCase() || 'pending';
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'pending' && (status === 'pending' || status === 'executive_assigned')) ||
          (statusFilter === 'in_progress' && (status === 'in_progress' || status === 'confirmed' || status === 'active')) ||
          (statusFilter === 'completed' && (status === 'completed' || status === 'serviced')) ||
          status === statusFilter;

        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          (j.customer_name || j.name)?.toLowerCase().includes(q) ||
          j.phone?.includes(q) ||
          j.customer_phone?.includes(q) ||
          j.order_number?.toLowerCase().includes(q) ||
          j.service?.toLowerCase().includes(q) ||
          j.address?.toLowerCase().includes(q) ||
          j.id?.toLowerCase().includes(q);

        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        const tA = new Date(a.created_at).getTime();
        const tB = new Date(b.created_at).getTime();
        return sortBy === 'newest' ? tB - tA : tA - tB;
      });
  }, [jobs, searchQuery, statusFilter, sortBy]);

  const jobCounts = useMemo(() => {
    return {
      all: jobs.length,
      pending: jobs.filter(j => j.status === 'pending' || j.status === 'executive_assigned').length,
      in_progress: jobs.filter(j => j.status === 'in_progress' || j.status === 'confirmed' || j.status === 'active').length,
      completed: jobs.filter(j => j.status === 'completed' || j.status === 'serviced').length,
      cancelled: jobs.filter(j => j.status === 'cancelled').length,
    };
  }, [jobs]);

  const startLocationSharing = () => {
    if (!navigator.geolocation) { toast({ title: 'Location not supported', variant: 'destructive' }); return; }
    if (!isOnline) { toast({ title: 'Go online first to share location', variant: 'destructive' }); return; }
    setLocationSharing(true);
    navigator.geolocation.getCurrentPosition(pos => {
      if (profile) {
        supabase.from('stylist_requests').update({
          latitude: pos.coords.latitude, longitude: pos.coords.longitude,
          last_location_update: new Date().toISOString(),
        }).eq('id', profile.id);
      }
    });
    locationInterval.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(pos => {
        if (profile) {
          supabase.from('stylist_requests').update({
            latitude: pos.coords.latitude, longitude: pos.coords.longitude,
            last_location_update: new Date().toISOString(),
          }).eq('id', profile.id);
        }
      });
    }, 30000);
    toast({ title: 'Location sharing started', description: 'Your live location updates every 30 seconds for customer tracking.' });
  };

  const stopLocationSharing = () => {
    if (locationInterval.current) clearInterval(locationInterval.current);
    locationInterval.current = null;
    setLocationSharing(false);
    toast({ title: 'Location sharing stopped' });
  };

  const submitSOS = async () => {
    if (!profile) return;
    navigator.geolocation.getCurrentPosition(async pos => {
      await supabase.from('sos_requests').insert({
        requester_type: 'stylist', requester_id: profile.id,
        latitude: pos.coords.latitude, longitude: pos.coords.longitude,
        message: 'SOS emergency alert from doorstep stylist dashboard', status: 'active'
      });
      toast({ title: 'SOS Sent to Admin!', description: 'Emergency coordinates dispatched to headquarters.', variant: 'destructive' });
    }, () => {
      supabase.from('sos_requests').insert({ requester_type: 'stylist', requester_id: profile.id, message: 'SOS - location unavailable', status: 'active' });
      toast({ title: 'SOS Sent!', description: 'Emergency team notified.', variant: 'destructive' });
    });
  };

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 6) { toast({ title: 'Min 6 characters', variant: 'destructive' }); return; }
    if (newPassword !== confirmPassword) { toast({ title: 'Passwords do not match', variant: 'destructive' }); return; }
    setChangingPassword(true);
    const session = sessionStorage.getItem('member_session');
    if (session) {
      const { error } = await supabase.from('stylist_requests').update({ approved_password: newPassword }).eq('id', session);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
      else { toast({ title: 'Password Updated!', description: 'Use your new password next time you login.' }); setNewPassword(''); setConfirmPassword(''); }
    }
    setChangingPassword(false);
  };

  const submitSupport = async () => {
    if (!supportSubject || !supportMessage) { toast({ title: 'Please fill subject and message', variant: 'destructive' }); return; }
    setSubmittingSupport(true);
    await supabase.from('support_tickets').insert({
      requester_type: 'stylist', requester_id: profile?.id,
      subject: supportSubject, message: supportMessage, status: 'open', priority: 'normal',
    });
    toast({ title: 'Support ticket submitted!', description: 'Operations team will respond shortly.' });
    setSupportSubject(''); setSupportMessage('');
    setSubmittingSupport(false);
  };

  const completedJobs = jobs.filter(j => j.status === 'completed' || j.status === 'serviced');
  const pendingJobs = jobs.filter(j => j.status === 'pending' || j.status === 'confirmed' || j.status === 'executive_assigned');

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF9F3]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-[#F8DCE4] flex items-center justify-center shadow-xs">
          <Loader2 className="w-6 h-6 animate-spin text-[#D81B60]" />
        </div>
        <p className="text-xs font-semibold text-[#43152E]">Opening Stylist Dashboard...</p>
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
            {/* Logo Box */}
            <div className="w-10 h-10 rounded-2xl bg-[#FDF0F4] border border-[#F8DCE4] text-[#D81B60] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Sparkles className="w-5 h-5 text-[#D81B60]" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm tracking-wider text-[#43152E] leading-tight">
                {profile.full_name}
              </div>
              <div className="text-[8px] uppercase tracking-widest text-[#B55B33] font-semibold">
                STYLIST &amp; EXECUTIVE DESK
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
            <Power className="w-3.5 h-3.5" />{isOnline ? 'Online' : 'Offline'}
          </button>

          <button
            onClick={() => { sessionStorage.removeItem('member_session'); navigate('/'); }}
            className="w-10 h-10 rounded-full bg-[#FFF9F3] border border-[#F8DCE4] flex items-center justify-center text-[#43152E] hover:bg-[#F8DCE4] hover:text-[#D81B60] transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Announcements Banner */}
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
                <UserCheck className="w-7 h-7 text-[#D81B60]" />
              </div>
              <div>
                <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#43152E]">{profile.full_name}</h1>
                <p className="text-[#D81B60] font-semibold text-sm">{profile.specialization}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(profile.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />)}
                  </div>
                  <span className="text-[#B55B33] font-bold text-xs">{profile.rating?.toFixed(1) || '5.0'} / 5.0</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => locationSharing ? stopLocationSharing() : startLocationSharing()}
                className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-2xs border ${
                  locationSharing
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-[#FFF9F3] hover:bg-[#FDF0F4] text-[#43152E] border-[#F8DCE4]'
                }`}
              >
                {locationSharing ? <><Radio className="w-4 h-4 animate-pulse text-emerald-600" /> Sharing Live GPS</> : <><MapPin className="w-4 h-4 text-[#D81B60]" /> Share Location</>}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#F8DCE4]">
            {[
              { label: 'Total Jobs', value: jobs.length, icon: Package, bg: 'bg-rose-50 text-[#D81B60]' },
              { label: 'Completed', value: completedJobs.length, icon: CheckCircle, bg: 'bg-emerald-50 text-emerald-700' },
              { label: 'Pending / Active', value: pendingJobs.length, icon: Clock, bg: 'bg-amber-50 text-amber-700' },
              { label: 'Stylist Rating', value: `${profile.rating?.toFixed(1) || '5.0'}`, icon: Star, bg: 'bg-purple-50 text-purple-700' },
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

        {/* Mobile Horizontal Navigation Tabs (Pills) */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: 'overview', label: 'Dashboard', icon: Activity },
            { id: 'jobs', label: 'My Jobs', icon: Package, badge: jobs.length },
            { id: 'qr-verify', label: 'QR Scanner', icon: QrCode },
            { id: 'training', label: 'Training Academy', icon: GraduationCap },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'support', label: 'Support', icon: MessageSquare },
            { id: 'settings', label: 'Settings', icon: Key },
          ].map(({ id, label, icon: Icon, badge }: any) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-semibold text-xs whitespace-nowrap transition-all shrink-0 shadow-2xs ${
                  isActive
                    ? 'bg-[#D81B60] text-white shadow-xs border border-[#D81B60]'
                    : 'bg-white text-[#43152E]/80 border border-[#F8DCE4] hover:bg-[#FDF0F4]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
                {badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#F8DCE4] text-[#D81B60]'
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Desktop Two-Column Layout with User-Dashboard Sidebar ── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Navigation Sidebar */}
          <aside
            className={`hidden lg:block transition-all duration-300 flex-shrink-0 ${
              isSidebarCollapsed ? 'w-20' : 'w-64'
            }`}
          >
            <div className="bg-white rounded-3xl p-4 border border-[#F8DCE4] shadow-sm sticky top-24">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F8DCE4]/60">
                {!isSidebarCollapsed && (
                  <span className="font-bold text-xs uppercase tracking-wider text-[#D81B60]">
                    Stylist Navigation
                  </span>
                )}
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-1 rounded-xl text-muted-foreground hover:text-[#D81B60] transition-colors ml-auto"
                  title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                >
                  {isSidebarCollapsed ? <ChevronRight className="w-4 h-4 text-[#D81B60]" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
              </div>

              <nav className="space-y-1.5">
                {[
                  { id: 'overview', label: 'Dashboard', icon: Activity },
                  { id: 'jobs', label: 'My Jobs', icon: Package, badge: jobs.length },
                  { id: 'qr-verify', label: 'QR Scanner', icon: QrCode },
                  { id: 'training', label: 'Training Academy', icon: GraduationCap },
                  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                  { id: 'profile', label: 'My Profile', icon: User },
                  { id: 'support', label: 'Support Desk', icon: MessageSquare },
                  { id: 'settings', label: 'Settings', icon: Key },
                ].map(({ id, label, icon: Icon, badge }: any) => {
                  const isActive = activeTab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id as any)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all relative ${
                        isActive
                          ? 'bg-[#FDF0F4] text-[#D81B60] shadow-xs'
                          : 'text-[#43152E]/70 hover:text-[#43152E] hover:bg-[#FFF9F3]'
                      }`}
                      title={label}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#D81B60]" />
                      )}
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#D81B60]' : 'text-[#43152E]/60'}`} />
                      {!isSidebarCollapsed && (
                        <>
                          <span className="flex-1 text-left truncate">{label}</span>
                          {badge !== undefined && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              isActive ? 'bg-[#F8DCE4] text-[#D81B60]' : 'bg-[#F8DCE4]/40 text-[#43152E]/80'
                            }`}>
                              {badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Right Main Content */}
          <div className="flex-1 min-w-0 w-full space-y-6">

            {/* Training Academy */}
            {activeTab === 'training' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-[#FFF9F3] via-[#FDF0F4] to-[#FFF9F3] rounded-3xl p-5 border border-[#F8DCE4] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#F8DCE4] flex items-center justify-center text-[#D81B60] shadow-2xs shrink-0">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-[#43152E] font-bold text-sm sm:text-base flex items-center gap-2">
                        Satguru Stylist Training Academy
                        <span className="text-[10px] bg-[#D81B60] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">New Page</span>
                      </h3>
                      <p className="text-xs text-[#43152E]/70 mt-0.5">
                        Launch the dedicated full-page Academy portal for interactive video courses, procedure checklists, and verifiable credentials.
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/training-academy?role=stylist&id=${profile.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#D81B60] hover:bg-[#c21554] text-white text-xs font-bold transition-all shadow-xs shrink-0"
                  >
                    Open Full Academy Page <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <StylistTrainingAcademy
                  stylistId={profile.id}
                  stylistName={profile.full_name}
                />
              </div>
            )}

            {/* ── Overview Tab ── */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Recent Assigned Jobs */}
                  <div className="bg-white rounded-3xl p-6 border border-[#F8DCE4] shadow-sm">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F8DCE4]/60">
                      <h3 className="text-[#43152E] font-bold text-sm sm:text-base flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#D81B60]" />Recent Assigned Jobs
                      </h3>
                      <button onClick={() => setActiveTab('jobs')} className="text-xs text-[#D81B60] hover:underline flex items-center gap-1 font-bold">
                        View all ({jobs.length}) <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {jobs.slice(0, 5).map(j => (
                        <div key={j.id} className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4]/70">
                          <div className="min-w-0 pr-2">
                            <p className="text-[#43152E] text-sm font-bold truncate">{j.customer_name || j.name || 'Client Appointment'}</p>
                            <p className="text-[#43152E]/60 text-xs truncate">
                              {j.service || (Array.isArray(j.services) ? j.services[0]?.name : 'Service')} • {new Date(j.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 border ${
                            j.status === 'completed' || j.status === 'serviced'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {j.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                      {jobs.length === 0 && <p className="text-muted-foreground text-xs text-center py-6">No jobs assigned yet</p>}
                    </div>
                  </div>

                  {/* QR Order Scanner Quick Card */}
                  <div className="bg-white rounded-3xl p-6 border border-[#F8DCE4] shadow-sm">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F8DCE4]/60">
                      <h3 className="text-[#43152E] font-bold text-sm sm:text-base flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-[#D81B60]" />QR Order Verify
                      </h3>
                      <button onClick={() => setActiveTab('qr-verify')} className="text-xs text-[#D81B60] hover:underline font-bold">
                        Full Station →
                      </button>
                    </div>
                    <div className="space-y-3">
                      <input
                        value={manualQr}
                        onChange={e => setManualQr(e.target.value)}
                        placeholder="Enter Order # / QR string / phone..."
                        className="w-full h-11 px-4 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4] text-xs sm:text-sm text-[#43152E] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#D81B60]/20 font-mono"
                        onKeyDown={(e) => { if (e.key === 'Enter') lookupQrCode(); }}
                      />
                      <button
                        onClick={() => lookupQrCode()}
                        disabled={isVerifying}
                        className="w-full h-11 rounded-2xl bg-[#D81B60] hover:bg-[#c2185b] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                      >
                        {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ScanLine className="w-4 h-4" />Verify Order Ticket</>}
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
                                <p className="font-bold text-sm flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-600 inline" /> Valid Order</p>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono uppercase font-bold">{scanResult.data.status}</span>
                              </div>
                              <p className="text-[#43152E] text-sm font-bold mt-1.5">{scanResult.data.customer_name || scanResult.data.name}</p>
                              <p className="text-[#43152E]/70 text-xs">{scanResult.data.service || 'Doorstep Service'}</p>
                              {scanResult.data.status !== 'completed' && scanResult.data.status !== 'serviced' && (
                                <button
                                  onClick={() => updateJobStatus(scanResult.data.id, 'completed', scanResult.data._source_table)}
                                  className="mt-3 w-full py-2 rounded-xl bg-[#133826] hover:bg-[#0c2419] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed Now
                                </button>
                              )}
                            </div>
                          ) : (
                            <p className="font-bold text-xs flex items-center gap-1.5"><XCircle className="w-4 h-4 inline" /> Order not found for "{scanResult.queried}"</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stylist Online / Offline Status Strip */}
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
                        {isOnline ? 'You are Online & Ready for Orders' : 'You are Currently Offline'}
                      </h3>
                      <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                        {isOnline ? 'You are active to receive doorstep beauty and mehndi appointments.' : 'Toggle on to start receiving appointments in your service radius.'}
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

            {/* ── QR Scanner Station ── */}
            {activeTab === 'qr-verify' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F8DCE4] shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-[#F8DCE4]">
                  <div className="w-12 h-12 rounded-2xl bg-[#FDF0F4] border border-[#F8DCE4] text-[#D81B60] flex items-center justify-center shadow-xs">
                    <QrCode className="w-6 h-6 text-[#D81B60]" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-[#43152E]">Customer Order &amp; QR Verifier</h3>
                    <p className="text-[#43152E]/60 text-xs sm:text-sm">Verify doorstep or mehndi appointments by Order Number, QR string, or customer phone.</p>
                  </div>
                </div>

                <div className="max-w-xl space-y-4">
                  <div className="relative">
                    <input
                      value={manualQr}
                      onChange={e => setManualQr(e.target.value)}
                      placeholder="Paste Order #, QR string, or customer phone..."
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
                      {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-4 h-4" />Verify Order Ticket</>}
                    </button>
                    <button
                      onClick={() => {
                        if (jobs[0]) {
                          const target = jobs[0].order_number || jobs[0].qr_code || jobs[0].id;
                          setManualQr(target);
                          lookupQrCode(target);
                        } else {
                          toast({ title: 'No jobs available to test' });
                        }
                      }}
                      className="px-4 h-11 rounded-2xl text-xs font-semibold text-[#43152E] bg-[#FFF9F3] hover:bg-[#FDF0F4] border border-[#F8DCE4] flex items-center gap-1.5 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#D81B60]" /> Test Latest Job
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
                              <span>Verified Valid Appointment</span>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                              scanResult.data.status === 'completed' || scanResult.data.status === 'serviced'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {scanResult.data.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground text-xs block">Customer Name</span>
                              <span className="text-[#43152E] font-bold text-base">{scanResult.data.customer_name || scanResult.data.name}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs block">Phone Number</span>
                              <a href={`tel:${scanResult.data.phone || scanResult.data.customer_phone}`} className="text-[#D81B60] hover:underline font-mono font-semibold flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5" /> {scanResult.data.phone || scanResult.data.customer_phone || '—'}
                              </a>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs block">Service Requested</span>
                              <span className="text-[#43152E] font-semibold">
                                {scanResult.data.service || (Array.isArray(scanResult.data.services) ? scanResult.data.services.map((s: any) => s.name).join(', ') : 'Doorstep Service')}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground text-xs block">Order Number</span>
                              <span className="font-mono text-[#43152E] font-bold">{scanResult.data.order_number || scanResult.data.id?.slice(0, 8)}</span>
                            </div>
                            {scanResult.data.address && (
                              <div className="sm:col-span-2">
                                <span className="text-muted-foreground text-xs block">Customer Address</span>
                                <div className="flex items-center justify-between gap-2 mt-0.5">
                                  <span className="text-[#43152E]/90 text-xs font-medium">{scanResult.data.address}</span>
                                  <a
                                    href={`https://maps.google.com/?q=${encodeURIComponent(scanResult.data.address)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-emerald-700 hover:underline text-xs flex items-center gap-1 shrink-0 font-bold"
                                  >
                                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Maps ↗
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="pt-2 flex flex-wrap gap-2">
                            {scanResult.data.status !== 'in_progress' && scanResult.data.status !== 'completed' && scanResult.data.status !== 'serviced' && (
                              <button
                                onClick={() => updateJobStatus(scanResult.data.id, 'in_progress', scanResult.data._source_table)}
                                className="flex-1 h-10 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs"
                              >
                                Mark In Progress
                              </button>
                            )}
                            {scanResult.data.status !== 'completed' && scanResult.data.status !== 'serviced' && (
                              <button
                                onClick={() => updateJobStatus(scanResult.data.id, 'completed', scanResult.data._source_table)}
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
                            <p className="font-bold text-sm">Order Not Found</p>
                            <p className="text-xs text-muted-foreground">Could not find any match for identifier: <span className="font-mono text-[#43152E] font-bold">{scanResult.queried}</span></p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── My Jobs Tab with Search & Filters ── */}
            {activeTab === 'jobs' && (
              <div className="space-y-4">
                {/* Search & Filter Toolbar */}
                <div className="bg-white rounded-3xl p-5 border border-[#F8DCE4] shadow-sm">
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    {/* Search */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search by client name, order #, phone, address, service..."
                        className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4] text-xs sm:text-sm text-[#43152E] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#D81B60]/20"
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#43152E] text-xs">
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Sort Dropdown */}
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
                      { id: 'all', label: 'All Jobs', count: jobCounts.all },
                      { id: 'pending', label: 'Pending', count: jobCounts.pending },
                      { id: 'in_progress', label: 'In Progress', count: jobCounts.in_progress },
                      { id: 'completed', label: 'Completed', count: jobCounts.completed },
                      { id: 'cancelled', label: 'Cancelled', count: jobCounts.cancelled },
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

                {/* Job Cards */}
                <div className="space-y-3">
                  {filteredJobs.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-[#F8DCE4] shadow-sm">
                      <Package className="w-16 h-16 text-[#F8DCE4] mx-auto mb-4" />
                      <p className="text-[#43152E] font-bold">No jobs found</p>
                      <p className="text-muted-foreground text-xs mt-1">Try switching filters or adjusting your search keywords.</p>
                    </div>
                  ) : filteredJobs.map(j => (
                    <div key={j.id} className="bg-white rounded-3xl p-5 border border-[#F8DCE4] shadow-xs hover:shadow-sm transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-[#43152E] font-bold text-base">{j.customer_name || j.name || 'Client Appointment'}</p>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                              j.status === 'completed' || j.status === 'serviced'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : j.status === 'pending' || j.status === 'executive_assigned'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : j.status === 'cancelled'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}>
                              {j.status.replace(/_/g, ' ')}
                            </span>
                          </div>

                          <p className="text-[#D81B60] text-sm font-semibold">
                            {j.service || (Array.isArray(j.services) ? j.services.map((s: any) => s.name).join(', ') : 'Beauty Service')}
                          </p>

                          {j.address && (
                            <p className="text-[#43152E]/70 text-xs flex items-center gap-1.5 pt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-[#D81B60] shrink-0" />
                              <span>{j.address}</span>
                              <a
                                href={`https://maps.google.com/?q=${encodeURIComponent(j.address)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-700 hover:underline text-[11px] font-bold ml-1 shrink-0"
                              >
                                Maps ↗
                              </a>
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
                            <span>📅 {new Date(j.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            {(j.total || j.total_amount) && (
                              <span className="text-[#B55B33] font-bold font-mono">₹{j.total || j.total_amount}</span>
                            )}
                            {j.order_number && (
                              <span className="font-mono text-[#43152E]/70 font-semibold">Ord: {j.order_number}</span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex sm:flex-col items-center sm:items-end gap-2 pt-2 sm:pt-0">
                          {(j.phone || j.customer_phone) && (
                            <a
                              href={`tel:${j.phone || j.customer_phone}`}
                              className="px-3.5 py-1.5 rounded-2xl bg-[#FDF0F4] hover:bg-[#F8DCE4] border border-[#F8DCE4] text-[#D81B60] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
                            >
                              <Phone className="w-3.5 h-3.5 text-[#D81B60]" /> Call Client
                            </a>
                          )}
                          <button
                            onClick={() => {
                              const target = j.order_number || j.qr_code || j.id;
                              setManualQr(target);
                              setActiveTab('qr-verify');
                              lookupQrCode(target);
                            }}
                            className="px-3.5 py-1.5 rounded-2xl text-xs font-semibold text-[#43152E] hover:text-[#D81B60] bg-[#FFF9F3] hover:bg-[#FDF0F4] border border-[#F8DCE4] flex items-center gap-1.5 transition-all shadow-2xs"
                          >
                            <QrCode className="w-3.5 h-3.5 text-[#D81B60]" /> Verify Ticket
                          </button>
                          {j.status !== 'completed' && j.status !== 'serviced' && (
                            <button
                              onClick={() => updateJobStatus(j.id, 'completed', j._source_table)}
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
                    <BarChart3 className="w-5 h-5 text-[#D81B60]" />Weekly Completed Appointments
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={analyticsData.weekly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F8DCE4" />
                      <XAxis dataKey="day" tick={{ fill: '#43152E', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#43152E', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: '#FFF9F3', border: '1px solid #F8DCE4', borderRadius: 16, color: '#43152E' }} labelStyle={{ color: '#D81B60', fontWeight: 'bold' }} />
                      <Bar dataKey="jobs" name="Jobs" fill="#D81B60" radius={[8,8,0,0]} />
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
                      <Line type="monotone" dataKey="count" name="Jobs" stroke="#D81B60" strokeWidth={3} dot={{ fill: '#D81B60', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Total Jobs', value: jobs.length, bg: 'bg-rose-50 text-[#D81B60]' },
                    { label: 'Completed', value: completedJobs.length, bg: 'bg-emerald-50 text-emerald-700' },
                    { label: 'Pending', value: pendingJobs.length, bg: 'bg-amber-50 text-amber-700' },
                    { label: 'This Week', value: analyticsData.weekly.reduce((s, d) => s + d.jobs, 0), bg: 'bg-purple-50 text-purple-700' },
                  ].map(({ label, value, bg }) => (
                    <div key={label} className="bg-white rounded-3xl p-5 border border-[#F8DCE4] shadow-xs">
                      <div className={`w-10 h-10 rounded-2xl ${bg} flex items-center justify-center mb-3 shadow-2xs`}>
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <p className="text-[#43152E] font-extrabold text-2xl">{value}</p>
                      <p className="text-muted-foreground text-xs mt-1 font-medium">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Profile Tab ── */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F8DCE4] shadow-sm space-y-4">
                <h3 className="text-[#43152E] font-bold text-lg flex items-center gap-2 pb-3 border-b border-[#F8DCE4]">
                  <User className="w-5 h-5 text-[#D81B60]" />Stylist Profile Details
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Full Name', value: profile.full_name },
                    { label: 'Email Address', value: profile.email },
                    { label: 'Contact Phone', value: profile.phone },
                    { label: 'Specialization', value: profile.specialization },
                    { label: 'Years of Experience', value: `${profile.experience_years} years` },
                    { label: 'Stylist Rating', value: `${profile.rating?.toFixed(1) || '5.0'} / 5.0` },
                    { label: 'Account Status', value: profile.status },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-2.5 border-b border-[#F8DCE4]/60 last:border-0 text-sm">
                      <span className="text-muted-foreground font-medium">{label}</span>
                      <span className="text-[#43152E] font-bold">{value}</span>
                    </div>
                  ))}
                  {profile.bio && (
                    <div className="pt-3">
                      <p className="text-muted-foreground text-xs font-semibold mb-1">Bio / Overview</p>
                      <p className="text-[#43152E]/90 text-sm leading-relaxed">{profile.bio}</p>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground text-xs text-center pt-2">To update registered credentials, contact Satguru Support.</p>
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
                  <MessageSquare className="w-5 h-5 text-[#D81B60]" />Raise a Support Ticket
                </h3>
                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-bold text-[#43152E] uppercase tracking-wider mb-1.5">Subject</label>
                    <input
                      value={supportSubject}
                      onChange={e => setSupportSubject(e.target.value)}
                      placeholder="Brief issue subject..."
                      className="w-full h-11 px-4 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4] text-xs sm:text-sm text-[#43152E] focus:outline-none focus:ring-2 focus:ring-[#D81B60]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#43152E] uppercase tracking-wider mb-1.5">Message</label>
                    <textarea
                      value={supportMessage}
                      onChange={e => setSupportMessage(e.target.value)}
                      placeholder="Describe your issue or emergency request..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4] text-xs sm:text-sm text-[#43152E] focus:outline-none focus:ring-2 focus:ring-[#D81B60]/20 resize-none"
                    />
                  </div>
                  <button
                    onClick={submitSupport}
                    disabled={submittingSupport}
                    className="w-full h-11 rounded-2xl bg-[#D81B60] hover:bg-[#c2185b] font-bold text-white text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    {submittingSupport ? <Loader2 className="w-4 h-4 animate-spin" /> : <><MessageSquare className="w-4 h-4" />Submit Ticket</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}