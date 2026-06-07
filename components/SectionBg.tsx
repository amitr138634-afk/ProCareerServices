"use client";

import { useEffect, useRef } from "react";

export type SectionBgVariant = "hero" | "orbits" | "particles";

export default function SectionBg({ variant }: { variant: SectionBgVariant }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    let w = canvas.offsetWidth || window.innerWidth;
    let h = canvas.offsetHeight || 400;
    canvas.width = w;
    canvas.height = h;

    let rafId = 0;
    let frame = 0;

    const onResize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener("resize", onResize);

    // ── HERO: rotating wireframe sphere ──────────────────────────────────────
    if (variant === "hero") {
      let rot = 0;
      const NUM_LAT = 10;
      const NUM_LON = 14;

      const tick = () => {
        ctx.clearRect(0, 0, w, h);
        rot += 0.003;

        const R = Math.min(w * 0.26, 260);
        const cx = w * 0.82;
        const cy = h * 0.5;

        // Ambient glow
        const grd = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 2);
        grd.addColorStop(0, "rgba(109,40,217,0.13)");
        grd.addColorStop(0.5, "rgba(139,92,246,0.06)");
        grd.addColorStop(1, "rgba(139,92,246,0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(cx, cy, R * 2, 0, Math.PI * 2);
        ctx.fill();

        // Latitude rings
        for (let i = 0; i <= NUM_LAT; i++) {
          const lat = (i / NUM_LAT) * Math.PI - Math.PI / 2;
          const r = R * Math.cos(lat);
          const y = cy + R * Math.sin(lat);
          const opacity = 0.1 + 0.22 * (1 - Math.abs(lat / (Math.PI / 2)));
          ctx.beginPath();
          ctx.ellipse(cx, y, r, r * 0.3, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(139,92,246,${opacity})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }

        // Longitude lines (rotating)
        for (let i = 0; i < NUM_LON; i++) {
          const lon = (i / NUM_LON) * Math.PI + rot;
          const cosLon = Math.cos(lon);
          const absC = Math.abs(cosLon);
          const opacity = 0.07 + 0.28 * absC;
          ctx.beginPath();
          ctx.ellipse(cx, cy, absC * R, R, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(167,139,250,${opacity})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }

        // Surface dots (spherical Fibonacci distribution)
        for (let i = 0; i < 18; i++) {
          const lat = Math.asin(2 * i / 17 - 1);
          const lon = (i * 2.399963) + rot; // golden angle
          const z = Math.cos(lat) * Math.sin(lon);
          if (z < 0) continue; // back-face cull
          const px = cx + R * Math.cos(lat) * Math.cos(lon);
          const py = cy + R * Math.sin(lat) * 0.3;
          const op = 0.2 + 0.7 * ((z + 1) / 2);
          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(196,181,253,${op})`;
          ctx.fill();
        }

        rafId = requestAnimationFrame(tick);
      };
      tick();
    }

    // ── ORBITS: large glowing rings + particles + streaks ────────────────────
    else if (variant === "orbits") {
      const RINGS = [
        { rxF: 0.26, ryF: 0.10, tilt: -Math.PI / 14, color: "6,182,212", op: 0.60 },
        { rxF: 0.40, ryF: 0.18, tilt: -Math.PI / 12, color: "14,165,233", op: 0.44 },
        { rxF: 0.55, ryF: 0.28, tilt: -Math.PI / 10, color: "6,182,212", op: 0.30 },
        { rxF: 0.70, ryF: 0.40, tilt: -Math.PI / 9,  color: "99,102,241", op: 0.18 },
      ];

      const particles: { angle: number; speed: number; ring: number; size: number }[] = [];
      for (let r = 0; r < RINGS.length; r++) {
        const count = [8, 7, 6, 5][r];
        for (let p = 0; p < count; p++) {
          particles.push({
            angle: (p / count) * Math.PI * 2 + Math.random() * 0.5,
            speed: (0.003 + Math.random() * 0.005) * (r % 2 === 0 ? 1 : -1),
            ring: r,
            size: 1 + Math.random() * 2.5,
          });
        }
      }

      const stars = Array.from({ length: 90 }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: 0.4 + Math.random() * 1.2, op: 0.15 + Math.random() * 0.55,
      }));

      const streaks: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }[] = [];

      const tick = () => {
        ctx.clearRect(0, 0, w, h);
        const cx = w / 2;
        const cy = h * 0.65;

        // Stars
        for (const s of stars) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200,215,255,${s.op})`;
          ctx.fill();
        }

        // Rings
        for (const ring of RINGS) {
          const rx = w * ring.rxF;
          const ry = h * ring.ryF;
          ctx.save();
          ctx.shadowBlur = 22;
          ctx.shadowColor = `rgba(${ring.color},${ring.op})`;
          ctx.strokeStyle = `rgba(${ring.color},${ring.op * 0.9})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, ring.tilt, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Orbiting particles
        for (const p of particles) {
          p.angle += p.speed;
          const ring = RINGS[p.ring];
          const rx = w * ring.rxF;
          const ry = h * ring.ryF;
          const cosTilt = Math.cos(ring.tilt);
          const sinTilt = Math.sin(ring.tilt);
          const cosA = Math.cos(p.angle);
          const sinA = Math.sin(p.angle);
          const x = cx + cosA * rx * cosTilt - sinA * ry * sinTilt;
          const y = cy + cosA * rx * sinTilt + sinA * ry * cosTilt;
          const glow = ctx.createRadialGradient(x, y, 0, x, y, p.size * 3.5);
          glow.addColorStop(0, `rgba(${ring.color},0.9)`);
          glow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, p.size * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Meteor streaks
        if (frame % 140 === 0 && Math.random() < 0.7) {
          streaks.push({
            x: Math.random() * w * 0.7 + w * 0.05,
            y: Math.random() * h * 0.45,
            vx: 4 + Math.random() * 5,
            vy: 1.5 + Math.random() * 2.5,
            life: 0, maxLife: 30 + Math.floor(Math.random() * 25),
          });
        }
        for (let i = streaks.length - 1; i >= 0; i--) {
          const s = streaks[i];
          s.x += s.vx; s.y += s.vy; s.life++;
          if (s.life >= s.maxLife) { streaks.splice(i, 1); continue; }
          const t = s.life / s.maxLife;
          const op = t < 0.25 ? t / 0.25 : 1 - (t - 0.25) / 0.75;
          const tailLen = 12;
          const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * tailLen, s.y - s.vy * tailLen);
          grad.addColorStop(0, `rgba(251,191,36,${op})`);
          grad.addColorStop(0.5, `rgba(239,68,68,${op * 0.7})`);
          grad.addColorStop(1, "rgba(239,68,68,0)");
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - s.vx * tailLen, s.y - s.vy * tailLen);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        frame++;
        rafId = requestAnimationFrame(tick);
      };
      tick();
    }

    // ── PARTICLES: subtle floating teal dots ─────────────────────────────────
    else if (variant === "particles") {
      const dots = Array.from({ length: 55 }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: 0.8 + Math.random() * 1.8, op: 0.1 + Math.random() * 0.28,
      }));

      const tick = () => {
        ctx.clearRect(0, 0, w, h);
        for (const d of dots) {
          d.x = (d.x + d.vx + w) % w;
          d.y = (d.y + d.vy + h) % h;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(16,185,129,${d.op})`;
          ctx.fill();
        }
        rafId = requestAnimationFrame(tick);
      };
      tick();
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", display: "block" }}
      aria-hidden="true"
    />
  );
}
