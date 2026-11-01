from PIL import Image

im = Image.open('public/images/diwali/girl-holding-diya-hd.png')
w, h = im.size

# Let's check right edge
right_strip = im.crop((w - 50, 0, w, h))
right_strip.save('public/images/diwali/test-right-strip.png')

# In master, where does the "D" in Diwali start?
master = Image.open('public/images/diwali-campaign-master.jpg')
# Let's find exactly the bounds of the woman and diya in master:
# Let's save a crop around x=420..460, y=140..250 where "D" is located:
d_region = master.crop((420, 140, 480, 260))
d_region.save('public/images/diwali/test-d-region.png')
print("Strip saved")

