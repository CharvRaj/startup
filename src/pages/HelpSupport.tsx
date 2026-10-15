import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  HelpCircle,
  Search,
  Calendar,
  Sparkles,
  Wallet,
  Gift,
  Home,
  User,
  ChevronDown,
  Mail,
  Phone,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Tag,
  Loader2,
  ExternalLink,
  Filter,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { queryTicketService, QueryTicket, AttachedBookingInfo } from '@/lib/queryTicketService';
import { supabase } from '@/lib/supabase';
import type { Booking } from '@/types';
import { UserTicketDetailsModal } from '@/components/query/UserTicketDetailsModal';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'appointments',
    question: 'How do I book a beauty appointment?',
    answer:
      'You can book an appointment directly from your Dashboard or the Appointments tab. Choose your preferred beauty service, select a date and convenient time slot, pick your specialist if available, review your booking, and confirm.',
  },
  {
    id: 'faq-2',
    category: 'appointments',
    question: 'How can I reschedule or cancel a booking?',
    answer:
      'Go to the Appointments section in your Dashboard. On any upcoming appointment card, click "Reschedule" to select a new available date and time. To cancel, click "Cancel Booking". Pending or confirmed bookings can be rescheduled up to 4 hours before the appointment.',
  },
  {
    id: 'faq-3',
    category: 'appointments',
    question: 'How do I check my appointment status?',
    answer:
      'Your upcoming appointments and live confirmation statuses (Confirmed, Pending, In Service, or Completed) are visible in your Dashboard overview and under the Appointments tab.',
  },
  {
    id: 'faq-4',
    category: 'rewards',
    question: 'How do I redeem reward points?',
    answer:
      'Navigate to the Rewards section. You earn points on every salon visit and review. You can apply accumulated points at checkout or redeem them for exclusive discount coupons and complimentary add-ons.',
  },
  {
    id: 'faq-5',
    category: 'payments',
    question: 'How do I add money to my wallet?',
    answer:
      'Visit your Wallet page and click "Add Money". Enter your desired amount (minimum ₹100), select UPI, Card, or Net Banking, and complete the instant verification. Funds are credited instantly to your beauty wallet.',
  },
  {
    id: 'faq-6',
    category: 'payments',
    question: 'What should I do if my payment fails?',
    answer:
      'If money was deducted from your bank but your wallet or booking did not update, banks typically reverse the amount within 24–48 hours. You can also raise a support ticket below with your transaction reference for immediate assistance.',
  },
  {
    id: 'faq-7',
    category: 'home-services',
    question: 'How can I track my home service order?',
    answer:
      'Go to "My Orders" or "Doorstep Services" from your menu. Once our beauty specialist is assigned, you will see real-time updates: Executive Assigned, On the Way, and Arrived at your location.',
  },
  {
    id: 'faq-8',
    category: 'account',
    question: 'How can I update my profile & beauty preferences?',
    answer:
      'Open your Profile tab. You can update your contact information, delivery address, skin type, hair texture, and sensitivity preferences to help our specialists personalize your salon sessions.',
  },
  {
    id: 'faq-9',
    category: 'general',
    question: 'How do I contact the salon directly?',
    answer:
      'You can call our front desk at +91 98765 43210 or email satgurumakeupart@gmail.com during salon hours (9:00 AM – 8:00 PM, all days). You can also submit a query ticket anytime.',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Topics', icon: HelpCircle, color: '#D81B60' },
  { id: 'appointments', label: 'Appointments & Rescheduling', icon: Calendar, color: '#D81B60' },
  { id: 'services', label: 'Services & Pricing', icon: Sparkles, color: '#174D3A' },
  { id: 'payments', label: 'Payments & Wallet', icon: Wallet, color: '#D4AF70' },
  { id: 'rewards', label: 'Rewards & Membership', icon: Gift, color: '#43152E' },
  { id: 'home-services', label: 'Home Service Orders', icon: Home, color: '#174D3A' },
  { id: 'account', label: 'Account & Profile', icon: User, color: '#D81B60' },
];

export function HelpSupport() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFaq, setExpandedFaq] = useState<string | null>('faq-1');

  // Support Form State
  const [name, setName] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [issueCategory, setIssueCategory] = useState('Appointments & Rescheduling');
  const [relatedBookingId, setRelatedBookingId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attachedBookingContext, setAttachedBookingContext] = useState<AttachedBookingInfo | null>(null);

  // Check router location state for prefilling from booking
  useEffect(() => {
    if (location.state) {
      const state = location.state as any;
      if (state.serviceName || state.bookingId || state.orderId || state.booking) {
        const info: AttachedBookingInfo = {
          booking_id: state.bookingId || state.booking?.id,
          order_id: state.orderId || state.order?.id,
          type: state.type || (state.order ? 'doorstep_order' : 'salon_booking'),
          service_name: state.serviceName || state.booking?.service || 'Salon Service',
          service_date: state.serviceDate || state.booking?.preferred_date,
          service_time: state.serviceTime || state.booking?.preferred_time,
          current_status: state.currentStatus || state.booking?.status || 'confirmed',
          stylist_name: state.stylistName || state.booking?.stylist_name,
          stylist_phone: state.stylistPhone || state.booking?.stylist_phone,
          customer_address: state.customerAddress || state.order?.address,
          total_amount: state.totalAmount || state.order?.total,
        };
        setAttachedBookingContext(info);

        if (state.bookingId) setRelatedBookingId(state.bookingId);
        if (state.serviceName) {
          const refShort = (state.bookingId || state.orderId || '').slice(0, 8);
          setSubject(`Assistance regarding ${state.serviceName}${refShort ? ` (#${refShort})` : ''}`);
          setMessage(
            `Hello Satguru Support Team,\n\nI need assistance regarding my booking for "${state.serviceName}" scheduled on ${state.serviceDate || 'recent date'}${state.serviceTime ? ` at ${state.serviceTime}` : ''}.\n\nBooking ID: #${state.bookingId || state.orderId || 'N/A'}\nStatus: ${state.currentStatus || 'Confirmed'}\nAssigned Specialist: ${state.stylistName || 'Salon Assigned'}\n\nPlease help me with: `
          );
        }

        if (state.type === 'mehndi_order' || state.type === 'doorstep_order') {
          setIssueCategory('Home Service Orders');
        } else {
          setIssueCategory('Appointments & Rescheduling');
        }

        // Auto scroll to submit form
        setTimeout(() => {
          const el = document.getElementById('submit-ticket');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);

        toast({
          title: 'Booking Details Pre-filled ✨',
          description: `Loaded details for "${state.serviceName || 'your booking'}". Review and submit your ticket below.`,
        });
      }
    }
  }, [location.state]);

  // User's bookings for dropdown
  const [userBookings, setUserBookings] = useState<Booking[]>([]);

  // User's tickets
  const [myTickets, setMyTickets] = useState<QueryTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<QueryTicket | null>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  // Month filtering helpers
  const getMonthKey = (dateStrOrNum?: string | number) => {
    if (!dateStrOrNum) return '';
    const d = new Date(dateStrOrNum);
    if (isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const formatMonthLabel = (monthKey: string) => {
    if (!monthKey || monthKey === 'all') return 'All Months';
    const parts = monthKey.split('-');
    if (parts.length < 2) return monthKey;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const d = new Date(year, month, 1);
    return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  };

  const formatMonthFullLabel = (monthKey: string) => {
    if (!monthKey || monthKey === 'all') return 'All Months';
    const parts = monthKey.split('-');
    if (parts.length < 2) return monthKey;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const d = new Date(year, month, 1);
    return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  // Month filter state: defaults to current month (e.g. 2026-10)
  const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);

  // Derive available months from ticket history and current calendar
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    const curKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    set.add(curKey);

    // Add previous 3 months
    const now = new Date();
    for (let i = 1; i <= 3; i++) {
      const prev = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
      set.add(k);
    }

    // Add any months found in tickets
    myTickets.forEach((t) => {
      const k = getMonthKey(t.created_at || (t as any).createdAt);
      if (k) set.add(k);
    });

    return Array.from(set).sort().reverse();
  }, [myTickets]);

  // Filtered tickets - NOT showing all at once, applied month filter first
  const filteredTickets = useMemo(() => {
    if (selectedMonth === 'all') return myTickets;
    return myTickets.filter((t) => {
      const k = getMonthKey(t.created_at || (t as any).createdAt);
      return k === selectedMonth;
    });
  }, [myTickets, selectedMonth]);

  useEffect(() => {
    loadUserTickets();
    if (user?.id) {
      loadUserBookings();
    }
  }, [user]);

  const loadUserTickets = () => {
    const tickets = queryTicketService.getUserTickets(user?.id, user?.email);
    setMyTickets(tickets);
  };

  const loadUserBookings = async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setUserBookings(data);
    } catch (err) {
      console.error('Error fetching bookings for support:', err);
    }
  };

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
    // Find the first FAQ of this category and expand it
    if (catId !== 'all') {
      const match = FAQ_LIST.find((f) => f.category === catId);
      if (match) setExpandedFaq(match.id);
    }
  };

  const filteredFaqs = FAQ_LIST.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: 'Please enter your name', variant: 'destructive' });
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast({ title: 'Please enter a valid email address', variant: 'destructive' });
      return;
    }
    if (!subject.trim()) {
      toast({ title: 'Please enter a subject', variant: 'destructive' });
      return;
    }
    if (!message.trim()) {
      toast({ title: 'Please enter your message', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      let attachedBookingInfo: AttachedBookingInfo | undefined = attachedBookingContext || undefined;
      if (!attachedBookingInfo && relatedBookingId) {
        const found = userBookings.find((b) => b.id === relatedBookingId);
        if (found) {
          attachedBookingInfo = {
            booking_id: found.id,
            service_name: found.service,
            service_date: found.preferred_date,
            service_time: found.preferred_time,
            type: 'salon_booking' as const,
            current_status: found.status,
          };
        }
      }

      const newTicket = await queryTicketService.createTicket({
        user_id: user?.id || `guest-${Date.now()}`,
        customer_name: name.trim(),
        customer_email: email.trim(),
        customer_phone: user?.phone,
        category: (issueCategory as any) || 'General Support',
        subject: `[${issueCategory}] ${subject.trim()}`,
        description: message.trim(),
        priority: 'normal',
        booking_info: attachedBookingInfo,
      });

      toast({
        title: 'Thanks for Contacting Us! ✨',
        description: `Your ticket ${newTicket.ticket_number} has been created. We will provide a solution as soon as possible (estimated: within 2 to 4 hours)!`,
      });

      setSubject('');
      setMessage('');
      setRelatedBookingId('');
      setAttachedBookingContext(null);
      loadUserTickets();

      // Scroll smoothly to My Tickets section so user sees their new ticket
      setTimeout(() => {
        const tktEl = document.getElementById('my-tickets');
        if (tktEl) tktEl.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (err: any) {
      toast({
        title: 'Submission Failed',
        description: err.message || 'Could not submit your request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F3] text-foreground font-sans">
      {/* ── TOP BREADCRUMB & BACK TO DASHBOARD ── */}
      <header className="border-b border-[#F8DCE4] bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#F8DCE4]/60 text-[#43152E] hover:bg-[#F8DCE4] transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <Link to="/" className="hover:text-primary">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link to="/profile" className="hover:text-primary">Dashboard</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="font-semibold text-[#43152E]">Help & Support</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Direct jump to Past Tickets */}
            <a
              href="#my-tickets"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#FDF0F4] border border-[#F8DCE4] text-[#D81B60] hover:bg-[#F8DCE4] transition-colors shadow-2xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#D81B60]" />
              <span>Past Tickets ({myTickets.length})</span>
            </a>
            <span className="text-xs text-muted-foreground hidden md:inline">Salon Desk Hours: 9 AM - 8 PM</span>
            <a
              href="tel:+919876543210"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-[#D4AF70] text-[#9A7736] hover:bg-[#D4AF70]/10 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" /> Call Salon
            </a>
          </div>
        </div>
      </header>

      {/* ── HERO BANNER & SEARCH ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F8DCE4]/40 via-[#FFF9F3] to-[#FFF9F3] pt-10 pb-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#F8DCE4] shadow-xs text-xs font-semibold text-[#D81B60]">
            <Sparkles className="w-3.5 h-3.5" /> Dedicated Customer Care & Assistance Desk
          </div>
          <h1 className="font-serif italic text-4xl sm:text-5xl font-normal text-[#43152E] tracking-tight">
            Help & Support Desk
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Review your past tickets below, explore our knowledge base, or raise a ticket for appointments and orders completed within the last 15 days.
          </p>

          {/* Search Box */}
          <div className="pt-2 max-w-xl mx-auto">
            <div className="relative">
              <Search className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search help articles, bookings, payments, rewards..."
                className="w-full pl-12 pr-4 h-13 rounded-full bg-white border-[#F8DCE4] text-foreground text-sm shadow-sm focus:ring-2 focus:ring-[#D81B60]/30 focus:border-[#D81B60]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-12">
        {/* ── 1. MY PAST TICKETS & SUPPORT (PROMINENT AT TOP WITH MONTH FILTER) ── */}
        <section id="my-tickets" className="scroll-mt-24 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F8DCE4]">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-serif italic text-2xl sm:text-3xl text-[#43152E]">
                  My Past Tickets & Support
                </h2>
                <Badge className="bg-[#FDF0F4] text-[#D81B60] border-[#F8DCE4] text-xs font-bold">
                  {filteredTickets.length} {selectedMonth === 'all' ? 'Total' : `in ${formatMonthLabel(selectedMonth)}`}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Filtered by month. Select a month below to view your query history and resolver replies.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={loadUserTickets}
                className="text-xs rounded-full border-[#F8DCE4] hover:bg-[#F8DCE4]/40"
              >
                Refresh
              </Button>
              <a
                href="#submit-ticket"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-[#43152E] hover:bg-[#320f22] text-white transition-colors shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" /> Raise New Ticket
              </a>
            </div>
          </div>

          {/* Month Filter Selector Bar */}
          <div className="bg-white/90 backdrop-blur-sm border border-[#F8DCE4] rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#F8DCE4] text-[#D81B60] flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#43152E]">Month Filter</span>
                  <span className="text-[11px] text-muted-foreground">
                    • Showing {filteredTickets.length} of {myTickets.length} tickets
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground hidden sm:block">
                  Only tickets for the selected month are shown. Select a month below or choose "All Months".
                </p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {availableMonths.map((mKey) => {
                const count = myTickets.filter(
                  (t) => getMonthKey(t.created_at || (t as any).createdAt) === mKey
                ).length;
                const isActive = selectedMonth === mKey;
                return (
                  <button
                    key={mKey}
                    type="button"
                    onClick={() => setSelectedMonth(mKey)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#D81B60] text-white shadow-xs ring-2 ring-[#D81B60]/30'
                        : 'bg-[#FFF9F3] text-[#43152E] border border-[#F8DCE4] hover:border-[#D81B60]/40 hover:bg-white'
                    }`}
                  >
                    <span>{formatMonthLabel(mKey)}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                        isActive ? 'bg-white/25 text-white' : 'bg-[#F8DCE4] text-[#D81B60]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}

              {/* All Months Option */}
              <button
                type="button"
                onClick={() => setSelectedMonth('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  selectedMonth === 'all'
                    ? 'bg-[#43152E] text-white shadow-xs ring-2 ring-[#43152E]/30'
                    : 'bg-[#FFF9F3] text-muted-foreground border border-[#F8DCE4] hover:text-[#43152E] hover:bg-white'
                }`}
              >
                <span>All Months</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                    selectedMonth === 'all' ? 'bg-white/25 text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {myTickets.length}
                </span>
              </button>
            </div>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="bg-white border border-[#F8DCE4] rounded-3xl p-8 sm:p-10 text-center shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#FDF0F4] border border-[#F8DCE4] text-[#D81B60] flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#43152E]">
                {myTickets.length === 0
                  ? 'No past support tickets found'
                  : `No tickets found for ${formatMonthFullLabel(selectedMonth)}`}
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-5">
                {myTickets.length === 0
                  ? 'Appointments or orders scheduled within the last 15 days can have a dedicated ticket raised for resolver assistance.'
                  : `You have ${myTickets.length} ticket(s) in other months. Switch month or view All Months to see them.`}
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {myTickets.length > 0 && selectedMonth !== 'all' && (
                  <Button
                    size="sm"
                    onClick={() => setSelectedMonth('all')}
                    className="bg-[#D81B60] text-white hover:bg-[#b0134d] text-xs rounded-full px-4"
                  >
                    View All Months ({myTickets.length})
                  </Button>
                )}
                <a
                  href="#submit-ticket"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#43152E] text-white text-xs font-semibold shadow-xs hover:bg-[#320f22] transition-colors"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Support Request
                </a>
                <button
                  onClick={() => navigate('/profile')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#F8DCE4] text-[#43152E] text-xs font-semibold hover:bg-[#F8DCE4]/30 transition-colors"
                >
                  View Bookings & Orders (15d Window)
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTickets.map((ticket) => {
                const isResolved = ticket.status === 'resolved' || ticket.status === 'closed';
                const statusBadgeStyle = isResolved
                  ? 'bg-[#DCE8D7] text-[#174D3A] border-[#C5D8BF]'
                  : ticket.status === 'in_progress'
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : 'bg-amber-100 text-amber-800 border-amber-200';

                return (
                  <div
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setTicketModalOpen(true);
                    }}
                    className="bg-white border border-[#F8DCE4] rounded-3xl p-5 sm:p-6 hover:border-[#D81B60]/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#D81B60] bg-[#FDF0F4] px-2.5 py-1 rounded-full border border-[#F8DCE4]">
                            {ticket.ticket_number || (ticket as any).ticketNumber}
                          </span>
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                            {ticket.category}
                          </span>
                        </div>
                        <Badge className={`${statusBadgeStyle} text-[10px] font-bold uppercase tracking-wider`}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-[#43152E] line-clamp-1 group-hover:text-[#D81B60] transition-colors">
                          {ticket.subject}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {ticket.description}
                        </p>
                      </div>

                      {/* Attached Booking Info if present */}
                      {(ticket.booking_info || (ticket as any).attachedBooking) && (() => {
                        const bInfo = ticket.booking_info || (ticket as any).attachedBooking;
                        return (
                          <div className="p-2.5 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4]/60 flex items-center justify-between text-[11px]">
                            <span className="font-medium text-foreground flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-[#D4AF70]" />
                              {bInfo.service_name || bInfo.service || 'Salon Service'}
                            </span>
                            <span className="text-muted-foreground">
                              {bInfo.service_date || bInfo.date || 'Within 15 days'}
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F8DCE4]/60 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {new Date(ticket.created_at || (ticket as any).createdAt || Date.now()).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="font-bold text-[#D81B60] group-hover:underline flex items-center gap-1">
                        View Updates ({ticket.messages?.length || 1}) →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── 2. HELP CATEGORIES ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif italic text-2xl text-[#43152E]">Browse Help Topics</h2>
            <span className="text-xs text-muted-foreground">Select a category to filter answers</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {CATEGORIES.map(({ id, label, icon: Icon, color }) => {
              const isActive = selectedCategory === id;
              return (
                <button
                  key={id}
                  onClick={() => handleCategoryClick(id)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group ${
                    isActive
                      ? 'bg-white border-[#D81B60] shadow-md ring-2 ring-[#D81B60]/20'
                      : 'bg-white/90 border-[#F8DCE4]/80 hover:border-[#D81B60]/50 hover:shadow-xs'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: isActive ? color : '#F8DCE4',
                      color: isActive ? '#FFFFFF' : color,
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs font-semibold leading-tight ${
                      isActive ? 'text-[#D81B60]' : 'text-foreground'
                    }`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── SPLIT VIEW: FREQUENTLY ASKED QUESTIONS & CONTACT CHANNELS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* FAQ Accordion (7 cols) */}
          <section className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif italic text-2xl text-[#43152E]">Frequently Asked Questions</h2>
              <span className="text-xs text-muted-foreground">{filteredFaqs.length} answers available</span>
            </div>

            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white border border-[#F8DCE4]">
                <HelpCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">No questions found matching your search</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try typing different keywords or submit a query directly using the form below.
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-4 bg-[#43152E] text-white hover:bg-[#320f22]"
                >
                  Reset Filter
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFaqs.map((faq) => {
                  const isOpen = expandedFaq === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="bg-white border border-[#F8DCE4]/80 rounded-2xl overflow-hidden transition-all shadow-xs hover:border-[#D81B60]/40"
                    >
                      <button
                        onClick={() => setExpandedFaq(isOpen ? null : faq.id)}
                        className="w-full px-5 py-4 flex items-center justify-between text-left gap-4"
                      >
                        <span className="text-sm font-semibold text-[#43152E]">{faq.question}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-[#D81B60]' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-[#F8DCE4]/40 bg-[#FFF9F3]/40">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Quick Contact Options (5 cols) */}
          <section className="lg:col-span-5 space-y-4">
            <h2 className="font-serif italic text-2xl text-[#43152E]">Contact Channels</h2>
            <div className="space-y-3">
              {/* Call Us */}
              <div className="bg-white border border-[#F8DCE4] rounded-2xl p-4 flex items-start gap-4 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#DCE8D7] text-[#174D3A] flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-foreground">Call Salon Desk</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Direct line for bookings & emergency support</p>
                  <a
                    href="tel:+919876543210"
                    className="inline-block mt-2 text-xs font-semibold text-[#174D3A] hover:underline"
                  >
                    +91 98765 43210
                  </a>
                </div>
              </div>

              {/* Email Us */}
              <div className="bg-white border border-[#F8DCE4] rounded-2xl p-4 flex items-start gap-4 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#F8DCE4] text-[#D81B60] flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-foreground">Email Customer Care</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Expect response within 2–4 hours</p>
                  <a
                    href="mailto:satgurumakeupart@gmail.com"
                    className="inline-block mt-2 text-xs font-semibold text-[#D81B60] hover:underline"
                  >
                    satgurumakeupart@gmail.com
                  </a>
                </div>
              </div>

              {/* Query Desk Note */}
              <div className="bg-gradient-to-br from-[#FFF9F3] to-[#F8DCE4]/50 border border-[#D4AF70] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-[#9A7736]" />
                  <span className="text-xs font-bold text-[#9A7736] uppercase tracking-wider">
                    Official Guarantee
                  </span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  Every support ticket raised in the portal is assigned a unique tracking ID and verified by our dedicated customer resolution executives.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* ── SUPPORT REQUEST FORM ── */}
        <section id="submit-ticket" className="scroll-mt-24 bg-white border border-[#F8DCE4] rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="max-w-2xl mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D81B60]">
              Query Resolution Desk
            </span>
            <h2 className="font-serif italic text-3xl text-[#43152E] mt-1">Submit a Support Request</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Have a problem with a booking, payment, or home service order? Fill out the details below and our resolver workstation will assist you.
            </p>
          </div>

          {/* 15-Day Window Notice */}
          <div className="p-3.5 rounded-2xl bg-[#FFF9F3] border border-[#F8DCE4] text-xs text-[#43152E] flex items-center gap-2.5 mb-5 shadow-2xs">
            <Clock className="w-4 h-4 text-[#D81B60] flex-shrink-0" />
            <span>
              <strong>15-Day Support Window:</strong> Tickets for specific appointments or doorstep orders can be raised within 15 days of booking or completion. General assistance questions are welcomed anytime.
            </span>
          </div>

          {/* Linked Booking Banner */}
          {attachedBookingContext && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFF5F8] to-[#FFF0E8] border border-[#F8DCE4] mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#D81B60]/10 text-[#D81B60] shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#D81B60]">
                      Booking Details Linked Automatically
                    </span>
                    <Badge className="bg-[#43152E] text-white text-[10px] py-0">
                      {attachedBookingContext.type?.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-sm text-[#43152E] mt-0.5">
                    {attachedBookingContext.service_name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {attachedBookingContext.service_date && `Date: ${attachedBookingContext.service_date} • `}
                    {attachedBookingContext.service_time && `Time: ${attachedBookingContext.service_time} • `}
                    Ref ID: #{attachedBookingContext.booking_id || attachedBookingContext.order_id || 'N/A'}
                    {attachedBookingContext.stylist_name && ` • Specialist: ${attachedBookingContext.stylist_name}`}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAttachedBookingContext(null);
                  setRelatedBookingId('');
                  toast({ title: 'Detached booking reference' });
                }}
                className="text-xs text-muted-foreground hover:text-foreground shrink-0 gap-1 h-8 rounded-full"
              >
                <X className="w-3.5 h-3.5" /> Detach
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Your Full Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Charv Raj"
                  required
                  className="rounded-xl border-[#F8DCE4]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Email Address *</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. charv@example.com"
                  required
                  className="rounded-xl border-[#F8DCE4]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Issue Category *</label>
                <select
                  value={issueCategory}
                  onChange={(e) => setIssueCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#F8DCE4] bg-white text-xs font-medium text-foreground focus:outline-hidden focus:ring-2 focus:ring-[#D81B60]/20"
                >
                  <option value="Appointments & Rescheduling">Appointments & Rescheduling</option>
                  <option value="Services & Pricing">Services & Pricing</option>
                  <option value="Payments & Wallet">Payments & Wallet</option>
                  <option value="Rewards & Membership">Rewards & Membership</option>
                  <option value="Home Service Orders">Home Service Orders</option>
                  <option value="Account & Profile">Account & Profile</option>
                  <option value="Other Assistance">Other Assistance</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Related Booking / Service (Within 15 Days)
                </label>
                <select
                  value={relatedBookingId}
                  onChange={(e) => setRelatedBookingId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#F8DCE4] bg-white text-xs font-medium text-foreground focus:outline-hidden focus:ring-2 focus:ring-[#D81B60]/20"
                >
                  <option value="">None / General Inquiry</option>
                  {userBookings.map((b) => {
                    const bookingDate = new Date(b.preferred_date || b.created_at).getTime();
                    const diffDays = (Date.now() - bookingDate) / (1000 * 60 * 60 * 24);
                    const isEligible = diffDays <= 15;
                    return (
                      <option key={b.id} value={b.id} disabled={!isEligible}>
                        {b.service} ({new Date(b.preferred_date).toLocaleDateString()} • {b.preferred_time}) {isEligible ? '— Eligible (<15d)' : '— Expired (>15d)'}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Subject *</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your query"
                required
                className="rounded-xl border-[#F8DCE4]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Detailed Message *</label>
              <Textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe what happened, any reference numbers, or what assistance you need..."
                required
                className="rounded-xl border-[#F8DCE4]"
              />
            </div>

            <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                A tracking ticket will be generated immediately upon submission.
              </p>

              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#43152E] hover:bg-[#320f22] text-white px-6 rounded-full text-xs font-semibold gap-2 shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Submit Support Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </section>

        {/* Quick Link back to Top Past Tickets */}
        {myTickets.length > 0 && (
          <div className="p-4 rounded-2xl bg-white border border-[#F8DCE4] flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#D81B60]" />
              You have {myTickets.length} past support ticket{myTickets.length > 1 ? 's' : ''} tracked on your account.
            </span>
            <a
              href="#my-tickets"
              className="font-semibold text-[#D81B60] hover:underline"
            >
              ↑ Back to Past Tickets
            </a>
          </div>
        )}
      </main>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <UserTicketDetailsModal
          open={ticketModalOpen}
          onOpenChange={(open) => {
            setTicketModalOpen(open);
            if (!open) loadUserTickets();
          }}
          ticket={selectedTicket}
          onTicketUpdated={(updated) => {
            setSelectedTicket(updated);
            loadUserTickets();
          }}
        />
      )}
    </div>
  );
}
