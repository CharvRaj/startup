import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Tag, Sparkles, Heart } from 'lucide-react';
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

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    if (!user) return;

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

      if (msResult.error) throw msResult.error;
      setCartItems(msResult.data || []);
      setDoorstepCount(dsResult.count || 0);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(itemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('mehndi_cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) throw error;
      await fetchCart();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('mehndi_cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      await fetchCart();
      toast({
        title: 'Removed from Cart',
        description: 'Item removed successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
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
        title: 'Coupon Applied! 🎉',
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

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="section-padding bg-gradient-bg mt-20">
        <div className="container-custom max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-primary animate-pulse" />
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold gradient-text">Mehndi Cart</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Manage your booked beauty & mehndi services</p>
              </div>
            </div>

            {/* Responsive Dual Cart Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-muted/60 dark:bg-muted/30 backdrop-blur rounded-2xl border border-border/60 self-start sm:self-auto">
              <button
                onClick={() => navigate('/cart')}
                className="py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-background/40"
              >
                <span>💇‍♀️ Doorstep Salon</span>
                {doorstepCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary text-secondary-foreground">
                    {doorstepCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate('/mehndi-cart')}
                className="py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 bg-background text-foreground shadow-sm border border-border/40"
              >
                <span>🎨 Mehndi Art</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary text-white">
                  {cartItems.length}
                </span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading cart...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <Card className="card-luxury text-center py-12">
              <CardContent>
                <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Your Mehndi Art cart is empty</p>
                {doorstepCount > 0 && (
                  <div className="mb-6 p-4 rounded-2xl bg-primary/5 border border-primary/20 max-w-md mx-auto">
                    <p className="text-sm font-medium text-foreground mb-3">
                      You have {doorstepCount} {doorstepCount === 1 ? 'item' : 'items'} in your Doorstep Salon Cart!
                    </p>
                    <Button onClick={() => navigate('/cart')} variant="outline" className="text-primary border-primary/40 hover:bg-primary/10">
                      View Salon Cart ({doorstepCount})
                    </Button>
                  </div>
                )}
                <Button onClick={() => navigate('/mehndi-service')} className="btn-primary">
                  Browse Mehndi Designs
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map(item => {
                  const service = item.service as MehndiService;
                  return (
                    <Card key={item.id} className="card-luxury hover:shadow-xl transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {service.image_url && (
                            <img
                              src={service.image_url}
                              alt={service.name}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-lg">{service.name}</h3>
                                <Badge variant="outline" className="mt-1">{service.category}</Badge>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFromCart(item.id)}
                                className="text-destructive hover:text-destructive"
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
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="w-12 text-center font-semibold">{item.quantity}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-primary">₹{service.price * item.quantity}</p>
                                <p className="text-sm text-muted-foreground">₹{service.price} each</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="card-luxury sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Free Service Banner */}
                    {isFreeServiceEligible && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Congrats! You get FREE doorstep service 🎉
                        </p>
                      </div>
                    )}

                    {!isFreeServiceEligible && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          Add ₹{499 - subtotal} more to get FREE doorstep service
                        </p>
                      </div>
                    )}

                    {/* Coupon */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Have a Coupon?</label>
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-green-800">{appliedCoupon.code}</span>
                          </div>
                          <Button size="sm" variant="ghost" onClick={removeCoupon}>
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="input-luxury"
                          />
                          <Button
                            onClick={applyCoupon}
                            disabled={applyingCoupon || !couponCode.trim()}
                            variant="outline"
                          >
                            {applyingCoupon ? 'Applying...' : 'Apply'}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-2 pt-4 border-t border-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">₹{subtotal}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount</span>
                          <span className="font-medium">-₹{discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Service Charge</span>
                        <span className="font-medium">₹{serviceCharge}</span>
                      </div>
                      {deliveryCharge > 0 && (
                        <div className="flex justify-between text-sm text-orange-600">
                          <span>Delivery Charge</span>
                          <span className="font-medium">₹{deliveryCharge}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                        <span>Total</span>
                        <span className="text-primary">₹{total}</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => navigate('/mehndi-checkout')}
                      className="btn-primary w-full gap-2"
                    >
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
