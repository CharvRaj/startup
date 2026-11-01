import os, stat

git_dir = '.git'
for root, dirs, files in os.walk(git_dir):
    for f in files:
        if 'lock' in f:
            p = os.path.join(root, f)
            print('Found lock file:', p)
            try:
                os.chmod(p, stat.S_IWRITE)
                os.remove(p)
                print('Removed:', p)
            except Exception as e:
                print('Error removing:', e)

