import { useEffect, useState } from "react";
import { Scene, ChapterMark } from "@/components/cosmic/Scene";
import { GameHeader, SealUnlocked } from "./GameShell";
import { audio } from "@/lib/audio-engine";

type Planet = { id: number; x: number; y: number; size: number; hue: string };

const PLANET_TONES = [
  "bg-primary/70",
  "bg-accent/70",
  "bg-blush/60",
  "bg-violet",
  "bg-lavender/60",
  "bg-navy",
];

function makePlanets(): Planet[] {
  return Array.from({ length: 6 }, (_, id) => ({
    id,
    x: 12 + Math.random() * 74,
    y: 10 + Math.random() * 76,
    size: 34 + Math.random() * 26,
    hue: PLANET_TONES[id],
  }));
}

export function GameEnergy({ onComplete }: { onComplete: () => void }) {
  const [planets, setPlanets] = useState<Planet[]>(makePlanets);
  const [collected, setCollected] = useState(0);
  const [won, setWon] = useState(false);
  const energy = (collected / 6) * 100;

  useEffect(() => {
    if (collected === 6) {
      audio.play("success");
      const timer = window.setTimeout(() => setWon(true), 1200);
      return () => window.clearTimeout(timer);
    }
  }, [collected]);

  return (
    <Scene speed={0.14} className="justify-start pt-16">
      <ChapterMark index={6} />
      <GameHeader title="Isi energi." status={`${Math.round(energy)}%`} />

      <div className="relative mt-6 h-[54vh] w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-white/[0.03]">
        {planets.map((planet) => (
          <button
            key={planet.id}
            type="button"
            aria-label="planet"
            onClick={() => {
              audio.play("click");
              setPlanets((p) => p.filter((item) => item.id !== planet.id));
              setCollected((c) => c + 1);
            }}
            className="animate-drift absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform active:scale-90"
            style={{
              left: `${planet.x}%`,
              top: `${planet.y}%`,
              width: planet.size,
              height: planet.size,
              animationDelay: `${planet.id * 0.4}s`,
            }}
          >
            <span
              className={`block h-full w-full rounded-full ${planet.hue} shadow-[var(--glow-soft)]`}
            />
          </button>
        ))}
      </div>

      <div className="mt-6 w-full max-w-sm">
        <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-accent transition-all duration-700"
            style={{ width: `${energy}%` }}
          />
        </div>
        <div className="mt-4 flex justify-center">
          <span
            className={`font-display text-3xl transition-all duration-700 ${
              collected === 6 ? "scale-125 text-accent" : "text-muted-foreground"
            }`}
          >
            ⌁
          </span>
        </div>
      </div>

      {won && (
        <SealUnlocked index={3} text="Roketnya sudah siap." onNext={onComplete} />
      )}
    </Scene>
  );
}
