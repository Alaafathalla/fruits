'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { FruitKind, BladeStyle, ColorTheme } from '@/types';
import {
  createWholeFruitMesh,
  createSlicedHalves,
  getFruitJuiceColor,
} from './FruitModels';
import { sound } from '@/utils/audio';

interface ActiveFruit {
  id: string;
  kind: FruitKind;
  mesh: THREE.Group;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rotSpeed: THREE.Vector3;
  radius: number;
  sliced: boolean;
}

interface SlicedHalf {
  mesh: THREE.Group;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rotSpeed: THREE.Vector3;
}

interface JuiceParticle {
  mesh: THREE.Mesh;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
}

interface TrailPoint {
  x: number;
  y: number;
  time: number;
}

interface FruitCuttingCanvasProps {
  bladeStyle: BladeStyle;
  colorTheme: ColorTheme;
  isPaused?: boolean;
  onSliceFruit: (kind: FruitKind, combo: number) => void;
  onBombHit: () => void;
  onMissFruit?: () => void;
  onFrenzyChange?: (frenzyLevel: number, label: string) => void;
  className?: string;
  gameResetKey?: number;
}

export default function FruitCuttingCanvas({
  bladeStyle,
  colorTheme,
  isPaused = false,
  onSliceFruit,
  onBombHit,
  onFrenzyChange,
  className,
  gameResetKey = 0,
}: FruitCuttingCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Entities
  const activeFruitsRef = useRef<ActiveFruit[]>([]);
  const activeHalvesRef = useRef<SlicedHalf[]>([]);
  const particlesRef = useRef<JuiceParticle[]>([]);

  // Drag / Slice State
  const isDraggingRef = useRef<boolean>(false);
  const trailPointsRef = useRef<TrailPoint[]>([]);
  const lastSliceTimeRef = useRef<number>(0);
  const currentComboRef = useRef<number>(0);
  const lastWhooshTimeRef = useRef<number>(0);

  // Spawning & Progression Timer
  const lastSpawnTimeRef = useRef<number>(0);
  const gameStartTimeRef = useRef<number>(performance.now());
  const currentFrenzyLevelRef = useRef<number>(1);

  // Reset timers on game reset key change
  useEffect(() => {
    gameStartTimeRef.current = performance.now();
    currentFrenzyLevelRef.current = 1;
    onFrenzyChange?.(1, 'Warmup (1x)');
  }, [gameResetKey, onFrenzyChange]);

  // Update dynamic lights when color theme changes
  useEffect(() => {
    if (ambientLightRef.current && dirLightRef.current) {
      ambientLightRef.current.color.setHex(colorTheme.ambientLightHex);
      dirLightRef.current.color.setHex(colorTheme.dirLightHex);
    }
  }, [colorTheme]);

  // Spawn fruit with offset for multi-fruit frenzy waves
  const spawnFruitWithOffset = useCallback((scene: THREE.Scene, slotX: number) => {
    const fruitTypes: FruitKind[] = ['watermelon', 'orange', 'apple', 'lemon', 'kiwi', 'dragonfruit'];
    const isBomb = Math.random() < 0.12;
    const kind: FruitKind = isBomb
      ? 'bomb'
      : fruitTypes[Math.floor(Math.random() * fruitTypes.length)];

    const mesh = createWholeFruitMesh(kind);

    const startX = Math.max(-5.5, Math.min(5.5, slotX + (Math.random() - 0.5) * 1.4));
    const startY = -6.8;
    const startZ = (Math.random() - 0.5) * 1.6;

    mesh.position.set(startX, startY, startZ);
    scene.add(mesh);

    const targetVx = (Math.random() - 0.5) * 3.4 - startX * 0.26;
    const targetVy = 13.5 + Math.random() * 4.0;
    const targetVz = (Math.random() - 0.5) * 1.5;

    const fruitObj: ActiveFruit = {
      id: Math.random().toString(36).substring(2, 9),
      kind,
      mesh,
      pos: new THREE.Vector3(startX, startY, startZ),
      vel: new THREE.Vector3(targetVx, targetVy, targetVz),
      rotSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 4.5,
        (Math.random() - 0.5) * 4.5,
        (Math.random() - 0.5) * 4.5
      ),
      radius: kind === 'watermelon' ? 1.35 : kind === 'dragonfruit' ? 1.25 : 1.1,
      sliced: false,
    };

    activeFruitsRef.current.push(fruitObj);
  }, []);

  // Spawn Explosive 3D Juice Splash Particles
  const createJuiceSplash = (scene: THREE.Scene, pos: THREE.Vector3, kind: FruitKind) => {
    const color = getFruitJuiceColor(kind);
    const particleCount = kind === 'bomb' ? 50 : 38;

    for (let i = 0; i < particleCount; i++) {
      const radius = 0.07 + Math.random() * 0.07;
      const geom = new THREE.SphereGeometry(radius, 10, 10);
      const mat = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(pos);
      scene.add(mesh);

      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 6.5;

      particlesRef.current.push({
        mesh,
        pos: pos.clone(),
        vel: new THREE.Vector3(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed + (Math.random() - 0.3) * 2,
          (Math.random() - 0.5) * 4
        ),
        life: 0,
        maxLife: 0.65 + Math.random() * 0.45,
      });
    }
  };

  // Slice Fruit Handler
  const sliceFruit = useCallback((fruit: ActiveFruit, cutAngle: number = 0) => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const container = containerRef.current;
    if (!scene || fruit.sliced) return;

    fruit.sliced = true;
    scene.remove(fruit.mesh);

    const now = performance.now();
    if (now - lastSliceTimeRef.current < 450) {
      currentComboRef.current += 1;
    } else {
      currentComboRef.current = 1;
    }
    lastSliceTimeRef.current = now;

    // 1. HAZARD BOMB SLICED
    if (fruit.kind === 'bomb') {
      sound.playBomb();
      createJuiceSplash(scene, fruit.pos, 'bomb');
      currentComboRef.current = 0;
      onBombHit();
      return;
    }

    // 2. FRUIT SLICED
    sound.playSlice(fruit.kind);
    if (currentComboRef.current >= 2) {
      sound.playCombo(currentComboRef.current);
    }
    onSliceFruit(fruit.kind, currentComboRef.current);

    // Spawn 3D Particles
    createJuiceSplash(scene, fruit.pos, fruit.kind);

    // Create 3D Sliced Halves with Outward Kick
    const [halfA, halfB] = createSlicedHalves(fruit.kind);
    halfA.position.copy(fruit.pos);
    halfB.position.copy(fruit.pos);
    scene.add(halfA, halfB);

    const normX = Math.cos(cutAngle + Math.PI / 2);
    const normY = Math.sin(cutAngle + Math.PI / 2);

    const halfVelA = fruit.vel.clone().multiplyScalar(0.75).add(new THREE.Vector3(-normX * 3.2, -normY * 3.2, 1.2));
    const halfVelB = fruit.vel.clone().multiplyScalar(0.75).add(new THREE.Vector3(normX * 3.2, normY * 3.2, 1.2));

    activeHalvesRef.current.push({
      mesh: halfA,
      pos: fruit.pos.clone(),
      vel: halfVelA,
      rotSpeed: new THREE.Vector3(fruit.rotSpeed.x - 3.0, fruit.rotSpeed.y - 2.5, fruit.rotSpeed.z - 3.0),
    });

    activeHalvesRef.current.push({
      mesh: halfB,
      pos: fruit.pos.clone(),
      vel: halfVelB,
      rotSpeed: new THREE.Vector3(fruit.rotSpeed.x + 3.0, fruit.rotSpeed.y + 2.5, fruit.rotSpeed.z + 3.0),
    });
  }, [onBombHit, onSliceFruit]);

  // Main Three.js Scene Setup & Loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 50);
    camera.position.set(0, -6.8, 12.2);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.zIndex = '5';
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Dynamic Themed Lighting
    const ambientLight = new THREE.AmbientLight(colorTheme.ambientLightHex, 2.2);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const dirLight = new THREE.DirectionalLight(colorTheme.dirLightHex, 3.2);
    dirLight.position.set(5, 10, 8);
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.8);
    rimLight.position.set(-6, -4, 6);
    scene.add(rimLight);

    // Initial Warmup Wave
    spawnFruitWithOffset(scene, -2.5);
    spawnFruitWithOffset(scene, 2.5);

    // Main Animation Loop
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      animId = requestAnimationFrame(loop);
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      if (!isPaused) {
        // Dynamic Frenzy Waves Over Time
        const elapsedSec = (time - gameStartTimeRef.current) / 1000;
        let frenzyLevel = 1;
        let frenzyLabel = 'Warmup (1x)';
        let minInterval = 1150;
        let maxInterval = 1450;
        let baseCount = 1;

        if (elapsedSec >= 50) {
          frenzyLevel = 4;
          frenzyLabel = 'FRUIT STORM (4-6x)';
          minInterval = 550;
          maxInterval = 780;
          baseCount = 4;
        } else if (elapsedSec >= 30) {
          frenzyLevel = 3;
          frenzyLabel = 'Hyper Wave (3x)';
          minInterval = 750;
          maxInterval = 980;
          baseCount = 3;
        } else if (elapsedSec >= 15) {
          frenzyLevel = 2;
          frenzyLabel = 'Rising Frenzy (2x)';
          minInterval = 900;
          maxInterval = 1150;
          baseCount = 2;
        }

        if (frenzyLevel !== currentFrenzyLevelRef.current) {
          currentFrenzyLevelRef.current = frenzyLevel;
          onFrenzyChange?.(frenzyLevel, frenzyLabel);
          sound.playCombo(frenzyLevel + 1);
        }

        // Fruit Spawner
        const currentInterval = minInterval + Math.random() * (maxInterval - minInterval);
        if (time - lastSpawnTimeRef.current > currentInterval) {
          lastSpawnTimeRef.current = time;
          const fruitsToSpawn = baseCount + (Math.random() < 0.4 ? 1 : 0);
          for (let s = 0; s < fruitsToSpawn; s++) {
            const slotX = ((s + 0.5) / fruitsToSpawn - 0.5) * 8.5;
            setTimeout(() => {
              if (sceneRef.current) {
                spawnFruitWithOffset(sceneRef.current, slotX);
              }
            }, s * 160);
          }
        }
      }

      // Ballistic flight of fruits
      for (let i = activeFruitsRef.current.length - 1; i >= 0; i--) {
        const f = activeFruitsRef.current[i];
        f.vel.y -= 9.8 * dt;
        f.pos.addScaledVector(f.vel, dt);
        f.mesh.position.copy(f.pos);

        f.mesh.rotation.x += f.rotSpeed.x * dt;
        f.mesh.rotation.y += f.rotSpeed.y * dt;
        f.mesh.rotation.z += f.rotSpeed.z * dt;

        if (f.pos.y < -8.5 && f.vel.y < 0) {
          scene.remove(f.mesh);
          activeFruitsRef.current.splice(i, 1);
        }
      }

      // Halves physics
      for (let i = activeHalvesRef.current.length - 1; i >= 0; i--) {
        const h = activeHalvesRef.current[i];
        h.vel.y -= 9.8 * dt;
        h.pos.addScaledVector(h.vel, dt);
        h.mesh.position.copy(h.pos);

        h.mesh.rotation.x += h.rotSpeed.x * dt;
        h.mesh.rotation.y += h.rotSpeed.y * dt;
        h.mesh.rotation.z += h.rotSpeed.z * dt;

        if (h.pos.y < -8.5) {
          scene.remove(h.mesh);
          activeHalvesRef.current.splice(i, 1);
        }
      }

      // 3D Particles physics
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life += dt;
        p.vel.y -= 9.8 * dt;
        p.pos.addScaledVector(p.vel, dt);
        p.mesh.position.copy(p.pos);

        const scale = Math.max(0.01, 1 - p.life / p.maxLife);
        p.mesh.scale.set(scale, scale, scale);

        if (p.life >= p.maxLife || p.pos.y < -8.5) {
          scene.remove(p.mesh);
          particlesRef.current.splice(i, 1);
        }
      }

      // Render 2D Glowing Laser Blade Trail & Popups
      const trailCanvas = trailCanvasRef.current;
      if (trailCanvas) {
        const tCtx = trailCanvas.getContext('2d');
        if (tCtx) {
          tCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

          const now = performance.now();
          trailPointsRef.current = trailPointsRef.current.filter((p) => now - p.time < 180);
          const pts = trailPointsRef.current;
          if (pts.length > 2) {
            tCtx.lineCap = 'round';
            tCtx.lineJoin = 'round';

            // Outer Neon Glow Pass
            tCtx.save();
            tCtx.shadowColor = bladeStyle.color;
            tCtx.shadowBlur = 22;
            for (let i = 1; i < pts.length; i++) {
              const pA = pts[i - 1];
              const pB = pts[i];
              const progress = i / pts.length;
              tCtx.beginPath();
              tCtx.moveTo(pA.x, pA.y);
              tCtx.lineTo(pB.x, pB.y);
              tCtx.strokeStyle = bladeStyle.color;
              tCtx.lineWidth = Math.max(2, progress * 10);
              tCtx.stroke();
            }
            tCtx.restore();

            // Inner Hot Core Pass
            tCtx.save();
            for (let i = 1; i < pts.length; i++) {
              const pA = pts[i - 1];
              const pB = pts[i];
              const progress = i / pts.length;
              tCtx.beginPath();
              tCtx.moveTo(pA.x, pA.y);
              tCtx.lineTo(pB.x, pB.y);
              tCtx.strokeStyle = '#ffffff';
              tCtx.lineWidth = Math.max(1, progress * 4);
              tCtx.stroke();
            }
            tCtx.restore();
          }
        }
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(loop);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);

      if (trailCanvasRef.current) {
        trailCanvasRef.current.width = w;
        trailCanvasRef.current.height = h;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [bladeStyle, colorTheme, isPaused, spawnFruitWithOffset, onFrenzyChange, sliceFruit]);

  // Pointer Movement & Slicing Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    trailPointsRef.current = [{ x, y, time: performance.now() }];
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const container = containerRef.current;
    const camera = cameraRef.current;
    if (!container || !camera) return;

    const rect = container.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const now = performance.now();
    const pts = trailPointsRef.current;
    const lastPoint = pts[pts.length - 1];

    if (lastPoint) {
      const dist = Math.hypot(clientX - lastPoint.x, clientY - lastPoint.y);
      if (dist > 6) {
        if (now - lastWhooshTimeRef.current > 170 && dist > 30) {
          sound.playWhoosh(Math.min(2.0, dist / 35));
          lastWhooshTimeRef.current = now;
        }

        pts.push({ x: clientX, y: clientY, time: now });

        // Line-Segment Collision Check with flying fruits
        const halfW = rect.width / 2;
        const halfH = rect.height / 2;
        const vx = clientX - lastPoint.x;
        const vy = clientY - lastPoint.y;
        const l2 = vx * vx + vy * vy;

        for (const fruit of [...activeFruitsRef.current]) {
          if (fruit.sliced) continue;
          const sPos = fruit.pos.clone().project(camera);
          const fx = sPos.x * halfW + halfW;
          const fy = -(sPos.y * halfH) + halfH;

          let t = l2 === 0 ? 0 : ((fx - lastPoint.x) * vx + (fy - lastPoint.y) * vy) / l2;
          t = Math.max(0, Math.min(1, t));
          const projX = lastPoint.x + t * vx;
          const projY = lastPoint.y + t * vy;
          const d = Math.hypot(fx - projX, fy - projY);

          if (d < fruit.radius * 36) {
            const cutAngle = Math.atan2(vy, vx);
            sliceFruit(fruit, cutAngle);
          }
        }
      }
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{
        boxShadow: `0 0 40px ${bladeStyle.color}33, inset 0 0 30px ${bladeStyle.color}15`,
        borderColor: `${bladeStyle.color}55`,
      }}
      className={
        className ||
        "relative w-full h-[460px] sm:h-[520px] lg:h-[560px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#14062c]/80 via-[#0a021c]/95 to-black border select-none touch-none cursor-crosshair transition-all duration-300"
      }
    >
      {/* Cyber Corner Brackets */}
      <div
        style={{ borderColor: bladeStyle.color }}
        className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 pointer-events-none opacity-90 z-20 shadow-[0_0_8px_currentColor]"
      />
      <div
        style={{ borderColor: bladeStyle.color }}
        className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 pointer-events-none opacity-90 z-20 shadow-[0_0_8px_currentColor]"
      />
      <div
        style={{ borderColor: bladeStyle.color }}
        className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 pointer-events-none opacity-90 z-20 shadow-[0_0_8px_currentColor]"
      />
      <div
        style={{ borderColor: bladeStyle.color }}
        className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 pointer-events-none opacity-90 z-20 shadow-[0_0_8px_currentColor]"
      />

      {/* 2D Blade Glow Trail Overlay Canvas */}
      <canvas
        ref={trailCanvasRef}
        className="absolute inset-0 pointer-events-none z-10"
      />

      {/* Dynamic Background Aura Glow driven by active blade */}
      <div
        style={{
          background: `radial-gradient(circle at 50% 50%, ${bladeStyle.color}35 0%, transparent 70%)`,
        }}
        className="absolute inset-0 pointer-events-none transition-all duration-700 blur-2xl"
      />
    </div>
  );
}
