# WhatsApp Setup Guide - Satguru Makeup Art

## ⚠️ Important: Twilio WhatsApp Sandbox Setup Required

WhatsApp notifications require one-time setup for both you (admin) and your customers.

---

## For You (Admin) - First Time Setup

### Step 1: Join Twilio WhatsApp Sandbox

1. **Open WhatsApp on Your Phone**

2. **Add Twilio's Number**
   - Contact: **+1 (415) 523-8886**

3. **Send Join Message**
   - Type: `join <your-code>`
   - Wait for confirmation message

4. **Get Your Sandbox Code**
   - Login to [Twilio Console](https://console.twilio.com)
   - Go to: **Messaging** → **Try it out** → **Send a WhatsApp message**
   - You'll see something like: `join orange-tiger`
   - This is your unique code

### Step 2: Test WhatsApp Notifications

1. Make a test booking
2. Confirm the booking in admin panel
3. Check your WhatsApp - you should receive confirmation message

---

## For Your Customers

**IMPORTANT:** Each customer must join the sandbox to receive WhatsApp messages.

### Customer Instructions

Share these steps with your customers:

```
To receive booking confirmations on WhatsApp:

1. Save this number: +1 (415) 523-8886
2. Send this message: join orange-tiger
   (replace 'orange-tiger' with your actual code)
3. You'll get a confirmation message
4. Done! You'll now receive booking updates
```

### When Customer Books

After they join the sandbox:
1. Customer makes booking on your website
2. You confirm booking in admin panel
3. Customer receives:
   - ✅ Email confirmation (always works)
   - ✅ WhatsApp message (if they joined sandbox)

---

## Production WhatsApp (No Sandbox Required)

For professional use without requiring customers to join:

### Option 1: Twilio WhatsApp Business API

**Requirements:**
- Facebook Business Account
- WhatsApp Business Account
- Twilio Pro/Premier account
- Business verification

**Steps:**
1. Login to [Twilio Console](https://console.twilio.com)
2. Go to **Messaging** → **WhatsApp** → **Senders**
3. Click **Request to add WhatsApp Sender**
4. Follow Facebook Business verification process
5. Wait for approval (7-14 days)

**Cost:**
- Setup: Free
- Messages: ~₹0.50 per message (India)
- Monthly: Depends on volume

### Option 2: Third-Party WhatsApp Services

Easier alternatives with instant setup:

**Recommended Services:**

1. **WATI (India-focused)**
   - Website: wati.io
   - Cost: Starting ₹2,500/month
   - Setup: 5 minutes
   - No customer sandbox needed

2. **Aisensy**
   - Website: aisensy.com
   - Cost: Starting ₹1,999/month
   - WhatsApp Business API included
   - Templates approved quickly

3. **Gupshup**
   - Website: gupshup.io
   - Pay-per-message pricing
   - Good for Indian businesses

**How to Switch:**
1. Sign up with chosen service
2. Get API credentials
3. Update Edge Function `send-whatsapp/index.ts`
4. Replace Twilio code with new provider's API

---

## Current Setup (Sandbox Mode)

### What Works Now

✅ **For You (Admin):**
- Receive WhatsApp notifications when bookings confirmed
- No cost (Twilio free tier)
- Instant setup

✅ **For Customers:**
- Receive WhatsApp confirmations
- Must join sandbox first (one-time, 30 seconds)

### What Doesn't Work

❌ **Limitations:**
- Customers must manually join sandbox
- 24-hour session timeout (need to send message again)
- Twilio branding in messages
- Not suitable for large customer base

---

## Troubleshooting

### WhatsApp Not Sending

**Check This:**
1. ✅ Did customer join Twilio sandbox?
2. ✅ Is phone number correct? (Format: +919887196182)
3. ✅ Check Edge Function logs in OnSpace Cloud
4. ✅ Verify Twilio credentials are configured

### Message Says "Failed"

**Possible Reasons:**
- Customer didn't join sandbox
- Phone number format wrong
- 24-hour session expired
- Twilio account issue

**Solution:**
```
1. Ask customer to rejoin sandbox:
   - Send: join <your-code>
   - To: +1 (415) 523-8886

2. Confirm the booking again in admin panel
```

### Customer Says "Not Received"

**Quick Fix:**
1. Check their phone number in booking details
2. Ask them to join sandbox (if not done)
3. Resend by clicking "Confirm" again in admin panel

---

## Recommended Path Forward

### For Testing (Current Setup)
Keep Twilio sandbox - perfect for testing and small customer base

### For Production (100+ customers/month)
Switch to WATI or Aisensy:
- ₹2,000-3,000/month
- No customer setup needed
- Professional appearance
- Better deliverability

### For High Volume (1000+ customers/month)
Get Twilio WhatsApp Business API:
- Pay-per-message (₹0.50-₹1.00)
- Lower cost at scale
- Official WhatsApp verified sender

---

## Need Help?

**Twilio Support:**
- Help Center: support.twilio.com
- Sandbox Guide: twilio.com/docs/whatsapp/sandbox

**Admin Email:**
- charvraj2006@gmail.com

**Quick Test:**
1. Join sandbox yourself
2. Make test booking
3. Confirm in admin panel
4. Check WhatsApp message received

---

## Summary

**Current Status:**
- ✅ Email notifications: Working (all customers)
- ⚠️ WhatsApp notifications: Working (sandbox mode)
- 🔄 Password reset: New feature added

**Next Steps:**
1. Join Twilio sandbox yourself
2. Test with a friend/family member
3. Share join instructions with customers
4. Consider upgrading to production WhatsApp if needed

**Cost Comparison:**

| Solution | Setup Time | Monthly Cost | Customer Setup |
|----------|-----------|--------------|----------------|
| Twilio Sandbox (Current) | 5 min | Free | Required |
| WATI/Aisensy | 15 min | ₹2,000-3,000 | Not required |
| Twilio Business API | 7-14 days | Pay-per-msg | Not required |
