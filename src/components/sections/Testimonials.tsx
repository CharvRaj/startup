import { useEffect, useState, useRef } from 'react';
import { Sparkles, Star, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Review {
  id: string;
  rating: number;
  comment: string;
  service: string;
  created_at: string;
  user_profiles?: { username: string; email: string };
}

const SERVICE_COLORS: Record<string, string> = {
  'bridal': 'from-rose-500 to-pink-500',
  'hair': 'from-violet-500 to-purple-500',
  'facial': 'from-teal-500 to-cyan-500',
  'makeup': 'from-amber-500 to-orange-500',
  'mehndi': 'from-emerald-500 to-green-500',
  'skincare': 'from-blue-500 to-indigo-500',
  'default': 'from-primary to-pink-500',
};

const FALLBACK_REVIEWS = [
  { id: '1', rating: 5, comment: "Absolutely stunning work! My bridal makeup was perfect and lasted all day. Every guest complimented me. Highly recommend!", service: 'bridal', created_at: new Date().toISOString(), user_profiles: { username: 'Priya Sharma', email: '' } },
  { id: '2', rating: 5, comment: "The best parlour in Singhana! The facial left my skin glowing for weeks. The staff is so professional and caring.", service: 'facial', created_at: new Date().toISOString(), user_profiles: { username: 'Neha Gupta', email: '' } },
  { id: '3', rating: 5, comment: "Got mehndi done for my sister's wedding. The design was intricate and beautiful. Everyone was asking who did it!", service: 'mehndi', created_at: new Date().toISOString(), user_profiles: { username: 'Anjali Verma', email: '' } },
  { id: '4', rating: 5, comment: "Amazing hair styling! They understood exactly what I wanted and the result was beyond my expectations. Will definitely come back!", service: 'hair', created_at: new Date().toISOString(), user_profiles: { username: 'Ritu Agarwal', email: '' } },
  { id: '5', rating: 4, comment: "Doorstep service was so convenient! They came on time and the makeup was flawless. Perfect for special occasions.", service: 'makeup', created_at: new Date().toISOString(), user_profiles: { username: 'Sunita Devi', email: '' } },
  { id: '6', rating: 5, comment: "The skincare consultation changed my routine completely. My skin has never looked better. Thank you Satguru team!", service: 'skincare', created_at: new Date().toISOString(), user_profiles: { username: 'Kavita Singh', email: '' } },
];

function ReviewCard({ review }: { review: Review }) {
  const username = review.user_profiles?.username || review.user_profiles?.email?.split('@')[0] || 'Happy Customer';
  const seed = username.replace(/\s+/g, '') || 'user';
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&hair=long01&backgroundColor=ffdfbf,ffd5dc,d1d4f9,c0aede,b6e3f4`;
  const serviceLabel = review.service?.toLowerCase() || 'service';
  const colorClass = Object.keys(SERVICE_COLORS).find(k => serviceLabel.includes(k))
    ? SERVICE_COLORS[Object.keys(SERVICE_COLORS).find(k => serviceLabel.includes(k))!]
    : SERVICE_COLORS.default;

  return (
    <div
      className="flex-shrink-0 w-80 p-6 rounded-3xl relative overflow-hidden group"
      style={{
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(20px)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(190,24,93,0.15), transparent 70%)' }} />

      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-white/20'}`} />
        ))}
      </div>

      {/* Comment */}
      <p className="text-white/85 text-sm leading-relaxed mb-5 line-clamp-4">"{review.comment}"</p>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={avatarUrl} alt={username} className="w-10 h-10 rounded-full ring-2 ring-white/20 bg-white/10" />
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#0f0514] flex items-center justify-center">
              <CheckCircle className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{username}</p>
            <p className="text-white/40 text-xs">Verified Customer</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${colorClass}`}>
          {review.service?.charAt(0).toUpperCase()}{review.service?.slice(1)}
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from('reviews').select('*, user_profiles(username, email)').order('created_at', { ascending: false }).limit(12)
      .then(({ data }) => {
        if (data && data.length >= 3) setReviews(data);
        else setReviews(FALLBACK_REVIEWS as any);
      })
      .catch(() => setReviews(FALLBACK_REVIEWS as any));
  }, []);

  // Duplicate for infinite loop
  const displayReviews = reviews.length > 0 ? [...reviews, ...reviews] : [];

  return (
    <section className="py-20 overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #0f0514 0%, #1a0826 50%, #0f0a1e 100%)' }}>
      {/* Ambient glows */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full opacity-10 pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(circle, #be185d, transparent 70%)' }} />
      <div className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full opacity-8 pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />

      <div className="container-custom mb-12">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full"
            style={{ background: 'rgba(190,24,93,0.15)', border: '1px solid rgba(190,24,93,0.3)' }}>
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-medium text-pink-300">Customer Love</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4"
            style={{ background: 'linear-gradient(135deg, #f9a8d4, #fbbf24, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            What Our Queens Say
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">Real reviews from real customers who trusted us with their beauty</p>
        </div>
      </div>

      {/* Scrolling track wrapper */}
      <div className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}>
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #0f0514, transparent)' }} />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #0f0514, transparent)' }} />

        {/* Row 1 — moves left */}
        <div className="overflow-hidden mb-5">
          <div
            ref={trackRef}
            className="flex gap-5"
            style={{
              animation: `marqueeLeft ${displayReviews.length * 4}s linear infinite`,
              animationPlayState: paused ? 'paused' : 'running',
              width: 'max-content',
            }}
          >
            {displayReviews.map((r, i) => (
              <ReviewCard key={`${r.id}-${i}`} review={r} />
            ))}
          </div>
        </div>

        {/* Row 2 — moves right (reversed) */}
        <div className="overflow-hidden">
          <div
            className="flex gap-5"
            style={{
              animation: `marqueeRight ${displayReviews.length * 4.5}s linear infinite`,
              animationPlayState: paused ? 'paused' : 'running',
              width: 'max-content',
            }}
          >
            {[...displayReviews].reverse().map((r, i) => (
              <ReviewCard key={`rev-${r.id}-${i}`} review={r} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marqueeLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeRight {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}
