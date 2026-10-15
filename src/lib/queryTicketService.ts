import { supabase } from '@/lib/supabase';

export type TicketCategory =
  | 'Stylist Delay / Not Arrived'
  | 'Service Quality Concern'
  | 'Reschedule Request'
  | 'Cancellation & Refund'
  | 'Billing / Overcharged'
  | 'Stylist Conduct / Hygiene'
  | 'Product Allergy / Issue'
  | 'Special Pre-Bridal Request'
  | 'General Support';

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface TicketMessage {
  id: string;
  sender_type: 'user' | 'resolver' | 'admin' | 'system';
  sender_name: string;
  sender_id?: string;
  message: string;
  attachments?: string[];
  created_at: string;
}

export interface AttachedBookingInfo {
  booking_id?: string;
  order_id?: string;
  type: 'salon_booking' | 'doorstep_order' | 'mehndi_order' | 'general';
  service_name: string;
  service_date?: string;
  service_time?: string;
  total_amount?: number;
  current_status?: string;
  stylist_name?: string;
  stylist_phone?: string;
  customer_address?: string;
}

export interface QueryTicket {
  id: string;
  ticket_number: string; // e.g. TKT-2026-78421
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  category: TicketCategory;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  booking_info?: AttachedBookingInfo;
  assigned_resolver_id?: string;
  assigned_resolver_name?: string;
  assigned_resolver_email?: string;
  resolution_notes?: string;
  messages: TicketMessage[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface QueryResolver {
  id: string;
  name: string;
  email: string; // assigned by admin
  password: string; // assigned by admin
  phone: string;
  department: string;
  is_active: boolean;
  total_resolved: number;
  created_at: string;
}

const STORAGE_KEYS = {
  TICKETS: 'satguru_query_tickets_v1',
  RESOLVERS: 'satguru_query_resolvers_v1',
  RESOLVER_SESSION: 'satguru_resolver_session_v1',
};

// Seed initial default resolvers so admin and resolvers can test immediately
const DEFAULT_RESOLVERS: QueryResolver[] = [
  {
    id: 'res-default-1',
    name: 'Pooja Sharma',
    email: 'resolver@satgurumakeup.com',
    password: 'Resolver@123',
    phone: '+91 98765 43210',
    department: 'Salon & Bridal Bookings',
    is_active: true,
    total_resolved: 18,
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 'res-default-2',
    name: 'Rahul Verma',
    email: 'support@satgurumakeup.com',
    password: 'Support@123',
    phone: '+91 98111 22334',
    department: 'Doorstep & Mehndi Orders',
    is_active: true,
    total_resolved: 12,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

const DEFAULT_TICKETS: QueryTicket[] = [
  {
    id: 'ticket-seed-1',
    ticket_number: 'TKT-2026-92814',
    user_id: 'admin-super-user',
    customer_name: 'Charv Raj',
    customer_email: 'charvraj2006@gmail.com',
    customer_phone: '+91 98765 43210',
    category: 'Reschedule Request',
    subject: 'Skin Renewal Facial - Appointment Timing Confirmation',
    description: 'Can you please confirm the specialist assignment and timings for my Skin Renewal Facial?',
    priority: 'normal',
    status: 'resolved',
    booking_info: {
      booking_id: 'booking-seed-1',
      service_name: 'Skin Renewal Facial',
      service_date: 'Sun, 27 Sept',
      service_time: '14:40:00',
      type: 'salon_booking',
      current_status: 'confirmed',
      stylist_name: 'Pooja Sharma',
    },
    assigned_resolver_id: 'res-default-1',
    assigned_resolver_name: 'Pooja Sharma',
    assigned_resolver_email: 'resolver@satgurumakeup.com',
    resolution_notes: 'Confirmed specialist Meera for 2:40 PM slot. Client notified.',
    created_at: new Date(Date.now() - 86400000 * 18).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 17).toISOString(),
    resolved_at: new Date(Date.now() - 86400000 * 17).toISOString(),
    messages: [
      {
        id: 'msg-seed-1',
        sender_type: 'user',
        sender_name: 'Charv Raj',
        sender_id: 'admin-super-user',
        message: 'Can you please confirm the specialist assignment and timings for my Skin Renewal Facial?',
        created_at: new Date(Date.now() - 86400000 * 18).toISOString(),
      },
      {
        id: 'msg-seed-2',
        sender_type: 'resolver',
        sender_name: 'Pooja Sharma (Help Desk)',
        sender_id: 'res-default-1',
        message: 'Hello Charv! Senior aesthetician Meera has been assigned for your Skin Renewal Facial. She will have the herbal spa suite prepared 10 minutes ahead of time.',
        created_at: new Date(Date.now() - 86400000 * 17).toISOString(),
      },
    ],
  },
  {
    id: 'ticket-seed-2',
    ticket_number: 'TKT-2026-71402',
    user_id: 'admin-super-user',
    customer_name: 'Charv Raj',
    customer_email: 'charvraj2006@gmail.com',
    customer_phone: '+91 98765 43210',
    category: 'Special Pre-Bridal Request',
    subject: 'Doorstep Organic Mehndi - Artist Arrival Schedule',
    description: 'We need the herbal mehndi specialist to arrive with fresh organic cones for 4 family members.',
    priority: 'high',
    status: 'in_progress',
    booking_info: {
      order_id: 'ORD-2026-8819',
      service_name: 'Bridal & Family Herbal Mehndi',
      service_date: 'Fri, 23 Oct',
      service_time: '11:00 AM',
      type: 'mehndi_order',
      current_status: 'confirmed',
      stylist_name: 'Rahul Verma',
    },
    assigned_resolver_id: 'res-default-2',
    assigned_resolver_name: 'Rahul Verma',
    assigned_resolver_email: 'support@satgurumakeup.com',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date().toISOString(),
    messages: [
      {
        id: 'msg-seed-3',
        sender_type: 'user',
        sender_name: 'Charv Raj',
        sender_id: 'admin-super-user',
        message: 'We need the herbal mehndi specialist to arrive with fresh organic cones for 4 family members.',
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      {
        id: 'msg-seed-4',
        sender_type: 'resolver',
        sender_name: 'Rahul Verma (Help Desk)',
        sender_id: 'res-default-2',
        message: 'Namaste Charv! Noted. Two senior mehndi specialists will arrive with freshly prepared organic herbal henna cones 15 minutes prior to the 11:00 AM slot.',
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'ticket-seed-3',
    ticket_number: 'TKT-2026-63910',
    user_id: 'admin-super-user',
    customer_name: 'Charv Raj',
    customer_email: 'charvraj2006@gmail.com',
    customer_phone: '+91 98765 43210',
    category: 'Billing / Overcharged',
    subject: 'Pre-Bridal Luxury Package - GST Invoice Request',
    description: 'Could you please send over the official GST invoice receipt for our pre-bridal consultation booking?',
    priority: 'low',
    status: 'closed',
    booking_info: {
      booking_id: 'booking-seed-3',
      service_name: 'Luxury Pre-Bridal Consultation',
      service_date: 'Mon, 18 Aug',
      service_time: '12:00 PM',
      type: 'salon_booking',
      current_status: 'completed',
      stylist_name: 'Pooja Sharma',
    },
    assigned_resolver_id: 'res-default-1',
    assigned_resolver_name: 'Pooja Sharma',
    assigned_resolver_email: 'resolver@satgurumakeup.com',
    resolution_notes: 'GST invoice generated and emailed to charvraj2006@gmail.com.',
    created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 44).toISOString(),
    resolved_at: new Date(Date.now() - 86400000 * 44).toISOString(),
    messages: [
      {
        id: 'msg-seed-5',
        sender_type: 'user',
        sender_name: 'Charv Raj',
        sender_id: 'admin-super-user',
        message: 'Could you please send over the official GST invoice receipt for our pre-bridal consultation booking?',
        created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
      },
      {
        id: 'msg-seed-6',
        sender_type: 'resolver',
        sender_name: 'Pooja Sharma (Help Desk)',
        sender_id: 'res-default-1',
        message: 'Namaste Charv! The signed GST invoice has been forwarded to your registered email address. Have a wonderful day!',
        created_at: new Date(Date.now() - 86400000 * 44).toISOString(),
      },
    ],
  },
];

class QueryTicketService {
  private static instance: QueryTicketService;

  private constructor() {
    this.initStorage();
  }

  static getInstance(): QueryTicketService {
    if (!QueryTicketService.instance) {
      QueryTicketService.instance = new QueryTicketService();
    }
    return QueryTicketService.instance;
  }

  private initStorage() {
    if (typeof window === 'undefined') return;
    try {
      const existingResolvers = localStorage.getItem(STORAGE_KEYS.RESOLVERS);
      if (!existingResolvers) {
        localStorage.setItem(STORAGE_KEYS.RESOLVERS, JSON.stringify(DEFAULT_RESOLVERS));
      }
      const existingTickets = localStorage.getItem(STORAGE_KEYS.TICKETS);
      if (!existingTickets || existingTickets === '[]' || JSON.parse(existingTickets).length === 0) {
        localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(DEFAULT_TICKETS));
      } else {
        try {
          const parsed: QueryTicket[] = JSON.parse(existingTickets);
          let changed = false;
          for (const dt of DEFAULT_TICKETS) {
            const idx = parsed.findIndex((p) => p.id === dt.id);
            if (idx === -1) {
              parsed.push(dt);
              changed = true;
            } else if (parsed[idx].created_at !== dt.created_at) {
              parsed[idx] = { ...parsed[idx], created_at: dt.created_at };
              changed = true;
            }
          }
          if (changed) {
            localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(parsed));
          }
        } catch {
          localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(DEFAULT_TICKETS));
        }
      }
    } catch (e) {
      console.warn('LocalStorage error in QueryTicketService init:', e);
    }
  }

  private emitEvent(eventName: string, data?: any) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
      // Also notify through cross-tab storage trigger
      localStorage.setItem('satguru_tickets_last_sync', Date.now().toString());
    }
  }

  // --- RESOLVER METHODS ---

  getResolvers(): QueryResolver[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RESOLVERS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to get resolvers:', e);
    }
    return [...DEFAULT_RESOLVERS];
  }

  addResolver(resolver: Omit<QueryResolver, 'id' | 'created_at' | 'total_resolved'>): QueryResolver {
    const resolvers = this.getResolvers();
    
    // Check if email already assigned
    const normalizedEmail = resolver.email.toLowerCase().trim();
    if (resolvers.some(r => r.email.toLowerCase().trim() === normalizedEmail)) {
      throw new Error(`A resolver with email "${resolver.email}" already exists.`);
    }

    const newResolver: QueryResolver = {
      ...resolver,
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: normalizedEmail,
      total_resolved: 0,
      created_at: new Date().toISOString(),
    };

    const updated = [newResolver, ...resolvers];
    localStorage.setItem(STORAGE_KEYS.RESOLVERS, JSON.stringify(updated));
    this.emitEvent('satguru:resolvers_updated', updated);
    return newResolver;
  }

  updateResolver(id: string, updates: Partial<QueryResolver>): QueryResolver {
    const resolvers = this.getResolvers();
    const index = resolvers.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Resolver not found.');
    }

    const updatedResolver = { ...resolvers[index], ...updates };
    resolvers[index] = updatedResolver;
    localStorage.setItem(STORAGE_KEYS.RESOLVERS, JSON.stringify(resolvers));
    this.emitEvent('satguru:resolvers_updated', resolvers);
    return updatedResolver;
  }

  deleteResolver(id: string): void {
    const resolvers = this.getResolvers().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.RESOLVERS, JSON.stringify(resolvers));
    this.emitEvent('satguru:resolvers_updated', resolvers);
  }

  authenticateResolver(email: string, password: string): QueryResolver | null {
    const resolvers = this.getResolvers();
    const normalizedEmail = email.toLowerCase().trim();
    const found = resolvers.find(
      r => r.email.toLowerCase().trim() === normalizedEmail && r.password === password
    );

    if (!found) return null;
    if (!found.is_active) {
      throw new Error('This Query Resolver account is deactivated by admin. Contact management.');
    }

    // Set session in sessionStorage & localStorage
    sessionStorage.setItem(STORAGE_KEYS.RESOLVER_SESSION, JSON.stringify(found));
    return found;
  }

  getCurrentResolver(): QueryResolver | null {
    try {
      const session = sessionStorage.getItem(STORAGE_KEYS.RESOLVER_SESSION);
      if (session) {
        return JSON.parse(session);
      }
    } catch {
      return null;
    }
    return null;
  }

  logoutResolver(): void {
    sessionStorage.removeItem(STORAGE_KEYS.RESOLVER_SESSION);
  }

  // --- TICKET METHODS ---

  private generateTicketNumber(): string {
    const year = new Date().getFullYear();
    const rand = Math.floor(10000 + Math.random() * 90000);
    return `TKT-${year}-${rand}`;
  }

  getAllTickets(): QueryTicket[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TICKETS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to get tickets:', e);
    }
    return [];
  }

  /**
   * Fetch all tickets with two-way sync: merges localStorage cache with Supabase support_tickets table
   */
  async fetchAllTickets(): Promise<QueryTicket[]> {
    const local = this.getAllTickets();
    try {
      const { data: dbTickets, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && dbTickets && dbTickets.length > 0) {
        let hasNew = false;
        const merged = [...local];

        for (const d of dbTickets) {
          // Extract ticket number from subject if present, e.g. [TKT-2026-12345] or generate deterministic
          const tktNumMatch = d.subject?.match(/\[(TKT-[\w-]+)\]/);
          const ticketNumber = tktNumMatch
            ? tktNumMatch[1]
            : `TKT-${new Date(d.created_at || Date.now()).getFullYear()}-${String(d.id || '').slice(0, 5).toUpperCase()}`;

          const existingIdx = merged.findIndex(
            (t) => t.id === d.id || t.ticket_number === ticketNumber || (d.id && t.id.includes(d.id))
          );

          if (existingIdx === -1) {
            const cleanSubject = d.subject?.replace(/\[TKT-[\w-]+\]\s*/, '') || 'Customer Support Request';
            const newMergedTicket: QueryTicket = {
              id: d.id,
              ticket_number: ticketNumber,
              user_id: d.user_id || 'guest',
              customer_name: d.requester_name || d.user_email?.split('@')[0] || 'Customer',
              customer_email: d.user_email || 'customer@satgurumakeup.com',
              customer_phone: d.phone,
              category: (d.category as TicketCategory) || 'General Support',
              subject: cleanSubject,
              description: d.message || cleanSubject,
              priority: (d.priority as TicketPriority) || 'normal',
              status: (d.status as TicketStatus) || 'open',
              resolution_notes: d.resolution_notes,
              created_at: d.created_at || new Date().toISOString(),
              updated_at: d.updated_at || d.created_at || new Date().toISOString(),
              messages: [
                {
                  id: `msg-db-${d.id}`,
                  sender_type: 'user',
                  sender_name: d.requester_name || 'Customer',
                  sender_id: d.user_id,
                  message: d.message || cleanSubject,
                  created_at: d.created_at || new Date().toISOString(),
                },
                {
                  id: `msg-ack-${d.id}`,
                  sender_type: 'system',
                  sender_name: 'Satguru Support Desk',
                  message: `✨ Thank you for contacting Satguru Makeup Art! We have received your query regarding "${cleanSubject}". Our dedicated Query Resolver has been assigned to your case and will provide a solution as soon as possible (estimated resolution: within 2 to 4 hours during salon hours 9:00 AM – 8:00 PM).`,
                  created_at: new Date(new Date(d.created_at || Date.now()).getTime() + 1000).toISOString(),
                },
              ],
            };
            merged.unshift(newMergedTicket);
            hasNew = true;
          } else {
            // Update status if updated in database
            if (d.status && merged[existingIdx].status !== d.status) {
              merged[existingIdx].status = d.status as TicketStatus;
              hasNew = true;
            }
          }
        }

        if (hasNew) {
          localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(merged));
          this.emitEvent('satguru:tickets_updated', merged);
          return merged;
        }
      }
    } catch (err) {
      console.warn('Supabase support_tickets sync error:', err);
    }
    return local;
  }

  getUserTickets(userId?: string, userEmail?: string): QueryTicket[] {
    const all = this.getAllTickets();
    if (!userId && !userEmail) return all;
    const lowerEmail = userEmail ? userEmail.toLowerCase() : '';
    return all.filter(
      (t) =>
        (userId && t.user_id === userId) ||
        (lowerEmail && t.customer_email?.toLowerCase() === lowerEmail) ||
        t.user_id === 'admin-super-user' ||
        t.customer_email?.toLowerCase() === 'charvraj2006@gmail.com'
    );
  }

  getTicketById(ticketIdOrNumber: string): QueryTicket | null {
    const all = this.getAllTickets();
    return all.find(t => t.id === ticketIdOrNumber || t.ticket_number === ticketIdOrNumber) || null;
  }

  async createTicket(params: {
    user_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    category: TicketCategory;
    subject: string;
    description: string;
    priority?: TicketPriority;
    booking_info?: AttachedBookingInfo;
  }): Promise<QueryTicket> {
    const ticketNumber = this.generateTicketNumber();
    const serviceOrTopic = params.booking_info?.service_name || params.subject;

    // Initial message from user
    const initialMessage: TicketMessage = {
      id: `msg-${Date.now()}-1`,
      sender_type: 'user',
      sender_name: params.customer_name || 'Client',
      sender_id: params.user_id,
      message: params.description,
      created_at: new Date().toISOString(),
    };

    // Automated acknowledgment message with expected resolution time range
    const ackMessage: TicketMessage = {
      id: `msg-${Date.now()}-ack`,
      sender_type: 'system',
      sender_name: 'Satguru Support Desk',
      message: `✨ Thank you for contacting Satguru Makeup Art! We have received your query regarding "${serviceOrTopic}". Our dedicated Query Resolver has been assigned to your case and will provide a solution as soon as possible (estimated resolution: within 2 to 4 hours during salon hours 9:00 AM – 8:00 PM). If urgent, call our front desk directly at +91 98765 43210.`,
      created_at: new Date(Date.now() + 500).toISOString(),
    };

    const newTicket: QueryTicket = {
      id: `ticket-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ticket_number: ticketNumber,
      user_id: params.user_id,
      customer_name: params.customer_name,
      customer_email: params.customer_email,
      customer_phone: params.customer_phone,
      category: params.category,
      subject: params.subject,
      description: params.description,
      priority: params.priority || 'normal',
      status: 'open',
      booking_info: params.booking_info,
      messages: [initialMessage, ackMessage],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Auto-assign to an active resolver in matching department if available
    const resolvers = this.getResolvers().filter(r => r.is_active);
    if (resolvers.length > 0) {
      // Pick matching department or first available resolver
      const matched = resolvers.find(r => 
        (params.booking_info?.type?.includes('order') && r.department.toLowerCase().includes('order')) ||
        (params.booking_info?.type === 'salon_booking' && r.department.toLowerCase().includes('salon'))
      ) || resolvers[0];

      if (matched) {
        newTicket.assigned_resolver_id = matched.id;
        newTicket.assigned_resolver_name = matched.name;
        newTicket.assigned_resolver_email = matched.email;
      }
    }

    // Persist locally
    const tickets = this.getAllTickets();
    const updatedTickets = [newTicket, ...tickets];
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(updatedTickets));

    // Try to sync to Supabase support_tickets for backend compatibility
    try {
      await supabase.from('support_tickets').insert({
        user_id: params.user_id,
        subject: `[${ticketNumber}] ${params.subject}`,
        message: params.description,
        requester_type: 'user',
        status: 'open',
        priority: params.priority || 'normal',
      });

      // Notification for user
      await supabase.from('notifications').insert({
        user_id: params.user_id,
        title: `🎫 Ticket Generated #${ticketNumber}`,
        message: `Thank you for contacting us! We have received your query regarding "${serviceOrTopic}". Our Query Resolver will provide a solution as soon as possible (estimated: within 2 to 4 hours).`,
        type: 'info',
        link: '/help-support#my-tickets',
      });
    } catch (e) {
      console.warn('Supabase sync skipped/failed for query ticket:', e);
    }

    this.emitEvent('satguru:tickets_updated', updatedTickets);
    return newTicket;
  }

  async addMessage(
    ticketId: string,
    message: {
      sender_type: 'user' | 'resolver' | 'admin' | 'system';
      sender_name: string;
      sender_id?: string;
      message: string;
      attachments?: string[];
    }
  ): Promise<QueryTicket> {
    const tickets = this.getAllTickets();
    const index = tickets.findIndex(t => t.id === ticketId || t.ticket_number === ticketId);
    if (index === -1) {
      throw new Error('Ticket not found.');
    }

    const ticket = tickets[index];
    const newMessage: TicketMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...message,
      created_at: new Date().toISOString(),
    };

    let nextStatus = ticket.status;
    if (message.sender_type === 'resolver' || message.sender_type === 'admin') {
      if (ticket.status === 'open') {
        nextStatus = 'in_progress';
      }
    } else if (message.sender_type === 'user' && ticket.status === 'resolved') {
      // User replied to a resolved ticket - re-open
      nextStatus = 'in_progress';
    }

    const updatedTicket: QueryTicket = {
      ...ticket,
      status: nextStatus,
      messages: [...ticket.messages, newMessage],
      updated_at: new Date().toISOString(),
    };

    tickets[index] = updatedTicket;
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));

    // Optional notification to user if resolver replied
    if (message.sender_type === 'resolver' || message.sender_type === 'admin') {
      try {
        await supabase.from('notifications').insert({
          user_id: ticket.user_id,
          title: `💬 New Reply on Ticket #${ticket.ticket_number}`,
          message: `${message.sender_name}: "${message.message.slice(0, 60)}..."`,
          type: 'info',
          link: '/profile',
        });
      } catch (e) {
        console.warn('Notification sync skipped:', e);
      }
    }

    this.emitEvent('satguru:tickets_updated', tickets);
    return updatedTicket;
  }

  updateTicketStatus(
    ticketId: string,
    status: TicketStatus,
    resolutionNotes?: string,
    resolverId?: string,
    resolverName?: string
  ): QueryTicket {
    const tickets = this.getAllTickets();
    const index = tickets.findIndex(t => t.id === ticketId || t.ticket_number === ticketId);
    if (index === -1) throw new Error('Ticket not found.');

    const ticket = tickets[index];
    const updatedTicket: QueryTicket = {
      ...ticket,
      status,
      resolution_notes: resolutionNotes !== undefined ? resolutionNotes : ticket.resolution_notes,
      resolved_at: status === 'resolved' || status === 'closed' ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    };

    if (resolverId && resolverName) {
      updatedTicket.assigned_resolver_id = resolverId;
      updatedTicket.assigned_resolver_name = resolverName;
    }

    // Add automated system log message in thread
    const systemMsg: TicketMessage = {
      id: `sys-${Date.now()}`,
      sender_type: 'system',
      sender_name: 'Satguru Support System',
      message: `Status updated to ${status.toUpperCase().replace('_', ' ')}${
        resolutionNotes ? `: "${resolutionNotes}"` : ''
      }`,
      created_at: new Date().toISOString(),
    };
    updatedTicket.messages.push(systemMsg);

    tickets[index] = updatedTicket;
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));

    // Update resolver counter if resolved
    if (status === 'resolved' && updatedTicket.assigned_resolver_id) {
      const resolvers = this.getResolvers();
      const rIdx = resolvers.findIndex(r => r.id === updatedTicket.assigned_resolver_id);
      if (rIdx !== -1) {
        resolvers[rIdx].total_resolved = (resolvers[rIdx].total_resolved || 0) + 1;
        localStorage.setItem(STORAGE_KEYS.RESOLVERS, JSON.stringify(resolvers));
        this.emitEvent('satguru:resolvers_updated', resolvers);
      }
    }

    this.emitEvent('satguru:tickets_updated', tickets);
    return updatedTicket;
  }

  assignTicket(ticketId: string, resolverId: string, resolverName: string, resolverEmail?: string): QueryTicket {
    const tickets = this.getAllTickets();
    const index = tickets.findIndex(t => t.id === ticketId || t.ticket_number === ticketId);
    if (index === -1) throw new Error('Ticket not found.');

    const ticket = tickets[index];
    const updatedTicket: QueryTicket = {
      ...ticket,
      assigned_resolver_id: resolverId,
      assigned_resolver_name: resolverName,
      assigned_resolver_email: resolverEmail,
      status: ticket.status === 'open' ? 'in_progress' : ticket.status,
      updated_at: new Date().toISOString(),
      messages: [
        ...ticket.messages,
        {
          id: `sys-assign-${Date.now()}`,
          sender_type: 'system',
          sender_name: 'Support System',
          message: `Ticket assigned to Query Resolver: ${resolverName}`,
          created_at: new Date().toISOString(),
        },
      ],
    };

    tickets[index] = updatedTicket;
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    this.emitEvent('satguru:tickets_updated', tickets);
    return updatedTicket;
  }

  addInternalNote(ticketId: string, note: string, authorName: string, authorId?: string): QueryTicket {
    const tickets = this.getAllTickets();
    const index = tickets.findIndex(t => t.id === ticketId || t.ticket_number === ticketId);
    if (index === -1) throw new Error('Ticket not found.');

    const ticket = tickets[index];
    const internalMsg: TicketMessage = {
      id: `note-${Date.now()}`,
      sender_type: 'system',
      sender_name: `🔒 Internal Note (${authorName})`,
      sender_id: authorId,
      message: `[INTERNAL PRIVATE NOTE] ${note.trim()}`,
      created_at: new Date().toISOString(),
    };

    const updatedTicket: QueryTicket = {
      ...ticket,
      messages: [...ticket.messages, internalMsg],
      updated_at: new Date().toISOString(),
    };

    tickets[index] = updatedTicket;
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    this.emitEvent('satguru:tickets_updated', tickets);
    return updatedTicket;
  }
}

export const queryTicketService = QueryTicketService.getInstance();
