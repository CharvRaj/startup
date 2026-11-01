from PIL import Image

im = Image.open('public/images/diwali-campaign-master.jpg').convert('RGB')
print('Master image size:', im.size)

# Find all pixels that are dark forest green
# text "BlindGlow by Satguru": green is around (20, 60, 40)
green_coords = []
for y in range(0, 450):
    for x in range(0, 500):
        r, g, b = im.getpixel((x, y))
        # Deep forest green check: g > r and g > b, and r < 80, g < 100, b < 80
        if 20 < g < 110 and r < 60 and b < 60:
            green_coords.append((x, y, (r, g, b)))

print(f'Total green text pixels: {len(green_coords)}')
if green_coords:
    xs = [c[0] for c in green_coords]
    ys = [c[1] for c in green_coords]
    print(f'X range: {min(xs)} to {max(xs)}')
    print(f'Y range: {min(ys)} to {max(ys)}')

