import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, Image, CheckCheck, Clock, Phone, User, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';

interface ChatProps {
  orderId: string;
  orderType: 'booking' | 'doorstep' | 'mehndi';
  executiveName?: string;
  executiveId?: string;
  onClose: () => void;
}

interface Message {
  id: string;
  sender_id: string;
  sender_type: string;
  content: string;
  message_type: string;
  read_status: boolean;
  created_at: string;
}

export function Chat({ orderId, orderType, executiveName, executiveId, onClose }: ChatProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadMessages();
    pollRef.current = setInterval(loadMessages, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [orderId]);

  useEffect(() => {
    if (!minimized) scrollToBottom();
  }, [messages, minimized]);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const loadMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
    if (data) {
      setMessages(data);
      const unreadCount = data.filter(m => m.sender_type !== 'user' && !m.read_status).length;
      setUnread(unreadCount);
      // Mark messages as read
      if (unreadCount > 0 && user) {
        await supabase.from('messages')
          .update({ read_status: true })
          .eq('order_id', orderId)
          .eq('receiver_id', user.id)
          .eq('read_status', false);
      }
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !user) return;
    setSending(true);
    const msgContent = newMsg.trim();
    setNewMsg('');

    await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: executiveId || 'admin',
      sender_type: 'user',
      order_id: orderId,
      order_type: orderType,
      content: msgContent,
      message_type: 'text',
      read_status: false,
    });

    // Insert notification for stylist
    if (executiveId) {
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: '💬 New message',
        message: `Customer sent: ${msgContent.slice(0, 60)}`,
        type: 'chat',
        link: `/member-dashboard`,
      });
    }

    await loadMessages();
    setSending(false);
    inputRef.current?.focus();
  };

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Group messages by date
  const groupedMessages: { date: string; msgs: Message[] }[] = [];
  messages.forEach(msg => {
    const date = formatDate(msg.created_at);
    const last = groupedMessages[groupedMessages.length - 1];
    if (!last || last.date !== date) groupedMessages.push({ date, msgs: [msg] });
    else last.msgs.push(msg);
  });

  if (minimized) {
    return (
      <div
        className="fixed bottom-24 right-5 z-50 cursor-pointer"
        onClick={() => { setMinimized(false); setUnread(0); }}
      >
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #be185d)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <MessageSquare className="w-5 h-5 text-white" />
          <span className="text-white font-semibold text-sm">{executiveName || 'Chat'}</span>
          {unread > 0 && (
            <span className="w-5 h-5 bg-red-400 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unread}
            </span>
          )}
          <Maximize2 className="w-4 h-4 text-white/70" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-24 right-5 z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden"
      style={{
        width: '340px',
        height: '480px',
        background: '#0f0a1e',
        border: '1px solid rgba(124,58,237,0.4)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.6), rgba(190,24,93,0.4))', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: 'rgba(255,255,255,0.15)' }}>
            👩‍🎨
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{executiveName || 'Beauty Expert'}</p>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <p className="text-white/50 text-xs">Active now</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMinimized(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1" style={{ scrollbarWidth: 'none' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <MessageSquare className="w-12 h-12 text-white/15 mb-3" />
            <p className="text-white/40 text-sm">No messages yet</p>
            <p className="text-white/25 text-xs mt-1">Say hello to your beauty expert! 👋</p>
          </div>
        ) : (
          groupedMessages.map(group => (
            <div key={group.date}>
              {/* Date divider */}
              <div className="flex items-center gap-2 my-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-white/30 text-xs px-2">{group.date}</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              {group.msgs.map(msg => {
                const isMe = msg.sender_type === 'user';
                return (
                  <div key={msg.id} className={`flex mb-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm mr-2 mt-auto flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                        👩‍🎨
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${isMe ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                      style={isMe
                        ? { background: 'linear-gradient(135deg, #be185d, #ec4899)', color: 'white' }
                        : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)' }
                      }
                    >
                      <p>{msg.content}</p>
                      <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <span className={`text-[10px] ${isMe ? 'text-white/60' : 'text-white/30'}`}>
                          {formatTime(msg.created_at)}
                        </span>
                        {isMe && (
                          <CheckCheck className={`w-3 h-3 ${msg.read_status ? 'text-blue-300' : 'text-white/40'}`} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <input
          ref={inputRef}
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 h-9 px-3 rounded-xl text-white placeholder:text-white/25 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/50"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
        <button
          onClick={sendMessage}
          disabled={sending || !newMsg.trim()}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #be185d)' }}
        >
          {sending ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
        </button>
      </div>
    </div>
  );
}
