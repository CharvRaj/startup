import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FloatingVideo() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;

      // Show video after scrolling one full screen
      if (scrollPosition > windowHeight && !hasScrolled) {
        setHasScrolled(true);
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasScrolled]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 animate-slide-left">
      <div className="relative">

        {/* Close Button */}
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 z-10 rounded-full w-8 h-8 p-0 shadow-lg"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Video Container */}
        <div className="relative w-64 h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/20 bg-black">

          <iframe
            src="https://www.youtube.com/embed/W9LjI6vXd4k?autoplay=1&mute=1&controls=0&loop=1&playlist=W9LjI6vXd4k"
            title="Makeup Artist Video"
            frameBorder="0"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>

          {/* Text Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <p className="font-semibold text-sm mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-pink-400" /> Watch Our Artists in Action
            </p>
            <p className="text-xs opacity-90">
              Professional Makeup Service at Doorstep
            </p>
          </div>
        </div>

        {/* Attention Pulse */}
        <div className="absolute inset-0 rounded-2xl border-4 border-primary/40 animate-ping-slow pointer-events-none"></div>
      </div>
    </div>
  );
}