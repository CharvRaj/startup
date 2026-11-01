import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  QueryTicket,
  queryTicketService,
  TicketStatus,
} from '@/lib/queryTicketService';
import {
  MessageSquare,
  Clock,
  Calendar,
  User,
  Send,
  CheckCircle,
  Copy,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Zap,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserTicketDetailsModalProps {
  ticket: QueryTicket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTicketUpdated?: (updated: QueryTicket) => void;
}

export function UserTicketDetailsModal({
  ticket,
  open,
  onOpenChange,
  onTicketUpdated,
}: UserTicketDetailsModalProps) {
  const { toast } = useToast();
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!ticket) return null;

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" /> Open / In Queue
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs flex items-center gap-1">
            <Zap className="w-3 h-3" /> In Progress with Resolver
          </Badge>
        );
      case 'resolved':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </Badge>
        );
      case 'closed':
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-300 text-xs flex items-center gap-1">
            <Lock className="w-3 h-3" /> Closed
          </Badge>
        );
    }
  };

  const handleCopy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    toast({ title: 'Copied Ticket ID' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmitting(true);
    try {
      const updated = await queryTicketService.addMessage(ticket.id, {
        sender_type: 'user',
        sender_name: ticket.customer_name || 'Client',
        sender_id: ticket.user_id,
        message: replyText.trim(),
      });

      setReplyText('');
      toast({ title: 'Message sent to Resolver' });
      if (onTicketUpdated) onTicketUpdated(updated);
    } catch (err: any) {
      toast({ title: 'Error sending message', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkResolved = async () => {
    try {
      const updated = queryTicketService.updateTicketStatus(
        ticket.id,
        'resolved',
        'Marked as resolved by customer'
      );
      toast({ title: 'Ticket marked as resolved. Thank you!' });
      if (onTicketUpdated) onTicketUpdated(updated);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-card border-border">
        {/* Header */}
        <div className="p-5 border-b border-border bg-gradient-to-r from-primary/5 via-rose-50/20 to-transparent">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <button
                  onClick={() => handleCopy(ticket.ticket_number)}
                  className="font-mono text-sm font-bold text-primary px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 flex items-center gap-1.5 transition-colors"
                  title="Click to copy ticket number"
                >
                  #{ticket.ticket_number}
                  <Copy className="w-3 h-3 text-muted-foreground" />
                </button>
                {getStatusBadge(ticket.status)}
                {ticket.priority === 'urgent' && (
                  <Badge className="bg-rose-500 text-white text-[10px]">Urgent</Badge>
                )}
              </div>
              <h3 className="font-bold text-lg text-foreground">{ticket.subject}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Category: <span className="font-medium text-foreground">{ticket.category}</span> •
                Created {new Date(ticket.created_at).toLocaleString('en-IN')}
              </p>
            </div>

            {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleMarkResolved}
                className="text-xs h-8 text-emerald-700 border-emerald-300 hover:bg-emerald-50 gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Mark Resolved
              </Button>
            )}
          </div>

          {/* Attached Booking Snapshot */}
          {ticket.booking_info && (
            <div className="mt-3 p-3 rounded-xl bg-background border border-primary/15 text-xs flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                <div>
                  <span className="font-semibold text-foreground">
                    {ticket.booking_info.service_name}
                  </span>
                  {ticket.booking_info.service_date && (
                    <span className="text-muted-foreground ml-2">
                      ({ticket.booking_info.service_date}
                      {ticket.booking_info.service_time ? ` at ${ticket.booking_info.service_time}` : ''})
                    </span>
                  )}
                </div>
              </div>
              {ticket.assigned_resolver_name && (
                <div className="flex items-center gap-1.5 text-primary text-[11px] font-medium bg-primary/10 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3 h-3" />
                  Resolver: {ticket.assigned_resolver_name}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Conversation Thread */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[50vh] bg-secondary/20">
          {ticket.messages.map((msg) => {
            const isUser = msg.sender_type === 'user';
            const isSystem = msg.sender_type === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center my-2">
                  <span className="text-[11px] px-3 py-1 rounded-full bg-muted/80 text-muted-foreground inline-block border border-border/50">
                    ℹ️ {msg.message} • {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    {!isUser && <Sparkles className="w-3 h-3 text-primary" />}
                    {isUser ? 'You' : `${msg.sender_name} (Resolver)`}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(msg.created_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] text-xs shadow-sm ${
                    isUser
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-card border border-border text-foreground rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                </div>
              </div>
            );
          })}

          {ticket.status === 'open' && ticket.messages.length === 1 && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 animate-pulse" />
              <span>
                Your ticket has been dispatched. Our query resolver will review and reply here shortly.
              </span>
            </div>
          )}
        </div>

        {/* Reply composer */}
        {ticket.status !== 'closed' ? (
          <form
            onSubmit={handleSendReply}
            className="p-3.5 border-t border-border bg-card flex items-center gap-2"
          >
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your response or add extra details..."
              className="flex-1 h-10 px-4 rounded-xl border border-border text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <Button
              type="submit"
              disabled={submitting || !replyText.trim()}
              className="btn-primary h-10 px-4 text-xs gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </Button>
          </form>
        ) : (
          <div className="p-3 text-center text-xs text-muted-foreground bg-muted/40 border-t border-border">
            This ticket is closed. If you need new assistance, please raise a new query.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
