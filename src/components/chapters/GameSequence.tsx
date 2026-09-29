import { useMemo, useState } from "react";
import { Scene, ChapterMark } from "@/components/cosmic/Scene";
import { GameHeader, SealUnlocked } from "./GameShell";
import { audio } from "@/lib/audio-engine";

export function GameSequence({ onComplete }: { onComplete: () => void }) {
  const spots = useMemo(
    () =>
      [1, 2, 3, 4]
        .map((value) => ({
          value,
          x: 18 + Math.random() * 64,
          y: 15 + Math.random() * 68,
        }))
        .sort(() => Math.random() - 0.5),
    [],
  );
  const [next, setNext] = useState(1);
  const [wrong, setWrong] = useState(0);
  const [won, setWon] = useState(false);

  const tap = (value: number) => {
    if (value === next) {
      audio.play("click");
      if (value === 4) {
        audio.play("success");
        window.setTimeout(() => setWon(true), 900);
      }
      setNext(value + 1);
    } else {
      audio.play("paper");
      setWrong((w) => w + 1);
    }
  };

  return (
    <Scene speed={0.12} className="justify-start pt-16">
      <ChapterMark index={7} />
      <GameHeader title="Sedikit lagi." status={`urutkan 1 → 4`} />

      <div
        key={wrong}
        className="relative mt-8 h-[58vh] w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-white/[0.03]"
      >
        {spots.map((spot) => {
          const done = spot.value < next;
          return (
            <button
              key={spot.value}
              type="button"
              onClick={() => tap(spot.value)}
              className={`absolute grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border font-display text-2xl transition-all duration-700 ${
                done
                  ? "scale-125 border-accent bg-accent/20 text-accent opacity-0 shadow-[var(--glow-gold)]"
                  : "border-border bg-white/8 text-foreground"
              }`}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            >
              {spot.value}
            </button>
          );
        })}
      </div>

      {won && (
        <SealUnlocked index={4} text="Bagian terakhir ditemukan." onNext={onComplete} />
      )}
    </Scene>
  );
}
