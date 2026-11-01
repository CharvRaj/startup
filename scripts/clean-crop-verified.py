from PIL import Image

# Let's inspect where the D is
im = Image.open('public/images/diwali/test-d-region.png')
print("D region size:", im.size)

# In master, the diya is in her hands. Her hands extend up to x=440.
# The 'D' in Diwali is at x >= 445.
# Let's crop x from 125 to 438 to be 100% sure zero text touches it!
master = Image.open('public/images/diwali-campaign-master.jpg')
woman_box = (130, 68, 436, 380)
clean = master.crop(woman_box)
w, h = clean.size
clean_hd = clean.resize((w * 2, h * 2), Image.Resampling.LANCZOS)
clean_hd.save('public/images/diwali/girl-holding-diya-hd.png', quality=95)
print("Saved 100% clean girl-holding-diya-hd without any text:", clean_hd.size)

