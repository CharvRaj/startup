from PIL import Image

im = Image.open('public/images/diwali/girl-holding-diya-hd.png')
crop = im.crop((0, 0, 300, 200))
crop.save('public/images/diwali/test_top_left.png')
print('Saved test_top_left.png successfully')

