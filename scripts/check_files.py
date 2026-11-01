with open('src/pages/Admin.tsx', 'r', encoding='utf-8') as f:
    admin_code = f.read()

print("Admin.tsx length:", len(admin_code))

with open('src/pages/Profile.tsx', 'r', encoding='utf-8') as f:
    profile_code = f.read()

print("Profile.tsx length:", len(profile_code))

