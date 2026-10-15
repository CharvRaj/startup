import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Sparkles, Users, TrendingUp, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import type { Review } from '@/types';

interface ReviewWithUser extends Review {
  user_profiles?: {
    username: string;
    email: string;
  };
}

export function Reviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'featured'>('all');

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          user_profiles!inner (
            username,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (filter === 'featured') {
        query = query.eq('featured', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReviews(data || []);
    } catch (error: any) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;
    
    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: reviews.filter(r => r.rating === rating).length,
      percentage: totalReviews > 0 
        ? (reviews.filter(r => r.rating === rating).length / totalReviews) * 100 
        : 0,
    }));

    return { totalReviews, averageRating, ratingDistribution };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen">
      <main className="section-padding bg-gradient-bg mt-20">
        <div className="container-custom max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-8 h-8 text-primary" />
                <h1 className="font-display text-4xl font-bold">Customer Reviews</h1>
              </div>
              <p className="text-muted-foreground">See what our customers are saying about us</p>
            </div>
            <Button onClick={() => navigate(-1)} variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="card-luxury">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Average Rating</p>
                    <div className="flex items-center gap-2">
                      <p className="text-4xl font-bold text-primary">
                        {stats.averageRating.toFixed(1)}
                      </p>
                      <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-pink-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Reviews</p>
                    <p className="text-4xl font-bold text-primary">{stats.totalReviews}</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-luxury">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Featured Reviews</p>
                    <p className="text-4xl font-bold text-primary">
                      {reviews.filter(r => r.featured).length}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rating Distribution */}
          <Card className="card-luxury mb-8">
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.ratingDistribution.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center gap-4">
                    <div className="flex items-center gap-1 w-24">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary to-pink-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-6">
            <Button
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'default' : 'outline'}
            >
              All Reviews ({stats.totalReviews})
            </Button>
            <Button
              onClick={() => setFilter('featured')}
              variant={filter === 'featured' ? 'default' : 'outline'}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Featured ({reviews.filter(r => r.featured).length})
            </Button>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {loading ? (
              <Card className="card-luxury">
                <CardContent className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </CardContent>
              </Card>
            ) : reviews.length === 0 ? (
              <Card className="card-luxury">
                <CardContent className="p-12 text-center">
                  <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {filter === 'featured' ? 'No featured reviews yet' : 'No reviews yet'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card 
                  key={review.id} 
                  className={`card-luxury ${review.featured ? 'ring-2 ring-primary/50 bg-primary/5' : ''}`}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-pink-100 rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary">
                            {review.user_profiles?.username?.charAt(0).toUpperCase() || 'A'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-xl mb-1">
                              {review.user_profiles?.username || 'Anonymous'}
                            </h3>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-5 h-5 ${
                                      i < review.rating 
                                        ? 'fill-yellow-400 text-yellow-400' 
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                          {review.featured && (
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                              <Sparkles className="w-4 h-4" />
                              Featured Review
                            </span>
                          )}
                        </div>

                        <div className="mb-4">
                          <span className="inline-block bg-muted px-3 py-1 rounded-full text-sm text-muted-foreground">
                            {review.service}
                          </span>
                        </div>

                        <p className="text-foreground leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
