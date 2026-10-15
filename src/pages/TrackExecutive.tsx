import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Phone, Loader2, Navigation, RefreshCw,
  MessageSquare, Star, Package
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Chat } from '@/components/Chat';

const STATUS_FLOW = [
  { key: 'pending', label: 'Order Placed', icon: '📋', desc: 'Your order has been placed' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅', desc: 'Order confirmed by salon' },
  { key: 'executive_assigned', label: 'Expert Assigned', icon: '👩‍🎨', desc: 'Beauty expert has been assigned' },
  { key: 'on_the_way', label: 'On The Way', icon: '🚗', desc: 'Your expert is coming to you' },
  { key: 'arrived', label: 'Arrived', icon: '📍', desc: 'Expert has arrived at your location' },
  { key: 'serviced', label: 'Service Done', icon: '🌸', desc: 'Service completed successfully' },
];

export function TrackExecutive() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order');
  const orderType = searchParams.get('type') || 'doorstep';

  const [order, setOrder] = useState<any>(null);
  const [executive, setExecutive] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const customerMarkerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!orderId) { navigate('/profile'); return; }
    loadOrder();
    intervalRef.current = setInterval(loadOrder, 15000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [orderId]);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
    return () => {
      try { document.head.removeChild(link); document.head.removeChild(script); } catch {}
    };
  }, []);

  useEffect(() => {
    if (mapLoaded && order && mapContainerRef.current && !mapRef.current) initMap();
  }, [mapLoaded, order]);

  useEffect(() => {
    if (executive?.latitude && executive?.longitude && mapRef.current) {
      updateMarker(executive.latitude, executive.longitude);
    }
  }, [executive]);

  const loadOrder = async () => {
    const table = orderType === 'mehndi' ? 'mehndi_orders' : 'doorstep_orders';
    const { data } = await supabase.from(table).select('*').eq('id', orderId).single();
    if (!data) { setLoading(false); return; }
    setOrder(data);
    setLastUpdate(new Date());
    if (data.executive_id) {
      const { data: exec } = await supabase.from('stylist_requests')
        .select('id, full_name, phone, rating, latitude, longitude, last_location_update, specialization')
        .eq('id', data.executive_id).single();
      setExecutive(exec);
    } else if (data.executive_name) {
      setExecutive({ full_name: data.executive_name, phone: data.executive_phone });
    }
    setLoading(false);
  };

  const initMap = () => {
    if (!(window as any).L || !mapContainerRef.current) return;
    const L = (window as any).L;
    const lat = order?.latitude || 28.6139;
    const lng = order?.longitude || 77.2090;
    mapRef.current = L.map(mapContainerRef.current, { center: [lat, lng], zoom: 14 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(mapRef.current);
    if (order?.latitude && order?.longitude) {
      const custIcon = L.divIcon({ className: '', html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#be185d,#ec4899);border-radius:50%;border:3px solid white;box-shadow:0 4px 15px rgba(190,24,93,0.4);display:flex;align-items:center;justify-content:center;font-size:16px;">🏠</div>`, iconSize: [36,36], iconAnchor: [18,18] });
      customerMarkerRef.current = L.marker([order.latitude, order.longitude], { icon: custIcon }).addTo(mapRef.current).bindPopup('<b>Your Location</b>');
    }
    if (executive?.latitude && executive?.longitude) updateMarker(executive.latitude, executive.longitude);
  };

  const updateMarker = (lat: number, lng: number) => {
    if (!(window as any).L || !mapRef.current) return;
    const L = (window as any).L;
    const execIcon = L.divIcon({ className: '', html: `<div style="width:42px;height:42px;background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:50%;border:3px solid white;box-shadow:0 4px 20px rgba(124,58,237,0.5);display:flex;align-items:center;justify-content:center;font-size:18px;">👩‍🎨</div>`, iconSize: [42,42], iconAnchor: [21,21] });
    if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
    else markerRef.current = L.marker([lat, lng], { icon: execIcon }).addTo(mapRef.current).bindPopup(`<b>${executive?.full_name || 'Your Expert'}</b>`);
    if (routeLayerRef.current) mapRef.current.removeLayer(routeLayerRef.current);
    if (order?.latitude && order?.longitude) {
      routeLayerRef.current = L.polyline([[lat, lng], [order.latitude, order.longitude]], { color: '#7c3aed', weight: 3, dashArray: '10, 10', opacity: 0.8 }).addTo(mapRef.current);
      mapRef.current.fitBounds([[lat, lng], [order.latitude, order.longitude]], { padding: [50, 50] });
    } else {
      mapRef.current.setView([lat, lng], 15);
    }
  };

  const calcDistance = () => {
    if (!executive?.latitude || !executive?.longitude || !order?.latitude || !order?.longitude) return null;
    const R = 6371;
    const dLat = (order.latitude - executive.latitude) * Math.PI / 180;
    const dLng = (order.longitude - executive.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(executive.latitude * Math.PI/180) * Math.cos(order.latitude * Math.PI/180) * Math.sin(dLng/2)**2;
    const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;
  };

  const currentStatusIdx = STATUS_FLOW.findIndex(s => s.key === order?.status);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0a0614,#150b22)' }}>
      <Loader2 className="w-12 h-12 animate-spin text-violet-400" />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0a0614,#150b22)' }}>
      <div className="text-center">
        <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <p className="text-white/60">Order not found</p>
        <button onClick={() => navigate('/profile')} className="mt-4 text-violet-400">← Back to Profile</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg,#0a0614,#150b22,#0a1020)' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 px-4 py-3" style={{ background: 'rgba(10,6,20,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(124,58,237,0.2)' }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/profile')} className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="text-white font-bold text-sm">Live Tracking</p>
              <p className="text-white/40 text-xs">#{order.order_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(executive || order.executive_name) && (
              <button onClick={() => setShowChat(prev => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{ background: showChat ? 'rgba(124,58,237,0.4)' : 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#c4b5fd' }}>
                <MessageSquare className="w-3.5 h-3.5" />Chat
              </button>
            )}
            <button onClick={loadOrder} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white/50 hover:bg-white/10">
              <RefreshCw className="w-3.5 h-3.5" />
              {Math.round((Date.now() - lastUpdate.getTime()) / 1000)}s
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Status Banner */}
        <div className="rounded-3xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.4),rgba(190,24,93,0.3))', border: '1px solid rgba(124,58,237,0.4)' }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(#7c3aed,transparent)' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{STATUS_FLOW[currentStatusIdx]?.icon || '📋'}</span>
              <div>
                <h2 className="text-white font-bold text-xl">{STATUS_FLOW[currentStatusIdx]?.label || order.status}</h2>
                <p className="text-white/60 text-sm">{STATUS_FLOW[currentStatusIdx]?.desc || ''}</p>
              </div>
            </div>
            {calcDistance() && order.status === 'on_the_way' && (
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 w-fit">
                <Navigation className="w-4 h-4 text-violet-300" />
                <span className="text-white font-semibold text-sm">{calcDistance()} away</span>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="text-white font-semibold mb-4 text-sm">Order Progress</h3>
          {STATUS_FLOW.map((step, idx) => {
            const done = idx < currentStatusIdx;
            const active = idx === currentStatusIdx;
            return (
              <div key={step.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${done ? 'bg-emerald-500 text-white' : active ? 'bg-violet-500 text-white animate-pulse' : 'bg-white/10 text-white/30'}`}>
                    {done ? '✓' : step.icon}
                  </div>
                  {idx < STATUS_FLOW.length - 1 && <div className={`w-0.5 h-7 my-1 ${done ? 'bg-emerald-500' : 'bg-white/10'}`} />}
                </div>
                <div className="pb-4">
                  <p className={`text-sm font-semibold ${active ? 'text-violet-300' : done ? 'text-white' : 'text-white/30'}`}>{step.label}</p>
                  {active && <p className="text-white/50 text-xs mt-0.5">{step.desc}</p>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Map */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-2 px-4 py-3" style={{ background: 'rgba(124,58,237,0.2)' }}>
            <MapPin className="w-4 h-4 text-violet-400" />
            <span className="text-white font-semibold text-sm">Live Location Map</span>
            {executive?.last_location_update && (
              <span className="ml-auto text-white/40 text-xs">{new Date(executive.last_location_update).toLocaleTimeString('en-IN')}</span>
            )}
          </div>
          <div ref={mapContainerRef} style={{ height: '280px', background: '#1a1a2e' }}>
            {!mapLoaded && <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-violet-400" /></div>}
            {mapLoaded && !executive?.latitude && (
              <div className="h-full flex items-center justify-center" style={{ background: '#1a1a2e' }}>
                <div className="text-center p-6">
                  <MapPin className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">Live map visible once expert is on the way</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Executive Card */}
        {(executive || order.executive_name) && (
          <div className="rounded-2xl p-5" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>👩‍🎨</div>
              <div className="flex-1">
                <p className="text-white font-bold text-lg">{executive?.full_name || order.executive_name}</p>
                {executive?.specialization && <p className="text-violet-300 text-sm">{executive.specialization}</p>}
                {executive?.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className={`w-3 h-3 ${i <= Math.round(executive.rating) ? 'fill-amber-400 text-amber-400' : 'text-white/20'}`} />)}
                    <span className="text-white/50 text-xs ml-1">{executive.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {(executive?.phone || order.executive_phone) && (
                  <a href={`tel:${executive?.phone || order.executive_phone}`}
                    className="w-11 h-11 rounded-xl flex items-center justify-center hover:scale-110 transition-all"
                    style={{ background: 'rgba(52,211,153,0.2)', border: '1px solid rgba(52,211,153,0.4)' }}>
                    <Phone className="w-5 h-5 text-emerald-400" />
                  </a>
                )}
                <button onClick={() => setShowChat(prev => !prev)}
                  className="w-11 h-11 rounded-xl flex items-center justify-center hover:scale-110 transition-all"
                  style={{ background: 'rgba(124,58,237,0.3)', border: '1px solid rgba(124,58,237,0.5)' }}>
                  <MessageSquare className="w-5 h-5 text-violet-300" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Order Details</h3>
          <div className="space-y-2">
            {[
              { label: 'Customer', value: order.customer_name },
              { label: 'Phone', value: order.customer_phone },
              { label: 'Address', value: order.address },
              { label: 'Total', value: `₹${order.total}` },
              { label: 'Services', value: Array.isArray(order.services) ? order.services.map((s: any) => s.name).join(', ') : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-4">
                <span className="text-white/40 text-sm">{label}</span>
                <span className="text-white text-sm font-medium text-right max-w-[60%]">{value}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-white/20 text-xs pb-4">Location updates every 15 seconds automatically</p>
      </div>

      {showChat && orderId && (
        <Chat
          orderId={orderId}
          orderType={orderType as any}
          executiveName={executive?.full_name || order.executive_name}
          executiveId={executive?.id}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}
