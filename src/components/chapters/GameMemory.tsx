import { useEffect, useMemo, useState } from "react";
import { Scene, ChapterMark } from "@/components/cosmic/Scene";
import { GameHeader, SealUnlocked } from "./GameShell";
import { audio } from "@/lib/audio-engine";

const SYMBOLS = ["★", "♥", "✦", "●"];

function shuffled() {
  return [...SYMBOLS, ...SYMBOLS]
    .map((symbol, i) => ({ id: i, symbol, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort);
}

export function GameMemory({ onComplete }: { onComplete: () => void }) {
  const cards = useMemo(shuffled, []);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    if (flipped.length !== 2) return;
    setLocked(true);
    const [a, b] = flipped as [number, number];
    const first = cards[a];
    const second = cards[b];
    if (!first || !second) return undefined;
    const same = first.symbol === second.symbol;
    const timer = window.setTimeout(
      () => {
        if (same) {
          audio.play("success");
          setMatched((m) => [...m, first.symbol]);
        }
        setFlipped([]);
        setLocked(false);
      },
      same ? 420 : 780,
    );
    return () => window.clearTimeout(timer);
  }, [flipped, cards]);

  useEffect(() => {
    if (matched.length === SYMBOLS.length) {
      const timer = window.setTimeout(() => setWon(true), 700);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [matched]);

  const reveal = (index: number) => {
    const card = cards[index];
    if (!card || locked || flipped.includes(index) || matched.includes(card.symbol))
      return;
    audio.play("click");
    setFlipped((f) => [...f, index]);
  };

  return (
    <Scene speed={0.1} className="justify-start pt-16">
      <ChapterMark index={5} />
      <GameHeader
        title="Yang satu ini harusnya familiar."
        status={`${matched.length} / ${SYMBOLS.length} pasangan`}
      />

      <div className="mt-10 grid w-full max-w-xs grid-cols-4 gap-3">
        {cards.map((card, index) => {
          const open = flipped.includes(index) || matched.includes(card.symbol);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => reveal(index)}
              className="aspect-3/4 cursor-pointer touch-manipulation [perspective:800px]"
              aria-label="kartu"
              data-card
              data-symbol={card.symbol}
            >
              <span
                className="relative block h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
                style={{ transform: open ? "rotateY(180deg)" : "none" }}
              >
                <span className="nebula absolute inset-0 grid place-items-center rounded-xl border border-border [backface-visibility:hidden]">
                  <span className="text-[10px] tracking-[0.2em] text-muted-foreground">
                    ✷
                  </span>
                </span>
                <span
                  className={`absolute inset-0 grid place-items-center rounded-xl border text-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                    matched.includes(card.symbol)
                      ? "border-accent bg-accent/15 text-accent shadow-[var(--glow-gold)]"
                      : "border-border bg-white/8 text-foreground"
                  }`}
                >
                  {card.symbol}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {won && (
        <SealUnlocked index={2} text="Bagian kedua ditemukan." onNext={onComplete} />
      )}
    </Scene>
  );
}
