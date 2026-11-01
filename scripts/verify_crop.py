from PIL import Image

im = Image.open('public/images/diwali/girl-holding-diya-hd.png')
print('Image size:', im.size)

# The top left region of girl-holding-diya-hd is x: 0..250, y: 0..100
# Let's check for any dark/green pixels in top-left region
dark_pixels = []
for y in range(0, min(120, im.height)):
    for x in range(0, min(250, im.width)):
        r, g, b = im.getpixel((x, y))[:3]
        # Text is typically greenish: g > 80, r < 140, b < 140, or luminance < 160
        lum = 0.299*r + 0.587*g + 0.114*b
        if lum < 180 and x < 200 and y < 80:
            dark_pixels.append((x, y, (r, g, b), lum))

print(f'Dark pixels in top-left (y < 80, x < 200): {len(dark_pixels)}')
if dark_pixels:
    print('Sample dark pixels:', dark_pixels[:10])
else:
    print('ZERO dark/green text pixels detected! Completely clean.')

