// MediaPipe FaceMesh standard canonical landmark indices for facial regions

export const FACE_REGIONS = {
  // Upper Lip
  UPPER_LIP_OUTER: [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291],
  UPPER_LIP_INNER: [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308],

  // Lower Lip
  LOWER_LIP_OUTER: [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291],
  LOWER_LIP_INNER: [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308],

  // Left Eye (viewer's left / subject's right)
  LEFT_EYE_CONTOUR: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
  LEFT_EYE_UPPER: [33, 160, 158, 159, 157, 173, 133],
  LEFT_EYEBROW: [70, 63, 105, 66, 107],
  LEFT_EYESHADOW_ZONE: [70, 63, 105, 66, 107, 133, 173, 157, 158, 159, 160, 33],

  // Right Eye (viewer's right / subject's left)
  RIGHT_EYE_CONTOUR: [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],
  RIGHT_EYE_UPPER: [362, 385, 386, 387, 388, 466, 263],
  RIGHT_EYEBROW: [336, 296, 334, 293, 300],
  RIGHT_EYESHADOW_ZONE: [336, 296, 334, 293, 300, 263, 466, 388, 387, 386, 385, 362],

  // Cheeks for Blush
  LEFT_CHEEK_CENTER: 117,
  LEFT_CHEEK_CONTOUR: [116, 117, 118, 123, 147, 213, 192, 214, 187, 50],

  RIGHT_CHEEK_CENTER: 346,
  RIGHT_CHEEK_CONTOUR: [345, 346, 347, 352, 376, 433, 416, 434, 411, 280],

  // Highlighting keypoints
  NOSE_BRIDGE: [168, 6, 197, 195, 5, 4],
  NOSE_TIP: 1,
  CUPIDS_BOW: [0, 37, 267],
  LEFT_CHEEKBONE_HIGHLIGHT: [116, 117, 123],
  RIGHT_CHEEKBONE_HIGHLIGHT: [345, 346, 352],

  // Full Face Contour
  FACE_OVAL: [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365,
    379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93,
    234, 127, 162, 21, 54, 103, 67, 109,
  ],
};

// Helper: Calculate center of landmark subset
export function getLandmarkCenter(landmarks: { x: number; y: number }[], indices: number[]): { x: number; y: number } {
  let sumX = 0;
  let sumY = 0;
  let count = 0;
  indices.forEach(idx => {
    if (landmarks[idx]) {
      sumX += landmarks[idx].x;
      sumY += landmarks[idx].y;
      count++;
    }
  });
  return count > 0 ? { x: sumX / count, y: sumY / count } : { x: 0.5, y: 0.5 };
}

// Helper: Estimate yaw, pitch, roll from landmarks
export function estimateHeadPose(landmarks: { x: number; y: number; z: number }[]): { yaw: number; pitch: number; roll: number } {
  if (!landmarks || landmarks.length < 468) {
    return { yaw: 0, pitch: 0, roll: 0 };
  }

  // Nose tip: 1, Chin: 152, Left cheek: 234, Right cheek: 454
  const nose = landmarks[1];
  const chin = landmarks[152];
  const leftCheek = landmarks[234];
  const rightCheek = landmarks[454];
  const midEye = {
    x: (landmarks[33].x + landmarks[263].x) / 2,
    y: (landmarks[33].y + landmarks[263].y) / 2,
    z: (landmarks[33].z + landmarks[263].z) / 2,
  };

  // Yaw: difference between nose x and midpoint of cheeks
  const cheekMidX = (leftCheek.x + rightCheek.x) / 2;
  const faceWidth = Math.abs(rightCheek.x - leftCheek.x) || 1;
  const yaw = ((nose.x - cheekMidX) / faceWidth) * 90; // approx degrees

  // Pitch: nose y vs midEye and chin
  const faceHeight = Math.abs(chin.y - midEye.y) || 1;
  const noseRelativeY = (nose.y - midEye.y) / faceHeight;
  const pitch = (noseRelativeY - 0.55) * 80;

  // Roll: angle between left and right eye
  const dy = landmarks[263].y - landmarks[33].y;
  const dx = landmarks[263].x - landmarks[33].x;
  const roll = (Math.atan2(dy, dx) * 180) / Math.PI;

  return { yaw, pitch, roll };
}
