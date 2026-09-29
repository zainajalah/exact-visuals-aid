import { useEffect, useRef, useState } from "react";
import { Scene, ChapterMark } from "@/components/cosmic/Scene";
import { audio } from "@/lib/audio-engine";

/** Chapter 9: kejar suratnya. Keyboard di desktop, joystick di HP. */
export function RocketChase({ onCaught }: { onCaught: () => void }) {
  const [rocket, setRocket] = useState({ x: 18, y: 55 });
  const [letter, setLetter] = useState({ x: 82, y: 30 });
  const [progress, setProgress] = useState(0);
  const [caught, setCaught] = useState(false);

  const keys = useRef<Record<string, boolean>>({});
  const joystick = useRef({ dx: 0, dy: 0, active: false });
  const rocketRef = useRef(rocket);
  const letterRef = useRef(letter);
  const progressRef = useRef(0);
  const caughtRef = useRef(false);
  rocketRef.current = rocket;
  letterRef.current = letter;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    let t = 0;
    const tick = () => {
      t += 0.016;
      const k = keys.current;
      let dx = joystick.current.dx;
      let dy = joystick.current.dy;
      if (k["arrowleft"] || k["a"]) dx -= 1;
      if (k["arrowright"] || k["d"]) dx += 1;
      if (k["arrowup"] || k["w"]) dy -= 1;
      if (k["arrowdown"] || k["s"]) dy += 1;

      const speed = 0.9;
      const next = {
        x: Math.max(6, Math.min(94, rocketRef.current.x + dx * speed)),
        y: Math.max(8, Math.min(92, rocketRef.current.y + dy * speed)),
      };
      rocketRef.current = next;
      setRocket(next);

      // surat melayang menjauh, makin pelan saat pemain mendekat
      const ease = 1 - progressRef.current;
      const target = {
        x: 74 + Math.sin(t * 0.7) * 14 * ease,
        y: 40 + Math.cos(t * 0.9) * 26 * ease,
      };
      letterRef.current = target;
      setLetter(target);

      const dist = Math.hypot(next.x - target.x, next.y - target.y);
      const p = Math.max(0, Math.min(1, 1 - (dist - 6) / 70));
      progressRef.current = p;
      setProgress(p);

      if (dist < 9 && !caughtRef.current) {
        caughtRef.current = true;
        audio.play("success");
        setCaught(true);
        window.setTimeout(onCaught, 2200);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onCaught]);

  return (
    <Scene speed={caught ? 0.1 : 1.6 - progress} density={1.4} className="justify-start">
      <ChapterMark index={9} />

      {/* objek parallax */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="animate-drift absolute left-[12%] top-[18%] h-24 w-24 rounded-full bg-violet/40 blur-[2px]" />
        <span className="animate-drift absolute right-[8%] top-[62%] h-16 w-16 rounded-full bg-navy blur-[1px]" />
        <span className="absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* surat */}
      <span
        className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-transform duration-100"
        style={{ left: `${letter.x}%`, top: `${letter.y}%` }}
      >
        <span className="paper-surface block h-10 w-14 rounded-[3px] shadow-[var(--glow-gold)]" />
      </span>

      {/* roket */}
      <span
        className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${rocket.x}%`, top: `${rocket.y}%` }}
      >
        <svg viewBox="0 0 24 34" className="block h-9 w-7 drop-shadow-[0_0_10px_rgba(220,200,255,0.5)]">
          <path
            d="M12 0c5 6 7.5 12 7.5 19 0 4-2 7-7.5 15C6.5 26 4.5 23 4.5 19 4.5 12 7 6 12 0Z"
            className="fill-lavender"
          />
          <circle cx="12" cy="14" r="3" className="fill-navy" />
        </svg>
        <span className="absolute left-1/2 top-full h-10 w-1.5 -translate-x-1/2 rounded-full bg-accent/60 blur-[3px]" />
      </span>

      <p className="absolute top-[max(1rem,env(safe-area-inset-top))] w-full text-center text-[11px] tracking-[0.3em] text-muted-foreground">
        {caught ? "Got you." : `${Math.round(progress * 100)}%`}
      </p>

      {!caught && <Joystick joystick={joystick} />}
    </Scene>
  );
}

function Joystick({
  joystick,
}: {
  joystick: React.RefObject<{ dx: number; dy: number; active: boolean }>;
}) {
  const baseRef = useRef<HTMLDivElement | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const handle = (clientX: number, clientY: number) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const max = rect.width / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy) || 1;
    const clamped = Math.min(dist, max);
    dx = (dx / dist) * clamped;
    dy = (dy / dist) * clamped;
    setKnob({ x: dx, y: dy });
    joystick.current = { dx: dx / max, dy: dy / max, active: true };
  };

  const reset = () => {
    setKnob({ x: 0, y: 0 });
    joystick.current = { dx: 0, dy: 0, active: false };
  };

  return (
    <div
      ref={baseRef}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        if (touch) handle(touch.clientX, touch.clientY);
      }}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        if (touch) handle(touch.clientX, touch.clientY);
      }}
      onTouchEnd={reset}
      onPointerDown={(e) => handle(e.clientX, e.clientY)}
      onPointerMove={(e) => e.buttons === 1 && handle(e.clientX, e.clientY)}
      onPointerUp={reset}
      className="absolute bottom-[max(2rem,env(safe-area-inset-bottom))] left-1/2 z-20 h-32 w-32 -translate-x-1/2 touch-none rounded-full border border-border bg-white/5 backdrop-blur-md"
    >
      <span
        className="absolute left-1/2 top-1/2 h-12 w-12 rounded-full bg-primary/40 shadow-[var(--glow-soft)] transition-transform duration-75"
        style={{
          transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))`,
        }}
      />
    </div>
  );
}
