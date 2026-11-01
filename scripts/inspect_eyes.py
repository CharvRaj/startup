from PIL import Image

im = Image.open('public/images/lifted-eye-looks.jpg')
print('Banner size:', im.size)
# The image is 693x477.
# Let's inspect where the text is:
# "Lifted Eye Looks" is around y: 300..360.
# The eyes are in y: 50..300 across the entire width!
# We can also keep the banner as a clickable high-resolution card, or extract the top eye area!

