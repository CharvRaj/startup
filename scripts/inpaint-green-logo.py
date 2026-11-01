from PIL import Image, ImageFilter

im = Image.open('public/images/diwali-campaign-master.jpg').convert('RGB')

# Let's clean the green text in (x: 120..230, y: 50..102):
# The background in that area is a soft warm peach/cream gradient.
# Let's check the background color around y=48 (above the text) and around x=235 (to the right of the text):
pixels = im.load()

# Let's inspect the bounding box of the green logo:
# Any pixel in x: 120..230, y: 50..103 where color is dark/green (i.e., not the light background):
# The light background has R > 230, G > 210, B > 190.
# The green text has R < 120, G < 140, B < 120.
# We can sample the background color from right above (y=45) or from (x=240, y) and interpolate smoothly!

bg_sample_top = pixels[170, 45] # (R, G, B) of clean background
print("Sample clean background at (170, 45):", bg_sample_top)

for y in range(50, 103):
    # Get clean background color at x=235 for this row
    clean_right = pixels[235, y]
    clean_top = pixels[170, 45]
    for x in range(120, 230):
        r, g, b = pixels[x, y]
        # If it's part of the dark green text:
        # Green text pixels have luminance < 190 or (g > r and r < 160)
        luminance = 0.299 * r + 0.587 * g + 0.114 * b
        if luminance < 205:
            # Interpolate natural background
            alpha = (x - 120) / (230 - 120)
            target_r = int(clean_top[0] * (1 - alpha) + clean_right[0] * alpha)
            target_g = int(clean_top[1] * (1 - alpha) + clean_right[1] * alpha)
            target_b = int(clean_top[2] * (1 - alpha) + clean_right[2] * alpha)
            pixels[x, y] = (target_r, target_g, target_b)

# Apply a very gentle blur only to the patched region (x: 120..235, y: 48..105) to blend seamlessly
patch = im.crop((118, 48, 235, 105))
patch_blurred = patch.filter(ImageFilter.GaussianBlur(radius=1.5))
im.paste(patch_blurred, (118, 48))

# Now let's crop the woman holding the diya:
# x: 130 to 436, y: 68 to 380
clean_woman = im.crop((130, 68, 436, 380))
w, h = clean_woman.size
clean_hd = clean_woman.resize((w * 2, h * 2), Image.Resampling.LANCZOS)
clean_hd.save('public/images/diwali/girl-holding-diya-hd.png', quality=95)

print("Saved clean girl-holding-diya-hd.png! Size:", clean_hd.size)

