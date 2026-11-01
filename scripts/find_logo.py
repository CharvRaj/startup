from PIL import Image

im = Image.open('public/images/diwali-campaign-master.jpg').convert('RGB')
logo_pixels = []
for y in range(40, 115):
    for x in range(40, 240):
        r, g, b = im.getpixel((x, y))
        # Text is dark green: luminance < 140 and (g >= r or g >= b)
        lum = 0.299*r + 0.587*g + 0.114*b
        if lum < 150:
            logo_pixels.append((x, y, (r, g, b)))

print(f'Logo pixels in (40..240, 40..115): {len(logo_pixels)}')
if logo_pixels:
    xs = [c[0] for c in logo_pixels]
    ys = [c[1] for c in logo_pixels]
    print(f'Logo X range: {min(xs)} to {max(xs)}')
    print(f'Logo Y range: {min(ys)} to {max(ys)}')

