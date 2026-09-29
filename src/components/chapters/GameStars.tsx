import { useCallback, useEffect, useRef, useState } from "react";
import { Scene, ChapterMark, CosmicButton } from "@/components/cosmic/Scene";
import { GameHeader, SealUnlocked } from "./GameShell";
import { audio } from "@/lib/audio-engine";

const TARGET = 7;
const TIME_LIMIT = 20;

export function GameStars({ onComplete }: { onComplete: () => void }) {
  const [caught, setCaught] = useState(0);
  const [time, setTime] = useState(TIME_LIMIT);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [state, setState] = useState<"play" | "fail" | "win">("play");
  const [burst, setBurst] = useState<{ x: number; y: number; id: number } | null>(null);
  const burstId = useRef(0);

  const move = useCallback(() => {
    setPos({ x: 12 + Math.random() * 76, y: 12 + Math.random() * 76 });
  }, []);

  useEffect(() => {
    if (state !== "play") return;
    const timer = window.setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          window.clearInterval(timer);
          setState("fail");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [state]);

  const tap = () => {
    audio.play("click");
    burstId.current += 1;
    setBurst({ x: pos.x, y: pos.y, id: burstId.current });
    const next = caught + 1;
    setCaught(next);
    if (next >= TARGET) {
      audio.play("success");
      setState("win");
    } else {
      move();
    }
  };

  const retry = () => {
    setCaught(0);
    setTime(TIME_LIMIT);
    setState("play");
    move();
  };

  return (
    <Scene speed={0.18} className="justify-start pt-16">
      <ChapterMark index={4} />
      <GameHeader
        title="Tangkap bintang."
        status={`${caught} / ${TARGET} — ${time}s`}
      />

      <div className="relative mt-8 h-[60vh] w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-white/[0.03] backdrop-blur-[2px]">
        {burst && (
          <span
            key={burst.id}
            className="pointer-events-none absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/30 blur-xl"
            style={{
              left: `${burst.x}%`,
              top: `${burst.y}%`,
              animation: "pulse-soft 0.6s ease-out forwards",
            }}
          />
        )}
        {state === "play" && (
          <button
            type="button"
            onClick={tap}
            aria-label="bintang"
            className="absolute grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-manipulation place-items-center rounded-full transition-all duration-300"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <span className="absolute h-14 w-14 rounded-full bg-primary/25 blur-lg" />
            <span className="relative font-display text-3xl text-accent">✦</span>
          </button>
        )}
        {state === "fail" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
            <p className="font-display text-xl">Tenang, coba lagi.</p>
            <CosmicButton onClick={retry}>Coba lagi</CosmicButton>
          </div>
        )}
      </div>

      {state === "win" && (
        <SealUnlocked index={1} text="Bagian pertama ditemukan." onNext={onComplete} />
      )}
    </Scene>
  );
}
