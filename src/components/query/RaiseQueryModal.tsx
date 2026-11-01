import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  HelpCircle,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  Copy,
  Sparkles,
  Phone,
  Mail,
  User,
  ShieldAlert,
  ArrowRight,
  Package,
  Layers,
  ChevronRight,
  CreditCard,
  Receipt,
  ShieldCheck,
  Crown,
} from 'lucide-react';
import {
  queryTicketService,
  TicketCategory,
  TicketPriority,
  AttachedBookingInfo,
  QueryTicket,
} from '@/lib/queryTicketService';
import { useToast } from '@/hooks/use-toast';

interface RaiseQueryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingInfo?: AttachedBookingInfo | null;
  availableBookings?: AttachedBookingInfo[];
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  onTicketCreated?: (ticket: QueryTicket) => void;
}

const CATEGORIES: { label: TicketCategory; icon: any; desc: string }[] = [
  {
    label: 'Stylist Delay / Not Arrived',
    icon: Clock,
    desc: 'Stylist is late or has not reached the location yet',
  },
  {
    label: 'Service Quality Concern',
    icon: Sparkles,
    desc: 'Service did not meet expectations or product issue',
  },
  {
    label: 'Reschedule Request',
    icon: Calendar,
    desc: 'Need urgent slot or date adjustment for your appointment',
  },
  {
    label: 'Cancellation & Refund',
    icon: CreditCard,
    desc: 'Cancel booking or request refund back to wallet/bank',
  },
  {
    label: 'Billing / Overcharged',
    icon: Receipt,
    desc: 'Discrepancy in billing, invoice, or online payment',
  },
  {
    label: 'Stylist Conduct / Hygiene',
    icon: ShieldCheck,
    desc: 'Safety, cleanliness, or professional conduct feedback',
  },
  {
    label: 'Special Pre-Bridal Request',
    icon: Crown,
    desc: 'Special trial, shade customization, or wedding group instructions',
  },
  {
    label: 'General Support',
    icon: MessageSquare,
    desc: 'Any other question or assistance needed from our team',
  },
];

export function RaiseQueryModal({
  open,
  onOpenChange,
  bookingInfo: initialBookingInfo,
  availableBookings = [],
  userId,
  userName,
  userEmail,
  userPhone = '',
  onTicketCreated,
}: RaiseQueryModalProps) {
  const { toast } = useToast();
  const [selectedBooking, setSelectedBooking] = useState<AttachedBookingInfo | null>(
    initialBookingInfo || null
  );
  const [category, setCategory] = useState<TicketCategory>('Stylist Delay / Not Arrived');
  const [priority, setPriority] = useState<TicketPriority>('normal');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState(userPhone);
  const [loading, setLoading] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<QueryTicket | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialBookingInfo) {
      setSelectedBooking(initialBookingInfo);
    } else if (availableBookings.length > 0 && !selectedBooking) {
      setSelectedBooking(availableBookings[0]);
    }
  }, [initialBookingInfo, availableBookings]);

  // Update default subject when category or service changes
  useEffect(() => {
    if (!createdTicket) {
      const serviceName = selectedBooking?.service_name || 'My Service';
      setSubject(`Assistance regarding ${serviceName} - ${category}`);
    }
  }, [category, selectedBooking, createdTicket]);

  const handleReset = () => {
    setCreatedTicket(null);
    setDescription('');
    setCopied(false);
  };

  const handleCopyTicket = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    toast({ title: 'Copied to clipboard', description: num });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast({
        title: 'Please describe the problem',
        description: 'Provide details so our Query Resolver can help you quickly.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const ticket = await queryTicketService.createTicket({
        user_id: userId,
        customer_name: userName || 'Customer',
        customer_email: userEmail,
        customer_phone: phone,
        category,
        subject: subject.trim() || `Assistance request for ${selectedBooking?.service_name || 'Booking'}`,
        description: description.trim(),
        priority,
        booking_info: selectedBooking || undefined,
      });

      setCreatedTicket(ticket);
      toast({
        title: 'Ticket Generated Successfully!',
        description: `Ticket Number: ${ticket.ticket_number}`,
      });

      if (onTicketCreated) {
        onTicketCreated(ticket);
      }
    } catch (err: any) {
      toast({
        title: 'Could not create ticket',
        description: err.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleReset();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-border bg-card">
        {createdTicket ? (
          /* Success Screen */
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-emerald-100 text-emerald-600 animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Ticket Registered & Dispatched
              </span>
              <h2 className="text-2xl font-bold mt-2 font-display text-foreground">
                Your Query Ticket is Live!
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Our specialized Query Resolver has been assigned to your case and is reviewing your
                booking details.
              </p>
            </div>

            {/* Ticket ID Box */}
            <div className="p-5 rounded-2xl bg-secondary/50 border border-border/80 max-w-md mx-auto relative group">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Ticket Tracking Number
              </p>
              <div className="flex items-center justify-center gap-3 mt-1.5">
                <span className="font-mono text-2xl font-extrabold text-primary tracking-wide">
                  {createdTicket.ticket_number}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyTicket(createdTicket.ticket_number)}
                  className="h-8 px-2.5 text-xs gap-1 border-primary/30 hover:bg-primary/10"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                Save this ticket number for direct reference with our support team or chat.
              </p>
            </div>

            {/* Context Summary */}
            {createdTicket.booking_info && (
              <div className="text-left bg-primary/5 rounded-xl p-4 border border-primary/15 max-w-md mx-auto text-xs space-y-1">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Linked Booking: {createdTicket.booking_info.service_name}
                </p>
                {createdTicket.booking_info.service_date && (
                  <p className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    Slot: {createdTicket.booking_info.service_date} at{' '}
                    {createdTicket.booking_info.service_time || 'N/A'}
                  </p>
                )}
                {createdTicket.assigned_resolver_name && (
                  <p className="text-primary font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Assigned Resolver: {createdTicket.assigned_resolver_name}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-center pt-2">
              <Button
                onClick={() => {
                  onOpenChange(false);
                  handleReset();
                }}
                className="btn-primary min-w-[160px]"
              >
                View in My Queries <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        ) : (
          /* Creation Form */
          <div>
            <div className="p-6 pb-4 border-b border-border bg-gradient-to-r from-primary/5 via-rose-50/20 to-transparent">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <DialogTitle className="text-xl font-bold font-display">
                    Raise Query / Get Help
                  </DialogTitle>
                </div>
                <DialogDescription className="text-xs text-muted-foreground">
                  Connect directly with our dedicated Query Resolvers. We prioritize booking queries
                  for instant resolution.
                </DialogDescription>
              </DialogHeader>

              {/* Top Booking Information Box (Prompt Requirement) */}
              {selectedBooking && (
                <div className="mt-4 p-4 rounded-2xl bg-background border border-primary/20 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold"
                        >
                          {selectedBooking.type === 'salon_booking'
                            ? 'Salon Booking'
                            : selectedBooking.type === 'doorstep_order'
                            ? 'Doorstep Service'
                            : 'Order'}
                        </Badge>
                        {selectedBooking.booking_id && (
                          <span className="text-[11px] font-mono text-muted-foreground">
                            ID: {selectedBooking.booking_id.slice(0, 12)}
                          </span>
                        )}
                        {selectedBooking.order_id && (
                          <span className="text-[11px] font-mono text-muted-foreground">
                            #{selectedBooking.order_id}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-base text-foreground capitalize">
                        {selectedBooking.service_name.replace('-', ' ')}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                        {selectedBooking.service_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            {selectedBooking.service_date}
                          </span>
                        )}
                        {selectedBooking.service_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            {selectedBooking.service_time}
                          </span>
                        )}
                        {selectedBooking.total_amount && (
                          <span className="font-semibold text-foreground">
                            ₹{selectedBooking.total_amount}
                          </span>
                        )}
                        {selectedBooking.stylist_name && (
                          <span className="flex items-center gap-1 text-primary">
                            <User className="w-3.5 h-3.5" />
                            Stylist: {selectedBooking.stylist_name}
                          </span>
                        )}
                      </div>
                    </div>

                    {availableBookings.length > 1 && (
                      <select
                        className="text-xs border border-border rounded-lg px-2 py-1 bg-secondary text-foreground focus:outline-none"
                        value={
                          selectedBooking.booking_id || selectedBooking.order_id || ''
                        }
                        onChange={(e) => {
                          const found = availableBookings.find(
                            (b) =>
                              (b.booking_id && b.booking_id === e.target.value) ||
                              (b.order_id && b.order_id === e.target.value)
                          );
                          if (found) setSelectedBooking(found);
                        }}
                      >
                        {availableBookings.map((b, idx) => (
                          <option
                            key={b.booking_id || b.order_id || idx}
                            value={b.booking_id || b.order_id}
                          >
                            Switch: {b.service_name} ({b.service_date || 'Booking'})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Category Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  1. What problem are you facing? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => {
                    const CatIcon = cat.icon;
                    return (
                      <button
                        type="button"
                        key={cat.label}
                        onClick={() => setCategory(cat.label)}
                        className={`text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                          category === cat.label
                            ? 'border-primary bg-primary/10 shadow-sm font-medium'
                            : 'border-border hover:bg-secondary/60 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <CatIcon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold truncate ${category === cat.label ? 'text-primary' : 'text-foreground'}`}>
                            {cat.label}
                          </p>
                          <p className="text-[10px] text-muted-foreground leading-tight line-clamp-1 mt-0.5">
                            {cat.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  2. Priority Level
                </label>
                <div className="flex gap-2">
                  {(
                    [
                      { key: 'normal', label: 'Normal', desc: 'Standard query' },
                      { key: 'high', label: 'High', desc: 'Appointment today' },
                      { key: 'urgent', label: 'Urgent', desc: 'Immediate attention' },
                    ] as const
                  ).map((p) => (
                    <button
                      type="button"
                      key={p.key}
                      onClick={() => setPriority(p.key)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium transition-all text-center ${
                        priority === p.key
                          ? p.key === 'urgent'
                            ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                            : 'bg-primary text-white border-primary shadow-sm'
                          : 'border-border hover:bg-secondary text-muted-foreground'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of the issue..."
                  className="w-full h-10 px-3.5 rounded-xl border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Detailed Problem Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what occurred, any specific changes needed, stylist interaction, timing, or how you would like us to resolve this..."
                  className="w-full p-3.5 rounded-xl border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
                <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-500" /> Tip: The more details you provide, the faster our Query Resolver can assist
                  you.
                </p>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Contact Phone (for callbacks)
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full h-9 pl-9 pr-3 rounded-xl border border-border text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      disabled
                      value={userEmail}
                      className="w-full h-9 pl-9 pr-3 rounded-xl border border-border text-xs bg-muted/50 text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="text-xs h-10 px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="btn-primary text-xs h-10 px-6 gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating Ticket...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate Ticket & Submit
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
