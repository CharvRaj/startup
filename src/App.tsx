import { ErrorBoundary } from '@/components/ErrorBoundary';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { Reviews } from './pages/Reviews';
import { DoorstepService } from './pages/DoorstepService';
import { MehndiService } from './pages/MehndiService';
import { ServiceDetail } from './pages/ServiceDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { MehndiCart } from './pages/MehndiCart';
import { MehndiCheckout } from './pages/MehndiCheckout';
import { ContactUs } from './pages/ContactUs';
import { Stylists } from './pages/Stylists';
import { Membership } from './pages/Membership';
import { Analytics } from './pages/Analytics';
import { BeautyProfile } from './pages/BeautyProfile';
import { AssociateWithUs } from './pages/AssociateWithUs';
import { StylistRegistration } from './pages/StylistRegistration';
import { MembershipPayment } from './pages/MembershipPayment';
import { OrderTracking } from './pages/OrderTracking';
import { TrackExecutive } from './pages/TrackExecutive';
import { Referral } from './pages/Referral';
import { MemberDashboard } from './pages/MemberDashboard';
import { AssociateDashboard } from './pages/AssociateDashboard';
import { PartnerLogin } from './pages/PartnerLogin';
import { StylistProfile } from './pages/StylistProfile';
import { Complaints } from './pages/Complaints';
import { QueryResolverLogin } from './pages/QueryResolverLogin';
import { QueryResolverDashboard } from './pages/QueryResolverDashboard';
import { HelpSupport } from './pages/HelpSupport';
import { BeautyStudio } from './pages/BeautyStudio';
import { DiwaliLanding } from './pages/DiwaliLanding';
import { VirtualStudio } from './pages/VirtualStudio';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { FloatingAssistant } from '@/components/FloatingAssistant';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { FloatingCoupon } from '@/components/FloatingCoupon';
import { SplashScreen } from '@/components/SplashScreen';
import { FloatingHelpButton } from '@/components/FloatingHelpButton';
import { ThemeProvider } from '@/context/ThemeContext';

const HIDE_HEADER_FOOTER_PATHS = [
  '/login', '/signup', '/forgot-password',
  '/member-dashboard', '/associate-dashboard', '/partner-login',
  '/track-executive', '/admin',
  '/query-resolver-login', '/query-resolver-dashboard',
  '/profile', '/dashboard', '/help-support',
];

// These paths hide header/footer via startsWith
const HIDE_STARTS_WITH = ['/admin', '/query-resolver-dashboard'];

function AppContent() {
  const location = useLocation();
  const hideHeaderFooter = HIDE_HEADER_FOOTER_PATHS.some(p =>
    location.pathname === p || location.pathname.startsWith(p + '?')
  ) || HIDE_STARTS_WITH.some(p => location.pathname.startsWith(p));

  return (
    <div className="page-transition min-h-screen bg-background text-foreground transition-colors duration-300">
      <SplashScreen />
      {!hideHeaderFooter && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/diwali" element={<DiwaliLanding />} />
        <Route path="/diwali-mahotsav" element={<DiwaliLanding />} />
        <Route path="/virtual-studio" element={<VirtualStudio />} />
        <Route path="/beauty-studio" element={<VirtualStudio />} />
        <Route path="/blindglow-ai" element={<VirtualStudio />} />
        <Route path="/ai-glow" element={<VirtualStudio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Profile />} />
        <Route path="/help-support" element={<HelpSupport />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/doorstep-service" element={<DoorstepService />} />
        <Route path="/doorstep-service/:id" element={<ServiceDetail />} />
        <Route path="/service/:id" element={<ServiceDetail />} />
        <Route path="/mehndi-service" element={<MehndiService />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/mehndi-cart" element={<MehndiCart />} />
        <Route path="/mehndi-checkout" element={<MehndiCheckout />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/stylists" element={<Stylists />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/beauty-profile" element={<BeautyProfile />} />
        <Route path="/associate" element={<AssociateWithUs />} />
        <Route path="/join-team" element={<StylistRegistration />} />
        <Route path="/membership-payment" element={<MembershipPayment />} />
        <Route path="/order-tracking" element={<OrderTracking />} />
        <Route path="/track-executive" element={<TrackExecutive />} />
        <Route path="/referral" element={<Referral />} />
        <Route path="/member-dashboard" element={<MemberDashboard />} />
        <Route path="/associate-dashboard" element={<AssociateDashboard />} />
        <Route path="/partner-login" element={<PartnerLogin />} />
        <Route path="/admin/stylist/:id" element={<StylistProfile />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/query-resolver-login" element={<QueryResolverLogin />} />
        <Route path="/query-resolver-dashboard" element={<QueryResolverDashboard />} />
      </Routes>
      {!hideHeaderFooter && <Footer />}
      <FloatingHelpButton />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
        <Toaster />
        <FloatingWhatsApp />
        <FloatingAssistant />
        <FloatingCoupon />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
