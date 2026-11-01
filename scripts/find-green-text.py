from PIL import Image

im = Image.open('public/images/diwali-campaign-master.jpg')
print("Master size:", im.size)

# Let's inspect where the logo "BlindGlow - by Satguru -" is located:
# In master:
# The logo is in the top-left corner:
# x is from ~80 to ~260, y is from ~40 to ~105
# Let's crop a box around (50, 20, 300, 150) to see exact bounds of the logo:
logo_box = im.crop((50, 20, 300, 150))
logo_box.save('public/images/diwali/debug-logo-bounds.png')

# The woman's head starts around x=160-170, and her hair bun is at y=110.
# Her face and hair:
# If we start x at 180 or 190, does it cut into her hair or is the green text only in the background at top-left?
# Let's check!
check_head = im.crop((140, 50, 250, 180))
check_head.save('public/images/diwali/debug-head-top-left.png')
print("Debug crops saved")

