import { useEffect, useRef, useState } from "react";
import { Scene, ChapterMark, CosmicButton } from "@/components/cosmic/Scene";
import { CONFIG, GALLERY_TEXT, SECRET_TEXT } from "@/lib/birthday-config";
import { audio, setMood } from "@/lib/audio-engine";

const LAYOUT = [
  { top: "0%", left: "4%", tilt: "-7deg", delay: "0s" },
  { top: "11%", left: "52%", tilt: "6deg", delay: "0.8s" },
  { top: "30%", left: "16%", tilt: "3deg", delay: "1.6s" },
  { top: "45%", left: "54%", tilt: "-5deg", delay: "0.4s" },
  { top: "62%", left: "22%", tilt: "8deg", delay: "1.2s" },
];

function Polaroid({
  src,
  caption,
  index,
}: {
  src: string;
  caption: string;
  index: number;
}) {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(src) && !broken;
  return (
    <div className="paper-surface w-full rounded-[4px] p-2 pb-8">
      <div className="relative aspect-4/5 w-full overflow-hidden rounded-[2px] bg-secondary">
        {showImage ? (
          <img
            src={src}
            alt={caption}
            loading="lazy"
            onError={() => setBroken(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="nebula grid h-full w-full place-items-center text-center">
            <span className="px-2 text-[10px] uppercase tracking-[0.25em] text-foreground/80">
              foto {index + 1}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// 20 titik: 5 dari foto + 15 bintang kecil. Bentuk abstrak, bukan zodiak.
const POINTS: [number, number][] = [
  [22, 40], [40, 28], [58, 36], [74, 26], [64, 58],
  [30, 55], [46, 64], [56, 72], [36, 76], [20, 68],
  [80, 44], [86, 60], [70, 74], [50, 48], [44, 40],
  [28, 30], [62, 20], [84, 32], [14, 52], [52, 84],
];
const LINES: [number, number][] = [
  [15, 1], [1, 14], [14, 2], [2, 16], [16, 3], [3, 17], [3, 10], [10, 4],
  [4, 13], [13, 0], [0, 18], [0, 5], [5, 6], [6, 7], [7, 12], [12, 11], [11, 10], [5, 9], [9, 8], [8, 19],
];

function Constellation({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    setMood(0.6, 3);
    const steps = [300, 2400, 3200, 7400, 8800, 10600];
    const timers = steps.map((ms, i) =>
      window.setTimeout(() => {
        if (i === 3) audio.play("success");
        if (i === 4) audio.play("whoosh");
        if (i === 5) onDone();
        else setPhase(i + 1);
      }, ms),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [onDone]);

  return (
    <div data-constellation className="fixed inset-0 z-30 overflow-hidden bg-background/60 backdrop-blur-[2px]">
      <div className={`absolute inset-x-0 top-[12vh] mx-auto aspect-square w-[min(92vw,460px)] transition-all duration-[1500ms] ${phase >= 4 ? "scale-105" : ""}`}>
        {phase >= 3 && (
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible">
            {LINES.map(([a, b], i) => (
              <line
                key={i}
                x1={POINTS[a]![0]} y1={POINTS[a]![1]} x2={POINTS[b]![0]} y2={POINTS[b]![1]}
                pathLength={1}
                className="draw-line stroke-accent"
                strokeWidth={phase >= 4 ? 0.5 : 0.25}
                strokeOpacity={phase >= 4 ? 0.9 : 0.55}
                style={{ animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </svg>
        )}
        {POINTS.map(([x, y], i) => {
          const memory = i < 5;
          const spot = LAYOUT[i] ?? LAYOUT[0]!;
          const startX = parseFloat(spot.left) + 21;
          const startY = parseFloat(spot.top) + 10;
          const placed = phase >= 2;
          return (
            <span
              key={i}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground transition-all ease-in-out ${
                memory ? "h-2.5 w-2.5 shadow-[var(--glow-gold)]" : "h-1 w-1"
              } ${phase >= 4 ? "bg-accent" : ""}`}
              style={{
                left: `${placed || !memory ? x : startX}%`,
                top: `${placed || !memory ? y : startY}%`,
                opacity: memory ? (phase >= 1 ? 1 : 0) : phase >= 2 ? 0.8 : 0,
                transitionDuration: memory ? "2000ms" : "1400ms",
                transitionDelay: memory ? "0ms" : `${i * 60}ms`,
              }}
            />
          );
        })}
        {/* portal di tengah */}
        <span
          className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 rounded-full transition-all ease-in duration-[1800ms]"
          style={{
            width: phase >= 5 ? "320vmax" : phase >= 4 ? "24px" : "0px",
            height: phase >= 5 ? "320vmax" : phase >= 4 ? "24px" : "0px",
            background: "radial-gradient(circle, var(--background) 30%, color-mix(in oklab, var(--accent) 60%, transparent) 55%, transparent 70%)",
            boxShadow: "var(--glow-gold)",
          }}
        />
      </div>
      <p
        className={`absolute inset-x-0 bottom-[16vh] px-8 text-center font-display text-xl italic transition-opacity duration-[1500ms] ${
          phase >= 3 && phase < 5 ? "opacity-100" : "opacity-0"
        }`}
      >
        {SECRET_TEXT.constellation}
      </p>
    </div>
  );
}

export function Gallery({ onNext }: { onNext: () => void }) {
  const [active, setActive] = useState<number | null>(null);
  const [seen, setSeen] = useState<Set<number>>(new Set());
  const [ending, setEnding] = useState(false);
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number }[]>([]);
  const sparkId = useRef(0);
  const total = Math.min(5, CONFIG.photos.length);
  const complete = seen.size >= total;

  useEffect(() => {
    if (complete && active === null && !ending) {
      const id = window.setTimeout(() => setEnding(true), 1600);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [complete, active, ending]);

  const open = (index: number) => {
    audio.play("click");
    setActive(index);
    setSeen((prev) => new Set(prev).add(index));
  };

  return (
    <Scene speed={0.09} className="justify-start pt-16">
      <ChapterMark index={2} />
      <header className="max-w-sm text-center">
        <h1 className="animate-rise font-display text-3xl">{GALLERY_TEXT.title}</h1>
        <p className="animate-rise mt-2 text-sm text-muted-foreground">
          {GALLERY_TEXT.subtitle}
        </p>
        <p data-memory-counter className="mt-4 text-[10px] uppercase tracking-[0.35em] text-muted-foreground/70 transition-all duration-1000">
          {complete ? (
            <span className="text-accent">memories complete</span>
          ) : (
            <>memories discovered · {seen.size} / {total}</>
          )}
        </p>
      </header>

      <div className="relative mt-6 h-[600px] w-full max-w-sm">
        {CONFIG.photos.slice(0, 5).map((src, index) => {
          const spot = LAYOUT[index] ?? LAYOUT[0]!;
          return (
            <button
              key={index}
              type="button"
              aria-label={`foto ${index + 1}`}
              onClick={() => open(index)}
              style={{
                top: spot.top,
                left: spot.left,
                transitionDelay: ending ? `${index * 150}ms` : "0ms",
              }}
              className={`absolute z-20 w-[42%] cursor-pointer touch-manipulation transition-all duration-[1600ms] ease-in-out active:rotate-2 active:scale-95 ${
                ending
                  ? "pointer-events-none -translate-y-24 scale-[0.15] opacity-0 blur-sm"
                  : active === index
                    ? "opacity-0"
                    : "opacity-100"
              }`}
            >
              <span
                className="animate-drift block"
                style={
                  {
                    "--tilt": spot.tilt,
                    animationDelay: spot.delay,
                  } as React.CSSProperties
                }
              >
                <Polaroid
                  src={src ?? ""}
                  caption={CONFIG.captions[index] ?? ""}
                  index={index}
                />
              </span>
            </button>
          );
        })}
      </div>

      <div className={`mb-14 mt-6 transition-opacity duration-700 ${ending ? "pointer-events-none opacity-0" : ""}`}>
        <CosmicButton
          variant="ghost"
          onClick={() => {
            audio.play("click");
            onNext();
          }}
        >
          {GALLERY_TEXT.button}
        </CosmicButton>
      </div>

      {active !== null && (
        <button
          type="button"
          onClick={() => setActive(null)}
          className="grain fixed inset-0 z-40 flex animate-[rise-in_0.8s_ease-out_both] flex-col items-center justify-center gap-5 bg-background/85 px-8 backdrop-blur-xl"
          style={{ boxShadow: "inset 0 0 160px 40px rgba(0,0,0,0.7)" }}
        >
          <div className="relative w-[70vw] max-w-xs animate-memory-open drop-shadow-[0_0_40px_rgba(240,210,160,0.25)]">
            <Polaroid
              src={CONFIG.photos[active] ?? ""}
              caption={CONFIG.captions[active] ?? ""}
              index={active}
            />
            {/* partikel halus */}
            {Array.from({ length: 8 }, (_, i) => (
              <span
                key={i}
                className="animate-pulse-soft pointer-events-none absolute h-1 w-1 rounded-full bg-accent"
                style={{
                  left: `${(i * 37) % 110 - 5}%`,
                  top: `${(i * 53) % 110 - 5}%`,
                  animationDelay: `${i * 0.4}s`,
                }}
              />
            ))}
            {/* detail rahasia di foto ke-3 (tidak diberi tanda) */}
            {active === 2 && (
              <span
                role="presentation"
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const id = ++sparkId.current;
                  audio.play("chime");
                  setSparks((p) => [...p, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
                  window.setTimeout(() => setSparks((p) => p.filter((sp) => sp.id !== id)), 1000);
                }}
                className="absolute right-[6%] top-[6%] h-12 w-12"
              >
                {sparks.map((sp) => (
                  <span key={sp.id} className="absolute" style={{ left: sp.x, top: sp.y }}>
                    {Array.from({ length: 6 }, (_, i) => {
                      const a = (i / 6) * Math.PI * 2;
                      return (
                        <span
                          key={i}
                          className="animate-burst absolute h-1 w-1 rounded-full bg-accent"
                          style={{ "--bx": `${Math.cos(a) * 18}px`, "--by": `${Math.sin(a) * 18}px` } as React.CSSProperties}
                        />
                      );
                    })}
                  </span>
                ))}
              </span>
            )}
          </div>
          <p className="animate-rise font-display text-xl italic text-foreground [animation-delay:700ms]">
            {CONFIG.captions[active]}
          </p>
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            tap untuk menutup
          </span>
        </button>
      )}

      {ending && <Constellation onDone={onNext} />}
    </Scene>
  );
}
