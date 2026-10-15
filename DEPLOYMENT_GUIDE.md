# Deployment Guide - Satguru Makeup Art

## Issue: Admin Panel Not Showing Bookings from Netlify

If bookings work but don't appear in the admin panel, it's likely an environment variable issue.

### Solution: Configure Netlify Environment Variables

1. **Go to Netlify Dashboard**
   - Open your Netlify site
   - Navigate to: **Site Settings** → **Build & Deploy** → **Environment Variables**

2. **Add These Environment Variables**

   ```
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

3. **Where to Find Your Values?**
   - Open OnSpace Cloud panel (right side)
   - Copy the values from your project settings
   - OR check your local `.env` file

4. **Redeploy Your Site**
   - After adding variables, click **Trigger Deploy**
   - Wait for deployment to complete
   - Test admin panel again

---

## WhatsApp Setup Guide

### Prerequisites
Your Twilio account is already configured. Now you need to set up WhatsApp:

### Step 1: Join Twilio WhatsApp Sandbox

1. **Send WhatsApp Message to Twilio**
   - Open WhatsApp on your phone
   - Send message to: **+1 415 523 8886**
   - Message: `join <your-sandbox-code>`
   - You'll get this code from Twilio Console

2. **Get Your Sandbox Code**
   - Login to [Twilio Console](https://console.twilio.com)
   - Go to: **Messaging** → **Try it out** → **Send a WhatsApp message**
   - You'll see your unique sandbox code (e.g., `join orange-tiger`)

3. **Ask Your Customers to Join Too**
   - Each customer must join the sandbox to receive messages
   - They send: `join <your-code>` to **+1 415 523 8886**

### Step 2: Production WhatsApp (Optional)

For production use without sandbox:
1. Apply for Twilio WhatsApp Business API
2. Get your own WhatsApp Business Number
3. Update the Edge Function with your number

---

## Password Reset Feature

Now available at: `/forgot-password`

**How It Works:**
1. User clicks "Forgot Password?" on login page
2. Enters email address
3. Receives 4-digit OTP via email
4. Enters OTP and new password
5. Password is reset successfully

**Features:**
- Email-based OTP verification
- Secure password reset flow
- Minimum 6-character password requirement
- Success confirmation screen

---

## Debugging Admin Panel Issues

### 1. Check Browser Console
Open DevTools (F12) and look for:
```
[Admin] Fetching bookings from database...
[Admin] Supabase URL: https://your-project.supabase.co
[Admin] Successfully fetched bookings: 5
```

If you see errors, check:
- Environment variables are set correctly
- Database connection is working
- RLS policies allow reading bookings

### 2. Test Database Connection

Run this in browser console:
```javascript
const { data, error } = await supabase.from('bookings').select('count');
console.log('Database test:', data, error);
```

### 3. Verify Environment Variables

In your deployed site, check if variables are loaded:
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

If these are `undefined`, environment variables aren't configured in Netlify.

---

## Testing Checklist

### Before Going Live
- [ ] Environment variables configured in Netlify
- [ ] Admin panel shows existing bookings
- [ ] New bookings appear in admin panel (auto-refresh works)
- [ ] Email notifications working
- [ ] WhatsApp sandbox joined (you + test customers)
- [ ] Password reset flow tested
- [ ] All features work on deployed site

### After Deployment
1. Make a test booking from deployed site
2. Check admin panel (should auto-refresh in 15 seconds)
3. Confirm the booking in admin panel
4. Verify email and WhatsApp sent

---

## Common Issues & Solutions

### Issue: "Failed to load bookings"
**Solution:** Check environment variables in Netlify

### Issue: WhatsApp not sending
**Solution:** 
- Verify customer joined Twilio sandbox
- Check Twilio credentials in Edge Function secrets
- Phone number must be in format: +919887196182

### Issue: Auto-refresh not working
**Solution:** 
- Check "Auto-refresh" checkbox in admin panel
- Manually click "Refresh" button
- Check browser console for errors

### Issue: Forgot password OTP not received
**Solution:**
- Check spam folder
- Verify email address is correct
- Check Resend API key is configured

---

## Support Contacts

**For Admin Issues:**
- Email: charvraj2006@gmail.com

**For Technical Help:**
- Check browser console (F12)
- Review OnSpace Cloud logs
- Contact OnSpace support

---

## Quick Commands

**Redeploy on Netlify:**
```
git add .
git commit -m "Update environment variables"
git push origin main
```

**Test locally:**
```
npm run dev
```

**Check environment:**
```
npm run build
```
