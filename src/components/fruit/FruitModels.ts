import * as THREE from 'three';
import { FruitKind } from '@/types';

// Helper to generate procedural cross-section textures
function createCrossSectionTexture(kind: FruitKind): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const cx = 128;
    const cy = 128;
    const r = 120;

    if (kind === 'watermelon') {
      // Dark green rind rim
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Pale green inner rind
      ctx.fillStyle = '#bbf7d0';
      ctx.beginPath();
      ctx.arc(cx, cy, r - 6, 0, Math.PI * 2);
      ctx.fill();

      // Vivid crimson red pulp
      const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, r - 16);
      grad.addColorStop(0, '#ff1744');
      grad.addColorStop(1, '#e11d48');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r - 16, 0, Math.PI * 2);
      ctx.fill();

      // Black seeds
      ctx.fillStyle = '#09090b';
      for (let i = 0; i < 18; i++) {
        const angle = (i / 18) * Math.PI * 2 + (i % 2) * 0.2;
        const dist = 38 + (i % 3) * 24;
        const sx = cx + Math.cos(angle) * dist;
        const sy = cy + Math.sin(angle) * dist;

        ctx.beginPath();
        ctx.ellipse(sx, sy, 4.5, 7.5, angle, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (kind === 'orange') {
      // Bright orange peel
      ctx.fillStyle = '#ff6b00';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Pale pith ring
      ctx.fillStyle = '#ffedd5';
      ctx.beginPath();
      ctx.arc(cx, cy, r - 8, 0, Math.PI * 2);
      ctx.fill();

      // Juicy orange segments
      ctx.fillStyle = '#ea580c';
      for (let i = 0; i < 8; i++) {
        const startAngle = (i / 8) * Math.PI * 2 + 0.05;
        const endAngle = ((i + 1) / 8) * Math.PI * 2 - 0.05;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r - 14, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();
      }

      // Citrus membrane center
      ctx.fillStyle = '#fff7ed';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 'apple') {
      // Scarlet red peel rim
      ctx.fillStyle = '#ff1744';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Crisp creamy ivory flesh
      ctx.fillStyle = '#fef9c3';
      ctx.beginPath();
      ctx.arc(cx, cy, r - 6, 0, Math.PI * 2);
      ctx.fill();

      // Core star outline
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.fill();

      // Apple seeds
      ctx.fillStyle = '#3f1d0b';
      ctx.beginPath();
      ctx.ellipse(cx - 8, cy, 4, 8, 0.4, 0, Math.PI * 2);
      ctx.ellipse(cx + 8, cy, 4, 8, -0.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 'lemon') {
      // Neon yellow peel rim
      ctx.fillStyle = '#ffee00';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Pale inner pith
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(cx, cy, r - 7, 0, Math.PI * 2);
      ctx.fill();

      // Tart lemon segments
      ctx.fillStyle = '#facc15';
      for (let i = 0; i < 8; i++) {
        const startAngle = (i / 8) * Math.PI * 2 + 0.05;
        const endAngle = ((i + 1) / 8) * Math.PI * 2 - 0.05;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r - 12, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();
      }
    } else if (kind === 'kiwi') {
      // Fuzzy brown skin
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Emerald green pulp
      ctx.fillStyle = '#65a30d';
      ctx.beginPath();
      ctx.arc(cx, cy, r - 6, 0, Math.PI * 2);
      ctx.fill();

      // Pale creamy center core
      ctx.fillStyle = '#ecfccb';
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.fill();

      // Radiating black kiwi seeds
      ctx.fillStyle = '#1c1917';
      for (let i = 0; i < 28; i++) {
        const angle = (i / 28) * Math.PI * 2;
        const dist = 42 + (i % 2) * 8;
        const sx = cx + Math.cos(angle) * dist;
        const sy = cy + Math.sin(angle) * dist;

        ctx.beginPath();
        ctx.ellipse(sx, sy, 2.8, 5.0, angle, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (kind === 'dragonfruit') {
      // Vivid magenta dragonfruit peel rim
      ctx.fillStyle = '#ff007f';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Lime scale tip accents
      ctx.fillStyle = '#39ff14';
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const sx = cx + Math.cos(angle) * (r - 2);
        const sy = cy + Math.sin(angle) * (r - 2);
        ctx.beginPath();
        ctx.arc(sx, sy, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Crisp white pulp with tiny black seeds
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(cx, cy, r - 10, 0, Math.PI * 2);
      ctx.fill();

      // Abundant black speckles
      ctx.fillStyle = '#0f172a';
      for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * (r - 20);
        const sx = cx + Math.cos(angle) * dist;
        const sy = cy + Math.sin(angle) * dist;
        ctx.beginPath();
        ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
        ctx.fill();
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
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(0, 0, 512, 256);

    ctx.fillStyle = '#14532d';
    for (let x = 0; x < 512; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      for (let y = 0; y < 256; y += 18) {
        const wave = Math.sin(y * 0.06) * 10;
        ctx.lineTo(x + wave + 12, y);
      }
      ctx.lineTo(x + 20, 256);
      ctx.lineTo(x + 4, 256);
      ctx.closePath();
      ctx.fill();
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

// Build Whole Fruit Mesh
export function createWholeFruitMesh(kind: FruitKind): THREE.Group {
  const group = new THREE.Group();

  if (kind === 'watermelon') {
    const skinTex = getWatermelonSkin();
    const geom = new THREE.SphereGeometry(1.05, 32, 24);
    geom.scale(1.0, 0.88, 1.0);
    const mat = new THREE.MeshStandardMaterial({
      map: skinTex,
      roughness: 0.3,
      metalness: 0.1,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    group.add(mesh);
  } else if (kind === 'orange') {
    const geom = new THREE.SphereGeometry(0.78, 24, 20);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff6b00,
      roughness: 0.35,
      metalness: 0.1,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    group.add(mesh);

    // Stem
    const stemGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.12, 8);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x166534 });
    const stem = new THREE.Mesh(stemGeom, stemMat);
    stem.position.y = 0.77;
    group.add(stem);
  } else if (kind === 'apple') {
    const geom = new THREE.SphereGeometry(0.75, 24, 20);
    geom.scale(1.0, 0.95, 1.0);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff1744,
      roughness: 0.18,
      metalness: 0.2,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    group.add(mesh);

    // Brown stem
    const stemGeom = new THREE.CylinderGeometry(0.03, 0.04, 0.35, 8);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x451a03 });
    const stem = new THREE.Mesh(stemGeom, stemMat);
    stem.position.set(0.04, 0.78, 0);
    stem.rotation.z = 0.25;
    group.add(stem);
  } else if (kind === 'lemon') {
    const geom = new THREE.SphereGeometry(0.7, 24, 20);
    geom.scale(1.0, 0.68, 0.68);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffee00,
      roughness: 0.3,
      metalness: 0.15,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    group.add(mesh);
  } else if (kind === 'kiwi') {
    const geom = new THREE.SphereGeometry(0.58, 20, 16);
    geom.scale(1.0, 0.8, 0.8);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.85,
      metalness: 0.0,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    group.add(mesh);
  } else if (kind === 'dragonfruit') {
    // Vibrant Hot Magenta Ellipsoid with scale flares
    const geom = new THREE.SphereGeometry(0.8, 24, 20);
    geom.scale(1.0, 1.2, 0.9);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff007f,
      roughness: 0.25,
      metalness: 0.2,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    group.add(mesh);

    // Scale tips
    const scaleMat = new THREE.MeshStandardMaterial({ color: 0x39ff14 });
    for (let i = 0; i < 6; i++) {
      const scaleGeom = new THREE.ConeGeometry(0.12, 0.35, 6);
      const scaleMesh = new THREE.Mesh(scaleGeom, scaleMat);
      const angle = (i / 6) * Math.PI * 2;
      scaleMesh.position.set(Math.cos(angle) * 0.75, 0.2 + (i % 2) * 0.3, Math.sin(angle) * 0.75);
      scaleMesh.rotation.z = Math.cos(angle) * 0.6;
      scaleMesh.rotation.x = Math.sin(angle) * 0.6;
      group.add(scaleMesh);
    }
  } else if (kind === 'bomb') {
    // Metallic gunmetal sphere with fuse spark
    const geom = new THREE.SphereGeometry(0.78, 24, 20);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.95,
      roughness: 0.15,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    group.add(mesh);

    const neckGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.15, 16);
    const neckMat = new THREE.MeshStandardMaterial({ color: 0x71717a, metalness: 0.9 });
    const neck = new THREE.Mesh(neckGeom, neckMat);
    neck.position.y = 0.8;
    group.add(neck);

    // Glowing fuse spark
    const sparkGeom = new THREE.SphereGeometry(0.1, 8, 8);
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
    const spark = new THREE.Mesh(sparkGeom, sparkMat);
    spark.position.set(0, 0.98, 0);
    group.add(spark);
  }

  return group;
}

// Build Sliced Halves (Two separate meshes: Top half & Bottom half with cross-section cap)
export function createSlicedHalves(
  kind: FruitKind
): [THREE.Group, THREE.Group] {
  const capTex = getFruitTexture(kind);

  let radius = 0.78;
  let outerColor = 0xff6b00;

  if (kind === 'watermelon') {
    radius = 1.05;
    outerColor = 0x15803d;
  } else if (kind === 'orange') {
    radius = 0.78;
    outerColor = 0xff6b00;
  } else if (kind === 'apple') {
    radius = 0.75;
    outerColor = 0xff1744;
  } else if (kind === 'lemon') {
    radius = 0.7;
    outerColor = 0xffee00;
  } else if (kind === 'kiwi') {
    radius = 0.58;
    outerColor = 0x78350f;
  } else if (kind === 'dragonfruit') {
    radius = 0.8;
    outerColor = 0xff007f;
  }

  const outerMat = new THREE.MeshStandardMaterial({
    color: outerColor,
    roughness: 0.28,
    metalness: 0.15,
  });

  const capMat = new THREE.MeshStandardMaterial({
    map: capTex,
    roughness: 0.25,
  });

  // Half A (Hemisphere + Cap disc)
  const groupA = new THREE.Group();
  const hemiGeomA = new THREE.SphereGeometry(
    radius,
    24,
    16,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2
  );
  const hemiMeshA = new THREE.Mesh(hemiGeomA, outerMat);
  hemiMeshA.castShadow = true;
  groupA.add(hemiMeshA);

  const capGeomA = new THREE.CircleGeometry(radius, 24);
  capGeomA.rotateX(Math.PI / 2);
  const capMeshA = new THREE.Mesh(capGeomA, capMat);
  groupA.add(capMeshA);

  // Half B (Other Hemisphere + Cap disc)
  const groupB = new THREE.Group();
  const hemiGeomB = new THREE.SphereGeometry(
    radius,
    24,
    16,
    0,
    Math.PI * 2,
    Math.PI / 2,
    Math.PI / 2
  );
  const hemiMeshB = new THREE.Mesh(hemiGeomB, outerMat);
  hemiMeshB.castShadow = true;
  groupB.add(hemiMeshB);

  const capGeomB = new THREE.CircleGeometry(radius, 24);
  capGeomB.rotateX(-Math.PI / 2);
  const capMeshB = new THREE.Mesh(capGeomB, capMat);
  groupB.add(capMeshB);

  return [groupA, groupB];
}

// Particle color for juice splashes
export function getFruitJuiceColor(kind: FruitKind): number {
  switch (kind) {
    case 'watermelon':
      return 0xff0055; // Neon scarlet
    case 'orange':
      return 0xff6b00; // Electric orange
    case 'apple':
      return 0xfef08a; // Pale crisp cream
    case 'lemon':
      return 0xffee00; // Electric volt yellow
    case 'kiwi':
      return 0x39ff14; // Radiant toxic lime
    case 'dragonfruit':
      return 0xff00aa; // Intense neon fuchsia
    case 'bomb':
      return 0xff2200;
  }
}
