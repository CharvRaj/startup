# Video Upload Guide for FloatingVideo Component

## How to Change the Video

Currently, the FloatingVideo component uses a YouTube embedded video. To change it to your own video:

### Option 1: Use Your Own YouTube Video (Recommended)

1. Upload your video to YouTube
2. Get the video ID from the URL:
   - Example: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Video ID is: `dQw4w9WgXcQ`
3. Open `src/components/FloatingVideo.tsx`
4. Replace the `videoId` value:

```typescript
const videoId = 'YOUR_VIDEO_ID_HERE'; // Replace with your video ID
```

### Option 2: Use a Different Video Platform

**Vimeo:**
```typescript
<iframe
  src="https://player.vimeo.com/video/YOUR_VIDEO_ID"
  className="w-full h-full rounded-lg"
  allow="autoplay; fullscreen"
  allowFullScreen
/>
```

**Google Drive:**
1. Upload video to Google Drive
2. Right-click → Get shareable link → Set to "Anyone with the link"
3. Get the file ID from the link
4. Use this embed code:

```typescript
<iframe
  src={`https://drive.google.com/file/d/YOUR_FILE_ID/preview`}
  className="w-full h-full rounded-lg"
  allow="autoplay"
  allowFullScreen
/>
```

### Option 3: Use Local Video File (Not Recommended for Production)

1. Place your video in `public/videos/` folder (create if doesn't exist)
2. Update FloatingVideo.tsx:

```typescript
<video
  className="w-full h-full rounded-lg object-cover"
  controls
  autoPlay
  muted
  loop
>
  <source src="/videos/your-video.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>
```

**Note:** Local videos increase app size significantly. YouTube/Vimeo is recommended.

### Best Practices

1. **Video Specifications:**
   - Vertical video: 9:16 aspect ratio (1080x1920)
   - Horizontal video: 16:9 aspect ratio (1920x1080)
   - Format: MP4 (H.264 codec)
   - Duration: 15-60 seconds recommended
   - File size: Under 50MB for fast loading

2. **Content Recommendations:**
   - Show makeup transformation
   - Highlight bridal makeup process
   - Display before/after results
   - Keep it engaging and professional

3. **Performance:**
   - Always use external hosting (YouTube, Vimeo)
   - Enable lazy loading
   - Compress videos before uploading

## Current Configuration

The video appears:
- After scrolling 200px down the page
- As a floating window in bottom-right corner
- With mute/unmute toggle
- With close button
- Auto-plays when visible (muted by default)

To adjust these settings, modify the `FloatingVideo.tsx` component.
