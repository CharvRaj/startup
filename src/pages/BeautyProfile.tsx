import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Sparkles, Save, ArrowLeft, Gift, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';


export function BeautyProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    skin_type: '',
    hair_type: '',
    allergies: [] as string[],
  });
  const [allergyInput, setAllergyInput] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
    fetchReferrals();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          skin_type: data.skin_type || '',
          hair_type: data.hair_type || '',
          allergies: data.allergies || [],
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const fetchReferrals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referred:user_profiles!referred_id(username, email)
        `)
        .eq('referrer_id', user.id);

      if (error) throw error;
      setReferrals(data || []);
    } catch (error: any) {
      console.error('Failed to fetch referrals:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          skin_type: formData.skin_type,
          hair_type: formData.hair_type,
          allergies: formData.allergies,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local auth state
      updateUser({
        ...user,
        full_name: formData.full_name,
        phone: formData.phone,
        skin_type: formData.skin_type as any,
        hair_type: formData.hair_type as any,
        allergies: formData.allergies,
      });

      toast({
        title: 'Profile Updated! ✨',
        description: 'Your beauty profile has been saved successfully',
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

  const addAllergy = () => {
    if (allergyInput.trim() && !formData.allergies.includes(allergyInput.trim())) {
      setFormData({
        ...formData,
        allergies: [...formData.allergies, allergyInput.trim()],
      });
      setAllergyInput('');
    }
  };

  const removeAllergy = (allergy: string) => {
    setFormData({
      ...formData,
      allergies: formData.allergies.filter(a => a !== allergy),
    });
  };

  const copyReferralCode = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code);
      toast({
        title: 'Copied! 🎉',
        description: 'Referral code copied to clipboard',
      });
    }
  };

  const shareReferral = async () => {
    const referralText = `Join Satguru Makeup Art with my referral code: ${user?.referral_code} and get 100 bonus points! 💝`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Satguru Makeup Art Referral',
          text: referralText,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(referralText);
      toast({
        title: 'Copied! 📋',
        description: 'Referral message copied to clipboard',
      });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="section-padding bg-gradient-bg mt-20">
        <div className="container-custom max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-8 h-8 text-primary" />
                <h1 className="font-display text-4xl font-bold gradient-text">Beauty Profile</h1>
              </div>
              <p className="text-muted-foreground">Personalize your beauty experience</p>
            </div>
            <Button onClick={() => navigate('/profile')} variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>

          {/* Personal Info */}
          <Card className="card-luxury mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter your full name"
                  className="input-luxury"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="input-luxury"
                />
              </div>
            </CardContent>
          </Card>

          {/* Beauty Profile */}
          <Card className="card-luxury mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Beauty Profile (AI Recommendations)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Skin Type</label>
                  <Select value={formData.skin_type} onValueChange={(value) => setFormData({ ...formData, skin_type: value })}>
                    <SelectTrigger className="input-luxury">
                      <SelectValue placeholder="Select skin type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oily">Oily</SelectItem>
                      <SelectItem value="dry">Dry</SelectItem>
                      <SelectItem value="combination">Combination</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="sensitive">Sensitive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Hair Type</label>
                  <Select value={formData.hair_type} onValueChange={(value) => setFormData({ ...formData, hair_type: value })}>
                    <SelectTrigger className="input-luxury">
                      <SelectValue placeholder="Select hair type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="straight">Straight</SelectItem>
                      <SelectItem value="wavy">Wavy</SelectItem>
                      <SelectItem value="curly">Curly</SelectItem>
                      <SelectItem value="coily">Coily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Allergies</label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                    placeholder="Add allergy (e.g., Parabens, Fragrance)"
                    className="input-luxury flex-1"
                  />
                  <Button onClick={addAllergy} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.allergies.map((allergy, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-2">
                      {allergy}
                      <button onClick={() => removeAllergy(allergy)} className="ml-1 hover:text-destructive">
                        ×
                      </button>
                    </Badge>
                  ))}
                  {formData.allergies.length === 0 && (
                    <p className="text-sm text-muted-foreground">No allergies added</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral Program */}
          <Card className="card-luxury mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                Referral Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-primary/10 to-pink-50 rounded-2xl p-6 mb-4">
                <h3 className="font-bold text-lg mb-2">Your Referral Code</h3>
                <div className="flex items-center gap-3 mb-3">
                  <code className="flex-1 bg-white px-4 py-3 rounded-lg font-mono text-2xl font-bold text-primary">
                    {user.referral_code || 'LOADING...'}
                  </code>
                  <Button onClick={copyReferralCode} variant="outline" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    Copy
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Share with friends and earn 100 points for each successful referral! 🎁
                </p>
                <Button onClick={shareReferral} className="btn-primary w-full gap-2">
                  <Share2 className="w-4 h-4" />
                  Share Referral Code
                </Button>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Your Referrals ({referrals.length})</h4>
                {referrals.length > 0 ? (
                  <div className="space-y-2">
                    {referrals.map((ref: any) => (
                      <div key={ref.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">{ref.referred?.username || ref.referred?.email}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(ref.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={ref.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {ref.status === 'completed' ? `+${ref.reward_points} points` : 'Pending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No referrals yet. Share your code to earn rewards! 🎉
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={loading} className="btn-primary w-full text-lg py-6">
            <Save className="w-5 h-5 mr-2" />
            {loading ? 'Saving...' : 'Save Beauty Profile'}
          </Button>
        </div>
      </main>
    </div>
  );
}
