import { useState } from 'react';
import { Phone, Mail, MessageCircle, MapPin, Send, Clock, HelpCircle, User, Loader2, Calendar, Home, CreditCard, Star, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';

const QUICK_QUESTIONS = [
  { icon: Calendar, question: 'How do I book an appointment?' },
  { icon: Home, question: 'What is doorstep service?' },
  { icon: CreditCard, question: 'What payment methods do you accept?' },
  { icon: Star, question: 'How do I earn loyalty points?' },
  { icon: MapPin, question: 'Where are you located?' },
  { icon: XCircle, question: 'Can I cancel my booking?' },
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
      toast({ title: 'Message Sent!', description: "We'll get back to you within 24 hours via email." });
      setForm({ name: user?.username || '', email: user?.email || '', phone: '', subject: '', message: '' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen" style={{ background: '#FAF6F0' }}>
      <main className="pt-28 pb-20 px-4">
        <div className="container-custom max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: '#F5DCE1', color: '#542337', border: '1px solid rgba(200,62,104,0.2)' }}
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#C83E68]" />
              <span>Get In Touch</span>
            </div>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight leading-tight"
              style={{ color: '#342A29', fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              We're Here For <span className="italic" style={{ color: '#C83E68' }}>You</span>
            </h1>
            <p className="text-base sm:text-lg max-w-xl mx-auto" style={{ color: '#542337', opacity: 0.85 }}>
              Have a question about bridal packages, doorstep treatments, or custom bookings? Reach out anytime.
            </p>
          </div>

          {/* Contact cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {[
              { icon: Phone, label: 'Call Us', value: '+91 98871 96182', href: 'tel:+919887196182', sub: 'Mon–Sun: 9:00 AM – 8:00 PM' },
              { icon: MessageCircle, label: 'WhatsApp', value: 'Chat with Us', href: 'https://wa.me/919887196182', sub: 'Instant artist assistance' },
              { icon: Mail, label: 'Email Us', value: 'info@satgurumakeupart.com', href: 'mailto:info@satgurumakeupart.com', sub: 'Fast reply within 24 hours' },
            ].map(({ icon: Icon, label, value, href, sub }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 block bg-white border border-[#F5DCE1] shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#FDF0F4] border border-[#F5DCE1] flex items-center justify-center mb-4 text-[#C83E68]">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-[#342A29] font-bold text-base mb-1">{label}</h3>
                <p className="text-[#C83E68] text-sm font-semibold">{value}</p>
                <p className="text-[#542337]/60 text-xs mt-1">{sub}</p>
              </a>
            ))}
          </div>

          {/* Quick questions + Contact form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick questions */}
            <div className="rounded-3xl p-6 sm:p-8 bg-white border border-[#F5DCE1] shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-[#342A29] font-bold text-lg mb-2 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  <HelpCircle className="w-5 h-5 text-[#C83E68]" />
                  Frequently Asked Questions
                </h3>
                <p className="text-xs text-[#542337]/70 mb-5">Click any question to autofill your message query:</p>
                <div className="space-y-2.5">
                  {QUICK_QUESTIONS.map((q, i) => {
                    const QuestionIcon = q.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => setForm(p => ({ ...p, subject: q.question }))}
                        className="w-full text-left px-4 py-3 rounded-2xl text-[#342A29] text-xs font-medium transition-all hover:bg-[#FDF0F4] hover:text-[#C83E68] flex items-center gap-3 border border-[#F5DCE1]/70 bg-[#FFF9F5]"
                      >
                        <QuestionIcon className="w-4 h-4 text-[#C83E68] flex-shrink-0" />
                        <span>{q.question}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#F5DCE1]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#C83E68] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[#342A29] font-bold text-sm">Our Salon Studio</p>
                    <p className="text-[#542337]/75 text-xs mt-0.5">Satguru Herbal Beauty Parlor, Near Bijli Ghar Rd, Singhana, Rajasthan – 333516</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <Clock className="w-5 h-5 text-[#C83E68] flex-shrink-0" />
                  <div>
                    <p className="text-[#342A29] font-bold text-sm">Working Hours</p>
                    <p className="text-[#542337]/75 text-xs">Mon – Sun: 9:00 AM – 8:00 PM (Doorstep &amp; Studio)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Message form */}
            <form onSubmit={handleSubmit} className="rounded-3xl p-6 sm:p-8 space-y-4 bg-white border border-[#F5DCE1] shadow-sm">
              <h3 className="text-[#342A29] font-bold text-lg flex items-center gap-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                <Send className="w-5 h-5 text-[#C83E68]" />
                Send Us a Direct Message
              </h3>
              <p className="text-[#542337]/70 text-xs">Our team will review your query and provide a swift resolution.</p>
              
              {[
                { key: 'name', label: 'Your Name *', placeholder: 'Priya Sharma' },
                { key: 'email', label: 'Email *', placeholder: 'you@email.com', type: 'email' },
                { key: 'phone', label: 'Phone (Optional)', placeholder: '+91 98871 96182' },
                { key: 'subject', label: 'Subject *', placeholder: 'How can we help you?' },
              ].map(({ key, label, placeholder, type = 'text' }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-[#342A29] mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={(form as any)[key]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    required={key !== 'phone'}
                    className="w-full h-11 px-4 rounded-xl text-[#2D1F1D] placeholder:text-[#542337]/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#C83E68]/20 bg-[#FFF9F5] border border-[#F5DCE1]"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold text-[#342A29] mb-1.5">Message *</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Describe your appointment request, treatment details or question..."
                  rows={4}
                  required
                  className="w-full px-4 py-3 rounded-xl text-[#2D1F1D] placeholder:text-[#542337]/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#C83E68]/20 resize-none bg-[#FFF9F5] border border-[#F5DCE1]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:brightness-105 active:scale-98 shadow-md"
                style={{ background: 'linear-gradient(135deg, #C83E68 0%, #A82E52 100%)' }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Send Message</>}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
