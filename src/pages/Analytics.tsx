import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, Calendar, DollarSign, Users, Star, Package, Heart, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Analytics {
  totalBookings: number;
  totalOrders: number;
  totalSpent: number;
  totalPoints: number;
  completedServices: number;
  averageRating: number;
  monthlySpending: Array<{ month: string; amount: number }>;
  serviceBreakdown: Array<{ name: string; count: number; amount: number }>;
  pointsHistory: Array<{ month: string; earned: number; redeemed: number }>;
  yearlyComparison: Array<{ year: string; bookings: number; spending: number }>;
}

const COLORS = ['#FF6B9D', '#C084FC', '#60A5FA', '#34D399', '#FBBF24', '#F472B6'];

export function Analytics() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAnalytics();
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      // Fetch all user data
      const [bookingsRes, doorstepRes, mehndiRes, loyaltyRes, reviewsRes] = await Promise.all([
        supabase.from('bookings').select('*').eq('user_id', user.id),
        supabase.from('doorstep_orders').select('*').eq('user_id', user.id),
        supabase.from('mehndi_orders').select('*').eq('user_id', user.id),
        supabase.from('loyalty_points').select('*').eq('user_id', user.id).single(),
        supabase.from('reviews').select('rating').eq('user_id', user.id),
      ]);

      const bookings = bookingsRes.data || [];
      const doorstepOrders = doorstepRes.data || [];
      const mehndiOrders = mehndiRes.data || [];
      const allOrders = [...doorstepOrders, ...mehndiOrders];
      const loyalty = loyaltyRes.data;
      const reviews = reviewsRes.data || [];

      // Calculate stats
      const totalSpent = allOrders.reduce((sum, order) => sum + order.total, 0);
      const completedServices = [
        ...bookings.filter(b => b.status === 'completed'),
        ...allOrders.filter(o => o.status === 'serviced')
      ].length;
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      // Monthly spending
      const monthlyData = new Map<string, number>();
      allOrders.forEach(order => {
        const month = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyData.set(month, (monthlyData.get(month) || 0) + order.total);
      });
      const monthlySpending = Array.from(monthlyData.entries())
        .map(([month, amount]) => ({ month, amount }))
        .slice(-6);

      // Service breakdown
      const serviceData = new Map<string, { count: number; amount: number }>();
      bookings.forEach(b => {
        const existing = serviceData.get(b.service) || { count: 0, amount: 0 };
        serviceData.set(b.service, { count: existing.count + 1, amount: existing.amount });
      });
      allOrders.forEach(order => {
        order.services.forEach((s: any) => {
          const existing = serviceData.get(s.name) || { count: 0, amount: 0 };
          serviceData.set(s.name, {
            count: existing.count + s.quantity,
            amount: existing.amount + (s.price * s.quantity)
          });
        });
      });
      const serviceBreakdown = Array.from(serviceData.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      // Yearly comparison
      const yearlyData = new Map<string, { bookings: number; spending: number }>();
      [...bookings, ...allOrders].forEach(item => {
        const year = new Date(item.created_at).getFullYear().toString();
        const existing = yearlyData.get(year) || { bookings: 0, spending: 0 };
        yearlyData.set(year, {
          bookings: existing.bookings + 1,
          spending: existing.spending + ((item as any).total || 0)
        });
      });
      const yearlyComparison = Array.from(yearlyData.entries())
        .map(([year, data]) => ({ year, ...data }))
        .sort((a, b) => a.year.localeCompare(b.year));

      setAnalytics({
        totalBookings: bookings.length,
        totalOrders: allOrders.length,
        totalSpent,
        totalPoints: loyalty?.points || 0,
        completedServices,
        averageRating,
        monthlySpending,
        serviceBreakdown,
        pointsHistory: [],
        yearlyComparison,
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="section-padding bg-gradient-bg mt-20">
        <div className="container-custom max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-8 h-8 text-primary" />
                <h1 className="font-display text-4xl font-bold gradient-text">My Analytics Dashboard</h1>
              </div>
              <p className="text-muted-foreground">Track your spending, services, and rewards</p>
            </div>
            <Button onClick={() => navigate('/profile')} variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your analytics...</p>
            </div>
          ) : analytics ? (
            <>
              {/* Stats Cards with 3D Effect */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { icon: Calendar, label: 'Total Bookings', value: analytics.totalBookings, color: 'from-blue-400 to-blue-600' },
                  { icon: Package, label: 'Total Orders', value: analytics.totalOrders, color: 'from-purple-400 to-purple-600' },
                  { icon: DollarSign, label: 'Total Spent', value: `₹${analytics.totalSpent}`, color: 'from-green-400 to-green-600' },
                  { icon: Star, label: 'Loyalty Points', value: analytics.totalPoints, color: 'from-yellow-400 to-yellow-600' },
                ].map((stat, idx) => (
                  <Card
                    key={idx}
                    className="card-luxury overflow-hidden group hover:shadow-2xl transition-all duration-500"
                    style={{
                      transform: 'perspective(1000px)',
                      transition: 'transform 0.5s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'perspective(1000px) rotateY(5deg) translateY(-10px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) translateY(0)';
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                          <p className="text-3xl font-bold text-primary">{stat.value}</p>
                        </div>
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <stat.icon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Monthly Spending Trend */}
                <Card className="card-luxury">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Monthly Spending Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={analytics.monthlySpending}>
                        <defs>
                          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF6B9D" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#FF6B9D" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="amount" stroke="#FF6B9D" fillOpacity={1} fill="url(#colorAmount)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Service Breakdown */}
                <Card className="card-luxury">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-primary" />
                      Service Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics.serviceBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="amount"
                        >
                          {analytics.serviceBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Yearly Comparison */}
              <Card className="card-luxury mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Year-over-Year Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analytics.yearlyComparison}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="bookings" fill="#C084FC" name="Bookings" />
                      <Bar yAxisId="right" dataKey="spending" fill="#FF6B9D" name="Spending (₹)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Service Details Table */}
              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle>Top Services by Spending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.serviceBreakdown.map((service, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ background: COLORS[idx % COLORS.length] }}
                          >
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold">{service.name}</h4>
                            <p className="text-sm text-muted-foreground">{service.count} services</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">₹{service.amount}</p>
                          <p className="text-xs text-muted-foreground">
                            ₹{Math.round(service.amount / service.count)} avg
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Insights */}
              <div className="mt-8 bg-gradient-to-r from-primary/10 via-pink-50 to-purple-50 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <h3 className="font-bold text-xl">AI Insights</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Most Popular Service</p>
                    <p className="font-bold">{analytics.serviceBreakdown[0]?.name || 'N/A'}</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Average Monthly Spending</p>
                    <p className="font-bold">
                      ₹{Math.round(analytics.monthlySpending.reduce((s, m) => s + m.amount, 0) / analytics.monthlySpending.length || 0)}
                    </p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Completed Services</p>
                    <p className="font-bold">{analytics.completedServices} services</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No analytics data available yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
