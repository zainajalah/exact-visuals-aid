import { Scene, ChapterMark, CosmicButton } from "@/components/cosmic/Scene";
import { LETTER_TEXT } from "@/lib/birthday-config";
import { audio } from "@/lib/audio-engine";
import { LetterCard, SealDots } from "./LetterCard";

export function LockedLetter({
  unlocked,
  onStart,
}: {
  unlocked: number;
  onStart: () => void;
}) {
  return (
    <Scene speed={0.04} density={0.8}>
      <ChapterMark index={3} />
      <div className="animate-rise flex flex-col items-center gap-8 text-center">
        <LetterCard className="animate-drift" />
        <div className="max-w-xs space-y-3">
          <h1 className="font-display text-2xl">{LETTER_TEXT.lockedTitle}</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {LETTER_TEXT.lockedHint}
          </p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <SealDots unlocked={unlocked} />
          <span className="text-[11px] tracking-[0.3em] text-muted-foreground">
            {unlocked} / 4
          </span>
        </div>
        <CosmicButton
          onClick={() => {
            audio.play("click");
            onStart();
          }}
        >
          {unlocked === 0 ? LETTER_TEXT.startButton : "Lanjut"}
        </CosmicButton>
      </div>
    </Scene>
  );
}
