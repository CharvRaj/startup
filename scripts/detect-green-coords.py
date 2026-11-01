from PIL import Image

im = Image.open('public/images/diwali-campaign-master.jpg')

# Let's inspect the green text in the top-left area:
# The logo has green text (R < 50, G > 40, B < 60)
# Let's find where the green text pixels are located:
crop_area = im.crop((120, 40, 260, 140))
pixels = crop_area.load()
w, h = crop_area.size

# Find bounds of dark green pixels (the logo text)
green_xs = []
green_ys = []
for y in range(h):
    for x in range(w):
        r, g, b = pixels[x, y][:3]
        # Dark forest green logo color: R < 70, G in 40..90, B in 30..80, with G > R + 10
        if r < 70 and g > 35 and b < 80 and g > r:
            green_xs.append(x + 120)
            green_ys.append(y + 40)

if green_xs:
    print(f"Green text bounds: x from {min(green_xs)} to {max(green_xs)}, y from {min(green_ys)} to {max(green_ys)}")
else:
    print("No green text detected in that range, searching wider...")
    for y in range(30, 160):
        for x in range(50, 300):
            r, g, b = im.getpixel((x, y))[:3]
            if g > r + 15 and g > 35 and r < 80 and b < 80:
                green_xs.append(x)
                green_ys.append(y)
    if green_xs:
        print(f"Wide search: x from {min(green_xs)} to {max(green_xs)}, y from {min(green_ys)} to {max(green_ys)}")

