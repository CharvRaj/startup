import { useState, useEffect } from 'react';
import { Star, Award, Calendar, Phone, Mail, Sparkles, TrendingUp, Users, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { supabase } from '@/lib/supabase';
import type { Stylist } from '@/types';

export function Stylists() {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStylists();
  }, []);

  const fetchStylists = async () => {
    try {
      const { data, error } = await supabase
        .from('stylists')
        .select('*')
        .eq('available', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setStylists(data || []);
    } catch (error) {
      console.error('Failed to load stylists:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierBadge = (rating: number) => {
    if (rating >= 4.9) return { text: 'Master Artist', color: 'bg-[#FDF0F4] text-[#C83E68] border border-[#F5DCE1]', icon: Crown };
    if (rating >= 4.7) return { text: 'Expert Stylist', color: 'bg-[#FCF9F5] text-[#C69A62] border border-[#F5DCE1]', icon: Star };
    return { text: 'Professional', color: 'bg-emerald-50 text-emerald-800 border border-emerald-200', icon: Sparkles };
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAF6F0' }}>
      <main className="section-padding mt-20">
        <div className="container-custom max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Our Expert Team</span>
            </div>
            <h1 className="font-display text-5xl font-bold mb-4">
              Meet Our <span className="gradient-text">Master Stylists</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Highly skilled professionals dedicated to making you look and feel your best
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Card className="card-luxury text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-1">{stylists.length}+</div>
                <p className="text-sm text-muted-foreground">Expert Stylists</p>
              </CardContent>
            </Card>
            <Card className="card-luxury text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-1">
                  {stylists.reduce((sum, s) => sum + s.total_services, 0)}+
                </div>
                <p className="text-sm text-muted-foreground">Services Done</p>
              </CardContent>
            </Card>
            <Card className="card-luxury text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-1">
                  {(stylists.reduce((sum, s) => sum + s.rating, 0) / stylists.length).toFixed(1)}
                </div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </CardContent>
            </Card>
            <Card className="card-luxury text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-1">
                  {Math.round(stylists.reduce((sum, s) => sum + s.experience_years, 0) / stylists.length)}+
                </div>
                <p className="text-sm text-muted-foreground">Years Experience</p>
              </CardContent>
            </Card>
          </div>

          {/* Stylists Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading our talented team...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stylists.map((stylist) => {
                const tier = getTierBadge(stylist.rating);
                return (
                  <Card
                    key={stylist.id}
                    className="card-luxury group hover:shadow-2xl transition-all duration-500 overflow-hidden"
                    style={{
                      transform: 'perspective(1000px)',
                      transition: 'transform 0.5s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'perspective(1000px) rotateY(5deg) scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) scale(1)';
                    }}
                  >
                    {/* Image with 3D effect */}
                    <div className="relative h-80 overflow-hidden bg-gradient-to-br from-primary/10 to-pink-100">
                      {stylist.image_url ? (
                        <img
                          src={stylist.image_url}
                          alt={stylist.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Award className="w-24 h-24 text-primary/30" />
                        </div>
                      )}
                      
                      {/* Floating badge */}
                      <div className="absolute top-4 right-4 animate-bounce">
                        <Badge className={`${tier.color} flex items-center gap-1.5`}>
                          <tier.icon className="w-3.5 h-3.5" /> {tier.text}
                        </Badge>
                      </div>

                      {/* Rating overlay */}
                      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-lg">{stylist.rating}</span>
                        <span className="text-sm text-muted-foreground">({stylist.total_services} services)</span>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      {/* Name & Title */}
                      <h3 className="font-bold text-2xl mb-1 group-hover:text-primary transition-colors">
                        {stylist.name}
                      </h3>
                      <p className="text-primary font-medium mb-1">{stylist.title}</p>
                      <p className="text-sm text-muted-foreground mb-4">{stylist.specialization}</p>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-muted/50 rounded-lg p-3 text-center">
                          <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
                          <p className="text-lg font-bold">{stylist.experience_years} yrs</p>
                          <p className="text-xs text-muted-foreground">Experience</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3 text-center">
                          <Users className="w-5 h-5 text-primary mx-auto mb-1" />
                          <p className="text-lg font-bold">{stylist.total_services}+</p>
                          <p className="text-xs text-muted-foreground">Happy Clients</p>
                        </div>
                      </div>

                      {/* Bio */}
                      {stylist.bio && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {stylist.bio}
                        </p>
                      )}

                      {/* Contact */}
                      <div className="flex gap-2 pt-4 border-t border-border">
                        {stylist.phone && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-2"
                            onClick={() => window.location.href = `tel:${stylist.phone}`}
                          >
                            <Phone className="w-4 h-4" />
                            Call
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="flex-1 gap-2 btn-primary"
                          onClick={() => window.location.href = '/#booking'}
                        >
                          <Calendar className="w-4 h-4" />
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-16 text-center bg-gradient-to-r from-primary/10 via-pink-50 to-purple-50 rounded-3xl p-12">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-display text-3xl font-bold mb-4">
              Ready to Transform Your Look?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Book an appointment with our expert stylists and experience world-class beauty services
            </p>
            <Button
              onClick={() => window.location.href = '/#booking'}
              size="lg"
              className="btn-primary text-lg px-8 py-6"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book Your Appointment
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
