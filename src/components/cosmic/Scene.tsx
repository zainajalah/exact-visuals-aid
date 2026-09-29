import type { ReactNode } from "react";
import { Starfield } from "./Starfield";

export function Scene({
  children,
  speed = 0.12,
  density = 1,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  density?: number;
  className?: string;
}) {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-background">
      <div className="nebula pointer-events-none absolute inset-0 opacity-70" />
      <Starfield speed={speed} density={density} />
      <div
        className={`safe-pad relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-center px-5 ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

export function ChapterMark({ index }: { index: number }) {
  return (
    <span className="pointer-events-none absolute left-5 top-[max(1rem,env(safe-area-inset-top))] z-20 font-body text-[11px] tracking-[0.35em] text-muted-foreground/70">
      {String(index).padStart(2, "0")}
    </span>
  );
}

export function CosmicButton({
  children,
  onClick,
  variant = "solid",
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: "solid" | "ghost";
}) {
  const base =
    "min-h-[48px] rounded-full px-7 text-sm tracking-[0.12em] uppercase transition-all duration-500 active:scale-[0.97]";
  const styles =
    variant === "solid"
      ? "bg-primary/90 text-primary-foreground shadow-[var(--glow-soft)] hover:bg-primary"
      : "border border-border bg-white/5 text-foreground backdrop-blur-sm hover:bg-white/10";
  return (
    <button type="button" onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}
