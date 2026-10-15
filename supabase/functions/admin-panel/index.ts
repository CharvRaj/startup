import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify admin via JWT
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supabaseUser = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '');
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token);
    if (userError || !user) return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const ADMIN_EMAILS = ['charvraj2006@gmail.com'];
    if (!ADMIN_EMAILS.includes(user.email ?? '')) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { action, ...body } = await req.json();

    switch (action) {
      case 'get_all_bookings': {
        const { data, error } = await supabaseAdmin
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'update_booking_status': {
        const { bookingId, status } = body;
        const { error } = await supabaseAdmin
          .from('bookings')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', bookingId);
        if (error) throw error;

        // Award loyalty points if completed
        if (status === 'completed') {
          const { data: booking } = await supabaseAdmin.from('bookings').select('user_id').eq('id', bookingId).single();
          if (booking?.user_id) {
            const points = 50;
            const { data: lp } = await supabaseAdmin.from('loyalty_points').select('*').eq('user_id', booking.user_id).single();
            if (lp) {
              await supabaseAdmin.from('loyalty_points').update({ points: lp.points + points, lifetime_points: lp.lifetime_points + points, updated_at: new Date().toISOString() }).eq('user_id', booking.user_id);
            } else {
              await supabaseAdmin.from('loyalty_points').insert({ user_id: booking.user_id, points, lifetime_points: points });
            }
            await supabaseAdmin.from('loyalty_transactions').insert({ user_id: booking.user_id, points, type: 'earned', reason: 'Booking completed', reference_id: bookingId });
          }
        }
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'get_all_orders': {
        const [doorstep, mehndi] = await Promise.all([
          supabaseAdmin.from('doorstep_orders').select('*').order('created_at', { ascending: false }),
          supabaseAdmin.from('mehndi_orders').select('*').order('created_at', { ascending: false }),
        ]);
        const all = [
          ...(doorstep.data || []).map(o => ({ ...o, order_type: 'doorstep' })),
          ...(mehndi.data || []).map(o => ({ ...o, order_type: 'mehndi' })),
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return new Response(JSON.stringify({ data: all }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'update_order_status': {
        const { orderId, status, orderType, executiveName, executivePhone } = body;
        const table = orderType === 'mehndi' ? 'mehndi_orders' : 'doorstep_orders';
        const updates: any = { status, updated_at: new Date().toISOString() };
        if (executiveName) updates.executive_name = executiveName;
        if (executivePhone) updates.executive_phone = executivePhone;
        const { error } = await supabaseAdmin.from(table).update(updates).eq('id', orderId);
        if (error) throw error;

        // Award loyalty points if serviced
        if (status === 'serviced' || status === 'completed') {
          const { data: ord } = await supabaseAdmin.from(table).select('user_id, total').eq('id', orderId).single();
          if (ord?.user_id) {
            const points = Math.floor((ord.total || 0) / 10);
            const { data: lp } = await supabaseAdmin.from('loyalty_points').select('*').eq('user_id', ord.user_id).single();
            if (lp) {
              await supabaseAdmin.from('loyalty_points').update({ points: lp.points + points, lifetime_points: lp.lifetime_points + points, updated_at: new Date().toISOString() }).eq('user_id', ord.user_id);
            } else {
              await supabaseAdmin.from('loyalty_points').insert({ user_id: ord.user_id, points, lifetime_points: points });
            }
            await supabaseAdmin.from('loyalty_transactions').insert({ user_id: ord.user_id, points, type: 'earned', reason: 'Order completed', reference_id: orderId });
          }
        }
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'get_requests': {
        const [stylists, associates] = await Promise.all([
          supabaseAdmin.from('stylist_requests').select('*').order('created_at', { ascending: false }),
          supabaseAdmin.from('associate_requests').select('*').order('created_at', { ascending: false }),
        ]);
        return new Response(JSON.stringify({ stylists: stylists.data || [], associates: associates.data || [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'update_request': {
        const { requestId, type, status: reqStatus } = body;
        const table = type === 'stylist' ? 'stylist_requests' : 'associate_requests';
        const { error } = await supabaseAdmin.from(table).update({ status: reqStatus }).eq('id', requestId);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'get_reviews': {
        const { data, error } = await supabaseAdmin
          .from('reviews')
          .select('*, user_profiles(username, email)')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'update_review': {
        const { reviewId, featured } = body;
        const { error } = await supabaseAdmin.from('reviews').update({ featured }).eq('id', reviewId);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'get_dashboard_stats': {
        const [bookingsCount, ordersCount, usersCount, revenue] = await Promise.all([
          supabaseAdmin.from('bookings').select('id', { count: 'exact' }),
          supabaseAdmin.from('doorstep_orders').select('id', { count: 'exact' }),
          supabaseAdmin.from('user_profiles').select('id', { count: 'exact' }),
          supabaseAdmin.from('doorstep_orders').select('total').eq('status', 'serviced'),
        ]);
        const totalRevenue = (revenue.data || []).reduce((sum: number, o: any) => sum + (o.total || 0), 0);
        return new Response(JSON.stringify({
          bookings: bookingsCount.count || 0,
          orders: ordersCount.count || 0,
          users: usersCount.count || 0,
          revenue: totalRevenue,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  } catch (error: any) {
    console.error('Admin panel error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
