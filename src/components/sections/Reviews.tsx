import { Sparkles, Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const reviews = [
  {
    name: 'Akansha',
    rating: 5,
    text: 'Absolutely stunning work! The bridal makeup was perfect and lasted throughout my wedding day. Highly recommend BlindGlow By Satguru!',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
  },
  {
    name: 'Samera',
    rating: 5,
    text: 'Best makeup artist in town! The team is so professional and talented. They made me feel like a princess on my special day.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
  },
  {
    name: 'Sharmila',
    rating: 5,
    text: 'Amazing experience! The attention to detail and personalized service exceeded my expectations. Thank you for making my day special!',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
  },
  {
    name: 'Anju',
    rating: 5,
    text: 'I have been coming here for years and they never disappoint! From bridal to party makeup, everything is always perfect.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
  },
  {
    name: 'Manju',
    rating: 5,
    text: 'Exceptional service and beautiful results! The makeup looked natural yet glamorous. Will definitely come back again!',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop',
  },
];

export function Reviews() {
  return (
    <section id="reviews" className="section-padding">
      <div className="container-custom">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Testimonials</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            What Our Clients <span className="gradient-text">Say</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Read what our happy clients have to say about their experience with us
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <Card
              key={index}
              className="card-luxury group hover:scale-105 transition-transform duration-300 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <Quote className="w-10 h-10 text-primary/20 mb-4" />
                
                {/* Star Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{review.text}"
                </p>

                {/* Reviewer Info */}
                <div className="flex items-center gap-3">
                  <img
                    src={review.image}
                    alt={review.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                  />
                  <div>
                    <h4 className="font-semibold">{review.name}</h4>
                    <p className="text-sm text-muted-foreground">Verified Client</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
