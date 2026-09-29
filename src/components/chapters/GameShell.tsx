import type { ReactNode } from "react";
import { CosmicButton } from "@/components/cosmic/Scene";

export function GameHeader({
  title,
  status,
}: {
  title: string;
  status: ReactNode;
}) {
  return (
    <header className="animate-rise w-full max-w-sm text-center">
      <h1 className="font-display text-2xl">{title}</h1>
      <div className="mt-2 text-[11px] tracking-[0.3em] text-muted-foreground">
        {status}
      </div>
    </header>
  );
}

export function SealUnlocked({
  index,
  text,
  onNext,
}: {
  index: number;
  text: string;
  onNext: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-background/80 px-8 text-center backdrop-blur-lg">
      <div className="animate-rise grid h-20 w-20 place-items-center rounded-full bg-accent/90 shadow-[var(--glow-gold)]">
        <span className="font-display text-2xl text-accent-foreground">{index}</span>
      </div>
      <p className="animate-rise text-[11px] uppercase tracking-[0.35em] text-accent">
        seal {index} unlocked
      </p>
      <p className="animate-rise font-display text-xl">{text}</p>
      <CosmicButton onClick={onNext}>Lanjut</CosmicButton>
    </div>
  );
}
