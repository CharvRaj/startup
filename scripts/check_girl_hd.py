from PIL import Image

im = Image.open('public/images/diwali/girl-holding-diya-hd.png')
print('Dimensions:', im.size)
# Remember: girl-holding-diya-hd is 2x resized from crop (130, 68, 436, 380)
# So original y=68 is y=0 in this image.
# Original y=91 is (91 - 68)*2 = 46.
# Original x=130 is x=0 in this image.
# Original x=240 is (240 - 130)*2 = 220.

for y in range(0, 70, 2):
    row = ''
    for x in range(0, 220, 4):
        r, g, b = im.getpixel((x, y))[:3]
        lum = 0.299*r + 0.587*g + 0.114*b
        if lum < 160:
            row += '#'
        else:
            row += '.'
    if '#' in row:
        print(f'y={y:2d}: {row}')

