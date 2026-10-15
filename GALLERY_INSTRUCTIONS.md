# How to Update Gallery Photos

## Method 1: Replace Image URLs (Quick & Easy)

1. **Open the Gallery component file:**
   - Navigate to: `src/components/sections/Gallery.tsx`

2. **Find the `galleryImages` array** (around line 4-40)

3. **Replace image URLs** with your own photos:
   ```typescript
   const galleryImages = [
     {
       url: 'YOUR_IMAGE_URL_HERE',
       title: 'Bridal Makeup',
     },
     // ... more images
   ];
   ```

4. **Where to get image URLs:**
   - **Unsplash** (free): `https://images.unsplash.com/photo-...`
   - **Upload to OnSpace Storage** (recommended):
     - Go to Cloud panel → Storage tab
     - Upload your photos
     - Copy the public URL
   - **Use your own hosting**: Any publicly accessible image URL

## Method 2: Upload to OnSpace Cloud Storage (Recommended)

### Step 1: Create Storage Bucket
The storage bucket should already be created. If not, go to Cloud panel → Storage.

### Step 2: Upload Your Photos
1. Click **Cloud** button (top right)
2. Navigate to **Storage** tab
3. Create a folder called `gallery` (optional)
4. Click **Upload** and select your beauty photos
5. After upload, click on each image to get its **Public URL**

### Step 3: Update Gallery Component
Replace the URLs in `src/components/sections/Gallery.tsx`:

```typescript
const galleryImages = [
  {
    url: 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/gallery/bridal-1.jpg',
    title: 'Bridal Makeup',
  },
  {
    url: 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/gallery/party-1.jpg',
    title: 'Party Look',
  },
  // Add as many as you want!
];
```

## Tips for Best Results

- **Image Size**: Use images around 800x600px for faster loading
- **Format**: JPG or PNG format
- **Quality**: High-quality images showcase your work better
- **Consistency**: Try to keep similar lighting/style across photos
- **Add More**: You can add more images to the array - the grid will auto-adjust

## Example with Your Own Images

```typescript
const galleryImages = [
  {
    url: 'https://your-storage-url.com/bridal-makeup-1.jpg',
    title: 'Bridal Makeup - Traditional',
  },
  {
    url: 'https://your-storage-url.com/bridal-makeup-2.jpg',
    title: 'Bridal Makeup - Modern',
  },
  {
    url: 'https://your-storage-url.com/party-makeup.jpg',
    title: 'Party Makeup',
  },
  {
    url: 'https://your-storage-url.com/hair-styling.jpg',
    title: 'Hair Styling',
  },
  // Add more as needed
];
```

Save the file and your gallery will update automatically! ✨
