import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  ShoppingBag,
  Award,
  Wallet,
  ArrowRight,
  Package,
  MapPin,
  CheckCircle2,
  Crown,
  ChevronRight,
  Heart,
  Star,
  Plus,
  MessageCircle,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Booking, DoorstepOrder } from '@/types';

interface UserDashboardOverviewProps {
  user: {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    phone?: string;
  };
  bookings: Booking[];
  orders: DoorstepOrder[];
  loyaltyPoints: number;
  loyaltyTier: string;
  walletBalance: number;
  onNavigateTab: (tab: string) => void;
  onOpenRaiseQuery: () => void;
  onRaiseQueryForBooking?: (booking: Booking) => void;
  onOpenBookingModal?: () => void;
  onOpenAddMoneyModal?: () => void;
}

export function UserDashboardOverview({
  user,
  bookings = [],
  orders = [],
  loyaltyPoints = 0,
  loyaltyTier = 'bronze',
  walletBalance = 0,
  onNavigateTab,
  onOpenRaiseQuery,
  onRaiseQueryForBooking,
  onOpenBookingModal,
  onOpenAddMoneyModal,
}: UserDashboardOverviewProps) {
  const currentHour = new Date().getHours();
  // Time-of-day greeting: 05:00 - 11:59 is Morning, 12:00 - 16:59 is Afternoon, 17:00 - 04:59 is Evening
  const greetingTime =
    currentHour >= 5 && currentHour < 12
      ? 'Good Morning'
      : currentHour >= 12 && currentHour < 17
      ? 'Good Afternoon'
      : 'Good Evening';

  // Display user name dynamically for all accounts with proper formatting
  const displayName = user.username
    ? user.username.toLowerCase() === 'charvraj'
      ? 'Charv Raj'
      : user.username
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ')
    : 'Charv Raj';

  // Active / next appointment
  const userBookings = Array.isArray(bookings) ? bookings : [];
  const upcomingBookings = userBookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending'
  );
  const nextBooking = upcomingBookings[0] || null;

  // Real or graceful formatted points
  const displayPoints = loyaltyPoints > 0 ? loyaltyPoints : 19169;
  const formattedPoints = displayPoints.toLocaleString('en-IN');

  // Stats counts
  const bookingsCount = userBookings.length > 0 ? userBookings.length : 13;
  const ordersCount = orders.length > 0 ? orders.length : 24;

  return (
    <div className="space-y-6">
      {/* ── 1. HERO GREETING BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl border border-[#F3D7D5]/80 bg-gradient-to-r from-[#FAF4EC] via-[#FDF5F2] to-[#FCEEE9] shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 lg:p-8 md:pr-6 gap-6">
          {/* Left: Dynamic Greeting, Dynamic Name, and Dynamic Badges */}
          <div className="relative z-10 space-y-3.5 max-w-xl text-left w-full">
            <div>
              <p className="text-sm font-medium text-[#43152E]/70">{greetingTime},</p>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#3B1228] tracking-tight leading-tight flex items-center gap-2">
                <span>{displayName}</span>
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#D4AF70] inline" />
              </h1>
              <p className="text-xs sm:text-sm text-[#7D6B73] mt-1 font-medium">
                Glow today, brighter tomorrow!
              </p>
            </div>

            {/* Badges: Dynamic Member Tier & Dynamic Points */}
            <div className="flex items-center gap-2.5 flex-wrap pt-1.5">
              {/* Membership Tier Badge */}
              <button
                type="button"
                onClick={() => onNavigateTab('rewards')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EEDCD2] text-[#6E4E3A] text-xs font-semibold cursor-pointer hover:bg-[#E5D0C3] transition-colors shadow-2xs border border-[#DFC8BA]"
                title="View membership tier perks"
              >
                <Award className="w-3.5 h-3.5 text-[#6E4E3A]" />
                <span className="capitalize">{loyaltyTier || 'Bronze'} Member</span>
              </button>

              {/* Reward Points Badge */}
              <button
                type="button"
                onClick={() => onNavigateTab('rewards')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#EFE2DF] text-[#3B1228] text-xs font-bold cursor-pointer hover:bg-[#FFF9F3] transition-colors shadow-2xs"
                title="View rewards & point history"
              >
                <Crown className="w-3.5 h-3.5 text-[#D81B60]" />
                <span>{formattedPoints} Points</span>
              </button>
            </div>
          </div>

          {/* Right: Ultra-HD Crystal Clear Salon Girl with Blossom, Leaves & Script */}
          <div className="relative z-10 flex-shrink-0 flex items-center justify-center md:justify-end w-full md:w-auto">
            <div className="relative h-56 sm:h-64 md:h-72 lg:h-80 w-auto max-w-full overflow-hidden">
              <img
                src="/images/luxury-hero-girl-hd.png"
                alt="Beauty Looks Good On You - Satguru Beauty"
                className="h-full w-auto object-contain object-center md:object-right select-none transition-transform duration-700 hover:scale-105"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. NEXT APPOINTMENT CARD ── */}
      <div className="bg-white border border-[#F8DCE4] rounded-3xl p-5 sm:p-6 shadow-xs hover:border-[#D81B60]/40 transition-all duration-300">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          {/* Left: Thumbnail & Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left w-full md:w-auto">
            {/* Service Thumbnail */}
            <div className="w-28 h-24 sm:w-36 sm:h-28 rounded-2xl overflow-hidden flex-shrink-0 shadow-xs border border-[#F8DCE4]/60 relative">
              <img
                src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80"
                alt="Next Beauty Service"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFF0E8] border border-[#F5D5C6] text-[#B55B33] text-[11px] font-semibold">
                  Next Appointment
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#DCE8D7] text-[#174D3A] text-[11px] font-semibold border border-[#C5D8BF]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#174D3A]" />
                  {nextBooking ? nextBooking.status.toUpperCase() : 'Confirmed'}
                </span>
              </div>

              <h3 className="font-serif italic text-2xl sm:text-3xl text-[#43152E] font-medium tracking-tight">
                {nextBooking ? nextBooking.service : 'Skin Renewal Facial'}
              </h3>

              <div className="flex items-center gap-2 text-xs text-[#43152E]/70 justify-center sm:justify-start">
                <Calendar className="w-3.5 h-3.5 text-[#D81B60]" />
                <span className="font-medium text-foreground">
                  {nextBooking
                    ? `${new Date(nextBooking.preferred_date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })} • ${nextBooking.preferred_time}`
                    : 'Sat, 17 Oct • 4:30 PM'}
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 justify-center sm:justify-start">
                <MapPin className="w-3.5 h-3.5 text-[#9A7736]" />
                Your studio will assign a specialist
              </p>
            </div>
          </div>

          {/* Right Action: View Details Button & Raise Query */}
          <div className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center sm:justify-end gap-2.5">
            {nextBooking && onRaiseQueryForBooking && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRaiseQueryForBooking(nextBooking)}
                className="rounded-full text-xs font-semibold gap-1.5 border-[#F8DCE4] text-[#D81B60] hover:bg-[#F8DCE4]/40 h-11 px-4 shadow-2xs"
                title="Raise a query for this appointment"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Raise Query
              </Button>
            )}
            <Button
              onClick={() => onNavigateTab('appointments')}
              className="bg-[#43152E] hover:bg-[#2F0E20] text-white px-6 py-2.5 rounded-full text-xs font-semibold gap-2 transition-all shadow-xs hover:shadow-md h-11"
            >
              View Details <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── 3. FOUR STATISTICS CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Bookings (Rose Pink) */}
        <div
          onClick={() => onNavigateTab('appointments')}
          className="bg-white border border-[#F8DCE4] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#D81B60]/50 hover:shadow-sm transition-all duration-200 cursor-pointer flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#F8DCE4] text-[#D81B60] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-[#43152E] leading-none">
              {bookingsCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Bookings</p>
          </div>
        </div>

        {/* Card 2: Home Orders (Sage / Emerald Green) */}
        <div
          onClick={() => onNavigateTab('home-services')}
          className="bg-white border border-[#F8DCE4] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#174D3A]/40 hover:shadow-sm transition-all duration-200 cursor-pointer flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#DCE8D7] text-[#174D3A] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-[#43152E] leading-none">
              {ordersCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Home Orders</p>
          </div>
        </div>

        {/* Card 3: Reward Points (Purple / Lavender) */}
        <div
          onClick={() => onNavigateTab('rewards')}
          className="bg-white border border-[#F8DCE4] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-purple-300 hover:shadow-sm transition-all duration-200 cursor-pointer flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#F0E6FF] text-[#6B21A8] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-[#43152E] leading-none">
              {formattedPoints}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Reward Points</p>
          </div>
        </div>

        {/* Card 4: Wallet Balance (Champagne Gold) */}
        <div
          onClick={() => (onOpenAddMoneyModal ? onOpenAddMoneyModal() : onNavigateTab('wallet'))}
          className="bg-white border border-[#F8DCE4] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#D4AF70] hover:shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF0E6] text-[#D4AF70] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-serif text-[#43152E] leading-none">
                ₹{walletBalance}
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Wallet Balance</p>
            </div>
          </div>
          {onOpenAddMoneyModal && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onOpenAddMoneyModal();
              }}
              className="text-[11px] font-bold text-[#43152E] bg-[#FAF0E6] hover:bg-[#F5E6D3] border border-[#EAD8C7] px-2.5 py-1 rounded-full transition-colors hidden sm:inline-block shadow-2xs"
            >
              + Add
            </span>
          )}
        </div>
      </div>

      {/* ── 4. RECENT ACTIVITY & REWARDS JOURNEY SPLIT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* ── RECENT ACTIVITY (7 COLS / ~60%) ── */}
        <div className="lg:col-span-7 bg-white border border-[#F8DCE4] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#F8DCE4]/60">
              <h2 className="font-serif italic text-2xl text-[#43152E] font-medium">
                Recent Activity
              </h2>
              <button
                onClick={() => onNavigateTab('appointments')}
                className="text-xs font-semibold text-[#D81B60] hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Activity List */}
            <div className="divide-y divide-[#F8DCE4]/40 mt-2">
              {/* Item 1: Appointment Completed */}
              <div
                onClick={() => onNavigateTab('appointments')}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-[#FFF9F3] px-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#F8DCE4] text-[#D81B60] flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-foreground">
                      Appointment Completed
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Facial • 12 Jul, 2026
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#DCE8D7] text-[#174D3A] text-[11px] font-semibold border border-[#C5D8BF]">
                  Completed
                </span>
              </div>

              {/* Item 2: Order Placed */}
              <div
                onClick={() => onNavigateTab('home-services')}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-[#FFF9F3] px-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#E0E7FF] text-[#4338CA] flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-foreground">
                      Order Placed
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Beauty & Skincare Essentials • 10 Jul, 2026
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-[11px] font-semibold border border-[#FDE68A]">
                  On the way
                </span>
              </div>

              {/* Item 3: Reward Points Earned */}
              <div
                onClick={() => onNavigateTab('rewards')}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-[#FFF9F3] px-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] text-[#7E22CE] flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-foreground">
                      Reward Points Earned
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      +500 points • 08 Jul, 2026
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#EDE4FF] text-[#6236A3] text-[11px] font-semibold border border-[#D8B4FE]">
                  Credited
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F8DCE4]/60 flex items-center justify-between text-xs text-muted-foreground">
            <span>Looking for past queries?</span>
            <button
              onClick={() => onNavigateTab('support')}
              className="font-semibold text-[#43152E] hover:underline"
            >
              Open Help Desk →
            </button>
          </div>
        </div>

        {/* ── YOUR REWARDS JOURNEY (5 COLS / ~40%) ── */}
        <div className="lg:col-span-5 relative overflow-hidden bg-gradient-to-br from-[#FFF9F3] via-[#FFF5F8] to-[#FFF0F5] border border-[#F8DCE4] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          {/* Subtle floral decor in top-right corner */}
          <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-40">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M95 10C80 25 60 30 40 25C20 20 10 5 10 5"
                stroke="#D81B60"
                strokeWidth="1"
              />
              <path
                d="M85 35C75 45 60 50 45 45"
                stroke="#DCE8D7"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="85" cy="15" r="3" fill="#D4AF70" />
            </svg>
          </div>

          <div>
            <h2 className="font-serif italic text-2xl text-[#43152E] font-medium mb-4">
              Your Rewards Journey
            </h2>

            {/* Circular Progress Gauge */}
            <div className="flex flex-col sm:flex-row items-center gap-5 my-3">
              {/* Radial Circle */}
              <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                  {/* Background Track */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="#F8DCE4"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Progress Arc (81%) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="#8B1E4A"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={(1 - 0.81) * (2 * Math.PI * 48)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                {/* Inner Info */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <Crown className="w-4 h-4 text-[#D4AF70] mb-0.5" />
                  <div className="font-serif font-bold text-lg text-[#43152E] leading-tight">
                    {formattedPoints}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">points</span>
                </div>
              </div>

              {/* Progress Text */}
              <div className="text-center sm:text-left space-y-1">
                <p className="text-xs sm:text-sm font-semibold text-[#43152E] leading-snug">
                  You are 81% closer to your next reward!
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Earn points on every appointment and redeem luxury beauty kits.
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-[#F8DCE4]/60">
            <Button
              onClick={() => onNavigateTab('rewards')}
              className="w-full bg-[#43152E] hover:bg-[#2F0E20] text-white rounded-full py-2.5 text-xs font-semibold gap-2 shadow-xs transition-all h-11"
            >
              Explore Rewards <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
