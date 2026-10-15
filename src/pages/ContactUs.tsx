import { useState } from 'react';
import { Phone, Mail, MessageCircle, MapPin, Send, Clock, HelpCircle, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';

const QUICK_QUESTIONS = [
  { icon: '📅', question: 'How do I book an appointment?' },
  { icon: '🏠', question: 'What is doorstep service?' },
  { icon: '💳', question: 'What payment methods do you accept?' },
  { icon: '⭐', question: 'How do I earn loyalty points?' },
  { icon: '📍', question: 'Where are you located?' },
  { icon: '❌', question: 'Can I cancel my booking?' },
];

export function ContactUs() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [form, setForm] = useState({ name: user?.username || '', email: user?.email || '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('contact_queries').insert({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      subject: form.subject,
      message: form.message,
      user_id: user?.id || null,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅ Message Sent!', description: "We'll get back to you within 24 hours via email." });
      setForm({ name: user?.username || '', email: user?.email || '', phone: '', subject: '', message: '' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0514, #1a0826, #0f0a1e)' }}>
      <main className="pt-28 pb-20 px-4">
        <div className="container-custom max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full"
              style={{ background: 'rgba(190,24,93,0.15)', border: '1px solid rgba(190,24,93,0.3)' }}>
              <MessageCircle className="w-4 h-4 text-pink-400" />
              <span className="text-sm font-medium text-pink-300">Get In Touch</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4"
              style={{ background: 'linear-gradient(135deg, #f9a8d4, #fbbf24, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Contact Us
            </h1>
            <p className="text-white/60 text-lg">We're here to help! Reach out anytime 💬</p>
          </div>

          {/* Contact cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[
              { icon: Phone, label: 'Call Us', value: '+91 98871 96182', href: 'tel:+919887196182', color: 'from-rose-400 to-pink-500', sub: 'Mon–Sun: 9 AM – 8 PM' },
              { icon: MessageCircle, label: 'WhatsApp', value: 'Chat with Us', href: 'https://wa.me/919887196182', color: 'from-emerald-400 to-teal-500', sub: 'Quick replies available' },
              { icon: Mail, label: 'Email Us', value: 'info@satgurumakeupart.com', href: 'mailto:info@satgurumakeupart.com', color: 'from-blue-400 to-cyan-500', sub: 'Response within 24 hours' },
            ].map(({ icon: Icon, label, value, href, color, sub }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="rounded-2xl p-5 transition-all hover:-translate-y-1 block"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold mb-1">{label}</h3>
                <p className="text-pink-300 text-sm font-medium">{value}</p>
                <p className="text-white/40 text-xs mt-1">{sub}</p>
              </a>
            ))}
          </div>

          {/* Quick questions + Contact form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick questions */}
            <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 className="text-white font-bold mb-5 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-pink-400" />Quick Help</h3>
              <div className="space-y-2">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button key={i} onClick={() => setForm(p => ({ ...p, subject: q.question }))}
                    className="w-full text-left px-4 py-3 rounded-xl text-white/70 text-sm transition-all hover:text-white"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span className="mr-2">{q.icon}</span>{q.question}
                  </button>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-white/10">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold text-sm">Our Location</p>
                    <p className="text-white/50 text-sm mt-1">Satguru Makeup Art, Singhana, Rajasthan – 333516, India</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <Clock className="w-5 h-5 text-pink-400 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold text-sm">Working Hours</p>
                    <p className="text-white/50 text-sm">Mon – Sun: 9:00 AM – 8:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Message form */}
            <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-4"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 className="text-white font-bold flex items-center gap-2"><Send className="w-5 h-5 text-pink-400" />Send Us a Message</h3>
              <p className="text-white/40 text-xs">Your query will go directly to admin for a response.</p>
              {[
                { key: 'name', label: 'Your Name *', placeholder: 'Priya Sharma' },
                { key: 'email', label: 'Email *', placeholder: 'you@email.com', type: 'email' },
                { key: 'phone', label: 'Phone (Optional)', placeholder: '+91 98765 43210' },
                { key: 'subject', label: 'Subject *', placeholder: 'How can we help?' },
              ].map(({ key, label, placeholder, type = 'text' }) => (
                <div key={key}>
                  <label className="block text-xs text-white/60 mb-1">{label}</label>
                  <input type={type} value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full h-10 px-4 rounded-xl text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
                </div>
              ))}
              <div>
                <label className="block text-xs text-white/60 mb-1">Message *</label>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Describe your query in detail..."
                  rows={4} className="w-full px-4 py-3 rounded-xl text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 resize-none"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full h-11 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #be185d, #ec4899)' }}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" />Send to Admin</>}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
