import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, User, DollarSign, CheckCircle, Loader2, Heart, Wallet, Tag, Star, Award, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
interface MehndiService {
  id: string;
  name: string;
  price: number;
}

interface MehndiCartItem {
  id: string;
  service_id: string;
  quantity: number;
  service?: MehndiService;
}

export function MehndiCheckout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [cartItems, setCartItems] = useState<MehndiCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.username || '',
    email: user?.email || '',
    phone: '',
    address: '',
    notes: '',
    paymentMethod: 'pay_later' as 'pay_now' | 'pay_later',
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [walletDiscount, setWalletDiscount] = useState(0);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
    fetchLoyaltyPoints();
    fetchWalletBalance();
  }, [user]);

  const fetchCart = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('mehndi_cart_items')
        .select(`
          *,
          service:mehndi_services(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast({
          title: 'Cart is Empty',
          description: 'Please add mehndi designs to cart first',
          variant: 'destructive',
        });
        navigate('/mehndi-service');
        return;
      }

      setCartItems(data);
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

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast({
            title: 'Location Captured',
            description: 'Your location has been saved',
          });
        },
        (error) => {
          toast({
            title: 'Location Error',
            description: 'Please enable location access or enter address manually',
            variant: 'destructive',
          });
        }
      );
    }
  };

  const fetchWalletBalance = async () => {
    if (!user) return;
    const { data } = await supabase.from('user_profiles').select('wallet_balance').eq('id', user.id).single();
    setWalletBalance(data?.wallet_balance || 0);
  };

  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  const fetchLoyaltyPoints = async () => {
    if (!user) return;
    const { data } = await supabase.from('loyalty_points').select('points').eq('user_id', user.id).single();
    setLoyaltyPoints(data?.points || 0);
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const service = item.service as MehndiService;
    return sum + (service?.price || 0) * item.quantity;
  }, 0);

  const deliveryCharge = subtotal < 499 ? 399 : 0;
  const serviceCharge = 199;
  const totalDiscount = discount + walletDiscount;
  const total = Math.max(0, subtotal + deliveryCharge + serviceCharge - totalDiscount);

  const toggleWallet = () => {
    if (!useWallet) {
      const base = subtotal + deliveryCharge + serviceCharge - discount;
      const maxW = Math.min(walletBalance, base);
      if (maxW <= 0) { toast({ title: 'Insufficient wallet balance', variant: 'destructive' }); return; }
      setWalletDiscount(maxW); setUseWallet(true);
      toast({ title: `Wallet applied! Saved ₹${maxW}` });
    } else { setWalletDiscount(0); setUseWallet(false); }
  };

  const applyCouponCode = async () => {
    if (!couponCode.trim()) {
      toast({ title: 'Error', description: 'Please enter a coupon code', variant: 'destructive' });
      return;
    }

    setCouponLoading(true);
    try {
      // Try daily coupons first
      const { data: dailyCoupon } = await supabase
        .from('daily_coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('active', true)
        .single();

      if (dailyCoupon) {
        const orderTotal = subtotal + deliveryCharge + serviceCharge;
        if (orderTotal < dailyCoupon.min_order_amount) {
          toast({
            title: 'Minimum Order Not Met',
            description: `Minimum order amount for this coupon is ₹${dailyCoupon.min_order_amount}`,
            variant: 'destructive',
          });
          return;
        }

        const discountAmount = Math.floor((orderTotal * dailyCoupon.discount_percentage) / 100);
        setDiscount(discountAmount);
        setAppliedCoupon(dailyCoupon);
        toast({
          title: 'Coupon Applied!',
          description: `You saved ₹${discountAmount} (${dailyCoupon.discount_percentage}% off)`,
        });
        return;
      }

      // Try regular coupons
      const { data: regularCoupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('active', true)
        .single();

      if (regularCoupon) {
        const orderTotal = subtotal + deliveryCharge + serviceCharge;
        if (orderTotal < regularCoupon.min_order_amount) {
          toast({
            title: 'Minimum Order Not Met',
            description: `Minimum order amount for this coupon is ₹${regularCoupon.min_order_amount}`,
            variant: 'destructive',
          });
          return;
        }

        const discountAmount = regularCoupon.discount_type === 'percentage'
          ? Math.floor((orderTotal * regularCoupon.discount_value) / 100)
          : regularCoupon.discount_value;
        
        setDiscount(Math.min(discountAmount, regularCoupon.max_discount || discountAmount));
        setAppliedCoupon(regularCoupon);
        toast({
          title: 'Coupon Applied!',
          description: `You saved ₹${discountAmount}`,
        });
        return;
      }

      toast({
        title: 'Invalid Coupon',
        description: 'Coupon code not found or expired',
        variant: 'destructive',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponCode('');
    toast({ title: 'Coupon Removed' });
  };

  const placeOrder = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      toast({
        title: 'Missing Information',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    setPlacing(true);
    try {
      const orderNumber = `MEHNDI${Date.now().toString().slice(-8)}`;

      const services = cartItems.map(item => {
        const service = item.service as MehndiService;
        return {
          service_id: service.id,
          name: service.name,
          price: service.price,
          quantity: item.quantity,
        };
      });

      const { data: order, error: orderError } = await supabase
        .from('mehndi_orders')
        .insert({
          user_id: user!.id,
          order_number: orderNumber,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          address: formData.address,
          latitude: location?.lat,
          longitude: location?.lng,
          services,
          subtotal: subtotal + serviceCharge + deliveryCharge,
          discount: totalDiscount,
          delivery_charge: deliveryCharge,
          service_charge: serviceCharge,
          total,
          coupon_code: appliedCoupon?.code || null,
          payment_method: formData.paymentMethod,
          payment_status: 'pending',
          status: 'pending',
          notes: formData.notes,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Deduct wallet
      if (useWallet && walletDiscount > 0) {
        const newBal = walletBalance - walletDiscount;
        await supabase.from('user_profiles').update({ wallet_balance: Math.max(0, newBal) }).eq('id', user!.id);
        await supabase.from('wallet_transactions').insert({ user_id: user!.id, amount: walletDiscount, type: 'debit', description: 'Used at checkout - Mehndi Order', reference_id: order.id, balance_after: Math.max(0, newBal) });
      }

      // Auto-assign nearest stylist
      try {
        const { data: stylists } = await supabase.from('stylist_requests').select('id, full_name, phone, rating, latitude, longitude').eq('status', 'approved').eq('is_active', true).not('latitude', 'is', null);
        if (stylists && stylists.length > 0 && location) {
          const scored = stylists.map(s => {
            const dLat = (location.lat - s.latitude) * Math.PI / 180;
            const dLng = (location.lng - s.longitude) * Math.PI / 180;
            const a = Math.sin(dLat/2)**2 + Math.cos(s.latitude*Math.PI/180)*Math.cos(location.lat*Math.PI/180)*Math.sin(dLng/2)**2;
            const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return { ...s, dist, score: (s.rating || 5) - dist * 0.1 };
          }).sort((a, b) => b.score - a.score);
          const best = scored[0];
          await supabase.from('mehndi_orders').update({ executive_id: best.id, executive_name: best.full_name, executive_phone: best.phone, status: 'executive_assigned' }).eq('id', order.id);
          await supabase.from('notifications').insert({ user_id: user!.id, title: 'Mehndi Expert Assigned!', message: `${best.full_name} will come to apply your mehndi.`, type: 'assignment', link: `/track-executive?order=${order.id}&type=mehndi` });
        }
      } catch (e) { console.error('Auto-assign:', e); }

      // Award loyalty points
      const points = Math.floor(total / 10);
      const { data: loyalty } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (loyalty) {
        await supabase
          .from('loyalty_points')
          .update({
            points: loyalty.points + points,
            lifetime_points: loyalty.lifetime_points + points,
          })
          .eq('user_id', user!.id);
      } else {
        await supabase
          .from('loyalty_points')
          .insert({
            user_id: user!.id,
            points,
            lifetime_points: points,
          });
      }

      await supabase
        .from('loyalty_transactions')
        .insert({
          user_id: user!.id,
          points,
          type: 'earned',
          reason: 'Mehndi order',
          reference_id: order.id,
        });

      // Clear cart
      await supabase
        .from('mehndi_cart_items')
        .delete()
        .eq('user_id', user!.id);

      toast({
        title: 'Mehndi Order Placed!',
        description: `Order #${orderNumber} confirmed. You earned ${points} loyalty points!`,
      });

      navigate('/profile');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setPlacing(false);
    }
  };

  if (!user || loading) return null;

  return (
    <div className="min-h-screen mt-20" style={{ background: '#FAF6F0' }}>
      <div className="container-custom max-w-6xl py-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#FDF0F4] border border-[#F5DCE1] text-[#C83E68] shadow-sm">
              <Heart className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold text-[#342A29]">Mehndi Checkout</h1>
              <p className="text-sm text-[#7A6B69]">Confirm your address and complete your booking</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Details */}
              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle>Contact Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        required
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          required
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          required
                          type="tel"
                          placeholder="+91 98871 96182"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address */}
              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle>Delivery Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Full Address *</Label>
                    <Textarea
                      required
                      placeholder="House no, Street, Landmark, City, State, Pincode"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button onClick={getLocation} variant="outline" className="w-full gap-2">
                    {location ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <MapPin className="w-4 h-4" />}
                    {location ? 'Location Captured' : 'Use My Current Location'}
                  </Button>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value as any }))}
                  >
                    <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="pay_later" id="pay_later" />
                      <Label htmlFor="pay_later" className="flex items-center gap-2 cursor-pointer flex-1">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium">Pay After Service</p>
                          <p className="text-sm text-muted-foreground">Pay cash/UPI to artist</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle>Special Instructions (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Any special requests (design preferences, timing, etc.)"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="card-luxury sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {cartItems.map(item => {
                      const service = item.service as MehndiService;
                      return (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{service.name} × {item.quantity}</span>
                          <span className="font-medium">₹{service.price * item.quantity}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Service Charge</span>
                      <span className="font-medium">₹{serviceCharge}</span>
                    </div>
                    {deliveryCharge > 0 ? (
                      <div className="flex justify-between text-sm text-orange-600">
                        <span>Delivery Charge</span>
                        <span className="font-medium">₹{deliveryCharge}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Delivery Charge</span>
                        <span className="font-medium flex items-center gap-1">
                          FREE <Check className="w-3.5 h-3.5 text-emerald-600 inline" />
                        </span>
                      </div>
                    )}
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600 font-semibold">
                        <span>Discount ({appliedCoupon?.code})</span>
                        <span>-₹{discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                      <span>Total</span>
                      <span className="text-primary">₹{total}</span>
                    </div>
                  </div>

                  {/* Wallet */}
                  {walletBalance > 0 && (
                    <div className="pt-3 border-t">
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2"><Wallet className="w-4 h-4 text-emerald-600" /><span className="text-sm font-medium">Wallet</span></div>
                          <Badge className="bg-emerald-100 text-emerald-800">₹{walletBalance}</Badge>
                        </div>
                        <button onClick={toggleWallet} className={`w-full text-xs py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${useWallet ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-300'}`}>
                          {useWallet ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Applied (-₹{walletDiscount})
                            </>
                          ) : (
                            `Use Wallet (save ₹${Math.min(walletBalance, subtotal + deliveryCharge + serviceCharge)})`
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Coupon Input */}
                  <div className="pt-4 border-t border-border">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div>
                          <p className="text-sm font-semibold text-green-800 flex items-center gap-1.5">
                            {appliedCoupon.code} Applied <Check className="w-3.5 h-3.5 text-green-700 inline" />
                          </p>
                          <p className="text-xs text-green-600">{appliedCoupon.description}</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={removeCoupon} className="text-red-600">
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="flex-1"
                        />
                        <Button
                          onClick={applyCouponCode}
                          disabled={couponLoading}
                          variant="outline"
                          size="sm"
                        >
                          {couponLoading ? 'Checking...' : 'Apply'}
                        </Button>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={placeOrder}
                    disabled={placing}
                    className="btn-primary w-full gap-2"
                  >
                    {placing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Place Order
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
      </div>
    </div>
  );
}
