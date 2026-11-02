import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HelpCircle, Headphones, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';

export function FloatingHelpButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  // Show only when account is signed in
  if (!user) return null;

  // Hide on help-support page itself, or auth pages
  if (
    location.pathname === '/help-support' ||
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/forgot-password'
  ) {
    return null;
  }

  return (
    <aside aria-label="Quick Support Helpdesk">
      <button
        onClick={() => navigate('/help-support')}
        className="fixed bottom-18 sm:bottom-24 left-4 sm:left-6 z-50 group flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full bg-[#43152E] hover:bg-[#2F0E20] text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-[#F8DCE4]/30"
        title="Help & Support Desk"
      >
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F8DCE4] text-[#D81B60] flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform">
          <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-xs font-bold leading-none tracking-tight">Need Help?</div>
          <div className="text-[10px] text-[#F8DCE4] leading-none mt-0.5 font-medium">
            Help & Support Desk
          </div>
        </div>
        <span className="sm:hidden text-[11px] font-bold">Help</span>
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
      </button>
    </aside>
  );
}
