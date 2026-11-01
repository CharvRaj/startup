import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Headphones,
  Sparkles,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Send,
  User,
  Phone,
  Mail,
  Calendar,
  Layers,
  Copy,
  LogOut,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Tag,
  Check,
  Zap,
  SlidersHorizontal,
  X,
  FileText,
  Lock,
  ChevronLeft,
  Sun,
  Moon,
  MessageCircle,
  AlertCircle,
  BadgeAlert,
  HelpCircle,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  queryTicketService,
  QueryResolver,
  QueryTicket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
} from '@/lib/queryTicketService';
import { useToast } from '@/hooks/use-toast';

interface CannedTemplate {
  category: string;
  label: string;
  text: string;
}

const CANNED_TEMPLATES: CannedTemplate[] = [
  {
    category: 'Stylist Delay',
    label: 'Stylist Delayed - Expediting',
    text: 'Namaste! We have contacted your assigned specialist. She is en route and will arrive shortly with sanitized equipment. We sincerely apologize for the slight delay.',
  },
  {
    category: 'Rescheduling',
    label: 'Reschedule Approved',
    text: 'Your appointment has been successfully rescheduled to your requested date & time slot. Our salon desk has confirmed your slot.',
  },
  {
    category: 'Refund',
    label: 'Wallet Credit Processed',
    text: 'Your refund has been approved and credited back to your Beauty Wallet. You can immediately apply it towards any future salon treatment or home order.',
  },
  {
    category: 'Stylist Reassignment',
    label: 'Senior Stylist Reassigned',
    text: 'To ensure exceptional service, we have assigned senior specialist Meera to your appointment. The salon suite has been reserved for your visit.',
  },
  {
    category: 'Quality Care',
    label: 'Quality Concern & Voucher',
    text: 'We deeply value your feedback regarding service quality. We have logged this with our lead educator and credited a complimentary herbal treatment voucher to your account.',
  },
  {
    category: 'Ticket Closure',
    label: 'Resolution Confirmation',
    text: 'We are pleased to inform you that this query has been fully resolved. If you require any further assistance, please feel free to reply or contact our front desk at +91 98765 43210.',
  },
];

const RESOLUTION_CHECKLIST = [
  'Verify booking details & timing in system',
  'Contact assigned stylist or studio coordinator',
  'Provide customer with accurate ETA / resolution',
  'Offer wallet credit or complimentary perk if delayed >20m',
  'Document internal investigation note before closing',
];

export function QueryResolverDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [resolver, setResolver] = useState<QueryResolver | null>(null);
  const [tickets, setTickets] = useState<QueryTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TicketPriority>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | TicketCategory>('all');
  const [departmentFilter, setDepartmentFilter] = useState<'all' | 'salon' | 'doorstep'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | '3days' | 'month'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'urgent'>('newest');

  // Workstation visual mode (Luxury Ivory vs Obsidian Night)
  const [darkMode, setDarkMode] = useState(false);

  // Slidebar visibility
  const [slidebarOpen, setSlidebarOpen] = useState(true);

  // Message reply vs internal note mode
  const [replyMode, setReplyMode] = useState<'reply' | 'internal'>('reply');
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [copied, setCopied] = useState(false);

  // Resolution Notes Modal
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolutionNoteInput, setResolutionNoteInput] = useState('');

  // Check resolver session on mount
  useEffect(() => {
    let cur = queryTicketService.getCurrentResolver();
    if (!cur) {
      // Provide fallback for active admin testing if available
      const resolvers = queryTicketService.getResolvers().filter((r) => r.is_active);
      if (resolvers.length > 0) {
        cur = resolvers[0];
        sessionStorage.setItem('satguru_resolver_session_v1', JSON.stringify(cur));
      } else {
        navigate('/login');
        return;
      }
    }
    setResolver(cur);
    loadTickets();

    // Event listeners for real-time ticket updates (in-tab & cross-tab)
    const handleTicketsUpdated = () => {
      loadTickets();
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'satguru_query_tickets_v1' || e.key === 'satguru_tickets_last_sync') {
        loadTickets();
      }
    };

    window.addEventListener('satguru:tickets_updated', handleTicketsUpdated);
    window.addEventListener('storage', handleStorageEvent);

    // Auto-sync polling every 15 seconds
    const interval = setInterval(() => {
      syncTickets(false);
    }, 15000);

    return () => {
      window.removeEventListener('satguru:tickets_updated', handleTicketsUpdated);
      window.removeEventListener('storage', handleStorageEvent);
      clearInterval(interval);
    };
  }, [navigate]);

  const loadTickets = () => {
    const all = queryTicketService.getAllTickets();
    setTickets(all);
    if (all.length > 0 && !selectedTicketId) {
      setSelectedTicketId(all[0].id);
    }
  };

  const syncTickets = async (showToast = true) => {
    setSyncing(true);
    try {
      const all = await queryTicketService.fetchAllTickets();
      setTickets(all);
      setLastSyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      if (showToast) {
        toast({
          title: 'Tickets Synced',
          description: `Loaded ${all.length} total tickets from portal database.`,
        });
      }
    } catch (e: any) {
      console.warn('Sync error:', e);
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = () => {
    queryTicketService.logoutResolver();
    toast({ title: 'Signed out from Resolution Desk' });
    navigate('/login');
  };

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0] || null;

  // Filter & Sort Pipeline
  const filteredTickets = useMemo(() => {
    return tickets
      .filter((t) => {
        // Status filter
        if (statusFilter !== 'all' && t.status !== statusFilter) return false;

        // Priority filter
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

        // Category filter
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

        // Department filter
        if (departmentFilter === 'salon') {
          if (t.booking_info?.type && t.booking_info.type !== 'salon_booking') return false;
        } else if (departmentFilter === 'doorstep') {
          if (t.booking_info?.type && !t.booking_info.type.includes('order')) return false;
        }

        // Time filter
        if (timeFilter !== 'all') {
          const tDate = new Date(t.created_at).getTime();
          const now = Date.now();
          if (timeFilter === 'today' && now - tDate > 86400000) return false;
          if (timeFilter === '3days' && now - tDate > 86400000 * 3) return false;
          if (timeFilter === 'month' && now - tDate > 86400000 * 30) return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchNum = t.ticket_number?.toLowerCase().includes(q);
          const matchName = t.customer_name?.toLowerCase().includes(q);
          const matchEmail = t.customer_email?.toLowerCase().includes(q);
          const matchPhone = t.customer_phone?.toLowerCase().includes(q);
          const matchSubject = t.subject?.toLowerCase().includes(q);
          const matchService = t.booking_info?.service_name?.toLowerCase().includes(q);
          const matchBookingId = t.booking_info?.booking_id?.toLowerCase().includes(q);
          const matchOrderId = t.booking_info?.order_id?.toLowerCase().includes(q);

          if (
            !matchNum &&
            !matchName &&
            !matchEmail &&
            !matchPhone &&
            !matchSubject &&
            !matchService &&
            !matchBookingId &&
            !matchOrderId
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'urgent') {
          const priorityRank: Record<string, number> = { urgent: 4, high: 3, normal: 2, low: 1 };
          return (priorityRank[b.priority] || 1) - (priorityRank[a.priority] || 1);
        }
        if (sortBy === 'oldest') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [tickets, statusFilter, priorityFilter, categoryFilter, departmentFilter, timeFilter, searchQuery, sortBy]);

  // Metrics
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;
  const urgentCount = tickets.filter((t) => t.priority === 'urgent' && t.status !== 'resolved' && t.status !== 'closed').length;

  const handleCopy = (str: string, label = 'Copied') => {
    navigator.clipboard.writeText(str);
    setCopied(true);
    toast({ title: label });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = (newStatus: TicketStatus, notes?: string) => {
    if (!selectedTicket || !resolver) return;
    try {
      queryTicketService.updateTicketStatus(
        selectedTicket.id,
        newStatus,
        notes || `Status changed to ${newStatus.toUpperCase()} by ${resolver.name}`,
        resolver.id,
        resolver.name
      );
      toast({ title: `Ticket status set to ${newStatus.toUpperCase()}` });
      loadTickets();
    } catch (e: any) {
      toast({ title: 'Error updating status', description: e.message, variant: 'destructive' });
    }
  };

  const handlePriorityChange = (newPriority: TicketPriority) => {
    if (!selectedTicket) return;
    try {
      const all = queryTicketService.getAllTickets();
      const idx = all.findIndex((t) => t.id === selectedTicket.id);
      if (idx !== -1) {
        all[idx].priority = newPriority;
        all[idx].updated_at = new Date().toISOString();
        localStorage.setItem('satguru_query_tickets_v1', JSON.stringify(all));
        window.dispatchEvent(new CustomEvent('satguru:tickets_updated', { detail: all }));
        toast({ title: `Priority updated to ${newPriority.toUpperCase()}` });
        loadTickets();
      }
    } catch (e: any) {
      toast({ title: 'Error updating priority', description: e.message, variant: 'destructive' });
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket || !resolver) return;

    setSubmittingReply(true);
    try {
      if (replyMode === 'internal') {
        queryTicketService.addInternalNote(
          selectedTicket.id,
          replyText.trim(),
          resolver.name,
          resolver.id
        );
        toast({ title: 'Internal note saved' });
      } else {
        await queryTicketService.addMessage(selectedTicket.id, {
          sender_type: 'resolver',
          sender_name: `${resolver.name} (Query Desk)`,
          sender_id: resolver.id,
          message: replyText.trim(),
        });
        toast({ title: 'Reply sent to customer' });
      }

      setReplyText('');
      loadTickets();
    } catch (e: any) {
      toast({ title: 'Error sending message', description: e.message, variant: 'destructive' });
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleConfirmResolve = () => {
    if (!selectedTicket || !resolver) return;
    handleStatusChange(
      'resolved',
      resolutionNoteInput.trim() || `Resolved and confirmed with client by ${resolver.name}`
    );
    setResolveModalOpen(false);
    setResolutionNoteInput('');
  };

  // Generate WhatsApp Direct Link
  const getWhatsAppLink = (ticket: QueryTicket) => {
    const phone = ticket.customer_phone?.replace(/[^0-9]/g, '') || '';
    if (!phone) return '#';
    const message = encodeURIComponent(
      `Namaste ${ticket.customer_name}! This is ${resolver?.name || 'Support'} from Satguru Makeup Art Resolution Desk regarding your ticket #${ticket.ticket_number} for "${ticket.booking_info?.service_name || ticket.subject}". We are actively looking into your request. How may we further assist you today?`
    );
    return `https://wa.me/${phone.startsWith('91') ? phone : `91${phone}`}?text=${message}`;
  };

  // Calculate SLA elapsed time and progress
  const getSLAInfo = (ticket: QueryTicket) => {
    const createdTime = new Date(ticket.created_at).getTime();
    const diffMins = Math.max(0, Math.floor((Date.now() - createdTime) / (1000 * 60)));
    const targetMins = ticket.priority === 'urgent' ? 60 : ticket.priority === 'high' ? 120 : 240;
    const isExceeded = diffMins > targetMins && ticket.status !== 'resolved' && ticket.status !== 'closed';

    let timeDisplay = `${diffMins}m ago`;
    if (diffMins > 60) {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      timeDisplay = `${hours}h ${mins}m ago`;
    }

    return {
      timeDisplay,
      isExceeded,
      targetRange: ticket.priority === 'urgent' ? 'Within 30–60 mins' : 'Within 2–4 hours',
      onTrack: !isExceeded,
    };
  };

  if (!resolver) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF9F3]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#D81B60] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground font-medium">Opening Resolution Workstation...</p>
        </div>
      </div>
    );
  }

  const themeClasses = darkMode
    ? {
        bg: 'bg-slate-950 text-slate-100',
        card: 'bg-slate-900 border-white/10 text-slate-100',
        header: 'bg-slate-900/90 border-white/10 text-white',
        muted: 'text-slate-400',
        activePill: 'bg-[#D81B60] text-white',
        inactivePill: 'bg-white/5 text-slate-300 hover:bg-white/10',
        input: 'bg-white/5 border-white/10 text-white placeholder:text-white/30',
        subtleCard: 'bg-white/[0.03] border-white/10',
      }
    : {
        bg: 'bg-[#FFF9F3] text-foreground',
        card: 'bg-white border-[#F8DCE4] text-foreground shadow-xs',
        header: 'bg-white/95 border-[#F8DCE4] text-foreground shadow-2xs',
        muted: 'text-muted-foreground',
        activePill: 'bg-[#43152E] text-white shadow-xs',
        inactivePill: 'bg-[#FFF0F5] text-[#43152E] hover:bg-[#FCE8F0]',
        input: 'bg-white border-[#F8DCE4] text-foreground placeholder:text-muted-foreground/60',
        subtleCard: 'bg-[#FFFDFB] border-[#F8DCE4]',
      };

  return (
    <div className={`min-h-screen ${themeClasses.bg} font-sans flex flex-col transition-colors duration-200`}>
      {/* ── TOP RESOLVER BAR ── */}
      <header className={`h-16 px-4 sm:px-6 border-b ${themeClasses.header} backdrop-blur-md flex items-center justify-between sticky top-0 z-30`}>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSlidebarOpen(!slidebarOpen)}
            className="h-9 px-3 rounded-xl border-[#F8DCE4] gap-1.5 text-xs font-semibold"
            title={slidebarOpen ? 'Collapse Tools Slidebar' : 'Expand Tools Slidebar'}
          >
            <SlidersHorizontal className="w-4 h-4 text-[#D81B60]" />
            <span className="hidden sm:inline">{slidebarOpen ? 'Hide Slidebar' : 'Open Slidebar'}</span>
          </Button>

          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#43152E] to-[#D81B60] flex items-center justify-center text-white shadow-xs flex-shrink-0">
            <Headphones className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-serif italic font-bold text-base sm:text-lg text-[#43152E]">
                Query Resolution Desk
              </h1>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] py-0 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5" />Live Desk
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Department: <span className="font-medium text-foreground">{resolver.department}</span>
            </p>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sync Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => syncTickets(true)}
            disabled={syncing}
            className="h-9 px-3 text-xs border-[#F8DCE4] gap-1.5 rounded-xl font-medium"
            title="Fetch latest tickets from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#D81B60] ${syncing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Sync ({lastSyncTime})</span>
          </Button>

          {/* Theme Switcher */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDarkMode(!darkMode)}
            className="w-9 h-9 p-0 rounded-xl"
            title={darkMode ? 'Switch to Warm Studio Mode' : 'Switch to Night Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </Button>

          {/* Resolver Profile Badge */}
          <div className="hidden lg:flex items-center gap-2.5 px-3 py-1 rounded-xl bg-[#FFF0F5] border border-[#F8DCE4] text-xs">
            <div className="w-7 h-7 rounded-full bg-[#43152E] text-white font-bold flex items-center justify-center text-xs">
              {resolver.name.charAt(0)}
            </div>
            <div className="text-left leading-tight">
              <p className="font-bold text-[#43152E] text-xs">{resolver.name}</p>
              <p className="text-[10px] text-muted-foreground">{resolver.email}</p>
            </div>
          </div>

          {/* Sign Out */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleLogout}
            className="h-9 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      {/* ── KPI METRICS STRIP ── */}
      <section className="px-4 sm:px-6 py-3 border-b border-[#F8DCE4]/70 bg-gradient-to-r from-[#FAF4EF] via-[#FFF9F3] to-[#FAF4EF]">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 max-w-7xl mx-auto">
          {/* Metric 1 */}
          <div
            onClick={() => setStatusFilter('all')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white border-[#D81B60] shadow-xs'
                : 'bg-white/80 border-[#F8DCE4] hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Total Tickets</span>
              <Layers className="w-3.5 h-3.5 text-[#D81B60]" />
            </div>
            <p className="text-xl font-bold font-serif text-[#43152E] mt-0.5">{totalCount}</p>
          </div>

          {/* Metric 2: Open */}
          <div
            onClick={() => setStatusFilter('open')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'open'
                ? 'bg-white border-amber-500 shadow-xs'
                : 'bg-white/80 border-[#F8DCE4] hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700">Needs Action</span>
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <p className="text-xl font-bold font-serif text-amber-800 mt-0.5">{openCount}</p>
          </div>

          {/* Metric 3: In Progress */}
          <div
            onClick={() => setStatusFilter('in_progress')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'in_progress'
                ? 'bg-white border-blue-500 shadow-xs'
                : 'bg-white/80 border-[#F8DCE4] hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700">In Progress</span>
              <Zap className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-xl font-bold font-serif text-blue-800 mt-0.5">{inProgressCount}</p>
          </div>

          {/* Metric 4: Resolved */}
          <div
            onClick={() => setStatusFilter('resolved')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'resolved'
                ? 'bg-white border-emerald-500 shadow-xs'
                : 'bg-white/80 border-[#F8DCE4] hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">Resolved</span>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xl font-bold font-serif text-emerald-800 mt-0.5">{resolvedCount}</p>
          </div>

          {/* Metric 5: Urgent */}
          <div
            onClick={() => setPriorityFilter('urgent')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer col-span-2 sm:col-span-1 ${
              priorityFilter === 'urgent'
                ? 'bg-red-50 border-red-500 shadow-xs'
                : 'bg-white/80 border-[#F8DCE4] hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-red-700">Urgent SLA</span>
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            </div>
            <p className="text-xl font-bold font-serif text-red-800 mt-0.5">{urgentCount}</p>
          </div>
        </div>
      </section>

      {/* ── WORKSPACE BODY WITH DYNAMIC SLIDEBAR ── */}
      <div className="flex-1 flex overflow-hidden p-3 sm:p-5 gap-4 max-w-7xl mx-auto w-full">
        {/* ── 1. COLLAPSIBLE SLIDEBAR WITH ALL FEATURES ── */}
        {slidebarOpen && (
          <aside className={`w-72 lg:w-80 flex flex-col rounded-3xl border ${themeClasses.card} overflow-hidden shrink-0 shadow-sm animate-in slide-in-from-left duration-200`}>
            {/* Slidebar Header */}
            <div className="p-4 border-b border-[#F8DCE4] flex items-center justify-between bg-gradient-to-r from-[#FFF5F8] to-[#FFF0E8]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#D81B60]" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#43152E]">
                  Resolution Slidebar
                </h3>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSlidebarOpen(false)}
                className="w-7 h-7 p-0 rounded-full"
                title="Hide slidebar"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Slidebar Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
              {/* Category Filter */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#D81B60]" /> Filter By Category
                </p>
                <div className="space-y-1">
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className={`w-full text-left px-3 py-1.5 rounded-xl font-medium transition-colors ${
                      categoryFilter === 'all' ? themeClasses.activePill : themeClasses.inactivePill
                    }`}
                  >
                    All Categories ({tickets.length})
                  </button>
                  {[
                    'Stylist Delay / Not Arrived',
                    'Reschedule Request',
                    'Cancellation & Refund',
                    'Billing / Overcharged',
                    'Service Quality Concern',
                    'Special Pre-Bridal Request',
                    'Product Allergy / Issue',
                    'General Support',
                  ].map((cat) => {
                    const count = tickets.filter((t) => t.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat as TicketCategory)}
                        className={`w-full text-left px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center justify-between ${
                          categoryFilter === cat ? themeClasses.activePill : themeClasses.inactivePill
                        }`}
                      >
                        <span className="truncate">{cat}</span>
                        <span className="text-[10px] opacity-75 font-mono ml-1">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority Matrix */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Priority & Response SLA
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['all', 'urgent', 'high', 'normal', 'low'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriorityFilter(p)}
                      className={`px-2.5 py-1.5 rounded-xl font-medium capitalize text-center transition-all ${
                        priorityFilter === p ? themeClasses.activePill : themeClasses.inactivePill
                      }`}
                    >
                      {p === 'urgent' ? 'Urgent (<1h)' : p === 'high' ? 'High (<2h)' : p === 'normal' ? 'Normal (2-4h)' : p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Department Filter */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#43152E]" /> Department Scope
                </p>
                <div className="flex gap-1.5">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'salon', label: 'Salon Bookings' },
                    { id: 'doorstep', label: 'Home & Mehndi' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDepartmentFilter(d.id as any)}
                      className={`flex-1 py-1.5 rounded-xl font-medium text-[11px] transition-all text-center ${
                        departmentFilter === d.id ? themeClasses.activePill : themeClasses.inactivePill
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Scope Filter */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Creation Time Period
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'all', label: 'All Time' },
                    { id: 'today', label: 'Past 24 Hours' },
                    { id: '3days', label: 'Past 3 Days' },
                    { id: 'month', label: 'This Month' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTimeFilter(t.id as any)}
                      className={`py-1.5 rounded-xl font-medium text-[11px] transition-all text-center ${
                        timeFilter === t.id ? themeClasses.activePill : themeClasses.inactivePill
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Canned Responses Quick Arsenal */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Canned Response Templates
                </p>
                <p className="text-[10px] text-muted-foreground mb-2">
                  Click any template to auto-fill into the reply box:
                </p>
                <div className="space-y-1.5">
                  {CANNED_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setReplyMode('reply');
                        setReplyText(tmpl.text);
                        toast({ title: 'Template inserted', description: tmpl.label });
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-white/60 hover:bg-[#FFF0F5] border border-[#F8DCE4] transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#43152E] text-[11px] group-hover:text-[#D81B60]">
                          {tmpl.label}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#FAF4EF] text-muted-foreground">
                          {tmpl.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {tmpl.text}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolver Standard Operating Playbook */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFF9F3] to-[#FFF0F5] border border-[#F8DCE4]">
                <p className="text-[11px] font-bold text-[#43152E] flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="w-4 h-4 text-[#D81B60]" /> Resolver Playbook (SOP)
                </p>
                <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                  {RESOLUTION_CHECKLIST.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#F8DCE4] text-[#D81B60] font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        )}

        {/* ── 2. TICKETS LIST PANE ── */}
        <section className={`w-full md:w-80 lg:w-96 flex flex-col rounded-3xl border ${themeClasses.card} overflow-hidden shrink-0 shadow-sm`}>
          {/* Search, Filter Pills & Sort Bar */}
          <div className="p-4 border-b border-[#F8DCE4] space-y-3 bg-[#FFFDFB]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search ticket #, name, phone, service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full h-9 pl-9 pr-3 rounded-xl border ${themeClasses.input} text-xs focus:outline-hidden focus:ring-2 focus:ring-[#D81B60]/20`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Status Buttons */}
            <div className="flex gap-1 overflow-x-auto pb-0.5 no-scrollbar text-xs">
              {(['all', 'open', 'in_progress', 'resolved'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                    statusFilter === st ? themeClasses.activePill : themeClasses.inactivePill
                  }`}
                >
                  {st === 'all'
                    ? `All (${tickets.length})`
                    : st === 'open'
                    ? `Open (${openCount})`
                    : st === 'in_progress'
                    ? `Active (${inProgressCount})`
                    : `Resolved (${resolvedCount})`}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              <span>Showing {filteredTickets.length} queries</span>
              <div className="flex items-center gap-1.5">
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-semibold text-[#43152E] cursor-pointer focus:outline-hidden"
                >
                  <option value="newest">Newest First</option>
                  <option value="urgent">Urgent First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ticket Items List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y divide-[#F8DCE4]/40">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12 px-4 text-muted-foreground">
                <Headphones className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#D81B60]" />
                <p className="text-xs font-semibold">No queries match your filter</p>
                <p className="text-[11px] mt-1">Try resetting the search or category filters.</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                    setCategoryFilter('all');
                  }}
                  className="mt-3 text-xs rounded-full h-8 border-[#F8DCE4]"
                >
                  Reset All Filters
                </Button>
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = t.id === selectedTicketId;
                const sla = getSLAInfo(t);

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all border ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#FFF0F5] to-[#FFF5F8] border-[#D81B60] shadow-xs'
                        : 'bg-white hover:bg-[#FFF9F3] border-[#F8DCE4]/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-[#D81B60]">
                        #{t.ticket_number}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {t.priority === 'urgent' && (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-red-100 text-red-700 border border-red-300 animate-pulse">
                            URGENT
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            t.status === 'open'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : t.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {t.status.toUpperCase().replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <p className="font-bold text-xs text-[#43152E] truncate">{t.customer_name}</p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {t.booking_info?.service_name || t.subject}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2 pt-2 border-t border-[#F8DCE4]/40">
                      <span className="truncate max-w-[140px]">{t.category}</span>
                      <span className={sla.isExceeded ? 'text-red-600 font-bold' : ''}>
                        {sla.timeDisplay}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* ── 3. ACTIVE TICKET WORKSPACE ── */}
        <main className={`flex-1 rounded-3xl border ${themeClasses.card} flex flex-col overflow-hidden shadow-sm`}>
          {selectedTicket ? (
            <>
              {/* Ticket Top Action Bar */}
              <div className="p-4 sm:p-5 border-b border-[#F8DCE4] bg-[#FFFDFB] flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <button
                      onClick={() => handleCopy(selectedTicket.ticket_number, 'Copied Ticket ID')}
                      className="font-mono text-sm font-extrabold text-[#D81B60] bg-[#FFF0F5] border border-[#F8DCE4] px-2.5 py-1 rounded-xl flex items-center gap-1.5 hover:bg-[#FCE8F0] transition-colors"
                      title="Click to copy ticket number"
                    >
                      #{selectedTicket.ticket_number}
                      <Copy className="w-3 h-3 text-muted-foreground" />
                    </button>

                    <Badge
                      className={`text-xs ${
                        selectedTicket.status === 'open'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : selectedTicket.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      {selectedTicket.status.toUpperCase().replace('_', ' ')}
                    </Badge>

                    {/* SLA Indicator */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF4EF] border border-[#F8DCE4] text-[11px] font-medium text-[#43152E]">
                      <Clock className="w-3 h-3 text-[#D81B60]" />
                      <span>SLA: {getSLAInfo(selectedTicket).targetRange}</span>
                    </div>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold text-[#43152E]">
                    {selectedTicket.subject}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Category: <span className="font-semibold text-foreground">{selectedTicket.category}</span> •
                    Registered on {new Date(selectedTicket.created_at).toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Right Action Tools: Quick Status Switcher & Resolve Button */}
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={selectedTicket.priority}
                    onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                    className="h-9 px-3 rounded-xl border border-[#F8DCE4] bg-white text-xs font-semibold text-[#43152E] cursor-pointer"
                    title="Change Priority"
                  >
                    <option value="urgent">Urgent Priority</option>
                    <option value="high">High Priority</option>
                    <option value="normal">Normal Priority</option>
                    <option value="low">Low Priority</option>
                  </select>

                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                    className="h-9 px-3 rounded-xl border border-[#F8DCE4] bg-white text-xs font-semibold text-[#43152E] cursor-pointer"
                  >
                    <option value="open">Open / In Queue</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Mark Resolved</option>
                    <option value="closed">Closed</option>
                  </select>

                  {selectedTicket.status !== 'resolved' && (
                    <Button
                      size="sm"
                      onClick={() => setResolveModalOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold h-9 gap-1 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolve Ticket
                    </Button>
                  )}
                </div>
              </div>

              {/* Customer Information & Attached Booking Card */}
              <div className="p-4 bg-[#FFF9F3]/60 border-b border-[#F8DCE4] grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Customer Details Card */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#F8DCE4] space-y-2 shadow-2xs">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#D81B60]" /> Customer Profile & Direct Contact
                  </p>
                  <div>
                    <p className="font-bold text-sm text-[#43152E]">{selectedTicket.customer_name}</p>
                    <div className="flex items-center gap-3 text-muted-foreground mt-1 flex-wrap">
                      <a
                        href={`mailto:${selectedTicket.customer_email}`}
                        className="flex items-center gap-1 hover:text-[#D81B60]"
                      >
                        <Mail className="w-3 h-3" /> {selectedTicket.customer_email}
                      </a>
                      {selectedTicket.customer_phone && (
                        <a
                          href={`tel:${selectedTicket.customer_phone}`}
                          className="flex items-center gap-1 hover:text-emerald-700 font-medium"
                        >
                          <Phone className="w-3 h-3" /> {selectedTicket.customer_phone}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* 1-Click WhatsApp & Call Shortcuts */}
                  <div className="pt-1 flex items-center gap-2 flex-wrap">
                    {selectedTicket.customer_phone && (
                      <a
                        href={getWhatsAppLink(selectedTicket)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp Customer
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {selectedTicket.customer_phone && (
                      <a
                        href={`tel:${selectedTicket.customer_phone}`}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        Call Client
                      </a>
                    )}
                  </div>
                </div>

                {/* Attached Booking / Order Context Card */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#F8DCE4] space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#D81B60]" /> Booking Context & Specialist
                    </p>
                    {selectedTicket.booking_info && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FFF0F5] text-[#D81B60] font-bold">
                        {selectedTicket.booking_info.type?.replace('_', ' ').toUpperCase()}
                      </span>
                    )}
                  </div>

                  {selectedTicket.booking_info ? (
                    <div>
                      <p className="font-bold text-sm text-[#43152E]">
                        {selectedTicket.booking_info.service_name}
                      </p>
                      <div className="flex items-center gap-3 text-muted-foreground mt-1 flex-wrap">
                        {selectedTicket.booking_info.service_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#D81B60]" /> {selectedTicket.booking_info.service_date}
                          </span>
                        )}
                        {selectedTicket.booking_info.service_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" /> {selectedTicket.booking_info.service_time}
                          </span>
                        )}
                        {selectedTicket.booking_info.total_amount && (
                          <span className="font-bold text-[#43152E]">
                            ₹{selectedTicket.booking_info.total_amount}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 pt-2 border-t border-[#F8DCE4]/60 flex items-center justify-between flex-wrap gap-2">
                        {selectedTicket.booking_info.stylist_name ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground">
                              Specialist: <strong className="text-foreground">{selectedTicket.booking_info.stylist_name}</strong>
                            </span>
                            {selectedTicket.booking_info.stylist_phone && (
                              <a
                                href={`tel:${selectedTicket.booking_info.stylist_phone}`}
                                className="px-2 py-0.5 rounded-md bg-[#FAF4EF] hover:bg-[#F8DCE4] text-[10px] font-semibold text-[#43152E] flex items-center gap-1"
                              >
                                <Phone className="w-2.5 h-2.5 text-[#D81B60]" /> Call Specialist
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            Salon Assigned Specialist
                          </span>
                        )}

                        <span className="text-[10px] font-mono text-muted-foreground">
                          ID: #{selectedTicket.booking_info.booking_id || selectedTicket.booking_info.order_id || 'N/A'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 text-muted-foreground italic text-xs">
                      General user support inquiry (No specific appointment attached).
                    </div>
                  )}
                </div>
              </div>

              {/* Resolution Notes Banner (if ticket resolved) */}
              {selectedTicket.resolution_notes && (
                <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <strong>Official Resolution Recorded:</strong> {selectedTicket.resolution_notes}
                  </div>
                </div>
              )}

              {/* Thread Messages */}
              <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-gradient-to-b from-[#FFFDFB] to-[#FFF9F3]">
                {selectedTicket.messages.map((m) => {
                  const isResolver = m.sender_type === 'resolver' || m.sender_type === 'admin';
                  const isSystem = m.sender_type === 'system';
                  const isInternal = m.message.includes('[INTERNAL PRIVATE NOTE]');

                  if (isInternal) {
                    return (
                      <div key={m.id} className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 max-w-[85%] mx-auto shadow-2xs">
                        <div className="flex items-center gap-2 mb-1 text-[11px] font-bold text-amber-900">
                          <Lock className="w-3.5 h-3.5 text-amber-700" />
                          <span>{m.sender_name}</span>
                          <span className="text-amber-700/60 font-normal ml-auto">
                            {new Date(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-amber-950 font-medium whitespace-pre-wrap leading-relaxed">
                          {m.message.replace('[INTERNAL PRIVATE NOTE] ', '')}
                        </p>
                      </div>
                    );
                  }

                  if (isSystem) {
                    return (
                      <div key={m.id} className="text-center my-2">
                        <span className="text-[11px] px-3.5 py-1 rounded-full bg-white border border-[#F8DCE4] text-muted-foreground inline-block shadow-2xs">
                          ℹ️ {m.message} •{' '}
                          {new Date(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div key={m.id} className={`flex flex-col ${isResolver ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] text-muted-foreground">
                        <span className={`font-bold ${isResolver ? 'text-[#D81B60]' : 'text-[#43152E]'}`}>
                          {isResolver ? `You (${m.sender_name})` : m.sender_name}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div
                        className={`p-4 rounded-2xl max-w-[85%] text-xs shadow-2xs ${
                          isResolver
                            ? 'bg-gradient-to-r from-[#43152E] to-[#601E42] text-white rounded-tr-none'
                            : 'bg-white border border-[#F8DCE4] text-foreground rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Reply Shortcuts Bar */}
              <div className="px-4 py-2 bg-[#FFFDFB] border-t border-[#F8DCE4] overflow-x-auto flex items-center gap-2 no-scrollbar">
                <span className="text-[10px] uppercase font-bold text-[#43152E] tracking-wider shrink-0 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#D81B60]" /> Quick Inserts:
                </span>
                {CANNED_TEMPLATES.map((qr, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setReplyMode('reply');
                      setReplyText(qr.text);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-[#FFF0F5] text-[#43152E] border border-[#F8DCE4] whitespace-nowrap shrink-0 transition-colors font-medium shadow-2xs"
                  >
                    {qr.label}
                  </button>
                ))}
              </div>

              {/* Reply Box Mode Selector & Input */}
              <div className="p-4 border-t border-[#F8DCE4] bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReplyMode('reply')}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        replyMode === 'reply'
                          ? 'bg-[#43152E] text-white shadow-2xs'
                          : 'bg-[#FFF0F5] text-[#43152E] hover:bg-[#FCE8F0]'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Client Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyMode('internal')}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        replyMode === 'internal'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Internal Private Note
                    </button>
                  </div>
                  <span className="text-[11px] text-muted-foreground hidden sm:inline">
                    {replyMode === 'internal'
                      ? 'Private to resolvers only'
                      : 'Will be delivered to client'}
                  </span>
                </div>

                <form onSubmit={handleSendReply} className="flex items-end gap-3">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={
                      replyMode === 'internal'
                        ? 'Type private investigation note (e.g. called stylist Meera, arriving in 5 mins)...'
                        : 'Type your official solution message to the customer...'
                    }
                    className={`flex-1 p-3 rounded-2xl border text-xs focus:outline-hidden focus:ring-2 focus:ring-[#D81B60]/20 resize-none ${
                      replyMode === 'internal'
                        ? 'bg-amber-50/50 border-amber-300 text-amber-950 placeholder:text-amber-700/50'
                        : themeClasses.input
                    }`}
                  />
                  <Button
                    type="submit"
                    disabled={submittingReply || !replyText.trim()}
                    className={`h-11 px-5 rounded-2xl font-semibold text-xs gap-2 shrink-0 text-white shadow-sm transition-all ${
                      replyMode === 'internal'
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-[#43152E] hover:bg-[#2F0E20]'
                    }`}
                  >
                    {submittingReply ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        {replyMode === 'internal' ? 'Save Note' : 'Send Solution'}
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <Headphones className="w-16 h-16 opacity-25 text-[#D81B60] mb-3" />
              <p className="font-bold text-sm text-[#43152E]">No Query Selected</p>
              <p className="text-xs max-w-sm mt-1">
                Select a ticket from the left panel to review booking context, update status, and provide solutions to the client.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* ── RESOLUTION NOTES DIALOG ── */}
      <Dialog open={resolveModalOpen} onOpenChange={setResolveModalOpen}>
        <DialogContent className="max-w-md bg-white border-[#F8DCE4] p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-2xl text-[#43152E]">
              <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 inline" /> Mark Ticket as Resolved</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Record how this query was handled. A solution confirmation will be saved to the ticket history.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Resolution Summary & Actions Taken *
              </label>
              <textarea
                rows={3}
                value={resolutionNoteInput}
                onChange={(e) => setResolutionNoteInput(e.target.value)}
                placeholder="e.g. Confirmed specialist Meera for 3:30 PM slot, client notified via WhatsApp and satisfied."
                className="w-full p-3 rounded-2xl border border-[#F8DCE4] text-xs focus:outline-hidden focus:ring-2 focus:ring-[#D81B60]/20 resize-none"
              />
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Status will be marked RESOLVED and your resolver score will be incremented.</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResolveModalOpen(false)}
              className="rounded-full text-xs border-[#F8DCE4]"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmResolve}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold px-5"
            >
              Confirm Resolution
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
