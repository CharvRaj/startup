const fs = require('fs');
const path = require('path');

// Dictionary of explicit string replacements
const exactReplacements = [
  // Toasts and Labels
  ['✨ Service Added Successfully!', 'Service Added Successfully!'],
  ['✨ Service Added (Local / DB)', 'Service Added (Local / DB)'],
  ['🟢 Service Active', 'Service Active'],
  ['⚪ Service Inactive', 'Service Inactive'],
  ['🗑️ Service Deleted', 'Service Deleted'],
  ['✅ Query Resolver Created!', 'Query Resolver Created!'],
  ['🔒 Password Updated Securely', 'Password Updated Securely'],
  ['🟢 Resolver Activated', 'Resolver Activated'],
  ['⚪ Resolver Deactivated', 'Resolver Deactivated'],
  ['🗑️ Resolver removed', 'Resolver removed'],
  ['📋 Copied!', 'Copied!'],
  ['✅ Copied!', 'Copied!'],
  ['✅ Link Copied!', 'Link Copied!'],
  ['Copied! 📋', 'Copied!'],
  ['Copied! 🎉', 'Copied!'],
  ['✅ Stylist Assigned', 'Stylist Assigned'],
  ['🟢 Stylist Online', 'Stylist Online'],
  ['⚪ Stylist Offline', 'Stylist Offline'],
  ['⭕ Stylist Offline', 'Stylist Offline'],
  ['Online 🟢', 'Online'],
  ['Offline ⚪', 'Offline'],
  ['⛔ Stylist Suspended', 'Stylist Suspended'],
  ['💰 Wallet Credited!', 'Wallet Credited!'],
  ['💸 Wallet Debited', 'Wallet Debited'],
  ['🎉 Booking Confirmed!', 'Booking Confirmed!'],
  ['Booking Confirmed! 🎉', 'Booking Confirmed!'],
  ['✨ Service Completed!', 'Service Completed!'],
  ['📝 Booking Update', 'Booking Update'],
  ['✅ Status Updated', 'Status Updated'],
  ['✅ Order Confirmed!', 'Order Confirmed!'],
  ['👩‍🎨 Expert Assigned!', 'Expert Assigned!'],
  ['👩‍🎨 Mehndi Expert Assigned!', 'Mehndi Expert Assigned!'],
  ['🚗 Expert On The Way!', 'Expert On The Way!'],
  ['📍 Expert Arrived!', 'Expert Arrived!'],
  ['🌸 Service Complete!', 'Service Complete!'],
  ['📝 Order Cancelled', 'Order Cancelled'],
  ['✅ Approved', 'Approved'],
  ['❌ Rejected', 'Rejected'],
  ['✅ Approved & Credentials Set!', 'Approved & Credentials Set!'],
  ['✅ Reply sent!', 'Reply sent!'],
  ['✅ Reply sent to customer', 'Reply sent to customer'],
  ['✅ Image Uploaded!', 'Image Uploaded!'],
  ['✅ Story Added!', 'Story Added!'],
  ['✨ Latest Story Added!', 'Latest Story Added!'],
  ['✅ Announcement published!', 'Announcement published!'],
  ['✅ SOS Resolved', 'SOS Resolved'],
  ['✅ Ticket Submitted Successfully!', 'Ticket Submitted Successfully!'],
  ['✅ Beauty Profile Saved!', 'Beauty Profile Saved!'],
  ['📅 Booking Rescheduled', 'Booking Rescheduled'],
  ['✅ Booking Rescheduled!', 'Booking Rescheduled!'],
  ['Review Submitted! ✨', 'Review Submitted!'],
  ['Profile Updated! ✨', 'Profile Updated!'],
  ['Profile Updated ✅', 'Profile Updated'],
  ['Coupon Applied! 🎉', 'Coupon Applied!'],
  ['🎉 Coupon Applied!', 'Coupon Applied!'],
  ['🎉 Order Placed!', 'Order Placed!'],
  ['🎉 Mehndi Order Placed!', 'Mehndi Order Placed!'],
  ['✅ Location Captured', 'Location Captured'],
  ['Location Captured ✅', 'Location Captured'],
  ['📍 Location Captured!', 'Location Captured!'],
  ['📍 Location Captured', 'Location Captured'],
  ['📍 Use My Current Location', 'Use My Current Location'],
  ['✅ OTP Sent!', 'OTP Sent!'],
  ['✅ OTP Resent!', 'OTP Resent!'],
  ['📧 OTP Sent!', 'OTP Sent!'],
  ['✅ Email Verified!', 'Email Verified!'],
  ['🎉 Application Submitted!', 'Application Submitted!'],
  ['✅ Account Activated', 'Account Activated'],
  ['✅ Notification Sent', 'Notification Sent'],
  ['✅ Earnings Updated', 'Earnings Updated'],
  ['📢 Admin Notification', 'Admin Notification'],
  ['📋 Complaint Registered', 'Complaint Registered'],
  ['🔒 Internal note saved', 'Internal note saved'],
  ['🔄 Tickets Synced', 'Tickets Synced'],
  ['🎧 Help Desk Logged In', 'Help Desk Logged In'],
  ['✨ Stylist Partner Logged In', 'Stylist Partner Logged In'],
  ['🏪 Partner Logged In', 'Partner Logged In'],
  ['👑 Welcome back, Charv!', 'Welcome back, Charv!'],
  ['Thanks for Contacting Us! ✨', 'Thanks for Contacting Us!'],
  ['💌 Thanks for Contacting Us!', 'Thanks for Contacting Us!'],
  ['Booking Details Pre-filled ✨', 'Booking Details Pre-filled'],
  ['Saved to Wishlist ❤️', 'Saved to Wishlist'],
  ['✨ Added to Cart!', 'Added to Cart'],
  ['✨ Added to Mehndi Cart!', 'Added to Mehndi Cart'],
  ['🛒 Added to Cart!', 'Added to Cart'],
  ['🛒 Added to Cart', 'Added to Cart'],

  // Navigation and button labels
  ['🎧 Query Resolvers', 'Query Resolvers'],
  ['🛍️ Services & Mehndi', 'Services & Mehndi'],
  ['✨ Promo Banners', 'Promo Banners'],
  ['🎁 Refer & Earn Cash', 'Refer & Earn Cash'],
  ['Refer & Earn ✨', 'Refer & Earn'],
  ['🔐 Partner Portal Login', 'Partner Portal Login'],
  ['🎫 My Bookings & Query Desk', 'My Bookings & Query Desk'],
  ['💇‍♀️ Doorstep Salon', 'Doorstep Salon'],
  ['🎨 Mehndi Art', 'Mehndi Art'],
  ['🎨 Mehndi', 'Mehndi'],
  ['🏠 Doorstep', 'Doorstep'],
  ['🚗 On The Way', 'On The Way'],
  ['🚗 Mark On The Way', 'Mark On The Way'],
  ['📍 Arrived', 'Arrived'],
  ['📍 Mark Arrived', 'Mark Arrived'],
  ['✅ Mark Serviced', 'Mark Serviced'],
  ['🟢 Live Circle', 'Live Circle'],
  ['🟢 Live Desk', 'Live Desk'],
  ['🟢 Online', 'Online'],
  ['⚪ Offline', 'Offline'],
  ['⚪ Inactive', 'Inactive'],
  ['🟢 Active', 'Active'],
  ['⏸ Paused', 'Paused'],
  ['✅ Approve & Save', 'Approve & Save'],
  ['Add to Homepage Circles ✨', 'Add to Homepage Circles'],
  ['Mark Ticket as Resolved ✨', 'Mark Ticket as Resolved'],
  ['✨ Satguru Makeup Art', 'Satguru Makeup Art'],
  ['Thank you for choosing Satguru Makeup Art! ✨', 'Thank you for choosing Satguru Makeup Art!'],
  ['Service completed! Thank you for choosing us ✨', 'Service completed! Thank you for choosing us.'],
  ['Write a Review ✨', 'Write a Review'],
  ['✨ Resolver:', 'Resolver:'],
  ['✨ Resolver Response', 'Resolver Response'],
  ['✨ Beauty Tip For You', 'Beauty Tip For You'],
  ['✨ Beauty Tip:', 'Beauty Tip:'],
  ['✨ Get AI Picks', 'Get AI Picks'],
  ['Shop & Redeem Points ✨', 'Shop & Redeem Points'],
  ['Congrats! You get FREE doorstep service 🎉', 'Congrats! You get FREE doorstep service!'],
  ['Sign In ✨', 'Sign In'],
  ['Join Us ✨', 'Join Us'],
  ['Send Verification Code ✉️', 'Send Verification Code'],
  ['Complete Registration 🎉', 'Complete Registration'],
  ['🔒 Secure login with end-to-end encryption', 'Secure login with end-to-end encryption'],
  ['Reach out anytime 💬', 'Reach out anytime.'],
  ['Watch Our Artists in Action 💄', 'Watch Our Artists in Action'],
  ['Sia AI Assistant ✨', 'Sia AI Assistant'],
  ['Welcome to {planName}! 🎉', 'Welcome to {planName}!'],
  ['Activate {planName} ✨', 'Activate {planName}'],
  ['🎁 500 Loyalty Points Credited', '500 Loyalty Points Credited'],
  ['✨ Booking Confirmed', 'Booking Confirmed'],
  ['✅ Confirm Reschedule', 'Confirm Reschedule'],
  ['🚨 Urgent (<1h)', 'Urgent (<1h)'],
  ['⚡ High (<2h)', 'High (<2h)'],
  ['🔒 Private to resolvers only', 'Private to resolvers only'],
  ['💬 Will be delivered to client', 'Will be delivered to client'],
];

// Files to process
const targetFiles = [
  'src/pages/Admin.tsx',
  'src/pages/Profile.tsx',
  'src/pages/Checkout.tsx',
  'src/components/query/RaiseQueryModal.tsx',
  'src/pages/StylistProfile.tsx',
  'src/pages/TrackExecutive.tsx',
  'src/pages/MehndiCheckout.tsx',
  'src/pages/MehndiService.tsx',
  'src/pages/MemberDashboard.tsx',
  'src/pages/QueryResolverDashboard.tsx',
  'src/lib/banners.ts',
  'src/pages/AssociateDashboard.tsx',
  'src/pages/Login.tsx',
  'src/components/query/UserTicketDetailsModal.tsx',
  'src/pages/ContactUs.tsx',
  'src/lib/stories.ts',
  'src/pages/BeautyProfile.tsx',
  'src/pages/Membership.tsx',
  'src/components/admin/PromotionalBannersAdmin.tsx',
  'src/lib/queryTicketService.ts',
  'src/pages/AssociateWithUs.tsx',
  'src/pages/Signup.tsx',
  'src/components/Chat.tsx',
  'src/components/dashboard/GuidedBookingModal.tsx',
  'src/components/FloatingCoupon.tsx',
  'src/components/sections/Booking.tsx',
  'src/pages/Cart.tsx',
  'src/pages/MehndiCart.tsx',
  'src/pages/OrderTracking.tsx',
  'src/pages/Referral.tsx',
  'src/pages/StylistRegistration.tsx',
  'src/components/FloatingAssistant.tsx',
  'src/components/layout/Footer.tsx',
  'src/components/sections/Hero.tsx',
  'src/lib/notifications.ts',
  'src/components/dashboard/UserDashboardOverview.tsx',
  'src/pages/HelpSupport.tsx',
  'src/pages/MembershipPayment.tsx',
  'src/pages/PartnerLogin.tsx',
  'src/pages/Stylists.tsx',
  'src/components/dashboard/AddMoneyModal.tsx',
  'src/components/FloatingVideo.tsx',
  'src/components/sections/QuickGlowBanner.tsx',
  'src/components/sections/Services.tsx',
  'src/pages/Complaints.tsx',
  'src/pages/DoorstepService.tsx',
  'src/pages/Home.tsx',
];

let totalModified = 0;

targetFiles.forEach(f => {
  const full = path.resolve(__dirname, '..', f);
  if (!fs.existsSync(full)) return;
  let content = fs.readFileSync(full, 'utf8');
  let original = content;

  // Apply exact replacements
  for (const [from, to] of exactReplacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
    }
  }

  // Remove generic trailing/floating emojis in toasts and messages
  content = content.replace(/🎉/g, '');
  content = content.replace(/✨/g, '');
  content = content.replace(/❤️/g, '');
  content = content.replace(/💄/g, '');
  content = content.replace(/💅/g, '');
  content = content.replace(/🌸/g, '');
  content = content.replace(/👑/g, '');
  content = content.replace(/🎁/g, '');
  content = content.replace(/🛍️/g, '');
  content = content.replace(/🛒/g, '');
  content = content.replace(/🎧/g, '');
  content = content.replace(/🏪/g, '');
  content = content.replace(/📋/g, '');
  content = content.replace(/📢/g, '');
  content = content.replace(/💬/g, '');
  content = content.replace(/🔒/g, '');
  content = content.replace(/🔓/g, '');
  content = content.replace(/🟢/g, '');
  content = content.replace(/⭕/g, '');
  content = content.replace(/⚪/g, '');
  content = content.replace(/⛔/g, '');
  content = content.replace(/💰/g, '');
  content = content.replace(/💸/g, '');
  content = content.replace(/💳/g, '');
  content = content.replace(/📧/g, '');
  content = content.replace(/✉️/g, '');
  content = content.replace(/🚗/g, '');
  content = content.replace(/📍/g, '');
  content = content.replace(/🏠/g, '');
  content = content.replace(/👩‍🎨/g, '');
  content = content.replace(/👋/g, '');
  content = content.replace(/🌟/g, '');
  content = content.replace(/⭐/g, '');
  content = content.replace(/💝/g, '');
  content = content.replace(/💼/g, '');
  content = content.replace(/🥇/g, '');
  content = content.replace(/🥈/g, '');
  content = content.replace(/🥉/g, '');
  content = content.replace(/💎/g, '');
  content = content.replace(/⏸/g, '');
  content = content.replace(/ℹ️/g, '');
  content = content.replace(/📷/g, '');
  content = content.replace(/📄/g, '');
  content = content.replace(/📎/g, '');
  content = content.replace(/✅/g, '');
  content = content.replace(/❌/g, '');
  content = content.replace(/⚠️/g, '');

  if (content !== original) {
    fs.writeFileSync(full, content, 'utf8');
    totalModified++;
    console.log('Cleaned emojis in:', f);
  }
});

console.log('Finished! Modified files:', totalModified);
