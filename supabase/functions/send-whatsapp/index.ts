import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, phone, service, date, time } = await req.json();

    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error('Twilio credentials not configured');
    }

    const formattedDate = new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // WhatsApp message with proper formatting
    const message = `✨ *Satguru Makeup Art* - Booking Confirmed!

Hello *${name}*!

Your appointment is confirmed:
📅 Date: ${formattedDate}
⏰ Time: ${time}
💄 Service: ${service}

We look forward to making you look stunning! 💖

📍 Location: Singhana, Rajasthan 333516
📞 Contact: +91 98871 96182

Thank you for choosing Satguru Makeup Art!`;

    // Twilio WhatsApp API endpoint
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    
    // Ensure phone number is in E.164 format (e.g., +919887196182)
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      // Assume Indian number if no country code
      formattedPhone = formattedPhone.startsWith('91') 
        ? `+${formattedPhone}` 
        : `+91${formattedPhone}`;
    }

    // Twilio WhatsApp numbers must be in format: whatsapp:+1234567890
    const whatsappTo = `whatsapp:${formattedPhone}`;
    const whatsappFrom = 'whatsapp:+14155238886'; // Twilio Sandbox number

    console.log(`Sending WhatsApp to: ${whatsappTo}`);

    const formData = new URLSearchParams();
    formData.append('To', whatsappTo);
    formData.append('From', whatsappFrom);
    formData.append('Body', message);

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Twilio WhatsApp error:', errorData);
      throw new Error(`Twilio WhatsApp API error: ${errorData}`);
    }

    const data = await response.json();
    console.log('WhatsApp message sent successfully:', data.sid);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageSid: data.sid,
        message: 'WhatsApp message sent successfully',
        to: whatsappTo
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in send-whatsapp:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Make sure you have joined the Twilio WhatsApp Sandbox first'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
