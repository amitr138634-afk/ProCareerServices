"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number; y: number; r: number;
  opacity: number; phase: number; speed: number;
}

interface Asteroid {
  x: number; y: number; vx: number; vy: number;
  r: number; rotation: number; rotSpeed: number;
  opacity: number; numVerts: number; offsets: number[];
  gray: number; // base gray value 120-190
}

interface ShootingStar {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number;
}

function randomEdge(w: number, h: number) {
  const side = Math.floor(Math.random() * 4);
  if (side === 0) return { x: Math.random() * w, y: -30 };
  if (side === 1) return { x: w + 30, y: Math.random() * h };
  if (side === 2) return { x: Math.random() * w, y: h + 30 };
  return { x: -30, y: Math.random() * h };
}

function makeAsteroid(w: number, h: number): Asteroid {
  const { x, y } = randomEdge(w, h);
  const cx = w / 2, cy = h / 2;
  const dx = cx - x, dy = cy - y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const speed = 0.08 + Math.random() * 0.22;
  const spread = (Math.random() - 0.5) * 1.2; // drift sideways
  const numVerts = 6 + Math.floor(Math.random() * 5);
  return {
    x, y,
    vx: (dx / len) * speed + spread * 0.1,
    vy: (dy / len) * speed + spread * 0.1,
    r: 2.5 + Math.random() * 9,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.006,
    opacity: 0.5 + Math.random() * 0.4,
    numVerts,
    offsets: Array.from({ length: numVerts }, () => 0.55 + Math.random() * 0.55),
    gray: 130 + Math.floor(Math.random() * 60),
  };
}

function drawAsteroid(ctx: CanvasRenderingContext2D, a: Asteroid) {
  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.rotate(a.rotation);
  ctx.beginPath();
  for (let i = 0; i < a.numVerts; i++) {
    const angle = (i / a.numVerts) * Math.PI * 2 - Math.PI / 2;
    const r = a.r * a.offsets[i];
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.strokeStyle = `rgba(${a.gray},${a.gray - 10},${a.gray - 20},${a.opacity})`;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // slight fill for larger ones
  if (a.r > 6) {
    ctx.fillStyle = `rgba(${a.gray},${a.gray - 10},${a.gray - 20},${a.opacity * 0.18})`;
    ctx.fill();
  }
  ctx.restore();
}

function isOffScreen(a: Asteroid, w: number, h: number) {
  return a.x < -60 || a.x > w + 60 || a.y < -60 || a.y > h + 60;
}

export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const ASTEROID_COUNT = 28;
    const STAR_COUNT = 110;

    // Init stars — scatter randomly across screen
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.4 + Math.random() * 1.1,
      opacity: 0.2 + Math.random() * 0.55,
      phase: Math.random() * Math.PI * 2,
      speed: 0.006 + Math.random() * 0.018,
    }));

    // Init asteroids — mix: some already on screen, some from edges
    const asteroids: Asteroid[] = Array.from({ length: ASTEROID_COUNT }, (_, i) => {
      if (i < ASTEROID_COUNT * 0.6) {
        // start on-screen so there are asteroids visible immediately
        const a = makeAsteroid(w, h);
        a.x = Math.random() * w;
        a.y = Math.random() * h;
        return a;
      }
      return makeAsteroid(w, h);
    });

    const shootingStars: ShootingStar[] = [];
    let frame = 0;
    let rafId: number;

    function spawnShootingStar() {
      const x = Math.random() * w * 0.7;
      const y = Math.random() * h * 0.4;
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.4;
      const speed = 4 + Math.random() * 5;
      shootingStars.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 28 + Math.floor(Math.random() * 20),
      });
    }

    function drawShootingStar(s: ShootingStar) {
      const t = s.life / s.maxLife;
      const opacity = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8;
      const tailLen = 40 + s.vx * 3;
      const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * tailLen / 5, s.y - s.vy * tailLen / 5);
      grad.addColorStop(0, `rgba(255,255,255,${opacity * 0.9})`);
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * tailLen / 5, s.y - s.vy * tailLen / 5);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);

      // Stars
      for (const star of stars) {
        star.phase += star.speed;
        const twinkle = 0.5 + 0.5 * Math.sin(star.phase);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,215,255,${star.opacity * twinkle})`;
        ctx.fill();
      }

      // Asteroids
      for (let i = 0; i < asteroids.length; i++) {
        const a = asteroids[i];
        a.x += a.vx;
        a.y += a.vy;
        a.rotation += a.rotSpeed;
        if (isOffScreen(a, w, h)) {
          asteroids[i] = makeAsteroid(w, h);
        } else {
          drawAsteroid(ctx, a);
        }
      }

      // Shooting stars
      if (frame % 280 === 0 && Math.random() < 0.6) spawnShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life++;
        if (s.life >= s.maxLife) { shootingStars.splice(i, 1); continue; }
        drawShootingStar(s);
      }

      frame++;
      rafId = requestAnimationFrame(tick);
    }

    tick();

    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 2,
        pointerEvents: "none",
        display: "block",
      }}
      aria-hidden="true"
    />
  );
}
