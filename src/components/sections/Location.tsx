import { Sparkles, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function Location() {
  return (
    <section id="location" className="section-padding transition-colors duration-300 border-t border-border/40" style={{ background: 'var(--background)' }}>
      <div className="container-custom">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Visit Us</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Find <span className="gradient-text">Our Location</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Visit us at our salon or get in touch for appointments
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map */}
          <div className="animate-fade-in">
            <Card className="card-luxury overflow-hidden h-full">
              <CardContent className="p-0">
                <div className="w-full h-[400px] bg-muted">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3506.0765844!2d75.8340732!3d28.0978555!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3912d1f2cda5a171%3A0xfe107d32d05440e1!2sSatguru%20Herbal%20Beauty%20Parlor!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Satguru Herbal Beauty Parlor Location"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6 animate-slide-up">
            <Card className="card-luxury">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Address</h3>
                  <p className="text-muted-foreground">
                    Satguru Herbal Beauty Parlor<br />
                    Singhana, Rajasthan 333516<br />
                    India
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Phone</h3>
                  <a href="tel:+919887196182" className="text-muted-foreground hover:text-primary transition-colors">
                    +91 98871 96182
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Email</h3>
                  <a href="mailto:info@satgurumakeupart.com" className="text-muted-foreground hover:text-primary transition-colors">
                    info@satgurumakeupart.com
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Business Hours</h3>
                  <div className="text-muted-foreground space-y-1">
                    <p>Monday - Saturday: 10:00 AM - 8:00 PM</p>
                    <p>Sunday: 11:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
