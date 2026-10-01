import { useState } from "react";
import { Scene, ChapterMark, CosmicButton } from "@/components/cosmic/Scene";
import { LETTER_TEXT } from "@/lib/birthday-config";
import { audio } from "@/lib/audio-engine";

export function LetterScene({ onEnd }: { onEnd: () => void }) {
  const [open, setOpen] = useState(false);
  const [envelope, setEnvelope] = useState<"closed" | "opening" | "gone">("closed");

  const openEnvelope = () => {
    if (envelope !== "closed") return;
    audio.play("envelope");
    setEnvelope("opening");
    window.setTimeout(() => {
      audio.play("paper");
      setEnvelope("gone");
      setOpen(true);
    }, 1800);
  };

  const paragraphs = LETTER_TEXT.content.split(/\n\s*\n/);

  return (
    <Scene speed={0.03} density={0.7} className="justify-start py-14">
      <ChapterMark index={10} />
      {envelope !== "gone" && (
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-10">
          <button
            type="button"
            aria-label="buka amplop"
            onClick={openEnvelope}
            className="animate-drift relative h-44 w-64 cursor-pointer touch-manipulation [perspective:800px]"
          >
            {/* surat yang keluar */}
            <span
              className={`paper-surface absolute inset-x-4 top-3 h-36 rounded-sm transition-transform delay-500 duration-[1200ms] ${
                envelope === "opening" ? "-translate-y-24" : "translate-y-0"
              }`}
            />
            {/* badan amplop */}
            <span className="absolute inset-0 rounded-md bg-[color-mix(in_oklab,var(--paper,#efe4cf)_88%,black)] shadow-[0_24px_40px_-12px_rgba(0,0,0,0.7)]" />
            {/* tutup amplop */}
            <span
              className={`absolute inset-x-0 top-0 h-24 origin-top bg-[color-mix(in_oklab,var(--paper,#efe4cf)_80%,black)] transition-transform duration-700 [clip-path:polygon(0_0,100%_0,50%_100%)] ${
                envelope === "opening" ? "[transform:rotateX(180deg)]" : ""
              }`}
            />
            {/* segel */}
            <span
              className={`absolute left-1/2 top-[86px] h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[var(--glow-gold)] transition-all duration-500 ${
                envelope === "opening" ? "scale-150 opacity-0" : "animate-pulse-soft"
              }`}
            />
          </button>
          <p className={`text-[11px] uppercase tracking-[0.3em] text-muted-foreground transition-opacity ${envelope === "opening" ? "opacity-0" : ""}`}>
            tap untuk membuka
          </p>
        </div>
      )}
      <article
        className={`${envelope === "gone" ? "" : "hidden"} paper-surface w-[90vw] max-w-md rounded-lg px-6 py-9 transition-all duration-[1400ms] ${
          open ? "rotate-0 scale-100 opacity-100" : "-rotate-2 scale-95 opacity-0"
        }`}
      >
        <div className="max-h-[62vh] overflow-y-auto pr-1">
          {paragraphs.map((text, i) => (
            <p
              key={i}
              className="mb-5 whitespace-pre-line font-body text-[16px] leading-[1.9] text-ink"
            >
              {text}
            </p>
          ))}
        </div>
      </article>

      <div
        className={`mt-8 transition-opacity duration-1000 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <CosmicButton
          variant="ghost"
          onClick={() => {
            audio.play("click");
            onEnd();
          }}
        >
          Selesai membaca
        </CosmicButton>
      </div>
    </Scene>
  );
}
