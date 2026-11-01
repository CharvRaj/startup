import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Tag, Sparkles, Heart, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';


interface MehndiService {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  available: boolean;
}

interface MehndiCartItem {
  id: string;
  user_id: string;
  service_id: string;
  quantity: number;
  service?: MehndiService;
}

interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'fixed' | 'percentage';
  discount_value: number;
  min_order_amount: number;
  max_discount: number | null;
  active: boolean;
}

export function MehndiCart() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [cartItems, setCartItems] = useState<MehndiCartItem[]>([]);
  const [doorstepCount, setDoorstepCount] = useState(0);
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

    // 1. Read local mehndi items
    let localItems: MehndiCartItem[] = [];
    try {
      const raw = localStorage.getItem('satguru_local_mehndi_cart');
      if (raw) {
        localItems = JSON.parse(raw);
      }
    } catch {}

    // Check count for doorstep items
    let localDoorstepCount = 0;
    try {
      const rawDs = localStorage.getItem('satguru_local_cart');
      if (rawDs) {
        const parsed = JSON.parse(rawDs);
        localDoorstepCount = parsed.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0);
      }
    } catch {}

    // 2. If logged in, attempt to fetch from Supabase & merge
    if (user) {
      try {
        const [msResult, dsResult] = await Promise.all([
          supabase
            .from('mehndi_cart_items')
            .select(`
              *,
              service:mehndi_services(*)
            `)
            .eq('user_id', user.id),
          supabase
            .from('cart_items')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
        ]);

        if (!msResult.error && msResult.data) {
          const remoteItems = msResult.data.filter((r: any) => r.service);
          const remoteIds = new Set(remoteItems.map((r: any) => r.service_id));
          const uniqueLocals = localItems.filter((l) => !remoteIds.has(l.service_id));
          localItems = [...uniqueLocals, ...remoteItems];
        }
        if (dsResult.count) {
          localDoorstepCount = Math.max(localDoorstepCount, dsResult.count);
        }
      } catch (error: any) {
        console.warn('Supabase mehndi cart fetch fallback to local:', error);
      }
    }

    setCartItems(localItems);
    setDoorstepCount(localDoorstepCount);
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
        localStorage.setItem('satguru_local_mehndi_cart', JSON.stringify(updated));
        window.dispatchEvent(new Event('satguru_cart_updated'));
      } catch {}
      return updated;
    });

    if (user && !itemId.startsWith('diwali-') && !itemId.startsWith('temp-')) {
      try {
        await supabase
          .from('mehndi_cart_items')
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
        localStorage.setItem('satguru_local_mehndi_cart', JSON.stringify(updated));
        window.dispatchEvent(new Event('satguru_cart_updated'));
      } catch {}
      return updated;
    });

    if (itemId.includes('diwali') || itemId.includes('offer')) {
      try {
        localStorage.removeItem('blindglow_diwali_free_gift');
        setDiwaliGift(null);
      } catch {}
    }

    if (user && !itemId.startsWith('diwali-') && !itemId.startsWith('temp-')) {
      try {
        await supabase
          .from('mehndi_cart_items')
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
    const service = item.service as MehndiService;
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
  const deliveryCharge = subtotal < 499 ? 399 : 0;
  const serviceCharge = 199;
  const total = Math.max(0, subtotal - discount + deliveryCharge + serviceCharge);
  const isFreeServiceEligible = subtotal >= 499;

  const handleProceedToCheckout = () => {
    if (!user) {
      toast({
        title: 'Sign In to Reserve Slot',
        description: 'Please sign in or create an account to finalize your Mehndi booking address & slot.',
      });
      navigate('/login?redirect=/mehndi-checkout');
      return;
    }
    navigate('/mehndi-checkout');
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#121015] text-[#342A29] dark:text-[#F7F3EE] transition-colors duration-300">
      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#FDF0F4] border border-[#F5DCE1] text-[#C83E68] shadow-sm">
                <Heart className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#342A29]">Mehndi Cart</h1>
                <p className="text-xs sm:text-sm text-[#7A6B69]">Manage your booked beauty & mehndi services</p>
              </div>
            </div>

            {/* Responsive Dual Cart Switcher */}
            <div className="flex items-center gap-1.5 p-1.5 bg-white/80 backdrop-blur rounded-2xl border border-[#F5DCE1] shadow-sm self-start sm:self-auto">
              <button
                onClick={() => navigate('/cart')}
                className="py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 text-[#7A6B69] hover:text-[#342A29] hover:bg-[#FDF0F4]"
              >
                <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#C83E68]" /> Doorstep Salon</span>
                {doorstepCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FDF0F4] text-[#C83E68]">
                    {doorstepCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate('/mehndi-cart')}
                className="py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 bg-[#C83E68] text-white shadow-sm"
              >
                <span className="flex items-center gap-1.5"><Palette className="w-3.5 h-3.5 text-white" /> Mehndi Art</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#C83E68]">
                  {cartItems.length}
                </span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin w-10 h-10 border-3 border-[#C83E68] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm font-medium text-[#7A6B69]">Loading your cart...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#F5DCE1] shadow-sm max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-[#FDF0F4] border border-[#F5DCE1] flex items-center justify-center mx-auto mb-4 text-[#C83E68]">
                <Palette className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#342A29] mb-1">Your Mehndi Cart is Empty</h3>
              <p className="text-sm text-[#7A6B69] mb-6">Explore our authentic bridal and party mehndi designs</p>
              {doorstepCount > 0 && (
                <div className="mb-6 p-4 rounded-2xl bg-[#FDF0F4] border border-[#F5DCE1]">
                  <p className="text-sm font-medium text-[#342A29] mb-2">
                    You have {doorstepCount} {doorstepCount === 1 ? 'item' : 'items'} in your Doorstep Salon Cart!
                  </p>
                  <Button onClick={() => navigate('/cart')} variant="outline" className="border-[#C83E68] text-[#C83E68] hover:bg-[#FDF0F4] rounded-xl text-xs">
                    View Salon Cart ({doorstepCount})
                  </Button>
                </div>
              )}
              <Button
                onClick={() => navigate('/mehndi-service')}
                className="w-full h-11 rounded-xl text-white font-semibold shadow-md hover:brightness-105"
                style={{ background: 'linear-gradient(135deg, #C83E68 0%, #A82E52 100%)' }}
              >
                Browse Mehndi Designs
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map(item => {
                  const service = item.service as MehndiService;
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-5 border border-[#F5DCE1] shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4"
                    >
                      {service.image_url && (
                        <img
                          src={service.image_url}
                          alt={service.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-[#F5DCE1] flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-base text-[#342A29] truncate">{service.name}</h3>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-[#FDF0F4] text-[#C83E68] border border-[#F5DCE1] mb-3">
                          {service.category}
                        </span>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 border border-[#F5DCE1] rounded-xl p-1 bg-[#FAF6F0]">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-[#342A29] transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-[#342A29]">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-[#342A29] transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-[#C83E68]">₹{service.price * item.quantity}</p>
                            <p className="text-xs text-[#7A6B69]">₹{service.price} each</p>
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
                <div className="bg-white rounded-3xl p-6 border border-[#F5DCE1] shadow-sm sticky top-28 space-y-5">
                  <h3 className="text-lg font-bold text-[#342A29] pb-3 border-b border-[#F5DCE1]">Order Summary</h3>

                  {/* Free Service Banner */}
                  {isFreeServiceEligible ? (
                    <div className="bg-[#FDF0F4] border border-[#F5DCE1] rounded-xl p-3">
                      <p className="text-xs font-semibold text-[#C83E68] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 flex-shrink-0" />
                        Congrats! You unlocked FREE doorstep service!
                      </p>
                    </div>
                  ) : (
                    <div className="bg-[#FCF9F5] border border-[#F5DCE1] rounded-xl p-3">
                      <p className="text-xs text-[#7A6B69]">
                        Add <strong className="text-[#C83E68]">₹{499 - subtotal}</strong> more to get FREE doorstep service
                      </p>
                    </div>
                  )}

                  {/* Coupon */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#342A29] uppercase tracking-wider">Promo Coupon</label>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 bg-[#FDF0F4] border border-[#F5DCE1] rounded-xl">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-[#C83E68]" />
                          <span className="font-bold text-xs text-[#C83E68]">{appliedCoupon.code}</span>
                        </div>
                        <button onClick={removeCoupon} className="text-xs font-semibold text-rose-600 hover:underline">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="bg-[#FCF9F5] border-[#F5DCE1] rounded-xl text-xs h-10 focus:ring-[#C83E68]"
                        />
                        <Button
                          onClick={applyCoupon}
                          disabled={applyingCoupon || !couponCode.trim()}
                          className="h-10 px-4 rounded-xl text-xs font-bold text-white shadow-sm"
                          style={{ background: 'linear-gradient(135deg, #C83E68 0%, #A82E52 100%)' }}
                        >
                          {applyingCoupon ? '...' : 'Apply'}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2.5 pt-3 border-t border-[#F5DCE1] text-sm">
                    <div className="flex justify-between text-[#7A6B69]">
                      <span>Subtotal</span>
                      <span className="font-semibold text-[#342A29]">₹{subtotal}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-[#C83E68]">
                        <span>Discount</span>
                        <span className="font-semibold">-₹{discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#7A6B69]">
                      <span>Service Charge</span>
                      <span className="font-semibold text-[#342A29]">₹{serviceCharge}</span>
                    </div>
                    {deliveryCharge > 0 && (
                      <div className="flex justify-between text-[#7A6B69]">
                        <span>Doorstep Delivery Charge</span>
                        <span className="font-semibold text-[#342A29]">₹{deliveryCharge}</span>
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
                    <ArrowRight className="w-4 h-4" />
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
