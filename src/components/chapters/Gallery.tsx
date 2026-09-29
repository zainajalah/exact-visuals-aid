import { useState } from "react";
import { Scene, ChapterMark, CosmicButton } from "@/components/cosmic/Scene";
import { CONFIG, GALLERY_TEXT } from "@/lib/birthday-config";
import { audio } from "@/lib/audio-engine";

const LAYOUT = [
  { top: "2%", left: "4%", tilt: "-7deg", delay: "0s" },
  { top: "14%", left: "52%", tilt: "6deg", delay: "0.8s" },
  { top: "38%", left: "16%", tilt: "3deg", delay: "1.6s" },
  { top: "56%", left: "54%", tilt: "-5deg", delay: "0.4s" },
  { top: "74%", left: "22%", tilt: "8deg", delay: "1.2s" },
];

function Polaroid({
  src,
  caption,
  index,
}: {
  src: string;
  caption: string;
  index: number;
}) {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(src) && !broken;
  return (
    <div className="paper-surface w-full rounded-[4px] p-2 pb-8">
      <div className="relative aspect-4/5 w-full overflow-hidden rounded-[2px] bg-secondary">
        {showImage ? (
          <img
            src={src}
            alt={caption}
            loading="lazy"
            onError={() => setBroken(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="nebula grid h-full w-full place-items-center text-center">
            <span className="px-2 text-[10px] uppercase tracking-[0.25em] text-foreground/80">
              foto {index + 1}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function Gallery({ onNext }: { onNext: () => void }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <Scene speed={0.09} className="justify-start pt-16">
      <ChapterMark index={2} />
      <header className="max-w-sm text-center">
        <h1 className="animate-rise font-display text-3xl">{GALLERY_TEXT.title}</h1>
        <p className="animate-rise mt-2 text-sm text-muted-foreground">
          {GALLERY_TEXT.subtitle}
        </p>
      </header>

      <div className="relative mt-8 h-[520px] w-full max-w-sm">
        {CONFIG.photos.slice(0, 5).map((src, index) => {
          const spot = LAYOUT[index] ?? LAYOUT[0]!;
          return (
            <button
              key={index}
              type="button"
              onClick={() => {
                audio.play("click");
                setActive(index);
              }}
              style={
                {
                  top: spot.top,
                  left: spot.left,
                  "--tilt": spot.tilt,
                  animationDelay: spot.delay,
                } as React.CSSProperties
              }
              className="animate-drift absolute w-[42%] transition-transform duration-500 active:scale-95"
            >
              <Polaroid
                src={src ?? ""}
                caption={CONFIG.captions[index] ?? ""}
                index={index}
              />
            </button>
          );
        })}
      </div>

      <div className="mb-14 mt-6">
        <CosmicButton
          variant="ghost"
          onClick={() => {
            audio.play("click");
            onNext();
          }}
        >
          {GALLERY_TEXT.button}
        </CosmicButton>
      </div>

      {active !== null && (
        <button
          type="button"
          onClick={() => setActive(null)}
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-5 bg-background/70 px-8 backdrop-blur-xl"
        >
          <div className="w-[70vw] max-w-xs animate-rise">
            <Polaroid
              src={CONFIG.photos[active] ?? ""}
              caption={CONFIG.captions[active] ?? ""}
              index={active}
            />
          </div>
          <p className="animate-rise font-display text-xl italic text-foreground">
            {CONFIG.captions[active]}
          </p>
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            tap untuk menutup
          </span>
        </button>
      )}
    </Scene>
  );
}
