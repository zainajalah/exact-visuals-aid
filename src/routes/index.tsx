import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Loading } from "@/components/chapters/Loading";
import { Intro } from "@/components/chapters/Intro";
import { Gallery } from "@/components/chapters/Gallery";
import { LockedLetter } from "@/components/chapters/LockedLetter";
import { GameStars } from "@/components/chapters/GameStars";
import { GameMemory } from "@/components/chapters/GameMemory";
import { GameEnergy } from "@/components/chapters/GameEnergy";
import { GameSequence } from "@/components/chapters/GameSequence";
import { Assembly } from "@/components/chapters/Assembly";
import { RocketChase } from "@/components/chapters/RocketChase";
import { LetterScene } from "@/components/chapters/LetterScene";
import { Ending } from "@/components/chapters/Ending";
import { CONFIG } from "@/lib/birthday-config";
import { audio, setMood, setMusicVolume } from "@/lib/audio-engine";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The 20th Chapter — untuk Ericha" },
      {
        name: "description",
        content:
          "Perjalanan ulang tahun interaktif: kenangan, surat terkunci, mini-game, dan kejar-kejaran melintasi alam semesta.",
      },
      { property: "og:title", content: "The 20th Chapter — untuk Ericha" },
      {
        property: "og:description",
        content:
          "Sebuah perjalanan kecil dari bumi ke alam semesta, dibuat khusus untuk satu orang.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Journey,
});

type Stage =
  | "loading"
  | "intro"
  | "gallery"
  | "locked"
  | "game1"
  | "game2"
  | "game3"
  | "game4"
  | "assembly"
  | "chase"
  | "letter"
  | "ending";

function Journey() {
  const [stage, setStage] = useState<Stage>((typeof window !== "undefined" && (new URLSearchParams(window.location.search).get("s") as Stage)) || "loading");
  const [seals, setSeals] = useState(0);
  const [muted, setMuted] = useState(false);

  // suasana musik per bab (satu file musik: volume diatur halus)
  useEffect(() => {
    const moods: Partial<Record<Stage, number>> = {
      intro: 0.7, gallery: 0.85, locked: 0.7, game1: 1, game2: 1, game3: 1, game4: 1, letter: 0.6,
    };
    const m = moods[stage];
    if (m !== undefined) setMood(m, 2.5);
  }, [stage]);

  const start = useCallback(() => {
    setMusicVolume(CONFIG.musicVolume);
    audio.play("click");
    audio.start(CONFIG.music, CONFIG.musicVolume);
    setStage("gallery");
  }, []);

  const finishGame = (next: Stage) => {
    setSeals((s) => s + 1);
    setStage(next);
  };

  return (
    <main className="relative min-h-[100dvh] w-full overflow-x-hidden">
      {stage === "loading" && <Loading onDone={() => setStage("intro")} />}
      {stage === "intro" && <Intro onStart={start} />}
      {stage === "gallery" && <Gallery onNext={() => setStage("locked")} />}
      {stage === "locked" && (
        <LockedLetter unlocked={seals} onStart={() => setStage("game1")} />
      )}
      {stage === "game1" && <GameStars onComplete={() => finishGame("game2")} />}
      {stage === "game2" && <GameMemory onComplete={() => finishGame("game3")} />}
      {stage === "game3" && <GameEnergy onComplete={() => finishGame("game4")} />}
      {stage === "game4" && <GameSequence onComplete={() => finishGame("assembly")} />}
      {stage === "assembly" && <Assembly onEscaped={() => setStage("chase")} />}
      {stage === "chase" && <RocketChase onCaught={() => setStage("letter")} />}
      {stage === "letter" && <LetterScene onEnd={() => setStage("ending")} />}
      {stage === "ending" && <Ending />}

      {stage !== "loading" && (
        <button
          type="button"
          aria-label="mute"
          onClick={() => setMuted(audio.toggleMute())}
          className="fixed right-4 top-[max(1rem,env(safe-area-inset-top))] z-[100] grid h-11 w-11 place-items-center rounded-full border border-border bg-white/5 text-sm backdrop-blur-md"
        >
          {muted ? "🔇" : "🔊"}
        </button>
      )}
    </main>
  );
}
