import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Tag, Sparkles, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import type { CartItem, DoorstepService, Coupon } from '@/types';


export function Cart() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [mehndiCount, setMehndiCount] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [diwaliGift, setDiwaliGift] = useState<{
    offerId: string;
    offerName: string;
    freeGiftTitle: string;
    freeGiftValue: string;
    items: string[];
  } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('blindglow_diwali_free_gift');
      if (raw) {
        setDiwaliGift(JSON.parse(raw));
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchCart();
    const handleCartUpdate = () => fetchCart();
    window.addEventListener('satguru_cart_updated', handleCartUpdate);
    return () => window.removeEventListener('satguru_cart_updated', handleCartUpdate);
  }, [user]);

  const fetchCart = async () => {
    setLoading(true);

    // 1. Read local cart items
    let localItems: CartItem[] = [];
    try {
      const raw = localStorage.getItem('satguru_local_cart');
      if (raw) {
        localItems = JSON.parse(raw);
      }
    } catch {}

    // Check count for mehndi items
    let localMehndiCount = 0;
    try {
      const rawMehndi = localStorage.getItem('satguru_local_mehndi_cart');
      if (rawMehndi) {
        const parsed = JSON.parse(rawMehndi);
        localMehndiCount = parsed.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0);
      }
    } catch {}

    // 2. If logged in, attempt to fetch from Supabase & merge
    if (user) {
      try {
        const [dsResult, msResult] = await Promise.all([
          supabase
            .from('cart_items')
            .select(`
              *,
              service:doorstep_services(*)
            `)
            .eq('user_id', user.id),
          supabase
            .from('mehndi_cart_items')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
        ]);

        if (!dsResult.error && dsResult.data) {
          const remoteItems = dsResult.data.filter((r: any) => r.service);
          const remoteIds = new Set(remoteItems.map((r: any) => r.service_id));
          const uniqueLocals = localItems.filter((l) => !remoteIds.has(l.service_id));
          localItems = [...uniqueLocals, ...remoteItems];
        }
        if (msResult.count) {
          localMehndiCount = Math.max(localMehndiCount, msResult.count);
        }
      } catch (error: any) {
        // Fallback to local items gracefully without disruptive toast
        console.warn('Supabase cart fetch fallback to local:', error);
      }
    }

    setCartItems(localItems);
    setMehndiCount(localMehndiCount);
    setLoading(false);
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(itemId);
      return;
    }

    setCartItems((prev) => {
      const updated = prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      try {
        localStorage.setItem('satguru_local_cart', JSON.stringify(updated));
        window.dispatchEvent(new Event('satguru_cart_updated'));
      } catch {}
      return updated;
    });

    if (user && !itemId.startsWith('diwali-') && !itemId.startsWith('temp-')) {
      try {
        await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', itemId);
      } catch (error: any) {
        console.warn('Update quantity remote error:', error);
      }
    }
  };

  const removeFromCart = async (itemId: string) => {
    setCartItems((prev) => {
      const updated = prev.filter((item) => item.id !== itemId);
      try {
        localStorage.setItem('satguru_local_cart', JSON.stringify(updated));
        window.dispatchEvent(new Event('satguru_cart_updated'));
      } catch {}
      return updated;
    });

    // Check if Diwali gift should be removed
    if (itemId.includes('diwali') || itemId.includes('offer')) {
      try {
        localStorage.removeItem('blindglow_diwali_free_gift');
        setDiwaliGift(null);
      } catch {}
    }

    if (user && !itemId.startsWith('diwali-') && !itemId.startsWith('temp-')) {
      try {
        await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId);
      } catch (error: any) {
        console.warn('Remove item remote error:', error);
      }
    }

    toast({
      title: 'Removed from Cart',
      description: 'Item removed successfully',
    });
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('active', true)
        .single();

      if (error || !data) {
        toast({
          title: 'Invalid Coupon',
          description: 'Coupon code not found or expired',
          variant: 'destructive',
        });
        return;
      }

      // Check minimum order amount
      if (subtotal < data.min_order_amount) {
        toast({
          title: 'Minimum Order Required',
          description: `Minimum order of ₹${data.min_order_amount} required for this coupon`,
          variant: 'destructive',
        });
        return;
      }

      // Check validity
      if (data.valid_until && new Date(data.valid_until) < new Date()) {
        toast({
          title: 'Coupon Expired',
          description: 'This coupon has expired',
          variant: 'destructive',
        });
        return;
      }

      setAppliedCoupon(data);
      toast({
        title: 'Coupon Applied!',
        description: data.description,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast({
      title: 'Coupon Removed',
      description: 'Coupon discount removed',
    });
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const service = item.service as DoorstepService;
    return sum + (service?.price || 0) * item.quantity;
  }, 0);

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;

    let discount = 0;
    if (appliedCoupon.discount_type === 'fixed') {
      discount = appliedCoupon.discount_value;
    } else {
      discount = Math.floor((subtotal * appliedCoupon.discount_value) / 100);
      if (appliedCoupon.max_discount) {
        discount = Math.min(discount, appliedCoupon.max_discount);
      }
    }

    return discount;
  };

  const discount = calculateDiscount();
  const deliveryCharge = subtotal < 499 ? 399 : 0; // ₹399 if order < ₹499
  const serviceCharge = 199; // Fixed ₹199 service charge
  const total = Math.max(0, subtotal - discount + deliveryCharge + serviceCharge);
  const isFreeServiceEligible = subtotal >= 499;

  const handleProceedToCheckout = () => {
    if (!user) {
      toast({
        title: 'Sign In to Reserve Slot',
        description: 'Please sign in or create an account to finalize your booking address & slot.',
      });
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#121015] text-[#342A29] dark:text-[#F7F3EE] transition-colors duration-300">
      <main className="pt-28 pb-20 px-4">
        <div className="container-custom max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FDF0F4] dark:bg-[#2A202A] border border-[#F5DCE1] dark:border-[rgba(197,160,89,0.3)] flex items-center justify-center text-[#C83E68] dark:text-[#E8C37B]">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#342A29] dark:text-[#F7F3EE]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  My <span className="italic text-[#C83E68] dark:text-[#E8C37B]">Cart</span>
                </h1>
                <p className="text-xs sm:text-sm text-[#542337]/70 dark:text-[#C7B7A6]">Manage your booked beauty &amp; doorstep services</p>
              </div>
            </div>

            {/* Responsive Dual Cart Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-white/80 dark:bg-[#1A1721] rounded-2xl border border-[#F5DCE1] dark:border-[rgba(197,160,89,0.25)] self-start sm:self-auto shadow-sm">
              <button
                onClick={() => navigate('/cart')}
                className="py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 bg-white dark:bg-[#251F2A] text-[#C83E68] dark:text-[#E8C37B] shadow-sm border border-[#F5DCE1] dark:border-[rgba(197,160,89,0.3)]"
              >
                <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#C83E68] dark:text-[#E8C37B]" /> Doorstep Salon</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C83E68] text-white">
                  {cartItems.length}
                </span>
              </button>
              <button
                onClick={() => navigate('/mehndi-cart')}
                className="py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 text-[#542337]/70 dark:text-[#C7B7A6] hover:text-[#342A29] dark:hover:text-[#F7F3EE] hover:bg-[#FDF0F4] dark:hover:bg-[#251F2A]"
              >
                <span className="flex items-center gap-1.5"><Palette className="w-3.5 h-3.5 text-[#C83E68] dark:text-[#E8C37B]" /> Mehndi Art</span>
                {mehndiCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F5DCE1] dark:bg-stone-700 text-[#542337] dark:text-[#E8DEC8]">
                    {mehndiCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-10 h-10 border-4 border-[#C83E68] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-[#542337]/70">Loading cart...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="rounded-3xl p-12 text-center bg-white border border-[#F5DCE1] shadow-sm max-w-xl mx-auto">
              <Sparkles className="w-12 h-12 text-[#C83E68]/40 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#342A29] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Your Cart is Empty</h3>
              <p className="text-[#542337]/70 mb-6 text-sm">Add some luxurious doorstep treatments to get started</p>
              {mehndiCount > 0 && (
                <div className="mb-6 p-4 rounded-2xl bg-[#FFF9F5] border border-[#F5DCE1] max-w-md mx-auto">
                  <p className="text-sm font-medium text-[#342A29] mb-3">
                    You have {mehndiCount} {mehndiCount === 1 ? 'item' : 'items'} in your Mehndi Art Cart!
                  </p>
                  <Button onClick={() => navigate('/mehndi-cart')} variant="outline" className="text-[#C83E68] border-[#F5DCE1] hover:bg-[#FDF0F4]">
                    View Mehndi Cart ({mehndiCount})
                  </Button>
                </div>
              )}
              <Button
                onClick={() => navigate('/doorstep-service')}
                className="h-11 px-6 rounded-xl text-white font-semibold shadow-md"
                style={{ background: 'linear-gradient(135deg, #C83E68 0%, #A82E52 100%)' }}
              >
                Browse Salon Services
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map(item => {
                  const service = item.service as DoorstepService;
                  return (
                    <div key={item.id} className="rounded-3xl p-6 bg-white border border-[#F5DCE1] shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-lg text-[#342A29]">{service.name}</h3>
                              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FDF0F4] text-[#C83E68] border border-[#F5DCE1]">
                                {service.category}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart(item.id)}
                              className="text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="border-[#F5DCE1] text-[#342A29] hover:bg-[#FDF0F4]"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-10 text-center font-bold text-[#342A29]">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="border-[#F5DCE1] text-[#342A29] hover:bg-[#FDF0F4]"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-[#C83E68]">₹{service.price * item.quantity}</p>
                              <p className="text-xs text-[#542337]/60">₹{service.price} each</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Diwali Complimentary Gift Card */}
                {diwaliGift && (
                  <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-[#FFFDF8] via-[#FFF8EB] to-[#FFF1D6] border-2 border-dashed border-[#D4AF37] shadow-sm relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#B8860B] to-[#F59E0B] text-white flex items-center justify-center text-xl shadow-md flex-shrink-0 animate-bounce">
                          🎁
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8C6510] bg-[#FBE8B5] px-2.5 py-0.5 rounded-full border border-[#D4AF37]/60">
                              Diwali Complimentary Gift
                            </span>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              ✓ Unlocked at ₹0
                            </span>
                          </div>
                          <h4 className="font-bold text-base text-[#133826] mt-1">{diwaliGift.freeGiftTitle}</h4>
                          <p className="text-xs text-[#5A6D61] mt-0.5">
                            Includes: {diwaliGift.items?.join(' • ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-[#D4AF37]/30">
                        <span className="text-xs line-through text-stone-400 font-medium">Worth {diwaliGift.freeGiftValue}</span>
                        <span className="text-sm font-black text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-300">
                          FREE (₹0)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="rounded-3xl p-6 bg-white border border-[#F5DCE1] shadow-sm sticky top-24 space-y-4">
                  <h2 className="text-xl font-bold text-[#342A29]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Order Summary
                  </h2>

                  {/* Free Service Banner */}
                  {isFreeServiceEligible ? (
                    <div className="bg-[#FFF9F5] border border-[#F5DCE1] rounded-2xl p-3.5">
                      <p className="text-xs font-semibold text-[#542337] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#C83E68]" />
                        Congrats! You qualify for FREE doorstep service!
                      </p>
                    </div>
                  ) : (
                    <div className="bg-[#FFF9F5] border border-[#F5DCE1] rounded-2xl p-3.5">
                      <p className="text-xs text-[#542337]/80">
                        Add <strong className="text-[#C83E68]">₹{499 - subtotal}</strong> more to unlock FREE doorstep delivery
                      </p>
                    </div>
                  )}

                  {/* Coupon */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#342A29]">Have a Promo Code?</label>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 bg-[#FFF9F5] border border-[#F5DCE1] rounded-xl">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-[#C83E68]" />
                          <span className="font-bold text-xs text-[#342A29]">{appliedCoupon.code}</span>
                        </div>
                        <Button size="sm" variant="ghost" onClick={removeCoupon} className="text-xs text-rose-500 hover:text-rose-600">
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="ENTER CODE"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="h-10 text-xs uppercase bg-[#FFF9F5] border-[#F5DCE1] focus:ring-[#C83E68]"
                        />
                        <Button
                          onClick={applyCoupon}
                          disabled={applyingCoupon || !couponCode.trim()}
                          variant="outline"
                          className="h-10 text-xs border-[#F5DCE1] text-[#342A29] hover:bg-[#FDF0F4]"
                        >
                          {applyingCoupon ? '...' : 'Apply'}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2.5 pt-4 border-t border-[#F5DCE1]">
                    <div className="flex justify-between text-xs text-[#542337]/80">
                      <span>Subtotal</span>
                      <span className="font-semibold text-[#342A29]">₹{subtotal}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-xs text-emerald-600">
                        <span>Coupon Discount</span>
                        <span className="font-semibold">-₹{discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-[#542337]/80">
                      <span>Service Charge</span>
                      <span className="font-semibold text-[#342A29]">₹{serviceCharge}</span>
                    </div>
                    {deliveryCharge > 0 && (
                      <div className="flex justify-between text-xs text-amber-600">
                        <span>Doorstep Delivery Charge</span>
                        <span className="font-semibold">₹{deliveryCharge}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold pt-3 border-t border-[#F5DCE1] text-[#342A29]">
                      <span>Total Amount</span>
                      <span className="text-xl text-[#C83E68]">₹{total}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleProceedToCheckout}
                    className="w-full h-12 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-98 transition-all"
                    style={{ background: 'linear-gradient(135deg, #C83E68 0%, #A82E52 100%)' }}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
