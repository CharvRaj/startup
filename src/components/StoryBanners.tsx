import { useState, useEffect } from 'react';
import {
  X, ChevronLeft, ChevronRight, Play, Pause, Sparkles,
  ExternalLink, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LatestStory, fetchLatestStories } from '@/lib/stories';

export function StoryBanners() {
  const navigate = useNavigate();
  const [stories, setStories] = useState<LatestStory[]>([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadStories();

    const handleUpdate = () => {
      loadStories();
    };
    window.addEventListener('satguru-latest-stories-updated', handleUpdate);
    return () => window.removeEventListener('satguru-latest-stories-updated', handleUpdate);
  }, []);

  const loadStories = async () => {
    const data = await fetchLatestStories();
    setStories(data);
  };

  const activeStory = activeStoryIndex !== null && stories[activeStoryIndex]
    ? stories[activeStoryIndex]
    : null;

  // Auto-progress timer for active story (5 seconds)
  useEffect(() => {
    if (activeStoryIndex === null || isPaused) return;

    const currentStoryId = stories[activeStoryIndex]?.id;
    if (currentStoryId) {
      setViewedStories(prev => new Set(prev).add(currentStoryId));
    }

    const duration = 5000;
    const stepTime = 50;
    const increment = (stepTime / duration) * 100;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, stepTime);

    return () => clearInterval(interval);
  }, [activeStoryIndex, isPaused, stories]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeStoryIndex === null) return;
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(p => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStoryIndex, stories.length]);

  const handleOpenStory = (index: number) => {
    setActiveStoryIndex(index);
    setProgress(0);
    setIsPaused(false);
  };

  const handleClose = () => {
    setActiveStoryIndex(null);
    setProgress(0);
    setIsPaused(false);
  };

  const handleNext = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setProgress(0);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      setProgress(0);
    }
  };

  const handleStoryAction = (link?: string) => {
    if (!link) return;
    handleClose();
    if (link.startsWith('http')) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else if (link.startsWith('/#')) {
      const elementId = link.replace('/#', '');
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate(link);
      }
    } else {
      navigate(link);
    }
  };

  // Helper for Top Hanging Badge (brand/service label)
  const getStoryBadge = (title: string, index: number) => {
    const badges = ['Royal Bridal', '24K Gold', 'Henna Art', 'VIP Salon', 'Keratin Spa', 'Nail Studio'];
    if (title.toLowerCase().includes('bridal')) return 'Royal Bridal';
    if (title.toLowerCase().includes('gold') || title.toLowerCase().includes('facial')) return '24K Gold';
    if (title.toLowerCase().includes('henna') || title.toLowerCase().includes('mehndi')) return 'Henna Art';
    if (title.toLowerCase().includes('doorstep') || title.toLowerCase().includes('vip')) return 'VIP Doorstep';
    if (title.toLowerCase().includes('hair') || title.toLowerCase().includes('spa')) return 'Keratin Spa';
    if (title.toLowerCase().includes('nail')) return 'Nail Studio';
    return badges[index % badges.length];
  };

  // Helper for 2-line catchy caption (like "Small bites, big smiles" in reference image)
  const getStoryTagline = (title: string, index: number) => {
    const taglines = [
      'Royal shringar, timeless grace',
      'Cellular radiance, instant glow',
      'Organic henna, deep royal stains',
      'Doorstep comfort, VIP care',
      'Silky smooth, frizz-free hair',
      'Festive shimmer, perfect nails',
    ];
    if (title.toLowerCase().includes('bridal')) return 'Royal shringar, timeless grace';
    if (title.toLowerCase().includes('gold') || title.toLowerCase().includes('facial')) return 'Cellular radiance, instant glow';
    if (title.toLowerCase().includes('henna') || title.toLowerCase().includes('mehndi')) return 'Organic henna, deep royal stains';
    if (title.toLowerCase().includes('doorstep') || title.toLowerCase().includes('vip')) return 'Doorstep comfort, VIP care';
    if (title.toLowerCase().includes('hair') || title.toLowerCase().includes('spa')) return 'Silky smooth, frizz-free hair';
    if (title.toLowerCase().includes('nail')) return 'Festive shimmer, perfect nails';
    return title.length > 28 ? title : taglines[index % taglines.length];
  };

  if (stories.length === 0) return null;

  return (
    <div className="w-full">
      <style>{`
        @keyframes storyMarqueeScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-story-marquee {
          display: flex;
          width: max-content;
          animation: storyMarqueeScroll 28s linear infinite;
        }
        .animate-story-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* ── SEAMLESS AUTO-SCROLL CAROUSEL (No manual slider, compact card dimensions, pauses on hover) ── */}
      <div className="relative w-full overflow-hidden py-2 select-none group/scroll">
        
        {/* Left & Right Edge Fades for Smooth Visual Blending */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-background via-background/70 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-background via-background/70 to-transparent z-10" />

        {/* Continuous Auto-Scrolling Track */}
        <div className="animate-story-marquee gap-3 sm:gap-4 px-2">
          {/* Duplicated list creates an unbroken continuous infinite loop */}
          {[...stories, ...stories].map((story, idx) => {
            const actualIndex = idx % stories.length;
            const isViewed = viewedStories.has(story.id);
            const badge = getStoryBadge(story.title, actualIndex);
            const tagline = getStoryTagline(story.title, actualIndex);

            return (
              <div
                key={`${story.id}-${idx}`}
                onClick={() => handleOpenStory(actualIndex)}
                className="group cursor-pointer flex-shrink-0 focus:outline-none transition-transform duration-300 hover:-translate-y-1.5"
              >
                {/* ── COMPACT CARD (~140px-165px width x ~195px-225px height) ── */}
                <div
                  className={`relative w-[135px] sm:w-[155px] md:w-[170px] h-[190px] sm:h-[210px] md:h-[230px] rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${
                    isViewed
                      ? 'border border-border/60 hover:shadow-md'
                      : 'border-2 border-rose-500/40 shadow-rose-500/10 hover:border-rose-500 hover:shadow-lg'
                  }`}
                  style={{
                    backgroundColor: '#1E1B18',
                  }}
                >
                  {/* Background Photo */}
                  <img
                    src={story.image_url}
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Top Center Hanging White Tab (From Reference Image) */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white px-2.5 sm:px-3 py-0.5 rounded-b-lg shadow-sm border-b border-x border-black/5 flex items-center justify-center z-10 max-w-[85%]">
                    <span className="font-extrabold text-[9px] sm:text-[10px] text-[#1E3A8A] tracking-tight truncate flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                      {badge}
                    </span>
                  </div>

                  {/* Bottom Text Plate (From Reference Image) */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-2.5 pt-6 bg-gradient-to-t from-black/90 via-black/55 to-transparent text-center">
                    <p className="text-white font-bold text-[11px] sm:text-xs leading-tight drop-shadow-md line-clamp-2">
                      {tagline}
                    </p>
                  </div>

                  {/* Live ring dot for unviewed stories */}
                  {!isViewed && (
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse z-10" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── FULLSCREEN INSTAGRAM-STYLE STORY VIEWER MODAL ── */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center select-none animate-in fade-in duration-200">
          
          {/* Main Story Container */}
          <div className="relative w-full max-w-md h-full max-h-[92vh] sm:max-h-[85vh] sm:rounded-3xl overflow-hidden bg-black flex flex-col justify-between shadow-2xl border border-white/10">

            {/* ── Top Bar: Segmented Progress Lines ── */}
            <div className="absolute top-0 left-0 right-0 z-30 p-3 pt-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
              <div className="flex gap-1.5 mb-3">
                {stories.map((s, idx) => (
                  <div
                    key={s.id}
                    className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
                  >
                    <div
                      className="h-full bg-white transition-all duration-75"
                      style={{
                        width:
                          idx === activeStoryIndex
                            ? `${progress}%`
                            : idx < (activeStoryIndex || 0)
                            ? '100%'
                            : '0%',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Story Header info */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full ring-2 ring-rose-500 overflow-hidden">
                    <img
                      src={activeStory.image_url}
                      alt={activeStory.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-xs leading-none drop-shadow">
                      {activeStory.title}
                    </p>
                    <p className="text-[10px] text-white/70 mt-0.5">
                      Satguru Makeup Art
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPaused(p => !p)}
                    className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                  >
                    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleClose}
                    className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Story Media & Tap Navigation Areas ── */}
            <div className="relative w-full h-full flex items-center justify-center bg-stone-900">
              <img
                src={activeStory.image_url}
                alt={activeStory.title}
                className="w-full h-full object-cover"
              />

              {/* Tap Left to Prev */}
              <div
                onClick={handlePrev}
                className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer"
              />

              {/* Tap Right to Next */}
              <div
                onClick={handleNext}
                className="absolute inset-y-0 right-0 w-1/3 z-20 cursor-pointer"
              />
            </div>

            {/* ── Bottom Story Action & Title Overlay ── */}
            <div className="absolute bottom-0 left-0 right-0 z-30 p-5 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
              <div className="space-y-3">
                <h3 className="font-display text-lg sm:text-xl font-bold text-white drop-shadow-md">
                  {activeStory.title}
                </h3>

                <button
                  onClick={() => handleStoryAction(activeStory.link_url || '/#booking')}
                  className="w-full py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider text-white shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
                  }}
                >
                  <span>Book Package Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Desktop Side Navigation Buttons */}
            {activeStoryIndex > 0 && (
              <button
                onClick={handlePrev}
                className="hidden md:flex absolute -left-14 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white items-center justify-center backdrop-blur-md transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {activeStoryIndex < stories.length - 1 && (
              <button
                onClick={handleNext}
                className="hidden md:flex absolute -right-14 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white items-center justify-center backdrop-blur-md transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
