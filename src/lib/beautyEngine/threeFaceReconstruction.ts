import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MakeupState } from '@/types/beautyStudio';

export interface ThreeStudioOptions {
  container: HTMLDivElement;
  skinTone?: string;
  initialMakeup: MakeupState;
  onReady?: () => void;
}

export interface ThreeStudioInstance {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  headMesh: THREE.Mesh;
  hairMesh: THREE.Mesh;
  leftEyeMesh: THREE.Mesh;
  rightEyeMesh: THREE.Mesh;
  updateMakeup: (makeup: MakeupState) => void;
  setSkinTone: (hex: string) => void;
  setHairStyle: (style: 'bridal-updo' | 'sleek-waves' | 'smooth') => void;
  setCameraAngle: (angle: 'front' | 'three-quarter-left' | 'three-quarter-right' | 'profile-left' | 'profile-right' | 'lips' | 'eyes') => void;
  resetCamera: () => void;
  setLightingMood: (mood: 'studio' | 'golden-hour' | 'spotlight') => void;
  toggleWireframe: (show: boolean) => void;
  applyUserPhotoTexture?: (imageElement: HTMLImageElement | HTMLCanvasElement) => void;
  exportSnapshotPng: (multiplier?: number) => string;
  destroy: () => void;
}

// ── 1. REALISTIC VOLUMETRIC 3D HEAD & FACE GEOMETRY GENERATOR ──────────────────
// Creates a genuine, anatomically sculpted 3D human head with realistic forehead,
// brow ridge, recessed eye sockets, sculpted nose bridge & tip, volumetric lips with Cupid's bow,
// prominent cheekbones, sculpted jawline, chin, ears, cranium and neck.
export function createVolumetricHeadGeometry(
  subdivisionsU = 64,
  subdivisionsV = 64
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Grid coordinates: u goes horizontally (-PI to PI), v goes vertically (top of head to neck)
  for (let j = 0; j <= subdivisionsV; j++) {
    const v = j / subdivisionsV; // 0 (top of cranium) -> 1 (base of neck)
    const phi = v * Math.PI;

    for (let i = 0; i <= subdivisionsU; i++) {
      const u = i / subdivisionsU; // 0 -> 1 around the head
      const theta = (u - 0.5) * Math.PI * 2; // -PI (back) -> 0 (front of face) -> PI (back)

      // Base ellipsoid head shape (width x, height y, depth z)
      let headRadiusX = 0.95;
      let headRadiusY = 1.35;
      let headRadiusZ = 1.15;

      // Basic spherical/ellipsoid coordinates
      let sinPhi = Math.sin(phi);
      let cosPhi = Math.cos(phi);
      let sinTheta = Math.sin(theta);
      let cosTheta = Math.cos(theta); // 1 = front, -1 = back

      // Normalized coordinates
      let x = headRadiusX * sinPhi * sinTheta;
      let y = headRadiusY * cosPhi;
      let z = headRadiusZ * sinPhi * cosTheta;

      // ── ANATOMICAL 3D SCULPTING FOR FRONT OF FACE (cosTheta > 0) ──
      const isFront = cosTheta > 0.05;
      const frontFactor = Math.max(0, cosTheta); // 1.0 at nose/lips, drops off to sides

      // Normalized vertical face zones (-1 at chin to +1 at forehead)
      const faceY = y / 1.1; // roughly -1 to +1

      if (isFront) {
        // 1. FOREHEAD & BROW RIDGE (faceY between 0.25 and 0.55)
        if (faceY > 0.25 && faceY < 0.6) {
          const browWeight = Math.sin(((faceY - 0.25) / 0.35) * Math.PI) * Math.pow(frontFactor, 1.8);
          // Subtle protrusion over eye orbits
          z += 0.08 * browWeight;
        }

        // 2. EYE SOCKETS (faceY between 0.05 and 0.30, |x| between 0.15 and 0.45)
        const eyeCenterDistL = Math.hypot(x + 0.32, faceY - 0.18);
        const eyeCenterDistR = Math.hypot(x - 0.32, faceY - 0.18);
        const eyeSocketFactor = Math.min(eyeCenterDistL, eyeCenterDistR);
        if (eyeSocketFactor < 0.28) {
          const recess = Math.cos((eyeSocketFactor / 0.28) * (Math.PI / 2)) * 0.14 * frontFactor;
          z -= recess;
        }

        // 3. 3D SCULPTED NOSE (faceY between -0.22 and +0.16, |x| < 0.22)
        if (faceY >= -0.22 && faceY <= 0.16 && Math.abs(x) < 0.22) {
          const noseProgress = (faceY - (-0.22)) / 0.38; // 0 at base, 1 at bridge
          const noseWidth = 0.08 + (1 - noseProgress) * 0.07; // narrows at bridge, flares at nostrils
          const latDist = Math.abs(x);

          if (latDist < noseWidth) {
            const crossProfile = Math.cos((latDist / noseWidth) * (Math.PI / 2));
            // Profile along the nose bridge from eyes to tip
            let noseBridgeHeight = 0.14;
            if (noseProgress < 0.35) {
              // Nose tip & nostrils: maximum 3D projection
              noseBridgeHeight = 0.28 + Math.sin((noseProgress / 0.35) * Math.PI) * 0.06;
            } else {
              // Nasal bone bridge
              noseBridgeHeight = 0.16 + (1 - (noseProgress - 0.35) / 0.65) * 0.12;
            }
            z += noseBridgeHeight * crossProfile * frontFactor;
          }
        }

        // 4. 3D SCULPTED LIPS (faceY between -0.55 and -0.24, |x| < 0.30)
        if (faceY >= -0.55 && faceY <= -0.24 && Math.abs(x) < 0.30) {
          const lipProgress = (faceY - (-0.55)) / 0.31; // 0 bottom, 1 top
          const lipWidth = 0.24;
          const latDist = Math.abs(x);

          if (latDist < lipWidth) {
            const taper = Math.cos((latDist / lipWidth) * (Math.PI / 2));

            // Upper lip (lipProgress 0.5 to 0.95)
            if (lipProgress >= 0.5) {
              // Cupid's bow dip at center x=0
              const cupidDip = Math.sin((latDist / 0.12) * Math.PI);
              const upperLipHeight = (0.12 + cupidDip * 0.03) * taper * frontFactor;
              z += upperLipHeight;
            }
            // Lower lip (lipProgress 0.15 to 0.5)
            else if (lipProgress >= 0.15) {
              // Fleshy, pillowy lower lip volume
              const lowerLipVolume = Math.sin(((lipProgress - 0.15) / 0.35) * Math.PI);
              z += lowerLipVolume * 0.15 * taper * frontFactor;
            }
          }
        }

        // 5. 3D CHEEKBONES & ZYGOMATIC ARCH (faceY between -0.15 and +0.15, |x| between 0.30 and 0.65)
        if (faceY >= -0.15 && faceY <= 0.18 && Math.abs(x) > 0.25 && Math.abs(x) < 0.7) {
          const cheekYFactor = Math.sin(((faceY - (-0.15)) / 0.33) * Math.PI);
          const cheekXFactor = Math.sin(((Math.abs(x) - 0.25) / 0.45) * Math.PI);
          z += 0.11 * cheekYFactor * cheekXFactor * frontFactor;
        }

        // 6. 3D CHIN PROMINENCE (faceY between -0.85 and -0.55, |x| < 0.26)
        if (faceY >= -0.85 && faceY <= -0.55 && Math.abs(x) < 0.26) {
          const chinProgress = Math.sin(((faceY - (-0.85)) / 0.30) * Math.PI);
          const chinTaper = Math.cos((Math.abs(x) / 0.26) * (Math.PI / 2));
          z += 0.13 * chinProgress * chinTaper * frontFactor;
        }

        // 7. JAWLINE TAPERING (faceY between -0.9 and -0.4)
        if (faceY < -0.4 && faceY > -0.9) {
          const jawTaper = 1.0 - ((-0.4 - faceY) / 0.5) * 0.22;
          x *= jawTaper;
        }
      }

      // 8. NECK CYLINDER (v > 0.78)
      if (v > 0.78) {
        const neckFactor = (v - 0.78) / 0.22;
        const targetRadiusX = 0.52 + neckFactor * 0.12;
        const targetRadiusZ = 0.58 + neckFactor * 0.08;
        x = x * (1 - neckFactor) + targetRadiusX * sinTheta * neckFactor;
        z = z * (1 - neckFactor) + targetRadiusZ * cosTheta * neckFactor;
        y = y * 0.95 - neckFactor * 0.35;
      }

      // UV mapping: cylindrical projection normalized for clean front facial alignment
      // Face is centered at u=0.5, v=0.5
      let uvU = u;
      let uvV = 1.0 - v;

      // Optimize facial UV resolution so the face has maximum texture detail
      if (isFront) {
        // Expand face UV coordinates slightly to give maximum texture fidelity
        const faceU = 0.5 + (sinTheta * 0.5);
        const faceV = 0.5 + (faceY * 0.45);
        uvU = THREE.MathUtils.lerp(uvU, faceU, 0.5);
        uvV = THREE.MathUtils.lerp(uvV, faceV, 0.5);
      }

      positions.push(x, y, z);
      uvs.push(uvU, uvV);
    }
  }

  // Create triangle indices connecting the grid
  for (let j = 0; j < subdivisionsV; j++) {
    for (let i = 0; i < subdivisionsU; i++) {
      const a = j * (subdivisionsU + 1) + i;
      const b = (j + 1) * (subdivisionsU + 1) + i;
      const c = (j + 1) * (subdivisionsU + 1) + (i + 1);
      const d = j * (subdivisionsU + 1) + (i + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

// ── 2. REALISTIC 3D EYEBALL CREATOR ────────────────────────────────────────────
export function createRealisticEyeball(isLeft: boolean): THREE.Group {
  const eyeGroup = new THREE.Group();

  // Sclera + Iris Sphere
  const eyeGeo = new THREE.SphereGeometry(0.125, 32, 32);

  // Sclera Texture with subtle radial iris and veins
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Sclera off-white base
  ctx.fillStyle = '#F8F9FA';
  ctx.fillRect(0, 0, 512, 512);

  // Soft vascular pink around edges
  const edgeGrad = ctx.createRadialGradient(256, 256, 150, 256, 256, 256);
  edgeGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  edgeGrad.addColorStop(1, 'rgba(235, 180, 180, 0.45)');
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Iris (Luxury Honey Amber / Warm Deep Hazel)
  const irisGrad = ctx.createRadialGradient(256, 256, 10, 256, 256, 120);
  irisGrad.addColorStop(0, '#1A0E0A');
  irisGrad.addColorStop(0.35, '#5C3317');
  irisGrad.addColorStop(0.7, '#8C5A28');
  irisGrad.addColorStop(0.95, '#3B2011');
  irisGrad.addColorStop(1, '#1A0F0A'); // Limbal ring

  ctx.beginPath();
  ctx.arc(256, 256, 115, 0, Math.PI * 2);
  ctx.fillStyle = irisGrad;
  ctx.fill();

  // Pupil
  ctx.beginPath();
  ctx.arc(256, 256, 44, 0, Math.PI * 2);
  ctx.fillStyle = '#060608';
  ctx.fill();

  // Specular light catch reflection
  ctx.beginPath();
  ctx.arc(280, 235, 12, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;

  const eyeMat = new THREE.MeshPhysicalMaterial({
    map: texture,
    roughness: 0.05,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    transmission: 0.0,
  });

  const mesh = new THREE.Mesh(eyeGeo, eyeMat);
  mesh.rotation.y = Math.PI / 2; // Face forward
  eyeGroup.add(mesh);

  // Position in anatomical eye socket
  const posX = isLeft ? -0.32 : 0.32;
  eyeGroup.position.set(posX, 0.21, 0.82);

  return eyeGroup;
}

// ── 3. ELEGANT 3D BRIDAL HAIR CREATOR ──────────────────────────────────────────
export function createHairMesh(colorHex = '#1E1514'): THREE.Mesh {
  // Volumetric cranial hair volume surrounding the top, back and sides
  const hairGeo = new THREE.SphereGeometry(1.08, 48, 48, 0, Math.PI * 2, 0, Math.PI * 0.72);

  // Deform hair geometry to create an elegant bridal chignon / soft textured updo
  const pos = hairGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let px = pos.getX(i);
    let py = pos.getY(i);
    let pz = pos.getZ(i);

    // Front hairline carve-out so face is clearly exposed
    if (pz > 0.4 && py > -0.2) {
      // Arch hairline
      const foreheadArch = Math.max(0, 0.7 - Math.pow(px / 0.7, 2));
      if (py < foreheadArch) {
        py += 0.35;
        pz -= 0.25;
      }
    }

    // Rear chignon bun volume
    if (pz < -0.4 && py > -0.4 && py < 0.3) {
      pz -= 0.32; // Bun volume back
      py += 0.05;
    }

    pos.setXYZ(i, px, py * 1.15, pz * 1.08);
  }
  hairGeo.computeVertexNormals();

  const hairMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.65,
    metalness: 0.15,
    side: THREE.DoubleSide,
  });

  const hairMesh = new THREE.Mesh(hairGeo, hairMat);
  hairMesh.position.set(0, 0.18, -0.05);
  return hairMesh;
}

// ── 4. DYNAMIC 2048x2048 MAKEUP TEXTURE BAKING PIPELINE ───────────────────────
// Paints ultra-crisp, professional beauty salon makeup directly into the 3D UV space
export function bakeMakeupTexture(
  makeup: MakeupState,
  skinColorHex: string,
  userPhoto?: HTMLImageElement | HTMLCanvasElement | null
): THREE.CanvasTexture {
  const size = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // 1. Base Skin Tone
  ctx.fillStyle = skinColorHex;
  ctx.fillRect(0, 0, size, size);

  // Optional: If user uploaded photo, blend photo in subtle overlay
  if (userPhoto) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.drawImage(userPhoto, size * 0.2, size * 0.15, size * 0.6, size * 0.65);
    ctx.restore();
  }

  // Soft skin shading & natural complexion warmth
  const skinGlow = ctx.createRadialGradient(size * 0.5, size * 0.5, size * 0.1, size * 0.5, size * 0.5, size * 0.45);
  skinGlow.addColorStop(0, 'rgba(255, 230, 220, 0.18)');
  skinGlow.addColorStop(0.6, 'rgba(220, 160, 140, 0.12)');
  skinGlow.addColorStop(1, 'rgba(120, 70, 50, 0.25)');
  ctx.fillStyle = skinGlow;
  ctx.fillRect(0, 0, size, size);

  // ── 2. 3D CONTOUR & FOUNDATION PREVIEW ──
  if (makeup.face.foundation.enabled && makeup.face.foundation.coverage > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = makeup.face.foundation.shade;
    ctx.globalAlpha = makeup.face.foundation.coverage * 0.5;
    ctx.fillRect(0, 0, size, size);
    ctx.restore();
  }

  // ── 3. 3D BLUSH ON CHEEKBONES ──
  if (makeup.face.blush.enabled && makeup.face.blush.intensity > 0) {
    const blushColor = makeup.face.blush.color;
    const blushAlpha = makeup.face.blush.intensity * 0.65;

    // Left cheekbone center in UV space
    const leftCheekX = size * 0.36;
    const rightCheekX = size * 0.64;
    const cheekY = size * 0.52;

    [leftCheekX, rightCheekX].forEach(cx => {
      ctx.save();
      const grad = ctx.createRadialGradient(cx, cheekY, size * 0.02, cx, cheekY, size * 0.13);
      grad.addColorStop(0, blushColor);
      grad.addColorStop(0.5, blushColor);
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = blushAlpha;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cheekY, size * 0.13, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // ── 4. 3D DEWY HIGHLIGHTER ON CHEEK PEAKS & NOSE TIP ──
  if (makeup.face.highlighter.enabled && makeup.face.highlighter.intensity > 0) {
    const hlAlpha = makeup.face.highlighter.intensity * 0.75;
    const hlColor = '#FFF5EB';

    // Cheekbone high points & Nose tip
    const spots = [
      { x: size * 0.37, y: size * 0.47, r: size * 0.05 }, // Left cheek peak
      { x: size * 0.63, y: size * 0.47, r: size * 0.05 }, // Right cheek peak
      { x: size * 0.50, y: size * 0.50, r: size * 0.035 }, // Nose tip
      { x: size * 0.50, y: size * 0.41, r: size * 0.025 }, // Nose bridge
      { x: size * 0.50, y: size * 0.64, r: size * 0.025 }, // Cupid's bow peak
    ];

    spots.forEach(spot => {
      ctx.save();
      const grad = ctx.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, spot.r);
      grad.addColorStop(0, hlColor);
      grad.addColorStop(0.5, 'rgba(255, 240, 220, 0.5)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = hlAlpha;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // ── 5. 3D EYESHADOW OVER UPPER EYELIDS ──
  if (makeup.eyes.eyeshadow.enabled && makeup.eyes.eyeshadow.intensity > 0) {
    const { primaryColor, secondaryColor, intensity, shimmer } = makeup.eyes.eyeshadow;

    const eyeCenters = [
      { x: size * 0.38, y: size * 0.40 }, // Left eye
      { x: size * 0.62, y: size * 0.40 }, // Right eye
    ];

    eyeCenters.forEach(eye => {
      ctx.save();
      // Crease & lid gradient
      const grad = ctx.createRadialGradient(eye.x, eye.y, size * 0.015, eye.x, eye.y, size * 0.08);
      grad.addColorStop(0, primaryColor);
      grad.addColorStop(0.65, secondaryColor);
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = intensity * 0.8;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(eye.x, eye.y - size * 0.02, size * 0.065, size * 0.04, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shimmer reflection
      if (shimmer > 0.1) {
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = shimmer * 0.6;
        const shimmerGrad = ctx.createRadialGradient(eye.x, eye.y - size * 0.015, 0, eye.x, eye.y - size * 0.015, size * 0.035);
        shimmerGrad.addColorStop(0, '#FFE8C8');
        shimmerGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = shimmerGrad;
        ctx.beginPath();
        ctx.arc(eye.x, eye.y - size * 0.015, size * 0.035, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  // ── 6. 3D EYELINER & LASH LINE ──
  if (makeup.eyes.eyeliner.enabled && makeup.eyes.eyeliner.intensity > 0) {
    const linerColor = makeup.eyes.eyeliner.color;
    const linerAlpha = makeup.eyes.eyeliner.intensity * 0.95;

    ctx.save();
    ctx.strokeStyle = linerColor;
    ctx.fillStyle = linerColor;
    ctx.globalAlpha = linerAlpha;
    ctx.lineWidth = size * 0.007;
    ctx.lineCap = 'round';

    // Left eye winged liner
    ctx.beginPath();
    ctx.moveTo(size * 0.33, size * 0.395);
    ctx.quadraticCurveTo(size * 0.38, size * 0.38, size * 0.43, size * 0.40);
    ctx.stroke();

    // Wing flick left
    if (makeup.eyes.eyeliner.style === 'winged' || makeup.eyes.eyeliner.style === 'cat-eye') {
      ctx.beginPath();
      ctx.moveTo(size * 0.335, size * 0.395);
      ctx.quadraticCurveTo(size * 0.31, size * 0.385, size * 0.295, size * 0.375);
      ctx.stroke();
    }

    // Right eye winged liner
    ctx.beginPath();
    ctx.moveTo(size * 0.57, size * 0.40);
    ctx.quadraticCurveTo(size * 0.62, size * 0.38, size * 0.67, size * 0.395);
    ctx.stroke();

    // Wing flick right
    if (makeup.eyes.eyeliner.style === 'winged' || makeup.eyes.eyeliner.style === 'cat-eye') {
      ctx.beginPath();
      ctx.moveTo(size * 0.665, size * 0.395);
      ctx.quadraticCurveTo(size * 0.69, size * 0.385, size * 0.705, size * 0.375);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ── 7. 3D VOLUMETRIC LIPSTICK WITH GLOSS / MATTE / SATIN FINISHES ──
  if (makeup.lips.enabled && makeup.lips.intensity > 0) {
    const lipColor = makeup.lips.color;
    const lipAlpha = makeup.lips.intensity * 0.9;
    const lipCx = size * 0.50;
    const lipCy = size * 0.68;

    ctx.save();
    ctx.fillStyle = lipColor;
    ctx.globalAlpha = lipAlpha;

    // Upper Lip with Cupid's Bow
    ctx.beginPath();
    ctx.moveTo(lipCx - size * 0.08, lipCy);
    ctx.quadraticCurveTo(lipCx - size * 0.04, lipCy - size * 0.038, lipCx - size * 0.015, lipCy - size * 0.035);
    ctx.lineTo(lipCx, lipCy - size * 0.025); // Cupid center dip
    ctx.lineTo(lipCx + size * 0.015, lipCy - size * 0.035);
    ctx.quadraticCurveTo(lipCx + size * 0.04, lipCy - size * 0.038, lipCx + size * 0.08, lipCy);
    ctx.quadraticCurveTo(lipCx, lipCy + size * 0.01, lipCx - size * 0.08, lipCy);
    ctx.fill();

    // Lower Lip with Full Pillowy Curvature
    ctx.beginPath();
    ctx.moveTo(lipCx - size * 0.08, lipCy);
    ctx.quadraticCurveTo(lipCx, lipCy + size * 0.008, lipCx + size * 0.08, lipCy);
    ctx.quadraticCurveTo(lipCx, lipCy + size * 0.055, lipCx - size * 0.08, lipCy);
    ctx.fill();

    // Finish Effects: Glossy reflective arcs
    if (makeup.lips.finish === 'glossy' || (makeup.lips.glossLevel && makeup.lips.glossLevel > 0.3)) {
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = '#FFFFFF';

      // Lower lip central sheen highlight
      ctx.beginPath();
      ctx.ellipse(lipCx, lipCy + size * 0.024, size * 0.035, size * 0.009, 0, 0, Math.PI * 2);
      ctx.fill();

      // Upper lip twin crest gleams
      ctx.beginPath();
      ctx.arc(lipCx - size * 0.02, lipCy - size * 0.028, size * 0.006, 0, Math.PI * 2);
      ctx.arc(lipCx + size * 0.02, lipCy - size * 0.028, size * 0.006, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // ── 8. EYEBROWS ──
  ctx.save();
  ctx.strokeStyle = '#2B1B17';
  ctx.lineWidth = size * 0.009;
  ctx.lineCap = 'round';
  ctx.globalAlpha = 0.85;

  // Left eyebrow
  ctx.beginPath();
  ctx.moveTo(size * 0.44, size * 0.34);
  ctx.quadraticCurveTo(size * 0.37, size * 0.32, size * 0.31, size * 0.36);
  ctx.stroke();

  // Right eyebrow
  ctx.beginPath();
  ctx.moveTo(size * 0.56, size * 0.34);
  ctx.quadraticCurveTo(size * 0.63, size * 0.32, size * 0.69, size * 0.36);
  ctx.stroke();

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

// ── 5. THREE.JS MASTER STUDIO INSTANTIATOR ────────────────────────────────────
export function createTrue3DStudio(options: ThreeStudioOptions): ThreeStudioInstance {
  const { container, skinTone = '#EAC0A2', initialMakeup, onReady } = options;

  const width = container.clientWidth || 700;
  const height = container.clientHeight || 700;

  // 1. Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x181412); // Warm luxury deep charcoal / espresso

  // 2. Camera
  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
  camera.position.set(0, 0.1, 2.8);

  // 3. Antialiased PBR Renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // 4. OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxDistance = 4.5;
  controls.minDistance = 1.2;
  controls.maxPolarAngle = Math.PI * 0.75;
  controls.minPolarAngle = Math.PI * 0.25;
  controls.target.set(0, 0.05, 0);

  // 5. Studio Lighting Rig
  const ambientLight = new THREE.AmbientLight(0xFFF3E6, 1.1); // Warm luxury ambient
  scene.add(ambientLight);

  // Key Light (Main soft light from upper right)
  const keyLight = new THREE.DirectionalLight(0xFFFFFF, 1.4);
  keyLight.position.set(2.5, 3.0, 3.0);
  keyLight.castShadow = true;
  scene.add(keyLight);

  // Fill Light (Soft warm champagne light from left)
  const fillLight = new THREE.DirectionalLight(0xFFE8D6, 0.85);
  fillLight.position.set(-2.5, 1.5, 2.0);
  scene.add(fillLight);

  // Rim Light (Rose-gold rim light from behind for silhouette depth)
  const rimLight = new THREE.DirectionalLight(0xFFB5A7, 1.0);
  rimLight.position.set(0, 2.5, -2.5);
  scene.add(rimLight);

  // 6. Build Volumetric 3D Head
  const headGeo = createVolumetricHeadGeometry(72, 72);

  // Initial Baked Makeup Texture
  let currentSkinTone = skinTone;
  let currentMakeup = { ...initialMakeup };
  let makeupTexture = bakeMakeupTexture(currentMakeup, currentSkinTone);

  // High-End Physical Skin Material
  const skinMaterial = new THREE.MeshPhysicalMaterial({
    map: makeupTexture,
    roughness: 0.42,
    metalness: 0.02,
    clearcoat: 0.18, // Dewy skin glow
    clearcoatRoughness: 0.25,
    sheen: 0.4,
    sheenColor: new THREE.Color(0xFFE4D6),
    side: THREE.FrontSide,
  });

  const headMesh = new THREE.Mesh(headGeo, skinMaterial);
  headMesh.castShadow = true;
  headMesh.receiveShadow = true;
  scene.add(headMesh);

  // 7. Add Realistic 3D Eyeballs in eye sockets
  const leftEye = createRealisticEyeball(true);
  const rightEye = createRealisticEyeball(false);
  headMesh.add(leftEye);
  headMesh.add(rightEye);

  // 8. Add 3D Bridal Hair Mesh
  const hairMesh = createHairMesh(currentMakeup.hair.color || '#1A1210');
  headMesh.add(hairMesh);

  // 9. Methods
  function updateMakeup(newMakeup: MakeupState) {
    currentMakeup = { ...newMakeup };
    const newTex = bakeMakeupTexture(currentMakeup, currentSkinTone);
    skinMaterial.map = newTex;
    skinMaterial.needsUpdate = true;

    // Update hair color if modified
    if (newMakeup.hair && (hairMesh.material as THREE.MeshStandardMaterial)) {
      (hairMesh.material as THREE.MeshStandardMaterial).color.set(newMakeup.hair.color);
    }
  }

  function setSkinTone(hex: string) {
    currentSkinTone = hex;
    const newTex = bakeMakeupTexture(currentMakeup, currentSkinTone);
    skinMaterial.map = newTex;
    skinMaterial.needsUpdate = true;
  }

  function setHairStyle(style: 'bridal-updo' | 'sleek-waves' | 'smooth') {
    // Modify scale & position based on hairstyle
    if (style === 'bridal-updo') {
      hairMesh.scale.set(1.0, 1.0, 1.0);
    } else if (style === 'sleek-waves') {
      hairMesh.scale.set(1.04, 1.08, 1.04);
    } else {
      hairMesh.scale.set(0.98, 0.98, 0.98);
    }
  }

  function setCameraAngle(angle: 'front' | 'three-quarter-left' | 'three-quarter-right' | 'profile-left' | 'profile-right' | 'lips' | 'eyes') {
    switch (angle) {
      case 'front':
        camera.position.set(0, 0.1, 2.7);
        controls.target.set(0, 0.05, 0);
        break;
      case 'three-quarter-left':
        camera.position.set(-1.2, 0.15, 2.4);
        controls.target.set(0, 0.05, 0);
        break;
      case 'three-quarter-right':
        camera.position.set(1.2, 0.15, 2.4);
        controls.target.set(0, 0.05, 0);
        break;
      case 'profile-left':
        camera.position.set(-2.5, 0.05, 0.5);
        controls.target.set(0, 0.05, 0);
        break;
      case 'profile-right':
        camera.position.set(2.5, 0.05, 0.5);
        controls.target.set(0, 0.05, 0);
        break;
      case 'lips':
        camera.position.set(0, -0.22, 1.5);
        controls.target.set(0, -0.25, 0.4);
        break;
      case 'eyes':
        camera.position.set(0, 0.28, 1.45);
        controls.target.set(0, 0.22, 0.4);
        break;
    }
    controls.update();
  }

  function resetCamera() {
    setCameraAngle('front');
  }

  function setLightingMood(mood: 'studio' | 'golden-hour' | 'spotlight') {
    if (mood === 'golden-hour') {
      keyLight.color.set('#FFA764');
      fillLight.color.set('#FFD8B3');
      rimLight.color.set('#FF8C5A');
      ambientLight.color.set('#FFF2E0');
    } else if (mood === 'spotlight') {
      keyLight.color.set('#FFFFFF');
      keyLight.intensity = 1.9;
      fillLight.intensity = 0.4;
      rimLight.intensity = 1.4;
    } else {
      // Classic Studio Glamour
      keyLight.color.set('#FFFFFF');
      keyLight.intensity = 1.4;
      fillLight.color.set('#FFE8D6');
      fillLight.intensity = 0.85;
      rimLight.color.set('#FFB5A7');
      rimLight.intensity = 1.0;
    }
  }

  function toggleWireframe(show: boolean) {
    skinMaterial.wireframe = show;
  }

  function applyUserPhotoTexture(img: HTMLImageElement | HTMLCanvasElement) {
    const newTex = bakeMakeupTexture(currentMakeup, currentSkinTone, img);
    skinMaterial.map = newTex;
    skinMaterial.needsUpdate = true;
  }

  function exportSnapshotPng(multiplier = 2): string {
    renderer.render(scene, camera);
    return renderer.domElement.toDataURL('image/png', 1.0);
  }

  // Animation Loop
  let animId: number;
  let running = true;

  function animate() {
    if (!running) return;
    animId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  function handleResize() {
    if (!container) return;
    const w = container.clientWidth || 700;
    const h = container.clientHeight || 700;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', handleResize);

  function destroy() {
    running = false;
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', handleResize);
    controls.dispose();
    headGeo.dispose();
    skinMaterial.dispose();
    makeupTexture.dispose();
    renderer.dispose();
    if (container && renderer.domElement && container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
  }

  if (onReady) onReady();

  return {
    renderer,
    scene,
    camera,
    controls,
    headMesh,
    hairMesh,
    leftEyeMesh: leftEye.children[0] as THREE.Mesh,
    rightEyeMesh: rightEye.children[0] as THREE.Mesh,
    updateMakeup,
    setSkinTone,
    setHairStyle,
    setCameraAngle,
    resetCamera,
    setLightingMood,
    toggleWireframe,
    applyUserPhotoTexture,
    exportSnapshotPng,
    destroy,
  };
}

// Backwards compatibility alias for older references
export const createPersonalizedThreeFaceScene = (
  container: HTMLDivElement,
  userPhotoElement: HTMLImageElement | HTMLCanvasElement,
  _landmarks: any[],
  initialMakeup: MakeupState
) => {
  const instance = createTrue3DStudio({
    container,
    initialMakeup,
  });
  if (userPhotoElement) {
    instance.applyUserPhotoTexture?.(userPhotoElement);
  }
  return {
    ...instance,
    updateMakeupTexture: (makeup: MakeupState) => instance.updateMakeup(makeup),
    exportViewPng: (mult = 1) => instance.exportSnapshotPng(mult),
  };
};

export type ThreeFaceScene = ReturnType<typeof createPersonalizedThreeFaceScene>;
