import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles, Star, Package, TrendingUp, Bell, User, LogOut, Power, MapPin,
  CheckCircle, Clock, MessageSquare, Activity, Award, Loader2,
  BarChart3, Calendar, Phone, Eye, EyeOff, Megaphone, Wallet, AlertTriangle, Key, Lock,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface MemberProfile {
  id: string; full_name: string; email: string; phone: string; specialization: string;
  experience_years: number; bio: string; rating: number; total_jobs: number;
  earnings: number; is_active: boolean; status: string; portfolio_urls?: string[];
  latitude?: number; longitude?: number;
}

interface Job {
  id: string; order_number?: string; customer_name?: string; name?: string;
  service?: string; services?: any[]; status: string; created_at: string;
  total?: number; preferred_date?: string; address?: string;
}

export function MemberDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const memberId = searchParams.get('id');

  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'analytics' | 'profile' | 'support' | 'settings'>('overview');
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
    const all = [...(d.data || []), ...(m.data || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
      if (weekly[k]) { weekly[k].jobs++; weekly[k].earnings += j.total || 0; }
    });

    // Monthly trend
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
    toast({ title: newStatus ? '🟢 You are now Online' : '⭕ You are now Offline' });
    if (!newStatus && locationSharing) stopLocationSharing();
  };

  const startLocationSharing = () => {
    if (!navigator.geolocation) { toast({ title: 'Location not supported', variant: 'destructive' }); return; }
    if (!isOnline) { toast({ title: 'Go online first to share location', variant: 'destructive' }); return; }
    setLocationSharing(true);
    // Share immediately
    navigator.geolocation.getCurrentPosition(pos => {
      if (profile) {
        supabase.from('stylist_requests').update({
          latitude: pos.coords.latitude, longitude: pos.coords.longitude,
          last_location_update: new Date().toISOString(),
        }).eq('id', profile.id);
      }
    });
    // Then every 30 seconds
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
    toast({ title: '📍 Location sharing started', description: 'Your location updates every 30 seconds. Customers can see you on the map.' });
  };

  const stopLocationSharing = () => {
    if (locationInterval.current) clearInterval(locationInterval.current);
    locationInterval.current = null;
    setLocationSharing(false);
    toast({ title: '📍 Location sharing stopped' });
  };

  const submitSOS = async () => {
    if (!profile) return;
    navigator.geolocation.getCurrentPosition(async pos => {
      await supabase.from('sos_requests').insert({
        requester_type: 'stylist', requester_id: profile.id,
        latitude: pos.coords.latitude, longitude: pos.coords.longitude,
        message: 'SOS from stylist dashboard', status: 'active'
      });
      toast({ title: '🆘 SOS Sent to Admin!', description: 'Admin has been notified with your location.', variant: 'destructive' });
    }, () => {
      supabase.from('sos_requests').insert({ requester_type: 'stylist', requester_id: profile.id, message: 'SOS - location unavailable', status: 'active' });
      toast({ title: '🆘 SOS Sent!', description: 'Admin has been notified.', variant: 'destructive' });
    });
  };

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 6) { toast({ title: 'Min 6 characters', variant: 'destructive' }); return; }
    if (newPassword !== confirmPassword) { toast({ title: 'Passwords do not match', variant: 'destructive' }); return; }
    setChangingPassword(true);
    // For partner login, we update the password stored in stylist_requests
    const session = sessionStorage.getItem('member_session');
    if (session) {
      const { error } = await supabase.from('stylist_requests').update({ approved_password: newPassword }).eq('id', session);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
      else { toast({ title: '✅ Password Updated!', description: 'Use new password next time you login.' }); setNewPassword(''); setConfirmPassword(''); }
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
    toast({ title: '✅ Support ticket submitted!', description: 'Admin will respond soon.' });
    setSupportSubject(''); setSupportMessage('');
    setSubmittingSupport(false);
  };

  const completedJobs = jobs.filter(j => j.status === 'completed' || j.status === 'serviced');
  const pendingJobs = jobs.filter(j => j.status === 'pending' || j.status === 'confirmed' || j.status === 'executive_assigned');

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0614, #150b22)' }}>
      <Loader2 className="w-10 h-10 animate-spin text-violet-400" />
    </div>
  );
  if (!profile) return null;

  const PIE_COLORS = ['#7c3aed', '#be185d', '#f59e0b', '#10b981'];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0614, #150b22, #0a1020)' }}>
      {/* Header */}
      <div className="sticky top-0 z-50 px-4 py-3" style={{ background: 'rgba(10,6,20,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(124,58,237,0.2)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Team Dashboard</p>
              <p className="text-white/40 text-xs">{profile.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={submitSOS}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}>
              <AlertTriangle className="w-3.5 h-3.5" />SOS
            </button>
            <button onClick={toggleOnlineStatus}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={isOnline
                ? { background: 'rgba(52,211,153,0.2)', border: '1px solid rgba(52,211,153,0.4)', color: '#34d399' }
                : { background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}>
              <Power className="w-3.5 h-3.5" />{isOnline ? 'Online' : 'Offline'}
            </button>
            <button onClick={() => { sessionStorage.removeItem('member_session'); navigate('/'); }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Announcements Banner */}
        {announcements.length > 0 && (
          <div className="rounded-2xl p-4 mb-6 flex items-start gap-3"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <Megaphone className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 font-semibold text-sm">{announcements[0].title}</p>
              <p className="text-amber-300/70 text-xs mt-0.5">{announcements[0].message}</p>
            </div>
          </div>
        )}

        {/* Profile hero */}
        <div className="rounded-3xl p-6 mb-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(190,24,93,0.2))', border: '1px solid rgba(124,58,237,0.3)' }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
          <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>👩‍🎨</div>
              <div>
                <h1 className="text-white font-bold text-xl">{profile.full_name}</h1>
                <p className="text-violet-300 text-sm">{profile.specialization}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className={`w-3 h-3 ${i <= Math.round(profile.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-white/20'}`} />)}
                  </div>
                  <span className="text-white/50 text-xs">{profile.rating?.toFixed(1) || '5.0'}</span>
                </div>
              </div>
            </div>
            <button onClick={() => locationSharing ? stopLocationSharing() : startLocationSharing()}
              className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
              style={locationSharing
                ? { background: 'rgba(52,211,153,0.2)', border: '1px solid rgba(52,211,153,0.4)', color: '#34d399' }
                : { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}>
              <MapPin className="w-4 h-4" />{locationSharing ? '📡 Sharing Location' : 'Share Location'}
            </button>
          </div>

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
            {[
              { label: 'Total Jobs', value: jobs.length, icon: Package, color: 'from-violet-400 to-purple-500' },
              { label: 'Completed', value: completedJobs.length, icon: CheckCircle, color: 'from-emerald-400 to-teal-500' },
              { label: 'Pending', value: pendingJobs.length, icon: Clock, color: 'from-amber-400 to-orange-500' },
              { label: 'Rating', value: `${profile.rating?.toFixed(1) || '5.0'}★`, icon: Star, color: 'from-amber-400 to-yellow-500' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold">{value}</p>
                  <p className="text-white/40 text-xs">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two-Column Layout with Collapsible Left Panel */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Panel */}
          <aside
            className={`transition-all duration-300 flex-shrink-0 w-full ${
              isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
            }`}
          >
            <div
              className="rounded-3xl p-3 sm:p-4 shadow-xl lg:sticky lg:top-20"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                {!isSidebarCollapsed && (
                  <span className="font-bold text-xs uppercase tracking-wider text-violet-300">
                    Category Menu
                  </span>
                )}
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-all ml-auto"
                  title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                >
                  {isSidebarCollapsed ? <ChevronRight className="w-4 h-4 text-violet-400" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
              </div>

              <nav className="space-y-1.5">
                {[
                  { id: 'overview', label: 'Overview', icon: Activity },
                  { id: 'jobs', label: 'My Jobs', icon: Package, badge: jobs.length },
                  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                  { id: 'profile', label: 'Profile', icon: User },
                  { id: 'support', label: 'Support', icon: MessageSquare },
                  { id: 'settings', label: 'Settings', icon: Key },
                ].map(({ id, label, icon: Icon, badge }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-medium text-xs transition-all ${
                      activeTab === id
                        ? 'text-white shadow-lg shadow-violet-500/20'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                    style={activeTab === id ? { background: 'linear-gradient(135deg, #7c3aed, #a855f7)' } : {}}
                    title={label}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!isSidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left truncate">{label}</span>
                        {badge !== undefined && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/15 text-white">
                            {badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Right Main Content */}
          <div className="flex-1 min-w-0 w-full">

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-amber-400" />Recent Jobs</h3>
                {jobs.slice(0, 5).map(j => (
                  <div key={j.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-white text-sm font-medium">{j.customer_name || 'Customer'}</p>
                      <p className="text-white/40 text-xs">{j.service || (Array.isArray(j.services) ? j.services[0]?.name : 'Service')} • {new Date(j.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${j.status === 'completed' || j.status === 'serviced' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {j.status}
                    </span>
                  </div>
                ))}
                {jobs.length === 0 && <p className="text-white/30 text-sm text-center py-4">No jobs assigned yet</p>}
              </div>

              <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-violet-400" />Performance</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Completion Rate', value: jobs.length > 0 ? `${Math.round((completedJobs.length / jobs.length) * 100)}%` : '100%', color: 'text-emerald-400' },
                    { label: 'Average Rating', value: `${profile.rating?.toFixed(1) || '5.0'} / 5.0`, color: 'text-amber-400' },
                    { label: 'Experience', value: `${profile.experience_years} years`, color: 'text-violet-400' },
                    { label: 'Specialization', value: profile.specialization, color: 'text-white' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-white/60 text-sm">{label}</span>
                      <span className={`${color} font-bold text-sm`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Status Toggle */}
            <div className="rounded-2xl p-5" style={{ background: isOnline ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${isOnline ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-bold text-lg ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isOnline ? '🟢 You are Online' : '⭕ You are Offline'}
                  </h3>
                  <p className={`text-sm ${isOnline ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
                    {isOnline ? 'You can receive new bookings and assignments.' : 'Toggle on to start receiving bookings.'}
                  </p>
                </div>
                <button onClick={toggleOnlineStatus}
                  className="w-14 h-7 rounded-full relative transition-all"
                  style={{ background: isOnline ? '#34d399' : 'rgba(255,255,255,0.2)' }}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${isOnline ? 'left-8' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Jobs */}
        {activeTab === 'jobs' && (
          <div className="space-y-3">
            {jobs.length === 0 ? (
              <div className="rounded-2xl p-12 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/40">No jobs assigned yet. Stay online to receive bookings!</p>
              </div>
            ) : jobs.map(j => (
              <div key={j.id} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-semibold">{j.customer_name || 'Customer'}</p>
                    <p className="text-white/50 text-sm mt-1">{j.service || (Array.isArray(j.services) ? j.services.map((s: any) => s.name).join(', ') : 'Beauty Service')}</p>
                    {j.address && <p className="text-white/40 text-xs mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{j.address}</p>}
                    <p className="text-white/30 text-xs mt-1">{new Date(j.created_at).toLocaleString('en-IN')}</p>
                    {j.total && <p className="text-violet-300 font-bold text-sm mt-1">₹{j.total}</p>}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${j.status === 'completed' || j.status === 'serviced' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : j.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                    {j.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-5">
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-violet-400" />Weekly Jobs</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analyticsData.weekly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 12 }} labelStyle={{ color: 'white' }} />
                  <Bar dataKey="jobs" name="Jobs" fill="url(#jobGrad)" radius={[6,6,0,0]} />
                  <defs>
                    <linearGradient id="jobGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-400" />Monthly Trend</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={analyticsData.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 12 }} labelStyle={{ color: 'white' }} />
                  <Line type="monotone" dataKey="count" name="Jobs" stroke="#34d399" strokeWidth={2.5} dot={{ fill: '#34d399', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Jobs', value: jobs.length, color: 'from-violet-500 to-purple-600' },
                { label: 'Completed', value: completedJobs.length, color: 'from-emerald-500 to-teal-600' },
                { label: 'Pending', value: pendingJobs.length, color: 'from-amber-500 to-orange-600' },
                { label: 'This Week', value: analyticsData.weekly.reduce((s, d) => s + d.jobs, 0), color: 'from-rose-500 to-pink-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-white font-bold text-2xl">{value}</p>
                  <p className="text-white/40 text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile */}
        {activeTab === 'profile' && (
          <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="text-white font-semibold mb-5 flex items-center gap-2"><User className="w-5 h-5 text-violet-400" />My Profile</h3>
            <div className="space-y-3">
              {[
                { label: 'Full Name', value: profile.full_name },
                { label: 'Email', value: profile.email },
                { label: 'Phone', value: profile.phone },
                { label: 'Specialization', value: profile.specialization },
                { label: 'Experience', value: `${profile.experience_years} years` },
                { label: 'Rating', value: `${profile.rating?.toFixed(1) || '5.0'} / 5.0` },
                { label: 'Status', value: profile.status },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2.5 border-b border-white/5 last:border-0">
                  <span className="text-white/50 text-sm">{label}</span>
                  <span className="text-white text-sm font-semibold">{value}</span>
                </div>
              ))}
              {profile.bio && (
                <div className="pt-3">
                  <p className="text-white/50 text-sm mb-1">Bio</p>
                  <p className="text-white/80 text-sm">{profile.bio}</p>
                </div>
              )}
            </div>
            <p className="text-white/30 text-xs mt-4 text-center">To update profile details, please contact admin support.</p>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-5">
            <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-white font-semibold mb-5 flex items-center gap-2"><Lock className="w-5 h-5 text-violet-400" />Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">New Password (min 6 chars)</label>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password"
                      className="w-full h-10 px-4 pr-10 rounded-xl text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
                    <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password"
                    className="w-full h-10 px-4 rounded-xl text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
                </div>
                <button onClick={changePassword} disabled={changingPassword}
                  className="w-full h-11 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                  {changingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Key className="w-4 h-4" />Update Password</>}
                </button>
              </div>
              <p className="text-white/30 text-xs mt-4 text-center">Password change takes effect on next login.</p>
            </div>
          </div>
        )}

        {/* Support */}
        {activeTab === 'support' && (
          <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="text-white font-semibold mb-5 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-violet-400" />Raise a Support Ticket</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Subject</label>
                <input value={supportSubject} onChange={e => setSupportSubject(e.target.value)} placeholder="Brief subject..."
                  className="w-full h-10 px-4 rounded-xl text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Message</label>
                <textarea value={supportMessage} onChange={e => setSupportMessage(e.target.value)} placeholder="Describe your issue..."
                  rows={4} className="w-full px-4 py-3 rounded-xl text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
              </div>
              <button onClick={submitSupport} disabled={submittingSupport}
                className="w-full h-11 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                {submittingSupport ? <Loader2 className="w-5 h-5 animate-spin" /> : <><MessageSquare className="w-4 h-4" />Submit Ticket</>}
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
