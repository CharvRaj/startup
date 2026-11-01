from PIL import Image

im = Image.open('public/images/diwali-campaign-master.jpg')

# Let's crop tight around the woman and her diya, excluding any text on the right:
# Woman's head: x=135 to x=420
# Her hands with diya: x=240 to x=445
# Text "Diwali" begins around x=445-450
# If we crop x from 125 to 442, we capture her full head, hair, gajra, face, arms, and the glowing diya, with ZERO text!
box = (125, 68, 442, 380)
clean_woman = im.crop(box)

w, h = clean_woman.size
clean_hd = clean_woman.resize((w * 2, h * 2), Image.Resampling.LANCZOS)
clean_hd.save('public/images/diwali/girl-holding-diya-hd.png', quality=95)
print("Saved clean crop with size:", clean_hd.size)

