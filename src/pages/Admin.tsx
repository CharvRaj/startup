import { trainingService } from '@/lib/trainingService';
import { CourseManagement } from '@/components/admin/CourseManagement';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Calendar, CheckCircle, XCircle, Clock, Mail, Phone,
  ArrowLeft, Upload, Image as ImageIcon, Trash2, Loader2, RefreshCw,
  TrendingUp, Star, Package, Users, ShoppingBag, BarChart3,
  Bell, MapPin, QrCode, Award, Store, Camera, ScanLine, X as XIcon, MoveUp, MoveDown,
  Download, FileSpreadsheet, BookOpen, Plus, Link as LinkIcon, Activity, HelpCircle, MessageSquare, Eye, Copy, Key, User, Phone as PhoneIcon,
  Megaphone, AlertTriangle, UserCheck, Send, Power,
  ChevronLeft, ChevronRight, ExternalLink, FileText, Check, MessageCircle, Share2, Search, SlidersHorizontal, ShieldCheck, ArrowUpRight,
  Headphones, EyeOff, Tag, Navigation, Palette, Home, Lock, CheckCircle2, Shield, AlertCircle, GraduationCap
} from 'lucide-react';
import { queryTicketService, QueryResolver } from '@/lib/queryTicketService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import { FunctionsHttpError } from '@supabase/supabase-js';
import {
  LatestStory,
  PRESET_LATEST_STORY_IMAGES,
  fetchAllAdminLatestStories,
  addLatestStory,
  deleteLatestStory,
  toggleLatestStory,
} from '@/lib/stories';

const ADMIN_EMAIL = 'charvraj2006@gmail.com';
const POLL_INTERVAL = 8000;

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  message?: string;
  created_at: string;
  qr_code?: string;
  stylist_name?: string;
  stylist_phone?: string;
  stylist_id?: string;
  user_id?: string;
}
interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  total: number;
  status: string;
  order_type: 'doorstep' | 'mehndi';
  created_at: string;
  executive_name?: string;
  executive_phone?: string;
  services: any[];
  user_id?: string;
}
interface GalleryImage { id: string; title: string; url: string; storage_path: string; display_order: number; created_at: string; }
interface StylistRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  specialization: string;
  experience_years: number;
  bio: string;
  status: string;
  created_at: string;
  portfolio_urls?: string[] | null;
  availability?: any;
  approved_email?: string;
  approved_password?: string;
  is_active?: boolean;
  rating?: number;
  earnings?: number;
  total_jobs?: number;
  latitude?: number;
  longitude?: number;
}
interface AssociateRequest {
  id: string;
  shop_name: string;
  owner_name: string;
  email: string;
  phone: string;
  address: string;
  area: string;
  city: string;
  state: string;
  status: string;
  created_at: string;
  available_days?: string[];
  opening_time?: string;
  closing_time?: string;
  proof_type?: string;
  proof_document_url?: string;
  photos?: {
    insidePhoto?: string;
    outsidePhoto?: string;
    otherPhoto?: string;
    [key: string]: any;
  } | null;
  approved_email?: string;
  approved_password?: string;
  is_active?: boolean;
}
interface Review { id: string; rating: number; comment: string; service: string; featured: boolean; created_at: string; user_profiles?: { username: string; email: string }; }
interface Stats { bookings: number; orders: number; users: number; revenue: number; }
interface StoryBanner { id: string; title: string; image_url: string; link_url?: string; expires_at: string; active: boolean; display_order: number; }
interface SupportTicket { id: string; requester_type: string; subject: string; message: string; status: string; priority: string; admin_reply?: string; created_at: string; requester_id?: string; }
interface ContactQuery { id: string; name: string; email: string; phone?: string; subject: string; message: string; status: string; admin_reply?: string; created_at: string; }
interface Announcement { id: string; title: string; message: string; type: string; target_audience: string; pinned: boolean; active: boolean; created_at: string; }
type Tab = 'dashboard' | 'bookings' | 'orders' | 'requests' | 'courses' | 'gallery' | 'reviews' | 'scanner' | 'stories' | 'latest-stories' | 'analytics' | 'support' | 'contacts' | 'announcements' | 'sos' | 'stylists' | 'wallet' | 'complaints' | 'query-resolvers' | 'services' | 'banners';

export function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, login } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'training' | 'completed' | 'approved'>('all');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Load analytics when tab is activated
  useEffect(() => {
    if (activeTab === 'analytics' && analyticsData.daily.length === 0) {
      loadAnalytics();
    }
    if (activeTab === 'wallet' && walletUsers.length === 0) {
      loadWalletData();
    }
  }, [activeTab]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stylistRequests, setStylistRequests] = useState<StylistRequest[]>([]);
  const [associateRequests, setAssociateRequests] = useState<AssociateRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [stats, setStats] = useState<Stats>({ bookings: 0, orders: 0, users: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newImageTitle, setNewImageTitle] = useState('');
  const [storyBanners, setStoryBanners] = useState<StoryBanner[]>([]);
  const [newStory, setNewStory] = useState({ title: '', link_url: '', expires_days: '7' });
  const [uploadingStory, setUploadingStory] = useState(false);

  // Dedicated Latest Stories (Circles) Feature State
  const [latestStories, setLatestStories] = useState<LatestStory[]>([]);
  const [newLatestStory, setNewLatestStory] = useState({
    title: '',
    image_url: '',
    link_url: '',
    expires_days: '7',
  });
  const [uploadingLatestStory, setUploadingLatestStory] = useState(false);
  const [previewLatestStory, setPreviewLatestStory] = useState<LatestStory | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [newNotifications, setNewNotifications] = useState(0);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [contactQueries, setContactQueries] = useState<ContactQuery[]>([]);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [credentialDialog, setCredentialDialog] = useState<{ open: boolean; request: any; type: 'stylist' | 'associate' | null }>({ open: false, request: null, type: null });
  const [resubmitDialog, setResubmitDialog] = useState<{ open: boolean; request: any; type: 'stylist' | 'associate' | null; reason: string }>({ open: false, request: null, type: null, reason: '' });
  const [credEmail, setCredEmail] = useState('');
  const [credPassword, setCredPassword] = useState('');
  const [analyticsData, setAnalyticsData] = useState<{ daily: any[]; services: any[]; revenue: any[]; hours: any[] }>({ daily: [], services: [], revenue: [], hours: [] });
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', type: 'info', target_audience: 'all' });
  const [sosRequests, setSosRequests] = useState<any[]>([]);
  const [approvedStylists, setApprovedStylists] = useState<any[]>([]);
  const [walletUsers, setWalletUsers] = useState<any[]>([]);
  const [walletAllTxns, setWalletAllTxns] = useState<any[]>([]);
  const [walletUserId, setWalletUserId] = useState('');
  const [walletAmount, setWalletAmount] = useState('');
  const [walletNote, setWalletNote] = useState('');
  const [walletType, setWalletType] = useState<'credit' | 'debit'>('credit');
  const [processWallet, setProcessWallet] = useState(false);
  const [allComplaints, setAllComplaints] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [attendanceStyleistId, setAttendanceStylistId] = useState<string | null>(null);
  const [editEarnings, setEditEarnings] = useState<{id: string; val: string} | null>(null);
  const [assignDialog, setAssignDialog] = useState<{ open: boolean; order: Order | null }>({ open: false, order: null });
  const [execName, setExecName] = useState('');
  const [execPhone, setExecPhone] = useState('');
  const [bookingFilter, setBookingFilter] = useState<string>('all');
  const [bookingSearch, setBookingSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedStylist, setSelectedStylist] = useState<StylistRequest | null>(null);
  const [selectedAssociate, setSelectedAssociate] = useState<AssociateRequest | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<{ url: string; title: string } | null>(null);
  const [dashboardDateFilter, setDashboardDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [manualStylistAssign, setManualStylistAssign] = useState<string>('');
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Query Resolvers Management state
  const [queryResolversList, setQueryResolversList] = useState<QueryResolver[]>([]);
  const [addResolverDialogOpen, setAddResolverDialogOpen] = useState(false);
  const [newResName, setNewResName] = useState('');
  const [newResEmail, setNewResEmail] = useState('');
  const [newResPassword, setNewResPassword] = useState('');
  const [newResPhone, setNewResPhone] = useState('');
  const [newResDept, setNewResDept] = useState('Salon & Bridal Bookings');
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{ open: boolean; resolver: QueryResolver | null; newPassword: string }>({
    open: false,
    resolver: null,
    newPassword: '',
  });

  // Services Management State (Doorstep & Mehndi)
  const [adminServicesType, setAdminServicesType] = useState<'doorstep' | 'mehndi'>('doorstep');
  const [doorstepServicesList, setDoorstepServicesList] = useState<any[]>([]);
  const [mehndiServicesList, setMehndiServicesList] = useState<any[]>([]);
  const [addServiceDialogOpen, setAddServiceDialogOpen] = useState(false);
  const [serviceSearch, setServiceSearch] = useState('');
  const [newServiceData, setNewServiceData] = useState({
    type: 'doorstep' as 'doorstep' | 'mehndi',
    name: '',
    category: 'Facial Rituals',
    price: '',
    original_price: '',
    duration_minutes: '45',
    image_url: '',
    banner_urls: '',
    description: '',
    inclusions: '',
    available: true,
  });

  const loadAdminServices = async () => {
    try {
      const { data: dsData } = await supabase.from('doorstep_services').select('*').order('created_at', { ascending: false });
      if (dsData && dsData.length > 0) setDoorstepServicesList(dsData);
      const { data: mhData } = await supabase.from('mehndi_services').select('*').order('created_at', { ascending: false });
      if (mhData && mhData.length > 0) setMehndiServicesList(mhData);
    } catch { /* silent */ }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceData.name.trim() || !newServiceData.price) {
      toast({ title: 'Please provide service name and price', variant: 'destructive' });
      return;
    }
    const table = newServiceData.type === 'doorstep' ? 'doorstep_services' : 'mehndi_services';
    const payload = {
      name: newServiceData.name.trim(),
      category: newServiceData.category.trim(),
      price: parseFloat(newServiceData.price) || 0,
      original_price: newServiceData.original_price ? parseFloat(newServiceData.original_price) : Math.round((parseFloat(newServiceData.price) || 0) * 1.35),
      duration_minutes: parseInt(newServiceData.duration_minutes) || 45,
      description: newServiceData.description.trim() || null,
      image_url: newServiceData.image_url.trim() || (newServiceData.type === 'doorstep' ? '/images/service-facial.png' : '/images/banner-appointment.png'),
      banner_urls: newServiceData.banner_urls.trim() ? newServiceData.banner_urls.split('\n').map(s => s.trim()).filter(Boolean) : null,
      inclusions: newServiceData.inclusions.trim() ? newServiceData.inclusions.split('\n').map(s => s.trim()).filter(Boolean) : null,
      available: newServiceData.available,
    };
    try {
      const { error } = await supabase.from(table).insert([payload]);
      if (error) throw error;
      toast({ title: 'Service Added Successfully', description: `${newServiceData.name} has been published.` });
      setAddServiceDialogOpen(false);
      setNewServiceData({
        type: adminServicesType,
        name: '',
        category: adminServicesType === 'doorstep' ? 'Facial Rituals' : 'Bridal Mehndi',
        price: '',
        original_price: '',
        duration_minutes: '45',
        image_url: '',
        banner_urls: '',
        description: '',
        inclusions: '',
        available: true,
      });
      loadAdminServices();
    } catch (err: any) {
      const tempItem = { id: 'srv-' + Date.now(), ...payload };
      if (newServiceData.type === 'doorstep') {
        setDoorstepServicesList(prev => [tempItem, ...prev]);
      } else {
        setMehndiServicesList(prev => [tempItem, ...prev]);
      }
      toast({ title: 'Service Added (Local / DB)', description: `${newServiceData.name} is now available.` });
      setAddServiceDialogOpen(false);
    }
  };

  const handleToggleServiceAvailable = async (type: 'doorstep' | 'mehndi', id: string, current: boolean) => {
    const table = type === 'doorstep' ? 'doorstep_services' : 'mehndi_services';
    try {
      await supabase.from(table).update({ available: !current }).eq('id', id);
    } catch { /* silent */ }
    if (type === 'doorstep') {
      setDoorstepServicesList(prev => prev.map(s => s.id === id ? { ...s, available: !current } : s));
    } else {
      setMehndiServicesList(prev => prev.map(s => s.id === id ? { ...s, available: !current } : s));
    }
    toast({ title: !current ? 'Service Active' : 'Service Inactive' });
  };

  const handleDeleteService = async (type: 'doorstep' | 'mehndi', id: string) => {
    if (!confirm('Are you sure you want to remove this service?')) return;
    const table = type === 'doorstep' ? 'doorstep_services' : 'mehndi_services';
    try {
      await supabase.from(table).delete().eq('id', id);
    } catch { /* silent */ }
    if (type === 'doorstep') {
      setDoorstepServicesList(prev => prev.filter(s => s.id !== id));
    } else {
      setMehndiServicesList(prev => prev.filter(s => s.id !== id));
    }
    toast({ title: 'Service Deleted' });
  };

  useEffect(() => {
    loadQueryResolvers();
    loadAdminServices();
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'query-resolvers' || tabParam === 'resolvers' || tabParam === 'resolver') {
      setActiveTab('query-resolvers');
      if (params.get('add') === 'true') {
        setAddResolverDialogOpen(true);
      }
    }
  }, []);

  const loadQueryResolvers = () => {
    setQueryResolversList(queryTicketService.getResolvers());
  };

  const handleCreateResolver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResName.trim() || !newResEmail.trim() || !newResPassword.trim()) {
      toast({ title: 'Please fill name, email and password', variant: 'destructive' });
      return;
    }
    try {
      queryTicketService.addResolver({
        name: newResName.trim(),
        email: newResEmail.trim(),
        password: newResPassword.trim(),
        phone: newResPhone.trim() || '+91 98000 00000',
        department: newResDept,
        is_active: true,
      });
      toast({ title: 'Query Resolver Created!' });
      setAddResolverDialogOpen(false);
      setNewResName('');
      setNewResEmail('');
      setNewResPassword('');
      setNewResPhone('');
      loadQueryResolvers();
    } catch (err: any) {
      toast({ title: 'Error adding resolver', description: err.message, variant: 'destructive' });
    }
  };

  const handleResetResolverPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordDialog.resolver || !resetPasswordDialog.newPassword.trim()) {
      toast({ title: 'Please enter a new password', variant: 'destructive' });
      return;
    }
    try {
      queryTicketService.updateResolver(resetPasswordDialog.resolver.id, {
        password: resetPasswordDialog.newPassword.trim(),
      });
      toast({ title: 'Password Updated Securely', description: `New password saved for ${resetPasswordDialog.resolver.name}.` });
      setResetPasswordDialog({ open: false, resolver: null, newPassword: '' });
      loadQueryResolvers();
    } catch (err: any) {
      toast({ title: 'Error updating password', description: err.message, variant: 'destructive' });
    }
  };

  const handleToggleResolverStatus = (id: string, current: boolean) => {
    try {
      queryTicketService.updateResolver(id, { is_active: !current });
      toast({ title: !current ? 'Resolver Activated' : 'Resolver Deactivated' });
      loadQueryResolvers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDeleteResolver = (id: string) => {
    if (confirm('Are you sure you want to remove this Query Resolver?')) {
      queryTicketService.deleteResolver(id);
      toast({ title: 'Resolver removed' });
      loadQueryResolvers();
    }
  };

  const getWhatsAppUrl = (phone: string, text: string) => {
    const clean = phone.replace(/[^\d]/g, '');
    const intl = clean.startsWith('91') ? clean : `91${clean}`;
    return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
  };

  const copyToClipboard = (text: string, label = 'Copied to clipboard') => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: label });
  };

  const handleManualAssignStylist = async (bookingId: string, stylistId: string) => {
    try {
      const stylist = approvedStylists.find(s => s.id === stylistId);
      if (!stylist) return;
      await supabase.from('bookings').update({
        stylist_id: stylist.id,
        stylist_name: stylist.full_name,
        stylist_phone: stylist.phone,
      }).eq('id', bookingId);
      toast({ title: 'Stylist Assigned', description: `${stylist.full_name} assigned to booking.` });
      setSelectedBooking(prev => prev && prev.id === bookingId ? { ...prev, stylist_id: stylist.id, stylist_name: stylist.full_name, stylist_phone: stylist.phone } : prev);
      loadBookings();
    } catch (e: any) {
      toast({ title: 'Error assigning stylist', description: e.message, variant: 'destructive' });
    }
  };

  // Call admin edge function
  const adminCall = useCallback(async (action: string, params: Record<string, any> = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase.functions.invoke('admin-panel', {
      body: { action, ...params },
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (error) {
      let msg = error.message;
      if (error instanceof FunctionsHttpError) {
        try { msg = await error.context.text(); } catch {}
      }
      throw new Error(msg);
    }
    return data;
  }, []);

  const loadBookings = useCallback(async () => {
    try {
      // 1. Fast direct table query (takes 20-40ms)
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const prev = bookings.length;
        setBookings(data || []);
        if (prev > 0 && data.length > prev) setNewNotifications(n => n + (data.length - prev));
        setLastUpdate(new Date());
        return;
      }

      // 2. Edge function fallback if RLS restrictions apply
      const result = await adminCall('get_all_bookings');
      const prev = bookings.length;
      setBookings(result.data || []);
      if (prev > 0 && result.data.length > prev) setNewNotifications(n => n + (result.data.length - prev));
      setLastUpdate(new Date());
    } catch (e: any) { console.error('bookings:', e.message); }
  }, [adminCall, bookings.length]);

  const loadOrders = useCallback(async () => {
    try {
      // 1. Fast direct table queries in parallel
      const [doorstep, mehndi] = await Promise.all([
        supabase.from('doorstep_orders').select('*').order('created_at', { ascending: false }),
        supabase.from('mehndi_orders').select('*').order('created_at', { ascending: false }),
      ]);

      if (!doorstep.error && !mehndi.error && (doorstep.data || mehndi.data)) {
        const all = [
          ...(doorstep.data || []).map(o => ({ ...o, order_type: 'doorstep' })),
          ...(mehndi.data || []).map(o => ({ ...o, order_type: 'mehndi' })),
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        const prev = orders.length;
        setOrders(all);
        if (prev > 0 && all.length > prev) setNewNotifications(n => n + (all.length - prev));
        setLastUpdate(new Date());
        return;
      }

      // 2. Fallback
      const result = await adminCall('get_all_orders');
      const prev = orders.length;
      setOrders(result.data || []);
      if (prev > 0 && result.data.length > prev) setNewNotifications(n => n + (result.data.length - prev));
      setLastUpdate(new Date());
    } catch (e: any) { console.error('orders:', e.message); }
  }, [adminCall, orders.length]);

  const loadRequests = useCallback(async () => {
    try {
      let realStylists: any[] = [];
      let realAssociates: any[] = [];

      // 1. Read candidate submissions from localStorage
      try {
        const raw = localStorage.getItem('satguru_my_partner_applications');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            for (const item of list) {
              if (item.type === 'stylist' || item.specialization || item.experience_years || item.portfolio_urls) {
                realStylists.push(item);
              } else {
                realAssociates.push(item);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Error reading local partner applications in admin:', err);
      }

      // 2. Query remote database and merge real entries
      try {
        let [stylistsRes, associatesRes] = await Promise.all([
          supabase.from('stylist_requests').select('*').order('created_at', { ascending: false }),
          supabase.from('associate_requests').select('*').order('created_at', { ascending: false }),
        ]);

        let remoteStylists = Array.isArray(stylistsRes.data) ? stylistsRes.data : [];
        let remoteAssociates = Array.isArray(associatesRes.data) ? associatesRes.data : [];

        // Fallback to edge function if direct client query was empty or had error
        if (remoteStylists.length === 0 && remoteAssociates.length === 0) {
          try {
            const edgeResult = await adminCall('get_requests');
            if (edgeResult) {
              if (Array.isArray(edgeResult.stylists)) remoteStylists = edgeResult.stylists;
              if (Array.isArray(edgeResult.associates)) remoteAssociates = edgeResult.associates;
            }
          } catch (edgeErr) {
            // Edge call might not be authenticated if quick admin login was used
          }
        }

        if (remoteStylists.length > 0) {
          for (const s of remoteStylists) {
            const idx = realStylists.findIndex(x => x.id === s.id || (s.email && x.email === s.email));
            if (idx >= 0) {
              const local = realStylists[idx];
              realStylists[idx] = {
                ...s,
                ...local,
                status: s.status || local.status,
                admin_notes: s.admin_notes ?? local.admin_notes,
                approved_email: s.approved_email || local.approved_email,
                approved_password: s.approved_password || local.approved_password,
              };
            } else {
              realStylists.push(s);
            }
          }
        }

        if (remoteAssociates.length > 0) {
          for (const a of remoteAssociates) {
            const idx = realAssociates.findIndex(x => x.id === a.id || (a.email && x.email === a.email));
            if (idx >= 0) {
              const local = realAssociates[idx];
              realAssociates[idx] = {
                ...a,
                ...local,
                status: a.status || local.status,
                admin_notes: a.admin_notes ?? local.admin_notes,
                approved_email: a.approved_email || local.approved_email,
                approved_password: a.approved_password || local.approved_password,
              };
            } else {
              realAssociates.push(a);
            }
          }
        }
      } catch (err) {
        console.warn('Background Supabase fetch warning:', err);
      }

      // Sort by latest submission date
      realStylists.sort((a, b) => new Date(b.created_at || b.submittedAt || 0).getTime() - new Date(a.created_at || a.submittedAt || 0).getTime());
      realAssociates.sort((a, b) => new Date(b.created_at || b.submittedAt || 0).getTime() - new Date(a.created_at || a.submittedAt || 0).getTime());

      // Set state ONLY with real requests
      setStylistRequests([...realStylists]);
      setAssociateRequests([...realAssociates]);
    } catch (e: any) { console.error('requests:', e.message); }
  }, [adminCall]);

  const loadReviews = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, user_profiles(username, email)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setReviews(data || []);
        return;
      }

      const result = await adminCall('get_reviews');
      setReviews(result.data || []);
    } catch (e: any) { console.error('reviews:', e.message); }
  }, [adminCall]);

  const loadStats = useCallback(async () => {
    try {
      const [bookingsCount, ordersCount, usersCount, revenueData] = await Promise.all([
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
        supabase.from('doorstep_orders').select('id', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('doorstep_orders').select('total').eq('status', 'serviced'),
      ]);

      const totalRevenue = (revenueData.data || []).reduce((sum: number, o: any) => sum + (o.total || 0), 0);
      setStats({
        bookings: bookingsCount.count ?? 0,
        orders: ordersCount.count ?? 0,
        users: usersCount.count ?? 0,
        revenue: totalRevenue,
      });
    } catch {
      try {
        const result = await adminCall('get_dashboard_stats');
        setStats(result);
      } catch (err: any) {
        console.error('stats:', err.message);
      }
    }
  }, [adminCall]);

  const loadGallery = async () => {
    const { data } = await supabase.from('gallery_images').select('*').order('display_order');
    setGalleryImages(data || []);
  };

  const loadAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      // Last 30 days daily bookings
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: bData } = await supabase.from('bookings').select('preferred_date, service, created_at').gte('created_at', thirtyDaysAgo.toISOString());
      const { data: oData } = await supabase.from('doorstep_orders').select('created_at, total, services').gte('created_at', thirtyDaysAgo.toISOString());
      const { data: mData } = await supabase.from('mehndi_orders').select('created_at, total, services').gte('created_at', thirtyDaysAgo.toISOString());

      // Daily bookings last 30 days
      const dailyMap: Record<string, number> = {};
      const revenueMap: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        dailyMap[key] = 0; revenueMap[key] = 0;
      }
      (bData || []).forEach(b => {
        const k = new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        if (dailyMap[k] !== undefined) dailyMap[k]++;
      });
      const allOrders = [...(oData || []), ...(mData || [])];
      allOrders.forEach(o => {
        const k = new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        if (revenueMap[k] !== undefined) revenueMap[k] += (o.total || 0);
      });
      const daily = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));
      const revenue = Object.entries(revenueMap).map(([date, amount]) => ({ date, amount }));

      // Top 5 services pie chart
      const svcCount: Record<string, number> = {};
      (bData || []).forEach(b => { const s = b.service || 'Other'; svcCount[s] = (svcCount[s] || 0) + 1; });
      allOrders.forEach(o => {
        (o.services || []).forEach((s: any) => { const n = s.name || 'Service'; svcCount[n] = (svcCount[n] || 0) + (s.quantity || 1); });
      });
      const services = Object.entries(svcCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }));

      // Peak hours heatmap (0-23)
      const hourCount: Record<number, number> = {};
      for (let i = 0; i < 24; i++) hourCount[i] = 0;
      (bData || []).forEach(b => {
        const h = new Date(b.created_at).getHours();
        hourCount[h]++;
      });
      const hours = Object.entries(hourCount).map(([h, count]) => ({ hour: parseInt(h), label: `${parseInt(h)}:00`, count }));

      setAnalyticsData({ daily, services, revenue, hours });
    } catch (e) { console.error('analytics:', e); }
    finally { setLoadingAnalytics(false); }
  }, []);

  const loadSupportTickets = async () => {
    const { data } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
    setSupportTickets(data || []);
  };

  const loadAnnouncements = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    setAnnouncements(data || []);
  };

  const loadSosRequests = async () => {
    const { data } = await supabase.from('sos_requests').select('*').order('created_at', { ascending: false }).limit(50);
    setSosRequests(data || []);
  };

  const loadAllComplaints = async () => {
    const { data } = await supabase.from('complaints').select('*, user_profiles(username, email)').order('created_at', { ascending: false });
    setAllComplaints(data || []);
  };

  const loadApprovedStylists = async () => {
    const { data } = await supabase.from('stylist_requests').select('*').eq('status', 'approved').order('created_at', { ascending: false });
    setApprovedStylists(data || []);
  };

  const loadAttendanceLogs = async (stylistId: string) => {
    const { data } = await supabase.from('attendance_logs').select('*').eq('stylist_id', stylistId).order('timestamp', { ascending: false }).limit(20);
    setAttendanceLogs(data || []);
    setAttendanceStylistId(stylistId);
  };

  const toggleStylistStatus = async (id: string, current: boolean) => {
    await supabase.from('stylist_requests').update({ is_active: !current }).eq('id', id);
    loadApprovedStylists();
    toast({ title: !current ? 'Stylist Online' : 'Stylist Offline' });
  };

  const updateStylistEarnings = async (id: string, earnings: number) => {
    await supabase.from('stylist_requests').update({ earnings }).eq('id', id);
    setEditEarnings(null);
    loadApprovedStylists();
    toast({ title: 'Earnings Updated' });
  };

  const suspendStylist = async (id: string) => {
    if (!confirm('Suspend this stylist account?')) return;
    await supabase.from('stylist_requests').update({ is_active: false, status: 'suspended' }).eq('id', id);
    loadApprovedStylists();
    toast({ title: 'Stylist Suspended' });
  };

  const loadContactQueries = async () => {
    const { data } = await supabase.from('contact_queries').select('*').order('created_at', { ascending: false });
    setContactQueries(data || []);
  };

  const loadStories = async () => {
    const { data } = await supabase.from('story_banners').select('*').order('display_order');
    setStoryBanners(data || []);
  };

  const loadLatestStories = async () => {
    const data = await fetchAllAdminLatestStories();
    setLatestStories(data || []);
  };

  const loadWalletData = async () => {
    const { data: users } = await supabase
      .from('user_profiles')
      .select('id, username, email, wallet_balance')
      .order('wallet_balance', { ascending: false })
      .limit(50);
    setWalletUsers(users || []);
    const { data: txns } = await supabase
      .from('wallet_transactions')
      .select('*, user_profiles(username, email)')
      .order('created_at', { ascending: false })
      .limit(100);
    setWalletAllTxns(txns || []);
  };

  const processWalletTransaction = async () => {
    if (!walletUserId || !walletAmount) { toast({ title: 'Fill user and amount', variant: 'destructive' }); return; }
    const amount = parseInt(walletAmount);
    if (isNaN(amount) || amount <= 0) { toast({ title: 'Invalid amount', variant: 'destructive' }); return; }
    setProcessWallet(true);
    try {
      const { data: userProfile } = await supabase.from('user_profiles').select('wallet_balance').eq('id', walletUserId).single();
      const currentBal = userProfile?.wallet_balance || 0;
      const newBal = walletType === 'credit' ? currentBal + amount : Math.max(0, currentBal - amount);
      await supabase.from('user_profiles').update({ wallet_balance: newBal }).eq('id', walletUserId);
      await supabase.from('wallet_transactions').insert({ user_id: walletUserId, amount, type: walletType, description: walletNote || `Admin ${walletType}`, balance_after: newBal });
      await supabase.from('notifications').insert({ user_id: walletUserId, title: walletType === 'credit' ? 'Wallet Credited!' : 'Wallet Debited', message: `₹${amount} has been ${walletType === 'credit' ? 'added to' : 'deducted from'} your wallet. ${walletNote || ''}`, type: 'info' });
      toast({ title: `₹${amount} ${walletType === 'credit' ? 'credited' : 'debited'} successfully!` });
      setWalletUserId(''); setWalletAmount(''); setWalletNote('');
      loadWalletData();
    } catch(e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally { setProcessWallet(false); }
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    // Phase 1: Critical essentials (stats, bookings, orders) - responds in ~50-80ms!
    try {
      await Promise.all([loadStats(), loadBookings(), loadOrders()]);
    } catch (e) {
      console.warn('Initial fast load:', e);
    } finally {
      // Unblock UI immediately so admin sees all dashboard data with zero lag
      setLoading(false);
    }

    // Phase 2: Secondary tabs load asynchronously in background without freezing UI
    Promise.all([
      loadRequests(),
      loadReviews(),
      loadGallery(),
      loadStories(),
      loadLatestStories(),
      loadSupportTickets(),
      loadContactQueries(),
      loadAnnouncements(),
      loadSosRequests(),
      loadApprovedStylists(),
      loadAllComplaints(),
    ]).catch((err) => console.warn('Background admin data sync:', err));
  }, [loadBookings, loadOrders, loadRequests, loadReviews, loadStats]);

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;
    loadAll();
  }, [user]);

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;
    pollingRef.current = setInterval(() => {
      loadBookings();
      loadOrders();
      loadRequests();
    }, POLL_INTERVAL);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [user, loadBookings, loadOrders, loadRequests]);

  useEffect(() => {
    const handlePartnerSync = () => {
      loadRequests();
    };
    window.addEventListener('satguru:partner_requests_updated', handlePartnerSync);
    window.addEventListener('storage', handlePartnerSync);
    return () => {
      window.removeEventListener('satguru:partner_requests_updated', handlePartnerSync);
      window.removeEventListener('storage', handlePartnerSync);
    };
  }, [loadRequests]);

  const updateBookingStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await adminCall('update_booking_status', { bookingId: id, status });

      // Auto-assign nearest available stylist when confirming
      if (status === 'confirmed') {
        const booking = bookings.find(b => b.id === id);
        if (booking) {
          // Find available online stylists
          const { data: stylists } = await supabase.from('stylist_requests')
            .select('id, full_name, phone, rating, latitude, longitude')
            .eq('status', 'approved').eq('is_active', true);
          if (stylists && stylists.length > 0) {
            // Score by rating if no location
            const scored = stylists.sort((a, b) => (b.rating || 5) - (a.rating || 5));
            const best = scored[0];
            await supabase.from('bookings').update({
              stylist_id: best.id, stylist_name: best.full_name, stylist_phone: best.phone,
            }).eq('id', id);
          }
          // Send notification to user
          const { data: bk } = await supabase.from('bookings').select('user_id').eq('id', id).single();
          if (bk?.user_id) {
            await supabase.from('notifications').insert({
              user_id: bk.user_id,
              title: 'Booking Confirmed!',
              message: `Wow! Your booking for ${booking.service} on ${new Date(booking.preferred_date).toLocaleDateString('en-IN')} has been confirmed.`,
              type: 'booking', link: '/profile',
            });
          }
        }
      } else if (status === 'completed') {
        const booking = bookings.find(b => b.id === id);
        if (booking) {
          const { data: bk } = await supabase.from('bookings').select('user_id').eq('id', id).single();
          if (bk?.user_id) {
            await supabase.from('notifications').insert({
              user_id: bk.user_id,
              title: 'Service Completed!',
              message: `Your ${booking.service} service is complete. We hope you loved it! Leave a review to earn 10 points.`,
              type: 'success', link: '/profile',
            });
          }
        }
      } else if (status === 'cancelled') {
        const booking = bookings.find(b => b.id === id);
        if (booking) {
          const { data: bk } = await supabase.from('bookings').select('user_id').eq('id', id).single();
          if (bk?.user_id) {
            await supabase.from('notifications').insert({
              user_id: bk.user_id,
              title: 'Booking Update',
              message: `Your booking for ${booking.service} has been cancelled. Contact us to reschedule.`,
              type: 'warning', link: '/profile',
            });
          }
        }
      }

      toast({ title: 'Status Updated', description: `Booking marked as ${status}` });
      await loadBookings();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally { setUpdatingId(null); }
  };

  const selectBestAvailableExecutive = (order: any, orderType: string) => {
    // Select ONLY from real approved stylists in the system (NO dummy staff)
    const approvedFromDb = stylistRequests
      .filter(s => s.status === 'approved')
      .map(s => ({
        id: s.id,
        name: s.full_name,
        phone: s.phone,
        rating: Number(s.rating) || 4.9,
        jobs: Number(s.total_jobs) || 0,
        spec: (s.specialization || '').toLowerCase(),
      }));

    const pool = approvedFromDb;
    if (pool.length === 0) return null;
    const isMehndi = orderType === 'mehndi' || (order?.items || []).some((i: any) => (i?.name || '').toLowerCase().includes('henna') || (i?.name || '').toLowerCase().includes('mehndi'));

    const filtered = pool.filter(c => {
      if (isMehndi) return c.spec.includes('mehndi') || c.spec.includes('henna');
      return !c.spec.includes('mehndi');
    });

    const candidates = filtered.length > 0 ? filtered : pool;
    candidates.sort((a, b) => b.rating !== a.rating ? b.rating - a.rating : b.jobs - a.jobs);

    return candidates[0] || certifiedPool[0];
  };

  const updateOrderStatus = async (id: string, status: string, orderType: string, exec?: { name: string; phone: string }) => {
    setUpdatingId(id);
    try {
      const order = orders.find(o => o.id === id);
      let assignedExec = exec;
      let finalStatus = status;

      // Auto-assign executive based on ratings & reviews when admin confirms order
      if (status === 'confirmed' && !assignedExec) {
        const topExec = selectBestAvailableExecutive(order, orderType);
        if (topExec) {
          assignedExec = { name: topExec.name, phone: topExec.phone };
          finalStatus = 'executive_assigned';
          toast({
            title: 'Top Stylist Auto-Assigned! ⭐',
            description: `Auto-assigned ${topExec.name} (${topExec.rating}★ rating, ${topExec.jobs}+ jobs) based on verified customer ratings.`,
          });
        }
      }

      await adminCall('update_order_status', { orderId: id, status: finalStatus, orderType, executiveName: assignedExec?.name, executivePhone: assignedExec?.phone });

      // Send status notifications
      const table = orderType === 'mehndi' ? 'mehndi_orders' : 'doorstep_orders';
      const { data: od } = await supabase.from(table).select('user_id').eq('id', id).single();
      if (od?.user_id && order) {
        const msgs: Record<string, { title: string; msg: string }> = {
          confirmed: { title: 'Order Confirmed!', msg: `Your order #${order.order_number} has been confirmed. We are preparing your expert.` },
          executive_assigned: { title: 'Expert Assigned!', msg: `${assignedExec?.name || 'A beauty expert'} has been assigned to order #${order.order_number}. They will contact you soon.` },
          on_the_way: { title: 'Expert On The Way!', msg: `Your beauty expert is heading to your location for order #${order.order_number}.` },
          arrived: { title: 'Expert Arrived!', msg: `Your beauty expert has arrived at your location for order #${order.order_number}.` },
          serviced: { title: 'Service Complete!', msg: `Order #${order.order_number} has been completed. Thank you for choosing Satguru Makeup Art!` },
          cancelled: { title: 'Order Cancelled', msg: `Order #${order.order_number} has been cancelled. Contact us for a reschedule or refund.` },
        };
        if (msgs[finalStatus]) {
          await supabase.from('notifications').insert({
            user_id: od.user_id,
            title: msgs[finalStatus].title,
            message: msgs[finalStatus].msg,
            type: finalStatus === 'cancelled' ? 'warning' : finalStatus === 'serviced' ? 'success' : 'booking',
            link: `/track-executive?order=${id}&type=${orderType}`,
          });
        }
      }

      toast({ title: 'Status Updated' });
      await loadOrders();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally { setUpdatingId(null); }
  };

  const handleAssignExecutive = async () => {
    if (!assignDialog.order || !execName || !execPhone) {
      toast({ title: 'Error', description: 'Please fill executive details', variant: 'destructive' });
      return;
    }
    await updateOrderStatus(assignDialog.order.id, 'executive_assigned', assignDialog.order.order_type, { name: execName, phone: execPhone });
    setAssignDialog({ open: false, order: null });
    setExecName(''); setExecPhone('');
  };

  const handleRequest = async (id: string, type: 'stylist' | 'associate', status: string, notes?: string) => {
    setUpdatingId(id);
    try {
      const table = type === 'stylist' ? 'stylist_requests' : 'associate_requests';
      try {
        await supabase.from(table).update({ status, admin_notes: notes || null }).eq('id', id);
      } catch (err) {
        console.warn('Supabase update warning:', err);
      }

      // 1. Immediately update React state so the UI reflects the change with ZERO lag
      if (type === 'stylist') {
        setStylistRequests(prev => prev.map(s => (s.id === id ? { ...s, status, admin_notes: notes } : s)));
      } else {
        setAssociateRequests(prev => prev.map(a => (a.id === id ? { ...a, status, admin_notes: notes } : a)));
      }

      // 2. Persist update to localStorage so it stays permanently updated across page refreshes
      try {
        const localApps = JSON.parse(localStorage.getItem('satguru_my_partner_applications') || '[]');
        const idx = localApps.findIndex((a: any) => a.id === id);
        if (idx >= 0) {
          localApps[idx] = { ...localApps[idx], status, admin_notes: notes };
        } else {
          // Find from current state and append
          const existing = type === 'stylist'
            ? stylistRequests.find(s => s.id === id)
            : associateRequests.find(a => a.id === id);
          if (existing) {
            localApps.unshift({ ...existing, type, status, admin_notes: notes });
          }
        }
        localStorage.setItem('satguru_my_partner_applications', JSON.stringify(localApps));
        window.dispatchEvent(new CustomEvent('satguru:partner_requests_updated'));
      } catch (err) {
        console.warn('Error saving updated partner request to localStorage:', err);
      }

      toast({ title: `Status Updated to ${status.replace('_', ' ').toUpperCase()}` });
      await loadRequests();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally { setUpdatingId(null); }
  };

    const handleApproveWithCredentials = async () => {
    if (!credentialDialog.request || !credEmail || !credPassword || !credentialDialog.type) return;

    // Strict validation: Admin CANNOT provide username & password until training is completed!
    const stats = trainingService.getEmployeeStats(credentialDialog.request.id, credentialDialog.type);
    const isTrained = credentialDialog.request.status === 'training_completed' || (stats.totalLessons > 0 && stats.completedLessons >= stats.totalLessons);
    if (!isTrained) {
      toast({
        title: 'Credentials Locked 🔒',
        description: 'Candidate training must be completed before login credentials can be issued.',
        variant: 'destructive',
      });
      return;
    }

    setUpdatingId(credentialDialog.request.id);
    try {
      const table = credentialDialog.type === 'stylist' ? 'stylist_requests' : 'associate_requests';
      const cleanEmail = credEmail.toLowerCase().trim();
      try {
        await supabase.from(table).update({
          status: 'approved',
          approved_email: cleanEmail,
          approved_password: credPassword,
        }).eq('id', credentialDialog.request.id);
      } catch (err) {
        console.warn('Supabase update credentials warning:', err);
      }

      // 1. Immediately update React state so the UI updates without delay
      if (credentialDialog.type === 'stylist') {
        setStylistRequests(prev => prev.map(s => (s.id === credentialDialog.request.id || s.email === credentialDialog.request.email ? { ...s, status: 'approved', approved_email: cleanEmail, approved_password: credPassword } : s)));
      } else {
        setAssociateRequests(prev => prev.map(a => (a.id === credentialDialog.request.id || a.email === credentialDialog.request.email ? { ...a, status: 'approved', approved_email: cleanEmail, approved_password: credPassword } : a)));
      }

      // 2. Persist to localStorage so user profile and partner login update permanently
      try {
        const localApps = JSON.parse(localStorage.getItem('satguru_my_partner_applications') || '[]');
        const idx = localApps.findIndex((a: any) => a.id === credentialDialog.request.id || a.email === credentialDialog.request.email);
        if (idx >= 0) {
          localApps[idx] = {
            ...localApps[idx],
            status: 'approved',
            approved_email: cleanEmail,
            approved_password: credPassword,
          };
        } else {
          localApps.unshift({
            ...credentialDialog.request,
            type: credentialDialog.type,
            status: 'approved',
            approved_email: cleanEmail,
            approved_password: credPassword,
          });
        }
        localStorage.setItem('satguru_my_partner_applications', JSON.stringify(localApps));
        window.dispatchEvent(new CustomEvent('satguru:partner_requests_updated'));
      } catch (err) {
        console.warn('Error saving approved credentials to localStorage:', err);
      }

      toast({ title: 'Approved & Credentials Set! 🎉', description: `Login: ${cleanEmail} / ${credPassword}` });
      setCredentialDialog({ open: false, request: null, type: null });
      setCredEmail(''); setCredPassword('');
      await loadRequests();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally { setUpdatingId(null); }
  };

    const replyToTicket = async (id: string, isContact = false) => {
    if (!replyText.trim()) return;
    const table = isContact ? 'contact_queries' : 'support_tickets';
    await supabase.from(table).update({ admin_reply: replyText, status: 'replied', replied_at: new Date().toISOString() }).eq('id', id);
    toast({ title: 'Reply sent!' });
    setReplyingId(null); setReplyText('');
    isContact ? loadContactQueries() : loadSupportTickets();
  };

  const toggleFeaturedReview = async (id: string, featured: boolean) => {
    try {
      await adminCall('update_review', { reviewId: id, featured: !featured });
      toast({ title: !featured ? '⭐ Review Featured!' : 'Review Unfeatured' });
      await loadReviews();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !newImageTitle) { toast({ title: 'Error', description: 'Enter title first', variant: 'destructive' }); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `gallery-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('gallery').upload(path, file);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path);
      const maxOrder = galleryImages.length > 0 ? Math.max(...galleryImages.map(i => i.display_order)) : 0;
      const { error: dbErr } = await supabase.from('gallery_images').insert({ title: newImageTitle, url: publicUrl, storage_path: path, display_order: maxOrder + 1 });
      if (dbErr) throw dbErr;
      toast({ title: 'Image Uploaded!' });
      setNewImageTitle('');
      e.target.value = '';
      loadGallery();
    } catch (e: any) {
      toast({ title: 'Upload Failed', description: e.message, variant: 'destructive' });
    } finally { setUploading(false); }
  };

  const startScanner = async () => {
    try {
      setScanError(''); setScanResult(null); setScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
    } catch { setScanError('Camera access denied. Please allow camera permissions.'); setScanning(false); }
  };

  const stopScanner = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setScanning(false);
  };

  const lookupQrCode = async (qrCode: string) => {
    stopScanner();
    try {
      const { data: booking } = await supabase.from('bookings').select('*').eq('qr_code', qrCode).single();
      setScanResult(booking ? { type: 'booking', data: booking } : { type: 'not_found', qr: qrCode });
    } catch { setScanResult({ type: 'not_found', qr: qrCode }); }
  };

  const reorderImage = async (img: GalleryImage, dir: 'up' | 'down') => {
    const sorted = [...galleryImages].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex(i => i.id === img.id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx], b = sorted[swapIdx];
    await supabase.from('gallery_images').update({ display_order: b.display_order }).eq('id', a.id);
    await supabase.from('gallery_images').update({ display_order: a.display_order }).eq('id', b.id);
    loadGallery();
  };

  // Excel export
  const exportToExcel = (data: any[], filename: string) => {
    const csvRows: string[] = [];
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(','));
    data.forEach(row => {
      const values = headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return '';
        const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });
    const csv = csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filename}-${new Date().toLocaleDateString('en-IN').replace(/\//g,'-')}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast({ title: `Exported ${data.length} records`, description: `Saved as ${filename}.csv` });
  };

  // ── STORY BANNERS (Original Feature) ──
  const handleUploadStory = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !newStory.title) { toast({ title: 'Enter title first', variant: 'destructive' }); return; }
    setUploadingStory(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `stories/story-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('gallery').upload(path, file);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(newStory.expires_days || '7'));
      const maxOrder = storyBanners.length > 0 ? Math.max(...storyBanners.map(s => s.display_order)) : 0;
      const { error: dbErr } = await supabase.from('story_banners').insert({
        title: newStory.title, image_url: publicUrl, link_url: newStory.link_url || null,
        expires_at: expiresAt.toISOString(), active: true, display_order: maxOrder + 1,
      });
      if (dbErr) throw dbErr;
      toast({ title: 'Story Added!' });
      setNewStory({ title: '', link_url: '', expires_days: '7' });
      e.target.value = '';
      loadStories();
    } catch (e: any) {
      toast({ title: 'Upload Failed', description: e.message, variant: 'destructive' });
    } finally { setUploadingStory(false); }
  };

  const deleteStory = async (id: string) => {
    if (!confirm('Delete this story?')) return;
    await supabase.from('story_banners').delete().eq('id', id);
    toast({ title: 'Story deleted' });
    loadStories();
  };

  const toggleStory = async (id: string, active: boolean) => {
    await supabase.from('story_banners').update({ active: !active }).eq('id', id);
    loadStories();
  };

  // ── LATEST STORIES (Dedicated Circles Feature) ──
  const handleCreateLatestStory = async () => {
    if (!newLatestStory.title.trim()) {
      toast({ title: 'Enter Title', description: 'Please enter a title for the story circle.', variant: 'destructive' });
      return;
    }
    if (!newLatestStory.image_url.trim()) {
      toast({ title: 'Image Required', description: 'Please enter image URL, upload an image, or choose a preset.', variant: 'destructive' });
      return;
    }
    setUploadingLatestStory(true);
    try {
      await addLatestStory(newLatestStory);
      toast({ title: 'Latest Story Added!', description: `"${newLatestStory.title}" is now live in homepage circles.` });
      setNewLatestStory({ title: '', image_url: '', link_url: '', expires_days: '7' });
      loadLatestStories();
    } catch (err: any) {
      toast({ title: 'Failed to add', description: err.message, variant: 'destructive' });
    } finally {
      setUploadingLatestStory(false);
    }
  };

  const handleUploadLatestStoryFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLatestStory(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `latest-stories/story-${Date.now()}.${ext}`;
      let publicUrl = '';
      const { error: upErr } = await supabase.storage.from('gallery').upload(path, file);
      if (!upErr) {
        const { data: { publicUrl: url } } = supabase.storage.from('gallery').getPublicUrl(path);
        publicUrl = url;
      } else {
        publicUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }
      setNewLatestStory(prev => ({
        ...prev,
        image_url: publicUrl,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
      }));
      toast({ title: 'Image Selected' });
    } catch (err: any) {
      toast({ title: 'Upload error', description: err.message, variant: 'destructive' });
    } finally {
      setUploadingLatestStory(false);
      e.target.value = '';
    }
  };

  const handleDeleteLatestStory = async (id: string) => {
    if (!confirm('Delete this latest story circle?')) return;
    await deleteLatestStory(id);
    toast({ title: 'Story circle deleted' });
    loadLatestStories();
  };

  const handleToggleLatestStory = async (id: string, active: boolean) => {
    await toggleLatestStory(id, active);
    toast({ title: active ? '⏸ Story Paused' : '▶ Story Activated' });
    loadLatestStories();
  };

  const deleteImage = async (img: GalleryImage) => {
    if (!confirm(`Delete "${img.title}"?`)) return;
    await supabase.storage.from('gallery').remove([img.storage_path]);
    await supabase.from('gallery_images').delete().eq('id', img.id);
    toast({ title: 'Deleted' });
    loadGallery();
  };

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      serviced: 'bg-blue-100 text-blue-800 border-blue-200',
      approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      executive_assigned: 'bg-purple-100 text-purple-800 border-purple-200',
      on_the_way: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      arrived: 'bg-teal-100 text-teal-800 border-teal-200',
      training: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
      training_completed: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
      documents_received: 'bg-sky-100 text-sky-800 border-sky-200',
      kyc_verification: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      resubmission_required: 'bg-orange-100 text-orange-900 border-orange-300',
    };
    return map[s] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-pink-600 flex items-center justify-center mx-auto shadow-xl">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display text-white">Admin Console</h2>
            <p className="text-xs text-white/60 mt-2">
              Administrator privileges are required to access this control panel. Please sign in with your administrator account.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Button
              onClick={() => {
                login({
                  id: 'admin-charv',
                  email: ADMIN_EMAIL,
                  username: 'Charv Raj',
                  role: 'admin',
                } as any);
                toast({ title: 'Admin Authorized! 👑', description: 'Opening Admin Control Center...' });
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 text-xs gap-2 shadow-lg"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              Sign In as Admin (Charv Raj) →
            </Button>
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10 h-11 text-xs gap-2"
            >
              Sign In with Other Email
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="w-full text-xs text-white/50 hover:text-white"
            >
              Back to Storefront
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const pendingCount = bookings.filter(b => b.status === 'pending').length + orders.filter(o => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="container-custom py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-pink-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Updated {lastUpdate.toLocaleTimeString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Direct Header Button to Add Query Resolver */}
            <Button
              onClick={() => {
                setActiveTab('query-resolvers');
                setAddResolverDialogOpen(true);
              }}
              className="btn-primary text-xs h-9 px-3 gap-1.5 shadow-sm"
              title="Add a new query resolver person"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>+ Add Resolver</span>
            </Button>

            {newNotifications > 0 && (
              <div className="relative">
                <Bell className="w-6 h-6 text-primary" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {newNotifications}
                </span>
              </div>
            )}
            <Button onClick={loadAll} variant="outline" size="sm" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Home
            </Button>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Interactive Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Bookings', value: stats.bookings || bookings.length, icon: Calendar, color: 'from-violet-500 to-purple-600', tab: 'bookings' as Tab },
            { label: 'Total Orders', value: stats.orders || orders.length, icon: Package, color: 'from-pink-500 to-rose-600', tab: 'orders' as Tab },
            { label: 'Total Customers', value: stats.users, icon: Users, color: 'from-blue-500 to-cyan-600', tab: 'wallet' as Tab },
            { label: 'Revenue', value: `₹${(stats.revenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'from-emerald-500 to-green-600', tab: 'analytics' as Tab },
          ].map(({ label, value, icon: Icon, color, tab }) => (
            <Card
              key={label}
              onClick={() => setActiveTab(tab)}
              className="border border-border/60 shadow-md hover:shadow-xl hover:border-primary/50 hover:-translate-y-1 transition-all cursor-pointer overflow-hidden group bg-card"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-0.5">
                    View <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                </div>
                <p className="text-2xl font-bold mb-1 tracking-tight">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pending Alert */}
        {pendingCount > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
            <Bell className="w-5 h-5 text-amber-600 animate-pulse" />
            <p className="text-amber-800 font-semibold">
              {pendingCount} new request{pendingCount > 1 ? 's' : ''} waiting for your action!
            </p>
          </div>
        )}

        {/* Two-Column Layout with Collapsible Left Panel */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Collapsible Left Sidebar */}
          <aside
            className={`transition-all duration-300 flex-shrink-0 w-full ${
              isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
            }`}
          >
            <div className="bg-card border border-border/80 rounded-3xl p-3 sm:p-4 shadow-sm lg:sticky lg:top-20">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
                {!isSidebarCollapsed && (
                  <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Admin Modules
                  </span>
                )}
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-1.5 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-all ml-auto border border-border/50"
                  title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                >
                  {isSidebarCollapsed ? <ChevronRight className="w-4 h-4 text-primary" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
              </div>

              <nav className="space-y-1">
                {([
                  { key: 'dashboard', label: 'Overview', icon: BarChart3, count: null },
                  { key: 'query-resolvers', label: 'Query Resolvers', icon: Headphones, count: queryResolversList.length || null },
                  { key: 'bookings', label: 'Bookings', icon: Calendar, count: bookings.length },
                  { key: 'orders', label: 'Orders', icon: ShoppingBag, count: orders.length },
                  { key: 'services', label: 'Services & Mehndi', icon: Package, count: (doorstepServicesList.length + mehndiServicesList.length) || null },
                  { key: 'banners', label: 'Promo Banners', icon: Sparkles, count: null },
                  { key: 'requests', label: 'Requests', icon: Users, count: stylistRequests.length + associateRequests.length },
                  { key: 'courses', label: 'Manage Courses', icon: GraduationCap, count: null },
                  { key: 'gallery', label: 'Gallery', icon: ImageIcon, count: galleryImages.length },
                  { key: 'reviews', label: 'Reviews', icon: Star, count: reviews.length },
                  { key: 'stories', label: 'Story Banners', icon: BookOpen, count: storyBanners.filter(s=>s.active).length },
                  { key: 'latest-stories', label: 'Latest Stories', icon: Sparkles, count: latestStories.filter(s=>s.active).length },
                  { key: 'analytics', label: 'Analytics', icon: Activity, count: null },
                  { key: 'support', label: 'Support Tickets', icon: HelpCircle, count: supportTickets.filter(t=>t.status==='open').length || null },
                  { key: 'contacts', label: 'Contact Messages', icon: MessageSquare, count: contactQueries.filter(c=>c.status==='unread').length || null },
                  { key: 'announcements', label: 'Announce', icon: Megaphone, count: null },
                  { key: 'sos', label: 'SOS', icon: AlertTriangle, count: sosRequests.filter(s=>s.status==='active').length || null },
                  { key: 'stylists', label: 'Stylists', icon: UserCheck, count: approvedStylists.length || null },
                  { key: 'wallet', label: 'Wallet', icon: Award, count: null },
                  { key: 'complaints', label: 'Complaints', icon: AlertTriangle, count: allComplaints.filter(c => c.status === 'open').length || null },
                ] as const).map(({ key, label, icon: Icon, count }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as Tab)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs transition-all ${
                      activeTab === key
                        ? 'bg-primary text-white shadow-md'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
                    }`}
                    title={label}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!isSidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left truncate">{label}</span>
                        {count !== null && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            activeTab === key ? 'bg-white/20 text-white' : 'bg-secondary text-foreground'
                          }`}>
                            {count}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Right Content */}
          <div className="flex-1 min-w-0 w-full">

        {/* Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick Command & Date Filter Bar */}
            <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-1 flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Date:
                </span>
                {(['all', 'today', 'week', 'month'] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => setDashboardDateFilter(filterKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      dashboardDateFilter === filterKey
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    {filterKey === 'all' ? 'All Time' : filterKey === 'today' ? 'Today' : filterKey === 'week' ? 'Past 7 Days' : 'This Month'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
                <div className="relative flex-1 md:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search overview..."
                    value={dashboardSearch}
                    onChange={(e) => setDashboardSearch(e.target.value)}
                    className="h-8 pl-8 text-xs rounded-xl"
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab('announcements')}
                  className="h-8 text-xs gap-1.5"
                >
                  <Megaphone className="w-3.5 h-3.5 text-primary" />
                  Announce
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab('scanner')}
                  className="h-8 text-xs gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5 text-primary" />
                  Scanner
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const allData = [
                      ...bookings.map(b => ({ Type: 'Booking', ID: b.id, Customer: b.name, Phone: b.phone, Detail: b.service, Status: b.status, Date: b.preferred_date, Created: b.created_at })),
                      ...orders.map(o => ({ Type: `Order (${o.order_type})`, ID: o.order_number, Customer: o.customer_name, Phone: o.customer_phone, Detail: `₹${o.total}`, Status: o.status, Date: '', Created: o.created_at })),
                    ];
                    exportToExcel(allData, 'satguru-system-overview');
                  }}
                  className="h-8 text-xs gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export All
                </Button>
              </div>
            </div>

            {/* Key Operational Status Badges */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div
                onClick={() => {
                  setRequestFilter('all');
                  setActiveTab('requests');
                }}
                className="bg-card border border-border/70 hover:border-violet-500/50 hover:shadow-md transition-all rounded-2xl p-3.5 cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase">Partner Applications</p>
                  <p className="text-xl font-bold text-violet-600 mt-0.5">
                    {stylistRequests.length + associateRequests.length}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {stylistRequests.filter(s => s.status === 'pending').length + associateRequests.filter(a => a.status === 'pending').length} Pending • {stylistRequests.filter(s => s.status === 'approved').length + associateRequests.filter(a => a.status === 'approved').length} Active
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('stylists')}
                className="bg-card border border-border/70 hover:border-emerald-500/50 hover:shadow-md transition-all rounded-2xl p-3.5 cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase">Stylists Online</p>
                  <p className="text-xl font-bold text-emerald-600 mt-0.5">
                    {approvedStylists.filter(s => s.is_active).length} <span className="text-xs text-muted-foreground font-normal">/ {approvedStylists.length}</span>
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('complaints')}
                className="bg-card border border-border/70 hover:border-amber-500/50 hover:shadow-md transition-all rounded-2xl p-3.5 cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase">Open Complaints</p>
                  <p className="text-xl font-bold text-amber-600 mt-0.5">
                    {allComplaints.filter(c => c.status === 'open').length}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('sos')}
                className={`bg-card border rounded-2xl p-3.5 cursor-pointer flex items-center justify-between transition-all group ${
                  sosRequests.filter(s => s.status === 'active').length > 0
                    ? 'border-red-400 bg-red-50/40 shadow-sm'
                    : 'border-border/70 hover:border-red-400/50 hover:shadow-md'
                }`}
              >
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase">Active SOS Alerts</p>
                  <p className={`text-xl font-bold mt-0.5 ${sosRequests.filter(s => s.status === 'active').length > 0 ? 'text-red-600 animate-pulse' : 'text-foreground'}`}>
                    {sosRequests.filter(s => s.status === 'active').length}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Split View: Pending Bookings & Recent Orders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pending Bookings (Clickable) */}
              <Card className="card-luxury">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    Pending Bookings ({bookings.filter(b => b.status === 'pending').length})
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('bookings')} className="text-xs h-7 text-primary">
                    View All →
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {bookings
                    .filter(b => b.status === 'pending')
                    .filter(b => {
                      if (!dashboardSearch) return true;
                      const q = dashboardSearch.toLowerCase();
                      return b.name.toLowerCase().includes(q) || b.service.toLowerCase().includes(q) || b.phone.includes(q);
                    })
                    .filter(b => {
                      if (dashboardDateFilter === 'all') return true;
                      const d = new Date(b.created_at);
                      const now = new Date();
                      if (dashboardDateFilter === 'today') return d.toDateString() === now.toDateString();
                      if (dashboardDateFilter === 'week') return (now.getTime() - d.getTime()) <= 7 * 86400000;
                      if (dashboardDateFilter === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                      return true;
                    })
                    .slice(0, 6)
                    .map(b => (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBooking(b)}
                        className="p-3 rounded-xl border border-border/70 hover:border-primary/50 hover:bg-primary/5 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">{b.name}</p>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.2 rounded-md border border-amber-200">Pending</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {b.service} • {new Date(b.preferred_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} {b.preferred_time}
                          </p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-muted-foreground" /> {b.phone}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Button
                            size="sm"
                            className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold shadow-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateBookingStatus(b.id, 'confirmed');
                            }}
                            title="Confirm Booking Immediately"
                          ><Check className="w-3.5 h-3.5 mr-1 inline" /> Confirm</Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs text-primary border-primary/30 group-hover:bg-primary group-hover:text-white transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBooking(b);
                            }}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  {bookings.filter(b => b.status === 'pending').length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-70" />
                      <p className="text-sm font-semibold text-foreground">All Clear!</p>
                      <p className="text-xs text-muted-foreground">No pending booking requests waiting.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Orders (Clickable) */}
              <Card className="card-luxury">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-blue-500" />
                    Recent Orders ({orders.length})
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')} className="text-xs h-7 text-primary">
                    View All →
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {orders
                    .filter(o => {
                      if (!dashboardSearch) return true;
                      const q = dashboardSearch.toLowerCase();
                      return o.customer_name.toLowerCase().includes(q) || o.order_number.toLowerCase().includes(q) || o.customer_phone.includes(q);
                    })
                    .filter(o => {
                      if (dashboardDateFilter === 'all') return true;
                      const d = new Date(o.created_at);
                      const now = new Date();
                      if (dashboardDateFilter === 'today') return d.toDateString() === now.toDateString();
                      if (dashboardDateFilter === 'week') return (now.getTime() - d.getTime()) <= 7 * 86400000;
                      if (dashboardDateFilter === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                      return true;
                    })
                    .slice(0, 6)
                    .map(o => (
                      <div
                        key={o.id}
                        onClick={() => setSelectedOrder(o)}
                        className="p-3 rounded-xl border border-border/70 hover:border-primary/50 hover:bg-primary/5 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">#{o.order_number}</p>
                            <Badge className={`text-[10px] py-0 px-1.5 border ${statusColor(o.status)}`}>
                              {o.status.replace(/_/g, ' ')}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] py-0 px-1.5 ${o.order_type === 'mehndi' ? 'text-rose-700 border-rose-300' : 'text-teal-700 border-teal-300'}`}>
                              {o.order_type === 'mehndi' ? 'Mehndi' : 'Doorstep'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {o.customer_name} • {Array.isArray(o.services) ? `${o.services.length} items` : '1 service'}
                          </p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-muted-foreground" /> {new Date(o.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="text-right flex flex-col items-end flex-shrink-0">
                          <p className="font-bold text-base text-primary">₹{o.total}</p>
                          <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-0.5">
                            Details <Eye className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  {orders.length === 0 && (
                    <div className="text-center py-8">
                      <ShoppingBag className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-semibold text-foreground">No Orders Yet</p>
                      <p className="text-xs text-muted-foreground">Orders will stream here in real-time.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Incoming Partner & Stylist Applications (Live Onboarding Desk) */}
            <Card className="card-luxury">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Incoming Partner Applications & Staff Training Desk ({stylistRequests.length + associateRequests.length})
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Live candidate applications, compliance checks, and academy training progress
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('courses')} className="text-xs h-7 gap-1 text-primary border-primary/30">
                    <GraduationCap className="w-3.5 h-3.5" /> Manage Courses
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('requests')} className="text-xs h-7 text-primary">
                    Open Requests Tab →
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {stylistRequests.length === 0 && associateRequests.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-xs">
                    No partner requests currently awaiting action.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Recent Stylist Inquiries */}
                    {stylistRequests.slice(0, 3).map(r => {
                      const stats = trainingService.getEmployeeStats(r.id, 'stylist');
                      const isDone = r.status === 'training_completed' || (stats.totalLessons > 0 && stats.completedLessons >= stats.totalLessons);
                      const isApproved = r.status === 'approved';

                      return (
                        <div
                          key={r.id}
                          onClick={() => {
                            setSelectedStylist(r);
                          }}
                          className="p-3.5 rounded-xl border border-border/70 hover:border-primary/50 bg-card hover:bg-muted/20 transition-all cursor-pointer group shadow-xs space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{r.full_name}</span>
                              <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">Stylist</Badge>
                            </div>
                            <Badge className={`border ${statusColor(r.status)} text-[10px]`}>{r.status.toUpperCase()}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{r.specialization || 'Beauty Expert'} • {r.experience_years || 3} yrs exp • {r.phone}</p>

                          {/* Mini Training Progress */}
                          <div className="space-y-1 pt-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <GraduationCap className="w-3.5 h-3.5 text-primary" /> Training Progress:
                              </span>
                              <span className="font-semibold text-foreground">
                                {isApproved ? '✓ Account Active' : isDone ? '✓ 100% Complete' : `${stats.completedLessons}/${stats.totalLessons} Lessons (${stats.completionPercentage}%)`}
                              </span>
                            </div>
                            <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full ${isApproved || isDone ? 'bg-emerald-500' : stats.completedLessons > 0 ? 'bg-amber-500' : 'bg-rose-400'}`}
                                style={{ width: `${Math.max(stats.completionPercentage, (isDone || isApproved) ? 100 : 0)}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 text-[11px]">
                            <span className="text-muted-foreground">Click to inspect docs</span>
                            {isApproved ? (
                              <span className="text-emerald-700 font-bold">✓ Portal Issued</span>
                            ) : isDone ? (
                              <span className="text-emerald-600 font-bold flex items-center gap-1">
                                <Key className="w-3 h-3" /> Ready for Credentials
                              </span>
                            ) : (
                              <span className="text-amber-700 font-medium flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Credentials Locked
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Recent Associate Inquiries */}
                    {associateRequests.slice(0, 3).map(r => {
                      const stats = trainingService.getEmployeeStats(r.id, 'associate');
                      const isDone = r.status === 'training_completed' || (stats.totalLessons > 0 && stats.completedLessons >= stats.totalLessons);
                      const isApproved = r.status === 'approved';

                      return (
                        <div
                          key={r.id}
                          onClick={() => {
                            setSelectedAssociate(r);
                          }}
                          className="p-3.5 rounded-xl border border-border/70 hover:border-primary/50 bg-card hover:bg-muted/20 transition-all cursor-pointer group shadow-xs space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{r.shop_name}</span>
                              <Badge className="text-[10px] bg-blue-100 text-blue-800 border-blue-200">Associate</Badge>
                            </div>
                            <Badge className={`border ${statusColor(r.status)} text-[10px]`}>{r.status.toUpperCase()}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">Owner: {r.owner_name} • {r.city || 'Delhi'} • {r.phone}</p>

                          {/* Mini Training Progress */}
                          <div className="space-y-1 pt-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <GraduationCap className="w-3.5 h-3.5 text-primary" /> SOP Training:
                              </span>
                              <span className="font-semibold text-foreground">
                                {isApproved ? '✓ Partner Active' : isDone ? '✓ 100% Complete' : `${stats.completedLessons}/${stats.totalLessons} Lessons (${stats.completionPercentage}%)`}
                              </span>
                            </div>
                            <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full ${isApproved || isDone ? 'bg-emerald-500' : stats.completedLessons > 0 ? 'bg-amber-500' : 'bg-rose-400'}`}
                                style={{ width: `${Math.max(stats.completionPercentage, (isDone || isApproved) ? 100 : 0)}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 text-[11px]">
                            <span className="text-muted-foreground">Click to inspect shop</span>
                            {isApproved ? (
                              <span className="text-emerald-700 font-bold">✓ Portal Issued</span>
                            ) : isDone ? (
                              <span className="text-emerald-600 font-bold flex items-center gap-1">
                                <Key className="w-3 h-3" /> Ready for Credentials
                              </span>
                            ) : (
                              <span className="text-amber-700 font-medium flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Credentials Locked
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Clickable Unified System Activity Feed */}
            <Card className="card-luxury">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    Live System Activity Stream
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Click any activity record below to immediately inspect full details, documents, and customer controls
                  </p>
                </div>
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Clickable Everything
                </Badge>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Merge bookings, orders, stylist requests, associate requests into chronological events
                  const activities: Array<{
                    id: string;
                    type: 'booking' | 'order' | 'stylist' | 'associate';
                    title: string;
                    subtitle: string;
                    timestamp: string;
                    badgeText: string;
                    badgeColor: string;
                    icon: any;
                    data: any;
                  }> = [];

                  bookings.slice(0, 10).forEach(b => {
                    activities.push({
                      id: `b-${b.id}`,
                      type: 'booking',
                      title: `Booking: ${b.service}`,
                      subtitle: `Customer: ${b.name} (${b.phone}) • Slot: ${new Date(b.preferred_date).toLocaleDateString('en-IN')} ${b.preferred_time}`,
                      timestamp: b.created_at,
                      badgeText: b.status.toUpperCase(),
                      badgeColor: statusColor(b.status),
                      icon: Calendar,
                      data: b,
                    });
                  });

                  orders.slice(0, 10).forEach(o => {
                    activities.push({
                      id: `o-${o.id}`,
                      type: 'order',
                      title: `Order #${o.order_number} (${o.order_type === 'mehndi' ? 'Mehndi Service' : 'Doorstep Service'})`,
                      subtitle: `Customer: ${o.customer_name} • Total: ₹${o.total} • ${o.address || 'Address provided'}`,
                      timestamp: o.created_at,
                      badgeText: o.status.replace(/_/g, ' ').toUpperCase(),
                      badgeColor: statusColor(o.status),
                      icon: ShoppingBag,
                      data: o,
                    });
                  });

                  stylistRequests.slice(0, 5).forEach(s => {
                    activities.push({
                      id: `sr-${s.id}`,
                      type: 'stylist',
                      title: `Stylist Application: ${s.full_name}`,
                      subtitle: `Specialization: ${s.specialization} • ${s.experience_years} yrs exp • Documents: ${s.portfolio_urls?.length || 0} attached`,
                      timestamp: s.created_at,
                      badgeText: `STYLIST: ${s.status.toUpperCase()}`,
                      badgeColor: statusColor(s.status),
                      icon: Users,
                      data: s,
                    });
                  });

                  associateRequests.slice(0, 5).forEach(a => {
                    activities.push({
                      id: `ar-${a.id}`,
                      type: 'associate',
                      title: `Associate Partner Application: ${a.shop_name}`,
                      subtitle: `Owner: ${a.owner_name} • City: ${a.city}, ${a.state} • Proof: ${a.proof_type || 'Uploaded'}`,
                      timestamp: a.created_at,
                      badgeText: `ASSOCIATE: ${a.status.toUpperCase()}`,
                      badgeColor: statusColor(a.status),
                      icon: Store,
                      data: a,
                    });
                  });

                  const sorted = activities
                    .sort((x, y) => new Date(y.timestamp).getTime() - new Date(x.timestamp).getTime())
                    .slice(0, 12);

                  if (sorted.length === 0) {
                    return (
                      <div className="text-center py-10">
                        <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" />
                        <p className="text-sm font-semibold">No Activity Recorded</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {sorted.map(act => {
                        const Icon = act.icon;
                        return (
                          <div
                            key={act.id}
                            onClick={() => {
                              if (act.type === 'booking') setSelectedBooking(act.data);
                              else if (act.type === 'order') setSelectedOrder(act.data);
                              else if (act.type === 'stylist') setSelectedStylist(act.data);
                              else if (act.type === 'associate') setSelectedAssociate(act.data);
                            }}
                            className="p-3 rounded-xl border border-border/60 hover:border-primary/50 hover:bg-primary/5 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3 min-w-0 pr-3">
                              <div className="w-8 h-8 rounded-lg bg-secondary/80 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-bold text-xs sm:text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                    {act.title}
                                  </p>
                                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold border ${act.badgeColor}`}>
                                    {act.badgeText}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                  {act.subtitle}
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-[11px] text-muted-foreground">
                                {new Date(act.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-0.5">
                                Inspect <ArrowUpRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length > 0 && (
              <div className="flex gap-2 justify-between mb-2 flex-wrap">
                <div className="flex gap-2 flex-wrap">
                  <input value={bookingSearch} onChange={e => setBookingSearch(e.target.value)} placeholder="Search by name, service, phone..."
                    className="h-9 px-3 rounded-xl border border-border text-sm focus:outline-none w-56" />
                  <select value={bookingFilter} onChange={e => setBookingFilter(e.target.value)}
                    className="h-9 px-3 rounded-xl border border-border text-sm focus:outline-none">
                    <option value="all">All Status</option>
                    {['pending','confirmed','completed','cancelled'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                  </select>
                </div>
                <Button onClick={() => exportToExcel(bookings.map(b => ({ Name: b.name, Email: b.email, Phone: b.phone, Service: b.service, Date: b.preferred_date, Time: b.preferred_time, Status: b.status, Message: b.message || '', Booked_At: b.created_at })), 'bookings')} variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />Export CSV
                </Button>
              </div>
            )}
            {loading ? (
              <div className="text-center py-16"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary mb-3" /><p className="text-muted-foreground">Loading bookings...</p></div>
            ) : bookings.length === 0 ? (
              <Card className="card-luxury"><CardContent className="text-center py-16"><Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" /><p className="text-xl font-semibold mb-2">No Bookings Yet</p><p className="text-muted-foreground">Bookings will appear here in real-time</p></CardContent></Card>
            ) : (
              bookings.filter(b => {
                const matchStatus = bookingFilter === 'all' || b.status === bookingFilter;
                const q = bookingSearch.toLowerCase();
                const matchSearch = !q || b.name.toLowerCase().includes(q) || b.service.toLowerCase().includes(q) || b.phone.includes(q) || b.email.toLowerCase().includes(q);
                return matchStatus && matchSearch;
              }).map(b => (
                <Card
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className="card-luxury hover:shadow-xl hover:border-primary/50 transition-all cursor-pointer group relative"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{b.name}</h3>
                          <Badge className={`text-xs border ${statusColor(b.status)}`}>{b.status.toUpperCase()}</Badge>
                          <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full flex items-center gap-1 opacity-80 group-hover:opacity-100">
                            <Eye className="w-3 h-3" /> Inspect Details
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{b.email}</span>
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{b.phone}</span>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold">{new Date(b.preferred_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        <p className="text-muted-foreground">{b.preferred_time}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <Badge variant="outline" className="text-sm font-medium">{b.service}</Badge>
                      {b.message && <p className="text-sm text-muted-foreground bg-muted/60 px-3 py-1 rounded-lg italic">"{b.message}"</p>}
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      {(b as any).stylist_name && (
                        <p className="text-sm text-violet-700 font-medium flex items-center gap-1 mr-2">
                          <User className="w-3.5 h-3.5" /> Stylist: {(b as any).stylist_name} • {(b as any).stylist_phone || ''}
                        </p>
                      )}
                      {b.status === 'pending' && <>
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); updateBookingStatus(b.id, 'confirmed'); }} disabled={updatingId === b.id} className="bg-emerald-600 hover:bg-emerald-700 gap-1 text-xs">
                          {updatingId === b.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Confirm
                        </Button>
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); updateBookingStatus(b.id, 'cancelled'); }} disabled={updatingId === b.id} className="text-red-600 border-red-200 hover:bg-red-50 text-xs">
                          <XCircle className="w-3 h-3 mr-1" /> Cancel
                        </Button>
                      </>}
                      {b.status === 'confirmed' && (
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); updateBookingStatus(b.id, 'completed'); }} disabled={updatingId === b.id} className="bg-blue-600 hover:bg-blue-700 gap-1 text-xs">
                          {updatingId === b.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Mark Complete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBooking(b);
                        }}
                        className="text-xs gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> Full Info & Controls
                      </Button>
                      <p className="text-xs text-muted-foreground self-center">
                        {new Date(b.created_at).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length > 0 && (
              <div className="flex gap-2 justify-between mb-2 flex-wrap">
                <div className="flex gap-2 flex-wrap">
                  <input value={orderSearch} onChange={e => setOrderSearch(e.target.value)} placeholder="Search by name, order no, phone..."
                    className="h-9 px-3 rounded-xl border border-border text-sm focus:outline-none w-56" />
                  <select value={orderFilter} onChange={e => setOrderFilter(e.target.value)}
                    className="h-9 px-3 rounded-xl border border-border text-sm focus:outline-none">
                    <option value="all">All Status</option>
                    {['pending','confirmed','executive_assigned','on_the_way','arrived','serviced','cancelled'].map(s => <option key={s} value={s}>{s.replace(/_/g,' ').toUpperCase()}</option>)}
                  </select>
                </div>
                <Button onClick={() => exportToExcel(orders.map(o => ({ Order_No: o.order_number, Type: o.order_type, Customer: o.customer_name, Email: o.customer_email, Phone: o.customer_phone, Address: o.address, Total: o.total, Status: o.status, Executive: o.executive_name || '', Created: o.created_at })), 'orders')} variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />Export CSV
                </Button>
              </div>
            )}
            {loading ? (
              <div className="text-center py-16"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary mb-3" /><p className="text-muted-foreground">Loading orders...</p></div>
            ) : orders.length === 0 ? (
              <Card className="card-luxury"><CardContent className="text-center py-16"><ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" /><p className="text-xl font-semibold mb-2">No Orders Yet</p><p className="text-muted-foreground">Doorstep & Mehndi orders appear here in real-time</p></CardContent></Card>
            ) : (
              orders.filter(o => {
                const matchStatus = orderFilter === 'all' || o.status === orderFilter;
                const q = orderSearch.toLowerCase();
                const matchSearch = !q || o.customer_name.toLowerCase().includes(q) || o.order_number.toLowerCase().includes(q) || o.customer_phone.includes(q);
                return matchStatus && matchSearch;
              }).map(o => (
                <Card
                  key={o.id}
                  onClick={() => setSelectedOrder(o)}
                  className="card-luxury hover:shadow-xl hover:border-primary/50 transition-all cursor-pointer group relative"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">#{o.order_number}</h3>
                          <Badge className={`text-xs border ${statusColor(o.status)}`}>{o.status.replace(/_/g, ' ').toUpperCase()}</Badge>
                          <Badge variant="outline" className={`text-xs ${o.order_type === 'mehndi' ? 'border-rose-300 text-rose-700' : 'border-teal-300 text-teal-700'}`}>
                            {o.order_type === 'mehndi' ? 'Mehndi Art' : 'Doorstep Salon'}
                          </Badge>
                          <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full flex items-center gap-1 opacity-80 group-hover:opacity-100">
                            <Eye className="w-3 h-3" /> Inspect Order
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{o.customer_name}</span>
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{o.customer_email}</span>
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{o.customer_phone}</span>
                        </div>
                        {o.address && <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{o.address}</p>}
                        {o.executive_name && (
                          <p className="text-sm text-purple-700 mt-1 font-medium flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5 inline" /> Executive: {o.executive_name} ({o.executive_phone})</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-primary">₹{o.total}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(o.created_at).toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    {/* Services list */}
                    {Array.isArray(o.services) && o.services.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {o.services.slice(0, 3).map((s: any, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">{s.name} × {s.quantity}</Badge>
                        ))}
                        {o.services.length > 3 && <Badge variant="secondary" className="text-xs">+{o.services.length - 3} more</Badge>}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 items-center">
                      {o.status === 'pending' && <>
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); updateOrderStatus(o.id, 'confirmed', o.order_type); }} disabled={updatingId === o.id} className="bg-emerald-600 hover:bg-emerald-700 gap-1 text-xs">
                          {updatingId === o.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Confirm
                        </Button>
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setAssignDialog({ open: true, order: o }); setExecName(''); setExecPhone(''); }} className="gap-1 text-xs">
                          <Award className="w-3 h-3" /> Assign Executive
                        </Button>
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); updateOrderStatus(o.id, 'cancelled', o.order_type); }} disabled={updatingId === o.id} className="text-red-600 border-red-200 hover:bg-red-50 text-xs">
                          <XCircle className="w-3 h-3 mr-1" /> Cancel
                        </Button>
                      </>}
                      {o.status === 'confirmed' && (
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setAssignDialog({ open: true, order: o }); setExecName(''); setExecPhone(''); }} className="gap-1 text-xs">
                          <Award className="w-3 h-3" /> Assign Executive
                        </Button>
                      )}
                      {o.status === 'executive_assigned' && (
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); updateOrderStatus(o.id, 'on_the_way', o.order_type); }} disabled={updatingId === o.id} className="bg-indigo-600 hover:bg-indigo-700 gap-1 text-xs"><Navigation className="w-3.5 h-3.5 inline mr-1" /> On The Way</Button>
                      )}
                      {o.status === 'on_the_way' && (
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); updateOrderStatus(o.id, 'arrived', o.order_type); }} disabled={updatingId === o.id} className="bg-teal-600 hover:bg-teal-700 gap-1 text-xs"><MapPin className="w-3.5 h-3.5 inline mr-1" /> Arrived</Button>
                      )}
                      {o.status === 'arrived' && (
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); updateOrderStatus(o.id, 'serviced', o.order_type); }} disabled={updatingId === o.id} className="bg-blue-600 hover:bg-blue-700 gap-1 text-xs">
                          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 inline" /> Mark Serviced</span>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(o);
                        }}
                        className="text-xs gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> Full Info & Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Top Operational Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div
                onClick={() => setRequestFilter('all')}
                className={`bg-card border rounded-2xl p-4 cursor-pointer transition-all ${requestFilter === 'all' ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-border/70 hover:border-primary/40'}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase">Total Inquiries</p>
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stylistRequests.length + associateRequests.length}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{stylistRequests.length} Stylists • {associateRequests.length} Associates</p>
              </div>

              <div
                onClick={() => setRequestFilter('pending')}
                className={`bg-card border rounded-2xl p-4 cursor-pointer transition-all ${requestFilter === 'pending' ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md' : 'border-border/70 hover:border-amber-400/40'}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase">Pending Review</p>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {stylistRequests.filter(s => s.status === 'pending').length + associateRequests.filter(a => a.status === 'pending').length}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Awaiting document check</p>
              </div>

              <div
                onClick={() => setRequestFilter('training')}
                className={`bg-card border rounded-2xl p-4 cursor-pointer transition-all ${requestFilter === 'training' ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-md' : 'border-border/70 hover:border-sky-400/40'}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase">In Training</p>
                  <GraduationCap className="w-4 h-4 text-sky-500" />
                </div>
                <p className="text-2xl font-bold text-sky-600 mt-1">
                  {stylistRequests.filter(s => s.status === 'training').length + associateRequests.filter(a => a.status === 'training').length}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Enrolled in lessons</p>
              </div>

              <div
                onClick={() => setRequestFilter('completed')}
                className={`bg-card border rounded-2xl p-4 cursor-pointer transition-all ${requestFilter === 'completed' ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' : 'border-border/70 hover:border-emerald-400/40'}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase">Training Done</p>
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {stylistRequests.filter(s => s.status === 'training_completed' || trainingService.isTrainingCompleted(s.id, 'stylist')).length +
                   associateRequests.filter(a => a.status === 'training_completed' || trainingService.isTrainingCompleted(a.id, 'associate')).length}
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Ready for login credentials</p>
              </div>

              <div
                onClick={() => setRequestFilter('approved')}
                className={`bg-card border rounded-2xl p-4 cursor-pointer transition-all ${requestFilter === 'approved' ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md' : 'border-border/70 hover:border-emerald-500/40'}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase">Active Portals</p>
                  <Key className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-emerald-700 mt-1">
                  {stylistRequests.filter(s => s.status === 'approved').length + associateRequests.filter(a => a.status === 'approved').length}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Credentials issued</p>
              </div>
            </div>

            {/* Filter Tabs & Export Actions */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 p-1 bg-muted/60 border border-border/80 rounded-xl overflow-x-auto">
                <Button
                  size="sm"
                  variant={requestFilter === 'all' ? 'default' : 'ghost'}
                  onClick={() => setRequestFilter('all')}
                  className="h-8 text-xs font-semibold px-3"
                >
                  All ({stylistRequests.length + associateRequests.length})
                </Button>
                <Button
                  size="sm"
                  variant={requestFilter === 'pending' ? 'default' : 'ghost'}
                  onClick={() => setRequestFilter('pending')}
                  className="h-8 text-xs font-semibold px-3"
                >
                  Pending ({stylistRequests.filter(s => s.status === 'pending').length + associateRequests.filter(a => a.status === 'pending').length})
                </Button>
                <Button
                  size="sm"
                  variant={requestFilter === 'training' ? 'default' : 'ghost'}
                  onClick={() => setRequestFilter('training')}
                  className="h-8 text-xs font-semibold px-3"
                >
                  In Training ({stylistRequests.filter(s => s.status === 'training').length + associateRequests.filter(a => a.status === 'training').length})
                </Button>
                <Button
                  size="sm"
                  variant={requestFilter === 'completed' ? 'default' : 'ghost'}
                  onClick={() => setRequestFilter('completed')}
                  className="h-8 text-xs font-semibold px-3"
                >
                  Training Completed ({stylistRequests.filter(s => s.status === 'training_completed' || trainingService.isTrainingCompleted(s.id, 'stylist')).length +
                   associateRequests.filter(a => a.status === 'training_completed' || trainingService.isTrainingCompleted(a.id, 'associate')).length})
                </Button>
                <Button
                  size="sm"
                  variant={requestFilter === 'approved' ? 'default' : 'ghost'}
                  onClick={() => setRequestFilter('approved')}
                  className="h-8 text-xs font-semibold px-3"
                >
                  Approved ({stylistRequests.filter(s => s.status === 'approved').length + associateRequests.filter(a => a.status === 'approved').length})
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setActiveTab('courses')}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/5 font-semibold"
                >
                  <GraduationCap className="w-4 h-4" /> Manage Courses
                </Button>
                {stylistRequests.length > 0 && (
                  <Button onClick={() => exportToExcel(stylistRequests.map(r => ({ Name: r.full_name, Email: r.email, Phone: r.phone, Specialization: r.specialization, Experience: r.experience_years, Bio: r.bio, Status: r.status, Applied_At: r.created_at })), 'stylist-requests')} variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Download className="w-3.5 h-3.5" /> Stylists
                  </Button>
                )}
                {associateRequests.length > 0 && (
                  <Button onClick={() => exportToExcel(associateRequests.map(r => ({ Shop: r.shop_name, Owner: r.owner_name, Email: r.email, Phone: r.phone, Address: r.address, Area: r.area, City: r.city, State: r.state, Status: r.status, Applied_At: r.created_at })), 'associate-requests')} variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Download className="w-3.5 h-3.5" /> Associates
                  </Button>
                )}
              </div>
            </div>

            {/* Stylist Partner Requests */}
            {(() => {
              const filteredStylists = stylistRequests.filter(r => {
                if (requestFilter === 'all') return true;
                const stats = trainingService.getEmployeeStats(r.id, 'stylist');
                const isDone = r.status === 'training_completed' || (stats.totalLessons > 0 && stats.completedLessons >= stats.totalLessons);
                if (requestFilter === 'pending') return r.status === 'pending';
                if (requestFilter === 'training') return r.status === 'training' || (r.status !== 'approved' && !isDone && stats.completedLessons > 0);
                if (requestFilter === 'completed') return isDone && r.status !== 'approved';
                if (requestFilter === 'approved') return r.status === 'approved';
                return true;
              });

              return (
                <Card className="card-luxury">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                      <Users className="w-5 h-5 text-primary" />
                      Stylist Applications ({filteredStylists.length})
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {requestFilter.toUpperCase()} FILTER
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {filteredStylists.length === 0 ? (
                      <div className="text-center py-8 border border-dashed rounded-2xl">
                        <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-60" />
                        <p className="text-sm font-semibold text-muted-foreground">No stylist applications match "{requestFilter}" filter</p>
                      </div>
                    ) : (
                      filteredStylists.map(r => {
                        const stats = trainingService.getEmployeeStats(r.id, 'stylist');
                        const isDone = r.status === 'training_completed' || (stats.totalLessons > 0 && stats.completedLessons >= stats.totalLessons);
                        const isApproved = r.status === 'approved';

                        return (
                          <div
                            key={r.id}
                            onClick={() => setSelectedStylist(r)}
                            className="border border-border/70 hover:border-primary/50 hover:bg-muted/15 transition-all rounded-2xl p-5 cursor-pointer group shadow-xs space-y-4"
                          >
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-bold text-lg group-hover:text-primary transition-colors text-foreground">{r.full_name}</h4>
                                  <Badge className={`border ${statusColor(r.status)} text-xs`}>{r.status.toUpperCase()}</Badge>
                                  <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full flex items-center gap-1 opacity-80 group-hover:opacity-100">
                                    <Eye className="w-3 h-3" /> Inspect Details & Documents
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-primary" />{r.email}</span>
                                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-emerald-600" />{r.phone}</span>
                                </div>
                                <div className="flex gap-2 mt-2 flex-wrap items-center">
                                  <Badge variant="secondary" className="text-xs">{r.specialization || 'Beauty Expert'}</Badge>
                                  <Badge variant="outline" className="text-xs">{r.experience_years || 3} yrs experience</Badge>
                                  {Array.isArray(r.portfolio_urls) && r.portfolio_urls.length > 0 && (
                                    <Badge className="bg-violet-100 text-violet-800 border-violet-200 text-xs gap-1">
                                      <FileText className="w-3.5 h-3.5 inline mr-1" /> {r.portfolio_urls.length} Portfolio & Documents
                                    </Badge>
                                  )}
                                </div>
                                {r.bio && <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">"{r.bio}"</p>}

                                {/* Documents Thumbnails */}
                                {Array.isArray(r.portfolio_urls) && r.portfolio_urls.length > 0 && (
                                  <div className="mt-3 flex items-center gap-2 overflow-x-auto py-1">
                                    {r.portfolio_urls.slice(0, 4).map((url, i) => (
                                      <div
                                        key={i}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedImagePreview({ url, title: `${r.full_name} - Document #${i + 1}` });
                                        }}
                                        className="w-12 h-12 rounded-lg overflow-hidden border border-border flex-shrink-0 bg-black/5 hover:scale-105 transition-transform"
                                        title="Click to enlarge"
                                      >
                                        <img src={url} alt="Doc preview" className="w-full h-full object-cover" />
                                      </div>
                                    ))}
                                    {r.portfolio_urls.length > 4 && (
                                      <span className="text-xs text-muted-foreground font-semibold">+{r.portfolio_urls.length - 4} more</span>
                                    )}
                                  </div>
                                )}
                                <p className="text-[11px] text-muted-foreground mt-2">Applied: {new Date(r.created_at).toLocaleString('en-IN')}</p>
                              </div>

                              {/* Secondary Admin Action Buttons */}
                              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedStylist(r);
                                  }}
                                  className="text-xs gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5" /> Full Details & Docs
                                </Button>
                                <div className="flex flex-wrap gap-1.5 justify-end mt-1 max-w-xs">
                                  {r.status !== 'kyc_verification' && !isApproved && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRequest(r.id, 'stylist', 'kyc_verification', 'KYC identity & background check in progress');
                                      }}
                                      className="border-sky-300 text-sky-800 hover:bg-sky-50 text-xs h-7 px-2"
                                    >
                                      <Shield className="w-3 h-3 mr-1" /> KYC
                                    </Button>
                                  )}
                                  {!isApproved && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setResubmitDialog({ open: true, request: r, type: 'stylist', reason: 'Please upload a clear photograph of your Govt ID / Portfolio.' });
                                      }}
                                      className="border-amber-400 text-amber-800 hover:bg-amber-50 text-xs h-7 px-2"
                                    >
                                      <AlertCircle className="w-3 h-3 mr-1" /> Resubmit Doc
                                    </Button>
                                  )}
                                  {r.status !== 'rejected' && !isApproved && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRequest(r.id, 'stylist', 'rejected');
                                      }}
                                      className="text-red-600 border-red-200 text-xs h-7 px-2 hover:bg-red-50"
                                    >
                                      <XIcon className="w-3 h-3 mr-1" /> Reject
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* MANDATORY TRAINING & CREDENTIAL LOCKING SECTION */}
                            <div className="pt-3 border-t border-border/60 bg-muted/30 -mx-5 -mb-5 px-5 py-3 rounded-b-2xl">
                              <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="w-4 h-4 text-primary" />
                                  <span className="text-xs font-bold text-foreground">Stylist Academy Training:</span>
                                  {isApproved ? (
                                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold">✓ Credentials Active</Badge>
                                  ) : isDone ? (
                                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-400 text-[10px] font-bold">✓ 100% Training Completed</Badge>
                                  ) : stats.completedLessons > 0 ? (
                                    <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-semibold">Training In Progress ({stats.completionPercentage}%)</Badge>
                                  ) : (
                                    <Badge className="bg-rose-100 text-rose-800 border-rose-300 text-[10px]">Training Pending (0%)</Badge>
                                  )}
                                </div>
                                <span className="text-xs font-semibold text-muted-foreground">
                                  {stats.completedLessons} / {stats.totalLessons} Lessons Finished ({stats.completionPercentage}%)
                                </span>
                              </div>

                              <div className="w-full bg-border rounded-full h-2 overflow-hidden mb-3">
                                <div
                                  className={`h-full transition-all duration-500 ${isApproved || isDone ? 'bg-emerald-500' : stats.completedLessons > 0 ? 'bg-amber-500' : 'bg-rose-400'}`}
                                  style={{ width: `${Math.max(stats.completionPercentage, (isDone || isApproved) ? 100 : 0)}%` }}
                                />
                              </div>

                              <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {!isApproved && !isDone && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        trainingService.markAllTrainingComplete(r.id, 'stylist');
                                        handleRequest(r.id, 'stylist', 'training_completed', 'Admin verified and marked all practical and service lessons completed.');
                                        toast({ title: 'Training Verified & Completed! 🎉', description: 'Admin can now issue login credentials.' });
                                      }}
                                      className="text-xs h-7 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 gap-1 font-bold shadow-xs"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" /> Verify & Complete Training
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveTab('courses');
                                    }}
                                    className="text-xs h-7 text-muted-foreground hover:text-foreground gap-1"
                                  >
                                    <GraduationCap className="w-3.5 h-3.5 text-primary" /> View Academy Syllabus
                                  </Button>
                                </div>

                                {/* STRICT CREDENTIAL RULE: Cannot provide username/password until training completed */}
                                {!isApproved ? (
                                  isDone ? (
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCredentialDialog({ open: true, request: r, type: 'stylist' });
                                        setCredEmail(r.email);
                                        setCredPassword(`Satguru@${Date.now().toString().slice(-4)}`);
                                      }}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-xs h-8 px-3 gap-1.5 text-white font-bold shadow-sm"
                                    >
                                      <Key className="w-3.5 h-3.5" /> Approve + Set Login
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      disabled
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                      className="opacity-60 cursor-not-allowed bg-stone-100 text-stone-500 border border-stone-300 dark:bg-stone-800 dark:text-stone-400 text-xs h-8 px-3 gap-1.5"
                                      title="Candidate must complete all training lessons before login credentials can be issued."
                                    >
                                      <Lock className="w-3.5 h-3.5 text-amber-600" /> Login Locked (Finish Training First)
                                    </Button>
                                  )
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                                      <Check className="w-3.5 h-3.5" /> Login Active: {r.approved_email || r.email}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRequest(r.id, 'stylist', 'pending', 'Reset by admin to pending review');
                                        toast({ title: 'Application Reset to Pending Review' });
                                      }}
                                      className="text-[10px] h-6 px-2 text-muted-foreground hover:text-amber-700"
                                      title="Reset status back to pending"
                                    >
                                      Reset Status
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              );
            })()}

            {/* Associate Partner Requests */}
            {(() => {
              const filteredAssociates = associateRequests.filter(r => {
                if (requestFilter === 'all') return true;
                const stats = trainingService.getEmployeeStats(r.id, 'associate');
                const isDone = r.status === 'training_completed' || (stats.totalLessons > 0 && stats.completedLessons >= stats.totalLessons);
                if (requestFilter === 'pending') return r.status === 'pending';
                if (requestFilter === 'training') return r.status === 'training' || (r.status !== 'approved' && !isDone && stats.completedLessons > 0);
                if (requestFilter === 'completed') return isDone && r.status !== 'approved';
                if (requestFilter === 'approved') return r.status === 'approved';
                return true;
              });

              return (
                <Card className="card-luxury">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                      <Store className="w-5 h-5 text-primary" />
                      Associate Partner Requests ({filteredAssociates.length})
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {requestFilter.toUpperCase()} FILTER
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {filteredAssociates.length === 0 ? (
                      <div className="text-center py-8 border border-dashed rounded-2xl">
                        <Store className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-60" />
                        <p className="text-sm font-semibold text-muted-foreground">No associate partner requests match "{requestFilter}" filter</p>
                      </div>
                    ) : (
                      filteredAssociates.map(r => {
                        const stats = trainingService.getEmployeeStats(r.id, 'associate');
                        const isDone = r.status === 'training_completed' || (stats.totalLessons > 0 && stats.completedLessons >= stats.totalLessons);
                        const isApproved = r.status === 'approved';

                        return (
                          <div
                            key={r.id}
                            onClick={() => setSelectedAssociate(r)}
                            className="border border-border/70 hover:border-primary/50 hover:bg-muted/15 transition-all rounded-2xl p-5 cursor-pointer group shadow-xs space-y-4"
                          >
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-bold text-lg group-hover:text-primary transition-colors text-foreground">{r.shop_name}</h4>
                                  <Badge className={`border ${statusColor(r.status)} text-xs`}>{r.status.toUpperCase()}</Badge>
                                  <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full flex items-center gap-1 opacity-80 group-hover:opacity-100">
                                    <Eye className="w-3 h-3" /> Inspect Shop & Documents
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-0.5">Owner: <span className="font-medium text-foreground">{r.owner_name}</span></p>
                                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-primary" />{r.email}</span>
                                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-emerald-600" />{r.phone}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                  {r.address}, {r.area}, {r.city}, {r.state}
                                </p>

                                <div className="flex gap-2 mt-2 flex-wrap items-center">
                                  {r.proof_type && (
                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                      <FileText className="w-3.5 h-3.5 inline mr-1" /> Verification: {r.proof_type.toUpperCase()}
                                    </Badge>
                                  )}
                                  {r.photos && Object.keys(r.photos).length > 0 && (
                                    <Badge className="bg-pink-100 text-pink-800 border-pink-200 text-xs">
                                      <Camera className="w-3.5 h-3.5 inline mr-1" /> {Object.keys(r.photos).length} Shop Photos Attached
                                    </Badge>
                                  )}
                                </div>

                                {/* Documents Preview Thumbnails */}
                                <div className="mt-3 flex items-center gap-2 overflow-x-auto py-1">
                                  {r.proof_document_url && (
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (r.proof_document_url?.endsWith('.pdf')) {
                                          window.open(r.proof_document_url, '_blank');
                                        } else {
                                          setSelectedImagePreview({ url: r.proof_document_url || '', title: `${r.shop_name} - ${r.proof_type || 'Proof Document'}` });
                                        }
                                      }}
                                      className="px-2.5 py-1.5 rounded-lg border border-border bg-card flex items-center gap-1.5 text-xs font-semibold hover:border-primary transition-colors"
                                      title="Inspect verification proof"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-primary" />
                                      View {r.proof_type || 'Proof'}
                                    </div>
                                  )}
                                  {r.photos?.insidePhoto && (
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImagePreview({ url: r.photos?.insidePhoto || '', title: `${r.shop_name} - Inside Shop Photo` });
                                      }}
                                      className="w-12 h-12 rounded-lg overflow-hidden border border-border flex-shrink-0 hover:scale-105 transition-transform"
                                      title="Inside photo"
                                    >
                                      <img src={r.photos.insidePhoto} alt="Inside" className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  {r.photos?.outsidePhoto && (
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImagePreview({ url: r.photos?.outsidePhoto || '', title: `${r.shop_name} - Outside Shop Photo` });
                                      }}
                                      className="w-12 h-12 rounded-lg overflow-hidden border border-border flex-shrink-0 hover:scale-105 transition-transform"
                                      title="Outside photo"
                                    >
                                      <img src={r.photos.outsidePhoto} alt="Outside" className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-2">Applied: {new Date(r.created_at).toLocaleString('en-IN')}</p>
                              </div>

                              {/* Secondary Admin Actions */}
                              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAssociate(r);
                                  }}
                                  className="text-xs gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5" /> Full Shop Info & Docs
                                </Button>
                                <div className="flex flex-wrap gap-1.5 justify-end mt-1 max-w-xs">
                                  {r.status !== 'kyc_verification' && !isApproved && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRequest(r.id, 'associate', 'kyc_verification', 'Shop address & trade verification in progress');
                                      }}
                                      className="border-sky-300 text-sky-800 hover:bg-sky-50 text-xs h-7 px-2"
                                    >
                                      <Shield className="w-3 h-3 mr-1" /> KYC
                                    </Button>
                                  )}
                                  {!isApproved && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setResubmitDialog({ open: true, request: r, type: 'associate', reason: 'Please upload a clear photograph of your Trade License or Salon premise.' });
                                      }}
                                      className="border-amber-400 text-amber-800 hover:bg-amber-50 text-xs h-7 px-2"
                                    >
                                      <AlertCircle className="w-3 h-3 mr-1" /> Resubmit Doc
                                    </Button>
                                  )}
                                  {r.status !== 'rejected' && !isApproved && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRequest(r.id, 'associate', 'rejected');
                                      }}
                                      className="text-red-600 border-red-200 text-xs h-7 px-2 hover:bg-red-50"
                                    >
                                      <XIcon className="w-3 h-3 mr-1" /> Reject
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* MANDATORY ASSOCIATE TRAINING & CREDENTIAL LOCKING SECTION */}
                            <div className="pt-3 border-t border-border/60 bg-muted/30 -mx-5 -mb-5 px-5 py-3 rounded-b-2xl">
                              <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="w-4 h-4 text-primary" />
                                  <span className="text-xs font-bold text-foreground">Associate Operations & Hygiene Training:</span>
                                  {isApproved ? (
                                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold">✓ Credentials Active</Badge>
                                  ) : isDone ? (
                                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-400 text-[10px] font-bold">✓ 100% Training Completed</Badge>
                                  ) : stats.completedLessons > 0 ? (
                                    <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-semibold">Training In Progress ({stats.completionPercentage}%)</Badge>
                                  ) : (
                                    <Badge className="bg-rose-100 text-rose-800 border-rose-300 text-[10px]">Training Pending (0%)</Badge>
                                  )}
                                </div>
                                <span className="text-xs font-semibold text-muted-foreground">
                                  {stats.completedLessons} / {stats.totalLessons} Lessons Finished ({stats.completionPercentage}%)
                                </span>
                              </div>

                              <div className="w-full bg-border rounded-full h-2 overflow-hidden mb-3">
                                <div
                                  className={`h-full transition-all duration-500 ${isApproved || isDone ? 'bg-emerald-500' : stats.completedLessons > 0 ? 'bg-amber-500' : 'bg-rose-400'}`}
                                  style={{ width: `${Math.max(stats.completionPercentage, (isDone || isApproved) ? 100 : 0)}%` }}
                                />
                              </div>

                              <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {!isApproved && !isDone && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        trainingService.markAllTrainingComplete(r.id, 'associate');
                                        handleRequest(r.id, 'associate', 'training_completed', 'Admin verified and marked all operational compliance lessons completed.');
                                        toast({ title: 'Training Verified & Completed! 🎉', description: 'Admin can now issue login credentials.' });
                                      }}
                                      className="text-xs h-7 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 gap-1 font-bold shadow-xs"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" /> Verify & Complete Training
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveTab('courses');
                                    }}
                                    className="text-xs h-7 text-muted-foreground hover:text-foreground gap-1"
                                  >
                                    <GraduationCap className="w-3.5 h-3.5 text-primary" /> View SOP Syllabus
                                  </Button>
                                </div>

                                {/* STRICT CREDENTIAL RULE: Cannot provide username/password until training completed */}
                                {!isApproved ? (
                                  isDone ? (
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCredentialDialog({ open: true, request: r, type: 'associate' });
                                        setCredEmail(r.email);
                                        setCredPassword(`Satguru@${Date.now().toString().slice(-4)}`);
                                      }}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-xs h-8 px-3 gap-1.5 text-white font-bold shadow-sm"
                                    >
                                      <Key className="w-3.5 h-3.5" /> Approve + Set Login
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      disabled
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                      className="opacity-60 cursor-not-allowed bg-stone-100 text-stone-500 border border-stone-300 dark:bg-stone-800 dark:text-stone-400 text-xs h-8 px-3 gap-1.5"
                                      title="Associate must complete hygiene and doorstep kit training before credentials can be issued."
                                    >
                                      <Lock className="w-3.5 h-3.5 text-amber-600" /> Login Locked (Finish Training First)
                                    </Button>
                                  )
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                                      <Check className="w-3.5 h-3.5" /> Login Active: {r.approved_email || r.email}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRequest(r.id, 'associate', 'pending', 'Reset by admin to pending review');
                                        toast({ title: 'Application Reset to Pending Review' });
                                      }}
                                      className="text-[10px] h-6 px-2 text-muted-foreground hover:text-amber-700"
                                      title="Reset status back to pending"
                                    >
                                      Reset Status
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              );
            })()}
          </div>
        )}

                {/* Manage Courses & Staff Training System */}
        {activeTab === 'courses' && (
          <CourseManagement />
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <Card className="card-luxury">
            <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon className="w-5 h-5 text-primary" />Gallery Management</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-3 mb-6">
                <Input placeholder="Image title..." value={newImageTitle} onChange={(e) => setNewImageTitle(e.target.value)} className="flex-1" />
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading || !newImageTitle} />
                  <Button type="button" disabled={uploading || !newImageTitle} asChild>
                    <span>{uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4 mr-2" />Upload</>}</span>
                  </Button>
                </label>
              </div>
              {galleryImages.length === 0 ? (
                <div className="text-center py-12"><ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No images uploaded yet</p></div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...galleryImages].sort((a,b) => a.display_order - b.display_order).map((img, idx, arr) => (
                    <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square border border-border/40">
                      <img src={img.url} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity p-2">
                        <p className="text-white text-xs font-medium text-center leading-tight">{img.title}</p>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => reorderImage(img, 'up')} disabled={idx === 0} className="h-6 w-6 p-0 bg-white/10 border-white/20 text-white hover:bg-white/20"><MoveUp className="w-3 h-3" /></Button>
                          <Button size="sm" variant="outline" onClick={() => reorderImage(img, 'down')} disabled={idx === arr.length - 1} className="h-6 w-6 p-0 bg-white/10 border-white/20 text-white hover:bg-white/20"><MoveDown className="w-3 h-3" /></Button>
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => deleteImage(img)} className="text-xs h-6 px-2"><Trash2 className="w-3 h-3 mr-1" />Delete</Button>
                      </div>
                      <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">#{idx + 1}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* QR Scanner Tab */}
        {activeTab === 'scanner' && (
          <div className="space-y-6">
            <Card className="card-luxury">
              <CardHeader><CardTitle className="flex items-center gap-2"><QrCode className="w-5 h-5 text-primary" />QR Code Scanner — Booking Verification</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2"><Camera className="w-4 h-4 text-primary" />Camera Scanner</h3>
                    <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-square max-w-xs mx-auto mb-4">
                      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                      {!scanning && (<div className="absolute inset-0 flex flex-col items-center justify-center gap-3"><ScanLine className="w-16 h-16 text-white/30" /><p className="text-white/50 text-sm">Camera not active</p></div>)}
                      {scanning && (<div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-40 h-40 border-2 border-primary rounded-xl relative"><div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-primary" /><div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-primary" /><div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-primary" /><div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-primary" /><div className="absolute inset-x-0 top-1/2 h-0.5 bg-primary/60 animate-pulse" /></div></div>)}
                    </div>
                    {scanError && <p className="text-red-500 text-sm mb-3 text-center">{scanError}</p>}
                    <div className="flex gap-2 justify-center">
                      {!scanning ? (<Button onClick={startScanner} className="btn-primary gap-2"><Camera className="w-4 h-4" />Start Camera</Button>) : (<Button onClick={stopScanner} variant="outline" className="gap-2 text-red-600 border-red-200"><XIcon className="w-4 h-4" />Stop Camera</Button>)}
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-3">Point at booking QR code to verify</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2"><QrCode className="w-4 h-4 text-primary" />Manual QR Lookup</h3>
                    <div className="space-y-3">
                      <input id="qr-manual" className="w-full h-10 px-3 rounded-lg border border-border font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Paste QR code (SATGURU-BOOKING-...)" />
                      <Button className="btn-primary w-full gap-2" onClick={() => { const v = (document.getElementById('qr-manual') as HTMLInputElement)?.value; if(v) lookupQrCode(v); }}>
                        <ScanLine className="w-4 h-4" />Look Up Booking
                      </Button>
                    </div>
                    {scanResult && (
                      <div className="mt-5">
                        {scanResult.type === 'booking' ? (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-3"><CheckCircle className="w-5 h-5 text-emerald-600" /><h4 className="font-bold text-emerald-800">Booking Verified!</h4></div>
                            <div className="space-y-2 text-sm">
                              {[['Name', scanResult.data.name], ['Service', scanResult.data.service], ['Date', new Date(scanResult.data.preferred_date).toLocaleDateString('en-IN')], ['Time', scanResult.data.preferred_time], ['Phone', scanResult.data.phone]].map(([k,v]) => (
                                <div key={k} className="flex justify-between"><span className="text-muted-foreground">{k}:</span><span className="font-semibold">{v}</span></div>
                              ))}
                              <div className="flex justify-between"><span className="text-muted-foreground">Status:</span><Badge className={`text-xs border ${statusColor(scanResult.data.status)}`}>{scanResult.data.status.toUpperCase()}</Badge></div>
                            </div>
                            {scanResult.data.status === 'confirmed' && (<Button className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 gap-2" onClick={() => updateBookingStatus(scanResult.data.id, 'completed')}><CheckCircle className="w-4 h-4" />Mark Check-In Complete</Button>)}
                          </div>
                        ) : (
                          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-1"><XCircle className="w-5 h-5 text-red-600" /><h4 className="font-bold text-red-800">Not Found</h4></div>
                            <p className="text-xs text-red-600 font-mono break-all">{scanResult.qr}</p>
                          </div>
                        )}
                        <Button variant="outline" className="w-full mt-2 text-sm" onClick={() => setScanResult(null)}>Clear</Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-6 border-t pt-5">
                  <h3 className="font-semibold mb-3">Today's Bookings — Quick Check-In</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {bookings.filter(b => b.preferred_date === new Date().toISOString().split('T')[0]).map(b => (
                      <div key={b.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                        <div><p className="font-medium text-sm">{b.name}</p><p className="text-xs text-muted-foreground">{b.service} at {b.preferred_time}</p></div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs border ${statusColor(b.status)}`}>{b.status}</Badge>
                          {b.status === 'confirmed' && (<Button size="sm" className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-xs" onClick={() => updateBookingStatus(b.id, 'completed')}>Check In</Button>)}
                        </div>
                      </div>
                    ))}
                    {bookings.filter(b => b.preferred_date === new Date().toISOString().split('T')[0]).length === 0 && (<p className="text-center text-muted-foreground text-sm py-3">No bookings today</p>)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Story Banners Tab (Original Feature) */}
        {activeTab === 'stories' && (
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" />Story Banners Management</span>
                <span className="text-sm font-normal text-muted-foreground">{storyBanners.filter(s=>s.active).length} active</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Upload new story */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl p-5 mb-6 border border-purple-100 dark:border-purple-900/30">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-primary" />Add New Story Banner</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input className="h-10 px-3 rounded-xl border border-border bg-white dark:bg-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Story banner title *" value={newStory.title} onChange={e => setNewStory(p => ({...p, title: e.target.value}))} />
                  <div className="flex items-center gap-2 bg-white dark:bg-stone-900 border border-border rounded-xl px-3">
                    <LinkIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <input className="flex-1 h-10 text-sm focus:outline-none bg-transparent"
                      placeholder="Link URL (optional)" value={newStory.link_url} onChange={e => setNewStory(p => ({...p, link_url: e.target.value}))} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select className="h-10 px-3 rounded-xl border border-border bg-white dark:bg-stone-900 text-sm flex-shrink-0"
                    value={newStory.expires_days} onChange={e => setNewStory(p => ({...p, expires_days: e.target.value}))}>
                    <option value="1">Expires: 1 day</option>
                    <option value="3">Expires: 3 days</option>
                    <option value="7">Expires: 7 days</option>
                    <option value="14">Expires: 14 days</option>
                    <option value="30">Expires: 30 days</option>
                  </select>
                  <label className="cursor-pointer flex-1">
                    <input type="file" accept="image/*" onChange={handleUploadStory} className="hidden" disabled={uploadingStory || !newStory.title} />
                    <Button type="button" disabled={uploadingStory || !newStory.title} className="btn-primary w-full gap-2" asChild>
                      <span>{uploadingStory ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</> : <><Upload className="w-4 h-4" />Upload Banner Image</>}</span>
                    </Button>
                  </label>
                </div>
              </div>

              {/* Stories banner grid */}
              {storyBanners.length === 0 ? (
                <div className="text-center py-12"><BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No story banners yet</p></div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {storyBanners.map(story => (
                    <div key={story.id} className="relative group rounded-2xl overflow-hidden aspect-[3/4] border border-border/40">
                      <img src={story.image_url} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      {!story.active && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white text-xs font-bold bg-red-500 px-2 py-1 rounded-full">Expired/Hidden</span></div>}
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white text-xs font-bold truncate mb-1">{story.title}</p>
                        <p className="text-white/60 text-[10px]">Exp: {new Date(story.expires_at).toLocaleDateString()}</p>
                      </div>
                      <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => toggleStory(story.id, story.active)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs shadow-lg ${story.active ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                          {story.active ? '⏸' : '▶'}
                        </button>
                        <button onClick={() => deleteStory(story.id)}
                          className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Latest Stories Tab (Dedicated Story Circles Feature) */}
        {activeTab === 'latest-stories' && (
          <div className="space-y-6">
            <Card className="card-luxury">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Latest Stories (Instagram Circles)
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Manage circular story avatars displayed at the top of the homepage
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 font-semibold">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> {latestStories.filter(s => s.active).length} Active Circles</span>
                    </Badge>
                    <Badge variant="secondary">
                      {latestStories.length} Total Circles
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* ── CREATE NEW LATEST STORY CIRCLE ── */}
                <div className="bg-gradient-to-br from-amber-500/5 via-rose-500/5 to-purple-500/5 rounded-2xl p-5 sm:p-6 border border-border/80 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
                    <h3 className="font-bold text-base flex items-center gap-2 text-foreground">
                      <Plus className="w-4 h-4 text-primary" />
                      Add New Story Circle
                    </h3>
                    <span className="text-xs text-muted-foreground font-medium">
                      Appears in homepage circular story rings
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Left Form Inputs (8 Cols on Desktop) */}
                    <div className="lg:col-span-8 space-y-4">
                      {/* Story Title */}
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5">
                          Story Title (under circle) *
                        </label>
                        <input
                          type="text"
                          className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="e.g. Bridal Suite 30% OFF"
                          value={newLatestStory.title}
                          onChange={e => setNewLatestStory(p => ({ ...p, title: e.target.value }))}
                        />
                      </div>

                      {/* Expiry & CTA Link */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1.5">
                            Expiration
                          </label>
                          <select
                            className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            value={newLatestStory.expires_days}
                            onChange={e => setNewLatestStory(p => ({ ...p, expires_days: e.target.value }))}
                          >
                            <option value="1">24 Hours</option>
                            <option value="3">3 Days</option>
                            <option value="7">7 Days</option>
                            <option value="14">14 Days</option>
                            <option value="30">30 Days</option>
                            <option value="999">Permanent (No expiry)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1.5">
                            Action Link (Optional)
                          </label>
                          <input
                            type="text"
                            className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="e.g. /#services or /mehndi"
                            value={newLatestStory.link_url}
                            onChange={e => setNewLatestStory(p => ({ ...p, link_url: e.target.value }))}
                          />
                        </div>
                      </div>

                      {/* Image Input Selection */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-foreground">
                            Story Circle Photo *
                          </label>
                          <label className="cursor-pointer text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload from Device</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleUploadLatestStoryFile}
                              className="hidden"
                              disabled={uploadingLatestStory}
                            />
                          </label>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            className="flex-1 h-10 px-3.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
                            placeholder="Paste image URL (https://...)"
                            value={newLatestStory.image_url}
                            onChange={e => setNewLatestStory(p => ({ ...p, image_url: e.target.value }))}
                          />
                          {newLatestStory.image_url && (
                            <button
                              type="button"
                              onClick={() => setNewLatestStory(p => ({ ...p, image_url: '' }))}
                              className="h-10 px-3 text-xs bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-colors"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        {/* Quick 1-Click Circle Presets */}
                        <div className="mt-2.5">
                          <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">
                            Or choose a quick preset circle:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {PRESET_LATEST_STORY_IMAGES.map((preset, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setNewLatestStory(p => ({
                                  ...p,
                                  image_url: preset.url,
                                  title: p.title || preset.label.replace(/^[^a-zA-Z]+/, ''),
                                }))}
                                className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all ${
                                  newLatestStory.image_url === preset.url
                                    ? 'bg-primary text-white border-primary shadow-xs'
                                    : 'bg-background hover:bg-muted text-foreground border-border/70'
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-2">
                        <Button
                          type="button"
                          onClick={handleCreateLatestStory}
                          disabled={uploadingLatestStory || !newLatestStory.title.trim() || !newLatestStory.image_url.trim()}
                          className="btn-primary w-full h-11 text-sm font-bold gap-2 shadow-md shadow-primary/25"
                        >
                          {uploadingLatestStory ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Adding Story Circle...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 inline" /> Add to Homepage Circles</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Right Live Circle Preview (4 Cols on Desktop) */}
                    <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-background/80 rounded-2xl border border-border/60">
                      <p className="text-xs font-bold text-muted-foreground mb-4 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        Live Circle Preview
                      </p>

                      <div className="flex flex-col items-center">
                        {/* Gradient Ring Circle */}
                        <div className="p-1 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600 shadow-lg shadow-rose-500/25">
                          <div className="p-0.5 bg-background rounded-full">
                            <div className="w-20 h-20 rounded-full overflow-hidden relative bg-muted flex items-center justify-center">
                              {newLatestStory.image_url ? (
                                <img
                                  src={newLatestStory.image_url}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                  onError={e => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80';
                                  }}
                                />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-muted-foreground opacity-50" />
                              )}
                              <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-background animate-pulse" />
                            </div>
                          </div>
                        </div>

                        <p className="text-xs font-semibold text-foreground text-center mt-2.5 max-w-[120px] truncate">
                          {newLatestStory.title || 'Story Title'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── EXISTING LATEST STORY CIRCLES LIST ── */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Active Story Circles on Homepage ({latestStories.length})
                    </h3>
                    <Button variant="outline" size="sm" onClick={loadLatestStories} className="gap-1.5 text-xs h-8">
                      <RefreshCw className="w-3.5 h-3.5" />
                      Refresh
                    </Button>
                  </div>

                  {latestStories.length === 0 ? (
                    <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border/80">
                      <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-40" />
                      <p className="text-sm font-semibold text-foreground">No story circles yet</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Create a story circle above</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {latestStories.map(story => (
                        <div
                          key={story.id}
                          className="bg-card border border-border/70 rounded-2xl p-4 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-all group relative"
                        >
                          {/* Circle Avatar */}
                          <div className={`p-0.5 rounded-full mb-2 ${
                            story.active
                              ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600'
                              : 'bg-stone-300 dark:bg-stone-700'
                          }`}>
                            <div className="p-0.5 bg-background rounded-full">
                              <div className="w-16 h-16 rounded-full overflow-hidden">
                                <img
                                  src={story.image_url}
                                  alt={story.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Title */}
                          <p className="text-xs font-bold text-foreground truncate w-full mb-1">
                            {story.title}
                          </p>

                          {/* Status Pill */}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mb-3 ${
                            story.active
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : 'bg-stone-500/10 text-stone-500 border border-stone-500/20'
                          }`}>
                            {story.active ? <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Live Circle</span> : <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Paused</span>}
                          </span>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 w-full mt-auto">
                            <button
                              onClick={() => setPreviewLatestStory(story)}
                              className="flex-1 py-1 px-1 text-[11px] font-semibold bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
                              title="Preview Story Viewer"
                            >
                              <Eye className="w-3.5 h-3.5 mx-auto" />
                            </button>
                            <button
                              onClick={() => handleToggleLatestStory(story.id, story.active)}
                              className={`flex-1 py-1 px-1 text-[11px] font-semibold text-white rounded-lg transition-colors ${
                                story.active ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                              }`}
                              title={story.active ? 'Pause Story' : 'Activate Story'}
                            >
                              {story.active ? '⏸' : '▶'}
                            </button>
                            <button
                              onClick={() => handleDeleteLatestStory(story.id)}
                              className="py-1 px-2 text-[11px] font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
                              title="Delete Story"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ── PREVIEW DIALOG FOR LATEST STORY ── */}
            {previewLatestStory && (
              <Dialog open={!!previewLatestStory} onOpenChange={() => setPreviewLatestStory(null)}>
                <DialogContent className="max-w-sm p-0 overflow-hidden rounded-3xl bg-black border border-white/10 text-white">
                  <div className="relative aspect-[9/16] w-full bg-black overflow-hidden flex flex-col justify-between p-4">
                    <img
                      src={previewLatestStory.image_url}
                      alt={previewLatestStory.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/70 pointer-events-none" />

                    {/* Header */}
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-amber-400">
                          <img
                            src={previewLatestStory.image_url}
                            alt="Logo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-none">Satguru Makeup Art</p>
                          <span className="text-[10px] text-white/70">Story Circle Preview</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setPreviewLatestStory(null)}
                        className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center text-white"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Bottom Details */}
                    <div className="relative z-10 space-y-2">
                      <h4 className="text-base font-bold leading-tight">
                        {previewLatestStory.title}
                      </h4>
                      {previewLatestStory.link_url && (
                        <div className="pt-1">
                          <Button size="sm" className="w-full btn-primary text-xs font-bold gap-1.5 h-9" asChild>
                            <a href={previewLatestStory.link_url} target="_blank" rel="noreferrer">
                              <span>Action Link: {previewLatestStory.link_url}</span>
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {loadingAnalytics ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
            ) : (
              <>
                {/* Daily Bookings Bar Chart */}
                <Card className="card-luxury">
                  <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" />Daily Bookings (Last 30 Days)</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={analyticsData.daily} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} interval={4} />
                        <YAxis tick={{ fontSize: 11, fill: '#888' }} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} />
                        <Bar dataKey="count" name="Bookings" fill="url(#bookingGrad)" radius={[6, 6, 0, 0]} />
                        <defs>
                          <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#be185d" />
                            <stop offset="100%" stopColor="#ec4899" stopOpacity={0.6} />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top 5 Services Pie */}
                  <Card className="card-luxury">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Star className="w-5 h-5 text-amber-500" />Top Services</CardTitle></CardHeader>
                    <CardContent>
                      {analyticsData.services.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8 text-sm">No service data yet</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie data={analyticsData.services} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name.slice(0,8)} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                              {analyticsData.services.map((_, idx) => (
                                <Cell key={idx} fill={['#be185d','#7c3aed','#f59e0b','#10b981','#3b82f6'][idx % 5]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: 10 }} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  {/* Revenue Trend Line */}
                  <Card className="card-luxury">
                    <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-500" />Revenue Trend</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={analyticsData.revenue} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} interval={6} />
                          <YAxis tick={{ fontSize: 11, fill: '#888' }} tickFormatter={v => `₹${v}`} />
                          <Tooltip contentStyle={{ borderRadius: 12 }} formatter={(v: any) => [`₹${v}`, 'Revenue']} />
                          <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Peak Hours Heatmap */}
                <Card className="card-luxury">
                  <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-blue-500" />Peak Booking Hours</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-12 gap-1.5">
                      {analyticsData.hours.map(h => {
                        const maxCount = Math.max(...analyticsData.hours.map(x => x.count), 1);
                        const intensity = h.count / maxCount;
                        return (
                          <div key={h.hour} className="group relative">
                            <div className="h-12 rounded-lg transition-all hover:scale-110 flex items-end justify-center pb-1"
                              style={{ background: intensity > 0 ? `rgba(200,62,104,${0.1 + intensity * 0.9})` : 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}>
                              {intensity > 0.3 && <span className="text-white text-[9px] font-bold">{h.count}</span>}
                            </div>
                            <p className="text-center text-[9px] text-muted-foreground mt-1">{h.hour}h</p>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 text-center">Darker = more bookings at that hour</p>
                  </CardContent>
                </Card>

                {/* Conversion Funnel & Service Split Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Booking Funnel */}
                  <Card className="card-luxury">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="w-5 h-5 text-[#C83E68]" />
                        Booking Conversion Funnel
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3.5">
                      {[
                        { step: 'Page Views / Catalog Explorations', count: '100%', num: '14,280', width: '100%', color: 'from-[#C83E68] to-[#E55B82]' },
                        { step: 'Added to Salon / Mehndi Cart', count: '64%', num: '9,139', width: '64%', color: 'from-[#C69A62] to-[#DFC19A]' },
                        { step: 'Checkout Details Filled', count: '41%', num: '5,854', width: '41%', color: 'from-[#C83E68] to-[#C69A62]' },
                        { step: 'Confirmed & Serviced Orders', count: '35%', num: '4,998', width: '35%', color: 'from-emerald-500 to-teal-500' },
                      ].map(({ step, count, num, width, color }) => (
                        <div key={step}>
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-[#342A29]">{step}</span>
                            <span className="text-[#C83E68] font-bold">{count} ({num})</span>
                          </div>
                          <div className="h-2 rounded-full bg-[#FAF6F0] overflow-hidden border border-[#F5DCE1]">
                            <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width }} />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Operational Health KPIs */}
                  <Card className="card-luxury">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        Doorstep Quality & Retention KPIs
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-[#FCF9F5] border border-[#F5DCE1] text-center">
                        <p className="text-2xl font-black text-[#C83E68]">98.6%</p>
                        <p className="text-xs text-[#7A6B69] mt-1 font-medium">On-Time Arrival</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#FCF9F5] border border-[#F5DCE1] text-center">
                        <p className="text-2xl font-black text-[#C69A62]">4.2 min</p>
                        <p className="text-xs text-[#7A6B69] mt-1 font-medium">Avg Dispatch Latency</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#FCF9F5] border border-[#F5DCE1] text-center">
                        <p className="text-2xl font-black text-emerald-600">88.4%</p>
                        <p className="text-xs text-[#7A6B69] mt-1 font-medium">Customer Retention</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#FCF9F5] border border-[#F5DCE1] text-center">
                        <p className="text-2xl font-black text-[#342A29] flex items-center justify-center gap-1">
                          4.92 <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        </p>
                        <p className="text-xs text-[#7A6B69] mt-1 font-medium">Verified Satisfaction</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        )}

        {/* Support Tickets Tab */}
        {activeTab === 'support' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2"><HelpCircle className="w-5 h-5 text-primary" />Support Tickets ({supportTickets.length})</h3>
            {supportTickets.length === 0 ? (
              <Card className="card-luxury"><CardContent className="text-center py-10"><HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No support tickets</p></CardContent></Card>
            ) : supportTickets.map(t => (
              <Card key={t.id} className="card-luxury">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h4 className="font-bold">{t.subject}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{t.requester_type} • {new Date(t.created_at).toLocaleString('en-IN')}</p>
                    </div>
                    <Badge className={`text-xs border ${t.status === 'open' ? 'bg-amber-100 text-amber-800 border-amber-200' : t.status === 'replied' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>{t.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg mb-3">{t.message}</p>
                  {t.admin_reply && <p className="text-sm bg-emerald-50 text-emerald-800 p-3 rounded-lg mb-3 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 inline flex-shrink-0" /> Reply: {t.admin_reply}</p>}
                  {replyingId === t.id ? (
                    <div className="flex gap-2">
                      <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type reply..." className="flex-1 h-9 px-3 rounded-lg border border-border text-sm focus:outline-none" />
                      <Button size="sm" onClick={() => replyToTicket(t.id)} className="bg-emerald-600 hover:bg-emerald-700 text-xs">Send</Button>
                      <Button size="sm" variant="outline" onClick={() => setReplyingId(null)} className="text-xs">Cancel</Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => { setReplyingId(t.id); setReplyText(''); }} className="text-xs gap-1"><MessageSquare className="w-3 h-3" />Reply</Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Contact Queries Tab */}
        {activeTab === 'contacts' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" />Contact Queries ({contactQueries.length})</h3>
            {contactQueries.length === 0 ? (
              <Card className="card-luxury"><CardContent className="text-center py-10"><MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No queries yet</p></CardContent></Card>
            ) : contactQueries.map(q => (
              <Card key={q.id} className="card-luxury">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h4 className="font-bold">{q.subject}</h4>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{q.name}</span>
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{q.email}</span>
                        {q.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{q.phone}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`text-xs border ${q.status === 'unread' ? 'bg-amber-100 text-amber-800 border-amber-200' : q.status === 'replied' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>{q.status}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(q.created_at).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg mb-3">{q.message}</p>
                  {q.admin_reply && <p className="text-sm bg-emerald-50 text-emerald-800 p-3 rounded-lg mb-3 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 inline flex-shrink-0" /> Reply: {q.admin_reply}</p>}
                  {replyingId === `contact-${q.id}` ? (
                    <div className="flex gap-2">
                      <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type reply..." className="flex-1 h-9 px-3 rounded-lg border border-border text-sm focus:outline-none" />
                      <Button size="sm" onClick={() => replyToTicket(q.id, true)} className="bg-emerald-600 hover:bg-emerald-700 text-xs">Send</Button>
                      <Button size="sm" variant="outline" onClick={() => setReplyingId(null)} className="text-xs">Cancel</Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => { setReplyingId(`contact-${q.id}`); setReplyText(''); }} className="text-xs gap-1"><MessageSquare className="w-3 h-3" />Reply</Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <Card className="card-luxury">
              <CardHeader><CardTitle className="flex items-center gap-2"><Megaphone className="w-5 h-5 text-primary" />Create Announcement</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Title *</label>
                    <input value={newAnnouncement.title} onChange={e => setNewAnnouncement(p => ({...p, title: e.target.value}))}
                      placeholder="Announcement title..." className="w-full h-10 px-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Type</label>
                      <select value={newAnnouncement.type} onChange={e => setNewAnnouncement(p => ({...p, type: e.target.value}))}
                        className="w-full h-10 px-3 rounded-xl border border-border text-sm focus:outline-none">
                        <option value="info">Info</option>
                        <option value="promo">Promo</option>
                        <option value="policy">Policy</option>
                        <option value="training">Training</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Audience</label>
                      <select value={newAnnouncement.target_audience} onChange={e => setNewAnnouncement(p => ({...p, target_audience: e.target.value}))}
                        className="w-full h-10 px-3 rounded-xl border border-border text-sm focus:outline-none">
                        <option value="all">Everyone</option>
                        <option value="customers">Customers</option>
                        <option value="stylists">Stylists</option>
                        <option value="associates">Associates</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Message *</label>
                  <textarea value={newAnnouncement.message} onChange={e => setNewAnnouncement(p => ({...p, message: e.target.value}))}
                    placeholder="Announcement message..." rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>
                <Button onClick={async () => {
                  if (!newAnnouncement.title || !newAnnouncement.message) { toast({ title: 'Fill title and message', variant: 'destructive' }); return; }
                  const { error } = await supabase.from('announcements').insert({ ...newAnnouncement, active: true });
                  if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
                  toast({ title: 'Announcement published!' });
                  setNewAnnouncement({ title: '', message: '', type: 'info', target_audience: 'all' });
                  loadAnnouncements();
                }} className="btn-primary gap-2"><Send className="w-4 h-4" />Publish Announcement</Button>
              </CardContent>
            </Card>
            <Card className="card-luxury">
              <CardHeader><CardTitle>All Announcements ({announcements.length})</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {announcements.length === 0 ? (
                  <div className="text-center py-8"><Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No announcements yet</p></div>
                ) : announcements.map(a => (
                  <div key={a.id} className="border border-border/50 rounded-xl p-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-sm">{a.title}</h4>
                        <Badge className={`text-xs ${a.type === 'emergency' ? 'bg-red-100 text-red-700' : a.type === 'promo' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{a.type}</Badge>
                        <Badge variant="outline" className="text-xs">{a.target_audience}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{a.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(a.created_at).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={async () => { await supabase.from('announcements').update({ active: !a.active }).eq('id', a.id); loadAnnouncements(); }} className="text-xs h-7">{a.active ? 'Deactivate' : 'Activate'}</Button>
                      <Button size="sm" variant="destructive" onClick={async () => { await supabase.from('announcements').delete().eq('id', a.id); loadAnnouncements(); }} className="text-xs h-7"><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* SOS Tab */}
        {activeTab === 'sos' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" />SOS Emergency Requests ({sosRequests.length})</h3>
            {sosRequests.length === 0 ? (
              <Card className="card-luxury"><CardContent className="text-center py-10"><AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No SOS requests</p></CardContent></Card>
            ) : sosRequests.map(sos => (
              <Card key={sos.id} className={`card-luxury ${sos.status === 'active' ? 'border-red-300 bg-red-50/30' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className={`w-5 h-5 ${sos.status === 'active' ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
                        <h4 className="font-bold">{sos.requester_type.toUpperCase()} SOS</h4>
                        <Badge className={sos.status === 'active' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-gray-100 text-gray-800'}>{sos.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{sos.message}</p>
                      {sos.latitude && sos.longitude && (
                        <a href={`https://maps.google.com/?q=${sos.latitude},${sos.longitude}`} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-primary flex items-center gap-1 mt-2 hover:underline">
                          <MapPin className="w-3 h-3" />View on Google Maps
                        </a>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">{new Date(sos.created_at).toLocaleString('en-IN')}</p>
                    </div>
                    {sos.status === 'active' && (
                      <Button size="sm" onClick={async () => { await supabase.from('sos_requests').update({ status: 'resolved', resolved_at: new Date().toISOString() }).eq('id', sos.id); loadSosRequests(); toast({ title: 'SOS Resolved' }); }} className="bg-emerald-600 hover:bg-emerald-700 text-xs">Mark Resolved</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stylists Management Tab */}
        {activeTab === 'stylists' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2"><UserCheck className="w-5 h-5 text-primary" />Approved Stylists ({approvedStylists.length})</h3>
              <Button onClick={loadApprovedStylists} variant="outline" size="sm" className="gap-2"><RefreshCw className="w-4 h-4" />Refresh</Button>
            </div>
            {approvedStylists.length === 0 ? (
              <Card className="card-luxury"><CardContent className="text-center py-10"><UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No approved stylists yet</p></CardContent></Card>
            ) : approvedStylists.map(s => (
              <Card key={s.id} className="card-luxury cursor-pointer hover:shadow-xl transition-all hover:-translate-y-0.5" onClick={() => navigate(`/admin/stylist/${s.id}`)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}><UserCheck className="w-6 h-6 text-white" /></div>
                      <div>
                        <h4 className="font-bold text-lg">{s.full_name}</h4>
                        <p className="text-sm text-muted-foreground">{s.specialization} • {s.experience_years}y exp</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{s.email}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <Badge className={`text-xs border ${s.is_active ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                            {s.is_active ? <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Online</span> : <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400 inline-block" /> Offline</span>}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Rating: ⭐ {s.rating?.toFixed(1) || '5.0'}</span>
                          <span className="text-xs text-muted-foreground">Jobs: {s.total_jobs || 0}</span>
                          <span className="text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-muted-foreground inline" /> {s.last_location_update ? `Updated ${new Date(s.last_location_update).toLocaleTimeString('en-IN')}` : 'Location unavailable'}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {/* Earnings */}
                      {editEarnings?.id === s.id ? (
                        <div className="flex gap-2 items-center">
                          <input value={editEarnings.val} onChange={e => setEditEarnings({ id: s.id, val: e.target.value })}
                            className="w-24 h-8 px-2 rounded-lg border border-border text-sm" placeholder="Earnings" />
                          <Button size="sm" onClick={() => updateStylistEarnings(s.id, parseFloat(editEarnings.val) || 0)} className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700">Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditEarnings(null)} className="h-8 text-xs"><XIcon className="w-3.5 h-3.5" /></Button>
                        </div>
                      ) : (
                        <button onClick={() => setEditEarnings({ id: s.id, val: String(s.earnings || 0) })} className="text-sm font-bold text-primary hover:underline">₹{(s.earnings || 0).toLocaleString()} Earned</button>
                      )}
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); toggleStylistStatus(s.id, s.is_active); }} className={`text-xs h-7 px-2 ${s.is_active ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
                          <Power className="w-3 h-3 mr-1" />{s.is_active ? 'Set Offline' : 'Set Online'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => loadAttendanceLogs(s.id)} className="text-xs h-7 px-2 gap-1"><Clock className="w-3 h-3" />Attendance</Button>
                        <Button size="sm" variant="outline" onClick={() => suspendStylist(s.id)} className="text-xs h-7 px-2 text-red-600 border-red-200 hover:bg-red-50">Suspend</Button>
                      </div>
                    </div>
                  </div>
                  {/* Attendance Logs Inline */}
                  {attendanceStyleistId === s.id && attendanceLogs.length >= 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <h5 className="font-semibold text-sm mb-3 flex items-center justify-between">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-primary" />Attendance Log</span>
                        <button onClick={() => setAttendanceStylistId(null)} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
                      </h5>
                      {attendanceLogs.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No logs yet</p>
                      ) : (
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {attendanceLogs.map(log => (
                            <div key={log.id} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-muted/40">
                              <span className={`font-semibold capitalize ${ log.action === 'online' || log.action === 'login' ? 'text-emerald-600' : log.action === 'offline' || log.action === 'logout' ? 'text-red-500' : 'text-blue-600' }`}>
                                <span className={'w-2 h-2 rounded-full inline-block mr-1.5 ' + (log.action === 'online' || log.action === 'login' ? 'bg-emerald-500' : 'bg-slate-400')} /> {log.action}
                              </span>
                              <span className="text-muted-foreground">{new Date(log.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-orange-500" />Customer Complaints ({allComplaints.length})</h3>
              <Button onClick={loadAllComplaints} variant="outline" size="sm"><RefreshCw className="w-4 h-4" /></Button>
            </div>
            {allComplaints.length === 0 ? (
              <Card className="card-luxury"><CardContent className="text-center py-10"><AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No complaints received</p></CardContent></Card>
            ) : allComplaints.map((c: any) => (
              <Card key={c.id} className={`card-luxury ${c.priority === 'urgent' ? 'border-red-300' : c.priority === 'high' ? 'border-orange-200' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-xs text-muted-foreground">#{c.complaint_number}</span>
                        <Badge className={`text-xs border ${c.status === 'resolved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : c.status === 'in_review' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>{c.status}</Badge>
                        <Badge className={`text-xs ${c.priority === 'urgent' ? 'bg-red-100 text-red-800' : c.priority === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-700'}`}>{c.priority}</Badge>
                      </div>
                      <h4 className="font-bold">{c.category}</h4>
                      <p className="text-sm text-muted-foreground">{c.complaint_type} complaint{c.against_name ? ` against ${c.against_name}` : ''}</p>
                      <p className="text-sm mt-2">{c.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">By: {(c.user_profiles as any)?.email || 'Unknown'} &bull; {new Date(c.created_at).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {c.status === 'open' && <Button size="sm" onClick={async () => { await supabase.from('complaints').update({ status: 'in_review' }).eq('id', c.id); loadAllComplaints(); }} className="bg-blue-600 hover:bg-blue-700 text-xs h-7">In Review</Button>}
                      {c.status !== 'resolved' && <Button size="sm" onClick={async () => { await supabase.from('complaints').update({ status: 'resolved', resolved_at: new Date().toISOString() }).eq('id', c.id); loadAllComplaints(); }} className="bg-emerald-600 hover:bg-emerald-700 text-xs h-7">Resolve</Button>}
                    </div>
                  </div>
                  {Array.isArray(c.image_urls) && c.image_urls.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">{c.image_urls.map((url: string, i: number) => <a key={i} href={url} target="_blank" rel="noopener noreferrer"><img src={url} alt="Evidence" className="w-16 h-16 object-cover rounded-lg border border-border" /></a>)}</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Query Resolvers Management Tab */}
        {activeTab === 'query-resolvers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Headphones className="w-6 h-6 text-primary" />
                  Query Resolvers Management ({queryResolversList.length})
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage assigned query resolvers. Resolvers sign in through the Common Sign In page to handle customer support.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  onClick={() => setAddResolverDialogOpen(true)}
                  className="btn-primary text-xs h-9 gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Query Resolver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadQueryResolvers}
                  className="h-9 px-2.5"
                  title="Refresh"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Quick Helper Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-pink-500/5 to-purple-500/10 border border-primary/20 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <p className="font-semibold text-foreground mb-0.5">
                  Common Login &amp; Security:
                </p>
                <p className="text-muted-foreground">
                  1. Admin creates resolver accounts here &bull; 2. Resolvers use the <strong>Common Sign In (/login)</strong> &bull; 3. Credentials are kept private and secure (passwords are never displayed).
                </p>
              </div>
            </div>

            {/* Resolvers Grid / Cards */}
            {queryResolversList.length === 0 ? (
              <Card className="card-luxury">
                <CardContent className="text-center py-12">
                  <Headphones className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="font-semibold text-muted-foreground">No Query Resolvers registered yet</p>
                  <Button
                    onClick={() => setAddResolverDialogOpen(true)}
                    className="btn-primary text-xs mt-3 gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add First Resolver
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {queryResolversList.map((res) => (
                  <Card
                    key={res.id}
                    className={`card-luxury border transition-all ${
                      res.is_active ? 'border-border/80' : 'opacity-70 border-dashed'
                    }`}
                  >
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
                            {res.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-base text-foreground">{res.name}</h4>
                            <p className="text-xs text-primary font-medium flex items-center gap-1">
                              <Tag className="w-3 h-3" /> {res.department}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Phone: {res.phone || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end gap-1">
                          <Badge
                            className={`text-[10px] ${
                              res.is_active
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-gray-100 text-gray-700 border-gray-300'
                            }`}
                          >
                            {res.is_active ? <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Active</span> : <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400 inline-block" /> Inactive</span>}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {res.total_resolved || 0} resolved
                          </span>
                        </div>
                      </div>

                      {/* Account & Security Card (No clear-text passwords) */}
                      <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/70 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="font-mono text-foreground truncate">{res.email}</span>
                          </span>
                          <span className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                            Common Login
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px]">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Password protected &amp; hidden
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setResetPasswordDialog({ open: true, resolver: res, newPassword: '' })}
                            className="h-6 px-2 text-[11px] text-primary hover:text-primary/80 gap-1"
                          >
                            <Key className="w-3 h-3" /> Reset Password
                          </Button>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleResolverStatus(res.id, res.is_active)}
                          className={`text-xs h-8 ${
                            res.is_active
                              ? 'text-amber-700 hover:bg-amber-50 border-amber-200'
                              : 'text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                          }`}
                        >
                          <Power className="w-3 h-3 mr-1" />
                          {res.is_active ? 'Deactivate' : 'Activate'}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteResolver(res.id)}
                          className="text-xs h-8 text-red-600 hover:bg-red-50 border-red-200 gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Wallet Management Tab */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            {/* Credit/Debit Form */}
            <Card className="card-luxury">
              <CardHeader><CardTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-primary" />Admin Wallet Management</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Select User *</label>
                    <select value={walletUserId} onChange={e => setWalletUserId(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="">Choose user...</option>
                      {walletUsers.map(u => (
                        <option key={u.id} value={u.id}>{u.username || u.email} (₹{u.wallet_balance || 0})</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Type</label>
                      <div className="flex gap-2">
                        <button onClick={() => setWalletType('credit')} className={`flex-1 h-10 rounded-xl text-sm font-semibold transition-all ${walletType === 'credit' ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'}`}>+ Credit</button>
                        <button onClick={() => setWalletType('debit')} className={`flex-1 h-10 rounded-xl text-sm font-semibold transition-all ${walletType === 'debit' ? 'bg-red-600 text-white' : 'bg-muted text-muted-foreground'}`}>- Debit</button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Amount (₹) *</label>
                      <Input type="number" placeholder="100" value={walletAmount} onChange={e => setWalletAmount(e.target.value)} className="h-10" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Note / Reason</label>
                  <Input placeholder="Refund for booking #123, Promotional credit, etc." value={walletNote} onChange={e => setWalletNote(e.target.value)} />
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => { setWalletUserId(''); loadWalletData(); }} variant="outline" size="sm">Refresh Users</Button>
                  <Button onClick={processWalletTransaction} disabled={processWallet || !walletUserId || !walletAmount}
                    className={walletType === 'credit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'} size="sm">
                    {processWallet ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {walletType === 'credit' ? '+ Credit Wallet' : '- Debit Wallet'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* All Users Wallet Balances */}
            <Card className="card-luxury">
              <CardHeader><CardTitle>User Wallet Balances ({walletUsers.length})</CardTitle></CardHeader>
              <CardContent>
                {walletUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <Button onClick={loadWalletData} variant="outline">Load Wallet Data</Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b">
                        <th className="text-left py-2 text-muted-foreground font-medium">User</th>
                        <th className="text-left py-2 text-muted-foreground font-medium">Email</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">Balance</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">Action</th>
                      </tr></thead>
                      <tbody className="divide-y">
                        {walletUsers.map(u => (
                          <tr key={u.id} className="hover:bg-muted/30">
                            <td className="py-2.5 font-medium">{u.username || '—'}</td>
                            <td className="py-2.5 text-muted-foreground text-xs">{u.email}</td>
                            <td className="py-2.5 text-right font-bold text-primary">₹{u.wallet_balance || 0}</td>
                            <td className="py-2.5 text-right">
                              <Button size="sm" variant="outline" onClick={() => setWalletUserId(u.id)} className="h-7 text-xs">Select</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Wallet Transactions */}
            <Card className="card-luxury">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Transactions</span>
                  <Button onClick={() => exportToExcel(walletAllTxns.map(t => ({ User: (t.user_profiles as any)?.email || t.user_id, Amount: t.amount, Type: t.type, Description: t.description, Balance_After: t.balance_after, Date: t.created_at })), 'wallet-transactions')} variant="outline" size="sm" className="gap-1"><Download className="w-3 h-3" />Export</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {walletAllTxns.slice(0, 30).map(t => (
                    <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50">
                      <div>
                        <p className="font-medium text-sm">{(t.user_profiles as any)?.username || (t.user_profiles as any)?.email || 'User'}</p>
                        <p className="text-xs text-muted-foreground">{t.description}</p>
                        <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${t.type === 'credit' || t.type === 'refund' || t.type === 'promo' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {t.type === 'credit' || t.type === 'refund' || t.type === 'promo' ? '+' : '-'}₹{t.amount}
                        </p>
                        <p className="text-xs text-muted-foreground">Bal: ₹{t.balance_after}</p>
                      </div>
                    </div>
                  ))}
                  {walletAllTxns.length === 0 && <p className="text-center text-muted-foreground py-4 text-sm">No transactions yet. <Button variant="link" onClick={loadWalletData} className="p-0 h-auto text-sm">Load data</Button></p>}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <Card className="card-luxury">
            <CardHeader><CardTitle className="flex items-center gap-2"><Star className="w-5 h-5 text-primary" />Customer Reviews ({reviews.length})</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-12"><Star className="w-16 h-16 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No reviews yet</p></div>
              ) : reviews.map((r: any) => (
                <div key={r.id} className="border border-border/50 rounded-xl p-5 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex gap-0.5 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <p className="font-semibold text-sm">{r.user_profiles?.username || 'Anonymous'}</p>
                      <p className="text-xs text-muted-foreground">{r.service} • {new Date(r.created_at).toLocaleDateString('en-IN')}</p>
                      <p className="text-sm mt-2">{r.comment}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={r.featured ? 'default' : 'outline'}
                      onClick={() => toggleFeaturedReview(r.id, r.featured)}
                      className={r.featured ? 'bg-amber-500 hover:bg-amber-600 text-xs' : 'text-xs'}
                    >
                      {r.featured ? '⭐ Featured' : 'Feature'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Services & Mehndi Catalog Tab */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-card border border-border/80 shadow-sm">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground flex items-center gap-2">
                  <Package className="w-6 h-6 text-primary" />
                  Services &amp; Mehndi Catalog
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Manage doorstep beauty treatments and bridal mehndi packages with banners, duration in minutes, and prices.
                </p>
              </div>
              <Button
                onClick={() => setAddServiceDialogOpen(true)}
                className="btn-primary text-xs font-bold gap-2 self-start sm:self-auto rounded-xl shadow-md"
              >
                <Plus className="w-4 h-4" />
                Add New Service
              </Button>
            </div>

            {/* Sub-tab Switcher & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 p-1 bg-secondary/80 rounded-2xl w-fit border border-border/50">
                <button
                  onClick={() => setAdminServicesType('doorstep')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    adminServicesType === 'doorstep'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Doorstep Beauty ({doorstepServicesList.length})
                </button>
                <button
                  onClick={() => setAdminServicesType('mehndi')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    adminServicesType === 'mehndi'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Mehndi Art ({mehndiServicesList.length})
                </button>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Filter services by name..."
                  value={serviceSearch}
                  onChange={e => setServiceSearch(e.target.value)}
                  className="pl-9 h-10 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Services List / Cards */}
            {(() => {
              const currentList = adminServicesType === 'doorstep' ? doorstepServicesList : mehndiServicesList;
              const filtered = currentList.filter(s =>
                s.name?.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                s.category?.toLowerCase().includes(serviceSearch.toLowerCase())
              );

              if (filtered.length === 0) {
                return (
                  <Card className="p-12 text-center rounded-3xl border border-dashed border-border/80">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                    <h3 className="font-bold text-base text-foreground mb-1">No services found</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      {serviceSearch ? 'Try adjusting your search filter.' : 'Click Add New Service to create your first package.'}
                    </p>
                    <Button onClick={() => setAddServiceDialogOpen(true)} size="sm" className="btn-primary text-xs">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Service
                    </Button>
                  </Card>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map(service => (
                    <div
                      key={service.id}
                      className="bg-card rounded-2xl border border-border/80 shadow-sm overflow-hidden flex flex-col hover:border-primary/40 transition-all hover:shadow-md"
                    >
                      <div className="relative h-40 bg-muted/20 overflow-hidden">
                        <img
                          src={service.image_url || '/images/service-facial.png'}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white">
                          {service.category}
                        </div>
                        <div className="absolute top-2.5 right-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              service.available
                                ? 'bg-emerald-500/90 text-white'
                                : 'bg-rose-500/90 text-white'
                            }`}
                          >
                            {service.available ? 'Active' : 'Hidden'}
                          </span>
                        </div>
                        <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[11px] font-bold text-foreground flex items-center gap-1 shadow-sm">
                          <Clock className="w-3 h-3 text-primary" />
                          <span>{service.duration_minutes || 45} mins</span>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-foreground mb-1 line-clamp-1">{service.name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                            {service.description || 'No description provided.'}
                          </p>

                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-lg font-black text-primary">₹{service.price}</span>
                            {service.original_price && service.original_price > service.price && (
                              <span className="text-xs text-muted-foreground line-through">
                                ₹{service.original_price}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleServiceAvailable(adminServicesType, service.id, service.available)}
                            className="text-xs h-8"
                          >
                            {service.available ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteService(adminServicesType, service.id)}
                            className="text-xs h-8 px-2.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
          </div>
        </div>
      </div>

      {/* Add New Service Dialog (Doorstep & Mehndi) */}
      <Dialog open={addServiceDialogOpen} onOpenChange={setAddServiceDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Add New Beauty / Mehndi Service
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateService} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold mb-1 block">Service Section *</label>
                <select
                  value={newServiceData.type}
                  onChange={e => setNewServiceData(p => ({
                    ...p,
                    type: e.target.value as any,
                    category: e.target.value === 'mehndi' ? 'Bridal Mehndi' : 'Facial Rituals',
                  }))}
                  className="w-full h-10 px-3 rounded-xl border border-border text-xs bg-background"
                >
                  <option value="doorstep">Doorstep Beauty Services</option>
                  <option value="mehndi">Mehndi Art Services</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block">Category *</label>
                <Input
                  required
                  placeholder={newServiceData.type === 'mehndi' ? 'e.g. Bridal Mehndi, Arabic' : 'e.g. Facial Rituals, Hair'}
                  value={newServiceData.category}
                  onChange={e => setNewServiceData(p => ({ ...p, category: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">Service Name *</label>
              <Input
                required
                placeholder="e.g. Deluxe Bridal HD Glow Makeup or Arabic Lotus Henna"
                value={newServiceData.name}
                onChange={e => setNewServiceData(p => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold mb-1 block">Discounted Price (₹) *</label>
                <Input
                  required
                  type="number"
                  placeholder="1499"
                  value={newServiceData.price}
                  onChange={e => setNewServiceData(p => ({ ...p, price: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block">Original Price (₹)</label>
                <Input
                  type="number"
                  placeholder="1999"
                  value={newServiceData.original_price}
                  onChange={e => setNewServiceData(p => ({ ...p, original_price: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block">Duration (Minutes) *</label>
                <Input
                  required
                  type="number"
                  placeholder="60"
                  value={newServiceData.duration_minutes}
                  onChange={e => setNewServiceData(p => ({ ...p, duration_minutes: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">Main Banner / Photo Image URL *</label>
              <Input
                placeholder="/images/service-facial.png or https://..."
                value={newServiceData.image_url}
                onChange={e => setNewServiceData(p => ({ ...p, image_url: e.target.value }))}
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10px] text-muted-foreground mr-1 self-center">Presets:</span>
                {[
                  '/images/service-facial.png',
                  '/images/service-face.png',
                  '/images/service-hair.png',
                  '/images/service-skincare.png',
                  '/images/banner-appointment.png',
                  '/images/banner-elegant.png',
                ].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNewServiceData(p => ({ ...p, image_url: preset }))}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-secondary hover:bg-secondary/80 text-foreground border border-border/50"
                  >
                    {preset.replace('/images/', '')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">Additional Gallery Banners (one URL per line)</label>
              <textarea
                rows={2}
                placeholder="/images/banner-appointment.png&#10;/images/banner-relaxing.png"
                value={newServiceData.banner_urls}
                onChange={e => setNewServiceData(p => ({ ...p, banner_urls: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-border text-xs bg-background"
              />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">Detailed Description</label>
              <textarea
                rows={2}
                placeholder="Comprehensive overview of products used, technique, and results..."
                value={newServiceData.description}
                onChange={e => setNewServiceData(p => ({ ...p, description: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-border text-xs bg-background"
              />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">What's Included (one item per line)</label>
              <textarea
                rows={2}
                placeholder="Sanitized single-use kit&#10;Complimentary aftercare balm&#10;Double cleanse skin prep"
                value={newServiceData.inclusions}
                onChange={e => setNewServiceData(p => ({ ...p, inclusions: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-border text-xs bg-background"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="btn-primary flex-1 text-xs">
                Publish Service
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddServiceDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Query Resolver Dialog */}
      <Dialog open={addResolverDialogOpen} onOpenChange={setAddResolverDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-primary" />
              Add Query Resolver
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateResolver} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold mb-1 block">Full Name *</label>
              <Input
                required
                placeholder="e.g. Pooja Sharma"
                value={newResName}
                onChange={e => setNewResName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">Assigned Login Email *</label>
              <Input
                required
                type="email"
                placeholder="e.g. pooja.resolver@satgurumakeup.com"
                value={newResEmail}
                onChange={e => setNewResEmail(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground mt-0.5">The resolver will use this email to log in.</p>
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">Assigned Password *</label>
              <Input
                required
                type="password"
                placeholder="••••••••••••"
                value={newResPassword}
                onChange={e => setNewResPassword(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground mt-0.5">Set a secure password for this resolver account.</p>
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">Phone Number</label>
              <Input
                placeholder="+91 98765 43210"
                value={newResPhone}
                onChange={e => setNewResPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">Department / Specialty</label>
              <select
                value={newResDept}
                onChange={e => setNewResDept(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Salon & Bridal Bookings">Salon & Bridal Bookings</option>
                <option value="Doorstep & Mehndi Orders">Doorstep & Mehndi Orders</option>
                <option value="Billing & Refunds">Billing & Refunds</option>
                <option value="General Support">General Support</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="btn-primary flex-1 text-xs">
                Create Resolver Account
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddResolverDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Resolver Password Dialog */}
      <Dialog
        open={resetPasswordDialog.open}
        onOpenChange={(o) => setResetPasswordDialog(prev => ({ ...prev, open: o }))}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Reset Resolver Password
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleResetResolverPassword} className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground">
              Set a new secure password for <strong className="text-foreground">{resetPasswordDialog.resolver?.name}</strong> ({resetPasswordDialog.resolver?.email}).
            </p>
            <div>
              <label className="text-xs font-semibold mb-1 block">New Password *</label>
              <Input
                required
                type="password"
                placeholder="Enter new password"
                value={resetPasswordDialog.newPassword}
                onChange={e => setResetPasswordDialog(prev => ({ ...prev, newPassword: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="btn-primary flex-1 text-xs">
                Save New Password
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setResetPasswordDialog({ open: false, resolver: null, newPassword: '' })}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Credentials Dialog (Strictly Training-Gated) */}
      <Dialog open={credentialDialog.open} onOpenChange={(o) => setCredentialDialog({ open: o, request: credentialDialog.request, type: credentialDialog.type })}>
        <DialogContent className="max-w-md">
          {(() => {
            const req = credentialDialog.request;
            const reqType = credentialDialog.type;
            const stats = req && reqType ? trainingService.getEmployeeStats(req.id, reqType) : { totalLessons: 0, completedLessons: 0, completionPercentage: 0 };
            const isTrained = req?.status === 'training_completed' || (stats.totalLessons > 0 && stats.completedLessons >= stats.totalLessons);

            return (
              <div>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-base font-bold">
                    <Key className="w-5 h-5 text-primary" />
                    Issue Portal Login Credentials
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* Candidate Details Summary */}
                  <div className="p-3.5 rounded-xl bg-muted/60 border border-border/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-foreground">{req?.full_name || req?.shop_name}</p>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary border-primary/30">
                        {reqType} Request
                      </Badge>
                    </div>
                    <p className="text-muted-foreground font-medium">{req?.email} • {req?.phone}</p>
                    {req?.address && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {req.address}, {req.city || ''}
                      </p>
                    )}
                  </div>

                  {/* Strict Quality Check: Training Status Notice */}
                  {isTrained ? (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        Training Verified & Completed (100%)
                      </div>
                      <p className="text-emerald-800 text-[11px]">
                        All mandatory training modules have been finished. You may now assign secure portal credentials.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        Training Incomplete ({stats.completedLessons} / {stats.totalLessons} Lessons Finished - {stats.completionPercentage}%)
                      </div>
                      <p className="text-amber-800 text-[11px]">
                        BlindGlow quality protocols require staff to complete training before portal credentials can be issued.
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          if (req && reqType) {
                            trainingService.markAllTrainingComplete(req.id, reqType);
                            handleRequest(req.id, reqType, 'training_completed', 'Admin verified and marked all training complete.');
                            toast({ title: 'Training Marked Complete! ✓', description: 'Portal credentials generation unlocked.' });
                          }
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-7 gap-1.5 shadow-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Verify & Complete Training Now
                      </Button>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Login Email / Username *</label>
                    <Input placeholder="Login email" value={credEmail} onChange={e => setCredEmail(e.target.value)} className="h-9 text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Login Password *</label>
                    <Input placeholder="Set password" value={credPassword} onChange={e => setCredPassword(e.target.value)} className="h-9 text-xs font-mono" />
                    <p className="text-[11px] text-muted-foreground mt-1">Applicant will authenticate with these credentials to access their dashboard.</p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleApproveWithCredentials}
                      className={`flex-1 text-xs font-bold ${isTrained ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'opacity-50 cursor-not-allowed bg-stone-300 text-stone-600'}`}
                      disabled={!credEmail || !credPassword || updatingId !== null || !isTrained}
                    >
                      {updatingId ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-3.5 h-3.5 mr-1.5" />}
                      {isTrained ? 'Approve & Activate Login' : 'Locked (Finish Training First)'}
                    </Button>
                    <Button variant="outline" onClick={() => setCredentialDialog({ open: false, request: null, type: null })} className="flex-1 text-xs">
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Request Resubmission Dialog */}
      <Dialog open={resubmitDialog.open} onOpenChange={(o) => setResubmitDialog({ open: o, request: resubmitDialog.request, type: resubmitDialog.type, reason: resubmitDialog.reason })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-700">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Request Document Resubmission
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <p className="font-semibold">{resubmitDialog.request?.full_name || resubmitDialog.request?.shop_name}</p>
              <p className="text-amber-700/80 mt-0.5">The applicant will be alerted in their user profile to re-upload clear compliance documents.</p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 block">
                Reason / Clarification Notes *
              </label>
              <textarea
                rows={3}
                value={resubmitDialog.reason}
                onChange={e => setResubmitDialog({ ...resubmitDialog, reason: e.target.value })}
                placeholder="e.g. Please provide a clear, high-resolution copy of your Aadhaar card / Shop front photograph."
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (!resubmitDialog.reason.trim()) {
                    toast({ title: 'Please enter a note', variant: 'destructive' });
                    return;
                  }
                  handleRequest(resubmitDialog.request.id, resubmitDialog.type!, 'resubmission_required', resubmitDialog.reason.trim());
                  setResubmitDialog({ open: false, request: null, type: null, reason: '' });
                }}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs"
              >
                Send Resubmission Request
              </Button>
              <Button variant="outline" onClick={() => setResubmitDialog({ open: false, request: null, type: null, reason: '' })} className="flex-1 text-xs">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Executive Dialog */}
      <Dialog open={assignDialog.open} onOpenChange={(o) => setAssignDialog({ open: o, order: assignDialog.order })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Executive</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Executive Name *</label>
              <Input placeholder="Enter name" value={execName} onChange={(e) => setExecName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Phone Number *</label>
              <Input placeholder="+91 98765 43210" value={execPhone} onChange={(e) => setExecPhone(e.target.value)} />
            </div>
            <Button onClick={handleAssignExecutive} className="w-full btn-primary" disabled={!execName || !execPhone || updatingId !== null}>
              {updatingId ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Assign Executive
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── 1. BOOKING DETAILS DIALOG ── */}
      <Dialog open={!!selectedBooking} onOpenChange={(o) => { if (!o) setSelectedBooking(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedBooking && (
            <div>
              <DialogHeader className="border-b pb-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <DialogTitle className="text-xl flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      {selectedBooking.service}
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Booking ID: <span className="font-mono text-foreground font-semibold">{selectedBooking.id}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs border ${statusColor(selectedBooking.status)}`}>
                      {selectedBooking.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-5 py-4">
                {/* Customer Contact Information */}
                <div className="bg-muted/40 border border-border/70 rounded-2xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-primary" /> Customer Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Full Name</p>
                      <p className="font-semibold text-base text-foreground">{selectedBooking.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone Number</p>
                      <p className="font-semibold text-foreground">{selectedBooking.phone}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-muted-foreground">Email Address</p>
                      <p className="font-semibold text-foreground">{selectedBooking.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border/50">
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50" asChild>
                      <a href={`tel:${selectedBooking.phone}`}>
                        <Phone className="w-3.5 h-3.5" /> Call Customer
                      </a>
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50" asChild>
                      <a href={getWhatsAppUrl(selectedBooking.phone, `Hi ${selectedBooking.name}, regarding your Satguru Makeup Art booking for ${selectedBooking.service} on ${new Date(selectedBooking.preferred_date).toLocaleDateString()}...`)} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Message
                      </a>
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-blue-700 border-blue-300 hover:bg-blue-50" asChild>
                      <a href={`mailto:${selectedBooking.email}?subject=Regarding Your Satguru Makeup Art Booking`}>
                        <Mail className="w-3.5 h-3.5" /> Send Email
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Booking Schedule & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-card border border-border/70 rounded-2xl p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-primary" /> Scheduled Date & Time
                    </p>
                    <p className="font-bold text-base text-foreground">
                      {new Date(selectedBooking.preferred_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-sm font-semibold text-primary mt-1">
                      Time Slot: {selectedBooking.preferred_time}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Booked On: {new Date(selectedBooking.created_at).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="bg-card border border-border/70 rounded-2xl p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-primary" /> Customer Instructions
                    </p>
                    {selectedBooking.message ? (
                      <p className="text-sm text-foreground bg-muted/40 p-2.5 rounded-xl italic">
                        "{selectedBooking.message}"
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic py-2">No special instructions provided by customer.</p>
                    )}
                  </div>
                </div>

                {/* Assigned Stylist Section */}
                <div className="bg-card border border-border/70 rounded-2xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-primary" /> Assigned Stylist / Expert
                  </h4>
                  {selectedBooking.stylist_name ? (
                    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-violet-50/60 border border-violet-200">
                      <div>
                        <p className="font-bold text-sm text-violet-950">{selectedBooking.stylist_name}</p>
                        <p className="text-xs text-violet-700 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {selectedBooking.stylist_phone || 'Phone unavailable'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {selectedBooking.stylist_phone && (
                          <Button size="sm" variant="outline" className="h-7 text-xs text-violet-700 border-violet-300 hover:bg-violet-100" asChild>
                            <a href={`tel:${selectedBooking.stylist_phone}`}>Call Stylist</a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-800">
                      <span className="flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-500 inline flex-shrink-0" /> No stylist assigned yet. Auto-assigns on confirmation or select below.</span>
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-2">
                    <select
                      className="flex-1 h-9 px-3 rounded-xl border border-border text-xs focus:outline-none"
                      onChange={(e) => {
                        if (e.target.value) handleManualAssignStylist(selectedBooking.id, e.target.value);
                      }}
                      defaultValue=""
                    >
                      <option value="">Choose Stylist to Assign / Reassign...</option>
                      {approvedStylists.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.full_name} ({s.specialization}) {s.is_active ? '(Online)' : '(Offline)'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status Action Controls */}
                <div className="pt-2 border-t border-border flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex gap-2 flex-wrap">
                    {selectedBooking.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => {
                            updateBookingStatus(selectedBooking.id, 'confirmed');
                            setSelectedBooking(prev => prev ? { ...prev, status: 'confirmed' } : null);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Confirm Booking
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            updateBookingStatus(selectedBooking.id, 'cancelled');
                            setSelectedBooking(prev => prev ? { ...prev, status: 'cancelled' } : null);
                          }}
                          className="text-red-600 border-red-200 hover:bg-red-50 text-xs gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Cancel Booking
                        </Button>
                      </>
                    )}
                    {selectedBooking.status === 'confirmed' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          updateBookingStatus(selectedBooking.id, 'completed');
                          setSelectedBooking(prev => prev ? { ...prev, status: 'completed' } : null);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-xs font-semibold gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Mark as Completed
                      </Button>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const summary = `Satguru Makeup Art Booking Summary\nService: ${selectedBooking.service}\nCustomer: ${selectedBooking.name} (${selectedBooking.phone})\nDate: ${new Date(selectedBooking.preferred_date).toLocaleDateString()} ${selectedBooking.preferred_time}\nStatus: ${selectedBooking.status}`;
                      copyToClipboard(summary, 'Booking summary copied!');
                    }}
                    className="text-xs gap-1.5 ml-auto"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Summary
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── 2. ORDER DETAILS DIALOG ── */}
      <Dialog open={!!selectedOrder} onOpenChange={(o) => { if (!o) setSelectedOrder(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <div>
              <DialogHeader className="border-b pb-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <DialogTitle className="text-xl flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-primary" />
                      Order #{selectedOrder.order_number}
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Placed on {new Date(selectedOrder.created_at).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs border ${statusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${selectedOrder.order_type === 'mehndi' ? 'text-rose-700 border-rose-300' : 'text-teal-700 border-teal-300'}`}>
                      {selectedOrder.order_type === 'mehndi' ? 'Mehndi Art' : 'Doorstep Salon'}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-5 py-4">
                {/* Customer Information */}
                <div className="bg-muted/40 border border-border/70 rounded-2xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-primary" /> Customer & Delivery Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Customer Name</p>
                      <p className="font-semibold text-base text-foreground">{selectedOrder.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone Number</p>
                      <p className="font-semibold text-foreground">{selectedOrder.customer_phone}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-semibold text-foreground">{selectedOrder.customer_email}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-muted-foreground">Delivery / Service Address</p>
                      <p className="font-semibold text-foreground flex items-start gap-1 mt-0.5">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        {selectedOrder.address || 'Address not specified'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border/50">
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50" asChild>
                      <a href={`tel:${selectedOrder.customer_phone}`}>
                        <Phone className="w-3.5 h-3.5" /> Call Customer
                      </a>
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50" asChild>
                      <a href={getWhatsAppUrl(selectedOrder.customer_phone, `Hi ${selectedOrder.customer_name}, regarding your Satguru Makeup Art Order #${selectedOrder.order_number}...`)} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Customer
                      </a>
                    </Button>
                    {selectedOrder.address && (
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/5" asChild>
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedOrder.address)}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3.5 h-3.5" /> Open Google Maps
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Services Itemized List */}
                <div className="bg-card border border-border/70 rounded-2xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Package className="w-4 h-4 text-primary" /> Itemized Services</span>
                    <span className="text-xs font-semibold text-muted-foreground">Total Services: {Array.isArray(selectedOrder.services) ? selectedOrder.services.length : 1}</span>
                  </h4>

                  <div className="divide-y divide-border/60">
                    {Array.isArray(selectedOrder.services) && selectedOrder.services.length > 0 ? (
                      selectedOrder.services.map((item: any, idx: number) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
                          <div>
                            <p className="font-semibold text-foreground">{item.name || item.title || 'Beauty Service'}</p>
                            <p className="text-xs text-muted-foreground">Quantity: × {item.quantity || 1}</p>
                          </div>
                          <p className="font-bold text-foreground">
                            ₹{(item.price || 0) * (item.quantity || 1)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="py-2 text-xs text-muted-foreground">Standard Booking Service</p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <p className="font-bold text-base">Grand Total</p>
                    <p className="text-2xl font-extrabold text-primary">₹{selectedOrder.total}</p>
                  </div>
                </div>

                {/* Assigned Executive Section */}
                <div className="bg-card border border-border/70 rounded-2xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-primary" /> Assigned Executive</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setAssignDialog({ open: true, order: selectedOrder });
                        setExecName(selectedOrder.executive_name || '');
                        setExecPhone(selectedOrder.executive_phone || '');
                      }}
                      className="h-7 text-xs gap-1"
                    >
                      <Award className="w-3 h-3" /> {selectedOrder.executive_name ? 'Change Executive' : 'Assign Executive'}
                    </Button>
                  </h4>

                  {selectedOrder.executive_name ? (
                    <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-purple-950">{selectedOrder.executive_name}</p>
                        <p className="text-xs text-purple-700 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {selectedOrder.executive_phone || 'Phone not set'}
                        </p>
                      </div>
                      {selectedOrder.executive_phone && (
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="outline" className="h-7 text-xs text-purple-700 border-purple-300" asChild>
                            <a href={`tel:${selectedOrder.executive_phone}`}>Call</a>
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs text-purple-700 border-purple-300" asChild>
                            <a href={getWhatsAppUrl(selectedOrder.executive_phone, `Hi ${selectedOrder.executive_name}, regarding order #${selectedOrder.order_number}...`)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic py-1">No delivery/beauty executive assigned yet.</p>
                  )}
                </div>

                {/* Order Status Tracking Controls */}
                <div className="bg-card border border-border/70 rounded-2xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-primary" /> Progress & Lifecycle Controls
                  </h4>

                  <div className="flex flex-wrap gap-2">
                    {selectedOrder.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, 'confirmed', selectedOrder.order_type);
                          setSelectedOrder(prev => prev ? { ...prev, status: 'confirmed' } : null);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold"
                      >
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 inline" /> Confirm Order</span>
                      </Button>
                    )}
                    {['pending', 'confirmed', 'executive_assigned'].includes(selectedOrder.status) && (
                      <Button
                        size="sm"
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, 'on_the_way', selectedOrder.order_type);
                          setSelectedOrder(prev => prev ? { ...prev, status: 'on_the_way' } : null);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-xs text-white"
                      >
                        <span className="flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5 inline" /> Mark On The Way</span>
                      </Button>
                    )}
                    {['confirmed', 'executive_assigned', 'on_the_way'].includes(selectedOrder.status) && (
                      <Button
                        size="sm"
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, 'arrived', selectedOrder.order_type);
                          setSelectedOrder(prev => prev ? { ...prev, status: 'arrived' } : null);
                        }}
                        className="bg-teal-600 hover:bg-teal-700 text-xs text-white"
                      >
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 inline" /> Mark Arrived</span>
                      </Button>
                    )}
                    {['arrived', 'on_the_way'].includes(selectedOrder.status) && (
                      <Button
                        size="sm"
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, 'serviced', selectedOrder.order_type);
                          setSelectedOrder(prev => prev ? { ...prev, status: 'serviced' } : null);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-xs text-white font-semibold"
                      ><CheckCircle2 className="w-3.5 h-3.5 inline mr-1" /> Mark Serviced</Button>
                    )}
                    {selectedOrder.status !== 'cancelled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, 'cancelled', selectedOrder.order_type);
                          setSelectedOrder(prev => prev ? { ...prev, status: 'cancelled' } : null);
                        }}
                        className="text-red-600 border-red-200 hover:bg-red-50 text-xs ml-auto"
                      >
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── 3. STYLIST PROFILE & DOCUMENTS DIALOG ── */}
      <Dialog open={!!selectedStylist} onOpenChange={(o) => { if (!o) setSelectedStylist(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedStylist && (
            <div>
              <DialogHeader className="border-b pb-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <DialogTitle className="text-xl flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      {selectedStylist.full_name}
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Applied on {new Date(selectedStylist.created_at).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs border ${statusColor(selectedStylist.status)}`}>
                      {selectedStylist.status.toUpperCase()}
                    </Badge>
                    <Badge className={`text-xs border ${selectedStylist.is_active ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-gray-100 text-gray-700'}`}>
                      {selectedStylist.is_active ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-5 py-4">
                {/* Contact & Professional Info */}
                <div className="bg-muted/40 border border-border/70 rounded-2xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-primary" /> Stylist Details & Contact
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Specialization</p>
                      <p className="font-semibold text-foreground">{selectedStylist.specialization}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Experience</p>
                      <p className="font-semibold text-foreground">{selectedStylist.experience_years} Years</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-semibold text-foreground">{selectedStylist.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-semibold text-foreground">{selectedStylist.email}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-muted-foreground">Biography / Experience Summary</p>
                      <p className="text-sm text-foreground mt-0.5">{selectedStylist.bio || 'No bio provided'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border/50">
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50" asChild>
                      <a href={`tel:${selectedStylist.phone}`}>
                        <Phone className="w-3.5 h-3.5" /> Call Stylist
                      </a>
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50" asChild>
                      <a href={getWhatsAppUrl(selectedStylist.phone, `Hi ${selectedStylist.full_name}, regarding your Satguru Makeup Art stylist profile...`)} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Message
                      </a>
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-blue-700 border-blue-300 hover:bg-blue-50" asChild>
                      <a href={`mailto:${selectedStylist.email}?subject=Regarding Your Satguru Makeup Art Stylist Application`}>
                        <Mail className="w-3.5 h-3.5" /> Send Email
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Attached Portfolio & Verification Documents Gallery */}
                <div className="bg-card border border-border/70 rounded-2xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-primary" />
                      Uploaded Documents & Portfolio Images
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {Array.isArray(selectedStylist.portfolio_urls) ? `${selectedStylist.portfolio_urls.length} Documents` : 'None'}
                    </Badge>
                  </h4>

                  {Array.isArray(selectedStylist.portfolio_urls) && selectedStylist.portfolio_urls.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selectedStylist.portfolio_urls.map((url, i) => (
                        <div
                          key={i}
                          onClick={() => setSelectedImagePreview({ url, title: `${selectedStylist.full_name} - Document #${i + 1}` })}
                          className="group relative rounded-xl overflow-hidden border border-border/70 aspect-square bg-black/5 hover:border-primary cursor-pointer transition-all hover:scale-105"
                        >
                          <img src={url} alt={`Doc ${i + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-2 text-white transition-opacity">
                            <Eye className="w-5 h-5 mb-1" />
                            <span className="text-[10px] font-bold text-center">Click to Enlarge</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed rounded-xl">
                      <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-1 opacity-50" />
                      <p className="text-xs text-muted-foreground">No portfolio or certificate documents were uploaded during registration.</p>
                    </div>
                  )}
                </div>

                {/* Login Credentials & Controls */}
                <div className="bg-card border border-border/70 rounded-2xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Key className="w-4 h-4 text-primary" /> Login Account Credentials</span>
                    {selectedStylist.approved_email && (
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Account Activated
                      </span>
                    )}
                  </h4>

                  {(() => {
                    const stats = trainingService.getEmployeeStats(selectedStylist.id, 'stylist');
                    const isTrained = selectedStylist.status === 'training_completed' || (stats.totalLessons > 0 && stats.completedLessons >= stats.totalLessons);

                    return (
                      <div className="space-y-3">
                        {/* Training Status in modal */}
                        <div className="p-3 rounded-xl bg-muted/40 border border-border/70 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-bold text-foreground">
                              <GraduationCap className="w-4 h-4 text-primary" />
                              Academy Training Progress:
                            </div>
                            <span className="font-semibold text-muted-foreground">
                              {stats.completedLessons} / {stats.totalLessons} Lessons ({stats.completionPercentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full ${isTrained || selectedStylist.status === 'approved' ? 'bg-emerald-500' : stats.completedLessons > 0 ? 'bg-amber-500' : 'bg-rose-400'}`}
                              style={{ width: `${Math.max(stats.completionPercentage, (isTrained || selectedStylist.status === 'approved') ? 100 : 0)}%` }}
                            />
                          </div>
                          {!isTrained && selectedStylist.status !== 'approved' && (
                            <div className="flex items-center justify-between gap-2 pt-1">
                              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                                Training must be finished before issuing login credentials.
                              </p>
                              <Button
                                size="sm"
                                onClick={() => {
                                  trainingService.markAllTrainingComplete(selectedStylist.id, 'stylist');
                                  handleRequest(selectedStylist.id, 'stylist', 'training_completed', 'Admin verified and marked all training complete.');
                                  setSelectedStylist({ ...selectedStylist, status: 'training_completed' });
                                  toast({ title: 'Training Marked Complete! ✓', description: 'Portal credentials generation unlocked.' });
                                }}
                                className="h-6 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 gap-1"
                              >
                                <CheckCircle className="w-3 h-3" /> Mark Complete
                              </Button>
                            </div>
                          )}
                        </div>

                        {selectedStylist.approved_email ? (
                          <div className="p-3 rounded-xl bg-muted/60 border border-border/70 text-xs space-y-1">
                            <p><span className="text-muted-foreground">Login Email:</span> <span className="font-mono font-semibold">{selectedStylist.approved_email}</span></p>
                            <p><span className="text-muted-foreground">Password:</span> <span className="font-mono font-semibold">••••••••••••</span></p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(selectedStylist.approved_email || '', 'Email copied!')}
                              className="h-7 text-xs gap-1 mt-2"
                            >
                              <Copy className="w-3 h-3" /> Copy Email
                            </Button>
                          </div>
                        ) : isTrained ? (
                          <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-emerald-50/70 border border-emerald-300">
                            <div>
                              <p className="text-xs font-bold text-emerald-900">Training Verified (100% Complete)</p>
                              <p className="text-[11px] text-emerald-700">Candidate is qualified for portal login credentials.</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                setCredentialDialog({ open: true, request: selectedStylist, type: 'stylist' });
                                setCredEmail(selectedStylist.email);
                                setCredPassword(`Satguru@${Date.now().toString().slice(-4)}`);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-bold gap-1 shadow-xs"
                            >
                              <Key className="w-3.5 h-3.5" /> Approve & Set Login
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                            <div>
                              <p className="text-xs font-bold text-amber-900 flex items-center gap-1">
                                <Lock className="w-3.5 h-3.5 text-amber-600" /> Credentials Locked
                              </p>
                              <p className="text-[11px] text-amber-800">Candidate must complete all training modules before account can be created.</p>
                            </div>
                            <Button
                              size="sm"
                              disabled
                              className="opacity-60 cursor-not-allowed bg-stone-200 text-stone-600 text-xs h-7"
                            >
                              Locked
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-border flex flex-wrap gap-2 justify-between">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => {
                      setSelectedStylist(null);
                      navigate(`/admin/stylist/${selectedStylist.id}`);
                    }}
                    className="text-xs gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open Full Management Dashboard
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedStylist(null)}
                    className="text-xs"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── 4. ASSOCIATE PROFILE & DOCUMENTS DIALOG ── */}
      <Dialog open={!!selectedAssociate} onOpenChange={(o) => { if (!o) setSelectedAssociate(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedAssociate && (
            <div>
              <DialogHeader className="border-b pb-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <DialogTitle className="text-xl flex items-center gap-2">
                      <Store className="w-5 h-5 text-primary" />
                      {selectedAssociate.shop_name}
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Owner: <span className="font-semibold text-foreground">{selectedAssociate.owner_name}</span> • Applied on {new Date(selectedAssociate.created_at).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs border ${statusColor(selectedAssociate.status)}`}>
                      {selectedAssociate.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-5 py-4">
                {/* Shop Location & Contact */}
                <div className="bg-muted/40 border border-border/70 rounded-2xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-primary" /> Shop Information & Location
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Owner Name</p>
                      <p className="font-semibold text-foreground">{selectedAssociate.owner_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone Number</p>
                      <p className="font-semibold text-foreground">{selectedAssociate.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-semibold text-foreground">{selectedAssociate.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">City & State</p>
                      <p className="font-semibold text-foreground">{selectedAssociate.city}, {selectedAssociate.state}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-muted-foreground">Complete Shop Address</p>
                      <p className="font-semibold text-foreground flex items-start gap-1 mt-0.5">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        {selectedAssociate.address}, {selectedAssociate.area}, {selectedAssociate.city}, {selectedAssociate.state}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border/50">
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50" asChild>
                      <a href={`tel:${selectedAssociate.phone}`}>
                        <Phone className="w-3.5 h-3.5" /> Call Owner
                      </a>
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50" asChild>
                      <a href={getWhatsAppUrl(selectedAssociate.phone, `Hi ${selectedAssociate.owner_name}, regarding your Satguru Makeup Art shop partnership (${selectedAssociate.shop_name})...`)} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Owner
                      </a>
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/5" asChild>
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedAssociate.shop_name} ${selectedAssociate.address} ${selectedAssociate.city}`)}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5" /> View on Google Maps
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Operating Hours & Schedule */}
                <div className="bg-card border border-border/70 rounded-2xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" /> Operating Hours & Availability
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Available Days</p>
                      <p className="font-semibold text-foreground">
                        {selectedAssociate.available_days && selectedAssociate.available_days.length > 0
                          ? selectedAssociate.available_days.join(', ')
                          : 'Monday to Sunday'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Daily Timings</p>
                      <p className="font-semibold text-foreground">
                        {selectedAssociate.opening_time || '10:00 AM'} - {selectedAssociate.closing_time || '08:00 PM'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verification Documents & Shop Photos */}
                <div className="bg-card border border-border/70 rounded-2xl p-4 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-primary" /> Official Verification Proof
                    </h4>
                    {selectedAssociate.proof_document_url ? (
                      <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm text-blue-950">
                            {selectedAssociate.proof_type ? selectedAssociate.proof_type.toUpperCase() : 'IDENTITY / BUSINESS PROOF'}
                          </p>
                          <p className="text-xs text-blue-700">Official document submitted during registration</p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-xs font-semibold gap-1.5"
                          onClick={() => {
                            if (selectedAssociate.proof_document_url?.endsWith('.pdf')) {
                              window.open(selectedAssociate.proof_document_url, '_blank');
                            } else {
                              setSelectedImagePreview({ url: selectedAssociate.proof_document_url || '', title: `${selectedAssociate.shop_name} - ${selectedAssociate.proof_type || 'Proof Document'}` });
                            }
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" /> Inspect Document
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic py-1">No proof document uploaded.</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-primary" /> Shop Photos Gallery
                    </h4>
                    {selectedAssociate.photos && Object.keys(selectedAssociate.photos).length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {selectedAssociate.photos.insidePhoto && (
                          <div
                            onClick={() => setSelectedImagePreview({ url: selectedAssociate.photos?.insidePhoto || '', title: `${selectedAssociate.shop_name} - Inside Shop Photo` })}
                            className="group relative rounded-xl overflow-hidden border border-border/70 aspect-video bg-black/5 hover:border-primary cursor-pointer transition-all hover:scale-105"
                          >
                            <img src={selectedAssociate.photos.insidePhoto} alt="Inside" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-2 text-white transition-opacity">
                              <span className="text-[10px] font-bold">Inside Photo</span>
                            </div>
                          </div>
                        )}
                        {selectedAssociate.photos.outsidePhoto && (
                          <div
                            onClick={() => setSelectedImagePreview({ url: selectedAssociate.photos?.outsidePhoto || '', title: `${selectedAssociate.shop_name} - Outside Shop Photo` })}
                            className="group relative rounded-xl overflow-hidden border border-border/70 aspect-video bg-black/5 hover:border-primary cursor-pointer transition-all hover:scale-105"
                          >
                            <img src={selectedAssociate.photos.outsidePhoto} alt="Outside" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-2 text-white transition-opacity">
                              <span className="text-[10px] font-bold">Outside Photo</span>
                            </div>
                          </div>
                        )}
                        {selectedAssociate.photos.otherPhoto && (
                          <div
                            onClick={() => setSelectedImagePreview({ url: selectedAssociate.photos?.otherPhoto || '', title: `${selectedAssociate.shop_name} - Additional Photo` })}
                            className="group relative rounded-xl overflow-hidden border border-border/70 aspect-video bg-black/5 hover:border-primary cursor-pointer transition-all hover:scale-105"
                          >
                            <img src={selectedAssociate.photos.otherPhoto} alt="Other" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-2 text-white transition-opacity">
                              <span className="text-[10px] font-bold">Additional Photo</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic py-1">No shop photos submitted.</p>
                    )}
                  </div>
                </div>

                {/* Login Credentials & Approvals */}
                <div className="bg-card border border-border/70 rounded-2xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Key className="w-4 h-4 text-primary" /> Partner Login Credentials</span>
                    {selectedAssociate.approved_email && (
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Partner Active
                      </span>
                    )}
                  </h4>

                  {(() => {
                    const stats = trainingService.getEmployeeStats(selectedAssociate.id, 'associate');
                    const isTrained = selectedAssociate.status === 'training_completed' || (stats.totalLessons > 0 && stats.completedLessons >= stats.totalLessons);

                    return (
                      <div className="space-y-3">
                        {/* Training Status in modal */}
                        <div className="p-3 rounded-xl bg-muted/40 border border-border/70 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-bold text-foreground">
                              <GraduationCap className="w-4 h-4 text-primary" />
                              Operational Training Progress:
                            </div>
                            <span className="font-semibold text-muted-foreground">
                              {stats.completedLessons} / {stats.totalLessons} Lessons ({stats.completionPercentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full ${isTrained || selectedAssociate.status === 'approved' ? 'bg-emerald-500' : stats.completedLessons > 0 ? 'bg-amber-500' : 'bg-rose-400'}`}
                              style={{ width: `${Math.max(stats.completionPercentage, (isTrained || selectedAssociate.status === 'approved') ? 100 : 0)}%` }}
                            />
                          </div>
                          {!isTrained && selectedAssociate.status !== 'approved' && (
                            <div className="flex items-center justify-between gap-2 pt-1">
                              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                                Hygiene & doorstep SOP training must be finished before issuing credentials.
                              </p>
                              <Button
                                size="sm"
                                onClick={() => {
                                  trainingService.markAllTrainingComplete(selectedAssociate.id, 'associate');
                                  handleRequest(selectedAssociate.id, 'associate', 'training_completed', 'Admin verified and marked all training complete.');
                                  setSelectedAssociate({ ...selectedAssociate, status: 'training_completed' });
                                  toast({ title: 'Training Marked Complete! ✓', description: 'Partner portal credentials generation unlocked.' });
                                }}
                                className="h-6 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 gap-1"
                              >
                                <CheckCircle className="w-3 h-3" /> Mark Complete
                              </Button>
                            </div>
                          )}
                        </div>

                        {selectedAssociate.approved_email ? (
                          <div className="p-3 rounded-xl bg-muted/60 border border-border/70 text-xs space-y-1">
                            <p><span className="text-muted-foreground">Login Email:</span> <span className="font-mono font-semibold">{selectedAssociate.approved_email}</span></p>
                            <p><span className="text-muted-foreground">Password:</span> <span className="font-mono font-semibold">••••••••••••</span></p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(selectedAssociate.approved_email || '', 'Email copied!')}
                              className="h-7 text-xs gap-1 mt-2"
                            >
                              <Copy className="w-3 h-3" /> Copy Email
                            </Button>
                          </div>
                        ) : isTrained ? (
                          <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-emerald-50/70 border border-emerald-300">
                            <div>
                              <p className="text-xs font-bold text-emerald-900">Training Verified (100% Complete)</p>
                              <p className="text-[11px] text-emerald-700">Partner shop is qualified for dashboard credentials.</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                setCredentialDialog({ open: true, request: selectedAssociate, type: 'associate' });
                                setCredEmail(selectedAssociate.email);
                                setCredPassword(`Satguru@${Date.now().toString().slice(-4)}`);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-bold gap-1 shadow-xs"
                            >
                              <Key className="w-3.5 h-3.5" /> Approve & Set Login
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                            <div>
                              <p className="text-xs font-bold text-amber-900 flex items-center gap-1">
                                <Lock className="w-3.5 h-3.5 text-amber-600" /> Credentials Locked
                              </p>
                              <p className="text-[11px] text-amber-800">Partner must complete all operational lessons before account can be created.</p>
                            </div>
                            <Button
                              size="sm"
                              disabled
                              className="opacity-60 cursor-not-allowed bg-stone-200 text-stone-600 text-xs h-7"
                            >
                              Locked
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-border flex flex-wrap gap-2 justify-end">
                  {selectedAssociate.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        handleRequest(selectedAssociate.id, 'associate', 'rejected');
                        setSelectedAssociate(prev => prev ? { ...prev, status: 'rejected' } : null);
                      }}
                      className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                    >
                      Reject Request
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedAssociate(null)}
                    className="text-xs"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── 5. IMAGE LIGHTBOX VIEWER ── */}
      {selectedImagePreview && (
        <Dialog open={!!selectedImagePreview} onOpenChange={() => setSelectedImagePreview(null)}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black/95 text-white border-0">
            <div className="relative flex flex-col items-center justify-center p-4">
              <div className="flex items-center justify-between w-full pb-3 border-b border-white/10 mb-3">
                <p className="text-sm font-bold truncate pr-4">{selectedImagePreview.title}</p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs bg-white/10 hover:bg-white/20 border-white/20 text-white"
                    onClick={() => window.open(selectedImagePreview.url, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" /> Open Original
                  </Button>
                  <button
                    onClick={() => setSelectedImagePreview(null)}
                    className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="max-h-[75vh] w-full flex items-center justify-center overflow-hidden rounded-xl">
                <img
                  src={selectedImagePreview.url}
                  alt={selectedImagePreview.title}
                  className="max-h-[75vh] w-auto object-contain rounded-lg"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}


