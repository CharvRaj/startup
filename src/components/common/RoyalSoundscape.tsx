import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles, Music } from 'lucide-react';

export function RoyalSoundscape() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneNodesRef = useRef<{ osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null>(null);
  const sitarIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Web Audio API on first user interaction
  const initAudio = () => {
    if (audioCtxRef.current) return audioCtxRef.current;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    audioCtxRef.current = ctx;
    return ctx;
  };

  // Play a gentle ghunghroo (metallic bell) chime on button taps
  const playGhunghrooChime = () => {
    if (!isPlaying || isMuted) return;
    try {
      const ctx = initAudio();
      if (ctx.state === 'suspended') ctx.resume();

      const freqs = [1760, 2093, 2349, 2793, 3135];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 40, ctx.currentTime);

        gain.gain.setValueAtTime(0.012, ctx.currentTime + idx * 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.02 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.02);
        osc.stop(ctx.currentTime + idx * 0.02 + 0.38);
      });
    } catch {
      // AudioContext policy handled gracefully
    }
  };

  // Start meditative Royal Tanpura harmonic drone
  const startPalaceHarmony = () => {
    const ctx = initAudio();
    if (ctx.state === 'suspended') ctx.resume();

    // Root fundamental (C#3 / 138.59 Hz - authentic royal Indian classical pitch)
    const root = 138.59;
    const fifth = root * 1.5; // Pa (Pancham)

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 2.5); // Soft, peaceful volume

    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(root, ctx.currentTime);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(fifth, ctx.currentTime);

    // Warm Low-pass filter for smooth acoustic resonance
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    osc1.start();
    osc2.start();

    droneNodesRef.current = { osc1, osc2, gain: masterGain };

    // Periodic gentle acoustic sitar pluck notes (Raag Yaman scale)
    const yamanScale = [277.18, 311.13, 369.99, 415.3, 466.16, 554.37];
    sitarIntervalRef.current = setInterval(() => {
      if (ctx.state !== 'running' || isMuted) return;
      const noteFreq = yamanScale[Math.floor(Math.random() * yamanScale.length)];

      const noteOsc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      noteOsc.type = 'triangle';
      noteOsc.frequency.setValueAtTime(noteFreq, ctx.currentTime);

      noteGain.gain.setValueAtTime(0.035, ctx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

      noteOsc.connect(noteGain);
      noteGain.connect(ctx.destination);

      noteOsc.start();
      noteOsc.stop(ctx.currentTime + 1.85);
    }, 4200);
  };

  const stopPalaceHarmony = () => {
    if (sitarIntervalRef.current) {
      clearInterval(sitarIntervalRef.current);
      sitarIntervalRef.current = null;
    }
    if (droneNodesRef.current && audioCtxRef.current) {
      const { osc1, osc2, gain } = droneNodesRef.current;
      const ctx = audioCtxRef.current;
      try {
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.0);
        setTimeout(() => {
          osc1.stop();
          osc2.stop();
          osc1.disconnect();
          osc2.disconnect();
          gain.disconnect();
          droneNodesRef.current = null;
        }, 1100);
      } catch {
        // Safe disconnect
      }
    }
  };

  const toggleSound = () => {
    if (isPlaying) {
      stopPalaceHarmony();
      setIsPlaying(false);
    } else {
      startPalaceHarmony();
      setIsPlaying(true);
    }
  };

  // Add click listener to all buttons for delicate ghunghroo chime
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('button') || target?.closest('a') || target?.closest('.clickable')) {
        playGhunghrooChime();
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      stopPalaceHarmony();
    };
  }, [isPlaying, isMuted]);

  return (
    <div className="fixed bottom-6 left-6 z-[9990] flex items-center select-none">
      <div className="relative">
        <button
          onClick={toggleSound}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`group flex items-center gap-2 px-3.5 py-2 rounded-full border shadow-2xl backdrop-blur-md transition-all duration-300 cursor-pointer ${
            isPlaying
              ? 'bg-gradient-to-r from-[#2a1309] via-[#421d0d] to-[#2a1309] border-[#d4af37] text-[#ffd700] shadow-[0_0_20px_rgba(212,175,55,0.4)]'
              : 'bg-black/60 border-stone-700/60 text-stone-300 hover:border-[#d4af37]/70 hover:text-[#f7e4c0]'
          }`}
          aria-label="Toggle Royal Palace Ambience"
        >
          {isPlaying ? (
            <>
              <Volume2 className="w-4 h-4 text-[#ffd700] animate-pulse" />
              {/* Equalizer Wavebars */}
              <div className="flex items-end gap-0.5 h-3.5">
                <span className="w-0.5 bg-[#ffd700] rounded-full animate-[musicBar_1.1s_ease-in-out_infinite]" />
                <span className="w-0.5 bg-[#ffd700] rounded-full animate-[musicBar_0.8s_ease-in-out_infinite_0.2s]" />
                <span className="w-0.5 bg-[#ffd700] rounded-full animate-[musicBar_1.3s_ease-in-out_infinite_0.4s]" />
              </div>
              <span className="font-serif text-xs font-semibold tracking-wider text-[#ffd700] hidden sm:inline">
                Royal Ambience
              </span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-stone-400 group-hover:text-[#ffd700] transition-colors" />
              <span className="font-serif text-xs font-medium tracking-wide text-stone-300 group-hover:text-[#ffd700] hidden sm:inline">
                Play Palace Music
              </span>
            </>
          )}
        </button>

        {/* Hover Tooltip */}
        {showTooltip && (
          <div className="absolute left-0 bottom-full mb-2 px-3 py-1.5 rounded-lg bg-[#1a0c06] border border-[#d4af37]/50 text-[#fff4d1] text-[11px] font-serif tracking-wide shadow-xl whitespace-nowrap pointer-events-none">
            {isPlaying ? 'Mute Royal Sitar & Tanpura Ambience' : 'Listen to Royal Palace Sitar & Shehnai Ambience'}
          </div>
        )}
      </div>

      <style>{`
        @keyframes musicBar {
          0%, 100% { height: 4px; }
          50% { height: 14px; }
        }
      `}</style>
    </div>
  );
}
