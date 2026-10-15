import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, User, CreditCard, DollarSign, CheckCircle, Loader2, Gift, Tag, Star, Award, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import type { CartItem, DoorstepService } from '@/types';

export function Checkout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [todayCoupon, setTodayCoupon] = useState<any>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [walletDiscount, setWalletDiscount] = useState(0);
  const [formData, setFormData] = useState({
    name: user?.username || '',
    email: user?.email || '',
    phone: '',
    address: '',
    notes: '',
    paymentMethod: 'pay_later' as 'pay_now' | 'pay_later',
  });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchCart();
    fetchLoyaltyPoints();
    fetchTodayCoupon();
    fetchWalletBalance();
  }, [user]);

  const fetchCart = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('cart_items').select('*, service:doorstep_services(*)').eq('user_id', user.id);
      if (error) throw error;
      if (!data || data.length === 0) { navigate('/doorstep-service'); return; }
      setCartItems(data);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const fetchLoyaltyPoints = async () => {
    if (!user) return;
    const { data } = await supabase.from('loyalty_points').select('points').eq('user_id', user.id).single();
    setLoyaltyPoints(data?.points || 0);
  };

  const fetchWalletBalance = async () => {
    if (!user) return;
    const { data } = await supabase.from('user_profiles').select('wallet_balance').eq('id', user.id).single();
    setWalletBalance(data?.wallet_balance || 0);
  };

  const fetchTodayCoupon = async () => {
    const day = new Date().getDate();
    const { data } = await supabase.from('daily_coupons').select('*').eq('day_of_month', day).eq('active', true).single();
    setTodayCoupon(data || null);
  };

  const getLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); toast({ title: '📍 Location Captured!' }); },
      () => toast({ title: 'Location Error', description: 'Please enable location access', variant: 'destructive' })
    );
  };

  const subtotal = cartItems.reduce((sum, item) => sum + ((item.service as DoorstepService)?.price || 0) * item.quantity, 0);
  const deliveryCharge = subtotal < 499 ? 39 : 0;
  const baseTotal = subtotal + deliveryCharge;
  const totalDiscount = couponDiscount + pointsDiscount + walletDiscount;
  const total = Math.max(0, baseTotal - totalDiscount);
  const pointsEarnable = Math.floor(total / 10);

  const applyCoupon = async () => {
    if (!couponCode.trim()) { toast({ title: 'Enter coupon code', variant: 'destructive' }); return; }
    setCouponLoading(true);
    try {
      // Check daily coupon
      const { data: daily } = await supabase.from('daily_coupons').select('*').eq('code', couponCode.toUpperCase()).eq('active', true).single();
      if (daily) {
        if (baseTotal < daily.min_order_amount) { toast({ title: `Min order ₹${daily.min_order_amount}`, variant: 'destructive' }); return; }
        const disc = Math.floor(baseTotal * daily.discount_percentage / 100);
        setCouponDiscount(disc); setAppliedCoupon(daily);
        toast({ title: `🎉 ${disc}% Off Applied! Saved ₹${disc}` }); return;
      }
      // Check regular coupon
      const { data: reg } = await supabase.from('coupons').select('*').eq('code', couponCode.toUpperCase()).eq('active', true).single();
      if (reg) {
        if (baseTotal < reg.min_order_amount) { toast({ title: `Min order ₹${reg.min_order_amount}`, variant: 'destructive' }); return; }
        const disc = reg.discount_type === 'percentage' ? Math.floor(baseTotal * reg.discount_value / 100) : reg.discount_value;
        const finalDisc = Math.min(disc, reg.max_discount || disc);
        setCouponDiscount(finalDisc); setAppliedCoupon(reg);
        toast({ title: `🎉 Coupon Applied! Saved ₹${finalDisc}` }); return;
      }
      toast({ title: 'Invalid coupon code', variant: 'destructive' });
    } finally { setCouponLoading(false); }
  };

  const removeCoupon = () => { setCouponDiscount(0); setAppliedCoupon(null); setCouponCode(''); };

  const toggleWallet = () => {
    if (!useWallet) {
      const maxWalletUse = Math.min(walletBalance, baseTotal - couponDiscount - pointsDiscount);
      if (maxWalletUse <= 0) { toast({ title: 'Insufficient wallet balance', variant: 'destructive' }); return; }
      setWalletDiscount(maxWalletUse); setUseWallet(true);
      toast({ title: `✅ Wallet applied! Saves ₹${maxWalletUse}` });
    } else { setWalletDiscount(0); setUseWallet(false); }
  };

  const togglePoints = () => {
    if (!usePoints) {
      const maxDisc = Math.min(loyaltyPoints, Math.floor(baseTotal * 0.2));
      setPointsDiscount(maxDisc); setUsePoints(true);
      toast({ title: `✅ Using ${maxDisc} points (saves ₹${maxDisc})` });
    } else { setPointsDiscount(0); setUsePoints(false); }
  };

  const placeOrder = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      toast({ title: 'Fill all required fields', variant: 'destructive' }); return;
    }
    setPlacing(true);
    try {
      const orderNumber = `DS${Date.now().toString().slice(-8)}`;
      const services = cartItems.map(item => {
        const s = item.service as DoorstepService;
        return { service_id: s.id, name: s.name, price: s.price, quantity: item.quantity };
      });
      const { data: order, error } = await supabase.from('doorstep_orders').insert({
        user_id: user!.id, order_number: orderNumber,
        customer_name: formData.name, customer_email: formData.email, customer_phone: formData.phone,
        address: formData.address, latitude: location?.lat, longitude: location?.lng,
        services, subtotal, discount: totalDiscount, total,
        coupon_code: appliedCoupon?.code || null,
        payment_method: formData.paymentMethod, payment_status: 'pending', status: 'pending',
        notes: formData.notes,
      }).select().single();
      if (error) throw error;

      // Deduct from wallet if used
      if (useWallet && walletDiscount > 0) {
        const newBal = walletBalance - walletDiscount;
        await supabase.from('user_profiles').update({ wallet_balance: Math.max(0, newBal) }).eq('id', user!.id);
        await supabase.from('wallet_transactions').insert({ user_id: user!.id, amount: walletDiscount, type: 'debit', description: 'Used at checkout - Doorstep Order', reference_id: order.id, balance_after: Math.max(0, newBal) });
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
          await supabase.from('doorstep_orders').update({ executive_id: best.id, executive_name: best.full_name, executive_phone: best.phone, status: 'executive_assigned' }).eq('id', order.id);
          await supabase.from('notifications').insert({ user_id: user!.id, title: '👩‍🎨 Expert Assigned!', message: `${best.full_name} has been assigned to your order. They will contact you soon.`, type: 'assignment', link: `/track-executive?order=${order.id}&type=doorstep` });
        }
      } catch (assignErr) { console.error('Auto-assign:', assignErr); }

      // Loyalty points update
      try {
        const { data: lp } = await supabase.from('loyalty_points').select('*').eq('user_id', user!.id).single();
        const newPoints = (lp?.points || 0) - (usePoints ? pointsDiscount : 0) + pointsEarnable;
        const newLifetime = (lp?.lifetime_points || 0) + pointsEarnable;
        if (lp) {
          await supabase.from('loyalty_points').update({ points: Math.max(0, newPoints), lifetime_points: newLifetime, updated_at: new Date().toISOString() }).eq('user_id', user!.id);
        } else {
          await supabase.from('loyalty_points').insert({ user_id: user!.id, points: pointsEarnable, lifetime_points: pointsEarnable });
        }
        await supabase.from('loyalty_transactions').insert({ user_id: user!.id, points: pointsEarnable, type: 'earned', reason: 'Doorstep order', reference_id: order.id });
        if (usePoints && pointsDiscount > 0) {
          await supabase.from('loyalty_transactions').insert({ user_id: user!.id, points: -pointsDiscount, type: 'redeemed', reason: 'Redeemed at checkout', reference_id: order.id });
        }
      } catch (lpErr) { console.error('Loyalty points:', lpErr); }

      // Clear cart
      await supabase.from('cart_items').delete().eq('user_id', user!.id);
      toast({ title: '🎉 Order Placed!', description: `Order #${orderNumber} confirmed! You earned ${pointsEarnable} loyalty points!` });
      navigate('/profile');
    } catch (e: any) {
      toast({ title: 'Order Failed', description: e.message, variant: 'destructive' });
    } finally { setPlacing(false); }
  };

  if (!user || loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-white to-pink-50/50 mt-20">
      <div className="container-custom max-w-6xl py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold gradient-text mb-2">Checkout</h1>
          <p className="text-muted-foreground">Complete your doorstep service order</p>
        </div>

        {/* Today's Coupon Banner */}
        {todayCoupon && !appliedCoupon && (
          <div className="mb-6 p-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl text-white flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Gift className="w-8 h-8 animate-bounce" />
              <div>
                <p className="font-bold text-lg">Today's Special: {todayCoupon.discount_percentage}% OFF!</p>
                <p className="text-white/80 text-sm">{todayCoupon.description}</p>
              </div>
            </div>
            <Button onClick={() => { setCouponCode(todayCoupon.code); }} className="bg-white text-purple-600 hover:bg-gray-100 font-bold">
              Use Code: {todayCoupon.code}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-5">
            {/* Contact */}
            <Card className="card-luxury">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-primary" /> Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Your name" className="pl-10 input-luxury" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" className="pl-10 input-luxury" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Phone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="tel" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" className="pl-10 input-luxury" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card className="card-luxury">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5 text-primary" /> Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Full Address *</Label>
                  <Textarea value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} placeholder="House no, Street, Landmark, City, State, Pincode" className="min-h-[90px] input-luxury" />
                </div>
                <Button onClick={getLocation} variant="outline" className="w-full gap-2 border-dashed">
                  <MapPin className="w-4 h-4" />
                  {location ? '✅ Location Captured' : '📍 Use My Current Location'}
                </Button>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card className="card-luxury">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="w-5 h-5 text-primary" /> Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={formData.paymentMethod} onValueChange={v => setFormData(p => ({ ...p, paymentMethod: v as any }))}>
                  <div className="flex items-center space-x-3 p-4 border-2 border-emerald-200 bg-emerald-50 rounded-xl cursor-pointer">
                    <RadioGroupItem value="pay_later" id="pay_later" />
                    <Label htmlFor="pay_later" className="flex items-center gap-3 cursor-pointer flex-1">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="font-semibold">Pay After Service</p>
                        <p className="text-sm text-muted-foreground">Cash or UPI to executive on arrival</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="card-luxury">
              <CardContent className="pt-5">
                <Label className="text-sm font-medium mb-1.5 block">Special Instructions (Optional)</Label>
                <Textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} placeholder="Any special requests..." />
              </CardContent>
            </Card>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
            <Card className="card-luxury sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-2">
                  {cartItems.map(item => {
                    const s = item.service as DoorstepService;
                    return (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{s?.name} × {item.quantity}</span>
                        <span className="font-medium">₹{(s?.price || 0) * item.quantity}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Pricing breakdown */}
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {deliveryCharge > 0 ? (
                    <div className="flex justify-between text-sm text-orange-600">
                      <span>Delivery charge</span>
                      <span>₹{deliveryCharge}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Delivery charge</span>
                      <span>FREE ✓</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600 font-medium">
                      <span>Coupon ({appliedCoupon?.code})</span>
                      <span>-₹{couponDiscount}</span>
                    </div>
                  )}
                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-sm text-violet-600 font-medium">
                      <span>Loyalty points</span>
                      <span>-₹{pointsDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">₹{total}</span>
                  </div>
                  <p className="text-xs text-emerald-600">You'll earn {pointsEarnable} loyalty points! 🌟</p>
                </div>

                {/* Coupon */}
                <div className="border-t pt-3">
                  <p className="text-sm font-medium mb-2 flex items-center gap-1"><Tag className="w-4 h-4 text-primary" />Coupon Code</p>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-emerald-800">{appliedCoupon.code} ✓</p>
                        <p className="text-xs text-emerald-600">Saved ₹{couponDiscount}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={removeCoupon} className="text-red-500 h-7 text-xs">Remove</Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input placeholder="WELCOME10" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} className="flex-1 text-sm" />
                      <Button onClick={applyCoupon} disabled={couponLoading} size="sm" variant="outline">
                        {couponLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Apply'}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Wallet Balance */}
                {walletBalance > 0 && (
                  <div className="border-t pt-3">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2"><Wallet className="w-4 h-4 text-emerald-600" /><span className="text-sm font-medium">Wallet Balance</span></div>
                        <Badge className="bg-emerald-100 text-emerald-800">₹{walletBalance}</Badge>
                      </div>
                      <Button size="sm" onClick={toggleWallet}
                        className={`w-full text-xs ${useWallet ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'}`}
                        variant={useWallet ? 'default' : 'outline'}>
                        <Wallet className="w-3 h-3 mr-1" />{useWallet ? `✓ Wallet applied (-₹${walletDiscount})` : `Use wallet (save up to ₹${Math.min(walletBalance, baseTotal)})`}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Loyalty Points */}
                {loyaltyPoints > 0 && (
                  <div className="border-t pt-3">
                    <div className="p-3 bg-violet-50 border border-violet-200 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-violet-600" />
                          <span className="text-sm font-medium">Loyalty Points</span>
                        </div>
                        <Badge className="bg-violet-100 text-violet-800">{loyaltyPoints} pts</Badge>
                      </div>
                      <Button size="sm" onClick={togglePoints}
                        className={`w-full text-xs ${usePoints ? 'bg-violet-600 hover:bg-violet-700 text-white' : 'bg-violet-50 text-violet-700 border border-violet-300 hover:bg-violet-100'}`}
                        variant={usePoints ? 'default' : 'outline'}>
                        <Award className="w-3 h-3 mr-1" />{usePoints ? `✓ Using ${pointsDiscount} points (saves ₹${pointsDiscount})` : `Use points to save up to ₹${Math.min(loyaltyPoints, Math.floor(baseTotal * 0.2))}`}
                      </Button>
                    </div>
                  </div>
                )}

                <Button onClick={placeOrder} disabled={placing} className="btn-primary w-full gap-2 h-12">
                  {placing ? <><Loader2 className="w-4 h-4 animate-spin" />Placing Order...</> : <><CheckCircle className="w-4 h-4" />Place Order</>}
                </Button>
                <p className="text-xs text-muted-foreground text-center">Secure checkout · No hidden charges</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
