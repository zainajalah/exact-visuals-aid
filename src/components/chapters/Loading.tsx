import { useEffect, useState } from "react";
import { OPENING_TEXT } from "@/lib/birthday-config";

export function Loading({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let value = 0;
    const timer = window.setInterval(() => {
      value = Math.min(100, value + Math.random() * 18 + 8);
      setProgress(value);
      if (value >= 100) {
        window.clearInterval(timer);
        window.setTimeout(onDone, 500);
      }
    }, 170);
    return () => window.clearInterval(timer);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background px-8">
      <p className="font-display text-xl italic text-muted-foreground">
        {OPENING_TEXT.loading}
      </p>
      <div className="h-px w-40 overflow-hidden bg-border">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
