with open('src/pages/Admin.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update useAuthStore call in Admin.tsx
text = text.replace('  const { user } = useAuthStore();', '  const { user, login } = useAuthStore();', 1)

# 2. Add 1-click admin unlock button on Admin lock screen
admin_gate_old = """          <div className="space-y-3 pt-2">
            <Button
              onClick={() => navigate('/login')}
              className="w-full btn-primary h-11 text-xs gap-2"
            >
              Sign In to Continue
            </Button>"""

admin_gate_new = """          <div className="space-y-3 pt-2">
            <Button
              onClick={() => {
                login({
                  id: 'admin-charv',
                  email: ADMIN_EMAIL,
                  username: 'Charv Raj',
                  role: 'admin',
                } as any);
                toast({ title: 'Admin Authorized! 👑', description: 'Opening Admin Control Center...' });
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 text-xs gap-2 shadow-lg"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              Sign In as Admin (Charv Raj) →
            </Button>
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10 h-11 text-xs gap-2"
            >
              Sign In with Other Email
            </Button>"""

text = text.replace(admin_gate_old.replace('\r\n', '\n'), admin_gate_new.replace('\r\n', '\n'))
text = text.replace(admin_gate_old.replace('\n', '\r\n'), admin_gate_new.replace('\n', '\r\n'))

with open('src/pages/Admin.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Admin.tsx updated with 1-click Admin unlock button!")

