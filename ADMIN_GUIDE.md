# Admin Panel Guide - Satguru Makeup Art

## How to Access Admin Panel
1. Login with admin email: **charvraj2006@gmail.com**
2. Click **"Admin"** button in navigation
3. You'll see two tabs: **Bookings** and **Gallery**

---

## Managing Bookings

### Booking Status Workflow

Your bookings go through 4 stages:

```
1. PENDING → 2. CONFIRMED → 3. COMPLETED
              ↓
           CANCELLED (optional)
```

### Step-by-Step Process

#### 1. **New Booking Arrives (PENDING)**
- Customer submits booking request
- You receive email notification at: **charvraj2006@gmail.com**
- Booking shows as **yellow "Pending"** status

#### 2. **Confirm the Booking**
- Review booking details (name, service, date, time)
- Click **"Confirm"** button
- ✅ **Email notification sent to admin** (you)
- ✅ **Customer preview email sent to admin** (due to Resend test mode)
- Status changes to **green "Confirmed"**

> **Note**: SMS notifications have been removed. Only email notifications are active.

#### 3. **Mark as Completed (SUCCESS)**
After the appointment is done:
- Find the confirmed booking
- Click **"Mark Complete"** button
- Status changes to **blue "Completed"**
- This tracks your finished appointments

#### 4. **Cancel a Booking (Optional)**
If customer cancels or doesn't show up:
- Click **"Cancel"** button on pending bookings
- Status changes to **red "Cancelled"**

---

## Email Notifications

### Current Email Setup
- **Email Service**: Resend (Test Mode)
- **Admin Email**: charvraj2006@gmail.com

### What Emails You Receive

1. **New Booking Notification** (When customer books)
   - Subject: "🔔 New Booking Request from [Name]"
   - Contains: Full booking details

2. **Customer Confirmation Preview** (When you click "Confirm")
   - Subject: "📧 Customer Confirmation Sent to [Name]"
   - Shows what customer would receive in production mode

### Important: Test Mode Limitation
⚠️ **Resend is in test mode** - Customer emails only go to you (charvraj2006@gmail.com)

**To send emails to actual customers:**
1. Go to Resend.com dashboard
2. Verify your domain (e.g., satgurumakeupart.com)
3. Update sender email from `onboarding@resend.dev` to `noreply@yourdomain.com`

---

## Managing Gallery

### Upload Single Image
1. Go to **Gallery** tab
2. Enter image title (e.g., "Bridal Makeup - January 2025")
3. Click **"Choose Image"**
4. Select image from your computer
5. Image uploads automatically

### Import from Google Drive
1. Paste Google Drive share links (one per line)
2. Click **"Import from Google Drive"**
3. Images download and upload automatically

### Delete Images
1. Hover over any image
2. Click **"Delete"** button
3. Confirm deletion

---

## Quick Reference

| Action | Button | Result |
|--------|--------|--------|
| Confirm booking | Green "Confirm" | Sends emails + status → Confirmed |
| Mark successful | Blue "Mark Complete" | Status → Completed |
| Cancel booking | Red "Cancel" | Status → Cancelled |
| Upload photo | "Choose Image" | Adds to gallery |
| Delete photo | "Delete" (on hover) | Removes from gallery |

---

## Need Help?
- Check email: charvraj2006@gmail.com for all notifications
- Gallery images appear on homepage automatically
- All booking changes are instant

**Current Setup:**
✅ Email notifications: Active (test mode)
❌ SMS notifications: Removed
✅ Gallery management: Fully functional
✅ Booking status tracking: Complete workflow
