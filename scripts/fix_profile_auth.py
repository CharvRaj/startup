with open('src/pages/Profile.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace useEffect
old_use_effect = """  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setNewUsername(user.username);
    fetchAllData();
    fetchBeautyProfile();
  }, [user, navigate]);"""

new_use_effect = """  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    setNewUsername(user.username || '');
    fetchAllData();
    fetchBeautyProfile();
  }, [user, authLoading]);"""

# Normalize line endings for replacement
text = text.replace(old_use_effect.replace('\r\n', '\n'), new_use_effect.replace('\r\n', '\n'))
text = text.replace(old_use_effect.replace('\n', '\r\n'), new_use_effect.replace('\n', '\r\n'))

# Now replace `if (!user) return null;`
old_render_guard = """  if (!user) return null;

  const displayName = user.username || 'Charv Raj';
  const firstName = displayName.split(' ')[0] || 'Charv';"""

new_render_guard = """  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF9F3]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shadow-xs">
            <Loader2 className="w-6 h-6 animate-spin text-[#D81B60]" />
          </div>
          <p className="text-xs font-semibold text-[#43152E]">Opening your beauty profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 bg-[#FFF9F3] text-[#43152E] flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#F8DCE4] shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl mx-auto bg-gradient-to-tr from-rose-100 to-amber-100 border border-rose-200 flex items-center justify-center text-[#D81B60] shadow-sm">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-serif italic text-2xl font-bold text-[#43152E]">
              Sign In to View Profile
            </h2>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Please sign in to access your appointment bookings, home service orders, query desk, wallet balance, and partner applications.
            </p>
          </div>
          <div className="space-y-2.5 pt-2">
            <Button
              onClick={() => navigate('/login?redirect=/profile')}
              className="w-full h-11 rounded-2xl bg-[#D81B60] hover:bg-[#b0134c] text-white font-bold text-xs shadow-md"
            >
              Sign In to Your Account →
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/signup?redirect=/profile')}
              className="w-full h-11 rounded-2xl border-[#F8DCE4] text-[#43152E] font-semibold text-xs hover:bg-[#FFF9F3]"
            >
              Create New Account
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="w-full text-xs text-muted-foreground hover:text-foreground"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const displayName = user.username || 'Charv Raj';
  const firstName = displayName.split(' ')[0] || 'Charv';"""

text = text.replace(old_render_guard.replace('\r\n', '\n'), new_render_guard.replace('\r\n', '\n'))
text = text.replace(old_render_guard.replace('\n', '\r\n'), new_render_guard.replace('\n', '\r\n'))

with open('src/pages/Profile.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Profile.tsx updated with authLoading handling and guest gate!")

