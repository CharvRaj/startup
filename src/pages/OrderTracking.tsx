import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle, Clock, MapPin, User, Phone, Package,
  ArrowLeft, RefreshCw, Sparkles, Heart, Loader2, Navigation
} from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  status: string;
  total: number;
  executive_name?: string;
  executive_phone?: string;
  address: string;
  services: any[];
  created_at: string;
  updated_at: string;
  order_type: 'doorstep' | 'mehndi';
}

const TRACKING_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Package, color: 'text-blue-500', bg: 'bg-blue-100', description: 'Your order has been received' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-100', description: 'Order confirmed by salon' },
  { key: 'executive_assigned', label: 'Artist Assigned', icon: User, color: 'text-violet-500', bg: 'bg-violet-100', description: 'Beauty artist assigned to your order' },
  { key: 'on_the_way', label: 'On The Way', icon: Navigation, color: 'text-orange-500', bg: 'bg-orange-100', description: 'Artist is heading to your location' },
  { key: 'arrived', label: 'Arrived', icon: MapPin, color: 'text-pink-500', bg: 'bg-pink-100', description: 'Artist has arrived at your location' },
  { key: 'serviced', label: 'Completed', icon: Sparkles, color: 'text-primary', bg: 'bg-primary/10', description: 'Service completed successfully!' },
];

const STATUS_ORDER = ['pending', 'confirmed', 'executive_assigned', 'on_the_way', 'arrived', 'serviced'];

function getStepIndex(status: string) {
  const idx = STATUS_ORDER.indexOf(status);
  return idx === -1 ? 0 : idx;
}

export function OrderTracking() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadOrders();
    // Auto-refresh every 10 seconds
    pollingRef.current = setInterval(() => {
      refreshOrders();
    }, 10000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [doorstepRes, mehndiRes] = await Promise.all([
        supabase.from('doorstep_orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('mehndi_orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      const all: Order[] = [
        ...(doorstepRes.data || []).map(o => ({ ...o, order_type: 'doorstep' as const })),
        ...(mehndiRes.data || []).map(o => ({ ...o, order_type: 'mehndi' as const })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setOrders(all);
      if (all.length > 0 && !selectedOrder) setSelectedOrder(all[0]);
      else if (selectedOrder) {
        const updated = all.find(o => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const refreshOrders = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const [doorstepRes, mehndiRes] = await Promise.all([
        supabase.from('doorstep_orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('mehndi_orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      const all: Order[] = [
        ...(doorstepRes.data || []).map(o => ({ ...o, order_type: 'doorstep' as const })),
        ...(mehndiRes.data || []).map(o => ({ ...o, order_type: 'mehndi' as const })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setOrders(all);
      if (selectedOrder) {
        const updated = all.find(o => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
      setLastRefresh(new Date());
    } catch (e) { console.error(e); }
    finally { setRefreshing(false); }
  };

  const activeStepIndex = selectedOrder ? getStepIndex(selectedOrder.status) : 0;
  const isCancelled = selectedOrder?.status === 'cancelled';

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/30 via-white to-violet-50/30 mt-20">
      <div className="container-custom max-w-6xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-pink-600 flex items-center justify-center">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold gradient-text">Live Order Tracking</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${refreshing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`}></span>
                Auto-refreshes every 10s · Last: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={refreshOrders} variant="outline" size="sm" disabled={refreshing}>
              {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
            <Button onClick={() => navigate('/profile')} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-24">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <Card className="card-luxury text-center py-20">
            <CardContent>
              <Package className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
              <p className="text-muted-foreground mb-6">Place a doorstep or mehndi order to track it here</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate('/doorstep-service')} className="btn-primary">Doorstep Services</Button>
                <Button onClick={() => navigate('/mehndi-service')} variant="outline">Mehndi Services</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders List */}
            <div className="lg:col-span-1 space-y-3">
              <h2 className="font-semibold text-lg mb-4">Your Orders</h2>
              {orders.map(order => (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                    selectedOrder?.id === order.id
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                      : 'border-border bg-white hover:border-primary/40 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">#{order.order_number}</span>
                    <Badge className={`text-xs ${
                      order.status === 'serviced' ? 'bg-emerald-100 text-emerald-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      order.status === 'on_the_way' ? 'bg-orange-100 text-orange-800' :
                      'bg-violet-100 text-violet-800'
                    }`}>
                      {order.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {order.order_type === 'mehndi' ? '🎨 Mehndi' : '🏠 Doorstep'} · ₹{order.total}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </button>
              ))}
            </div>

            {/* Tracking Detail */}
            <div className="lg:col-span-2 space-y-6">
              {selectedOrder && (
                <>
                  {/* Order Info Card */}
                  <Card className="card-luxury overflow-hidden">
                    <div className={`h-2 ${
                      selectedOrder.status === 'serviced' ? 'bg-gradient-to-r from-emerald-400 to-green-500' :
                      selectedOrder.status === 'cancelled' ? 'bg-gradient-to-r from-red-400 to-red-500' :
                      selectedOrder.status === 'on_the_way' ? 'bg-gradient-to-r from-orange-400 to-amber-500' :
                      'bg-gradient-to-r from-primary to-pink-500'
                    }`} />
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-xl">#{selectedOrder.order_number}</h3>
                            <Badge variant="outline" className={selectedOrder.order_type === 'mehndi' ? 'border-rose-300 text-rose-700' : 'border-teal-300 text-teal-700'}>
                              {selectedOrder.order_type === 'mehndi' ? '🎨 Mehndi' : '🏠 Doorstep'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {selectedOrder.address}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-primary">₹{selectedOrder.total}</p>
                          <p className="text-xs text-muted-foreground">{new Date(selectedOrder.created_at).toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      {/* Services */}
                      {Array.isArray(selectedOrder.services) && selectedOrder.services.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {selectedOrder.services.map((s: any, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {s.name} × {s.quantity}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Executive Info */}
                      {selectedOrder.executive_name && (
                        <div className="mt-4 p-3 bg-violet-50 border border-violet-200 rounded-xl flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-violet-900">{selectedOrder.executive_name}</p>
                            <p className="text-sm text-violet-700 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {selectedOrder.executive_phone}
                            </p>
                          </div>
                          <a
                            href={`tel:${selectedOrder.executive_phone}`}
                            className="ml-auto bg-violet-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
                          >
                            Call
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Animated Timeline */}
                  <Card className="card-luxury">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        {isCancelled ? 'Order Cancelled' : 'Live Tracking Timeline'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isCancelled ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">❌</span>
                          </div>
                          <p className="text-red-600 font-semibold text-lg">Order has been cancelled</p>
                          <p className="text-muted-foreground text-sm mt-1">Please contact us for support</p>
                        </div>
                      ) : (
                        <div className="relative">
                          {/* Progress bar background */}
                          <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200 rounded-full" />
                          {/* Progress bar fill */}
                          <div
                            className="absolute left-6 top-6 w-0.5 bg-gradient-to-b from-primary to-pink-500 rounded-full transition-all duration-1000"
                            style={{ height: `${(activeStepIndex / (TRACKING_STEPS.length - 1)) * 100}%` }}
                          />

                          <div className="space-y-0">
                            {TRACKING_STEPS.map((step, idx) => {
                              const isCompleted = idx <= activeStepIndex;
                              const isCurrent = idx === activeStepIndex;
                              const Icon = step.icon;

                              return (
                                <div key={step.key} className="relative flex items-start gap-4 pb-8 last:pb-0">
                                  {/* Step Icon */}
                                  <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 flex-shrink-0 ${
                                    isCompleted ? `${step.bg} shadow-lg` : 'bg-gray-100'
                                  } ${isCurrent ? 'ring-4 ring-primary/30 scale-110' : ''}`}>
                                    <Icon className={`w-5 h-5 ${isCompleted ? step.color : 'text-gray-300'}`} />
                                    {isCurrent && (
                                      <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                                    )}
                                  </div>

                                  {/* Step Content */}
                                  <div className={`flex-1 pt-2 transition-all duration-500 ${
                                    isCompleted ? 'opacity-100' : 'opacity-40'
                                  }`}>
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <p className={`font-semibold ${isCurrent ? 'text-primary text-lg' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {step.label}
                                      </p>
                                      {isCurrent && (
                                        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs animate-pulse">
                                          Current
                                        </Badge>
                                      )}
                                      {isCompleted && !isCurrent && (
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                      )}
                                    </div>
                                    <p className={`text-sm ${isCurrent ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
                                      {step.description}
                                    </p>
                                    {isCurrent && step.key === 'on_the_way' && selectedOrder.executive_name && (
                                      <div className="mt-2 flex items-center gap-2 text-orange-600">
                                        <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></span>
                                        <span className="text-xs font-medium">{selectedOrder.executive_name} is on the way!</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Progress Summary */}
                  {!isCancelled && (
                    <div className="bg-gradient-to-r from-primary/10 via-pink-50 to-violet-50 rounded-2xl p-5 border border-primary/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold">Overall Progress</span>
                        <span className="font-bold text-primary">
                          {Math.round((activeStepIndex / (TRACKING_STEPS.length - 1)) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-white/60 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-pink-500 rounded-full transition-all duration-1000 relative"
                          style={{ width: `${(activeStepIndex / (TRACKING_STEPS.length - 1)) * 100}%` }}
                        >
                          <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />
                        </div>
                      </div>
                      {selectedOrder.status === 'serviced' && (
                        <div className="mt-3 text-center">
                          <p className="text-emerald-700 font-semibold flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Service completed! Thank you for choosing us ✨
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
