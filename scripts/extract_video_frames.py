import os

video_path = r'C:/Users/Shree/.gemini/antigravity/brain/85dc4710-06e0-4741-aedd-f0dff906cacc/.user_uploaded/media_1793471517468_3fd568fa.mp4'
print('Video exists:', os.path.exists(video_path))
print('Video size:', os.path.getsize(video_path) if os.path.exists(video_path) else 0)

try:
    import cv2
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    print(f'Total frames: {total_frames}, FPS: {fps}, Duration: {total_frames/max(fps,1):.2f}s')
    
    os.makedirs('scratch/video_frames', exist_ok=True)
    
    # Extract 6 evenly spaced frames
    step = max(1, total_frames // 6)
    saved = 0
    for i in range(0, total_frames, step):
        cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        ret, frame = cap.read()
        if ret:
            out_p = f'scratch/video_frames/frame_{saved}.jpg'
            cv2.imwrite(out_p, frame)
            print(f'Saved {out_p} at frame {i}')
            saved += 1
            if saved >= 6:
                break
    cap.release()
except Exception as e:
    print('OpenCV error or not installed:', e)

