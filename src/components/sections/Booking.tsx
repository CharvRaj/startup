import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Calendar, User, Mail, Phone, MessageSquare, MapPin, QrCode, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import { FunctionsHttpError } from '@supabase/supabase-js';


export function Booking() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    message: '',
    shopId: '',
  });
  const [shops, setShops] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [bookingConfirmation, setBookingConfirmation] = useState<{ id: string; service: string; date: string; time: string } | null>(null);

  useEffect(() => {
    fetchShops();
    getUserLocation();
  }, []);

  const fetchShops = async () => {
    const { data } = await supabase
      .from('shops')
      .select('*')
      .eq('active', true)
      .order('name');
    setShops(data || []);
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.log('Geolocation error:', error)
      );
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1); // Distance in km
  };

  const getShopWithDistance = (shop: any) => {
    if (userLocation && shop.latitude && shop.longitude) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        parseFloat(shop.latitude),
        parseFloat(shop.longitude)
      );
      return { ...shop, distance };
    }
    return shop;
  };

  const sortedShops = shops
    .map(getShopWithDistance)
    .sort((a, b) => {
      if (a.distance && b.distance) {
        return parseFloat(a.distance) - parseFloat(b.distance);
      }
      return 0;
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login or sign up to book an appointment.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      // Generate QR code data
      const qrData = `SATGURU-BOOKING-${Date.now()}-${user.id.slice(0, 8).toUpperCase()}`;
      
      // Save booking to database
      const { data: newBooking, error: dbError } = await supabase.from('bookings').insert({
        user_id: user.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service: formData.service,
        preferred_date: formData.date,
        preferred_time: formData.time,
        message: formData.message,
        shop_id: formData.shopId || null,
        qr_code: qrData,
      }).select().single();

      if (dbError) throw dbError;

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke('send-booking-notification', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service: formData.service,
          date: formData.date,
          time: formData.time,
          message: formData.message,
        },
      });

      if (emailError) {
        let errorMessage = emailError.message;
        if (emailError instanceof FunctionsHttpError) {
          try {
            const statusCode = emailError.context?.status ?? 500;
            const textContent = await emailError.context?.text();
            errorMessage = `[Code: ${statusCode}] ${textContent || emailError.message || 'Unknown error'}`;
          } catch {
            errorMessage = `${emailError.message || 'Failed to read response'}`;
          }
        }
        console.error('Email notification failed:', errorMessage);
        // Don't throw - booking is already saved
      }

      // Show confirmation with QR code
      setBookingConfirmation({
        id: qrData,
        service: formData.service,
        date: formData.date,
        time: formData.time,
      });

      toast({
        title: '💌 Thanks for Contacting Us!',
        description: 'Your booking has arrived! Our salon team will review your slot and provide confirmation within 15–30 minutes.',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        date: '',
        time: '',
        message: '',
        shopId: '',
      });
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

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="booking" className="section-padding scroll-mt-20" style={{ background: '#FDF7F2' }}>
      <div className="container-custom">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Book Appointment</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Schedule Your <span className="gradient-text">Beauty Session</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Fill out the form below and we'll get back to you to confirm your appointment
          </p>
        </div>

        {/* QR Confirmation Dialog */}
        {bookingConfirmation && (
          <Dialog open={!!bookingConfirmation} onOpenChange={() => setBookingConfirmation(null)}>
            <DialogContent className="max-w-sm text-center">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold gradient-text">Booking Confirmed! 🎉</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <div className="bg-gradient-to-br from-primary/5 to-pink-50 rounded-2xl p-6 mb-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-white rounded-xl shadow-md">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=be185d&data=${encodeURIComponent(bookingConfirmation.id)}`}
                        alt="Booking QR Code"
                        width={160}
                        height={160}
                        className="rounded"
                      />
                    </div>
                  </div>
                  <p className="font-semibold text-foreground capitalize">{bookingConfirmation.service.replace('-', ' ')} Appointment</p>
                  <p className="text-sm text-muted-foreground mt-1">{new Date(bookingConfirmation.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} at {bookingConfirmation.time}</p>
                  <p className="text-xs text-muted-foreground mt-2 font-mono bg-gray-100 px-3 py-1 rounded-full inline-block">{bookingConfirmation.id.slice(0, 20)}...</p>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Show this QR code at the salon for quick check-in. We will confirm your appointment soon.</p>
                <Button onClick={() => setBookingConfirmation(null)} className="btn-primary w-full">
                  <QrCode className="w-4 h-4 mr-2" />
                  View in My Bookings
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <div className="max-w-3xl mx-auto">
          <Card className="card-luxury animate-scale-in card-3d">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name *
                  </label>
                  <Input
                    required
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="input-luxury"
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email *
                    </label>
                    <Input
                      required
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="input-luxury"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone *
                    </label>
                    <Input
                      required
                      type="tel"
                      placeholder="+1 (234) 567-890"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="input-luxury"
                    />
                  </div>
                </div>

                {/* Service */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    Select Service *
                  </label>
                  <Select value={formData.service} onValueChange={(value) => handleChange('service', value)}>
                    <SelectTrigger className="input-luxury">
                      <SelectValue placeholder="Choose a service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bridal">Bridal Makeup</SelectItem>
                      <SelectItem value="party">Party Makeup</SelectItem>
                      <SelectItem value="hair">Hair Styling</SelectItem>
                      <SelectItem value="facial">Facial Treatment</SelectItem>
                      <SelectItem value="skincare">Skin Care</SelectItem>
                      <SelectItem value="package">Beauty Package</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Shop/Branch Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Preferred Shop/Branch (Optional)
                  </label>
                  <Select value={formData.shopId} onValueChange={(value) => handleChange('shopId', value)}>
                    <SelectTrigger className="input-luxury">
                      <SelectValue placeholder="Select nearby shop" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedShops.map((shop) => (
                        <SelectItem key={shop.id} value={shop.id}>
                          <div className="flex items-center gap-2">
                            <span>{shop.name} - {shop.area}</span>
                            {shop.distance && (
                              <span className="text-xs text-muted-foreground">📍 {shop.distance} km</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {userLocation && (
                    <p className="text-xs text-green-600 mt-1">📍 Showing nearest shops based on your location</p>
                  )}
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Preferred Date *
                    </label>
                    <Input
                      required
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleChange('date', e.target.value)}
                      className="input-luxury"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Preferred Time *
                    </label>
                    <Input
                      required
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleChange('time', e.target.value)}
                      className="input-luxury"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Additional Notes (Optional)
                  </label>
                  <Textarea
                    placeholder="Tell us about your preferences or special requirements..."
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    className="input-luxury min-h-[120px]"
                  />
                </div>

                {/* Submit Button */}
                <Button type="submit" disabled={loading} className="btn-primary w-full text-lg py-6">
                  <Calendar className="w-5 h-5 mr-2" />
                  {loading ? 'Submitting...' : 'Submit Booking Request'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
