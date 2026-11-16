import * as THREE from 'three';
import { FruitKind } from '@/types';

// Helper to generate a 3D leaf mesh using ShapeGeometry with natural curve
function createLeafMesh(length: number = 0.45, width: number = 0.2, color: number = 0x22c55e): THREE.Mesh {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(width * 1.1, length * 0.35, width * 0.9, length * 0.75, 0, length);
  shape.bezierCurveTo(-width * 0.9, length * 0.75, -width * 1.1, length * 0.35, 0, 0);

  const geom = new THREE.ShapeGeometry(shape, 12);
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.28,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.castShadow = true;
  return mesh;
}

// Gentle deterministic surface detail gives procedural fruit a less plastic silhouette.
// Geometry is modified before normals are computed so studio lighting stays smooth.
function sculptFruitSurface(geometry: THREE.SphereGeometry, kind: 'apple' | 'orange' | 'strawberry' | 'lemon') {
  const positions = geometry.attributes.position as THREE.BufferAttribute;
  const normal = new THREE.Vector3();
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    const len = Math.hypot(x, y, z) || 1;
    const latitude = y / len;
    const angle = Math.atan2(z, x);
    let factor = 1;
    if (kind === 'apple') {
      // Five subtle lobes near the top and a shallow stem indentation.
      factor += 0.025 * Math.cos(angle * 5) * Math.pow(Math.abs(latitude), 5);
      factor -= 0.12 * Math.pow(Math.max(0, latitude), 16);
      factor -= 0.05 * Math.pow(Math.max(0, -latitude), 12);
    } else if (kind === 'strawberry') {
      // Broad shoulders transition into the narrow pointed berry tip.
      factor += 0.16 * latitude - 0.035 * Math.cos(angle * 6) * Math.max(0, latitude);
    } else if (kind === 'lemon') {
      factor += 0.015 * Math.cos(angle * 7) * (1 - latitude * latitude);
    } else {
      // Tiny dimples / texture variation on citrus peel.
      factor += 0.007 * Math.sin(x * 57) * Math.sin(y * 63) * Math.sin(z * 59);
    }
    normal.set(x, y, z).multiplyScalar(factor);
    positions.setXYZ(i, normal.x, normal.y, normal.z);
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
}

// Procedural cross-section textures
function createCrossSectionTexture(kind: FruitKind): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const cx = 256;
    const cy = 256;
    const r = 242;

    if (kind === 'watermelon') {
      // Dark green outer rind
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Middle rind layer (emerald)
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(cx, cy, r - 6, 0, Math.PI * 2);
      ctx.fill();

      // Pale inner rind (crisp whitish jade)
      ctx.fillStyle = '#dcfce7';
      ctx.beginPath();
      ctx.arc(cx, cy, r - 14, 0, Math.PI * 2);
      ctx.fill();

      // Crimson pulp gradient
      const grad = ctx.createRadialGradient(cx, cy, 30, cx, cy, r - 26);
      grad.addColorStop(0, '#ff1744');
      grad.addColorStop(0.7, '#e11d48');
      grad.addColorStop(1, '#be123c');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r - 26, 0, Math.PI * 2);
      ctx.fill();

      // Subtle juicy pulp radial texture
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1.5;
      for (let a = 0; a < Math.PI * 2; a += 0.08) {
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 35, cy + Math.sin(a) * 35);
        ctx.lineTo(cx + Math.cos(a) * (r - 35), cy + Math.sin(a) * (r - 35));
        ctx.stroke();
      }

      // Black seeds with teardrop highlights
      ctx.fillStyle = '#09090b';
      for (let i = 0; i < 22; i++) {
        const angle = (i / 22) * Math.PI * 2 + (i % 2) * 0.15;
        const dist = 75 + (i % 3) * 44;
        const sx = cx + Math.cos(angle) * dist;
        const sy = cy + Math.sin(angle) * dist;

        ctx.beginPath();
        ctx.ellipse(sx, sy, 8, 14, angle, 0, Math.PI * 2);
        ctx.fill();

        // Seed shine highlight
        ctx.fillStyle = '#71717a';
        ctx.beginPath();
        ctx.arc(sx - 2, sy - 3, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#09090b';
      }
    } else if (kind === 'orange') {
      // Bright orange peel rim
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Pale pith ring
      ctx.fillStyle = '#ffedd5';
      ctx.beginPath();
      ctx.arc(cx, cy, r - 14, 0, Math.PI * 2);
      ctx.fill();

      // 10 Juicy citrus segments
      const segmentCount = 10;
      for (let i = 0; i < segmentCount; i++) {
        const startAngle = (i / segmentCount) * Math.PI * 2 + 0.04;
        const endAngle = ((i + 1) / segmentCount) * Math.PI * 2 - 0.04;

        const sGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, r - 22);
        sGrad.addColorStop(0, '#fb923c');
        sGrad.addColorStop(1, '#f97316');
        ctx.fillStyle = sGrad;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r - 22, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();

        // Inner vesicle pulp striations
        ctx.strokeStyle = 'rgba(255, 237, 213, 0.35)';
        ctx.lineWidth = 1;
        const midA = (startAngle + endAngle) / 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(midA) * 35, cy + Math.sin(midA) * 35);
        ctx.lineTo(cx + Math.cos(midA) * (r - 30), cy + Math.sin(midA) * (r - 30));
        ctx.stroke();
      }

      // Citrus center pith star
      ctx.fillStyle = '#fff7ed';
      ctx.beginPath();
      ctx.arc(cx, cy, 26, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 'apple') {
      // Scarlet red peel rim
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Crisp creamy ivory flesh
      const fleshGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, r - 10);
      fleshGrad.addColorStop(0, '#fef9c3');
      fleshGrad.addColorStop(0.85, '#fef08a');
      fleshGrad.addColorStop(1, '#fde047');
      ctx.fillStyle = fleshGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r - 10, 0, Math.PI * 2);
      ctx.fill();

      // Central core outline star
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(cx, cy, 40, 0, Math.PI * 2);
      ctx.fill();

      // Inner core chamber
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.fill();

      // Apple seeds
      ctx.fillStyle = '#291508';
      ctx.beginPath();
      ctx.ellipse(cx - 15, cy, 7, 15, 0.35, 0, Math.PI * 2);
      ctx.ellipse(cx + 15, cy, 7, 15, -0.35, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 'lemon') {
      // Neon yellow peel rim
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Pale inner pith
      ctx.fillStyle = '#fef9c3';
      ctx.beginPath();
      ctx.arc(cx, cy, r - 12, 0, Math.PI * 2);
      ctx.fill();

      // 8 tart lemon segments
      for (let i = 0; i < 8; i++) {
        const startAngle = (i / 8) * Math.PI * 2 + 0.05;
        const endAngle = ((i + 1) / 8) * Math.PI * 2 - 0.05;

        const lGrad = ctx.createRadialGradient(cx, cy, 25, cx, cy, r - 20);
        lGrad.addColorStop(0, '#fde047');
        lGrad.addColorStop(1, '#facc15');
        ctx.fillStyle = lGrad;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r - 20, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();
      }

      // Central pith core
      ctx.fillStyle = '#fffbeb';
      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 'kiwi') {
      // Fuzzy brown skin
      ctx.fillStyle = '#5c2d12';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Emerald green pulp
      const kGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, r - 12);
      kGrad.addColorStop(0, '#84cc16');
      kGrad.addColorStop(0.7, '#65a30d');
      kGrad.addColorStop(1, '#4d7c0f');
      ctx.fillStyle = kGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r - 12, 0, Math.PI * 2);
      ctx.fill();

      // Pale creamy center core
      ctx.fillStyle = '#ecfccb';
      ctx.beginPath();
      ctx.arc(cx, cy, 52, 0, Math.PI * 2);
      ctx.fill();

      // Radiating fine white capillary rays
      ctx.strokeStyle = 'rgba(236, 252, 203, 0.4)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 32; i++) {
        const angle = (i / 32) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * 52, cy + Math.sin(angle) * 52);
        ctx.lineTo(cx + Math.cos(angle) * 165, cy + Math.sin(angle) * 165);
        ctx.stroke();
      }

      // Ring of dark kiwi seeds
      ctx.fillStyle = '#18181b';
      for (let i = 0; i < 32; i++) {
        const angle = (i / 32) * Math.PI * 2;
        const dist = 80 + (i % 2) * 18;
        const sx = cx + Math.cos(angle) * dist;
        const sy = cy + Math.sin(angle) * dist;

        ctx.beginPath();
        ctx.ellipse(sx, sy, 5, 9, angle, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (kind === 'dragonfruit') {
      // Vivid magenta dragonfruit peel rim
      ctx.fillStyle = '#be185d';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff007f';
      ctx.beginPath();
      ctx.arc(cx, cy, r - 8, 0, Math.PI * 2);
      ctx.fill();

      // Lime scale tip accents on the rim
      ctx.fillStyle = '#39ff14';
      for (let i = 0; i < 14; i++) {
        const angle = (i / 14) * Math.PI * 2;
        const sx = cx + Math.cos(angle) * (r - 4);
        const sy = cy + Math.sin(angle) * (r - 4);
        ctx.beginPath();
        ctx.arc(sx, sy, 10, 0, Math.PI * 2);
        ctx.fill();
      }

      // Crisp white pulp with tiny black seeds
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(cx, cy, r - 18, 0, Math.PI * 2);
      ctx.fill();

      // Many speckle seeds
      ctx.fillStyle = '#0f172a';
      for (let i = 0; i < 90; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * (r - 35);
        const sx = cx + Math.cos(angle) * dist;
        const sy = cy + Math.sin(angle) * dist;
        ctx.beginPath();
        ctx.arc(sx, sy, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (kind === 'strawberry') {
      // Ruby red outer edge
      ctx.fillStyle = '#be123c';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Strawberry gradient flesh
      const strGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, r - 10);
      strGrad.addColorStop(0, '#ffffff');
      strGrad.addColorStop(0.3, '#fecdd3');
      strGrad.addColorStop(0.65, '#f43f5e');
      strGrad.addColorStop(1, '#e11d48');
      ctx.fillStyle = strGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r - 10, 0, Math.PI * 2);
      ctx.fill();

      // Radiating pulp star rays
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.5;
      for (let a = 0; a < Math.PI * 2; a += 0.18) {
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 20, cy + Math.sin(a) * 20);
        ctx.lineTo(cx + Math.cos(a) * (r - 28), cy + Math.sin(a) * (r - 28));
        ctx.stroke();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Generate outer skin procedural canvas texture for watermelon
function createWatermelonSkinTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Base green
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(0, 0, 1024, 512);

    // Darker wavy vertical tiger stripes
    ctx.fillStyle = '#0f3d1c';
    for (let x = 0; x < 1024; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      for (let y = 0; y < 512; y += 24) {
        const wave = Math.sin(y * 0.05 + x * 0.02) * 16 + Math.cos(y * 0.12) * 8;
        ctx.lineTo(x + wave + 16, y);
      }
      ctx.lineTo(x + 28, 512);
      ctx.lineTo(x + 6, 512);
      ctx.closePath();
      ctx.fill();
    }

    // Secondary subtle light green bands
    ctx.fillStyle = 'rgba(74, 222, 128, 0.2)';
    for (let x = 24; x < 1024; x += 48) {
      ctx.fillRect(x, 0, 10, 512);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

const textureCache: Partial<Record<FruitKind, THREE.CanvasTexture>> = {};
let cachedWatermelonSkin: THREE.CanvasTexture | null = null;

export function getFruitTexture(kind: FruitKind): THREE.CanvasTexture {
  if (!textureCache[kind]) {
    textureCache[kind] = createCrossSectionTexture(kind);
  }
  return textureCache[kind]!;
}

export function getWatermelonSkin(): THREE.CanvasTexture {
  if (!cachedWatermelonSkin) {
    cachedWatermelonSkin = createWatermelonSkinTexture();
  }
  return cachedWatermelonSkin;
}

// Build Whole Fruit Mesh with Rich 3D Features
export function createWholeFruitMesh(kind: FruitKind): THREE.Group {
  const group = new THREE.Group();

  if (kind === 'watermelon') {
    // Scaled sphere with watermelon skin
    const skinTex = getWatermelonSkin();
    const geom = new THREE.SphereGeometry(1.08, 36, 28);
    geom.scale(1.0, 0.90, 1.0);
    const mat = new THREE.MeshStandardMaterial({
      map: skinTex,
      roughness: 0.28,
      metalness: 0.08,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    group.add(mesh);

    // 3D Curved Stem
    const stemGroup = new THREE.Group();
    const stemGeom = new THREE.CylinderGeometry(0.06, 0.08, 0.35, 8);
    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.7,
    });
    const stem = new THREE.Mesh(stemGeom, stemMat);
    stem.position.y = 0.98;
    stem.rotation.z = 0.35;
    stemGroup.add(stem);

    // Curled tendril ring
    const tendrilGeom = new THREE.TorusGeometry(0.09, 0.022, 8, 16);
    const tendrilMat = new THREE.MeshStandardMaterial({ color: 0x16a34a });
    const tendril = new THREE.Mesh(tendrilGeom, tendrilMat);
    tendril.position.set(0.12, 1.05, 0);
    tendril.rotation.x = Math.PI / 3;
    stemGroup.add(tendril);

    group.add(stemGroup);
  } else if (kind === 'orange') {
    // Textured orange body
    const geom = new THREE.SphereGeometry(0.80, 28, 24);
    geom.scale(1.0, 0.94, 1.0);
    sculptFruitSurface(geom, 'orange');
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff820e,
      roughness: 0.55,
      metalness: 0.0,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    group.add(mesh);

    // Woody stem
    const stemGeom = new THREE.CylinderGeometry(0.045, 0.055, 0.22, 8);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x3d2008 });
    const stem = new THREE.Mesh(stemGeom, stemMat);
    stem.position.y = 0.80;
    group.add(stem);

    // Green Calyx Base
    const calyxGeom = new THREE.CylinderGeometry(0.14, 0.04, 0.04, 6);
    const calyxMat = new THREE.MeshStandardMaterial({ color: 0x166534 });
    const calyx = new THREE.Mesh(calyxGeom, calyxMat);
    calyx.position.y = 0.75;
    group.add(calyx);

    // 3D Organic Leaf
    const leaf = createLeafMesh(0.48, 0.22, 0x15803d);
    leaf.position.set(0.05, 0.82, 0);
    leaf.rotation.set(0.4, 0.2, -0.6);
    group.add(leaf);
  } else if (kind === 'apple') {
    // Apple geometry with top and bottom indentations
    const geom = new THREE.SphereGeometry(0.78, 28, 24);
    geom.scale(1.0, 0.92, 1.0);
    sculptFruitSurface(geom, 'apple');
    const mat = new THREE.MeshStandardMaterial({
      color: 0xd91f38,
      roughness: 0.28,
      metalness: 0.0,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    group.add(mesh);

    // Slender brown curved stem
    const stemGeom = new THREE.CylinderGeometry(0.032, 0.042, 0.38, 8);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x3f1d0b, roughness: 0.8 });
    const stem = new THREE.Mesh(stemGeom, stemMat);
    stem.position.set(0.04, 0.76, 0);
    stem.rotation.z = 0.3;
    group.add(stem);

    // 3D Apple Leaf with fresh green tone
    const leaf = createLeafMesh(0.42, 0.20, 0x22c55e);
    leaf.position.set(0.08, 0.82, 0);
    leaf.rotation.set(-0.3, 0.5, 0.7);
    group.add(leaf);
  } else if (kind === 'lemon') {
    // Tapered lemon body with pointed tips on both poles
    const groupLemon = new THREE.Group();
    const geom = new THREE.SphereGeometry(0.72, 28, 24);
    geom.scale(1.22, 0.74, 0.74);
    sculptFruitSurface(geom, 'lemon');
    const mat = new THREE.MeshStandardMaterial({
      color: 0xf8d326,
      roughness: 0.48,
      metalness: 0.0,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    groupLemon.add(mesh);

    // Conical Lemon Tips at poles
    const tipGeom = new THREE.ConeGeometry(0.24, 0.22, 16);
    const tipMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.32 });

    const tipLeft = new THREE.Mesh(tipGeom, tipMat);
    tipLeft.position.x = -0.92;
    tipLeft.rotation.z = Math.PI / 2;
    groupLemon.add(tipLeft);

    const tipRight = new THREE.Mesh(tipGeom, tipMat);
    tipRight.position.x = 0.92;
    tipRight.rotation.z = -Math.PI / 2;
    groupLemon.add(tipRight);

    // Tiny stem nub and leaf on one tip
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.04, 0.15, 6),
      new THREE.MeshStandardMaterial({ color: 0x65a30d })
    );
    stem.position.set(-1.05, 0, 0);
    stem.rotation.z = Math.PI / 2;
    groupLemon.add(stem);

    const leaf = createLeafMesh(0.32, 0.15, 0x4ade80);
    leaf.position.set(-1.0, 0.05, 0);
    leaf.rotation.set(0.4, 0, 1.2);
    groupLemon.add(leaf);

    group.add(groupLemon);
  } else if (kind === 'kiwi') {
    // Ellipsoid kiwi body with earthy fuzzy brown skin
    const geom = new THREE.SphereGeometry(0.60, 24, 20);
    geom.scale(0.88, 1.08, 0.88);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.94,
      metalness: 0.0,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    group.add(mesh);

    // Small stem scar
    const scar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.04, 8),
      new THREE.MeshStandardMaterial({ color: 0x451a03 })
    );
    scar.position.y = 0.65;
    group.add(scar);
  } else if (kind === 'dragonfruit') {
    // Hot magenta dragonfruit body
    const geom = new THREE.SphereGeometry(0.82, 28, 24);
    geom.scale(1.0, 1.26, 0.92);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff007f,
      roughness: 0.22,
      metalness: 0.15,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    group.add(mesh);

    // Spiral rows of 3D sculpted dragonfruit bract scales
    const scaleBaseMat = new THREE.MeshStandardMaterial({ color: 0xff007f });
    const scaleTipMat = new THREE.MeshStandardMaterial({ color: 0x39ff14 });

    const rows = [
      { y: -0.4, count: 5, radius: 0.78, scaleH: 0.35 },
      { y: 0.0, count: 6, radius: 0.84, scaleH: 0.42 },
      { y: 0.45, count: 5, radius: 0.74, scaleH: 0.45 },
    ];

    rows.forEach((row, rIdx) => {
      for (let i = 0; i < row.count; i++) {
        const angle = (i / row.count) * Math.PI * 2 + rIdx * 0.5;
        const scaleGroup = new THREE.Group();

        // Dual-colored scale (magenta base + neon green tip)
        const baseCone = new THREE.Mesh(
          new THREE.ConeGeometry(0.14, row.scaleH * 0.6, 5),
          scaleBaseMat
        );
        const tipCone = new THREE.Mesh(
          new THREE.ConeGeometry(0.09, row.scaleH * 0.4, 5),
          scaleTipMat
        );
        tipCone.position.y = row.scaleH * 0.45;

        scaleGroup.add(baseCone);
        scaleGroup.add(tipCone);

        const px = Math.cos(angle) * row.radius;
        const pz = Math.sin(angle) * row.radius;
        scaleGroup.position.set(px, row.y, pz);

        // Point outward and curve slightly upward
        scaleGroup.rotation.y = -angle - Math.PI / 2;
        scaleGroup.rotation.z = -0.55;

        group.add(scaleGroup);
      }
    });

    // Top crown of flared leafy scales
    for (let c = 0; c < 4; c++) {
      const cAngle = (c / 4) * Math.PI * 2;
      const crownLeaf = createLeafMesh(0.42, 0.16, 0x39ff14);
      crownLeaf.position.set(Math.cos(cAngle) * 0.15, 0.98, Math.sin(cAngle) * 0.15);
      crownLeaf.rotation.set(Math.sin(cAngle) * 0.6, 0, Math.cos(cAngle) * 0.6);
      group.add(crownLeaf);
    }
  } else if (kind === 'strawberry') {
    // 3D Strawberry: Conical heart shape with crown of sepals
    const geom = new THREE.SphereGeometry(0.72, 28, 24);
    geom.scale(0.88, 1.15, 0.88);
    sculptFruitSurface(geom, 'strawberry');
    const mat = new THREE.MeshStandardMaterial({
      color: 0xe31d41,
      roughness: 0.38,
      metalness: 0.0,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    group.add(mesh);

    // Green calyx crown (5 pointy leaves)
    const calyxGroup = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const leaf = createLeafMesh(0.36, 0.14, 0x16a34a);
      leaf.position.set(Math.cos(angle) * 0.15, 0.82, Math.sin(angle) * 0.15);
      leaf.rotation.set(Math.sin(angle) * 0.9, 0, Math.cos(angle) * 0.9);
      calyxGroup.add(leaf);
    }

    // Stem
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.045, 0.25, 6),
      new THREE.MeshStandardMaterial({ color: 0x15803d })
    );
    stem.position.y = 0.92;
    calyxGroup.add(stem);
    group.add(calyxGroup);

    // Tiny golden seed bumps
    const seedGeom = new THREE.SphereGeometry(0.024, 6, 6);
    const seedMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });
    for (let s = 0; s < 36; s++) {
      const phi = (s / 36) * Math.PI;
      const theta = s * 2.39996; // Golden angle
      const r = 0.68;
      const sx = Math.sin(phi) * Math.cos(theta) * (r * 0.88);
      const sy = Math.cos(phi) * (r * 1.12);
      const sz = Math.sin(phi) * Math.sin(theta) * (r * 0.88);

      const seedMesh = new THREE.Mesh(seedGeom, seedMat);
      seedMesh.position.set(sx, sy, sz);
      group.add(seedMesh);
    }
  } else if (kind === 'bomb') {
    // Metallic gunmetal sphere with hazard stripes & active fuse
    const geom = new THREE.SphereGeometry(0.82, 28, 24);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      metalness: 0.94,
      roughness: 0.18,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    group.add(mesh);

    // Raised hazard rings
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.8,
      roughness: 0.25,
    });
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(0.83, 0.035, 12, 32), ringMat);
    ringA.rotation.x = Math.PI / 2;
    group.add(ringA);

    const ringB = new THREE.Mesh(new THREE.TorusGeometry(0.83, 0.035, 12, 32), ringMat);
    ringB.rotation.y = Math.PI / 2;
    group.add(ringB);

    // Metallic fuse collar
    const neckGeom = new THREE.CylinderGeometry(0.20, 0.22, 0.18, 16);
    const neckMat = new THREE.MeshStandardMaterial({ color: 0x71717a, metalness: 0.95 });
    const neck = new THREE.Mesh(neckGeom, neckMat);
    neck.position.y = 0.85;
    group.add(neck);

    // Curved 3D fuse rope
    const fuseCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 0.94, 0),
      new THREE.Vector3(0.08, 1.15, 0),
      new THREE.Vector3(-0.06, 1.25, 0.05),
      new THREE.Vector3(0.05, 1.38, 0)
    );
    const fuseGeom = new THREE.TubeGeometry(fuseCurve, 16, 0.035, 8, false);
    const fuseMat = new THREE.MeshStandardMaterial({ color: 0xa8a29e, roughness: 0.9 });
    const fuseMesh = new THREE.Mesh(fuseGeom, fuseMat);
    group.add(fuseMesh);

    // Animated 3D Flame Spark Core at the fuse tip
    const sparkCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xfff000 })
    );
    sparkCore.position.set(0.05, 1.38, 0);
    sparkCore.name = 'bomb_spark_core';
    group.add(sparkCore);

    // Outer flame halo
    const sparkHalo = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 10, 10),
      new THREE.MeshBasicMaterial({
        color: 0xff3b00,
        transparent: true,
        opacity: 0.65,
      })
    );
    sparkHalo.position.set(0.05, 1.38, 0);
    sparkHalo.name = 'bomb_spark_halo';
    group.add(sparkHalo);

    // Dynamic point light that illuminates nearby fruits in 3D
    const sparkLight = new THREE.PointLight(0xff5500, 2.5, 4.5);
    sparkLight.position.set(0.05, 1.38, 0);
    sparkLight.name = 'bomb_point_light';
    group.add(sparkLight);
  }

  return group;
}

// Build Sliced Halves (Two separate meshes: Top half & Bottom half with cross-section cap disc)
export function createSlicedHalves(
  kind: FruitKind
): [THREE.Group, THREE.Group] {
  const capTex = getFruitTexture(kind);

  let radius = 0.80;
  let outerColor = 0xff6600;

  if (kind === 'watermelon') {
    radius = 1.08;
    outerColor = 0x15803d;
  } else if (kind === 'orange') {
    radius = 0.80;
    outerColor = 0xff6600;
  } else if (kind === 'apple') {
    radius = 0.78;
    outerColor = 0xef4444;
  } else if (kind === 'lemon') {
    radius = 0.74;
    outerColor = 0xfacc15;
  } else if (kind === 'kiwi') {
    radius = 0.60;
    outerColor = 0x78350f;
  } else if (kind === 'dragonfruit') {
    radius = 0.82;
    outerColor = 0xff007f;
  } else if (kind === 'strawberry') {
    radius = 0.74;
    outerColor = 0xff1744;
  }

  const outerMat = new THREE.MeshStandardMaterial({
    color: outerColor,
    roughness: 0.28,
    metalness: 0.12,
  });

  const capMat = new THREE.MeshStandardMaterial({
    map: capTex,
    side: THREE.DoubleSide,
    roughness: 0.35,
    metalness: 0.05,
  });

  // Half A (Hemisphere + Cap disc)
  const groupA = new THREE.Group();
  const hemiGeomA = new THREE.SphereGeometry(
    radius,
    26,
    18,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2
  );
  const hemiMeshA = new THREE.Mesh(hemiGeomA, outerMat);
  hemiMeshA.castShadow = true;
  groupA.add(hemiMeshA);

  const capGeomA = new THREE.CircleGeometry(radius, 28);
  capGeomA.rotateX(Math.PI / 2);
  const capMeshA = new THREE.Mesh(capGeomA, capMat);
  groupA.add(capMeshA);

  // Half B (Other Hemisphere + Cap disc)
  const groupB = new THREE.Group();
  const hemiGeomB = new THREE.SphereGeometry(
    radius,
    26,
    18,
    0,
    Math.PI * 2,
    Math.PI / 2,
    Math.PI / 2
  );
  const hemiMeshB = new THREE.Mesh(hemiGeomB, outerMat);
  hemiMeshB.castShadow = true;
  groupB.add(hemiMeshB);

  const capGeomB = new THREE.CircleGeometry(radius, 28);
  capGeomB.rotateX(-Math.PI / 2);
  const capMeshB = new THREE.Mesh(capGeomB, capMat);
  groupB.add(capMeshB);

  return [groupA, groupB];
}

// Particle color for juice splashes & droplets
export function getFruitJuiceColor(kind: FruitKind): number {
  switch (kind) {
    case 'watermelon':
      return 0xff0055; // Neon scarlet
    case 'orange':
      return 0xff6600; // Electric orange
    case 'apple':
      return 0xfef08a; // Pale crisp cream
    case 'lemon':
      return 0xfacc15; // Electric volt yellow
    case 'kiwi':
      return 0x39ff14; // Radiant toxic lime
    case 'dragonfruit':
      return 0xff00aa; // Intense neon fuchsia
    case 'strawberry':
      return 0xff2a6d; // Ruby pink
    case 'bomb':
      return 0xff2200; // Fiery explosive amber
  }
}

// Helper to create expanding 3D shockwave rings
export function createShockwaveRing(colorHex: number): THREE.Mesh {
  const geom = new THREE.RingGeometry(0.2, 0.45, 32);
  const mat = new THREE.MeshBasicMaterial({
    color: colorHex,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Mesh(geom, mat);
}
