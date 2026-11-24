import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  shape: 'star' | 'circle' | 'sparkle';
  rotation: number;
  rotSpeed: number;
}

const GOLD_PALETTE = ['#ffd700', '#ffe680', '#d4af37', '#fff6cc', '#f59e0b', '#fef08a'];

export function GoldenStardustCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Only enable on desktop pointer devices
    if (typeof window === 'undefined') return;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    const MAX_PARTICLES = 45;
    let lastX = -1;
    let lastY = -1;

    const spawnSparkles = (x: number, y: number, count: number = 2, isClick: boolean = false) => {
      for (let i = 0; i < count; i++) {
        if (particles.length > MAX_PARTICLES && !isClick) return;

        const angle = Math.random() * Math.PI * 2;
        const speed = isClick ? Math.random() * 3.5 + 1.5 : Math.random() * 1.2 + 0.3;
        const maxLife = isClick ? Math.random() * 35 + 25 : Math.random() * 25 + 15;
        const shapes: Particle['shape'][] = ['star', 'sparkle', 'circle'];

        particles.push({
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          size: isClick ? Math.random() * 4 + 3 : Math.random() * 3 + 1.5,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (isClick ? 0.5 : 0.8), // slight upward float
          life: 0,
          maxLife,
          color: GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)],
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.1,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      if (dist > 8) {
        spawnSparkles(e.clientX, e.clientY, 2);
        lastX = e.clientX;
        lastY = e.clientY;
      }
    };

    const handleClick = (e: MouseEvent) => {
      spawnSparkles(e.clientX, e.clientY, 12, true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03; // subtle gravity
        p.rotation += p.rotSpeed;

        const progress = p.life / p.maxLife;
        const alpha = Math.max(0, 1 - progress);
        const currentSize = p.size * (1 - progress * 0.4);

        if (alpha <= 0 || p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;

        if (p.shape === 'star') {
          // 4-pointed golden sparkle star
          ctx.beginPath();
          for (let s = 0; s < 4; s++) {
            ctx.rotate(Math.PI / 2);
            ctx.lineTo(currentSize * 1.5, 0);
            ctx.lineTo(currentSize * 0.35, currentSize * 0.35);
          }
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'sparkle') {
          // Diamond glint
          ctx.beginPath();
          ctx.moveTo(0, -currentSize * 1.4);
          ctx.lineTo(currentSize * 0.6, 0);
          ctx.lineTo(0, currentSize * 1.4);
          ctx.lineTo(-currentSize * 0.6, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          // Glowing round stardust orb
          ctx.beginPath();
          ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[99990]"
      style={{ willChange: 'transform' }}
    />
  );
}
