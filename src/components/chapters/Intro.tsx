import { useEffect, useState } from "react";
import { Scene, ChapterMark, CosmicButton } from "@/components/cosmic/Scene";
import { OPENING_TEXT, SECRET_TEXT } from "@/lib/birthday-config";
import { audio } from "@/lib/audio-engine";

export function Intro({ onStart }: { onStart: () => void }) {
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [secret, setSecret] = useState(-1);

  const findSecret = () => {
    if (secret !== -1) return;
    audio.play("chime");
    setSecret(0);
    window.setTimeout(() => setSecret(1), 2400);
    window.setTimeout(() => setSecret(2), 5200);
  };

  useEffect(() => {
    const timers = [600, 1800, 2800, 3600].map((delay, index) =>
      window.setTimeout(() => setStep(index + 1), delay),
    );
    return () => timers.forEach(window.clearTimeout);
  }, []);

  return (
    <Scene speed={0.06} density={1.2}>
      <ChapterMark index={1} />
      {/* bintang yang sedikit berbeda (rahasia) */}
      <button
        type="button"
        aria-label="bintang"
        onClick={findSecret}
        className="absolute right-[14%] top-[22%] z-20 grid h-11 w-11 place-items-center"
      >
        <span className="animate-pulse-soft block h-1 w-1 rounded-full bg-accent/90 shadow-[0_0_6px_var(--accent)]" />
      </button>
      <div
        className={`pointer-events-none fixed inset-0 z-30 grid place-items-center bg-background/50 px-8 text-center transition-opacity duration-1000 ${
          secret === 0 || secret === 1 ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="font-display text-xl italic">
          {secret >= 0 ? SECRET_TEXT.openingStar[Math.min(secret, 1)] : ""}
        </p>
      </div>
      <div
        className={`flex flex-col items-center transition-all duration-1000 ${
          leaving ? "scale-125 opacity-0 blur-sm" : "scale-100 opacity-100"
        }`}
      >
        <div className="relative grid h-[min(78vw,320px)] w-[min(78vw,320px)] place-items-center">
          <div
            className="absolute inset-0 rounded-full border border-border/70"
            style={{
              animation: `orbit-spin ${leaving ? 14 : 48}s linear infinite`,
            }}
          >
            <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-accent shadow-[var(--glow-gold)]" />
          </div>
          <div
            className="absolute inset-8 rounded-full border border-border/40"
            style={{
              animation: `orbit-spin ${leaving ? 9 : 34}s linear infinite reverse`,
            }}
          >
            <span className="absolute left-0 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-primary" />
          </div>

          <span
            className={`text-glow font-display text-[26vw] leading-none transition-all duration-[1600ms] sm:text-[8rem] ${
              step >= 1 ? "scale-100 opacity-100" : "scale-[0.8] opacity-0"
            }`}
          >
            {OPENING_TEXT.age}
          </span>
        </div>

        <p
          className={`mt-2 font-display text-3xl tracking-[0.3em] transition-all duration-1000 ${
            step >= 2 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          {OPENING_TEXT.name}
        </p>
        <p
          className={`mt-4 text-sm tracking-[0.18em] text-muted-foreground transition-all duration-1000 ${
            step >= 3 ? "opacity-100" : "opacity-0"
          }`}
        >
          {OPENING_TEXT.greeting}
        </p>

        <div
          className={`mt-14 transition-all duration-1000 ${
            step >= 4
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none translate-y-4 opacity-0"
          }`}
        >
          <CosmicButton
            onClick={() => {
              if (leaving) return;
              audio.play("click");
              setLeaving(true);
              window.setTimeout(onStart, 900);
            }}
          >
            {OPENING_TEXT.button}
          </CosmicButton>
        </div>
      </div>
    </Scene>
  );
}
