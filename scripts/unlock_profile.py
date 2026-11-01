with open('src/pages/Profile.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = """          <div className="space-y-2.5 pt-2">
            <Button
              onClick={() => navigate('/login?redirect=/profile')}
              className="w-full h-11 rounded-2xl bg-[#D81B60] hover:bg-[#b0134c] text-white font-bold text-xs shadow-md"
            >
              Sign In to Your Account →
            </Button>"""

replacement = """          <div className="space-y-2.5 pt-2">
            <Button
              onClick={() => {
                login({
                  id: 'user-priya-sharma',
                  email: 'priya.sharma@example.com',
                  username: 'Priya Sharma',
                });
                toast({ title: 'Welcome, Priya Sharma! ✨', description: 'Opening your beauty profile.' });
              }}
              className="w-full h-11 rounded-2xl bg-[#133826] hover:bg-[#0c2419] text-white font-bold text-xs shadow-md"
            >
              Open Profile with Demo Client (Priya Sharma) →
            </Button>
            <Button
              onClick={() => navigate('/login?redirect=/profile')}
              variant="outline"
              className="w-full h-11 rounded-2xl border-[#F8DCE4] text-[#D81B60] font-bold text-xs hover:bg-rose-50"
            >
              Sign In to Your Account →
            </Button>"""

text = text.replace(target.replace('\r\n', '\n'), replacement.replace('\r\n', '\n'))
text = text.replace(target.replace('\n', '\r\n'), replacement.replace('\n', '\r\n'))

with open('src/pages/Profile.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Profile.tsx updated with 1-click profile demo sign-in!")

