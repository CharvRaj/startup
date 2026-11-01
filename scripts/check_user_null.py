with open('src/pages/Profile.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'user.' in line and 'user?.' not in line and 'if (!user)' not in line:
        if 'user.id' in line or 'user.email' in line or 'user.username' in line or 'user.avatar' in line:
            print(f'Line {i+1}: {line.strip()[:100]}')

