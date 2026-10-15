import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Store, Star, Package, Activity, MessageSquare, User, LogOut, Power, MapPin,
  CheckCircle, Clock, Loader2, Calendar, TrendingUp, BarChart3, Megaphone, AlertTriangle, QrCode, ScanLine, Key, Lock, Eye, EyeOff
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
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'analytics' | 'profile' | 'support' | 'settings'>('overview');
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
  const [scanMode, setScanMode] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [manualQr, setManualQr] = useState('');

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
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    await supabase.from('associate_requests').update({ is_active: newStatus }).eq('id', profile.id);
    toast({ title: newStatus ? '🟢 Shop is now Open' : '⭕ Shop is now Closed' });
  };

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 6) { toast({ title: 'Min 6 characters', variant: 'destructive' }); return; }
    if (newPassword !== confirmPassword) { toast({ title: 'Passwords do not match', variant: 'destructive' }); return; }
    setChangingPassword(true);
    const session = sessionStorage.getItem('associate_session');
    if (session) {
      const { error } = await supabase.from('associate_requests').update({ approved_password: newPassword }).eq('id', session);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
      else { toast({ title: '✅ Password Updated!' }); setNewPassword(''); setConfirmPassword(''); }
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
      toast({ title: '🆘 SOS Sent!', description: 'Admin has been notified.', variant: 'destructive' });
    }, async () => {
      await supabase.from('sos_requests').insert({ requester_type: 'associate', requester_id: profile.id, message: 'SOS', status: 'active' });
      toast({ title: '🆘 SOS Sent!', variant: 'destructive' });
    });
  };

  const lookupQrCode = async () => {
    if (!manualQr.trim()) return;
    const { data } = await supabase.from('bookings').select('*').eq('qr_code', manualQr.trim()).single();
    setScanResult(data ? { found: true, data } : { found: false });
  };

  const submitSupport = async () => {
    if (!supportSubject || !supportMessage) { toast({ title: 'Please fill all fields', variant: 'destructive' }); return; }
    setSubmittingSupport(true);
    await supabase.from('support_tickets').insert({
      requester_type: 'associate', requester_id: profile?.id,
      subject: supportSubject, message: supportMessage, status: 'open',
    });
    toast({ title: '✅ Support ticket submitted!' });
    setSupportSubject(''); setSupportMessage('');
    setSubmittingSupport(false);
  };

  const completedBookings = bookings.filter(b => b.status === 'completed');

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0614, #150b22)' }}>
      <Loader2 className="w-10 h-10 animate-spin text-pink-400" />
    </div>
  );
  if (!profile) return null;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a14, #0f0a1e, #140a14)' }}>
      {/* Header */}
      <div className="sticky top-0 z-50 px-4 py-3" style={{ background: 'rgba(10,10,20,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(190,24,93,0.2)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #be185d, #ec4899)' }}>
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Associate Dashboard</p>
              <p className="text-white/40 text-xs">{profile.shop_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={submitSOS}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}>
              <AlertTriangle className="w-3.5 h-3.5" />SOS
            </button>
            <button onClick={toggleOnlineStatus}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={isOnline
                ? { background: 'rgba(52,211,153,0.2)', border: '1px solid rgba(52,211,153,0.4)', color: '#34d399' }
                : { background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}>
              <Power className="w-3.5 h-3.5" />{isOnline ? 'Open' : 'Closed'}
            </button>
            <button onClick={() => { sessionStorage.removeItem('associate_session'); navigate('/'); }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Announcement */}
        {announcements.length > 0 && (
          <div className="rounded-2xl p-4 mb-5 flex items-start gap-3"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <Megaphone className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 font-semibold text-sm">{announcements[0].title}</p>
              <p className="text-amber-300/70 text-xs">{announcements[0].message}</p>
            </div>
          </div>
        )}

        {/* Hero */}
        <div className="rounded-3xl p-6 mb-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(190,24,93,0.3), rgba(124,58,237,0.2))', border: '1px solid rgba(190,24,93,0.3)' }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #be185d, transparent)' }} />
          <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: 'linear-gradient(135deg, #be185d, #ec4899)' }}>🏪</div>
              <div>
                <h1 className="text-white font-bold text-xl">{profile.shop_name}</h1>
                <p className="text-pink-300 text-sm">Owner: {profile.owner_name}</p>
                <p className="text-white/40 text-xs mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{profile.area}, {profile.city}
                </p>
              </div>
            </div>
          </div>
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
            {[
              { label: 'Total Bookings', value: bookings.length, icon: Package, color: 'from-rose-400 to-pink-500' },
              { label: 'Completed', value: completedBookings.length, icon: CheckCircle, color: 'from-emerald-400 to-teal-500' },
              { label: 'This Month', value: bookings.filter(b => new Date(b.created_at) > new Date(Date.now() - 30*86400000)).length, icon: Calendar, color: 'from-violet-400 to-purple-500' },
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'bookings', label: 'Bookings', icon: Package },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'profile', label: 'Profile', icon: Store },
            { id: 'support', label: 'Support', icon: MessageSquare },
            { id: 'settings', label: 'Settings', icon: Key },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id as any)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all"
              style={activeTab === id
                ? { background: 'linear-gradient(135deg, #be185d, #ec4899)', color: 'white' }
                : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-pink-400" />Recent Bookings</h3>
                {bookings.slice(0, 5).map(b => (
                  <div key={b.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-white text-sm font-medium">{b.name}</p>
                      <p className="text-white/40 text-xs">{b.service} • {new Date(b.preferred_date).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${b.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {b.status}
                    </span>
                  </div>
                ))}
                {bookings.length === 0 && <p className="text-white/30 text-sm text-center py-4">No bookings yet</p>}
              </div>

              {/* QR Scanner */}
              <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><QrCode className="w-4 h-4 text-pink-400" />QR Booking Verify</h3>
                <div className="space-y-3">
                  <input value={manualQr} onChange={e => setManualQr(e.target.value)} placeholder="Paste QR code / booking ID..."
                    className="w-full h-10 px-4 rounded-xl text-white placeholder:text-white/30 text-sm focus:outline-none font-mono"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
                  <button onClick={lookupQrCode}
                    className="w-full h-10 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #be185d, #ec4899)' }}>
                    <ScanLine className="w-4 h-4" />Verify Booking
                  </button>
                  {scanResult && (
                    <div className={`rounded-xl p-4 ${scanResult.found ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                      {scanResult.found ? (
                        <>
                          <p className="text-emerald-400 font-bold text-sm">✅ Valid Booking</p>
                          <p className="text-white text-sm mt-1">{scanResult.data.name}</p>
                          <p className="text-white/60 text-xs">{scanResult.data.service} • {new Date(scanResult.data.preferred_date).toLocaleDateString()}</p>
                          <p className="text-white/60 text-xs">{scanResult.data.preferred_time}</p>
                        </>
                      ) : <p className="text-red-400 font-bold text-sm">❌ Booking not found</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ background: isOnline ? 'rgba(52,211,153,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${isOnline ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-bold text-lg ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isOnline ? '🟢 Shop is Open' : '⭕ Shop is Closed'}
                  </h3>
                  <p className="text-white/40 text-sm">{isOnline ? 'Customers can find and book at your shop.' : 'Toggle on when your shop is open.'}</p>
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

        {/* Bookings */}
        {activeTab === 'bookings' && (
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <div className="rounded-2xl p-12 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/40">No bookings at your shop yet</p>
              </div>
            ) : bookings.map(b => (
              <div key={b.id} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-semibold">{b.name}</p>
                    <p className="text-white/50 text-sm">{b.service}</p>
                    <p className="text-white/30 text-xs">{new Date(b.preferred_date).toLocaleDateString()} at {b.preferred_time}</p>
                    <p className="text-white/40 text-xs">{b.phone}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${b.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : b.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {b.status.toUpperCase()}
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
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-pink-400" />Weekly Bookings</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analyticsData.weekly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(190,24,93,0.3)', borderRadius: 12 }} labelStyle={{ color: 'white' }} />
                  <Bar dataKey="count" name="Bookings" fill="url(#assocGrad)" radius={[6,6,0,0]} />
                  <defs>
                    <linearGradient id="assocGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#be185d" />
                      <stop offset="100%" stopColor="#ec4899" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-400" />Monthly Trend</h3>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={analyticsData.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1a1a2e', borderRadius: 12 }} labelStyle={{ color: 'white' }} />
                  <Line type="monotone" dataKey="count" stroke="#ec4899" strokeWidth={2.5} dot={{ fill: '#ec4899', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Profile */}
        {activeTab === 'profile' && (
          <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="text-white font-semibold mb-5 flex items-center gap-2"><Store className="w-5 h-5 text-pink-400" />Shop Profile</h3>
            <div className="space-y-3">
              {[
                { label: 'Shop Name', value: profile.shop_name },
                { label: 'Owner', value: profile.owner_name },
                { label: 'Email', value: profile.email },
                { label: 'Phone', value: profile.phone },
                { label: 'Address', value: profile.address },
                { label: 'Area', value: profile.area },
                { label: 'City', value: profile.city },
                { label: 'State', value: profile.state },
                { label: 'Rating', value: `${profile.rating?.toFixed(1) || '5.0'} / 5.0` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2.5 border-b border-white/5 last:border-0">
                  <span className="text-white/50 text-sm">{label}</span>
                  <span className="text-white text-sm font-semibold">{value || '—'}</span>
                </div>
              ))}
            </div>
            <p className="text-white/30 text-xs mt-4 text-center">Contact admin to update profile details.</p>
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-5">
            <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-white font-semibold mb-5 flex items-center gap-2"><Lock className="w-5 h-5 text-pink-400" />Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">New Password (min 6 chars)</label>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password"
                      className="w-full h-10 px-4 pr-10 rounded-xl text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
                    <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password"
                    className="w-full h-10 px-4 rounded-xl text-white placeholder:text-white/30 text-sm focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
                </div>
                <button onClick={changePassword} disabled={changingPassword}
                  className="w-full h-11 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #be185d, #ec4899)' }}>
                  {changingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Key className="w-4 h-4" />Update Password</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Support */}
        {activeTab === 'support' && (
          <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="text-white font-semibold mb-5 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-pink-400" />Support Ticket</h3>
            <div className="space-y-4">
              <input value={supportSubject} onChange={e => setSupportSubject(e.target.value)} placeholder="Subject"
                className="w-full h-10 px-4 rounded-xl text-white placeholder:text-white/30 text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
              <textarea value={supportMessage} onChange={e => setSupportMessage(e.target.value)} placeholder="Describe your issue..." rows={4}
                className="w-full px-4 py-3 rounded-xl text-white placeholder:text-white/30 text-sm focus:outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
              <button onClick={submitSupport} disabled={submittingSupport}
                className="w-full h-11 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #be185d, #ec4899)' }}>
                {submittingSupport ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Ticket'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
