export function LetterCard({
  sealed = true,
  className = "",
}: {
  sealed?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`paper-surface relative mx-auto aspect-3/2 w-[72vw] max-w-[320px] rounded-md ${className}`}
    >
      <div className="absolute inset-3 rounded-sm border border-ink/15" />
      <div className="absolute inset-x-8 top-8 space-y-2 opacity-25">
        {[100, 92, 78, 88, 60].map((w, i) => (
          <div key={i} className="h-[3px] rounded-full bg-ink" style={{ width: `${w}%` }} />
        ))}
      </div>
      <div
        className={`absolute bottom-4 left-1/2 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full ${
          sealed ? "bg-violet shadow-[var(--glow-soft)]" : "bg-accent shadow-[var(--glow-gold)]"
        }`}
      >
        <span className="font-display text-sm text-paper">20</span>
      </div>
    </div>
  );
}

export function SealDots({ unlocked }: { unlocked: number }) {
  return (
    <div className="flex items-center gap-3">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          data-seal-state={unlocked >= 4 ? "final" : i < unlocked ? "completed" : i === unlocked ? "discovered" : "locked"}
          className={`h-3 w-3 rounded-full border transition-all duration-700 ${
            unlocked >= 4
              ? "border-accent bg-transparent shadow-[var(--glow-gold)] [clip-path:polygon(0_0,45%_0,55%_50%,45%_100%,0_100%,0_0,55%_0,100%_0,100%_100%,60%_100%,50%_50%,60%_0)]"
              : i < unlocked
                ? `border-accent bg-accent shadow-[var(--glow-gold)] ${i === unlocked - 1 ? "animate-seal-pop" : ""}`
                : i === unlocked
                  ? "animate-pulse-soft border-accent/70 bg-accent/20 shadow-[0_0_10px_color-mix(in_oklab,var(--accent)_50%,transparent)]"
                  : "border-border bg-transparent opacity-50"
          }`}
        />
      ))}
    </div>
  );
}
