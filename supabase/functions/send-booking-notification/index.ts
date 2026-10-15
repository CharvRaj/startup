import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, service, date, time, message, status } = await req.json();

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const formattedDate = new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Email 1: Send notification to owner
    const ownerEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Satguru Makeup Art <onboarding@resend.dev>',
        to: ['charvraj2006@gmail.com'],
        subject: `🔔 New Booking Request from ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background: linear-gradient(135deg, #ec4899 0%, #f97316 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🔔 New Booking Request</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Booking Details</h2>
              
              <div style="margin: 20px 0; padding: 15px; background-color: #fef3f9; border-left: 4px solid #ec4899; border-radius: 4px;">
                <p style="margin: 8px 0;"><strong style="color: #ec4899;">Customer Name:</strong> ${name}</p>
                <p style="margin: 8px 0;"><strong style="color: #ec4899;">Email:</strong> ${email}</p>
                <p style="margin: 8px 0;"><strong style="color: #ec4899;">Phone:</strong> ${phone}</p>
              </div>
              
              <div style="margin: 20px 0; padding: 15px; background-color: #fff7ed; border-left: 4px solid #f97316; border-radius: 4px;">
                <p style="margin: 8px 0;"><strong style="color: #f97316;">Service:</strong> ${service}</p>
                <p style="margin: 8px 0;"><strong style="color: #f97316;">Preferred Date:</strong> ${formattedDate}</p>
                <p style="margin: 8px 0;"><strong style="color: #f97316;">Preferred Time:</strong> ${time}</p>
              </div>
              
              ${message ? `
                <div style="margin: 20px 0; padding: 15px; background-color: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
                  <p style="margin: 0;"><strong style="color: #3b82f6;">Additional Notes:</strong></p>
                  <p style="margin: 10px 0 0 0; color: #555;">${message}</p>
                </div>
              ` : ''}
              
              <div style="margin-top: 30px; padding: 20px; background-color: #fef3f9; border-radius: 8px; text-align: center;">
                <p style="color: #ec4899; font-weight: bold; margin: 0 0 10px 0;">👉 Action Required</p>
                <p style="color: #555; font-size: 14px; margin: 0;">
                  Please contact the customer to confirm this booking.<br/>
                  Update the booking status in your database after confirmation.
                </p>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #f0f0f0; text-align: center;">
                <p style="color: #888; font-size: 14px; margin: 0;">
                  This is an automated notification from Satguru Makeup Art booking system
                </p>
              </div>
            </div>
          </div>
        `,
      }),
    });

    if (!ownerEmailResponse.ok) {
      const errorData = await ownerEmailResponse.text();
      console.error('Owner email error:', errorData);
      throw new Error(`Failed to send owner notification - ${errorData}`);
    }

    // Email 2: Send confirmation summary to admin (Resend test mode restriction)
    // In test mode, Resend only allows sending to verified email (charvraj2006@gmail.com)
    const customerEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Satguru Makeup Art <onboarding@resend.dev>',
        to: ['charvraj2006@gmail.com'],
        subject: `📧 Customer Confirmation Sent to ${name}`,
        replyTo: email,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">📧 Customer Email Preview</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-weight: bold;">⚠️ Test Mode Notice</p>
                <p style="margin: 5px 0 0 0; color: #92400e; font-size: 14px;">
                  This is what would be sent to: <strong>${email}</strong><br/>
                  To send to customers, verify your domain in Resend.
                </p>
              </div>
              
              <hr style="border: none; border-top: 2px solid #e5e7eb; margin: 20px 0;">
              
              <p style="color: #333; font-size: 16px; margin-top: 0;">Dear ${name},</p>
              <p style="color: #555; line-height: 1.6;">
                Thank you for choosing <strong>Satguru Makeup Art</strong>! We have received your booking request and will contact you shortly to confirm your appointment.
              </p>
              
              <div style="margin: 25px 0; padding: 20px; background-color: #fef3f9; border-left: 4px solid #ec4899; border-radius: 4px;">
                <h3 style="color: #ec4899; margin: 0 0 15px 0; font-size: 18px;">📋 Your Booking Details</h3>
                <p style="margin: 8px 0; color: #333;"><strong>Service:</strong> ${service}</p>
                <p style="margin: 8px 0; color: #333;"><strong>Date:</strong> ${formattedDate}</p>
                <p style="margin: 8px 0; color: #333;"><strong>Time:</strong> ${time}</p>
                <p style="margin: 8px 0; color: #333;"><strong>Phone:</strong> ${phone}</p>
                ${message ? `<p style="margin: 8px 0; color: #333;"><strong>Notes:</strong> ${message}</p>` : ''}
              </div>
              
              <div style="margin: 25px 0; padding: 20px; background-color: #fff7ed; border-radius: 8px;">
                <h4 style="color: #f97316; margin: 0 0 10px 0; font-size: 16px;">⏳ What's Next?</h4>
                <ul style="color: #555; line-height: 1.8; margin: 10px 0; padding-left: 20px;">
                  <li>Our team will review your request</li>
                  <li>We'll contact you via phone or email to confirm</li>
                  <li>You can check your booking status in your profile</li>
                </ul>
              </div>
              
              <div style="margin: 25px 0; padding: 20px; background-color: #f0f9ff; border-radius: 8px; text-align: center;">
                <p style="color: #555; margin: 0; font-size: 14px;">
                  <strong>Need to make changes?</strong><br/>
                  Please contact us or cancel from your profile if needed.
                </p>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #f0f0f0; text-align: center;">
                <p style="color: #333; font-size: 16px; margin: 0 0 10px 0;">
                  <strong>Satguru Makeup Art</strong>
                </p>
                <p style="color: #888; font-size: 14px; margin: 0;">
                  Singhana, Rajasthan 333516<br/>
                  Making beauty dreams come true ✨
                </p>
              </div>
            </div>
          </div>
        `,
      }),
    });

    if (!customerEmailResponse.ok) {
      const errorData = await customerEmailResponse.text();
      console.error('Customer email error:', errorData);
      // Don't throw - owner notification already sent
    }

    const ownerData = await ownerEmailResponse.json();
    const customerData = customerEmailResponse.ok ? await customerEmailResponse.json() : null;
    
    console.log('Emails sent successfully - Owner:', ownerData.id, 'Customer Preview:', customerData?.id || 'N/A (test mode)');

    return new Response(
      JSON.stringify({ 
        success: true, 
        ownerEmailId: ownerData.id,
        customerEmailId: customerData?.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in send-booking-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
