import os
from PIL import Image

os.makedirs('public/images/diwali', exist_ok=True)
im = Image.open('public/images/diwali-campaign-master.jpg')
W, H = im.size

# 1. Hero Woman with Diya (Woman alone, beautiful framing)
hero_woman = im.crop((120, 68, 435, 385))
hero_woman.save('public/images/diwali/hero-woman-diya.png')

# 2. Five Categories (Just the inner image part inside the rounded card)
# Cat 1: Facial photo
cat1 = im.crop((55, 395, 195, 475))
cat1.save('public/images/diwali/cat-glow-grace.png')

# Cat 2: Henna hand
cat2 = im.crop((215, 395, 355, 475))
cat2.save('public/images/diwali/cat-pure-henna.png')

# Cat 3: Makeup brushes
cat3 = im.crop((375, 395, 515, 475))
cat3.save('public/images/diwali/cat-shubh-shringar.png')

# Cat 4: Gold serum bottle
cat4 = im.crop((535, 395, 675, 475))
cat4.save('public/images/diwali/cat-gold-radiance.png')

# Cat 5: Glamorous eye
cat5 = im.crop((695, 395, 835, 475))
cat5.save('public/images/diwali/cat-festive-eyes.png')

# 3. Three Offer Photos (Just the image without text or buttons)
offer1 = im.crop((52, 555, 308, 705))
offer1.save('public/images/diwali/offer-gold-facial.png')

offer2 = im.crop((324, 555, 580, 705))
offer2.save('public/images/diwali/offer-bridal-henna.png')

offer3 = im.crop((596, 555, 852, 705))
offer3.save('public/images/diwali/offer-family-makeover.png')

# 4. Ornaments
# Left Lantern
lantern_l = im.crop((0, 155, 62, 260))
lantern_l.save('public/images/diwali/lantern-left.png')

# Right Lantern
lantern_r = im.crop((825, 95, 888, 178))
lantern_r.save('public/images/diwali/lantern-right.png')

# Top Center Diya
diya_center = im.crop((418, 10, 470, 52))
diya_center.save('public/images/diwali/diya-center.png')

# Right side Pink Lotus
lotus_r = im.crop((815, 248, 888, 385))
lotus_r.save('public/images/diwali/lotus-right.png')

# Bottom Left Pink Lotus
lotus_bl = im.crop((0, 900, 115, 995))
lotus_bl.save('public/images/diwali/lotus-bl.png')

# Bottom Right Pink Lotus
lotus_br = im.crop((770, 900, 888, 995))
lotus_br.save('public/images/diwali/lotus-br.png')

print("All festive assets cropped and saved to public/images/diwali/")

