import { useEffect, useState } from "react";
import { Scene, ChapterMark } from "@/components/cosmic/Scene";
import { LETTER_TEXT } from "@/lib/birthday-config";
import { audio } from "@/lib/audio-engine";
import { LetterCard } from "./LetterCard";

const ORIGINS = [
  { x: "-60vw", y: "-30vh" },
  { x: "60vw", y: "-25vh" },
  { x: "-55vw", y: "35vh" },
  { x: "58vw", y: "32vh" },
];

/** Chapter 8: potongan menyatu, lalu surat kabur. */
export function Assembly({ onEscaped }: { onEscaped: () => void }) {
  const [arrived, setArrived] = useState(0);
  const [complete, setComplete] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [flying, setFlying] = useState(false);
  const [line, setLine] = useState<string | null>(null);

  useEffect(() => {
    const timers: number[] = [];
    ORIGINS.forEach((_, i) => {
      timers.push(
        window.setTimeout(() => {
          audio.play("paper");
          setArrived(i + 1);
        }, 600 + i * 800),
      );
    });
    timers.push(
      window.setTimeout(() => {
        audio.play("success");
        setComplete(true);
      }, 4200),
    );
    timers.push(window.setTimeout(() => setShaking(true), 7600));
    timers.push(
      window.setTimeout(() => {
        audio.play("whoosh");
        setShaking(false);
        setFlying(true);
        setLine("Eh...");
      }, 8800),
    );
    timers.push(window.setTimeout(() => setLine("HEY."), 9700));
    timers.push(window.setTimeout(() => setLine("Catch it."), 10600));
    timers.push(window.setTimeout(onEscaped, 12000));
    return () => timers.forEach(window.clearTimeout);
  }, [onEscaped]);

  return (
    <Scene speed={flying ? 0.8 : 0.06} density={1.1}>
      <ChapterMark index={8} />
      <div className={shaking ? "animate-shake" : ""}>
        <div className={flying ? "animate-fly-away" : ""}>
          <LetterCard sealed={!complete} className={complete ? "shadow-[var(--glow-gold)]" : ""} />
        </div>
      </div>

      {!flying && (
        <div className="pointer-events-none absolute inset-0">
          {ORIGINS.map((origin, i) => (
            <span
              key={i}
              className="absolute left-1/2 top-1/2 h-3 w-3 rounded-full bg-accent shadow-[var(--glow-gold)] transition-all duration-[1200ms] ease-out"
              style={{
                transform:
                  arrived > i
                    ? "translate(-50%, -50%) scale(0.2)"
                    : `translate(calc(-50% + ${origin.x}), calc(-50% + ${origin.y}))`,
                opacity: arrived > i ? 0 : 1,
              }}
            />
          ))}
        </div>
      )}

      <p
        className={`mt-10 font-display text-xl transition-opacity duration-1000 ${
          complete && !flying ? "opacity-100" : "opacity-0"
        }`}
      >
        {LETTER_TEXT.assembled}
      </p>

      {line && (
        <p className="animate-rise absolute bottom-[22vh] font-display text-3xl tracking-[0.2em] text-foreground">
          {line}
        </p>
      )}
    </Scene>
  );
}
