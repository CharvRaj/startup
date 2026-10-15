import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, User, Star, Package, TrendingUp, Clock, MapPin, Phone, Mail,
  Loader2, CheckCircle, XCircle, Power, Award, Wallet, MessageSquare,
  BarChart3, Activity, FileText, Shield, RefreshCw, Download, Send, Edit, AlertTriangle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

type Tab = 'overview' | 'bookings' | 'earnings' | 'reviews' | 'attendance' | 'analytics' | 'tracking' | 'actions';

export function StylistProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stylist, setStylist] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [walletTxns, setWalletTxns] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<{ weekly: any[]; monthly: any[] }>({ weekly: [], monthly: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [editEarnings, setEditEarnings] = useState('');
  const [notifText, setNotifText] = useState('');
  const [sendingNotif, setSendingNotif] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    if (id) loadAll();
  }, [id]);

  const loadAll = async () => {
    setLoading(true);
    const { data: s } = await supabase.from('stylist_requests').select('*').eq('id', id).single();
    setStylist(s);
    setEditEarnings(String(s?.earnings || 0));

    // Fetch bookings assigned to this stylist
    const [dr, mr] = await Promise.all([
      supabase.from('doorstep_orders').select('*').eq('executive_id', id).order('created_at', { ascending: false }).limit(50),
      supabase.from('mehndi_orders').select('*').eq('executive_id', id).order('created_at', { ascending: false }).limit(50),
    ]);
    const allBookings = [
      ...(dr.data || []).map(o => ({ ...o, type: 'Doorstep' })),
      ...(mr.data || []).map(o => ({ ...o, type: 'Mehndi' })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setBookings(allBookings);

    const { data: att } = await supabase.from('attendance_logs').select('*').eq('stylist_id', id).order('timestamp', { ascending: false }).limit(30);
    setAttendanceLogs(att || []);

    const { data: comp } = await supabase.from('complaints').select('*').eq('against_id', id).order('created_at', { ascending: false });
    setComplaints(comp || []);

    buildAnalytics(allBookings);
    setLoading(false);
  };

  const buildAnalytics = (bks: any[]) => {
    const weekly: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      weekly[d.toLocaleDateString('en-IN', { weekday: 'short' })] = 0;
    }
    bks.forEach(b => {
      const k = new Date(b.created_at).toLocaleDateString('en-IN', { weekday: 'short' });
      if (weekly[k] !== undefined) weekly[k]++;
    });
    const monthly: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      monthly[d.toLocaleDateString('en-IN', { month: 'short' })] = 0;
    }
    bks.forEach(b => {
      const k = new Date(b.created_at).toLocaleDateString('en-IN', { month: 'short' });
      if (monthly[k] !== undefined) monthly[k]++;
    });
    setAnalyticsData({
      weekly: Object.entries(weekly).map(([day, count]) => ({ day, count })),
      monthly: Object.entries(monthly).map(([month, count]) => ({ month, count })),
    });
  };

  const toggleStatus = async () => {
    if (!stylist) return;
    const newStatus = !stylist.is_active;
    await supabase.from('stylist_requests').update({ is_active: newStatus }).eq('id', id);
    setStylist({ ...stylist, is_active: newStatus });
    toast({ title: newStatus ? '🟢 Stylist Online' : '⭕ Stylist Offline' });
  };

  const suspendAccount = async () => {
    if (!confirm('Suspend this stylist account?')) return;
    await supabase.from('stylist_requests').update({ is_active: false, status: 'suspended' }).eq('id', id);
    setStylist({ ...stylist, is_active: false, status: 'suspended' });
    toast({ title: '⛔ Stylist Suspended' });
  };

  const activateAccount = async () => {
    await supabase.from('stylist_requests').update({ status: 'approved', is_active: true }).eq('id', id);
    setStylist({ ...stylist, is_active: true, status: 'approved' });
    toast({ title: '✅ Account Activated' });
  };

  const updateEarnings = async () => {
    const val = parseFloat(editEarnings) || 0;
    await supabase.from('stylist_requests').update({ earnings: val }).eq('id', id);
    setStylist({ ...stylist, earnings: val });
    toast({ title: '✅ Earnings Updated' });
  };

  const sendNotification = async () => {
    if (!notifText.trim() || !stylist) return;
    setSendingNotif(true);
    // Insert notification linked to stylist user_id if present
    if (stylist.user_id) {
      await supabase.from('notifications').insert({
        user_id: stylist.user_id,
        title: '📢 Admin Notification',
        message: notifText,
        type: 'info',
      });
    }
    toast({ title: '✅ Notification Sent' });
    setNotifText('');
    setSendingNotif(false);
  };

  const completedJobs = bookings.filter(b => b.status === 'serviced' || b.status === 'completed').length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.total || 0), 0);
  const avgRating = stylist?.rating || 5.0;

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      serviced: 'bg-emerald-100 text-emerald-800', completed: 'bg-blue-100 text-blue-800',
      pending: 'bg-amber-100 text-amber-800', cancelled: 'bg-red-100 text-red-800',
      on_the_way: 'bg-indigo-100 text-indigo-800', arrived: 'bg-teal-100 text-teal-800',
    };
    return map[s] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-purple-50">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  );
  if (!stylist) return null;

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'bookings', label: 'Job History', icon: Package },
    { id: 'earnings', label: 'Earnings', icon: TrendingUp },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'tracking', label: 'Live Location', icon: MapPin },
    { id: 'actions', label: 'Admin Actions', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b shadow-sm">
        <div className="container-custom py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-1" />Admin
          </Button>
          <div className="flex items-center gap-3 ml-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>👩‍🎨</div>
            <div>
              <h1 className="font-bold text-lg">{stylist.full_name}</h1>
              <div className="flex items-center gap-2">
                <Badge className={`text-xs border ${stylist.is_active ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                  {stylist.is_active ? '🟢 Online' : '⭕ Offline'}
                </Badge>
                <Badge className={`text-xs border ${stylist.status === 'approved' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                  {stylist.status}
                </Badge>
              </div>
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <Button onClick={loadAll} variant="outline" size="sm"><RefreshCw className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>

      <div className="container-custom py-6 max-w-6xl">
        {/* Hero Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Jobs', value: bookings.length, icon: Package, color: 'from-violet-500 to-purple-600' },
            { label: 'Completed', value: completedJobs, icon: CheckCircle, color: 'from-emerald-500 to-teal-600' },
            { label: 'Rating', value: `${avgRating.toFixed(1)}★`, icon: Star, color: 'from-amber-500 to-yellow-600' },
            { label: 'Earnings', value: `₹${(stylist.earnings || 0).toLocaleString()}`, icon: TrendingUp, color: 'from-pink-500 to-rose-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="border-0 shadow-md overflow-hidden">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-2`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${activeTab === id ? 'bg-gradient-to-r from-primary to-pink-600 text-white shadow-md' : 'bg-white border border-border hover:bg-muted text-muted-foreground'}`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="card-luxury">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4 text-primary" />Personal Info</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  ['Full Name', stylist.full_name],
                  ['Email', stylist.email],
                  ['Phone', stylist.phone],
                  ['Specialization', stylist.specialization],
                  ['Experience', `${stylist.experience_years || 0} years`],
                  ['Status', stylist.status],
                  ['Applied On', new Date(stylist.created_at).toLocaleDateString('en-IN')],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
                    <span className="text-muted-foreground text-sm">{label}</span>
                    <span className="text-sm font-medium text-right max-w-[55%]">{value || '—'}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="w-4 h-4 text-primary" />Performance Summary</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Completion Rate', value: bookings.length ? `${Math.round(completedJobs / bookings.length * 100)}%` : 'N/A', color: 'text-emerald-600' },
                    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, color: 'text-primary' },
                    { label: 'Avg Rating', value: `${avgRating.toFixed(1)}/5.0`, color: 'text-amber-600' },
                    { label: 'Total Jobs', value: stylist.total_jobs || bookings.length, color: 'text-violet-600' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="p-3 bg-muted/40 rounded-xl">
                      <p className={`text-xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
                {stylist.bio && (
                  <div className="p-3 bg-muted/30 rounded-xl">
                    <p className="text-xs text-muted-foreground mb-1 font-semibold">Bio</p>
                    <p className="text-sm">{stylist.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Complaints */}
            {complaints.length > 0 && (
              <Card className="card-luxury col-span-full">
                <CardHeader><CardTitle className="text-base flex items-center gap-2 text-red-600"><AlertTriangle className="w-4 h-4" />Complaints ({complaints.length})</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {complaints.map(c => (
                      <div key={c.id} className="flex items-start justify-between p-3 bg-red-50 border border-red-100 rounded-xl">
                        <div>
                          <p className="font-semibold text-sm text-red-800">{c.category}</p>
                          <p className="text-xs text-red-600 mt-0.5">{c.description.slice(0, 100)}...</p>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(c.created_at).toLocaleDateString('en-IN')}</p>
                        </div>
                        <Badge className={`text-xs ${c.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{c.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Package className="w-5 h-5 text-primary" />Job History ({bookings.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-10"><Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No jobs assigned yet</p></div>
              ) : (
                <div className="space-y-3">
                  {bookings.map(b => (
                    <div key={b.id} className="border border-border rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm">#{b.order_number}</p>
                            <Badge className={`text-xs ${statusColor(b.status)}`}>{b.status.replace(/_/g, ' ').toUpperCase()}</Badge>
                            <Badge variant="outline" className={`text-xs ${b.type === 'Mehndi' ? 'border-rose-300 text-rose-700' : 'border-teal-300 text-teal-700'}`}>{b.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{b.customer_name} • {b.customer_phone}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{b.address?.slice(0, 60)}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-primary">₹{b.total}</p>
                          <p className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString('en-IN')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* EARNINGS TAB */}
        {activeTab === 'earnings' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Total Earnings', value: `₹${(stylist.earnings || 0).toLocaleString()}`, color: 'from-emerald-500 to-teal-600' },
                { label: 'Jobs Revenue', value: `₹${totalRevenue.toLocaleString()}`, color: 'from-violet-500 to-purple-600' },
                { label: 'Pending', value: `₹${Math.max(0, totalRevenue - (stylist.earnings || 0)).toLocaleString()}`, color: 'from-amber-500 to-yellow-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`p-5 rounded-2xl bg-gradient-to-br ${color} text-white`}>
                  <p className="text-white/70 text-sm mb-1">{label}</p>
                  <p className="text-3xl font-black">{value}</p>
                </div>
              ))}
            </div>
            <Card className="card-luxury">
              <CardHeader><CardTitle className="text-base">Update Earnings</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input type="number" placeholder="Enter earnings amount" value={editEarnings} onChange={e => setEditEarnings(e.target.value)} className="flex-1" />
                  <Button onClick={updateEarnings} className="bg-emerald-600 hover:bg-emerald-700">Update</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <Card className="card-luxury">
            <CardHeader><CardTitle className="flex items-center gap-2"><Star className="w-5 h-5 text-amber-500" />Reviews & Ratings</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 p-5 bg-amber-50 rounded-2xl mb-5">
                <div className="text-center">
                  <p className="text-5xl font-black text-amber-500">{avgRating.toFixed(1)}</p>
                  <div className="flex gap-0.5 mt-1 justify-center">
                    {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Average Rating</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Total Jobs: <span className="font-bold text-foreground">{stylist.total_jobs || bookings.length}</span></p>
                  <p className="text-sm text-muted-foreground mt-1">Completed: <span className="font-bold text-emerald-600">{completedJobs}</span></p>
                </div>
              </div>
              {reviews.length === 0 && (
                <div className="text-center py-8"><Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground text-sm">No reviews yet for this stylist</p></div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <Card className="card-luxury">
            <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-primary" />Attendance Logs</CardTitle></CardHeader>
            <CardContent>
              {attendanceLogs.length === 0 ? (
                <div className="text-center py-10"><Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No attendance logs yet</p></div>
              ) : (
                <div className="space-y-2">
                  {attendanceLogs.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${log.action === 'online' || log.action === 'login' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                        <span className={`font-semibold text-sm capitalize ${log.action === 'online' || log.action === 'login' ? 'text-emerald-700' : 'text-red-600'}`}>{log.action}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{new Date(log.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-5">
            <Card className="card-luxury">
              <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" />Weekly Job Activity</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analyticsData.weekly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#888' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#888' }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="count" name="Jobs" fill="url(#stylistGrad)" radius={[6,6,0,0]} />
                    <defs>
                      <linearGradient id="stylistGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity={0.5} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="card-luxury">
              <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-500" />Monthly Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={analyticsData.monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#888' }} />
                    <Tooltip contentStyle={{ borderRadius: 12 }} />
                    <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2.5} dot={{ fill: '#7c3aed', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* LIVE TRACKING TAB */}
        {activeTab === 'tracking' && (
          <Card className="card-luxury">
            <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" />Live Location Tracking</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  {[
                    ['Online Status', stylist.is_active ? '🟢 Online' : '⭕ Offline'],
                    ['Last Location Update', stylist.last_location_update ? new Date(stylist.last_location_update).toLocaleString('en-IN') : 'Not available'],
                    ['Latitude', stylist.latitude || 'N/A'],
                    ['Longitude', stylist.longitude || 'N/A'],
                  ].map(([label, value]) => (
                    <div key={label as string} className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground text-sm">{label}</span>
                      <span className="font-medium text-sm">{value}</span>
                    </div>
                  ))}
                  {stylist.latitude && stylist.longitude && (
                    <a href={`https://maps.google.com/?q=${stylist.latitude},${stylist.longitude}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white w-full justify-center"
                      style={{ background: 'linear-gradient(135deg, #be185d, #ec4899)' }}>
                      <MapPin className="w-4 h-4" />View on Google Maps
                    </a>
                  )}
                </div>
                <div className="bg-muted/30 rounded-2xl flex items-center justify-center min-h-[200px]">
                  {stylist.latitude ? (
                    <p className="text-sm text-muted-foreground text-center">
                      <MapPin className="w-8 h-8 mx-auto mb-2 text-primary" />
                      📍 {stylist.latitude.toFixed(4)}, {stylist.longitude?.toFixed(4)}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center p-6">
                      <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                      Location not available.<br />Stylist needs to share location from their dashboard.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ADMIN ACTIONS TAB */}
        {activeTab === 'actions' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Account Controls */}
              <Card className="card-luxury">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />Account Controls</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={toggleStatus} className={`w-full gap-2 ${stylist.is_active ? 'bg-gray-500 hover:bg-gray-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                    <Power className="w-4 h-4" />{stylist.is_active ? 'Set Offline' : 'Set Online'}
                  </Button>
                  {stylist.status !== 'suspended' ? (
                    <Button onClick={suspendAccount} variant="destructive" className="w-full gap-2">
                      <XCircle className="w-4 h-4" />Suspend Account
                    </Button>
                  ) : (
                    <Button onClick={activateAccount} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle className="w-4 h-4" />Activate Account
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Send Notification */}
              <Card className="card-luxury">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary" />Send Notification</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <textarea value={notifText} onChange={e => setNotifText(e.target.value)} placeholder="Message to stylist..."
                    rows={3} className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none resize-none" />
                  <Button onClick={sendNotification} disabled={sendingNotif || !notifText.trim()} className="btn-primary w-full gap-2">
                    {sendingNotif ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}Send
                  </Button>
                </CardContent>
              </Card>

              {/* Login Credentials */}
              <Card className="card-luxury">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />Login Credentials</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {[
                    ['Login Email', stylist.approved_email || 'Not Set'],
                    ['Login Password', stylist.approved_password || 'Not Set'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground text-sm">{label}</span>
                      <span className="font-mono text-sm">{value}</span>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">Share credentials with the stylist via email or phone.</p>
                </CardContent>
              </Card>

              {/* Admin Note */}
              <Card className="card-luxury">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Edit className="w-4 h-4 text-primary" />Admin Note</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Add internal note..."
                    rows={3} className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none resize-none" />
                  <Button onClick={() => toast({ title: 'Note saved (local only)' })} variant="outline" className="w-full">Save Note</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
