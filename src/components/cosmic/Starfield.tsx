import { useEffect, useRef } from "react";

type Props = {
  /** 0 = calm intro, 1 = normal, 2 = fast travel */
  speed?: number;
  density?: number;
  className?: string;
};

type Star = {
  x: number;
  y: number;
  z: number;
  r: number;
  twinkle: number;
};

export function Starfield({ speed = 0.15, density = 1, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const build = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(
        220,
        Math.round(((width * height) / 9000) * density),
      );
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 0.8 + 0.2,
        r: Math.random() * 1.3 + 0.3,
        twinkle: Math.random() * Math.PI * 2,
      }));
    };

    build();
    const onResize = () => build();
    window.addEventListener("resize", onResize);

    let t = 0;
    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        s.twinkle += 0.02 * s.z;
        s.y += speedRef.current * s.z * (reduced ? 0 : 1);
        if (s.y > height + 2) {
          s.y = -2;
          s.x = Math.random() * width;
        }
        const alpha = 0.35 + Math.sin(s.twinkle) * 0.3 + s.z * 0.3;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * s.z * 1.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(233, 228, 255, ${Math.max(0.05, Math.min(1, alpha))})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      void t;
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className ?? "pointer-events-none absolute inset-0 h-full w-full"}
    />
  );
}
