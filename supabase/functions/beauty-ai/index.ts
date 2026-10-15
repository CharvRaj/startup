import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { beautyProfile } = await req.json();
    const apiKey = Deno.env.get('ONSPACE_AI_API_KEY');
    const baseUrl = Deno.env.get('ONSPACE_AI_BASE_URL');

    if (!apiKey || !baseUrl) throw new Error('OnSpace AI not configured');

    const prompt = `You are a professional beauty consultant for Satguru Makeup Art salon.
Based on this customer's beauty profile, provide 5 personalized service recommendations in JSON format.

Beauty Profile:
- Hair Type: ${beautyProfile.hair_type || 'not specified'}
- Hair Concerns: ${(beautyProfile.hair_concerns || []).join(', ') || 'none'}
- Hair Texture: ${beautyProfile.hair_texture || 'not specified'}
- Hair Length: ${beautyProfile.hair_length || 'not specified'}
- Scalp Type: ${beautyProfile.scalp_type || 'not specified'}
- Skin Type: ${beautyProfile.skin_type || 'not specified'}
- Skin Concerns: ${(beautyProfile.skin_concerns || []).join(', ') || 'none'}
- Skin Sensitivity: ${beautyProfile.skin_sensitivity || 'not specified'}
- Skin Color/Tone: ${beautyProfile.skin_color || 'not specified'}
- Age Group: ${beautyProfile.age_group || 'not specified'}
- Gender: ${beautyProfile.gender || 'female'}

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "recommendations": [
    {
      "service": "Service Name",
      "category": "hair|skin|makeup|mehndi|nail",
      "reason": "Why this suits them",
      "benefit": "Key benefit",
      "icon": "emoji",
      "type": "salon|doorstep",
      "urgency": "recommended|highly_recommended|must_try"
    }
  ],
  "tip": "One personalized beauty tip for this customer"
}`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content ?? '{}';
    // Clean markdown if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let parsed;
    try { parsed = JSON.parse(content); } catch { parsed = { recommendations: [], tip: '' }; }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('beauty-ai error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
