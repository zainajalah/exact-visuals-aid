import { useEffect, useState } from "react";
import { Scene, ChapterMark, CosmicButton } from "@/components/cosmic/Scene";
import { LETTER_TEXT } from "@/lib/birthday-config";
import { audio } from "@/lib/audio-engine";

export function LetterScene({ onEnd }: { onEnd: () => void }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      audio.play("paper");
      setOpen(true);
    }, 900);
    return () => window.clearTimeout(timer);
  }, []);

  const paragraphs = LETTER_TEXT.content.split(/\n\s*\n/);

  return (
    <Scene speed={0.03} density={0.7} className="justify-start py-14">
      <ChapterMark index={10} />
      <article
        className={`paper-surface w-[90vw] max-w-md rounded-lg px-6 py-9 transition-all duration-[1400ms] ${
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
        className={`mt-8 transition-opacity duration-1000 ${open ? "opacity-100" : "opacity-0"}`}
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
