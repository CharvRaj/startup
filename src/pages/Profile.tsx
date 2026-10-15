import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles, User, Mail, Calendar, LogOut, Loader2, X, CheckCircle, Edit2,
  Upload, Star, MessageSquare, Clock, TrendingUp, ShoppingBag, Package,
  Truck, MapPin, Gift, Award, Navigation, QrCode, Download, FileText,
  Zap, Crown, Wallet, ArrowUpRight, ArrowDownLeft, HelpCircle, Send,
  RefreshCw, AlertTriangle, Scissors, Droplets, Sun, Heart, ChevronLeft,
  ChevronRight, Headphones, Copy, Home, Bell, Search, ChevronDown, Settings,
  CheckCircle2, Plus, ShieldCheck, Filter
} from 'lucide-react';
import { Chat } from '@/components/Chat';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import type { Booking, Review, DoorstepOrder, LoyaltyPoints } from '@/types';
import { queryTicketService, QueryTicket, AttachedBookingInfo } from '@/lib/queryTicketService';
import { RaiseQueryModal } from '@/components/query/RaiseQueryModal';
import { UserTicketDetailsModal } from '@/components/query/UserTicketDetailsModal';
import { UserDashboardOverview } from '@/components/dashboard/UserDashboardOverview';
import { GuidedBookingModal } from '@/components/dashboard/GuidedBookingModal';
import { AddMoneyModal } from '@/components/dashboard/AddMoneyModal';

const DEFAULT_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia&hair=long01&hairColor=4a312c',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella&hair=long02&hairColor=724133',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&hair=long03&hairColor=f59797',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia&hair=long04&hairColor=d6b370',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ava&hair=long05&hairColor=2c1b18',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia&hair=long06&hairColor=724133',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Amelia&hair=long07&hairColor=4a312c',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Harper&hair=long08&hairColor=d6b370',
];

export function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout, login } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    'home' | 'bookings' | 'home-services' | 'orders' | 'reviews' | 'loyalty' | 'wallet' | 'beauty' | 'settings' | 'support' | 'queries'
  >('home');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [addMoneyModalOpen, setAddMoneyModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [bookingTabFilter, setBookingTabFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<DoorstepOrder[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyPoints | null>(null);
  const [activeMembership, setActiveMembership] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletTransactions, setWalletTransactions] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [userQueryTickets, setUserQueryTickets] = useState<QueryTicket[]>([]);
  const [raiseQueryModalOpen, setRaiseQueryModalOpen] = useState(false);
  const [queryBookingContext, setQueryBookingContext] = useState<AttachedBookingInfo | null>(null);
  const [activeTicketDetail, setActiveTicketDetail] = useState<QueryTicket | null>(null);
  const [ticketDetailModalOpen, setTicketDetailModalOpen] = useState(false);
  const [queryFilterView, setQueryFilterView] = useState<'active' | 'past' | 'all'>('active');
  const [selectedQueryMonth, setSelectedQueryMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [chatOrder, setChatOrder] = useState<{ id: string; type: any; exec?: string; execId?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  // Reschedule state
  const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduling, setRescheduling] = useState(false);
  // Beauty profile state
  const [beautyProfile, setBeautyProfile] = useState<any>({});
  const [savingBeauty, setSavingBeauty] = useState(false);
  const [aiRecs, setAiRecs] = useState<any>(null);
  const [loadingAiRecs, setLoadingAiRecs] = useState(false);

  const [reviewComment, setReviewComment] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setNewUsername(user.username);
    fetchAllData();
    fetchBeautyProfile();
  }, [user, navigate]);

  const fetchBeautyProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from('user_profiles').select('hair_type,hair_concerns,hair_texture,hair_length,scalp_type,skin_type,skin_concerns,skin_sensitivity,skin_color,age_group,gender,ai_recommendations,full_name,phone').eq('id', user.id).single();
    if (data) {
      setBeautyProfile(data);
      if (data.ai_recommendations && Object.keys(data.ai_recommendations).length > 0) {
        setAiRecs(data.ai_recommendations);
      }
    }
  };

  const saveBeautyProfile = async () => {
    if (!user) return;
    setSavingBeauty(true);
    const { error } = await supabase.from('user_profiles').update({
      ...beautyProfile,
      beauty_profile_updated_at: new Date().toISOString(),
    }).eq('id', user.id);
    if (error) { toast({ title: 'Error saving', description: error.message, variant: 'destructive' }); }
    else { toast({ title: '✅ Beauty Profile Saved!' }); fetchAiRecommendations(); }
    setSavingBeauty(false);
  };

  const fetchAiRecommendations = async () => {
    if (!user) return;
    setLoadingAiRecs(true);
    try {
      const { data, error } = await supabase.functions.invoke('beauty-ai', { body: { beautyProfile } });
      if (error) throw error;
      if (data?.recommendations) {
        setAiRecs(data);
        await supabase.from('user_profiles').update({ ai_recommendations: data }).eq('id', user.id);
      }
    } catch (e) { console.error('AI recs:', e); }
    setLoadingAiRecs(false);
  };

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime || !rescheduleBookingId) {
      toast({ title: 'Select date and time', variant: 'destructive' }); return;
    }
    setRescheduling(true);
    const { error } = await supabase.from('bookings').update({
      preferred_date: rescheduleDate,
      preferred_time: rescheduleTime,
      status: 'pending',
    }).eq('id', rescheduleBookingId).eq('user_id', user?.id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
    else {
      // Notify admin
      await supabase.from('notifications').insert({
        user_id: user!.id,
        title: '📅 Booking Rescheduled',
        message: `Your booking has been rescheduled to ${new Date(rescheduleDate).toLocaleDateString('en-IN')} at ${rescheduleTime}.`,
        type: 'booking', link: '/profile',
      });
      toast({ title: '✅ Booking Rescheduled!', description: `New date: ${new Date(rescheduleDate).toLocaleDateString('en-IN')} at ${rescheduleTime}` });
      setRescheduleBookingId(null); setRescheduleDate(''); setRescheduleTime('');
      fetchBookings();
    }
    setRescheduling(false);
  };

  const fetchAllData = async () => {
    await Promise.all([fetchBookings(), fetchOrders(), fetchMyReviews(), fetchLoyaltyPoints(), fetchActiveMembership(), fetchWallet(), fetchSupportTickets()]);
    setLoading(false);
    // Schedule 24hr reminders after data loads
    checkAndSendReminders();
  };

  const checkAndSendReminders = async () => {
    if (!user) return;
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      // Find confirmed bookings tomorrow that haven't had a reminder sent
      const { data: upcomingBookings } = await supabase
        .from('bookings')
        .select('id, service, preferred_date, preferred_time')
        .eq('user_id', user.id)
        .eq('preferred_date', tomorrowStr)
        .eq('status', 'confirmed')
        .eq('sent_reminder', false);
      if (upcomingBookings && upcomingBookings.length > 0) {
        for (const booking of upcomingBookings) {
          await supabase.from('notifications').insert({
            user_id: user.id,
            title: '⏰ Booking Reminder - Tomorrow!',
            message: `Your ${booking.service} appointment is tomorrow at ${booking.preferred_time}. Don't forget!`,
            type: 'booking',
            link: '/profile',
          });
          await supabase.from('bookings').update({ sent_reminder: true }).eq('id', booking.id);
        }
      }
    } catch (e) { console.error('reminder:', e); }
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase.from('bookings').select('*').eq('user_id', user?.id).order('created_at', { ascending: false });
      if (error) throw error;
      setBookings(data || []);
    } catch (e: any) { console.error('bookings:', e); }
  };

  const fetchOrders = async () => {
    try {
      const [dr, mr] = await Promise.all([
        supabase.from('doorstep_orders').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }),
        supabase.from('mehndi_orders').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }),
      ]);
      const allOrders = [
        ...(dr.data || []).map(o => ({ ...o, order_type: 'doorstep' })),
        ...(mr.data || []).map(o => ({ ...o, order_type: 'mehndi' })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setOrders(allOrders as any);
    } catch (e: any) { console.error('orders:', e); }
  };

  const fetchMyReviews = async () => {
    try {
      const { data, error } = await supabase.from('reviews').select('*').eq('user_id', user?.id).order('created_at', { ascending: false });
      if (error) throw error;
      setMyReviews(data || []);
    } catch (e: any) { console.error('reviews:', e); }
  };

  const fetchLoyaltyPoints = async () => {
    try {
      const { data, error } = await supabase.from('loyalty_points').select('*').eq('user_id', user?.id).single();
      if (error && error.code !== 'PGRST116') throw error;
      setLoyaltyData(data || { points: 0, lifetime_points: 0, tier: 'bronze' } as any);
    } catch (e: any) { console.error('loyalty:', e); }
  };

  const fetchWallet = async () => {
    try {
      const localBal = localStorage.getItem(`satguru_wallet_balance_${user?.id}`);
      const localTxStr = localStorage.getItem(`satguru_wallet_transactions_${user?.id}`);
      let localTxns: any[] = [];
      if (localTxStr) {
        try {
          localTxns = JSON.parse(localTxStr);
        } catch {}
      }

      // 1. Fetch balance from Supabase or fallback to local
      try {
        const { data: profile } = await supabase.from('user_profiles').select('wallet_balance').eq('id', user!.id).single();
        if (profile && typeof profile.wallet_balance === 'number') {
          setWalletBalance(profile.wallet_balance);
        } else if (localBal !== null) {
          setWalletBalance(Number(localBal));
        } else {
          setWalletBalance(profile?.wallet_balance || 0);
        }
      } catch {
        if (localBal !== null) {
          setWalletBalance(Number(localBal));
        }
      }

      // 2. Fetch Supabase transactions
      let dbTxns: any[] = [];
      try {
        const { data: txns, error } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(50);
        if (!error && txns) {
          dbTxns = txns;
        }
      } catch (e) {
        console.warn('DB wallet_transactions fetch error:', e);
      }

      // 3. Deduplicate and merge local + db transactions
      const seen = new Set<string>();
      const merged: any[] = [];
      for (const t of [...localTxns, ...dbTxns]) {
        const key = t.reference_id || t.id;
        if (key && !seen.has(key)) {
          seen.add(key);
          merged.push(t);
        } else if (!key) {
          merged.push(t);
        }
      }
      merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setWalletTransactions(merged);
    } catch (e) {
      console.error('wallet error:', e);
      const localBal = localStorage.getItem(`satguru_wallet_balance_${user?.id}`);
      if (localBal !== null) {
        setWalletBalance(Number(localBal));
      }
      const localTxStr = localStorage.getItem(`satguru_wallet_transactions_${user?.id}`);
      if (localTxStr) {
        try {
          setWalletTransactions(JSON.parse(localTxStr));
        } catch {}
      }
    }
  };

  const fetchSupportTickets = async () => {
    try {
      const { data } = await supabase.from('support_tickets').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
      setSupportTickets(data || []);
      fetchUserQueryTickets();
    } catch (e) { console.error('tickets:', e); }
  };

  const fetchUserQueryTickets = () => {
    if (!user) return;
    const tickets = queryTicketService.getUserTickets(user.id, user.email);
    setUserQueryTickets(tickets);
  };

  useEffect(() => {
    if (user) {
      fetchUserQueryTickets();
      const handleSync = () => fetchUserQueryTickets();
      window.addEventListener('satguru:tickets_updated', handleSync);

      const handleWalletSync = () => fetchWallet();
      window.addEventListener('satguru:wallet_updated', handleWalletSync);

      return () => {
        window.removeEventListener('satguru:tickets_updated', handleSync);
        window.removeEventListener('satguru:wallet_updated', handleWalletSync);
      };
    }
  }, [user]);

  // 15-day policy helper: calculate difference in days
  const isWithin15Days = (dateStrOrTimestamp: string | number) => {
    const targetDate = new Date(dateStrOrTimestamp).getTime();
    if (isNaN(targetDate)) return true;
    const diffDays = (Date.now() - targetDate) / (1000 * 60 * 60 * 24);
    return diffDays <= 15;
  };

  const handleOpenRaiseQueryForBooking = (booking: Booking) => {
    // 15-Day Limit Check
    const bookingTime = booking.preferred_date || booking.created_at;
    if (!isWithin15Days(bookingTime)) {
      toast({
        title: 'Support Window Closed',
        description: 'Tickets can only be raised for bookings scheduled or completed within the last 15 days.',
        variant: 'destructive',
      });
      return;
    }

    // Direct user to Help & Support Desk with booking details automatically pre-filled
    navigate('/help-support', {
      state: {
        booking,
        bookingId: booking.id,
        serviceName: booking.service.replace('-', ' '),
        serviceDate: booking.preferred_date,
        serviceTime: booking.preferred_time,
        currentStatus: booking.status,
        stylistName: booking.stylist_name,
        stylistPhone: (booking as any).stylist_phone,
        type: 'salon_booking',
        autoFocusForm: true,
      },
    });
  };

  const handleOpenRaiseQueryForOrder = (order: DoorstepOrder) => {
    // 15-Day Limit Check
    if (!isWithin15Days(order.created_at)) {
      toast({
        title: 'Support Window Closed',
        description: 'Tickets can only be raised for orders placed within the last 15 days.',
        variant: 'destructive',
      });
      return;
    }

    const serviceNames = Array.isArray(order.services)
      ? order.services.map((s: any) => s.name).join(', ')
      : 'Doorstep Service';

    // Direct user to Help & Support Desk with order details automatically pre-filled
    navigate('/help-support', {
      state: {
        order,
        orderId: (order as any).order_number || order.id,
        type: (order as any).order_type === 'mehndi' ? 'mehndi_order' : 'doorstep_order',
        serviceName: serviceNames,
        serviceDate: new Date(order.created_at).toLocaleDateString('en-IN'),
        totalAmount: order.total,
        currentStatus: order.status,
        stylistName: (order as any).executive_name,
        stylistPhone: (order as any).executive_phone,
        customerAddress: order.address,
        autoFocusForm: true,
      },
    });
  };

  const handleOpenGeneralQuery = () => {
    navigate('/help-support');
  };

  const submitSupportTicket = async () => {
    if (!newTicketSubject.trim() || !newTicketMessage.trim()) {
      toast({ title: 'Fill subject and message', variant: 'destructive' });
      return;
    }
    setSubmittingTicket(true);
    try {
      const ticket = await queryTicketService.createTicket({
        user_id: user?.id || `user-${Date.now()}`,
        customer_name: user?.username || 'Client',
        customer_email: user?.email || 'customer@satgurumakeup.com',
        customer_phone: user?.phone,
        category: 'General Support',
        subject: newTicketSubject.trim(),
        description: newTicketMessage.trim(),
        priority: 'normal',
      });

      toast({
        title: '✅ Ticket Submitted Successfully!',
        description: `Ticket #${ticket.ticket_number} created. Thanks for contacting us, we will provide a solution as soon as possible (within 2–4 hours).`,
      });
      setNewTicketSubject('');
      setNewTicketMessage('');
      fetchSupportTickets();
      const updatedTickets = queryTicketService.getUserTickets(user?.id, user?.email);
      setUserQueryTickets(updatedTickets);
    } catch (error: any) {
      toast({ title: 'Error submitting ticket', description: error.message, variant: 'destructive' });
    } finally {
      setSubmittingTicket(false);
    }
  };

  const fetchActiveMembership = async () => {
    try {
      const { data } = await supabase.from('user_memberships')
        .select('*, membership_plans(name, tier, discount_percentage, benefits)')
        .eq('user_id', user!.id).eq('active', true)
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false }).limit(1).maybeSingle();
      setActiveMembership(data || null);
    } catch { setActiveMembership(null); }
  };

  // ── Generate Invoice PDF (using print) ──────────────────────────────────────
  const generateInvoice = (booking: Booking) => {
    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${booking.service}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; color: #1a0a12; background: #fff; padding: 40px; }
    .header { background: linear-gradient(135deg, #be185d, #ec4899); color: white; padding: 30px; border-radius: 16px; margin-bottom: 30px; }
    .header h1 { font-size: 28px; font-weight: 700; }
    .header p { opacity: 0.85; font-size: 13px; margin-top: 4px; }
    .invoice-id { background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 20px; font-size: 12px; margin-top: 8px; display: inline-block; }
    .section { margin-bottom: 24px; }
    .section h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #be185d; margin-bottom: 12px; font-weight: 700; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .info-box { background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 12px; padding: 16px; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.06); font-size: 14px; }
    .info-row:last-child { border-bottom: none; }
    .label { color: #6b7280; }
    .value { font-weight: 600; }
    .status { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .status.confirmed, .status.completed { background: #d1fae5; color: #065f46; }
    .status.pending { background: #fef3c7; color: #92400e; }
    .status.cancelled { background: #fee2e2; color: #991b1b; }
    .total-box { background: linear-gradient(135deg, #fdf2f8, #ffe4f0); border: 2px solid #fbcfe8; border-radius: 16px; padding: 20px; text-align: center; }
    .total-label { color: #be185d; font-size: 13px; font-weight: 600; }
    .total-amount { font-size: 36px; font-weight: 800; color: #be185d; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; }
    .qr-section { text-align: center; padding: 20px; background: #fdf2f8; border-radius: 12px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>✨ Satguru Makeup Art</h1>
    <p>Near Bijli Ghar Rd, Rori Bazar, Singhana, Rajasthan - 333516</p>
    <div class="invoice-id">Invoice #${booking.id.slice(0, 8).toUpperCase()}</div>
  </div>

  <div class="grid-2 section">
    <div class="info-box">
      <h3>Customer Details</h3>
      <div class="info-row"><span class="label">Name</span><span class="value">${booking.name}</span></div>
      <div class="info-row"><span class="label">Email</span><span class="value">${booking.email}</span></div>
      <div class="info-row"><span class="label">Phone</span><span class="value">${booking.phone}</span></div>
    </div>
    <div class="info-box">
      <h3>Appointment Details</h3>
      <div class="info-row"><span class="label">Service</span><span class="value">${booking.service}</span></div>
      <div class="info-row"><span class="label">Date</span><span class="value">${new Date(booking.preferred_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
      <div class="info-row"><span class="label">Time</span><span class="value">${booking.preferred_time}</span></div>
      <div class="info-row"><span class="label">Status</span><span class="value"><span class="status ${booking.status}">${booking.status.toUpperCase()}</span></span></div>
    </div>
  </div>

  ${booking.message ? `<div class="section info-box"><h3>Notes</h3><p style="font-size:14px; color:#4b5563; margin-top:8px">${booking.message}</p></div>` : ''}

  <div class="section">
    <div class="info-box">
      <h3>Billing Summary</h3>
      <div class="info-row"><span class="label">Service</span><span class="value">${booking.service}</span></div>
      <div class="info-row"><span class="label">Booked On</span><span class="value">${new Date(booking.created_at).toLocaleDateString('en-IN')}</span></div>
      <div class="info-row"><span class="label">Payment Mode</span><span class="value">Pay at Salon</span></div>
    </div>
  </div>

  <div class="footer">
    <p>Thank you for choosing Satguru Makeup Art! ✨</p>
    <p style="margin-top: 6px;">For queries: satgurumakeupart@gmail.com</p>
    <p style="margin-top: 4px; font-size: 10px;">This is a computer-generated invoice. No signature required.</p>
  </div>
</body>
</html>`;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(invoiceHTML);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 500);
    }
  };

  const generateOrderInvoice = (order: any) => {
    const servicesHTML = (order.services || []).map((s: any) =>
      `<div class="info-row"><span class="label">${s.name} × ${s.quantity}</span><span class="value">₹${s.price * s.quantity}</span></div>`
    ).join('');

    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Order Invoice #${order.order_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; color: #1a0a12; background: #fff; padding: 40px; }
    .header { background: linear-gradient(135deg, #7c3aed, #be185d); color: white; padding: 30px; border-radius: 16px; margin-bottom: 30px; }
    .header h1 { font-size: 28px; font-weight: 700; }
    .header p { opacity: 0.85; font-size: 13px; margin-top: 4px; }
    .invoice-id { background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 20px; font-size: 12px; margin-top: 8px; display: inline-block; }
    .section { margin-bottom: 24px; }
    .section h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #7c3aed; margin-bottom: 12px; font-weight: 700; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .info-box { background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 16px; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.06); font-size: 14px; }
    .info-row:last-child { border-bottom: none; }
    .label { color: #6b7280; }
    .value { font-weight: 600; }
    .total-row { font-size: 16px; font-weight: 800; color: #7c3aed; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>✨ Satguru Makeup Art</h1>
    <p>Near Bijli Ghar Rd, Rori Bazar, Singhana, Rajasthan - 333516</p>
    <div class="invoice-id">Order #${order.order_number}</div>
  </div>

  <div class="grid-2 section">
    <div class="info-box">
      <h3>Customer</h3>
      <div class="info-row"><span class="label">Name</span><span class="value">${order.customer_name}</span></div>
      <div class="info-row"><span class="label">Phone</span><span class="value">${order.customer_phone}</span></div>
      <div class="info-row"><span class="label">Address</span><span class="value" style="max-width:160px;text-align:right">${order.address}</span></div>
    </div>
    <div class="info-box">
      <h3>Order Info</h3>
      <div class="info-row"><span class="label">Type</span><span class="value">${order.order_type === 'mehndi' ? '🎨 Mehndi' : '🏠 Doorstep'}</span></div>
      <div class="info-row"><span class="label">Status</span><span class="value">${order.status.replace(/_/g,' ').toUpperCase()}</span></div>
      <div class="info-row"><span class="label">Payment</span><span class="value">${order.payment_method === 'pay_later' ? 'Pay on Service' : 'Paid Online'}</span></div>
      <div class="info-row"><span class="label">Ordered</span><span class="value">${new Date(order.created_at).toLocaleDateString('en-IN')}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="info-box">
      <h3>Services</h3>
      ${servicesHTML}
      ${order.discount > 0 ? `<div class="info-row" style="color:#059669"><span class="label">Discount Applied</span><span class="value">- ₹${order.discount}</span></div>` : ''}
      <div class="info-row total-row"><span class="label">TOTAL</span><span class="value">₹${order.total}</span></div>
    </div>
  </div>

  ${order.executive_name ? `<div class="section info-box"><h3>Executive Details</h3><div class="info-row"><span class="label">Name</span><span class="value">${order.executive_name}</span></div><div class="info-row"><span class="label">Phone</span><span class="value">${order.executive_phone}</span></div></div>` : ''}

  <div class="footer">
    <p>Thank you for choosing Satguru Makeup Art! ✨</p>
    <p style="margin-top: 6px;">For queries: satgurumakeupart@gmail.com</p>
    <p style="margin-top: 4px; font-size: 10px;">This is a computer-generated invoice. No signature required.</p>
  </div>
</body>
</html>`;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(invoiceHTML);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 500);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId).eq('user_id', user?.id);
      if (error) throw error;
      toast({ title: 'Booking Cancelled' });
      fetchBookings();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewBookingId || !reviewComment.trim()) {
      toast({ title: 'Error', description: 'Please provide a comment', variant: 'destructive' });
      return;
    }
    setSubmittingReview(true);
    try {
      const booking = bookings.find(b => b.id === reviewBookingId);
      const { error } = await supabase.from('reviews').insert({ user_id: user?.id, booking_id: reviewBookingId, rating: reviewRating, comment: reviewComment, service: booking?.service || 'General Service' });
      if (error) throw error;
      await supabase.from('bookings').update({ review_submitted: true }).eq('id', reviewBookingId);
      const points = 10;
      if (loyaltyData) {
        await supabase.from('loyalty_points').update({ points: (loyaltyData.points || 0) + points, lifetime_points: (loyaltyData.lifetime_points || 0) + points }).eq('user_id', user!.id);
        await supabase.from('loyalty_transactions').insert({ user_id: user!.id, points, type: 'earned', reason: 'Review submitted', reference_id: reviewBookingId });
      }
      toast({ title: 'Review Submitted! ✨', description: `+${points} loyalty points earned!` });
      setReviewBookingId(null); setReviewRating(5); setReviewComment('');
      fetchAllData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally { setSubmittingReview(false); }
  };

  const handleUpdateProfile = async () => {
    try {
      setEditingProfile(true);
      const updates: any = {};
      if (newUsername && newUsername !== user?.username) updates.username = newUsername;
      if (selectedAvatar) updates.avatar = selectedAvatar;
      if (Object.keys(updates).length === 0) { toast({ title: 'No changes' }); setEditingProfile(false); return; }
      const { data, error } = await supabase.auth.updateUser({ data: updates });
      if (error) throw error;
      if (data.user) login({ id: data.user.id, email: data.user.email!, username: data.user.user_metadata.username || user!.username, avatar: data.user.user_metadata.avatar });
      toast({ title: 'Profile Updated ✅' });
      setSelectedAvatar(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally { setEditingProfile(false); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({ title: 'Invalid File', description: 'JPG, PNG, or WebP only', variant: 'destructive' }); e.target.value = ''; return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File Too Large', description: 'Max 5MB', variant: 'destructive' }); e.target.value = ''; return;
    }
    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `avatars/${user?.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('gallery').upload(filePath, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(filePath);
      setSelectedAvatar(publicUrl);
      toast({ title: 'Avatar Uploaded', description: 'Click Save Changes' });
    } catch (error: any) {
      toast({ title: 'Upload Failed', description: error.message, variant: 'destructive' });
    } finally { setUploadingAvatar(false); e.target.value = ''; }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut(); logout(); navigate('/');
      toast({ title: 'Logged out successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': case 'paid': case 'serviced': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled': case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'executive_assigned': case 'on_the_way': case 'arrived': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTierInfo = (tier: string) => {
    const tiers: Record<string, { color: string; gradient: string; icon: string; next?: string; nextPts?: number }> = {
      bronze: { color: 'text-orange-700', gradient: 'from-orange-400 to-amber-500', icon: '🥉', next: 'Silver', nextPts: 500 },
      silver: { color: 'text-gray-600', gradient: 'from-gray-400 to-slate-500', icon: '🥈', next: 'Gold', nextPts: 1000 },
      gold: { color: 'text-yellow-700', gradient: 'from-yellow-400 to-amber-500', icon: '🥇', next: 'Platinum', nextPts: 2000 },
      platinum: { color: 'text-purple-700', gradient: 'from-purple-400 to-violet-500', icon: '💎' },
    };
    return tiers[tier] || tiers.bronze;
  };

  if (!user) return null;

  const displayName = user.username || 'Charv Raj';
  const firstName = displayName.split(' ')[0] || 'Charv';

  return (
    <div className="min-h-screen bg-[#FFF9F3] text-foreground flex flex-col lg:flex-row antialiased font-sans">
      {/* ── LEFT LUXURY SIDEBAR ── */}
      <aside
        className={`bg-white border-r border-[#F8DCE4] flex-shrink-0 transition-all duration-300 flex flex-col justify-between z-30 lg:sticky lg:top-0 lg:h-screen ${
          isSidebarCollapsed ? 'w-20' : 'w-full lg:w-[275px]'
        }`}
      >
        <div className="p-5 flex-1 flex flex-col overflow-y-auto">
          {/* Logo & Branding matching Screenshot */}
          <div className="flex items-center justify-between pb-6 mb-4 border-b border-[#F8DCE4]/60">
            <Link to="/" className="flex items-center gap-3 group">
              {/* Lotus Icon */}
              <div className="w-10 h-10 rounded-2xl bg-[#FDF0F4] border border-[#F8DCE4] text-[#D81B60] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3c-1.5 3-4 6-4 9a4 4 0 0 0 8 0c0-3-2.5-6-4-9Z" />
                  <path d="M12 12c-2.5-2-6-3-8-1 0 4 3 7 8 8" />
                  <path d="M12 12c2.5-2 6-3 8-1 0 4-3 7-8 8" />
                  <path d="M12 17v4" />
                </svg>
              </div>

              {!isSidebarCollapsed && (
                <div>
                  <div className="font-serif font-bold text-sm tracking-wider text-[#43152E] leading-tight">
                    SATGURU
                  </div>
                  <div className="text-[8px] uppercase tracking-widest text-[#B55B33] font-semibold">
                    HERBAL BEAUTY PARLOUR
                  </div>
                </div>
              )}
            </Link>

            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1 rounded-xl text-muted-foreground hover:text-foreground hidden lg:block"
              title={isSidebarCollapsed ? 'Expand' : 'Collapse'}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4 text-[#D81B60]" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 flex-1">
            {[
              { id: 'home', label: 'Dashboard', icon: Home, badge: null },
              { id: 'bookings', label: 'Appointments', icon: Calendar, badge: bookings.length > 0 ? bookings.length : null },
              { id: 'home-services', label: 'Home Services', icon: Home, badge: orders.length > 0 ? orders.length : null },
              { id: 'loyalty', label: 'Rewards', icon: Gift, badge: loyaltyData?.points ? `${loyaltyData.points}` : null },
              { id: 'wallet', label: 'Wallet', icon: Wallet, badge: `₹${walletBalance}` },
              { id: 'orders', label: 'My Orders', icon: ShoppingBag, badge: orders.length > 0 ? orders.length : null },
              { id: 'reviews', label: 'Reviews', icon: Star, badge: myReviews.length > 0 ? myReviews.length : null },
            ].map(({ id, label, icon: Icon, badge }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    if (id === 'support') {
                      navigate('/help-support');
                    } else {
                      setActiveTab(id as any);
                    }
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 relative ${
                    isActive
                      ? 'bg-[#FDF0F4] text-[#D81B60] shadow-xs'
                      : 'text-[#43152E]/70 hover:text-[#43152E] hover:bg-[#FFF9F3]'
                  }`}
                  title={label}
                >
                  {/* Rose vertical accent indicator when active */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#D81B60]" />
                  )}

                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? 'text-[#D81B60]' : 'text-[#43152E]/60'
                    }`}
                  />

                  {!isSidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left truncate">{label}</span>
                      {badge !== null && badge !== undefined && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${
                            isActive
                              ? 'bg-[#F8DCE4] text-[#D81B60]'
                              : 'bg-[#F8DCE4]/40 text-[#43152E]/80'
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Card: "Self care is not a luxury, it's a necessity. ♡" */}
          {!isSidebarCollapsed && (
            <div className="mt-6 pt-2">
              <div className="p-4 rounded-3xl bg-[#F8DCE4] border border-[#F3C4D0] text-center shadow-2xs">
                <p className="font-script text-base text-[#43152E] font-bold leading-snug">
                  Self care is not a luxury, it's a necessity.
                </p>
                <div className="text-[#D81B60] text-xs mt-1">♡</div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── RIGHT MAIN WORKSPACE ── */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Header matching Screenshot */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#F8DCE4] px-5 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          {/* Search Field */}
          <div className="relative w-72 sm:w-96 max-w-full">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search services, appointments..."
              className="w-full pl-10 pr-4 h-10 rounded-full bg-[#FFF9F3] border-[#F8DCE4] text-xs focus:ring-2 focus:ring-[#D81B60]/20"
            />
          </div>

          {/* Right Header: Home Landing Page Button, Notification Bell & Avatar Dropdown */}
          <div className="flex items-center gap-3">
            {/* Landing Page Home Button */}
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FFF9F3] border border-[#F8DCE4] text-xs font-semibold text-[#43152E] hover:bg-[#F8DCE4] hover:text-[#D81B60] transition-all shadow-2xs group"
              title="Go to Satguru Beauty Landing Page"
            >
              <Home className="w-3.5 h-3.5 text-[#D81B60] group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Home</span>
            </Link>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                className="w-10 h-10 rounded-full bg-[#FFF9F3] border border-[#F8DCE4] flex items-center justify-center text-[#43152E] hover:bg-[#F8DCE4] transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#D81B60] animate-pulse" />
              </button>

              {/* Notification Popover */}
              {notificationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#F8DCE4] rounded-2xl shadow-xl p-4 z-50 animate-in fade-in space-y-3">
                  <div className="flex items-center justify-between border-b border-[#F8DCE4]/60 pb-2">
                    <span className="text-xs font-bold text-[#43152E]">Notifications</span>
                    <span className="text-[10px] text-[#D81B60] font-semibold">2 New</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-xl bg-[#FFF9F3] border border-[#F8DCE4]/60">
                      <p className="font-semibold text-foreground">✨ Booking Confirmed</p>
                      <p className="text-[11px] text-muted-foreground">Skin Renewal Facial on Sat, 17 Oct at 4:30 PM.</p>
                    </div>
                    <div className="p-2 rounded-xl bg-[#FFF9F3] border border-[#F8DCE4]/60">
                      <p className="font-semibold text-foreground">🎁 500 Loyalty Points Credited</p>
                      <p className="text-[11px] text-muted-foreground">Thank you for visiting Satguru Beauty Parlour!</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-[#FFF9F3] transition-colors border border-transparent hover:border-[#F8DCE4]"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden border border-[#D81B60]/40 flex-shrink-0 bg-[#F8DCE4]">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#D81B60]">
                      {firstName.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="text-xs font-semibold text-[#43152E] hidden sm:inline">
                  {firstName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#43152E]/70" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-[#F8DCE4] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('beauty');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-[#FFF9F3] flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-[#D81B60]" /> My Profile & Preferences
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-[#FFF9F3] flex items-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#9A7736]" /> Account Settings
                  </button>
                  <button
                    onClick={() => {
                      navigate('/');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-[#FFF9F3] flex items-center gap-2"
                  >
                    <Home className="w-3.5 h-3.5 text-[#D81B60]" /> Home / Landing Page
                  </button>
                  <div className="border-t border-[#F8DCE4]/60 my-1" />
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setLogoutConfirmOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="p-5 sm:p-8 flex-1 max-w-7xl mx-auto w-full">

          {/* Home / Luxury Dashboard Overview Tab */}
          {activeTab === 'home' && (
            <UserDashboardOverview
              user={user}
              bookings={bookings}
              orders={orders}
              loyaltyPoints={loyaltyData?.points || 0}
              loyaltyTier={loyaltyData?.tier || 'bronze'}
              walletBalance={walletBalance}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              onOpenRaiseQuery={() => {
                setQueryBookingContext(null);
                setRaiseQueryModalOpen(true);
              }}
              onRaiseQueryForBooking={handleOpenRaiseQueryForBooking}
              onOpenAddMoneyModal={() => setAddMoneyModalOpen(true)}
            />
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F8DCE4]">
                <div>
                  <h2 className="font-serif italic text-2xl sm:text-3xl text-[#43152E]">
                    Your Beauty Appointments
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Manage upcoming appointments, reschedule slots, or book fresh salon treatments.
                  </p>
                </div>
                <Button
                  onClick={() => setBookingModalOpen(true)}
                  className="bg-[#43152E] hover:bg-[#2F0E20] text-white rounded-full text-xs font-semibold px-5 h-10 gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Book New Appointment
                </Button>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex gap-2 p-1 rounded-2xl bg-white border border-[#F8DCE4] w-fit">
                {(['upcoming', 'completed', 'cancelled', 'all'] as const).map((tabKey) => (
                  <button
                    key={tabKey}
                    onClick={() => setBookingTabFilter(tabKey)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                      bookingTabFilter === tabKey
                        ? 'bg-[#D81B60] text-white shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tabKey} (
                    {tabKey === 'all'
                      ? bookings.length
                      : bookings.filter((b) =>
                          tabKey === 'upcoming'
                            ? b.status === 'confirmed' || b.status === 'pending'
                            : b.status === tabKey
                        ).length}
                    )
                  </button>
                ))}
              </div>

              {/* Bookings Content */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#D81B60]" />
                </div>
              ) : (() => {
                const filteredBookings = bookings.filter((b) => {
                  if (bookingTabFilter === 'upcoming') return b.status === 'confirmed' || b.status === 'pending';
                  if (bookingTabFilter === 'completed') return b.status === 'completed';
                  if (bookingTabFilter === 'cancelled') return b.status === 'cancelled';
                  return true;
                });

                if (filteredBookings.length === 0) {
                  return (
                    <div className="text-center py-12 bg-white border border-[#F8DCE4] rounded-3xl p-8">
                      <Calendar className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                      <h4 className="font-serif italic text-xl text-[#43152E] mb-1">
                        No appointments found
                      </h4>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                        {bookingTabFilter === 'upcoming'
                          ? "You don't have any upcoming salon visits scheduled."
                          : `No ${bookingTabFilter} bookings found in your appointment records.`}
                      </p>
                      <Button
                        onClick={() => setBookingModalOpen(true)}
                        className="bg-[#43152E] hover:bg-[#2F0E20] text-white rounded-full text-xs font-semibold px-6"
                      >
                        Book Your Appointment Now
                      </Button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-white border border-[#F8DCE4] rounded-2xl p-6 hover:border-[#D81B60]/40 hover:shadow-xs transition-all"
                      >
                          <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3 className="font-semibold text-xl capitalize">{booking.service.replace('-', ' ')}</h3>
                                <Badge className={`border ${getStatusColor(booking.status)} text-xs`}>{booking.status.toUpperCase()}</Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>{new Date(booking.preferred_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {booking.preferred_time}</span>
                              </div>
                            </div>
                            {isWithin15Days(booking.preferred_date || booking.created_at) ? (
                              <Button
                                size="sm"
                                onClick={() => handleOpenRaiseQueryForBooking(booking)}
                                className="btn-primary gap-1.5 text-xs h-8 shadow-sm"
                                title="Raise query or get help for this booking (Eligible within 15 days)"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Raise Query / Help
                              </Button>
                            ) : (
                              <div
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-medium border border-gray-200"
                                title="Tickets can only be raised within 15 days of booking"
                              >
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span>Query Window Closed (&gt;15d)</span>
                              </div>
                            )}
                          </div>

                          {/* QR Code */}
                          {(booking as any).qr_code && (
                            <div className="flex items-center gap-3 p-3 rounded-2xl mb-4 border border-primary/15"
                              style={{ background: 'linear-gradient(135deg, rgba(190,24,93,0.05), rgba(236,72,153,0.03))' }}>
                              <div className="p-1.5 bg-white rounded-xl shadow-sm flex-shrink-0">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=52x52&color=be185d&data=${encodeURIComponent((booking as any).qr_code)}`} alt="QR" width={52} height={52} className="rounded" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-primary flex items-center gap-1 mb-0.5">
                                  <QrCode className="w-3 h-3" /> Booking QR — Show at Reception
                                </p>
                                <p className="text-xs text-muted-foreground font-mono">{((booking as any).qr_code as string).slice(0, 28)}...</p>
                              </div>
                            </div>
                          )}

                          {booking.message && (
                            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-xl mb-4">
                              <MessageSquare className="w-4 h-4 inline mr-2" />{booking.message}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-border flex-wrap gap-2">
                            <p className="text-xs text-muted-foreground">Booked {new Date(booking.created_at).toLocaleDateString()}</p>
                            <div className="flex gap-2 flex-wrap">
                              {/* Download Invoice */}
                              <Button size="sm" variant="outline" onClick={() => generateInvoice(booking)} className="gap-1 text-xs">
                                <FileText className="w-3 h-3" />Invoice
                              </Button>
                              {/* Reschedule */}
                              {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                <Dialog open={rescheduleBookingId === booking.id} onOpenChange={(open) => !open && setRescheduleBookingId(null)}>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" onClick={() => setRescheduleBookingId(booking.id)} className="gap-1 text-xs border-blue-200 text-blue-600 hover:bg-blue-50">
                                      <Clock className="w-3 h-3" />Reschedule
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader><DialogTitle>Reschedule Booking</DialogTitle></DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div>
                                        <label className="text-sm font-medium mb-1.5 block">New Date *</label>
                                        <input type="date" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
                                          className="w-full h-10 px-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium mb-1.5 block">New Time *</label>
                                        <input type="time" value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)}
                                          className="w-full h-10 px-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                      </div>
                                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                                        <p className="font-semibold">Current Booking</p>
                                        <p>{booking.service} on {new Date(booking.preferred_date).toLocaleDateString('en-IN')} at {booking.preferred_time}</p>
                                      </div>
                                      <Button onClick={handleReschedule} disabled={rescheduling} className="btn-primary w-full">
                                        {rescheduling ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Rescheduling...</> : '✅ Confirm Reschedule'}
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                              {booking.status === 'pending' && (
                                <Button size="sm" variant="outline" onClick={() => handleCancelBooking(booking.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs">
                                  <X className="w-3 h-3 mr-1" />Cancel
                                </Button>
                              )}
                              {booking.status === 'completed' && !booking.review_submitted && (
                                <Dialog open={reviewBookingId === booking.id} onOpenChange={(open) => !open && setReviewBookingId(null)}>
                                  <DialogTrigger asChild>
                                    <Button size="sm" onClick={() => { setReviewBookingId(booking.id); setReviewRating(5); setReviewComment(''); }} className="btn-primary gap-1 text-xs">
                                      <Star className="w-3 h-3" />Review
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader><DialogTitle>Write a Review ✨</DialogTitle></DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div>
                                        <label className="text-sm font-medium mb-2 block">Rating</label>
                                        <div className="flex gap-2">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <button key={star} onClick={() => setReviewRating(star)} className="transition-transform hover:scale-110">
                                              <Star className={`w-8 h-8 ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium mb-2 block">Your Review</label>
                                        <Textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Share your experience..." className="min-h-[120px]" />
                                      </div>
                                      <Button onClick={handleSubmitReview} disabled={submittingReview} className="btn-primary w-full">
                                        {submittingReview ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : 'Submit Review (+10 Points)'}
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                              {booking.review_submitted && (
                                <span className="text-sm text-emerald-600 flex items-center gap-1 text-xs">
                                  <CheckCircle className="w-4 h-4" />Reviewed
                                </span>
                              )}
                            </div>
                          </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <Card className="card-luxury">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-primary" />Doorstep & Mehndi Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                  : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No orders yet</p>
                      <div className="flex gap-2 justify-center flex-wrap">
                        <Button onClick={() => navigate('/doorstep-service')} className="btn-primary">Doorstep Services</Button>
                        <Button onClick={() => navigate('/mehndi-service')} className="btn-primary">Mehndi Services</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order: any) => (
                        <div key={order.id} className="border border-border rounded-2xl p-6 hover:shadow-md transition-all hover:-translate-y-0.5">
                          <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
                                <Badge className={`border ${getStatusColor(order.status)} text-xs`}>{order.status.replace('_', ' ').toUpperCase()}</Badge>
                                <Badge variant="outline" className={`text-xs ${order.order_type === 'mehndi' ? 'border-rose-300 text-rose-700' : 'border-teal-300 text-teal-700'}`}>
                                  {order.order_type === 'mehndi' ? '🎨 Mehndi' : '🏠 Doorstep'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-primary">₹{order.total}</p>
                              <p className="text-xs text-muted-foreground">{order.payment_method === 'pay_later' ? 'Pay on Service' : 'Paid'}</p>
                            </div>
                          </div>

                          {Array.isArray(order.services) && (
                            <div className="bg-muted/40 rounded-xl p-4 mb-4">
                              <h4 className="font-semibold mb-2 text-sm">Services:</h4>
                              <div className="space-y-1.5">
                                {order.services.map((s: any, idx: number) => (
                                  <div key={idx} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{s.name} × {s.quantity}</span>
                                    <span className="font-medium">₹{s.price * s.quantity}</span>
                                  </div>
                                ))}
                                {order.discount > 0 && (
                                  <div className="flex justify-between text-sm text-emerald-600">
                                    <span>Discount</span><span>-₹{order.discount}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="mb-4 flex items-start gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-primary mt-0.5" />
                            <p className="text-muted-foreground">{order.address}</p>
                          </div>

                          {order.executive_name && (
                            <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 mb-4">
                              <p className="text-sm font-semibold flex items-center gap-2 mb-1"><User className="w-4 h-4 text-primary" />Executive: {order.executive_name}</p>
                              {order.executive_phone && <p className="text-sm text-primary">{order.executive_phone}</p>}
                            </div>
                          )}

                          <div className="flex gap-2 flex-wrap">
                            {isWithin15Days(order.created_at) ? (
                              <Button size="sm" onClick={() => handleOpenRaiseQueryForOrder(order)} className="btn-primary gap-1 text-xs" title="Raise query or get help for this order (Eligible within 15 days)">
                                <MessageSquare className="w-3 h-3" /> Raise Query / Help
                              </Button>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-medium border border-gray-200" title="Tickets can only be raised within 15 days of order">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span>Query Window Closed (&gt;15d)</span>
                              </div>
                            )}
                            <Button size="sm" variant="outline" onClick={() => generateOrderInvoice(order)} className="gap-1 text-xs">
                              <FileText className="w-3 h-3" />Download Invoice
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => navigate(`/track-executive?order=${order.id}&type=${order.order_type}`)} className="gap-1 text-xs">
                              <Navigation className="w-3 h-3" />Track Live
                            </Button>
                            {order.executive_id && (
                              <Button size="sm" variant="outline" onClick={() => setChatOrder({ id: order.id, type: order.order_type, exec: order.executive_name, execId: order.executive_id })} className="gap-1 text-xs">
                                <MessageSquare className="w-3 h-3" />Chat Expert
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </CardContent>
            </Card>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <Card className="card-luxury">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><Star className="w-5 h-5 text-primary" />My Reviews</span>
                  <Button onClick={() => navigate('/reviews')} variant="outline" size="sm" className="gap-2">
                    <MessageSquare className="w-4 h-4" />All Reviews
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No reviews yet</p>
                    <p className="text-sm text-muted-foreground">Complete a booking to write a review and earn points!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myReviews.map((review) => (
                      <div key={review.id} className="border border-border rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground">{review.service}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</p>
                        </div>
                        <p className="text-sm">{review.comment}</p>
                        {review.featured && <Badge className="mt-2 bg-primary/10 text-primary">⭐ Featured</Badge>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Wallet Tab */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              {/* Balance Hero */}
              <div
                className="relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
                  border: '1px solid rgba(52,211,153,0.3)',
                }}
              >
                <div
                  className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-15 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, #34d399, transparent)',
                    transform: 'translate(30%, -30%)',
                  }}
                />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left: Info & Balance */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="w-8 h-8 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <span className="text-emerald-300 font-bold text-sm tracking-wide uppercase">
                        Satguru Beauty Wallet
                      </span>
                      <span className="text-[10px] bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-semibold">
                        Instant Credit
                      </span>
                    </div>

                    <div>
                      <p className="text-4xl sm:text-5xl font-black font-serif text-white tracking-tight">
                        ₹{walletBalance.toLocaleString('en-IN')}
                      </p>
                      <p className="text-emerald-200/80 text-xs mt-1 font-medium">
                        Available Balance &bull; Usable on all salon appointments & doorstep orders
                      </p>
                    </div>

                    {/* Quick deposit pills */}
                    <div className="flex items-center gap-2 pt-2 flex-wrap">
                      <span className="text-[11px] text-emerald-300/80 font-medium mr-1">Quick Add:</span>
                      {[500, 1000, 2000, 5000].map((quickAmt) => (
                        <button
                          key={quickAmt}
                          onClick={() => setAddMoneyModalOpen(true)}
                          className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          +₹{quickAmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right: Add Money CTA */}
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                    <Button
                      onClick={() => setAddMoneyModalOpen(true)}
                      className="bg-white hover:bg-emerald-50 text-[#064e3b] hover:text-[#065f46] font-bold text-xs h-12 px-6 rounded-2xl shadow-lg gap-2 transition-all hover:scale-102 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-emerald-600 font-bold" />
                      Add Money to Wallet
                    </Button>
                    <p className="text-[10px] text-emerald-200/60 text-center">
                      Zero fee &bull; Instant UPI, Card & Netbanking
                    </p>
                  </div>
                </div>
              </div>
              {/* Transaction History */}
              <Card className="card-luxury">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" />Transaction History</CardTitle>
                  <Button size="sm" variant="outline" onClick={fetchWallet} className="gap-1 text-xs"><RefreshCw className="w-3 h-3" />Refresh</Button>
                </CardHeader>
                <CardContent>
                  {walletTransactions.length === 0 ? (
                    <div className="text-center py-10">
                      <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">No wallet transactions yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Refunds and credits will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {walletTransactions.map((tx) => {
                        const isCredit = tx.type === 'credit' || tx.type === 'refund' || tx.type === 'promo';
                        return (
                          <div
                            key={tx.id || tx.reference_id}
                            className="flex items-center gap-4 p-3.5 rounded-2xl bg-white border border-[#F8DCE4]/80 hover:bg-[#FFF9F3] hover:border-[#D4AF70]/60 transition-all shadow-2xs"
                          >
                            <div
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs ${
                                isCredit ? 'bg-[#DCE8D7] text-[#174D3A]' : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-sm text-[#43152E] truncate">
                                  {tx.description || (isCredit ? 'Wallet Deposit' : 'Wallet Debit')}
                                </p>
                                {tx.reference_id && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FAF0E6] text-[#9A7736] border border-[#EAD8C7]">
                                    {tx.reference_id}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {new Date(tx.created_at).toLocaleString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={`font-black text-sm sm:text-base ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {isCredit ? '+' : '-'}₹{Math.abs(Number(tx.amount || 0)).toLocaleString('en-IN')}
                              </p>
                              {tx.balance_after !== undefined && tx.balance_after !== null && (
                                <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                                  Bal: ₹{Number(tx.balance_after).toLocaleString('en-IN')}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Queries & Help Desk Tab */}
          {(activeTab === 'support' || (activeTab as string) === 'queries') && (
            <div className="space-y-6">
              {/* Header Hero */}
              <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-border/60">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Headphones className="w-6 h-6 text-primary" />
                    My Queries & Help Desk
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    View active and past query tickets. Each ticket is assigned a unique tracking number and an expert resolver.
                  </p>
                </div>

                <Button
                  onClick={handleOpenGeneralQuery}
                  className="btn-primary gap-1.5 text-xs h-9 shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  + Raise New Query
                </Button>
              </div>

              {/* Status Metric Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Active Queries (Now)</p>
                    <p className="text-2xl font-black text-amber-900 dark:text-amber-200 mt-0.5">
                      {userQueryTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-amber-500/40" />
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Resolved (Past)</p>
                    <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-0.5">
                      {userQueryTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-emerald-500/40" />
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-primary">Total Generated Tickets</p>
                    <p className="text-2xl font-black text-foreground mt-0.5">
                      {userQueryTickets.length}
                    </p>
                  </div>
                  <Headphones className="w-8 h-8 text-primary/40" />
                </div>
              </div>

              {/* Filter Tabs: Now vs Past vs All */}
              <div className="flex gap-2 p-1 rounded-2xl bg-secondary/60 w-fit">
                <button
                  onClick={() => setQueryFilterView('active')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    queryFilterView === 'active'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Active Queries (Now) ({userQueryTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length})
                </button>
                <button
                  onClick={() => setQueryFilterView('past')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    queryFilterView === 'past'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Past Queries (History) ({userQueryTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length})
                </button>
                <button
                  onClick={() => setQueryFilterView('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    queryFilterView === 'all'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All ({userQueryTickets.length})
                </button>
              </div>

              {/* Month Selector for Profile Queries */}
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border/40">
                <span className="text-xs text-muted-foreground flex items-center gap-1 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> Month Filter:
                </span>
                {(() => {
                  const monthsSet = new Set<string>();
                  const now = new Date();
                  monthsSet.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
                  for (let i = 1; i <= 3; i++) {
                    const p = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    monthsSet.add(`${p.getFullYear()}-${String(p.getMonth() + 1).padStart(2, '0')}`);
                  }
                  userQueryTickets.forEach((t) => {
                    if (t.created_at) {
                      const d = new Date(t.created_at);
                      if (!isNaN(d.getTime())) {
                        monthsSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
                      }
                    }
                  });
                  const list = Array.from(monthsSet).sort().reverse();
                  return (
                    <>
                      {list.map((mKey) => {
                        const parts = mKey.split('-');
                        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
                        const label = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
                        const isCur = selectedQueryMonth === mKey;
                        const count = userQueryTickets.filter((t) => t.created_at?.startsWith(mKey)).length;
                        return (
                          <button
                            key={mKey}
                            type="button"
                            onClick={() => setSelectedQueryMonth(mKey)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                              isCur
                                ? 'bg-primary text-white font-bold shadow-xs'
                                : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                          >
                            {label} ({count})
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setSelectedQueryMonth('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          selectedQueryMonth === 'all'
                            ? 'bg-primary text-white font-bold shadow-xs'
                            : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        All Months ({userQueryTickets.length})
                      </button>
                    </>
                  );
                })()}
              </div>

              {/* Tickets List */}
              {(() => {
                const filtered = userQueryTickets.filter((t) => {
                  if (queryFilterView === 'active' && !(t.status === 'open' || t.status === 'in_progress')) return false;
                  if (queryFilterView === 'past' && !(t.status === 'resolved' || t.status === 'closed')) return false;
                  if (selectedQueryMonth !== 'all' && (!t.created_at || !t.created_at.startsWith(selectedQueryMonth))) return false;
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <Card className="card-luxury">
                      <CardContent className="text-center py-12 space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                          <Headphones className="w-7 h-7" />
                        </div>
                        <h4 className="font-bold text-base">
                          {queryFilterView === 'active' ? 'No active queries right now' : 'No queries found in this view'}
                        </h4>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          {queryFilterView === 'active'
                            ? 'All your past queries are either resolved or you have not raised any active issues. Need assistance with an appointment?'
                            : 'When you raise a query for any booking or order, your complete history will appear here.'}
                        </p>
                        <Button
                          onClick={handleOpenGeneralQuery}
                          className="btn-primary text-xs h-9 mt-2 gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Raise a Query
                        </Button>
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <div className="space-y-4">
                    {filtered.map(t => {
                      const lastMsg = t.messages[t.messages.length - 1];

                      return (
                        <div
                          key={t.id}
                          className="border border-border/80 rounded-2xl p-5 bg-card hover:shadow-md transition-all space-y-4"
                        >
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className="font-mono text-xs font-extrabold text-primary px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/20">
                                  #{t.ticket_number}
                                </span>
                                <Badge
                                  className={`text-xs ${
                                    t.status === 'open'
                                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                                      : t.status === 'in_progress'
                                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  }`}
                                >
                                  {t.status.toUpperCase().replace('_', ' ')}
                                </Badge>
                                {t.priority === 'urgent' && (
                                  <Badge className="bg-rose-500 text-white text-[10px]">Urgent</Badge>
                                )}
                              </div>
                              <h4 className="font-bold text-base text-foreground">{t.subject}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Category: <span className="text-foreground font-medium">{t.category}</span> &bull; Raised {new Date(t.created_at).toLocaleString('en-IN')}
                              </p>
                            </div>

                            <Button
                              size="sm"
                              onClick={() => {
                                setActiveTicketDetail(t);
                                setTicketDetailModalOpen(true);
                              }}
                              className="btn-primary gap-1 text-xs h-8 shadow-sm"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              View Thread & Reply
                            </Button>
                          </div>

                          {/* Attached booking context snapshot */}
                          {t.booking_info && (
                            <div className="p-3 rounded-xl bg-secondary/50 border border-border/60 text-xs flex items-center justify-between gap-3 flex-wrap">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                                <div>
                                  <span className="font-semibold text-foreground">
                                    Linked: {t.booking_info.service_name}
                                  </span>
                                  {t.booking_info.service_date && (
                                    <span className="text-muted-foreground ml-2">
                                      ({t.booking_info.service_date}{t.booking_info.service_time ? ` at ${t.booking_info.service_time}` : ''})
                                    </span>
                                  )}
                                </div>
                              </div>
                              {t.assigned_resolver_name && (
                                <span className="text-primary text-[11px] font-semibold bg-primary/10 px-2 py-0.5 rounded-md">
                                  ✨ Resolver: {t.assigned_resolver_name}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Latest message preview */}
                          {lastMsg && (
                            <div className={`p-3 rounded-xl text-xs ${lastMsg.sender_type === 'resolver' ? 'bg-primary/5 border border-primary/15' : 'bg-muted/40'}`}>
                              <p className="font-semibold mb-0.5 flex items-center justify-between text-muted-foreground">
                                <span>{lastMsg.sender_type === 'resolver' ? `✨ Resolver Response (${lastMsg.sender_name})` : 'Your Message'}</span>
                                <span className="text-[10px]">{new Date(lastMsg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                              </p>
                              <p className="text-foreground text-xs line-clamp-2">{lastMsg.message}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Beauty Profile Tab */}
          {(activeTab as string) === 'beauty' && (
            <div className="space-y-5">
              {/* AI Recommendations */}
              {aiRecs?.recommendations?.length > 0 && (
                <div className="relative overflow-hidden rounded-3xl p-6" style={{ background: 'linear-gradient(135deg, #1a0826, #0f0a1e)', border: '1px solid rgba(190,24,93,0.3)' }}>
                  <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 20%, rgba(124,58,237,0.2), transparent 60%)' }} />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="w-6 h-6 text-violet-400" />
                      <h3 className="text-white font-bold text-lg">AI Beauty Recommendations</h3>
                      <Button size="sm" variant="outline" onClick={fetchAiRecommendations} disabled={loadingAiRecs} className="ml-auto bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs">
                        {loadingAiRecs ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} Refresh
                      </Button>
                    </div>
                    {aiRecs.tip && (
                      <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <p className="text-white/60 text-xs font-semibold mb-0.5">✨ Beauty Tip For You</p>
                        <p className="text-white/80 text-sm">{aiRecs.tip}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {aiRecs.recommendations.map((rec: any, i: number) => (
                        <div key={i} className="p-4 rounded-2xl flex gap-3 items-start" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <span className="text-2xl flex-shrink-0">{rec.icon || '💄'}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-white font-semibold text-sm">{rec.service}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${rec.urgency === 'must_try' ? 'bg-rose-500/30 text-rose-300' : rec.urgency === 'highly_recommended' ? 'bg-violet-500/30 text-violet-300' : 'bg-white/10 text-white/50'}`}>
                                {rec.urgency === 'must_try' ? 'Must Try' : rec.urgency === 'highly_recommended' ? 'Top Pick' : 'Suggested'}
                              </span>
                            </div>
                            <p className="text-white/50 text-xs mb-2">{rec.reason}</p>
                            <p className="text-emerald-400/70 text-xs">✓ {rec.benefit}</p>
                            <button onClick={() => navigate(rec.type === 'doorstep' ? '/doorstep-service' : '/')} className="mt-2 px-3 py-1 rounded-lg text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #be185d, #ec4899)' }}>
                              {rec.type === 'doorstep' ? 'Order Now' : 'Book Now'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Beauty Profile Form */}
              <div className="bg-white rounded-3xl shadow-sm border border-border p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xl flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" />My Beauty Profile</h3>
                  <Button onClick={fetchAiRecommendations} disabled={loadingAiRecs} variant="outline" size="sm" className="gap-1 text-xs">
                    {loadingAiRecs ? <Loader2 className="w-3 h-3 animate-spin" /> : '✨'} Get AI Picks
                  </Button>
                </div>

                {/* Hair Section */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2"><Scissors className="w-4 h-4" />Hair Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Hair Type</label>
                      <select value={beautyProfile.hair_type || ''} onChange={e => setBeautyProfile((p: any) => ({ ...p, hair_type: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="">Select...</option>
                        {['Straight', 'Wavy', 'Curly', 'Coily/Kinky', 'Fine', 'Medium', 'Thick/Coarse'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Hair Texture</label>
                      <select value={beautyProfile.hair_texture || ''} onChange={e => setBeautyProfile((p: any) => ({ ...p, hair_texture: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="">Select...</option>
                        {['Silky', 'Rough/Frizzy', 'Normal', 'Brittle', 'Soft'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Hair Length</label>
                      <select value={beautyProfile.hair_length || ''} onChange={e => setBeautyProfile((p: any) => ({ ...p, hair_length: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="">Select...</option>
                        {['Short (above shoulder)', 'Medium (shoulder length)', 'Long (below shoulder)', 'Very Long (waist+)'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Scalp Type</label>
                      <select value={beautyProfile.scalp_type || ''} onChange={e => setBeautyProfile((p: any) => ({ ...p, scalp_type: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="">Select...</option>
                        {['Oily', 'Dry', 'Normal', 'Dandruff-prone', 'Sensitive'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="text-sm font-medium mb-1.5 block">Hair Concerns (select all that apply)</label>
                    <div className="flex flex-wrap gap-2">
                      {['Hair Fall', 'Thinning', 'Dryness', 'Frizz', 'Dandruff', 'Split Ends', 'Lack of Shine', 'Color Damage', 'Slow Growth'].map(concern => (
                        <button key={concern} type="button"
                          onClick={() => {
                            const cur = beautyProfile.hair_concerns || [];
                            setBeautyProfile((p: any) => ({ ...p, hair_concerns: cur.includes(concern) ? cur.filter((c: string) => c !== concern) : [...cur, concern] }));
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                            (beautyProfile.hair_concerns || []).includes(concern)
                              ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}>
                          {concern}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Skin Section */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2"><Droplets className="w-4 h-4" />Skin Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Skin Type</label>
                      <select value={beautyProfile.skin_type || ''} onChange={e => setBeautyProfile((p: any) => ({ ...p, skin_type: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="">Select...</option>
                        {['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Skin Sensitivity</label>
                      <select value={beautyProfile.skin_sensitivity || ''} onChange={e => setBeautyProfile((p: any) => ({ ...p, skin_sensitivity: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="">Select...</option>
                        {['Very Sensitive', 'Mildly Sensitive', 'Normal', 'Not Sensitive'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Skin Tone / Color</label>
                      <select value={beautyProfile.skin_color || ''} onChange={e => setBeautyProfile((p: any) => ({ ...p, skin_color: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="">Select...</option>
                        {['Very Fair', 'Fair', 'Medium/Wheatish', 'Olive/Brown', 'Dark Brown', 'Deep/Very Dark'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Age Group</label>
                      <select value={beautyProfile.age_group || ''} onChange={e => setBeautyProfile((p: any) => ({ ...p, age_group: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="">Select...</option>
                        {['Under 18', '18-25', '26-35', '36-45', '46-55', '55+'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="text-sm font-medium mb-1.5 block">Skin Concerns (select all that apply)</label>
                    <div className="flex flex-wrap gap-2">
                      {['Acne/Pimples', 'Dark Spots', 'Tanning', 'Dullness', 'Dark Circles', 'Open Pores', 'Wrinkles/Fine Lines', 'Uneven Tone', 'Redness', 'Pigmentation'].map(concern => (
                        <button key={concern} type="button"
                          onClick={() => {
                            const cur = beautyProfile.skin_concerns || [];
                            setBeautyProfile((p: any) => ({ ...p, skin_concerns: cur.includes(concern) ? cur.filter((c: string) => c !== concern) : [...cur, concern] }));
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                            (beautyProfile.skin_concerns || []).includes(concern)
                              ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}>
                          {concern}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button onClick={saveBeautyProfile} disabled={savingBeauty} className="btn-primary w-full h-12 gap-2">
                  {savingBeauty ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Sparkles className="w-4 h-4" />Save Beauty Profile &amp; Get AI Recommendations</>}
                </Button>
                <p className="text-xs text-muted-foreground text-center">AI recommendations are generated based on your beauty profile using our trained beauty assistant.</p>
              </div>
            </div>
          )}

          {/* Loyalty Tab */}
          {activeTab === 'loyalty' && (
            <div className="space-y-6">
              {/* Membership Card */}
                  {activeMembership && (
                    <div className="relative overflow-hidden rounded-3xl p-6 mb-6"
                      style={{ background: 'linear-gradient(135deg, #1a0826, #0f0514)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 20%, rgba(190,24,93,0.25), transparent 60%)' }} />
                      <div className="relative z-10 flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1"><Crown className="w-5 h-5 text-amber-400" /><span className="text-white font-bold text-lg">{activeMembership.membership_plans?.name || 'Membership'}</span></div>
                          <p className="text-white/50 text-sm mb-3">Active membership</p>
                          <div className="flex gap-4 text-sm">
                            <div><p className="text-white/40 text-xs">Expires</p><p className="text-white font-semibold">{new Date(activeMembership.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
                            <div><p className="text-white/40 text-xs">Discount</p><p className="text-white font-semibold">{activeMembership.membership_plans?.discount_percentage || 0}% off</p></div>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active ✓</span>
                      </div>
                    </div>
                  )}

              {/* Points Hero */}
              <div className="relative overflow-hidden rounded-3xl p-8 text-center"
                style={{ background: 'linear-gradient(135deg, #1a0826, #0f0a1e)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(circle at 50% 30%, rgba(190,24,93,0.2), transparent 60%)' }} />
                <div className="relative z-10">
                  <div className="w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(190,24,93,0.3), rgba(124,58,237,0.3))', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Crown className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-7xl font-black mb-2"
                    style={{ background: 'linear-gradient(135deg, #f9a8d4, #fbbf24, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {loyaltyData?.points || 0}
                  </p>
                  <p className="text-white/60 mb-4">Available Points</p>
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r ${getTierInfo(loyaltyData?.tier || 'bronze').gradient} text-white`}>
                    {getTierInfo(loyaltyData?.tier || 'bronze').icon} {(loyaltyData?.tier || 'bronze').toUpperCase()} TIER
                  </div>
                  <p className="text-white/40 text-sm mt-3">Lifetime Earned: {loyaltyData?.lifetime_points || 0} points</p>
                </div>
              </div>

              {/* Earning ways */}
              <Card className="card-luxury">
                <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-primary" />How to Earn Points</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { icon: ShoppingBag, label: 'Book Services', desc: '1 point per ₹10 spent', color: 'from-rose-400 to-pink-500' },
                      { icon: Star, label: 'Write Reviews', desc: '10 points per review', color: 'from-amber-400 to-yellow-500' },
                      { icon: Gift, label: 'Refer Friends', desc: '50 points per referral', color: 'from-violet-400 to-purple-500' },
                    ].map(({ icon: Icon, label, desc, color }) => (
                      <div key={label} className="flex items-center gap-3 p-4 rounded-2xl bg-muted/40">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{label}</p>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 p-4 rounded-2xl border border-primary/20 bg-primary/5">
                    <h4 className="font-semibold mb-2 flex items-center gap-2"><Award className="w-4 h-4 text-primary" />Redeem Points</h4>
                    <p className="text-sm text-muted-foreground mb-4">1 point = ₹1 discount at checkout. Min 10 points to redeem.</p>
                    <Button onClick={() => navigate('/doorstep-service')} disabled={(loyaltyData?.points || 0) < 10} className="btn-primary w-full">
                      {(loyaltyData?.points || 0) < 10 ? 'Need 10+ points to redeem' : 'Shop & Redeem Points ✨'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-[#F8DCE4] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs max-w-3xl">
              <div className="border-b border-[#F8DCE4]/60 pb-4">
                <h2 className="font-serif italic text-2xl text-[#43152E]">Account Settings & Preferences</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Control notifications, reminders, privacy, and account security.
                </p>
              </div>

              <div className="space-y-6">
                {/* Notifications Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#D81B60]">
                    Notification Preferences
                  </h4>
                  <div className="space-y-2.5">
                    <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4] cursor-pointer">
                      <div>
                        <p className="text-xs font-bold text-foreground">Appointment SMS Reminders</p>
                        <p className="text-[11px] text-muted-foreground">Receive reminders 24h and 2h before your salon slot</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#D81B60]" />
                    </label>
                    <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4] cursor-pointer">
                      <div>
                        <p className="text-xs font-bold text-foreground">Special Offers & Tier Upgrades</p>
                        <p className="text-[11px] text-muted-foreground">Get notified when new rewards or birthday discounts unlock</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#D81B60]" />
                    </label>
                    <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4] cursor-pointer">
                      <div>
                        <p className="text-xs font-bold text-foreground">WhatsApp Booking Updates</p>
                        <p className="text-[11px] text-muted-foreground">Receive digital QR code and invoice via WhatsApp</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#D81B60]" />
                    </label>
                  </div>
                </div>

                {/* Privacy & Password */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#174D3A]">
                    Privacy & Password
                  </h4>
                  <div className="p-4 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4] flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Signed in as</p>
                      <p className="text-sm font-semibold text-foreground">{user?.email}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast({ title: 'Password Reset Email Sent', description: `Check ${user?.email} for reset instructions.` })}
                      className="rounded-full text-xs border-[#D4AF70] text-[#9A7736]"
                    >
                      Send Password Reset Link
                    </Button>
                  </div>
                </div>

                {/* Session Sign Out */}
                <div className="space-y-3 pt-4 border-t border-[#F8DCE4]/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600">
                    Session & Sign Out
                  </h4>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50/60 border border-rose-200">
                    <div>
                      <p className="text-xs font-bold text-rose-900">Sign Out from this device</p>
                      <p className="text-[11px] text-rose-700/80">You can sign back in anytime with your credentials</p>
                    </div>
                    <Button
                      onClick={() => setLogoutConfirmOpen(true)}
                      size="sm"
                      className="bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs"
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── GUIDED 5-STEP BOOKING MODAL ── */}
      <GuidedBookingModal
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
        userId={user?.id}
        userName={user?.username}
        userEmail={user?.email}
        userPhone={user?.phone}
        onBookingCreated={(newBk) => {
          setBookings([newBk, ...bookings]);
          setActiveTab('bookings');
        }}
      />

      {/* ── WALLET ADD MONEY MODAL ── */}
      <AddMoneyModal
        open={addMoneyModalOpen}
        onOpenChange={setAddMoneyModalOpen}
        userId={user?.id}
        currentBalance={walletBalance}
        onBalanceUpdated={(newBal) => {
          setWalletBalance(newBal);
          fetchWallet();
        }}
      />

      {/* ── LOGOUT CONFIRMATION DIALOG ── */}
      <Dialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <DialogContent className="max-w-md bg-white border-[#F8DCE4] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-2xl text-[#43152E]">Confirm Sign Out</DialogTitle>
          </DialogHeader>
          <div className="py-3 text-xs text-muted-foreground leading-relaxed">
            Are you sure you want to sign out from Satguru Herbal Beauty Parlour? Your scheduled appointments and rewards will stay safely saved.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLogoutConfirmOpen(false)}
              className="rounded-full text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleLogout}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs px-5"
            >
              Sign Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Raise Query Modal */}
      <RaiseQueryModal
        open={raiseQueryModalOpen}
        onOpenChange={setRaiseQueryModalOpen}
        bookingInfo={queryBookingContext}
        availableBookings={[
          ...bookings.map((b) => ({
            booking_id: b.id,
            type: 'salon_booking' as const,
            service_name: b.service.replace('-', ' '),
            service_date: b.preferred_date,
            service_time: b.preferred_time,
            current_status: b.status,
            stylist_name: b.stylist_name,
          })),
          ...orders.map((o: any) => ({
            order_id: o.order_number || o.id,
            type: (o.order_type === 'mehndi' ? 'mehndi_order' : 'doorstep_order') as const,
            service_name: Array.isArray(o.services) ? o.services.map((s: any) => s.name).join(', ') : 'Order',
            service_date: new Date(o.created_at).toLocaleDateString('en-IN'),
            total_amount: o.total,
            current_status: o.status,
            stylist_name: o.executive_name,
          }))
        ]}
        userId={user?.id || ''}
        userName={user?.username || 'Client'}
        userEmail={user?.email || ''}
        userPhone={user?.phone || ''}
        onTicketCreated={() => {
          fetchUserQueryTickets();
          setActiveTab('queries');
        }}
      />

      {/* Ticket Details & Chat Modal */}
      <UserTicketDetailsModal
        ticket={activeTicketDetail}
        open={ticketDetailModalOpen}
        onOpenChange={setTicketDetailModalOpen}
        onTicketUpdated={(updated) => {
          setActiveTicketDetail(updated);
          fetchUserQueryTickets();
        }}
      />

      {/* Add Money To Wallet Modal */}
      <AddMoneyModal
        open={addMoneyModalOpen}
        onOpenChange={setAddMoneyModalOpen}
        userId={user?.id}
        currentBalance={walletBalance}
        onBalanceUpdated={(newBal, newTx) => {
          setWalletBalance(newBal);
          if (newTx) {
            setWalletTransactions((prev) => [
              newTx,
              ...prev.filter((t) => (t.reference_id || t.id) !== (newTx.reference_id || newTx.id)),
            ]);
          }
          fetchWallet();
        }}
      />
    </div>
  );
}
