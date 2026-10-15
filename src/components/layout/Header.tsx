import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, X, Sparkles, User, Bell, BellDot, CheckCheck,
  ShoppingCart, Moon, Sun, Phone, Calendar, ArrowRight
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
  const notifRef = useRef<HTMLDivElement>(null);

  const isHomePage = location.pathname === '/';
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchCartCount();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Poll for notifications and cart items
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchNotifications();
      fetchCartCount();
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchCartCount = async () => {
    if (!user) return;
    try {
      const [dsRes, msRes] = await Promise.all([
        supabase.from('cart_items').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('mehndi_cart_items').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);
      const ds = dsRes.count || 0;
      const ms = msRes.count || 0;
      setDoorstepCartCount(ds);
      setMehndiCartCount(ms);
      setCartCount(ds + ms);
    } catch {
      // fallback
    }
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
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setNotifications(data || []);
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
    const map: Record<string, string> = {
      booking: '📅', assignment: '👤', success: '✅', warning: '⚠️',
      error: '❌', info: 'ℹ️', payment: '💳', announcement: '📢'
    };
    return map[type] || 'ℹ️';
  };

  const getNotifColor = (type: string) => {
    const map: Record<string, string> = {
      booking: 'bg-blue-100 text-blue-700',
      assignment: 'bg-purple-100 text-purple-700',
      success: 'bg-emerald-100 text-emerald-700',
      warning: 'bg-amber-100 text-amber-700',
      error: 'bg-red-100 text-red-700',
      payment: 'bg-green-100 text-green-700',
      announcement: 'bg-rose-100 text-rose-700',
    };
    return map[type] || 'bg-gray-100 text-gray-700';
  };

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Services', href: '#services', badge: 'Popular' },
    { name: 'Doorstep Salon', href: '/doorstep-service', isRoute: true },
    { name: 'Mehndi Art', href: '/mehndi-service', isRoute: true },
    { name: 'VIP Club', href: '/membership', isRoute: true },
    { name: 'Contact', href: '/contact', isRoute: true },
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Top Utility Announcement Bar */}
      <div
        className="w-full text-xs py-1.5 px-4 transition-colors hidden sm:block border-b"
        style={{
          background: theme === 'dark' ? 'rgba(22,21,25,0.95)' : 'rgba(247,243,238,0.95)',
          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(201,149,108,0.15)',
          color: theme === 'dark' ? 'rgba(243,239,233,0.7)' : 'rgba(45,37,32,0.7)',
        }}
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Free Bridal Consultation with Every Package • Doorstep Available</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="tel:+919887196182"
              className="flex items-center gap-1 hover:text-primary transition-colors font-medium"
            >
              <Phone className="w-3 h-3 text-primary" />
              +91 98871 96182
            </a>
            <span className="opacity-30">|</span>
            <button
              onClick={() => navigate('/referral')}
              className="hover:text-primary transition-colors font-medium"
            >
              🎁 Refer & Earn ₹150
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav
        className="transition-all duration-300 border-b"
        style={{
          background: isScrolled
            ? theme === 'dark'
              ? 'rgba(22, 21, 25, 0.94)'
              : 'rgba(252, 250, 247, 0.94)'
            : theme === 'dark'
              ? 'rgba(18, 17, 21, 0.85)'
              : 'rgba(255, 253, 250, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: isScrolled
            ? theme === 'dark'
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(201,149,108,0.18)'
            : 'transparent',
          boxShadow: isScrolled
            ? theme === 'dark'
              ? '0 8px 30px rgba(0,0,0,0.4)'
              : '0 4px 25px rgba(180,150,130,0.08)'
            : 'none',
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px]">
            {/* Left: Brand Logo */}
            <a
              href="#home"
              onClick={(e) => { e.preventDefault(); scrollToSection('#home'); }}
              className="cursor-pointer"
            >
              <BrandLogo isLightMode={theme === 'light'} />
            </a>

            {/* Center: Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1.5">
              {navLinks.map((link) => {
                const isActive = link.isRoute
                  ? location.pathname === link.href
                  : isHomePage && location.hash === link.href;

                return link.isRoute ? (
                  <button
                    key={link.name}
                    onClick={() => navigate(link.href)}
                    className={`relative px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      isActive
                        ? 'text-primary bg-primary/10 font-semibold'
                        : 'text-foreground/80 hover:text-primary hover:bg-secondary/60'
                    }`}
                  >
                    {link.name}
                    {link.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-primary/15 text-primary border border-primary/20">
                        {link.badge}
                      </span>
                    )}
                  </button>
                ) : (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                    className={`relative px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      isActive
                        ? 'text-primary bg-primary/10 font-semibold'
                        : 'text-foreground/80 hover:text-primary hover:bg-secondary/60'
                    }`}
                  >
                    {link.name}
                    {link.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-primary/15 text-primary border border-primary/20">
                        {link.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>

            {/* Right: Actions Cluster */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Theme Toggle (Light / Dark) */}
              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 text-foreground/80 hover:text-primary hover:bg-secondary/70 border border-border/50"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
                ) : (
                  <Moon className="w-4 h-4 text-primary transition-transform duration-300 rotate-0 hover:-rotate-12" />
                )}
              </button>

              {/* Cart Button */}
              <button
                onClick={handleCartClick}
                title="View Cart"
                className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all text-foreground/80 hover:text-primary hover:bg-secondary/70 border border-border/50"
              >
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold rounded-full flex items-center justify-center text-white"
                    style={{ background: 'hsl(var(--primary))' }}
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              {/* Notification Bell (if user logged in) */}
              {user && (
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) fetchNotifications(); }}
                    className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all text-foreground/80 hover:text-primary hover:bg-secondary/70 border border-border/50"
                  >
                    {unreadCount > 0 ? <BellDot className="w-4 h-4 text-primary" /> : <Bell className="w-4 h-4" />}
                    {unreadCount > 0 && (
                      <span
                        className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold rounded-full flex items-center justify-center text-white"
                        style={{ background: 'hsl(var(--primary))' }}
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div
                      className="absolute right-0 top-12 w-96 max-h-[480px] overflow-hidden z-[100] rounded-2xl border border-border bg-card shadow-2xl backdrop-blur-xl"
                    >
                      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-secondary/30">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-primary" />
                          <span className="font-bold text-foreground text-sm">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary text-primary-foreground">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-primary hover:opacity-80 font-semibold flex items-center gap-1">
                              <CheckCheck className="w-3.5 h-3.5" />Mark all read
                            </button>
                          )}
                          {notifications.length > 0 && (
                            <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground font-medium">
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="overflow-y-auto max-h-[380px]">
                        {notifications.length === 0 ? (
                          <div className="text-center py-10">
                            <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                            <p className="text-muted-foreground text-xs">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => { markAsRead(notif.id); setShowNotifications(false); if (notif.link) navigate(notif.link); }}
                              className={`px-5 py-3.5 cursor-pointer hover:bg-secondary/40 transition-colors flex gap-3 border-b border-border/40 ${
                                !notif.read ? 'bg-primary/[0.04]' : ''
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm ${getNotifColor(notif.type)}`}>
                                {getNotifIcon(notif.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-xs font-semibold truncate ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>{notif.title}</p>
                                  {!notif.read && <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0 bg-primary" />}
                                </div>
                                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{notif.message}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User Profile / Admin / Login */}
              {user ? (
                <>
                  {isAdmin && (
                    <Button
                      onClick={() => navigate('/admin')}
                      variant="outline"
                      size="sm"
                      className="gap-1.5 rounded-xl text-xs h-9 border-border/70"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      Admin
                    </Button>
                  )}
                  <Button
                    onClick={() => navigate('/profile')}
                    variant="outline"
                    size="sm"
                    className="gap-1.5 rounded-xl text-xs h-9 border-border/70"
                  >
                    <User className="w-3.5 h-3.5 text-primary" />
                    Profile
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs h-9 px-4 border-border/70 font-medium"
                >
                  Sign In
                </Button>
              )}

              {/* Primary "Book Salon" CTA */}
              <button
                onClick={() => scrollToSection('#booking')}
                className="h-9 px-4 text-xs font-semibold text-white rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-md flex items-center gap-1.5"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #A83353 100%)',
                }}
              >
                <Calendar className="w-3.5 h-3.5" />
                Book Now
              </button>
            </div>

            {/* Mobile Actions Cluster */}
            <div className="lg:hidden flex items-center gap-1.5">
              {/* Theme Toggle Mobile */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground/80 border border-border/50"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary" />}
              </button>

              {/* Cart Mobile */}
              <button
                onClick={handleCartClick}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center text-foreground/80 border border-border/50"
              >
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold rounded-full flex items-center justify-center text-white bg-primary">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground border border-border/50 hover:bg-secondary/60"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Drawer */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-border animate-slide-down bg-card/95 backdrop-blur-2xl rounded-b-2xl shadow-xl">
              <div className="flex flex-col gap-1 px-3">
                {navLinks.map((link) => (
                  link.isRoute ? (
                    <button
                      key={link.name}
                      onClick={() => { navigate(link.href); setIsMenuOpen(false); }}
                      className="text-foreground hover:text-primary font-medium py-2.5 px-3 rounded-xl hover:bg-secondary/60 text-left text-sm flex items-center justify-between"
                    >
                      <span>{link.name}</span>
                      {link.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary">
                          {link.badge}
                        </span>
                      )}
                    </button>
                  ) : (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                      className="text-foreground hover:text-primary font-medium py-2.5 px-3 rounded-xl hover:bg-secondary/60 text-sm flex items-center justify-between"
                    >
                      <span>{link.name}</span>
                      {link.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary">
                          {link.badge}
                        </span>
                      )}
                    </a>
                  )
                ))}

                <div className="my-2 border-t border-border" />

                {user ? (
                  <div className="flex gap-2">
                    {isAdmin && (
                      <Button
                        onClick={() => { navigate('/admin'); setIsMenuOpen(false); }}
                        variant="outline"
                        className="flex-1 rounded-xl text-xs h-9"
                      >
                        Admin
                      </Button>
                    )}
                    <Button
                      onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}
                      variant="outline"
                      className="flex-1 rounded-xl text-xs h-9"
                    >
                      Profile
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
                    variant="outline"
                    className="w-full rounded-xl text-xs h-9"
                  >
                    Sign In
                  </Button>
                )}

                <button
                  onClick={() => scrollToSection('#booking')}
                  className="w-full py-2.5 mt-2 text-xs font-semibold text-white rounded-xl shadow-md flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #A83353 100%)' }}
                >
                  <Calendar className="w-4 h-4" />
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
