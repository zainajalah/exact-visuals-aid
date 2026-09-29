import { useEffect, useState } from "react";
import { Scene } from "@/components/cosmic/Scene";
import { ENDING_TEXT } from "@/lib/birthday-config";

export function Ending() {
  const [step, setStep] = useState(-1);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setZoom(true), 400),
      ...ENDING_TEXT.map((_, i) =>
        window.setTimeout(() => setStep(i), 1800 + i * 4200),
      ),
      window.setTimeout(() => setStep(ENDING_TEXT.length), 1800 + ENDING_TEXT.length * 4200),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, []);

  return (
    <Scene speed={0.05} density={1.6}>
      <div
        className={`pointer-events-none absolute left-1/2 top-[62%] -translate-x-1/2 rounded-full bg-violet/60 blur-[6px] transition-all duration-[9000ms] ease-out ${
          zoom ? "h-64 w-64 opacity-60" : "h-2 w-2 opacity-0"
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
      </div>
    </Scene>
  );
}
