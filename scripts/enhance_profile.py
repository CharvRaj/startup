import re

path = 'src/pages/Profile.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update activeTab type to include 'partner'
old_tab_type = "  const [activeTab, setActiveTab] = useState<\n    'home' | 'bookings' | 'home-services' | 'orders' | 'reviews' | 'loyalty' | 'wallet' | 'beauty' | 'settings' | 'support' | 'queries'\n  >('home');"
new_tab_type = "  const [activeTab, setActiveTab] = useState<\n    'home' | 'bookings' | 'home-services' | 'orders' | 'reviews' | 'loyalty' | 'wallet' | 'beauty' | 'settings' | 'support' | 'queries' | 'partner'\n  >('home');"
assert old_tab_type in content, "old_tab_type not found"
content = content.replace(old_tab_type, new_tab_type, 1)

# 2. Add partner state variables
state_target = "  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);"
state_addition = """  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Partner / Associate Application Tracking State (only for users who submitted application)
  const [partnerApplication, setPartnerApplication] = useState<any>(null);
  const [sessionAuthModalOpen, setSessionAuthModalOpen] = useState(false);
  const [sessionPasswordInput, setSessionPasswordInput] = useState('');
  const [sessionAuthError, setSessionAuthError] = useState('');
  const [resubmitModalOpen, setResubmitModalOpen] = useState(false);
  const [resubmitFile, setResubmitFile] = useState<File | null>(null);
  const [resubmitting, setResubmitting] = useState(false);"""
assert state_target in content, "state_target not found"
content = content.replace(state_target, state_addition, 1)

# 3. Add fetchPartnerApplication, handleAuthenticatePartnerSession, handleResubmitPartnerDoc before fetchAllData
fetch_target = "  const fetchAllData = async () => {\n    await Promise.all([fetchBookings(), fetchOrders(), fetchMyReviews(), fetchLoyaltyPoints(), fetchActiveMembership(), fetchWallet(), fetchSupportTickets()]);"

partner_funcs = """  const fetchPartnerApplication = async () => {
    if (!user) return;
    try {
      let found: any = null;
      const localData = localStorage.getItem('satguru_my_partner_applications');
      if (localData) {
        try {
          const list = JSON.parse(localData);
          found = list.find((a: any) => a.email === user.email || a.userId === user.id);
        } catch {}
      }
      if (!found) {
        const [assocRes, stylistRes] = await Promise.all([
          supabase.from('associate_requests').select('*').or(`email.eq.${user.email},phone.eq.${user.email}`).order('created_at', { ascending: false }).limit(1).maybeSingle(),
          supabase.from('stylist_requests').select('*').or(`email.eq.${user.email},phone.eq.${user.email}`).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        ]);
        if (assocRes.data) found = { ...assocRes.data, type: 'associate' };
        else if (stylistRes.data) found = { ...stylistRes.data, type: 'stylist' };
      }
      setPartnerApplication(found || null);
    } catch (e) {
      console.warn('Error fetching partner application:', e);
    }
  };

  const handleAuthenticatePartnerSession = () => {
    setSessionAuthError('');
    if (!sessionPasswordInput.trim()) {
      setSessionAuthError('Please enter your partner password');
      return;
    }
    const expectedPassword = partnerApplication?.approved_password;
    if (expectedPassword && sessionPasswordInput.trim() !== expectedPassword.trim()) {
      setSessionAuthError('Incorrect partner password. Please check credentials issued by admin.');
      return;
    }

    if (partnerApplication.type === 'stylist') {
      sessionStorage.setItem('member_session', partnerApplication.id);
      setSessionAuthModalOpen(false);
      navigate(`/member-dashboard?id=${partnerApplication.id}`);
    } else {
      sessionStorage.setItem('associate_session', partnerApplication.id);
      setSessionAuthModalOpen(false);
      navigate(`/associate-dashboard?id=${partnerApplication.id}`);
    }
    toast({
      title: 'Partner Session Verified! ✨',
      description: `Welcome to your ${partnerApplication.type === 'stylist' ? 'Stylist' : 'Associate'} Dashboard.`,
    });
  };

  const handleResubmitPartnerDoc = async () => {
    if (!resubmitFile || !partnerApplication) {
      toast({ title: 'Please select a document', variant: 'destructive' });
      return;
    }
    setResubmitting(true);
    try {
      const timestamp = Date.now();
      const ext = resubmitFile.name.split('.').pop() || 'pdf';
      const path = `resubmitted-docs/${timestamp}-${partnerApplication.id}.${ext}`;
      const arrayBuffer = await resubmitFile.arrayBuffer();

      let docUrl = '';
      try {
        const { error } = await supabase.storage.from('gallery').upload(path, arrayBuffer, { contentType: resubmitFile.type, upsert: true });
        if (!error) {
          const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path);
          docUrl = publicUrl;
        }
      } catch {}
      if (!docUrl) docUrl = URL.createObjectURL(resubmitFile);

      const table = partnerApplication.type === 'stylist' ? 'stylist_requests' : 'associate_requests';
      const updateData: any = {
        status: 'documents_received',
        admin_notes: 'Updated document submitted by partner. Under verification.',
      };
      if (partnerApplication.type === 'stylist') {
        updateData.portfolio_urls = [docUrl, ...(partnerApplication.portfolio_urls || [])];
      } else {
        updateData.proof_document_url = docUrl;
      }

      try {
        await supabase.from(table).update(updateData).eq('id', partnerApplication.id);
      } catch {}

      try {
        const localApps = JSON.parse(localStorage.getItem('satguru_my_partner_applications') || '[]');
        const updated = localApps.map((a: any) => (a.id === partnerApplication.id ? { ...a, ...updateData } : a));
        localStorage.setItem('satguru_my_partner_applications', JSON.stringify(updated));
      } catch {}

      setPartnerApplication((prev: any) => ({ ...prev, ...updateData }));
      toast({
        title: 'Document Submitted! 📄',
        description: 'Your updated document was sent to admin for verification.',
      });
      setResubmitModalOpen(false);
      setResubmitFile(null);
    } catch (e: any) {
      toast({ title: 'Upload Failed', description: e.message, variant: 'destructive' });
    } finally {
      setResubmitting(false);
    }
  };

  const fetchAllData = async () => {
    await Promise.all([
      fetchBookings(),
      fetchOrders(),
      fetchMyReviews(),
      fetchLoyaltyPoints(),
      fetchActiveMembership(),
      fetchWallet(),
      fetchSupportTickets(),
      fetchPartnerApplication(),
    ]);"""

assert fetch_target in content, "fetch_target not found"
content = content.replace(fetch_target, partner_funcs, 1)

# 4. Add dynamic sidebar nav item for partner application
sidebar_target = "{ id: 'reviews', label: 'Reviews', icon: Star, badge: myReviews.length > 0 ? myReviews.length : null },"
sidebar_replacement = """{ id: 'reviews', label: 'Reviews', icon: Star, badge: myReviews.length > 0 ? myReviews.length : null },
              // ONLY render if partner application exists for this user!
              ...(partnerApplication ? [{
                id: 'partner',
                label: partnerApplication.type === 'stylist' ? 'Stylist Application' : 'Partner Application',
                icon: Store,
                badge: partnerApplication.status?.replace('_', ' ').toUpperCase() || 'PENDING',
              }] : []),"""
assert sidebar_target in content, "sidebar_target not found"
content = content.replace(sidebar_target, sidebar_replacement, 1)

# 5. In activeTab === 'home', add partner application status banner if exists
home_target = """          {/* Home / Luxury Dashboard Overview Tab */}
          {activeTab === 'home' && (
            <UserDashboardOverview"""

home_replacement = """          {/* Home / Luxury Dashboard Overview Tab */}
          {activeTab === 'home' && (
            <div className="space-y-6">
              {/* Partner Application Status Callout (ONLY rendered if user submitted form!) */}
              {partnerApplication && (
                <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-amber-50 via-rose-50 to-orange-50 border border-amber-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-amber-300 flex items-center justify-center text-[#C83E68] shadow-xs flex-shrink-0">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif font-bold text-base text-[#133826]">
                          {partnerApplication.shop_name || partnerApplication.full_name || 'Partner Application'}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white border border-amber-300 text-[#C83E68]">
                          {partnerApplication.type === 'stylist' ? 'Elite Stylist' : 'Associate Partner'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900">
                          Status: {partnerApplication.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1">
                        Application Ref #{partnerApplication.id?.slice(0, 10)} • Live onboarding and document tracking active.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button
                      onClick={() => setActiveTab('partner')}
                      className="bg-[#133826] hover:bg-[#0c2419] text-white text-xs font-semibold rounded-2xl h-10 px-5 shadow-xs flex-1 md:flex-initial"
                    >
                      View Application Details →
                    </Button>
                    {(partnerApplication.status === 'approved' || partnerApplication.status === 'confirmed') && (
                      <Button
                        onClick={() => setSessionAuthModalOpen(true)}
                        className="bg-[#C83E68] hover:bg-[#a63054] text-white text-xs font-semibold rounded-2xl h-10 px-5 shadow-xs flex-1 md:flex-initial"
                      >
                        Partner Dashboard →
                      </Button>
                    )}
                  </div>
                </div>
              )}

            <UserDashboardOverview"""
assert home_target in content, "home_target not found"
content = content.replace(home_target, home_replacement, 1)

# Close the wrapper div for home tab
close_home_target = """              onOpenAddMoneyModal={() => setAddMoneyModalOpen(true)}
            />
          )}"""
close_home_replacement = """              onOpenAddMoneyModal={() => setAddMoneyModalOpen(true)}
            />
            </div>
          )}"""
assert close_home_target in content, "close_home_target not found"
content = content.replace(close_home_target, close_home_replacement, 1)

# 6. Add activeTab === 'partner' section before </main>
partner_tab_code = """          {/* ── PARTNER / ASSOCIATE APPLICATION TRACKER (ONLY for users who submitted form!) ── */}
          {activeTab === 'partner' && partnerApplication && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-white border border-[#E8D9C5] rounded-[28px] p-6 sm:p-8 shadow-xs relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-100 to-rose-100 border border-amber-300 flex items-center justify-center text-[#C83E68] shadow-xs">
                      <Store className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-serif font-bold text-2xl text-[#133826]">
                          {partnerApplication.shop_name || partnerApplication.full_name || 'BlindGlow Partner Application'}
                        </h2>
                        <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase bg-rose-50 text-[#C83E68] border border-rose-200">
                          {partnerApplication.type === 'stylist' ? 'Elite Stylist Partner' : 'Associate Studio Partner'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1">
                        Application Ref #{partnerApplication.id?.slice(0, 10)} • Submitted on {new Date(partnerApplication.created_at || partnerApplication.submittedAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {(partnerApplication.status === 'approved' || partnerApplication.status === 'confirmed') ? (
                    <Button
                      onClick={() => setSessionAuthModalOpen(true)}
                      className="bg-[#C83E68] hover:bg-[#a63054] text-white text-xs font-bold rounded-2xl h-11 px-6 shadow-md gap-2"
                    >
                      <Lock className="w-3.5 h-3.5" /> Go to Partner Dashboard →
                    </Button>
                  ) : (
                    <div className="text-right">
                      <span className="text-[11px] text-stone-400 block font-medium">Current Status</span>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 mt-0.5">
                        {partnerApplication.status?.replace('_', ' ') || 'Pending'}
                      </span>
                    </div>
                  )}
                </div>

                {/* 4-STAGE MILESTONE STEPPER */}
                <div className="py-6 border-b border-stone-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-6">
                    Onboarding Verification Roadmap
                  </h3>
                  {(() => {
                    const st = partnerApplication.status || 'pending';
                    const isStep1Done = true;
                    const isStep2Done = ['documents_received', 'kyc_verification', 'training', 'approved', 'confirmed'].includes(st);
                    const isStep3Done = ['training', 'approved', 'confirmed'].includes(st);
                    const isStep4Done = ['approved', 'confirmed'].includes(st);

                    const steps = [
                      { title: '1. Pending Review', desc: 'Application & initial profile submitted', done: isStep1Done, active: st === 'pending' },
                      { title: '2. Documents & KYC', desc: 'Aadhaar, address & compliance check', done: isStep2Done, active: st === 'documents_received' || st === 'kyc_verification' },
                      { title: '3. Training & Induction', desc: 'Hygiene standards & doorstep kit protocol', done: isStep3Done, active: st === 'training' },
                      { title: '4. Confirmed & Active', desc: 'Login credentials active & orders enabled', done: isStep4Done, active: isStep4Done },
                    ];

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {steps.map((s, idx) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-2xl border transition-all ${
                              s.done
                                ? 'bg-emerald-50/70 border-emerald-200'
                                : s.active
                                ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-200'
                                : 'bg-stone-50/60 border-stone-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                  s.done ? 'bg-emerald-600 text-white' : s.active ? 'bg-amber-500 text-white animate-pulse' : 'bg-stone-200 text-stone-600'
                                }`}
                              >
                                {s.done ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                              </div>
                              <h4 className="font-bold text-xs text-[#133826]">{s.title}</h4>
                            </div>
                            <p className="text-[11px] text-stone-500 leading-relaxed">{s.desc}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* RESUBMISSION ALERT */}
                {partnerApplication.status === 'resubmission_required' && (
                  <div className="my-5 p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-sm">Admin Requested Document Resubmission</h4>
                        <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                          <strong>Note from Admin:</strong> {partnerApplication.admin_notes || 'Please upload a clear photograph of your government ID or shop signboard.'}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setResubmitModalOpen(true)}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl h-10 px-5 shadow-xs flex-shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" /> Re-upload Documents Now
                    </Button>
                  </div>
                )}

                {/* APPROVED NOTICE & DASHBOARD ACCESS */}
                {(partnerApplication.status === 'approved' || partnerApplication.status === 'confirmed') && (
                  <div className="my-5 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-sm">Congratulations! Your Partner Account is Approved 🎉</h4>
                        <p className="text-xs text-emerald-800 mt-0.5">
                          Admin has verified all documents and authorized your login session for <strong>{partnerApplication.approved_email || partnerApplication.email}</strong>.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setSessionAuthModalOpen(true)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl h-10 px-5 shadow-xs flex-shrink-0"
                    >
                      Enter Dashboard →
                    </Button>
                  </div>
                )}

                {/* SUBMITTED INFORMATION & DOCUMENTS */}
                <div className="pt-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                    Submitted Profile & Verification Documents
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
                      <p className="font-bold text-stone-700 text-xs border-b border-stone-200/60 pb-1.5">
                        Contact & Location
                      </p>
                      <div className="flex justify-between"><span className="text-stone-500">Owner/Stylist:</span><span className="font-semibold text-stone-800">{partnerApplication.owner_name || partnerApplication.full_name}</span></div>
                      <div className="flex justify-between"><span className="text-stone-500">Email:</span><span className="font-semibold text-stone-800">{partnerApplication.email}</span></div>
                      <div className="flex justify-between"><span className="text-stone-500">Phone:</span><span className="font-semibold text-stone-800">{partnerApplication.phone}</span></div>
                      <div className="flex justify-between"><span className="text-stone-500">Address:</span><span className="font-medium text-stone-800 text-right max-w-xs truncate">{partnerApplication.address || 'Registered with Satguru'}</span></div>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
                      <p className="font-bold text-stone-700 text-xs border-b border-stone-200/60 pb-1.5">
                        KYC Proof Documents Attached
                      </p>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-stone-500 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#C83E68]" />
                          Primary Proof ({partnerApplication.proof_type || 'Govt ID'}):
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          ✓ Attached & Verified
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-stone-500 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-amber-600" />
                          Photos / Portfolio Samples:
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-200 text-stone-800">
                          {partnerApplication.photos ? `${Object.keys(partnerApplication.photos).length} Photos` : partnerApplication.portfolio_urls?.length ? `${partnerApplication.portfolio_urls.length} Samples` : '1 Document'}
                        </span>
                      </div>
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setResubmitModalOpen(true)}
                          className="w-full text-xs h-8 rounded-xl border-stone-300 text-stone-700"
                        >
                          <Upload className="w-3 h-3 mr-1" /> Update / Replace Documents
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>"""

main_target = "        </main>"
assert main_target in content, "main_target not found"
content = content.replace(main_target, partner_tab_code, 1)

# 7. Add Session Authentication Dialog and Resubmission Dialog before the end of return
dialogs_code = """      {/* ── PARTNER SESSION AUTHENTICATION DIALOG ── */}
      <Dialog open={sessionAuthModalOpen} onOpenChange={setSessionAuthModalOpen}>
        <DialogContent className="max-w-md bg-white border-[#E8D9C5] rounded-[28px] p-6 sm:p-7">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-xl text-[#133826] flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#C83E68]" />
              Partner Session Authentication
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1">
              <p className="font-bold text-stone-800">Security Check for Dashboard Access</p>
              <p className="text-stone-600">
                Please enter the partner access password provided by BlindGlow admin to unlock your dashboard session.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 block">
                Partner Password *
              </label>
              <Input
                type="password"
                placeholder="Enter password (e.g. Satguru@2026)"
                value={sessionPasswordInput}
                onChange={e => {
                  setSessionPasswordInput(e.target.value);
                  setSessionAuthError('');
                }}
                className="h-11 rounded-xl text-sm"
              />
              {sessionAuthError && (
                <p className="text-xs text-rose-600 font-medium mt-1.5">{sessionAuthError}</p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleAuthenticatePartnerSession}
                className="flex-1 bg-[#133826] hover:bg-[#0c2419] text-white text-xs font-bold h-11 rounded-xl shadow-md"
              >
                Authenticate & Enter Dashboard →
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSessionAuthModalOpen(false);
                  setSessionPasswordInput('');
                  setSessionAuthError('');
                }}
                className="text-xs h-11 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── PARTNER DOCUMENT RESUBMISSION DIALOG ── */}
      <Dialog open={resubmitModalOpen} onOpenChange={setResubmitModalOpen}>
        <DialogContent className="max-w-md bg-white border-[#E8D9C5] rounded-[28px] p-6 sm:p-7">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-xl text-[#133826] flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#C83E68]" />
              Re-upload Compliance Document
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-xs text-stone-600 leading-relaxed">
              Upload your updated, clear photograph or scan of your KYC verification document (Aadhaar, Utility bill, Rent proof, or Salon storefront).
            </p>

            <div className="border-2 border-dashed border-stone-300 rounded-2xl p-5 text-center relative hover:bg-stone-50 transition-colors">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={e => setResubmitFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileText className="w-7 h-7 mx-auto text-[#C83E68] mb-2" />
              <span className="text-xs font-bold block text-stone-800">
                {resubmitFile ? resubmitFile.name : 'Click to Select Document'}
              </span>
              <span className="text-[10px] text-stone-500">PDF, JPG, PNG up to 10MB</span>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleResubmitPartnerDoc}
                disabled={!resubmitFile || resubmitting}
                className="flex-1 bg-[#C83E68] hover:bg-[#a63054] text-white text-xs font-bold h-11 rounded-xl shadow-md"
              >
                {resubmitting ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</span>
                ) : (
                  'Submit Document to Admin'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setResubmitModalOpen(false);
                  setResubmitFile(null);
                }}
                className="text-xs h-11 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}"""

end_target = "    </div>\n  );\n}"
assert end_target in content, "end_target not found"
content = content.replace(end_target, dialogs_code, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Profile.tsx successfully enhanced with partner application workflow!")

