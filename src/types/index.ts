export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  full_name?: string;
  phone?: string;
  skin_type?: 'oily' | 'dry' | 'combination' | 'normal' | 'sensitive';
  hair_type?: 'straight' | 'wavy' | 'curly' | 'coily';
  allergies?: string[];
  preferences?: Record<string, any>;
  referral_code?: string;
  referred_by?: string;
}

export interface AuthUser extends User {}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'manager' | 'stylist' | 'user';
  shop_id?: string;
  permissions: Record<string, boolean>;
  created_at: string;
}

export interface Shop {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  area: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  available_days: string[];
  opening_time: string;
  closing_time: string;
  active: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  preferred_date: string;
  preferred_time: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  stylist_id?: string;
  stylist_name?: string;
  shop_id?: string;
  area?: string;
  review_submitted?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  booking_id?: string;
  rating: number;
  comment: string;
  service: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface DoorstepService {
  id: string;
  category: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  image_url?: string;
  available: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  service_id: string;
  quantity: number;
  service?: DoorstepService;
  created_at: string;
}

export interface DoorstepOrder {
  id: string;
  user_id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  latitude?: number;
  longitude?: number;
  services: Array<{
    service_id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  coupon_code?: string;
  payment_method: 'pay_now' | 'pay_later';
  payment_status: 'pending' | 'paid' | 'failed';
  status: 'pending' | 'confirmed' | 'executive_assigned' | 'on_the_way' | 'arrived' | 'serviced' | 'cancelled';
  executive_id?: string;
  executive_name?: string;
  executive_phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GiftCard {
  id: string;
  code: string;
  amount: number;
  balance: number;
  purchaser_id?: string;
  recipient_email?: string;
  recipient_name?: string;
  message?: string;
  status: 'active' | 'redeemed' | 'expired';
  expires_at?: string;
  created_at: string;
}

export interface LoyaltyPoints {
  id: string;
  user_id: string;
  points: number;
  lifetime_points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  points: number;
  type: 'earned' | 'redeemed' | 'expired';
  reason: string;
  reference_id?: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount?: number;
  valid_from: string;
  valid_until?: string;
  usage_limit?: number;
  usage_count: number;
  active: boolean;
  created_at: string;
}

export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  display_order: number;
  created_at: string;
}

export interface Stylist {
  id: string;
  name: string;
  title: string;
  specialization: string;
  experience_years: number;
  rating: number;
  total_services: number;
  bio?: string;
  image_url?: string;
  available: boolean;
  phone?: string;
  email?: string;
  shop_id?: string;
  status: 'free' | 'on_the_way' | 'working' | 'on_break';
  current_booking_id?: string;
  working_hours?: Record<string, { start: string; end: string }>;
  created_at: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  price: number;
  validity_days: number;
  discount_percentage: number;
  points_multiplier: number;
  benefits: string[];
  active: boolean;
  display_order: number;
  created_at: string;
}

export interface UserMembership {
  id: string;
  user_id: string;
  plan_id: string;
  plan?: MembershipPlan;
  start_date: string;
  end_date: string;
  active: boolean;
  auto_renew: boolean;
  created_at: string;
}

export interface UserTodo {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  reminder_sent: boolean;
  ai_generated: boolean;
  created_at: string;
  completed_at?: string;
}

export interface UserAIPreferences {
  id: string;
  user_id: string;
  daily_motivation: boolean;
  spending_alerts: boolean;
  service_recommendations: boolean;
  reminder_notifications: boolean;
  preferred_contact_method: 'email' | 'sms' | 'push';
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  reward_points: number;
  status: 'pending' | 'completed';
  created_at: string;
}

export interface UserMood {
  id: string;
  user_id: string;
  mood: 'relax' | 'wedding_prep' | 'party_ready' | 'daily_care';
  preferences: Record<string, any>;
  created_at: string;
}

export interface StoryBanner {
  id: string;
  title: string;
  image_url: string;
  link_url?: string;
  expires_at: string;
  active: boolean;
  display_order: number;
  created_at: string;
}

export interface MehndiService {
  id: string;
  category: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  available: boolean;
  created_at: string;
  updated_at: string;
}

export interface MehndiCartItem {
  id: string;
  user_id: string;
  service_id: string;
  quantity: number;
  service?: MehndiService;
  created_at: string;
}

export interface MehndiOrder {
  id: string;
  user_id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  latitude?: number;
  longitude?: number;
  services: Array<{
    service_id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  discount: number;
  delivery_charge: number;
  service_charge: number;
  total: number;
  coupon_code?: string;
  payment_method: 'pay_now' | 'pay_later';
  payment_status: 'pending' | 'paid' | 'failed';
  status: 'pending' | 'confirmed' | 'executive_assigned' | 'on_the_way' | 'arrived' | 'serviced' | 'cancelled';
  executive_id?: string;
  executive_name?: string;
  executive_phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  url: string;
  storage_path: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}
