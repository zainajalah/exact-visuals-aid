import { useEffect, useState } from "react";
import { Scene, ChapterMark } from "@/components/cosmic/Scene";
import { LETTER_TEXT } from "@/lib/birthday-config";
import { audio, setMood } from "@/lib/audio-engine";
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
  const [nudge, setNudge] = useState(0);
  const [burst, setBurst] = useState(false);

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
        setBurst(true);
        setMood(0.35, 2); // tenang sebelum kejutan
      }, 4200),
    );
    timers.push(window.setTimeout(() => setNudge(1), 8600));
    timers.push(window.setTimeout(() => setNudge(2), 9900));
    timers.push(
      window.setTimeout(() => {
        audio.play("whoosh");
        setMood(1, 1);
        setShaking(true);
        setFlying(true);
      }, 10700),
    );
    timers.push(window.setTimeout(() => setLine("Eh..."), 11200));
    timers.push(window.setTimeout(() => setLine("HEY."), 12100));
    timers.push(window.setTimeout(() => setLine("Catch it."), 13000));
    timers.push(window.setTimeout(onEscaped, 14400));
    return () => timers.forEach(window.clearTimeout);
  }, [onEscaped]);

  return (
    <Scene speed={flying ? 0.8 : 0.06} density={1.1}>
      <ChapterMark index={8} />
      <div className={shaking ? "animate-shake" : ""}>
        <div key={nudge} className={flying ? "animate-fly-away" : nudge ? "animate-nudge" : ""}>
          <div className={`transition-all duration-[2500ms] ${complete ? "-translate-y-3 drop-shadow-[0_24px_30px_rgba(0,0,0,0.55)]" : ""}`}>
          <LetterCard sealed={!complete} className={complete ? "shadow-[var(--glow-gold)]" : ""} />
          </div>
        </div>
      </div>

      {!flying && (
        <div className="pointer-events-none absolute inset-0">
          {burst && (
            <span className="animate-burst absolute left-1/2 top-1/2 h-40 w-40 rounded-full bg-accent/40 blur-xl" />
          )}
          {ORIGINS.flatMap((origin, i) => [0, 1, 2, 3, 4].map((j) => (
            <span
              key={`${i}-${j}`}
              className={`absolute left-1/2 top-1/2 rounded-full transition-all ease-out ${
                ["h-1.5 w-1.5 bg-foreground", "h-3 w-3 bg-accent/80 blur-[2px]", "h-2 w-2 bg-violet shadow-[0_0_10px_var(--violet)]", "h-1 w-1 bg-accent"][i]
              }`}
              style={{
                transitionDuration: "1200ms",
                transitionDelay: `${j * 90}ms`,
                transform:
                  arrived > i
                    ? "translate(-50%, -50%) scale(0.2)"
                    : `translate(calc(-50% + ${origin.x}), calc(-50% + ${origin.y}))`,
                opacity: arrived > i ? 0 : 1,
              }}
            />
          )))}
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
