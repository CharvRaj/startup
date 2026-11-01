from PIL import Image, ImageFilter, ImageEnhance

im = Image.open('public/images/diwali-campaign-master.jpg')
W, H = im.size

# Let's crop the woman with her serene face, gajra, jhumkas, and her two hands cupping the glowing golden diya!
# Looking at the original:
# Top of hair is at y=75
# Bottom of her hands holding diya is at y=375
# Left edge of hair/shoulder is at x=135
# Right edge of hands/diya is at x=470
box = (130, 68, 475, 380)
crop = im.crop(box)

# High quality Lanczos resize to 2x for ultra-sharp HD display
w, h = crop.size
crop_hd = crop.resize((w * 2, h * 2), Image.Resampling.LANCZOS)

# Subtle sharpness enhancement for crisp luxury details
enhancer = ImageEnhance.Sharpness(crop_hd)
crop_sharp = enhancer.enhance(1.2)

crop_sharp.save('public/images/diwali/girl-holding-diya-hd.png', quality=95)
print("Saved girl-holding-diya-hd.png with size:", crop_sharp.size)

