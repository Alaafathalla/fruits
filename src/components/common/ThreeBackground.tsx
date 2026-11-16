'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeBackgroundProps {
  /** Height of the canvas container in px — should match the parent element */
  height?: number;
  /** Accent color (hex number) for particles and lines */
  accentHex?: number;
  /** Particle count — lower for header, higher for footer */
  particleCount?: number;
  /** Whether to draw connecting lines between nearby particles */
  drawLines?: boolean;
  className?: string;
}

/**
 * Lightweight Three.js particle-web background.
 * Renders into an absolutely-positioned canvas that sits behind its siblings.
 */
export default function ThreeBackground({
  accentHex = 0x9333ea,
  particleCount = 60,
  drawLines = true,
  className = '',
}: ThreeBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Scene ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();

    const w = mount.clientWidth || window.innerWidth;
    const h = mount.clientHeight || 80;

    const camera = new THREE.OrthographicCamera(
      -w / 2, w / 2,
      h / 2, -h / 2,
      0.1, 100
    );
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.pointerEvents = 'none';
    mount.appendChild(renderer.domElement);

    // ── Particles ──────────────────────────────────────────────────────────
    type Particle = {
      mesh: THREE.Mesh;
      vx: number;
      vy: number;
      phase: number;
      speed: number;
    };

    const particleMat = new THREE.MeshBasicMaterial({
      color: accentHex,
      transparent: true,
      opacity: 0.55,
    });

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const r = 0.8 + Math.random() * 1.6;
      const geom = new THREE.CircleGeometry(r, 8);
      const mesh = new THREE.Mesh(geom, particleMat.clone());
      mesh.position.set(
        (Math.random() - 0.5) * w,
        (Math.random() - 0.5) * h,
        0
      );
      scene.add(mesh);
      particles.push({
        mesh,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.8,
      });
    }

    // ── Line geometry (re-built each frame) ───────────────────────────────
    let lineSegments: THREE.LineSegments | null = null;
    const lineMat = new THREE.LineBasicMaterial({
      color: accentHex,
      transparent: true,
      opacity: 0.12,
    });

    // ── Animation ─────────────────────────────────────────────────────────
    let animId: number;
    let last = performance.now();
    const MAX_LINK_DIST = Math.min(w * 0.22, 200);

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const halfW = w / 2;
      const halfH = h / 2;

      for (const p of particles) {
        p.mesh.position.x += p.vx * dt;
        p.mesh.position.y += p.vy * dt;

        // Gentle bob
        p.mesh.position.y += Math.sin(now * 0.001 * p.speed + p.phase) * 0.3 * dt;

        // Wrap around edges
        if (p.mesh.position.x > halfW + 10) p.mesh.position.x = -halfW - 10;
        if (p.mesh.position.x < -halfW - 10) p.mesh.position.x = halfW + 10;
        if (p.mesh.position.y > halfH + 10) p.mesh.position.y = -halfH - 10;
        if (p.mesh.position.y < -halfH - 10) p.mesh.position.y = halfH + 10;

        // Pulse opacity
        const mat = p.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.3 + Math.sin(now * 0.0015 * p.speed + p.phase) * 0.25;
      }

      // Rebuild connecting lines
      if (drawLines) {
        if (lineSegments) {
          scene.remove(lineSegments);
          lineSegments.geometry.dispose();
        }

        const positions: number[] = [];
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].mesh.position.x - particles[j].mesh.position.x;
            const dy = particles[i].mesh.position.y - particles[j].mesh.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MAX_LINK_DIST) {
              positions.push(
                particles[i].mesh.position.x, particles[i].mesh.position.y, 0,
                particles[j].mesh.position.x, particles[j].mesh.position.y, 0,
              );
            }
          }
        }

        if (positions.length > 0) {
          const geom = new THREE.BufferGeometry();
          geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
          lineSegments = new THREE.LineSegments(geom, lineMat);
          scene.add(lineSegments);
        }
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(loop);

    // ── Resize ─────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!mount) return;
      const nw = mount.clientWidth;
      const nh = mount.clientHeight;
      camera.left = -nw / 2;
      camera.right = nw / 2;
      camera.top = nh / 2;
      camera.bottom = -nh / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      particles.forEach((p) => {
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.MeshBasicMaterial).dispose();
      });
      lineMat.dispose();
      if (lineSegments) lineSegments.geometry.dispose();
    };
  }, [accentHex, particleCount, drawLines]);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    />
  );
}
