import { useEffect, useState } from "react";
import { Scene } from "@/components/cosmic/Scene";
import { ENDING_TEXT, SECRET_TEXT } from "@/lib/birthday-config";
import { audio, setMood } from "@/lib/audio-engine";
import { FRAGMENT_TOTAL, journey } from "@/lib/journey-state";

export function Ending() {
  const [step, setStep] = useState(-1);
  const [zoom, setZoom] = useState(false);
  const [dark, setDark] = useState(false);
  const [secret, setSecret] = useState(-1);

  useEffect(() => {
    setMood(0.8, 3);
    const doneAt = 1800 + ENDING_TEXT.length * 4200;
    const timers = [
      window.setTimeout(() => setZoom(true), 400),
      ...ENDING_TEXT.map((_, i) =>
        window.setTimeout(() => setStep(i), 1800 + i * 4200),
      ),
      window.setTimeout(() => setStep(ENDING_TEXT.length), doneAt),
      window.setTimeout(() => {
        setDark(true);
        setMood(0.25, 4);
      }, doneAt + 2500),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, []);

  const lines = [
    SECRET_TEXT.finalStar[0],
    SECRET_TEXT.finalStar[1],
    SECRET_TEXT.finalMessage,
    ...(journey.fragments >= FRAGMENT_TOTAL ? [SECRET_TEXT.allFragments] : []),
  ];

  const tapStar = () => {
    if (secret !== -1) return;
    audio.play("chime");
    lines.forEach((_, i) => window.setTimeout(() => setSecret(i), i * 3200));
    window.setTimeout(() => setSecret(99), lines.length * 3200 + 1500);
  };

  return (
    <Scene speed={0.05} density={dark ? 0.3 : 1.6}>
      <div
        className={`pointer-events-none absolute left-1/2 top-[62%] -translate-x-1/2 rounded-full bg-violet/60 blur-[6px] transition-all duration-[9000ms] ease-out ${
          zoom && !dark ? "h-64 w-64 opacity-60" : "h-2 w-2 opacity-0"
        }`}
      />
      <div
        className={`pointer-events-none fixed inset-0 bg-background transition-opacity duration-[4000ms] ${
          dark && secret !== 99 ? "opacity-90" : "opacity-0"
        }`}
      />
      <div className="relative z-10 flex min-h-[40vh] items-center justify-center px-8 text-center">
        {ENDING_TEXT.map((text, i) => (
          <p
            key={i}
            className={`absolute transition-all duration-[2000ms] ${
              step === i ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            } ${
              i === 0
                ? "text-glow font-display text-6xl"
                : i === ENDING_TEXT.length - 1
                  ? "font-body text-xs tracking-[0.3em] text-muted-foreground"
                  : "font-display text-2xl leading-relaxed"
            }`}
          >
            {text}
          </p>
        ))}
        {lines.map((text, i) => (
          <p
            key={`s${i}`}
            className={`absolute font-display text-lg italic transition-opacity duration-[1500ms] ${
              secret === i ? "opacity-100" : "opacity-0"
            } ${i >= 2 ? "text-sm not-italic tracking-[0.1em] text-muted-foreground" : ""}`}
          >
            {text}
          </p>
        ))}
      </div>

      {/* satu bintang kecil yang tersisa */}
      {dark && secret !== 99 && (
        <button
          type="button"
          aria-label="bintang terakhir"
          onClick={tapStar}
          className="animate-drift fixed left-[58%] top-[30%] z-20 grid h-11 w-11 place-items-center"
          style={{ animationDuration: "14s" }}
        >
          <span className="animate-pulse-soft block h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
        </button>
      )}
    </Scene>
  );
}
