import { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Loader2, Heart, Calendar, ShoppingBag, TrendingUp, ListTodo, MessageCircle, Star, CheckCircle, Plus, Trash2, Clock, Gift, Zap, Bot, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import { FunctionsHttpError } from '@supabase/supabase-js';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  due_date?: string;
  priority?: string;
}

type Panel = 'chat' | 'todos' | 'quick';

export function FloatingAssistant() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [addingTodo, setAddingTodo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && isOpen) fetchTodos();
  }, [user, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchTodos = async () => {
    if (!user) return;
    try {
      const { data } = await supabase.from('user_todos').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setTodos(data || []);
    } catch (e) { console.error('todos:', e); }
  };

  const addTodo = async () => {
    if (!newTodo.trim() || !user) return;
    setAddingTodo(true);
    try {
      await supabase.from('user_todos').insert({ user_id: user.id, title: newTodo.trim(), priority: 'medium' });
      setNewTodo('');
      await fetchTodos();
    } finally { setAddingTodo(false); }
  };

  const toggleTodo = async (id: string, done: boolean) => {
    await supabase.from('user_todos').update({ completed: done, completed_at: done ? new Date().toISOString() : null }).eq('id', id);
    fetchTodos();
  };

  const deleteTodo = async (id: string) => {
    await supabase.from('user_todos').delete().eq('id', id);
    fetchTodos();
  };

  const sendMessage = async (text?: string) => {
    const userMessage = (text || input).trim();
    if (!userMessage || loading || !user) return;
    setInput('');
    setPanel('chat');
    const newMsg: Message = { role: 'user', content: userMessage, timestamp: new Date() };
    setMessages(prev => [...prev, newMsg]);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-beauty-assistant', {
        body: { userId: user.id, message: userMessage, context: messages.slice(-6) },
      });

      if (error) {
        let errorMessage = error.message;
        if (error instanceof FunctionsHttpError) {
          try { const t = await error.context?.text(); errorMessage = t || error.message; } catch {}
        }
        throw new Error(errorMessage);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response, timestamp: new Date() }]);
      fetchTodos();
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Try asking me about our services, bookings, or beauty tips!", timestamp: new Date() }]);
    } finally { setLoading(false); }
  };

  const quickActions = [
    { label: 'Book Appointment', icon: Calendar, color: 'from-rose-500 to-pink-500', message: 'I want to book an appointment' },
    { label: 'Recommend Services', icon: Sparkles, color: 'from-violet-500 to-purple-500', message: 'What services do you recommend for me?' },
    { label: 'My Orders', icon: ShoppingBag, color: 'from-blue-500 to-cyan-500', message: 'Show me my recent orders and bookings' },
    { label: 'Create Todo List', icon: ListTodo, color: 'from-emerald-500 to-teal-500', message: 'Help me create a monthly beauty care routine todo list' },
    { label: 'Skincare Tips', icon: Heart, color: 'from-pink-500 to-rose-500', message: 'Give me a personalized skincare routine' },
    { label: 'Spending Report', icon: TrendingUp, color: 'from-amber-500 to-orange-500', message: 'Give me insights on my beauty spending' },
    { label: 'Today Coupon', icon: Gift, color: 'from-fuchsia-500 to-pink-500', message: "What's today's special coupon or discount?" },
    { label: 'Bridal Package', icon: Star, color: 'from-yellow-500 to-amber-500', message: 'Tell me about the bridal packages and prices' },
  ];

  if (!user) return null;

  const pendingTodos = todos.filter(t => !t.completed).length;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-24 z-50 w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 transition-all group"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #be185d, #ec4899)' }}>
          <Bot className="w-7 h-7 text-white" />
          {pendingTodos > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-400 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
              {pendingTodos}
            </span>
          )}
          <span className="absolute inset-0 rounded-2xl animate-ping opacity-30"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #be185d)' }} />
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-xs px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl backdrop-blur-sm flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Sia AI Assistant
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-1.5rem)] h-[600px] max-h-[calc(100vh-100px)] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-in"
          style={{ background: 'linear-gradient(145deg, #0f0a1e, #1a0826)', border: '1px solid rgba(255,255,255,0.1)' }}>

          {/* Header */}
          <div className="flex-shrink-0 p-4 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #be185d, #ec4899)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Sia — Beauty Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-xs text-white/80">Online • AI Powered</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPanel('quick')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all ${panel === 'quick' ? 'bg-white/30' : 'hover:bg-white/20'}`}>
                <Zap className="w-4 h-4" />
              </button>
              <button onClick={() => setPanel('todos')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all relative ${panel === 'todos' ? 'bg-white/30' : 'hover:bg-white/20'}`}>
                <ListTodo className="w-4 h-4" />
                {pendingTodos > 0 && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 text-white text-[9px] rounded-full flex items-center justify-center font-bold">{pendingTodos}</span>}
              </button>
              <button onClick={() => setPanel('chat')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all ${panel === 'chat' ? 'bg-white/30' : 'hover:bg-white/20'}`}>
                <MessageCircle className="w-4 h-4" />
              </button>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-all ml-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Actions Panel */}
          {panel === 'quick' && (
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2.5">
                {quickActions.map((action, i) => (
                  <button key={i} onClick={() => sendMessage(action.message)}
                    className="group p-3.5 rounded-2xl text-left transition-all hover:scale-105 hover:-translate-y-0.5 active:scale-95"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs font-semibold text-white/90 leading-tight">{action.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Todo Panel */}
          {panel === 'todos' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-white font-bold text-sm flex-1">Beauty Todo List</h3>
                <span className="text-white/40 text-xs">{todos.filter(t=>t.completed).length}/{todos.length} done</span>
              </div>
              {/* Add todo */}
              <div className="flex gap-2">
                <Input value={newTodo} onChange={e => setNewTodo(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTodo()}
                  placeholder="Add new beauty task..." className="h-9 text-sm bg-white/10 border-white/15 text-white placeholder:text-white/30 flex-1" />
                <Button onClick={addTodo} disabled={addingTodo || !newTodo.trim()} size="sm"
                  className="h-9 px-3 bg-gradient-to-r from-violet-500 to-purple-500 border-0">
                  {addingTodo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </Button>
              </div>
              {todos.length === 0 ? (
                <div className="text-center py-8">
                  <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-20 text-white" />
                  <p className="text-white/40 text-sm">No tasks yet</p>
                  <p className="text-white/25 text-xs mt-1">Ask Sia to create a routine!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todos.map(todo => (
                    <div key={todo.id} className="group flex items-start gap-2.5 p-3 rounded-xl transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <button onClick={() => toggleTodo(todo.id, !todo.completed)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${todo.completed ? 'border-emerald-400 bg-emerald-400' : 'border-white/30 hover:border-violet-400'}`}>
                        {todo.completed && <CheckCircle className="w-3 h-3 text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-tight ${todo.completed ? 'line-through text-white/30' : 'text-white/90'}`}>{todo.title}</p>
                        {todo.due_date && (
                          <p className="text-xs text-white/30 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />{new Date(todo.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <button onClick={() => deleteTodo(todo.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5 text-white/40 hover:text-red-400 transition-colors" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chat Panel */}
          {panel === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                {messages.length === 0 && (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-float"
                      style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(190,24,93,0.3))', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-bold text-white text-base mb-1">Hi {user.username}!</h4>
                    <p className="text-white/50 text-xs leading-relaxed px-4 mb-4">
                      I'm Sia, your AI beauty assistant. Ask me anything about our services, bookings, beauty tips, or orders!
                    </p>
                    <button onClick={() => setPanel('quick')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/70 transition-all hover:text-white"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <Zap className="w-4 h-4" /> See Quick Actions
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${
                      msg.role === 'user'
                        ? 'rounded-br-md text-white text-sm'
                        : 'rounded-bl-md text-white/90 text-sm'
                    }`}
                      style={{
                        background: msg.role === 'user'
                          ? 'linear-gradient(135deg, #7c3aed, #be185d)'
                          : 'rgba(255,255,255,0.08)',
                        border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.08)' : 'none'
                      }}>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      {msg.timestamp && (
                        <p className="text-xs opacity-40 mt-1 text-right">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="rounded-2xl rounded-bl-md px-4 py-3" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="flex items-center gap-1.5">
                        {[0, 1, 2].map(i => (
                          <span key={i} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex-shrink-0 p-4 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex gap-2">
                  <Input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Ask Sia anything..." disabled={loading}
                    className="flex-1 h-11 bg-white/10 border-white/15 text-white placeholder:text-white/30 focus:border-violet-400 rounded-xl" />
                  <Button onClick={() => sendMessage()} disabled={loading || !input.trim()}
                    className="h-11 w-11 p-0 rounded-xl border-0 flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #be185d)' }}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </Button>
                </div>
                <p className="text-center text-white/20 text-[10px] mt-2">Bookings • Beauty Tips • Todos • Orders • Routines</p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
