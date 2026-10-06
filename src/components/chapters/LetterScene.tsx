import { useState } from "react";
import { Scene, ChapterMark, CosmicButton } from "@/components/cosmic/Scene";
import { LETTER_TEXT } from "@/lib/birthday-config";
import { audio } from "@/lib/audio-engine";

type Phase = "closed" | "opening" | "paper" | "reading" | "closed-letter";

export function LetterScene({ onEnd }: { onEnd: () => void }) {
  const [phase, setPhase] = useState<Phase>("closed");

  const openEnvelope = () => {
    if (phase !== "closed") return;
    audio.play("envelope");
    setPhase("opening");
    window.setTimeout(() => {
      audio.play("paper");
      setPhase("paper");
    }, 2400);
    window.setTimeout(() => setPhase("reading"), 3600);
  };

  const closeLetter = () => {
    if (phase !== "reading") return;
    audio.play("paper");
    setPhase("closed-letter");
  };

  const paragraphs = LETTER_TEXT.content.split(/\n\s*\n/);
  const last = paragraphs.length - 1;
  const showEnvelope = phase === "closed" || phase === "opening";
  const paperIn = phase === "paper" || phase === "reading";

  return (
    <Scene speed={0.03} density={0.7} className="justify-start py-14">
      <ChapterMark index={10} />
      {showEnvelope && (
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-10">
          <button
            type="button"
            aria-label="buka amplop"
            onClick={openEnvelope}
            className="animate-drift relative h-44 w-64 cursor-pointer touch-manipulation rounded-md shadow-[0_0_60px_color-mix(in_oklab,var(--gold)_25%,transparent)] [perspective:800px]"
          >
            <span
              className={`paper-surface absolute inset-x-4 top-3 h-36 rounded-sm transition-transform delay-700 duration-[1600ms] ease-out ${
                phase === "opening" ? "-translate-y-28" : "translate-y-0"
              }`}
            />
            <span className="absolute inset-0 rounded-md bg-[color-mix(in_oklab,var(--paper)_88%,black)] shadow-[0_24px_40px_-12px_rgba(0,0,0,0.7)]" />
            <span
              className={`absolute inset-x-0 top-0 h-24 origin-top bg-[color-mix(in_oklab,var(--paper)_80%,black)] transition-transform duration-1000 [clip-path:polygon(0_0,100%_0,50%_100%)] ${
                phase === "opening" ? "[transform:rotateX(180deg)]" : ""
              }`}
            />
            <span
              className={`absolute left-1/2 top-[86px] h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[var(--glow-gold)] transition-all duration-700 ${
                phase === "opening" ? "scale-150 opacity-0" : "animate-pulse-soft"
              }`}
            />
          </button>
          <p className={`text-[11px] uppercase tracking-[0.3em] text-muted-foreground transition-opacity ${phase === "opening" ? "opacity-0" : ""}`}>
            tap untuk membuka
          </p>
        </div>
      )}

      {paperIn && (
        <div
          className="fixed inset-0 z-40 flex justify-center overflow-y-auto overscroll-contain bg-background/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLetter();
          }}
        >
          <button
            type="button"
            aria-label="tutup surat"
            onClick={closeLetter}
            className={`fixed left-4 top-[max(1rem,env(safe-area-inset-top))] z-50 grid h-11 w-11 place-items-center rounded-full border border-border bg-background/40 text-lg text-foreground/80 backdrop-blur-md transition-opacity duration-700 ${
              phase === "reading" ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            ×
          </button>
          <article
            data-letter-paper
            className={`paper-surface relative my-20 h-fit w-[90vw] max-w-xl rounded-xl px-6 py-10 transition-all duration-[1400ms] ease-out sm:px-12 sm:py-14 ${
              paperIn ? "translate-y-0 scale-100 opacity-100" : "translate-y-10 scale-95 opacity-0"
            }`}
            style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent 0 31px, color-mix(in oklab, var(--ink) 4%, transparent) 31px 32px)" }}
          >
            <div className="pointer-events-none absolute inset-3 rounded-lg border border-ink/10" />
            <div
              className={`relative transition-opacity duration-[1800ms] ${phase === "reading" ? "opacity-100" : "opacity-0"}`}
            >
              {paragraphs.map((text, i) => {
                const t = text.trim();
                const isFirst = i === 0;
                const isLast = i === last;
                const isMoment = t === "Jyujyur..." || t.startsWith("Damn, singkat");
                return (
                  <p
                    key={i}
                    className={`whitespace-pre-line text-ink ${
                      isFirst
                        ? "mb-8 font-display text-[26px] italic leading-snug sm:text-3xl"
                        : isMoment
                          ? "mb-6 font-display text-[19px] italic leading-[1.8] text-ink/80"
                          : isLast
                            ? "mt-10 font-display text-[19px] italic leading-[1.8]"
                            : "mb-6 font-body text-[16px] leading-[1.9] sm:text-[17px]"
                    }`}
                  >
                    {t}
                  </p>
                );
              })}
              <p className="mt-8 text-right font-display text-lg italic text-ink/60">— han ✦</p>
            </div>
          </article>
        </div>
      )}

      {phase === "closed-letter" && (
        <div className="animate-rise flex min-h-[70vh] flex-col items-center justify-center gap-8 text-center">
          <p className="font-display text-2xl italic">Suratnya akan selalu di sini.</p>
          <CosmicButton
            variant="ghost"
            onClick={() => {
              audio.play("click");
              onEnd();
            }}
          >
            Selesai membaca
          </CosmicButton>
          <button
            type="button"
            onClick={() => setPhase("reading")}
            className="min-h-11 text-[11px] uppercase tracking-[0.3em] text-muted-foreground"
          >
            baca lagi
          </button>
        </div>
      )}
    </Scene>
  );
}
