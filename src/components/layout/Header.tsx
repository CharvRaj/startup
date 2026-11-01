import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, X, Sparkles, User, Bell, BellDot, CheckCheck,
  ShoppingCart, Moon, Sun, Phone, Calendar, ArrowRight,
  Gift, CheckCircle2, AlertTriangle, XCircle, Info, CreditCard, Megaphone,
  ChevronDown, Home, Layers, Scissors, Star, Crown,
  Palette, Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/context/ThemeContext';
import { BrandLogo } from '@/components/common/BrandLogo';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string;
  created_at: string;
}

interface DropdownItem {
  label: string;
  href: string;
  isRoute?: boolean;
  icon?: React.ElementType;
  badge?: string;
  description?: string;
}

interface NavItem {
  name: string;
  href?: string;
  isRoute?: boolean;
  badge?: string;
  dropdown?: DropdownItem[];
}

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const isAdmin = user?.email === 'charvraj2006@gmail.com';

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [cartCount, setCartCount] = useState<number>(0);
  const [doorstepCartCount, setDoorstepCartCount] = useState<number>(0);
  const [mehndiCartCount, setMehndiCartCount] = useState<number>(0);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isHomePage = location.pathname === '/';
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchCartCount();
    if (user) {
      fetchNotifications();
    }
    const handleCartUpdate = () => fetchCartCount();
    window.addEventListener('satguru_cart_updated', handleCartUpdate);
    return () => window.removeEventListener('satguru_cart_updated', handleCartUpdate);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCartCount();
      if (user) {
        fetchNotifications();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchCartCount = async () => {
    let localDs = 0;
    let localMs = 0;
    try {
      const rawDs = localStorage.getItem('satguru_local_cart');
      if (rawDs) {
        const parsed = JSON.parse(rawDs);
        localDs = parsed.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0);
      }
      const rawMs = localStorage.getItem('satguru_local_mehndi_cart');
      if (rawMs) {
        const parsed = JSON.parse(rawMs);
        localMs = parsed.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0);
      }
    } catch {}

    if (user) {
      try {
        const [dsRes, msRes] = await Promise.all([
          supabase.from('cart_items').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('mehndi_cart_items').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        ]);
        const ds = dsRes.count || 0;
        const ms = msRes.count || 0;
        localDs = Math.max(localDs, ds);
        localMs = Math.max(localMs, ms);
      } catch {
        // fallback to local counts
      }
    }

    setDoorstepCartCount(localDs);
    setMehndiCartCount(localMs);
    setCartCount(localDs + localMs);
  };

  const handleCartClick = () => {
    if (location.pathname.includes('mehndi')) {
      navigate('/mehndi-cart');
    } else if (doorstepCartCount === 0 && mehndiCartCount > 0) {
      navigate('/mehndi-cart');
    } else {
      navigate('/cart');
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      setNotifications(data || []);
    } catch { /* ignore */ }
  };

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = async () => {
    if (!user) return;
    await supabase.from('notifications').delete().eq('user_id', user.id);
    setNotifications([]);
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Calendar className="w-4 h-4" />;
      case 'assignment': return <User className="w-4 h-4" />;
      case 'success': return <CheckCircle2 className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'payment': return <CreditCard className="w-4 h-4" />;
      case 'announcement': return <Megaphone className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getNotifColor = (type: string) => {
    const map: Record<string, string> = {
      booking: 'bg-blue-100 text-blue-700',
      assignment: 'bg-[#FAF3E3] text-[#9C7228]',
      success: 'bg-emerald-100 text-emerald-700',
      warning: 'bg-amber-100 text-amber-700',
      error: 'bg-red-100 text-red-700',
      payment: 'bg-green-100 text-green-700',
      announcement: 'bg-[#FAF3E3] text-[#9C7228]',
    };
    return map[type] || 'bg-gray-100 text-gray-700';
  };

  // Luxury curated navigation items (Clean, Spacious, No overcrowding)
  const navItems: NavItem[] = [
    {
      name: 'Services',
      dropdown: [
        {
          label: 'Doorstep Salon',
          href: '/doorstep-service',
          isRoute: true,
          icon: Home,
          description: 'Certified salon artists at your doorstep',
        },
        {
          label: 'Mehndi Art',
          href: '/mehndi-service',
          isRoute: true,
          icon: Palette,
          description: 'Organic bridal & festive mehndi designs',
        },
        {
          label: 'Bridal Packages',
          href: '/doorstep-service',
          isRoute: true,
          icon: Crown,
          description: 'Complete royal wedding makeovers',
        },
        {
          label: 'Hair Spa & Cuts',
          href: '/doorstep-service',
          isRoute: true,
          icon: Scissors,
          description: 'Professional styling & spa therapies',
        },
        {
          label: 'Skin & Facials',
          href: '/doorstep-service',
          isRoute: true,
          icon: Star,
          description: 'Hydrating, diamond & herbal glow facials',
        },
        {
          label: 'View All Services',
          href: '/doorstep-service',
          isRoute: true,
          icon: Layers,
          badge: 'All',
        },
      ],
    },
    {
      name: 'Diwali Offer',
      href: '/diwali',
      isRoute: true,
      badge: '45% OFF',
    },
    {
      name: 'BlindGlow AI',
      href: '/virtual-studio',
      isRoute: true,
      badge: 'NEW',
    },
    {
      name: 'VIP Club',
      href: '/membership',
      isRoute: true,
    },
    {
      name: 'Contact',
      href: '/contact',
      isRoute: true,
    },
  ];

  const scrollToSection = (href: string) => {
    if (!isHomePage) {
      navigate('/');
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      setIsMenuOpen(false);
    } else {
      const el = document.querySelector(href);
      if (el) { el.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); }
    }
  };

  const handleNavClick = (item: NavItem) => {
    if (item.dropdown) {
      setOpenDropdown(openDropdown === item.name ? null : item.name);
      return;
    }
    if (item.isRoute && item.href) {
      navigate(item.href);
    } else if (item.href) {
      scrollToSection(item.href);
    }
    setOpenDropdown(null);
  };

  const handleDropdownClick = (item: DropdownItem) => {
    if (item.isRoute) {
      navigate(item.href);
    } else {
      scrollToSection(item.href);
    }
    setOpenDropdown(null);
    setIsMenuOpen(false);
  };

  const isActive = (item: NavItem) => {
    if (item.isRoute && item.href) return location.pathname === item.href;
    return false;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full overflow-x-clip">
      {/* Slim Top Utility Ribbon */}
      <div
        className="w-full text-xs py-1 px-4 sm:px-6 transition-colors hidden sm:block border-b"
        style={{
          background: theme === 'dark' ? 'rgba(20,18,22,0.96)' : 'rgba(250,246,240,0.96)',
          borderColor: theme === 'dark' ? 'rgba(197,160,89,0.18)' : 'rgba(197,160,89,0.22)',
          color: theme === 'dark' ? 'rgba(235,215,178,0.85)' : '#695736',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-medium text-[11px] sm:text-[11.5px]">
              <svg className="w-3.5 h-3.5 text-[#C5A059] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 3C10.5 3 5 8.5 5 15C5 17.5 6.5 21 8.5 21C11.5 21 21 16 21 7C21 4.5 19.5 3 17 3ZM17 5C18.5 5 19 6 19 7C19 12 12.5 16.5 10 18C8.5 16 7 13.5 7 15C7 9.5 11.5 5 17 5Z" />
              </svg>
              <span>Luxury Doorstep Beauty &amp; Certified Salon Artistry Citywide</span>
            </span>
          </div>

          <div className="flex items-center gap-3.5 text-[11px]">
            <a
              href="tel:+919887196182"
              className="flex items-center gap-1 hover:text-[#C5A059] transition-colors font-semibold"
            >
              <Phone className="w-3 h-3 text-[#C5A059]" />
              +91 98871 96182
            </a>
            <span className="opacity-30">|</span>
            <button
              onClick={() => navigate('/referral')}
              className="hover:text-[#C5A059] transition-colors font-semibold inline-flex items-center gap-1"
            >
              <Gift className="w-3 h-3 text-[#C5A059]" />
              <span>Refer &amp; Earn ₹150</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar - Balanced 3-Column Luxury Architecture (ZERO Overlapping) */}
      <nav
        className="transition-all duration-300 border-b relative w-full"
        style={{
          height: '62px',
          background: isScrolled
            ? theme === 'dark'
              ? 'rgba(18, 16, 20, 0.98)'
              : 'rgba(254, 252, 248, 0.98)'
            : theme === 'dark'
              ? 'rgba(18, 16, 20, 0.92)'
              : 'rgba(255, 253, 250, 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: isScrolled
            ? theme === 'dark'
              ? 'rgba(197, 160, 89, 0.22)'
              : 'rgba(197, 160, 89, 0.25)'
            : 'rgba(197, 160, 89, 0.12)',
          boxShadow: isScrolled
            ? theme === 'dark'
              ? '0 6px 24px rgba(0,0,0,0.5)'
              : '0 4px 20px rgba(184,134,11,0.06)'
            : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full">
          <div className="flex items-center justify-between h-full">
            
            {/* Left: Brand Logo with Laurel Leaf Emblem */}
            <div className="flex items-center flex-shrink-0 pr-4 sm:pr-6">
              <button
                onClick={() => navigate('/')}
                className="cursor-pointer focus:outline-hidden"
                aria-label="BlindGlow Home"
              >
                <BrandLogo isLightMode={theme === 'light'} />
              </button>
            </div>

            {/* Center: Desktop Navigation (Sleek Underline High-Fashion Style, No Bulky Pills) */}
            <div ref={dropdownRef} className="hidden lg:flex items-center gap-1 xl:gap-3.5 flex-shrink-0">
              {navItems.map((item) => {
                const active = isActive(item);
                return (
                  <div key={item.name} className="relative py-2">
                    <button
                      onClick={() => handleNavClick(item)}
                      className={`relative px-1.5 xl:px-2 py-1 text-[12px] xl:text-[13px] transition-all duration-200 flex items-center gap-1 whitespace-nowrap group ${
                        active
                          ? 'text-[#9C7228] dark:text-[#E8C37B] font-bold'
                          : 'text-foreground/80 hover:text-[#9C7228] dark:hover:text-[#E8C37B] font-medium'
                      }`}
                    >
                      {/* Leaf icon for active tab */}
                      {active && (
                        <svg className="w-3 h-3 text-[#C5A059] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17 3C10.5 3 5 8.5 5 15C5 17.5 6.5 21 8.5 21C11.5 21 21 16 21 7C21 4.5 19.5 3 17 3Z" />
                        </svg>
                      )}

                      <span>{item.name}</span>

                      {item.badge && (
                        <span
                          className="text-[8px] xl:text-[8.5px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider bg-[#FAF3E3] dark:bg-[#2A2318] text-[#9C7228] dark:text-[#E8C37B] border border-[#E0CDA9]"
                        >
                          {item.badge}
                        </span>
                      )}

                      {item.dropdown && (
                        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${openDropdown === item.name ? 'rotate-180' : ''}`} />
                      )}

                      {/* Delicate Gold Underline for active state */}
                      {active && (
                        <span className="absolute bottom-0 left-1 right-1 h-[2px] bg-gradient-to-r from-[#C5A059] via-[#BA8E3A] to-[#8C6510] rounded-full" />
                      )}
                    </button>

                    {/* Services Dropdown Menu */}
                    {item.dropdown && openDropdown === item.name && (
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-64 rounded-2xl border shadow-2xl z-[200] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                        style={{
                          background: theme === 'dark' ? 'rgba(22,20,25,0.98)' : '#FFFFFF',
                          borderColor: theme === 'dark' ? 'rgba(197,160,89,0.25)' : 'rgba(197,160,89,0.3)',
                          boxShadow: '0 16px 40px rgba(0,0,0,0.12), 0 2px 10px rgba(197,160,89,0.1)',
                        }}
                      >
                        <div className="p-2 space-y-0.5">
                          {item.dropdown.map((sub) => {
                            const SubIcon = sub.icon;
                            return (
                              <button
                                key={sub.label}
                                onClick={() => handleDropdownClick(sub)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#FAF3E3] dark:hover:bg-[#2A2318] transition-colors text-left group"
                              >
                                {SubIcon && (
                                  <div className="w-7 h-7 rounded-lg bg-[#FAF3E3] dark:bg-[#2A2318] border border-[#E0CDA9]/50 flex items-center justify-center flex-shrink-0 group-hover:bg-[#E0CDA9]/30 transition-colors">
                                    <SubIcon className="w-3.5 h-3.5 text-[#9C7228] dark:text-[#E8C37B]" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[12.5px] font-semibold text-foreground">{sub.label}</span>
                                    {sub.badge && (
                                      <span className="text-[8.5px] px-1.5 py-0.2 rounded-full font-bold bg-[#C5A059] text-white">
                                        {sub.badge}
                                      </span>
                                    )}
                                  </div>
                                  {sub.description && (
                                    <p className="text-[10.5px] text-muted-foreground line-clamp-1">{sub.description}</p>
                                  )}
                                </div>
                                <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-[#9C7228] group-hover:translate-x-0.5 transition-all" />
                              </button>
                            );
                          })}
                        </div>

                        <div className="px-3 py-2.5 border-t border-[#E0CDA9]/30 bg-[#FAF6F0] dark:bg-[#1A181C]">
                          <button
                            onClick={() => { navigate('/doorstep-service'); setOpenDropdown(null); }}
                            className="w-full h-8 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all hover:brightness-105"
                            style={{ background: 'linear-gradient(135deg, #B8860B 0%, #996515 100%)' }}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            Book a Doorstep Service
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right: Actions Cluster (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 flex-shrink-0 pl-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 text-foreground/75 hover:text-[#9C7228] hover:bg-[#FAF3E3] dark:hover:bg-[#2A2318] border border-border/80"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-[#9C7228]" />
                )}
              </button>

              {/* Cart Button */}
              <button
                onClick={handleCartClick}
                title="View Cart"
                className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-all text-foreground/75 hover:text-[#9C7228] hover:bg-[#FAF3E3] dark:hover:bg-[#2A2318] border border-border/80"
                aria-label="Cart"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold rounded-full flex items-center justify-center text-white"
                    style={{ background: '#B8860B' }}
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              {/* Notification Bell */}
              {user && (
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) fetchNotifications(); }}
                    className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-all text-foreground/75 hover:text-[#9C7228] hover:bg-[#FAF3E3] dark:hover:bg-[#2A2318] border border-border/80"
                    aria-label="Notifications"
                  >
                    {unreadCount > 0 ? <BellDot className="w-3.5 h-3.5 text-[#B8860B]" /> : <Bell className="w-3.5 h-3.5" />}
                    {unreadCount > 0 && (
                      <span
                        className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold rounded-full flex items-center justify-center text-white"
                        style={{ background: '#B8860B' }}
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div
                      className="absolute right-0 top-11 w-80 sm:w-88 max-h-[440px] overflow-hidden z-[100] rounded-2xl border shadow-2xl"
                      style={{
                        background: theme === 'dark' ? 'rgba(22,20,25,0.98)' : '#FFFFFF',
                        borderColor: 'rgba(197,160,89,0.3)',
                        boxShadow: '0 16px 40px rgba(0,0,0,0.15)',
                      }}
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border/80 bg-[#FAF6F0] dark:bg-[#1A181C]">
                        <div className="flex items-center gap-2">
                          <Bell className="w-3.5 h-3.5 text-[#B8860B]" />
                          <span className="font-bold text-foreground text-xs">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-[#B8860B] text-white">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-[11px] text-[#B8860B] hover:opacity-80 font-semibold flex items-center gap-1">
                              <CheckCheck className="w-3 h-3" />Mark all
                            </button>
                          )}
                          {notifications.length > 0 && (
                            <button onClick={clearAll} className="text-[11px] text-muted-foreground hover:text-foreground font-medium">
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="overflow-y-auto max-h-[340px]">
                        {notifications.length === 0 ? (
                          <div className="text-center py-8">
                            <Bell className="w-7 h-7 text-muted-foreground/30 mx-auto mb-2" />
                            <p className="text-muted-foreground text-xs">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => { markAsRead(notif.id); setShowNotifications(false); if (notif.link) navigate(notif.link); }}
                              className={`px-4 py-3 cursor-pointer hover:bg-[#FAF3E3] dark:hover:bg-[#2A2318] transition-colors flex gap-2.5 border-b border-border/50 ${
                                !notif.read ? 'bg-[#FAF3E3]/40 dark:bg-[#2A2318]/40' : ''
                              }`}
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${getNotifColor(notif.type)}`}>
                                {getNotifIcon(notif.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-xs font-semibold truncate ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>{notif.title}</p>
                                  {!notif.read && <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 bg-[#B8860B]" />}
                                </div>
                                <p className="text-[10.5px] text-muted-foreground line-clamp-2 mt-0.5">{notif.message}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User / Admin / Login */}
              {user ? (
                <>
                  {isAdmin && (
                    <Button
                      onClick={() => navigate('/admin')}
                      variant="outline"
                      size="sm"
                      className="gap-1 rounded-lg text-xs h-8 px-2 border-border/80 text-foreground hover:bg-[#FAF3E3] dark:hover:bg-[#2A2318]"
                      title="Admin Dashboard"
                    >
                      <Sparkles className="w-3 h-3 text-[#B8860B]" />
                      <span className="hidden xl:inline">Admin</span>
                    </Button>
                  )}
                  <Button
                    onClick={() => navigate('/profile')}
                    variant="outline"
                    size="sm"
                    className="gap-1 rounded-lg text-xs h-8 px-2 xl:px-2.5 border-border/80 text-foreground hover:bg-[#FAF3E3] dark:hover:bg-[#2A2318]"
                    title="User Profile"
                  >
                    <User className="w-3 h-3 text-[#B8860B]" />
                    <span className="hidden xl:inline">Profile</span>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-xs h-8 px-3 border-border/80 text-foreground hover:bg-[#FAF3E3] dark:hover:bg-[#2A2318] font-medium"
                >
                  Sign In
                </Button>
              )}

              {/* MAIN BOOK NOW BUTTON - WITH BOTANICAL LEAF ACCENT */}
              <button
                onClick={() => scrollToSection('#booking')}
                className="h-8 px-3.5 xl:px-4 text-xs font-bold text-white rounded-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] flex items-center gap-1.5 whitespace-nowrap shadow-sm group cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #C5A059 0%, #9E7832 50%, #B8860B 100%)',
                  boxShadow: '0 2px 10px rgba(184,134,11,0.28)',
                }}
              >
                <svg className="w-3.5 h-3.5 text-white/95 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 3C10.5 3 5 8.5 5 15C5 17.5 6.5 21 8.5 21C11.5 21 21 16 21 7C21 4.5 19.5 3 17 3ZM17 5C18.5 5 19 6 19 7C19 12 12.5 16.5 10 18C8.5 16 7 13.5 7 15C7 9.5 11.5 5 17 5Z" />
                </svg>
                <span>Book Now</span>
              </button>
            </div>

            {/* Mobile / Tablet Actions Cluster (< lg) */}
            <div className="lg:hidden flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => scrollToSection('#booking')}
                className="h-7 px-2.5 text-[11px] font-bold text-white rounded-lg transition-transform flex items-center gap-1 shadow-xs cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #C5A059 0%, #9E7832 50%, #B8860B 100%)',
                }}
              >
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 3C10.5 3 5 8.5 5 15C5 17.5 6.5 21 8.5 21C11.5 21 21 16 21 7C21 4.5 19.5 3 17 3Z" />
                </svg>
                <span>Book</span>
              </button>

              <button
                onClick={toggleTheme}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-foreground/80 border border-border/80"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-[#B8860B]" />}
              </button>

              <button
                onClick={handleCartClick}
                className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-foreground/80 border border-border/80"
                aria-label="Cart"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 text-[8.5px] font-bold rounded-full flex items-center justify-center text-white bg-[#B8860B]">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-foreground border border-border/80 hover:bg-[#FAF3E3] dark:hover:bg-[#2A2318]"
                aria-label="Menu"
              >
                {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mobile Drawer */}
          {isMenuOpen && (
            <div
              className="lg:hidden py-3 border-t border-border/80 animate-in fade-in slide-in-from-top-2 duration-150 rounded-b-2xl shadow-xl mt-1"
              style={{ background: theme === 'dark' ? 'rgba(20,18,22,0.98)' : '#FFFFFF' }}
            >
              <div className="flex flex-col gap-0.5 px-3">
                <div className="px-3 py-1 mb-1 flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-[#C5A059]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 3C10.5 3 5 8.5 5 15C5 17.5 6.5 21 8.5 21C11.5 21 21 16 21 7C21 4.5 19.5 3 17 3Z" />
                  </svg>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#B8860B]">Navigation &amp; Services</p>
                </div>

                <button
                  onClick={() => { navigate('/'); setIsMenuOpen(false); }}
                  className="text-foreground hover:text-[#B8860B] font-medium py-2 px-3 rounded-xl hover:bg-[#FAF3E3] dark:hover:bg-[#2A2318] text-left text-xs flex items-center gap-2.5"
                >
                  <Home className="w-3.5 h-3.5 text-[#B8860B]" />
                  <span>Home</span>
                </button>

                <button
                  onClick={() => { navigate('/doorstep-service'); setIsMenuOpen(false); }}
                  className="text-foreground hover:text-[#B8860B] font-medium py-2 px-3 rounded-xl hover:bg-[#FAF3E3] dark:hover:bg-[#2A2318] text-left text-xs flex items-center gap-2.5"
                >
                  <Scissors className="w-3.5 h-3.5 text-[#B8860B]" />
                  <span>Doorstep Salon</span>
                </button>

                <button
                  onClick={() => { navigate('/mehndi-service'); setIsMenuOpen(false); }}
                  className="text-foreground hover:text-[#B8860B] font-medium py-2 px-3 rounded-xl hover:bg-[#FAF3E3] dark:hover:bg-[#2A2318] text-left text-xs flex items-center gap-2.5"
                >
                  <Palette className="w-3.5 h-3.5 text-[#B8860B]" />
                  <span>Mehndi Art</span>
                </button>

                <button
                  onClick={() => { navigate('/virtual-studio'); setIsMenuOpen(false); }}
                  className="text-foreground hover:text-[#B8860B] font-medium py-2 px-3 rounded-xl hover:bg-[#FAF3E3] dark:hover:bg-[#2A2318] text-left text-xs flex items-center gap-2.5"
                >
                  <Bot className="w-3.5 h-3.5 text-[#B8860B]" />
                  <span className="flex items-center gap-2">
                    BlindGlow AI
                    <span className="text-[8.5px] px-1.5 py-0.2 rounded-full font-bold bg-[#B8860B] text-white">NEW</span>
                  </span>
                </button>

                <button
                  onClick={() => { navigate('/membership'); setIsMenuOpen(false); }}
                  className="text-foreground hover:text-[#B8860B] font-medium py-2 px-3 rounded-xl hover:bg-[#FAF3E3] dark:hover:bg-[#2A2318] text-left text-xs flex items-center gap-2.5"
                >
                  <Crown className="w-3.5 h-3.5 text-[#B8860B]" />
                  <span className="flex items-center gap-2">VIP Club <Star className="w-3 h-3 fill-amber-400 text-amber-400" /></span>
                </button>

                <button
                  onClick={() => { navigate('/diwali'); setIsMenuOpen(false); }}
                  className="text-foreground hover:text-[#B8860B] font-medium py-2 px-3 rounded-xl hover:bg-[#FAF3E3] dark:hover:bg-[#2A2318] text-left text-xs flex items-center gap-2.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
                  <span className="flex items-center gap-2">
                    Diwali Utsav
                    <span className="text-[8.5px] px-1.5 py-0.2 rounded-full font-bold bg-[#FAF3E3] dark:bg-[#2A2318] text-[#B8860B] border border-[#E0CDA9]">45% OFF</span>
                  </span>
                </button>

                <button
                  onClick={() => { navigate('/contact'); setIsMenuOpen(false); }}
                  className="text-foreground hover:text-[#B8860B] font-medium py-2 px-3 rounded-xl hover:bg-[#FAF3E3] dark:hover:bg-[#2A2318] text-left text-xs flex items-center gap-2.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#B8860B]" />
                  <span>Contact</span>
                </button>

                <div className="my-1.5 border-t border-border/80" />

                {user ? (
                  <div className="flex gap-2">
                    {isAdmin && (
                      <Button
                        onClick={() => { navigate('/admin'); setIsMenuOpen(false); }}
                        variant="outline"
                        className="flex-1 rounded-lg text-xs h-8 border-border/80 text-foreground hover:bg-[#FAF3E3] dark:hover:bg-[#2A2318]"
                      >
                        Admin
                      </Button>
                    )}
                    <Button
                      onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}
                      variant="outline"
                      className="flex-1 rounded-lg text-xs h-8 border-border/80 text-foreground hover:bg-[#FAF3E3] dark:hover:bg-[#2A2318]"
                    >
                      Profile
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
                    variant="outline"
                    className="w-full rounded-lg text-xs h-8 border-border/80 text-foreground hover:bg-[#FAF3E3] dark:hover:bg-[#2A2318]"
                  >
                    Sign In
                  </Button>
                )}

                <button
                  onClick={() => scrollToSection('#booking')}
                  className="w-full py-2.5 mt-1 text-xs font-bold text-white rounded-lg shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #C5A059 0%, #9E7832 50%, #B8860B 100%)' }}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Book Salon Now
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
