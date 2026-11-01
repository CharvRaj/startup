import shutil
from PIL import Image

src = 'C:/Users/Shree/.gemini/antigravity/brain/85dc4710-06e0-4741-aedd-f0dff906cacc/.user_uploaded/media_1793459638271_ac735d9d.jpg'
dest = 'public/images/lifted-eye-looks.jpg'

im = Image.open(src)
print('Source banner dimensions:', im.size)
im.save(dest, quality=95)
print('Saved to', dest)

