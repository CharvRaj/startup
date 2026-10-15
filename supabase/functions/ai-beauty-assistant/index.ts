import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const onspaceAIKey = Deno.env.get('ONSPACE_AI_API_KEY')!;
const onspaceAIBaseUrl = Deno.env.get('ONSPACE_AI_BASE_URL')!;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, message, context } = await req.json();

    if (!userId || !message) {
      return new Response(
        JSON.stringify({ error: 'userId and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user profile and beauty preferences
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Fetch recent bookings and orders
    const { data: recentBookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentOrders } = await supabase
      .from('doorstep_orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Build AI context
    const systemPrompt = `You are Sia, the AI Beauty Assistant for Satguru Makeup Art salon. You are helpful, friendly, and knowledgeable about beauty services.

USER PROFILE:
- Name: ${profile?.full_name || profile?.username || 'User'}
- Skin Type: ${profile?.skin_type || 'Not specified'}
- Hair Type: ${profile?.hair_type || 'Not specified'}
- Allergies: ${profile?.allergies?.join(', ') || 'None specified'}

RECENT ACTIVITY:
- Recent Bookings: ${recentBookings?.length || 0} bookings
- Recent Orders: ${recentOrders?.length || 0} orders

YOUR CAPABILITIES:
1. Recommend beauty services based on skin/hair type and preferences
2. Suggest skincare routines and beauty tips
3. Explain benefits of different treatments
4. Answer FAQs about salon services, pricing, and booking
5. Help create beauty to-do lists and reminders
6. Provide personalized product recommendations

GUIDELINES:
- Be warm and encouraging
- Give specific, actionable advice
- Consider the user's profile when making recommendations
- If asked about pricing, mention typical ranges (e.g., "Bridal makeup starts from ₹5000")
- For bookings, guide users to use the booking form
- Keep responses concise but informative
- Use emojis sparingly for a friendly touch ✨

SERVICES WE OFFER:
- Bridal Makeup
- Party Makeup
- Hair Styling & Treatment
- Facial & Skincare
- Mehndi (Traditional & Modern)
- Doorstep Beauty Services
- Beauty Packages & Memberships

Remember: You're here to help users feel confident and beautiful!`;

    // Call OnSpace AI
    const response = await fetch(`${onspaceAIBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${onspaceAIKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          ...(context || []),
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OnSpace AI error:', errorText);
      throw new Error(`AI service error: ${errorText}`);
    }

    const aiData = await response.json();
    const aiResponse = aiData.choices?.[0]?.message?.content || 'I apologize, but I couldn\'t process that request.';

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        context: {
          skinType: profile?.skin_type,
          hairType: profile?.hair_type,
          recentServices: recentBookings?.map((b: any) => b.service) || []
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI Beauty Assistant error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
