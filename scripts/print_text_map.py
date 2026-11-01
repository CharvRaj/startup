from PIL import Image

im = Image.open('public/images/diwali-campaign-master.jpg').convert('RGB')
for y in range(54, 116):
    row = ''
    for x in range(130, 245, 2):
        r, g, b = im.getpixel((x, y))
        lum = 0.299*r + 0.587*g + 0.114*b
        # If dark (part of text), print '#'
        if lum < 160:
            row += '#'
        else:
            row += '.'
    if '#' in row:
        print(f'y={y:3d}: {row}')

