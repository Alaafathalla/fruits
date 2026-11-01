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

interface HitText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  time: number;
}

interface FrenzyBanner {
  text: string;
  time: number;
  color: string;
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
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Entities
  const activeFruitsRef = useRef<ActiveFruit[]>([]);
  const activeHalvesRef = useRef<SlicedHalf[]>([]);
  const particlesRef = useRef<JuiceParticle[]>([]);
  const hitTextsRef = useRef<HitText[]>([]);
  const frenzyBannerRef = useRef<FrenzyBanner | null>(null);

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
      frenzyBannerRef.current = null;
      onFrenzyChange?.(1, 'Warmup (1x)');
    }, [gameResetKey, onFrenzyChange]);

    // Spawn a fruit with specific horizontal slot offset for multi-fruit waves
    const spawnFruitWithOffset = useCallback((scene: THREE.Scene, slotX: number) => {
      const fruitTypes: FruitKind[] = ['watermelon', 'orange', 'apple', 'lemon', 'kiwi', 'dragonfruit'];
      const isBomb = Math.random() < 0.11;
      const kind: FruitKind = isBomb
        ? 'bomb'
        : fruitTypes[Math.floor(Math.random() * fruitTypes.length)];

      const mesh = createWholeFruitMesh(kind);

      const startX = Math.max(-5.5, Math.min(5.5, slotX + (Math.random() - 0.5) * 1.4));
      const startY = -6.8;
      const startZ = (Math.random() - 0.5) * 2;

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
        radius: kind === 'watermelon' ? 1.05 : kind === 'dragonfruit' ? 0.85 : 0.75,
        sliced: false,
      };

      activeFruitsRef.current.push(fruitObj);
    }, []);

    // Spawn Juice Splash
    const createJuiceSplash = (scene: THREE.Scene, pos: THREE.Vector3, kind: FruitKind) => {
      const color = getFruitJuiceColor(kind);
      const particleCount = kind === 'bomb' ? 55 : 46;

      for (let i = 0; i < particleCount; i++) {
        const radius = 0.08 + Math.random() * 0.06;
        const geom = new THREE.SphereGeometry(radius, 8, 8);
        const mat = new THREE.MeshBasicMaterial({ color });
        const pMesh = new THREE.Mesh(geom, mat);
        pMesh.position.copy(pos);
        scene.add(pMesh);

        const speed = 5.0 + Math.random() * 8.5;
        const angle = Math.random() * Math.PI * 2;
        const zAngle = (Math.random() - 0.5) * Math.PI;

        const vel = new THREE.Vector3(
          Math.cos(angle) * Math.cos(zAngle) * speed,
          Math.sin(angle) * Math.cos(zAngle) * speed + 3.5,
          Math.sin(zAngle) * speed
        );

        particlesRef.current.push({
          mesh: pMesh,
          pos: pos.clone(),
          vel,
          life: 0,
          maxLife: 0.7 + Math.random() * 0.45,
        });
      }
    };

    // Perform Slice on a fruit
    const sliceFruit = (fruit: ActiveFruit, cutAngle: number) => {
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

      if (fruit.kind === 'bomb') {
        sound.playBomb();
        createJuiceSplash(scene, fruit.pos, 'bomb');
        currentComboRef.current = 0;

        // Floating Penalty Text
        if (camera && container) {
          const rect = container.getBoundingClientRect();
          const halfW = rect.width / 2;
          const halfH = rect.height / 2;
          const screenPos = fruit.pos.clone().project(camera);
          const sx = screenPos.x * halfW + halfW;
          const sy = -(screenPos.y * halfH) + halfH;

          hitTextsRef.current.push({
            id: Math.random().toString(),
            text: '-25 BOMB PENALTY!',
            x: sx,
            y: sy,
            color: '#ff1744',
            time: now,
          });
        }

        onBombHit();
        return;
      }

      sound.playSlice(fruit.kind);
      if (currentComboRef.current >= 3) {
        sound.playCombo(currentComboRef.current);
      }
      onSliceFruit(fruit.kind, currentComboRef.current);

      // Floating 2D Hit Score Text
      if (camera && container) {
        const rect = container.getBoundingClientRect();
        const halfW = rect.width / 2;
        const halfH = rect.height / 2;
        const screenPos = fruit.pos.clone().project(camera);
        const sx = screenPos.x * halfW + halfW;
        const sy = -(screenPos.y * halfH) + halfH;

        const earned = (fruit.kind === 'dragonfruit' ? 25 : 15) * Math.max(1, currentComboRef.current);
        const hitLabel = currentComboRef.current > 1 ? `+${earned} x${currentComboRef.current}!` : `+${earned}`;

        hitTextsRef.current.push({
          id: Math.random().toString(),
          text: hitLabel,
          x: sx,
          y: sy,
          color: bladeStyle.color,
          time: now,
        });
      }

      // Create 3D sliced halves
      const [halfA, halfB] = createSlicedHalves(fruit.kind);
      halfA.position.copy(fruit.pos);
      halfB.position.copy(fruit.pos);

      halfA.rotation.z = cutAngle;
      halfB.rotation.z = cutAngle;

      scene.add(halfA, halfB);

      const perpAngle = cutAngle + Math.PI / 2;
      const impulse = 4.2;

      const velA = new THREE.Vector3(
        fruit.vel.x + Math.cos(perpAngle) * impulse,
        fruit.vel.y + Math.sin(perpAngle) * impulse + 1.2,
        fruit.vel.z + (Math.random() - 0.5) * 2.5
      );

      const velB = new THREE.Vector3(
        fruit.vel.x - Math.cos(perpAngle) * impulse,
        fruit.vel.y - Math.sin(perpAngle) * impulse + 1.2,
        fruit.vel.z + (Math.random() - 0.5) * 2.5
      );

      activeHalvesRef.current.push({
        mesh: halfA,
        pos: fruit.pos.clone(),
        vel: velA,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 7.5,
          (Math.random() - 0.5) * 7.5,
          (Math.random() - 0.5) * 7.5
        ),
      });

      activeHalvesRef.current.push({
        mesh: halfB,
        pos: fruit.pos.clone(),
        vel: velB,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 7.5,
          (Math.random() - 0.5) * 7.5,
          (Math.random() - 0.5) * 7.5
        ),
      });

      createJuiceSplash(scene, fruit.pos, fruit.kind);
    };

    // Check collision between swipe segment & active fruits
    const checkSliceCollision = (p1: TrailPoint, p2: TrailPoint) => {
      const container = containerRef.current;
      const camera = cameraRef.current;
      if (!container || !camera) return;

      const rect = container.getBoundingClientRect();
      const halfW = rect.width / 2;
      const halfH = rect.height / 2;

      const cutAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

      for (const fruit of activeFruitsRef.current) {
        if (fruit.sliced) continue;

        const projected = fruit.pos.clone().project(camera);
        const fx = projected.x * halfW + halfW;
        const fy = -(projected.y * halfH) + halfH;

        const screenRadius = (fruit.radius * halfH) / 6.0;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const l2 = dx * dx + dy * dy;

        let t = 0;
        if (l2 > 0) {
          t = Math.max(0, Math.min(1, ((fx - p1.x) * dx + (fy - p1.y) * dy) / l2));
        }

        const closestX = p1.x + t * dx;
        const closestY = p1.y + t * dy;

        const dist = Math.hypot(fx - closestX, fy - closestY);

        if (dist < screenRadius + 28) {
          sliceFruit(fruit, cutAngle);
        }
      }
    };

    // Synchronize Lights with Theme
    useEffect(() => {
      if (ambientLightRef.current && dirLightRef.current && rimLightRef.current) {
        ambientLightRef.current.color.setHex(colorTheme.ambientLightHex);
        dirLightRef.current.color.setHex(colorTheme.dirLightHex);
      }
    }, [colorTheme]);

      // Main Three.js Lifecycle
      useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
        camera.position.set(0, 0, 15);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const ambientLight = new THREE.AmbientLight(colorTheme.ambientLightHex, 2.2);
        const dirLight = new THREE.DirectionalLight(colorTheme.dirLightHex, 3.0);
        dirLight.position.set(6, 12, 8);
        dirLight.castShadow = true;

        const rimLight = new THREE.DirectionalLight(0xffffff, 2.2);
        rimLight.position.set(-6, -4, 4);

        scene.add(ambientLight, dirLight, rimLight);
        ambientLightRef.current = ambientLight;
        dirLightRef.current = dirLight;
        rimLightRef.current = rimLight;

        const ringGeom = new THREE.RingGeometry(8, 8.14, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x581c87,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.35,
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.position.z = -5;
        scene.add(ring);

        let animId: number;
        let lastTime = performance.now();

          const loop = (time: number) => {
            animId = requestAnimationFrame(loop);

            const dt = Math.min((time - lastTime) / 1000, 0.05);
            lastTime = time;

              if (!isPaused) {
                // DIFFICULTY SCALING OVER TIME (INCREASING NUMBER OF FRUITS)
                const elapsedSec = (time - gameStartTimeRef.current) / 1000;

                  let frenzyLevel = 1;
                  let frenzyLabel = 'Warmup (1x)';
                  let minInterval = 1100;
                  let maxInterval = 1500;
                  let baseCount = 1;
                  let extraChance = 0.35;

                  if (elapsedSec >= 45) {
                    frenzyLevel = 4;
                    frenzyLabel = 'FRUIT STORM (4-6x)';
                    minInterval = 480;
                    maxInterval = 720;
                    baseCount = 4;
                    extraChance = 0.85;
                  } else if (elapsedSec >= 28) {
                    frenzyLevel = 3;
                    frenzyLabel = 'Hyper Wave (3x)';
                    minInterval = 650;
                    maxInterval = 950;
                    baseCount = 3;
                    extraChance = 0.65;
                  } else if (elapsedSec >= 14) {
                    frenzyLevel = 2;
                    frenzyLabel = 'Speed Up (2x)';
                    minInterval = 850;
                    maxInterval = 1200;
                    baseCount = 2;
                    extraChance = 0.5;
                  }

                  // Notify if frenzy level stepped up
                  if (frenzyLevel !== currentFrenzyLevelRef.current) {
                    currentFrenzyLevelRef.current = frenzyLevel;
                    onFrenzyChange?.(frenzyLevel, frenzyLabel);
                    sound.playCombo(4);
                    frenzyBannerRef.current = {
                      text: `⚡ ${frenzyLabel.toUpperCase()} ACTIVATED!`,
                      time: time,
                      color: frenzyLevel === 4 ? '#ff007f' : frenzyLevel === 3 ? '#ffaa00' : '#00f0ff',
                    };
                  }

                // Dynamic Spawner Interval
                const spawnInterval = minInterval + Math.random() * (maxInterval - minInterval);
                if (time - lastSpawnTimeRef.current > spawnInterval) {
                  let fruitsToLaunch = baseCount;
                  if (Math.random() < extraChance) {
                    fruitsToLaunch += 1;
                  }
                  if (frenzyLevel === 4 && Math.random() < 0.3) {
                    fruitsToLaunch += 2; // Mega 6-fruit salvo!
                  }

                    // Launch in a wide staggered arc
                    for (let i = 0; i < fruitsToLaunch; i++) {
                      const delay = i * 90;
                      const slotX = ((i / Math.max(1, fruitsToLaunch - 1)) - 0.5) * 8.2;
                      setTimeout(() => {
                        if (sceneRef.current && !isPaused) {
                          spawnFruitWithOffset(sceneRef.current, slotX);
                        }
                      }, delay);
                    }

                    lastSpawnTimeRef.current = time;
                  }

                // 1. Update Active Flying Fruits
                const gravity = 18;
                for (let i = activeFruitsRef.current.length - 1; i >= 0; i--) {
                  const f = activeFruitsRef.current[i];
                  if (f.sliced) {
                    activeFruitsRef.current.splice(i, 1);
                    continue;
                  }

                    f.vel.y -= gravity * dt;
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

              // 2. Update Sliced Halves
              for (let i = activeHalvesRef.current.length - 1; i >= 0; i--) {
                const h = activeHalvesRef.current[i];
                h.vel.y -= gravity * dt * 1.1;
                h.pos.addScaledVector(h.vel, dt);
                h.mesh.position.copy(h.pos);

                    h.mesh.rotation.x += h.rotSpeed.x * dt;
                    h.mesh.rotation.y += h.rotSpeed.y * dt;
                    h.mesh.rotation.z += h.rotSpeed.z * dt;

                    if (h.pos.y < -9.5) {
                      scene.remove(h.mesh);
                      activeHalvesRef.current.splice(i, 1);
                    }
                  }

                  // 3. Update Juice Splash Particles
                  for (let i = particlesRef.current.length - 1; i >= 0; i--) {
                    const p = particlesRef.current[i];
                    p.life += dt;
                    p.vel.y -= gravity * dt * 0.7;
                    p.pos.addScaledVector(p.vel, dt);
                    p.mesh.position.copy(p.pos);

                    const scale = Math.max(0.01, 1 - p.life / p.maxLife);
                    p.mesh.scale.set(scale, scale, scale);

                    if (p.life >= p.maxLife) {
                      scene.remove(p.mesh);
                      particlesRef.current.splice(i, 1);
                    }
                  }
                }

                renderer.render(scene, camera);

                // Draw Laser Blade Trail & Hit Text Overlay
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

                        // 1. Pass: Wide Neon Volumetric Bloom
                        tCtx.save();
                        tCtx.shadowColor = bladeStyle.color;
                        tCtx.shadowBlur = 30;
                        for (let i = 1; i < pts.length; i++) {
                          const pA = pts[i - 1];
                          const pB = pts[i];
                          const age = (now - pB.time) / 180;
                          const alpha = Math.max(0, 1 - age);
                          const width = Math.max(4, (1 - age) * 20);

                          tCtx.beginPath();
                          tCtx.moveTo(pA.x, pA.y);
                          tCtx.lineTo(pB.x, pB.y);
                          tCtx.strokeStyle = bladeStyle.glowColor;
                          tCtx.globalAlpha = alpha * 0.8;
                          tCtx.lineWidth = width * 2.2;
                          tCtx.stroke();
                        }
                        tCtx.restore();

                          // 2. Pass: Intense Saturated Laser Beam
                          tCtx.save();
                          tCtx.shadowColor = bladeStyle.color;
                          tCtx.shadowBlur = 16;
                          for (let i = 1; i < pts.length; i++) {
                            const pA = pts[i - 1];
                            const pB = pts[i];
                            const age = (now - pB.time) / 180;
                            const alpha = Math.max(0, 1 - age);
                            const width = Math.max(3, (1 - age) * 14);

                            tCtx.beginPath();
                            tCtx.moveTo(pA.x, pA.y);
                            tCtx.lineTo(pB.x, pB.y);
                            tCtx.strokeStyle = bladeStyle.color;
                            tCtx.globalAlpha = alpha;
                            tCtx.lineWidth = width;
                            tCtx.stroke();
                          }
                          tCtx.restore();

                            // 3. Pass: White-Hot Laser Center
                            for (let i = 1; i < pts.length; i++) {
                              const pA = pts[i - 1];
                              const pB = pts[i];
                              const age = (now - pB.time) / 180;
                              const alpha = Math.max(0, 1 - age);
                              const width = Math.max(1.5, (1 - age) * 5);

                            tCtx.beginPath();
                            tCtx.moveTo(pA.x, pA.y);
                            tCtx.lineTo(pB.x, pB.y);
                            tCtx.strokeStyle = '#ffffff';
                            tCtx.globalAlpha = alpha * 0.95;
                            tCtx.lineWidth = width;
                            tCtx.stroke();
                          }
                        }

                          // Draw Floating Hit Score Popups
                          hitTextsRef.current = hitTextsRef.current.filter((ht) => now - ht.time < 800);
                          for (const ht of hitTextsRef.current) {
                            const age = (now - ht.time) / 800;
                            const alpha = Math.max(0, 1 - age);
                            const offsetY = age * 48;
                            tCtx.save();
                            tCtx.font = '900 18px monospace';
                            tCtx.textAlign = 'center';
                            tCtx.shadowColor = ht.color;
                            tCtx.shadowBlur = 14;
                            tCtx.fillStyle = '#ffffff';
                            tCtx.globalAlpha = alpha;
                            tCtx.fillText(ht.text, ht.x, ht.y - offsetY);
                            tCtx.restore();
                          }

                          // Draw Glowing Frenzy Level Transition Banner across Top
                          if (frenzyBannerRef.current) {
                            const age = (now - frenzyBannerRef.current.time) / 2000;
                            if (age < 1.0) {
                              const alpha = Math.sin(age * Math.PI);
                              const halfW = trailCanvas.width / 2;
                              tCtx.save();
                              tCtx.font = '900 22px monospace';
                              tCtx.textAlign = 'center';
                              tCtx.shadowColor = frenzyBannerRef.current.color;
                              tCtx.shadowBlur = 25;
                              tCtx.fillStyle = '#ffffff';
                              tCtx.globalAlpha = alpha;
                              tCtx.fillText(frenzyBannerRef.current.text, halfW, 65);
                              tCtx.restore();
                            } else {
                              frenzyBannerRef.current = null;
                            }
                          }
                        }
                    }
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
    }, [bladeStyle, colorTheme, isPaused, spawnFruitWithOffset, onFrenzyChange]);

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
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const now = performance.now();

    const pts = trailPointsRef.current;
    const lastPoint = pts[pts.length - 1];

        if (lastPoint) {
          const dist = Math.hypot(x - lastPoint.x, y - lastPoint.y);
          if (dist > 8) {
            if (now - lastWhooshTimeRef.current > 170 && dist > 35) {
              sound.playWhoosh(Math.min(2.0, dist / 40));
              lastWhooshTimeRef.current = now;
            }

      const newPoint = { x, y, time: now };
      pts.push(newPoint);
      checkSliceCollision(lastPoint, newPoint);
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

      {/* Dynamic Background Aura Glow driven by active theme */}
      <div
        style={{
          background: `radial-gradient(circle at 50% 50%, ${bladeStyle.color}35 0%, transparent 70%)`,
        }}
        className="absolute inset-0 pointer-events-none transition-all duration-700 blur-2xl"
      />

    {/* Live Slice Instructions Callout */}
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none z-20 flex items-center gap-2.5 bg-black/85 backdrop-blur-md px-5 py-2.5 rounded-full border border-purple-500/40 text-xs font-semibold text-zinc-200 shadow-[0_0_25px_rgba(0,0,0,0.85)]">
      <span
        style={{ backgroundColor: bladeStyle.color }}
        className="w-2.5 h-2.5 rounded-full animate-ping"
      />
      <span className="tracking-wider uppercase font-mono text-[11px] sm:text-xs">
        SWIPE OR DRAG TO CLEAVE FLYING FRUITS!
      </span>
    </div>
  </div>
);
}
