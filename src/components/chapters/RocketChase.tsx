import { useEffect, useRef, useState } from "react";
import { Scene, ChapterMark } from "@/components/cosmic/Scene";
import { audio, setMood } from "@/lib/audio-engine";
import { SECRET_TEXT } from "@/lib/birthday-config";
import { FRAGMENT_TOTAL, clampFragments, journey } from "@/lib/journey-state";

/**
 * Chapter 9: kejar suratnya melintasi 6 zona (~90 detik).
 * Keyboard (WASD / panah) di desktop, joystick di HP.
 * Tabrakan asteroid mengurangi perisai, tidak pernah langsung kalah.
 * Kalau perisai habis, ulang dari checkpoint (awal zona) saja.
 */

const ZONES = [
  { name: "star field", start: 0, spawn: 0, rockSpeed: 0 },
  { name: "asteroid field", start: 14, spawn: 1.1, rockSpeed: 26 },
  { name: "comet pass", start: 32, spawn: 0.5, rockSpeed: 30 },
  { name: "nebula", start: 42, spawn: 0.45, rockSpeed: 30 },
  { name: "planetary system", start: 54, spawn: 1.2, rockSpeed: 36 },
  { name: "wormhole", start: 68, spawn: 0, rockSpeed: 0 },
  { name: "deep space", start: 80, spawn: 0, rockSpeed: 0 },
  { name: "final chase", start: 86, spawn: 1.3, rockSpeed: 42 },
] as const;
const REVEAL_START = 76; // semuanya berhenti, lalu galaksi
const CATCH_FROM = 100;
const LETTER_STOP = 104;
const END_T = 104;
const CHECKPOINT_NAMES: Record<number, string> = {
  14: "Checkpoint 1 · Asteroid Belt",
  42: "Checkpoint 2 · Nebula",
  68: "Checkpoint 3 · Wormhole",
  86: "Checkpoint 4 · Final Chase",
};
const FRAG_TIMES = [4, 9, 17, 24, 30, 37, 47, 57, 62, 66];

type Rock = { id: number; x: number; y: number; r: number; vx: number; vy: number; rot: number; comet?: boolean };
type Frag = { id: number; x: number; y: number };
type Burst = { id: number; x: number; y: number; tone: "gold" | "violet" | "red" };

function zoneAt(t: number) {
  let idx = 0;
  ZONES.forEach((z, i) => {
    if (t >= z.start) idx = i;
  });
  return idx;
}

export function RocketChase({ onCaught }: { onCaught: () => void }) {
  const [, setFrame] = useState(0);
  const [caughtLine, setCaughtLine] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [gate, setGate] = useState(0);
  const [gateFill, setGateFill] = useState(0);
  const [, setPing] = useState(0);

  const keys = useRef<Record<string, boolean>>({});
  const joystick = useRef({ dx: 0, dy: 0, active: false });
  const s = useRef({
    t: 0,
    rocket: { x: 18, y: 55 },
    vel: { x: 0, y: 0 },
    letter: { x: 90, y: 30 },
    thrust: 0,
    shields: 3,
    invuln: 0,
    slow: 0,
    rocks: [] as Rock[],
    frags: [] as Frag[],
    fragIdx: 0,
    collected: 0,
    collectedAtCheckpoint: 0,
    fragsTaken: 0,
    fragsTakenAtCheckpoint: 0,
    gating: false,
    bursts: [] as Burst[],
    spawnAcc: 0,
    checkpoint: 0,
    failing: false,
    caught: false,
    secret: { x: 130, found: false },
    zone: 0,
    revealed: false,
    id: 0,
  });

  useEffect(() => {
    journey.fragments = 0;
    journey.gates = 0;
    setMood(0.9);
    const down = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
      if (e.key.startsWith("Arrow")) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));

    const burst = (x: number, y: number, tone: Burst["tone"]) => {
      const st = s.current;
      const id = ++st.id;
      st.bursts.push({ id, x, y, tone });
      later(() => {
        st.bursts = st.bursts.filter((b) => b.id !== id);
      }, 950);
    };

    const flash = (msg: string, ms = 1600) => {
      setNotice(msg);
      later(() => setNotice((n) => (n === msg ? null : n)), ms);
    };

    // satu-satunya pintu untuk menambah energi: selalu dibatasi 0..10
    const award = (x: number, y: number) => {
      const st = s.current;
      burst(x, y, "violet");
      if (st.gating || st.collected >= FRAGMENT_TOTAL) {
        flash("COSMIC ENERGY FULL", 1200);
        return;
      }
      st.collected = clampFragments(st.collected + 1);
      st.fragsTaken += 1;
      journey.fragments = st.collected;
      audio.play("chime");
      setPing((p) => p + 1);
      if (st.collected >= FRAGMENT_TOTAL) startGate();
    };

    // 10/10 → gerbang kosmik: energi dipakai, lalu kembali ke 0
    const startGate = () => {
      const st = s.current;
      st.gating = true;
      flash("COSMIC ENERGY FULL", 1400);
      later(() => flash("ROCKET SYSTEM READY", 1400), 1500);
      later(() => {
        setGate(1);
        audio.play("wormhole");
        for (let i = 1; i <= FRAGMENT_TOTAL; i++) {
          later(() => {
            st.collected = clampFragments(FRAGMENT_TOTAL - i);
            journey.fragments = st.collected;
            setGateFill(i);
            audio.play("click");
          }, i * 160);
        }
      }, 3000);
      later(() => {
        setGate(2);
        audio.play("capture");
      }, 5000);
      later(() => {
        setGate(3);
        audio.play("whoosh");
        journey.gates += 1;
        flash("Gate open.", 1400);
      }, 6200);
      later(() => {
        setGate(0);
        setGateFill(0);
        st.gating = false;
      }, 7700);
    };

    const tick = (now: number) => {
      const st = s.current;
      const dtReal = Math.min(0.05, (now - last) / 1000);
      last = now;
      const fast = (window as unknown as { __FAST_CHASE?: number }).__FAST_CHASE ?? 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const toPx = (dx: number, dy: number) => Math.hypot((dx * w) / 100, (dy * h) / 100);

      if (!st.failing && !st.caught) st.t += dtReal * fast;
      const t = st.t;
      const zi = zoneAt(t);
      const zone = ZONES[zi]!;

      // suasana musik per zona
      if (zi !== st.zone) {
        st.zone = zi;
        if (CHECKPOINT_NAMES[zone.start]) {
          const label = CHECKPOINT_NAMES[zone.start]!;
          setNotice(label);
          later(() => setNotice((n) => (n === label ? null : n)), 1800);
        }
        if (zone.name === "final chase") {
          audio.play("whoosh");
          setMood(1.2, 1);
          setNotice("Not yet.");
          later(() => setNotice((n) => (n === "Not yet." ? null : n)), 1800);
        } else if (zone.name === "wormhole") {
          audio.play("wormhole");
          setMood(1.6, 6);
        } else if (zone.name === "deep space") {
          setMood(0.35, 3);
        } else {
          setMood(zi >= 4 ? 1.1 : 0.9);
        }
        if (CHECKPOINT_NAMES[zone.start] || zone.start === 0) {
          st.checkpoint = zone.start;
          st.collectedAtCheckpoint = st.collected;
          st.fragsTakenAtCheckpoint = st.fragsTaken;
        }
      }
      const revealing = t >= REVEAL_START && t < ZONES[6]!.start;
      if (revealing && !st.revealed) {
        st.revealed = true;
        setMood(0, 0.05); // hening sebentar
        later(() => setMood(0.45, 3), 1100);
      }

      // input
      const k = keys.current;
      let dx = joystick.current.dx;
      let dy = joystick.current.dy;
      if (k["arrowleft"] || k["a"]) dx -= 1;
      if (k["arrowright"] || k["d"]) dx += 1;
      if (k["arrowup"] || k["w"]) dy -= 1;
      if (k["arrowdown"] || k["s"]) dy += 1;
      const mag = Math.min(1, Math.hypot(dx, dy));
      st.thrust += (mag - st.thrust) * 0.15;

      if (revealing) {
        // kamera ditarik mundur, roket pelan menuju galaksi
        st.rocket.x += (38 - st.rocket.x) * 0.02;
        st.rocket.y += (58 - st.rocket.y) * 0.02;
      } else if (!st.failing && !st.caught) {
        st.slow = Math.max(0, st.slow - dtReal);
        const base = zone.name === "deep space" ? 34 : zone.name === "final chase" ? 64 : zi >= 4 ? 58 : 50;
        const speed = base * (st.slow > 0 ? 0.45 : 1);
        // sedikit inersia: akselerasi & deselerasi halus, tetap responsif
        st.vel.x += (dx * speed - st.vel.x) * 0.22;
        st.vel.y += (dy * speed - st.vel.y) * 0.22;
        st.rocket.x = Math.max(5, Math.min(92, st.rocket.x + st.vel.x * dtReal));
        st.rocket.y = Math.max(10, Math.min(80, st.rocket.y + st.vel.y * dtReal));
      }
      st.invuln = Math.max(0, st.invuln - dtReal);

      // surat
      if (zone.name === "deep space") {
        // terlihat, tapi masih jauh
        st.letter = { x: 80 + Math.sin(t * 0.5) * 4, y: 34 + Math.cos(t * 0.6) * 5 };
      } else if (zone.name === "final chase") {
        const k2 = Math.min(1, (t - ZONES[7]!.start) / (LETTER_STOP - ZONES[7]!.start));
        const wob = 1 - k2;
        st.letter = {
          x: 92 - k2 * 20 + Math.sin(t * 0.8) * 3 * wob,
          y: 36 + k2 * 8 + Math.cos(t * 0.7) * 6 * wob,
        };
      } else {
        st.letter = { x: 90 + Math.sin(t * 0.6) * 3, y: 22 + Math.cos(t * 0.8) * 10 };
      }

      // spawn asteroid (makin padat seiring waktu, tetap adil)
      if (zone.spawn > 0 && !st.failing) {
        const intensity = 1 + (t - zone.start) / 40;
        st.spawnAcc += dtReal * fast * zone.spawn * intensity;
        while (st.spawnAcc >= 1) {
          st.spawnAcc -= 1;
          // di zona komet & final: sebagian obstacle berupa komet diagonal
          if ((zone.name === "comet pass" || zone.name === "final chase") && Math.random() < 0.45) {
            st.rocks.push({
              id: ++st.id,
              x: 60 + Math.random() * 50,
              y: -8,
              r: 12,
              vx: -(20 + Math.random() * 25),
              vy: 30 + Math.random() * 20,
              rot: 0,
              comet: true,
            });
            continue;
          }
          const r = 10 + Math.random() * 26;
          st.rocks.push({
            id: ++st.id,
            x: 108,
            y: 12 + Math.random() * 68,
            r,
            vx: -(zone.rockSpeed + Math.random() * 12),
            vy: (Math.random() - 0.5) * 6,
            rot: Math.random() * 360,
          });
        }
      }
      // pecahan kosmik opsional
      while (st.fragIdx < FRAGS.length && t >= FRAGS[st.fragIdx]!.t) {
        st.frags.push({ id: ++st.id, x: 106, y: FRAGS[st.fragIdx]!.y });
        st.fragIdx++;
      }

      // LASER: Spasi / F di desktop, tombol LASER di HP
      st.fireCd = Math.max(0, st.fireCd - dtReal);
      if ((k[" "] || k["f"] || fireReq.current) && st.fireCd <= 0 && !st.failing && !st.caught && !revealing) {
        st.fireCd = 0.28;
        st.shots.push({ id: ++st.id, x: st.rocket.x + 4, y: st.rocket.y });
        audio.play("click");
      }
      st.shots.forEach((b) => (b.x += 140 * dtReal));
      st.shots = st.shots.filter((b) => {
        if (b.x > 105) return false;
        const target = st.rocks.find((r) => !r.comet && toPx(r.x - b.x, r.y - b.y) < r.r + 8);
        if (!target) return true;
        st.rocks = st.rocks.filter((r) => r !== target);
        burst(target.x, target.y, target.special ? "violet" : "gold");
        audio.play("hit");
        if (target.special) {
          // asteroid bercahaya: peluang pecahan + progres quest
          if (Math.random() < 0.6) st.frags.push({ id: ++st.id, x: target.x, y: target.y });
          if (zone.name === "asteroid field" && !st.questA.done) {
            st.questA.count += 1;
            if (st.questA.count >= 3) {
              st.questA.done = true;
              flash("Quest complete · +1");
              award(st.rocket.x, st.rocket.y);
            }
          }
        }
        return false;
      });

      // QUEST KABEL di nebula: terbang melewati relay 1 → 2 → 3
      if (zone.name === "nebula" && !st.cable.done) {
        if (!st.cable.active && t >= zone.start + 1.5) {
          st.cable.active = true;
          flash("Connect the relays · 1 → 2 → 3", 2200);
        }
        const node = CABLE_NODES[st.cable.step];
        if (st.cable.active && node && toPx(node.x - st.rocket.x, node.y - st.rocket.y) < 40) {
          st.cable.step += 1;
          audio.play("chime");
          burst(node.x, node.y, "violet");
          if (st.cable.step >= CABLE_NODES.length) {
            st.cable.done = true;
            audio.play("success");
            flash("Relay connected · +2");
            award(node.x, node.y);
            later(() => award(st.rocket.x, st.rocket.y), 350);
            later(() => (st.cable.active = false), 1200);
          }
        }
      } else if (zone.name !== "nebula" && st.cable.active && !st.cable.done) {
        st.cable.active = false; // waktu habis, jalan terus tanpa hukuman
      }

      // dummy loop untuk pecahan lama (dibiarkan kosong)
      while (false as boolean) {
        st.frags.push({ id: ++st.id, x: 106, y: 18 + ((st.fragIdx * 37) % 60) });
        st.fragIdx++;
      }

      const moveDt = dtReal * (revealing || zone.name === "deep space" ? 0.2 : 1);
      st.rocks.forEach((r) => {
        r.x += r.vx * moveDt;
        r.y += r.vy * moveDt;
        r.rot += 20 * moveDt;
      });
      st.rocks = st.rocks.filter((r) => r.x > -10 && r.y < 110);
      st.frags.forEach((f) => (f.x -= 16 * moveDt));
      st.frags = st.frags.filter((f) => f.x > -5);

      // tabrakan
      if (!st.failing && !st.caught && st.invuln <= 0) {
        const hit = st.rocks.find(
          (r) => toPx(r.x - st.rocket.x, r.y - st.rocket.y) < r.r + 12,
        );
        if (hit) {
          st.rocks = st.rocks.filter((r) => r !== hit);
          st.shields -= 1;
          st.invuln = 1.6;
          st.slow = 1.2;
          audio.play("hit");
          burst(hit.x, hit.y, "red");
          setShake((n) => n + 1);
          if (st.shields <= 0) {
            st.failing = true;
            setNotice("Almost there.");
            later(() => {
              st.t = st.checkpoint;
              st.fragIdx = FRAGS.filter((f) => f.t < st.checkpoint).length;
              // kembalikan energi & quest ke kondisi saat checkpoint (pecahan akan muncul lagi)
              st.collected = clampFragments(st.collectedAtCheckpoint);
              st.fragsTaken = st.fragsTakenAtCheckpoint;
              journey.fragments = st.collected;
              journey.gates = st.gatesAtCheckpoint;
              if (st.checkpoint <= ZONES[1]!.start) st.questA = { count: 0, done: false };
              if (st.checkpoint <= ZONES[3]!.start) st.cable = { step: 0, active: false, done: false };
              st.shots = [];
              st.rocks = [];
              st.frags = [];
              st.shields = 3;
              st.invuln = 2;
              st.rocket = { x: 18, y: 55 };
              st.failing = false;
              setNotice(null);
            }, 1900);
          }
        }
      }
      st.frags = st.frags.filter((f) => {
        if (toPx(f.x - st.rocket.x, f.y - st.rocket.y) < 34) {
          award(f.x, f.y);
          return false;
        }
        return true;
      });

      // planet rahasia
      if (zone.name === "planetary system") {
        st.secret.x = 112 - (t - zone.start) * 7;
        if (
          !st.secret.found &&
          toPx(st.secret.x - st.rocket.x, 16 - st.rocket.y) < 70
        ) {
          st.secret.found = true;
          audio.play("chime");
          setNotice(SECRET_TEXT.secretPlanet);
          later(() => setNotice((n) => (n === SECRET_TEXT.secretPlanet ? null : n)), 2600);
        }
      }

      // tangkap
      if (
        !st.caught &&
        t >= CATCH_FROM &&
        toPx(st.letter.x - st.rocket.x, st.letter.y - st.rocket.y) < 48
      ) {
        st.caught = true;
        audio.play("capture");
        st.rocks = [];
        setMood(0.3, 2);
        setCaughtLine("Got you.");
        later(() => setCaughtLine("Now..."), 2600);
        later(onCaught, 4600);
      }
      // jangan sampai terjebak: setelah END_T surat mendekat sendiri
      if (!st.caught && t > END_T + 8) {
        st.letter.x += (st.rocket.x - st.letter.x) * 0.05;
        st.letter.y += (st.rocket.y - st.letter.y) * 0.05;
      }

      setFrame((f) => (f + 1) % 1000000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(window.clearTimeout);
    };
  }, [onCaught]);

  const st = s.current;
  const t = st.t;
  const zone = ZONES[zoneAt(t)]!;
  const inWormhole = zone.name === "wormhole" && t < REVEAL_START;
  const revealing = t >= REVEAL_START && t < ZONES[6]!.start;
  const deep = zone.name === "deep space";
  const tilt = Math.max(-18, Math.min(18, st.vel.y * 0.35));
  const pullBack = t >= 44 && t < 48; // kamera mundur di nebula
  const progress = Math.min(1, t / END_T);
  const energy = clampFragments(st.collected);
  const cameraScale = pullBack ? 0.5 : revealing ? 1 + Math.max(0, 1 - (t - REVEAL_START) / 3) * 0.25 : 1;
  const bigRock = t >= 15 && t < 21 ? (t - 15) / 6 : null;
  const comet = t >= 33 && t < 37 ? (t - 33) / 4 : null;
  const planet = t >= 55 && t < 68 ? (t - 55) / 13 : null;
  const nebula = t >= 42 && t < 55;
  const galaxy = t >= REVEAL_START + 1;
  const flame = 0.5 + st.thrust * 1.2 + (inWormhole ? 1 : 0);

  return (
    <Scene
      speed={st.caught ? 0.08 : inWormhole ? 6 : revealing || deep ? 0.05 : 1.2 + zoneAt(t) * 0.15}
      density={deep || revealing ? 0.35 : 1.4}
      className="justify-start"
    >
      <ChapterMark index={9} />

      <div
        key={shake}
        className={`absolute inset-0 overflow-hidden ${shake ? "animate-shake" : ""}`}
        style={{
          filter: inWormhole ? "saturate(1.4) hue-rotate(-12deg)" : undefined,
        }}
      >
        <div
          className="absolute inset-0 transition-transform duration-[1800ms] ease-in-out"
          style={{
            transform: `scale(${cameraScale})${inWormhole ? ` skewX(${Math.sin(t * 3) * 2}deg)` : ""}`,
          }}
        >
          {/* latar parallax */}
          <div className="pointer-events-none absolute inset-0">
            {nebula && (
              <span className="absolute left-[-20%] top-[-10%] h-[120%] w-[140%] rounded-full bg-violet/25 blur-3xl transition-opacity duration-[3000ms]" />
            )}
            {planet !== null && (
              <span
                className="absolute top-[52%] h-[110vmin] w-[110vmin] rounded-full bg-navy shadow-[inset_-40px_-30px_80px_rgba(0,0,0,0.6),0_0_80px_rgba(170,150,255,0.25)]"
                style={{ left: `${100 - planet * 150}%` }}
              >
                <span className="absolute inset-[8%] rounded-full border border-primary/20" />
              </span>
            )}
            {galaxy && (
              <span
                data-galaxy
                className="absolute left-1/2 top-[42%] h-[90vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80 transition-opacity duration-[3000ms]"
                style={{
                  background:
                    "radial-gradient(circle, color-mix(in oklab, var(--accent) 70%, transparent) 0%, color-mix(in oklab, var(--violet) 45%, transparent) 25%, transparent 65%)",
                  transform: `translate(-50%, -50%) rotate(${t * 4}deg) scaleY(0.45)`,
                }}
              />
            )}
            {!deep && !revealing && (
              <>
                <span className="animate-drift absolute left-[12%] top-[18%] h-24 w-24 rounded-full bg-violet/30 blur-[2px]" />
                <span className="absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
              </>
            )}
          </div>

          {/* wormhole: bintang jadi garis cahaya (20 garis) */}
          {inWormhole && (
            <div className="pointer-events-none absolute inset-0">
              {Array.from({ length: 20 }, (_, i) => (
                <span
                  key={i}
                  className="animate-streak absolute left-0 h-px w-40 rounded-full bg-foreground/80"
                  style={{ top: `${(i * 53) % 100}%`, animationDelay: `${(i * 0.17) % 0.9}s` }}
                />
              ))}
            </div>
          )}

          {/* planet rahasia */}
          {zone.name === "planetary system" && (
            <span
              className={`pointer-events-none absolute top-[16%] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-700 ${
                st.secret.found
                  ? "scale-150 bg-accent shadow-[var(--glow-gold)]"
                  : "bg-[linear-gradient(135deg,var(--accent),var(--violet))] opacity-80"
              }`}
              style={{ left: `${st.secret.x}%` }}
            />
          )}

          {/* asteroid */}
          {st.rocks.map((r) => r.comet ? (
            <span
              key={r.id}
              data-rock
              className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground shadow-[0_0_14px_var(--accent)]"
              style={{ left: `${r.x}%`, top: `${r.y}%` }}
            >
              <span
                className="absolute right-1/2 top-1/2 h-1.5 w-28 origin-right rounded-full"
                style={{
                  transform: `translateY(-50%) rotate(${(Math.atan2(r.vy, r.vx) * 180) / Math.PI + 180}deg)`,
                  transformOrigin: "100% 50%",
                  background: "linear-gradient(90deg, transparent, var(--accent))",
                }}
              />
            </span>
          ) : (
            <span
              key={r.id}
              data-rock
              data-special={r.special ? "" : undefined}
              className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-[40%_55%_45%_60%] bg-secondary shadow-[inset_-4px_-4px_8px_rgba(0,0,0,0.5)] ${
                r.special ? "border-2 border-lavender/80 shadow-[0_0_18px_var(--lavender),inset_-4px_-4px_8px_rgba(0,0,0,0.5)]" : ""
              }`}
              style={{
                left: `${r.x}%`,
                top: `${r.y}%`,
                width: r.r * 2,
                height: r.r * 1.8,
                transform: `translate(-50%,-50%) rotate(${r.rot}deg)`,
              }}
            />
          ))}

          {/* laser */}
          {st.shots.map((b) => (
            <span
              key={b.id}
              className="pointer-events-none absolute h-[3px] w-8 -translate-y-1/2 rounded-full bg-lavender shadow-[0_0_10px_var(--lavender)]"
              style={{ left: `${b.x}%`, top: `${b.y}%` }}
            />
          ))}

          {/* quest kabel: relay yang harus disambung */}
          {st.cable.active && (
            <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {CABLE_NODES.slice(0, st.cable.step).map((n, i) => {
                const from = i === 0 ? null : CABLE_NODES[i - 1]!;
                return from ? (
                  <line key={i} x1={from.x} y1={from.y} x2={n.x} y2={n.y} stroke="var(--lavender)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" style={{ filter: "drop-shadow(0 0 4px var(--lavender))" }} />
                ) : null;
              })}
            </svg>
          )}
          {st.cable.active &&
            CABLE_NODES.map((n, i) => (
              <span
                key={i}
                data-relay={i}
                className={`pointer-events-none absolute grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 text-[10px] ${
                  i < st.cable.step
                    ? "border-lavender bg-lavender/30 text-lavender shadow-[0_0_20px_var(--lavender)]"
                    : i === st.cable.step
                      ? "animate-pulse-soft border-lavender/70 text-lavender"
                      : "border-border text-muted-foreground"
                }`}
                style={{ left: `${n.x}%`, top: `${n.y}%` }}
              >
                {i + 1}
              </span>
            ))}


          {/* pecahan kosmik: kristal cyan-violet berputar */}
          {st.frags.map((f) => (
            <span
              key={f.id}
              data-fragment
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${f.x}%`, top: `${f.y}%` }}
            >
              <span className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/50 blur-md" />
              <span
                className="block h-4 w-3 bg-gradient-to-b from-[oklch(0.9_0.12_200)] to-lavender shadow-[0_0_14px_oklch(0.85_0.14_200)]"
                style={{ clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)", animation: "orbit-spin 3s linear infinite" }}
              />
              <span className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2" style={{ animation: "orbit-spin 2s linear infinite" }}>
                <span className="absolute -top-1 left-1/2 h-1 w-1 rounded-full bg-lavender" />
              </span>
              <span className="absolute left-3 top-1/2 h-px w-6 -translate-y-1/2 bg-gradient-to-r from-lavender/60 to-transparent" />
            </span>
          ))}

          {/* ledakan kecil */}
          {st.bursts.map((b) => (
            <span key={b.id} className="pointer-events-none absolute" style={{ left: `${b.x}%`, top: `${b.y}%` }}>
              {Array.from({ length: 10 }, (_, i) => {
                const a = (i / 10) * Math.PI * 2;
                return (
                  <span
                    key={i}
                    className={`animate-burst absolute h-1.5 w-1.5 rounded-full ${
                      b.tone === "red" ? "bg-destructive" : b.tone === "gold" ? "bg-accent" : "bg-violet"
                    }`}
                    style={{ "--bx": `${Math.cos(a) * 40}px`, "--by": `${Math.sin(a) * 40}px` } as React.CSSProperties}
                  />
                );
              })}
            </span>
          ))}

          {/* surat */}
          <span
            data-letter
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-transform duration-500"
            style={{
              left: `${st.letter.x}%`,
              top: `${st.letter.y}%`,
              transform: `translate(-50%,-50%) scale(${t >= CATCH_FROM ? 1 : deep ? 0.7 : 0.55})`,
              opacity: planet !== null && Math.abs(st.letter.x - (100 - planet * 150 + 30)) < 25 ? 0.15 : 1,
            }}
          >
            <span className="paper-surface block h-10 w-14 rounded-[3px] shadow-[var(--glow-gold)]" />
            <span className="absolute left-full top-1/2 h-1 w-16 -translate-y-1/2 rounded-full bg-gradient-to-r from-accent/50 to-transparent blur-[2px]" />
          </span>

          {/* roket */}
          <span
            data-rocket
            className={`pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-opacity ${
              st.invuln > 0 && !revealing ? "opacity-60" : "opacity-100"
            }`}
            style={{ left: `${st.rocket.x}%`, top: `${st.rocket.y}%` }}
          >
            <span className="block transition-transform duration-150" style={{ transform: `rotate(${90 + tilt}deg)` }}>
              <svg viewBox="0 0 24 34" className="block h-9 w-7 drop-shadow-[0_0_10px_rgba(220,200,255,0.5)]">
                <path
                  d="M12 0c5 6 7.5 12 7.5 19 0 4-2 7-7.5 15C6.5 26 4.5 23 4.5 19 4.5 12 7 6 12 0Z"
                  className="fill-lavender"
                />
                <circle cx="12" cy="14" r="3" className="fill-navy" />
              </svg>
              <span
                className="absolute left-1/2 top-full w-1.5 -translate-x-1/2 rounded-full bg-accent/70 blur-[3px]"
                style={{ height: `${flame * 22}px` }}
              />
            </span>
          </span>

          {/* event sinematik di depan kamera */}
          {bigRock !== null && (
            <span
              className="pointer-events-none absolute top-[30%] z-30 h-[80vmin] w-[90vmin] rounded-[45%_55%_40%_60%] bg-secondary/95 blur-[1.5px] shadow-[inset_-30px_-30px_60px_rgba(0,0,0,0.6)]"
              style={{ left: `${110 - bigRock * 230}%`, transform: `rotate(${bigRock * 40}deg)` }}
            />
          )}
          {comet !== null && (
            <span
              className="pointer-events-none absolute z-20 h-2 w-[45vw] origin-right rounded-full"
              style={{
                left: `${110 - comet * 160}%`,
                top: `${8 + comet * 70}%`,
                transform: "rotate(-24deg)",
                background: "linear-gradient(90deg, transparent, var(--accent))",
                boxShadow: "0 0 24px var(--accent)",
              }}
            />
          )}
        </div>
      </div>

      {/* HUD halus */}
      <div className="pointer-events-none absolute top-[max(1rem,env(safe-area-inset-top))] left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-2">
        <div className="h-px w-32 bg-border">
          <div className="h-px bg-accent/80" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="flex flex-col items-center gap-1 whitespace-nowrap text-[10px] tracking-[0.3em] text-muted-foreground">
          <span aria-label="perisai">
            <span className="mr-2">SHIELD</span>
            {[0, 1, 2].map((i) => (
              <span key={i} className={i < st.shields ? "text-accent" : "opacity-30"}>
                ●
              </span>
            ))}
          </span>
          <span data-fragments className={energy >= FRAGMENT_TOTAL ? "text-lavender text-glow" : ""}>
            COSMIC ENERGY {energy}
            <span className="opacity-40"> / {FRAGMENT_TOTAL}</span>
          </span>
          <span className="flex gap-[3px]" aria-hidden>
            {Array.from({ length: FRAGMENT_TOTAL }, (_, i) => (
              <span
                key={i}
                className={`h-1.5 w-2 rounded-[1px] transition-all duration-300 ${
                  i < energy ? "bg-lavender shadow-[var(--glow-soft)]" : "bg-border"
                }`}
              />
            ))}
          </span>
        </div>
      </div>

      {/* gerbang kosmik */}
      {gate > 0 && (
        <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center">
          <div
            className="relative grid h-[60vmin] w-[60vmin] place-items-center rounded-full border-2 border-lavender/70 transition-all duration-[1500ms]"
            style={{
              boxShadow: gate >= 2 ? "0 0 80px var(--lavender), inset 0 0 80px var(--lavender)" : "var(--glow-soft)",
              transform: `scale(${gate >= 3 ? 2.6 : 1})`,
              opacity: gate >= 3 ? 0 : 1,
              animation: "orbit-spin 8s linear infinite",
            }}
          >
            {Array.from({ length: FRAGMENT_TOTAL }, (_, i) => {
              const a = (i / FRAGMENT_TOTAL) * Math.PI * 2;
              return (
                <span
                  key={i}
                  className="absolute h-3 w-2 rotate-45 bg-lavender shadow-[var(--glow-soft)] transition-all duration-700"
                  style={{
                    left: `calc(50% + ${Math.cos(a) * 30}vmin)`,
                    top: `calc(50% + ${Math.sin(a) * 30}vmin)`,
                    opacity: i < gateFill ? 1 : 0,
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {(notice || caughtLine) && (
        <p className="animate-rise pointer-events-none absolute top-[38%] z-40 w-full px-8 text-center font-display text-2xl tracking-[0.12em] text-foreground">
          {caughtLine ?? notice}
        </p>
      )}

      {quest && !st.caught && (
        <p className="pointer-events-none absolute top-[calc(max(1rem,env(safe-area-inset-top))+5.5rem)] z-40 w-full text-center text-[10px] tracking-[0.25em] text-lavender">
          {quest}
        </p>
      )}

      {!st.caught && !revealing && <Joystick joystick={joystick} />}
      {!st.caught && !revealing && (
        <button
          type="button"
          aria-label="laser"
          onPointerDown={(e) => {
            e.preventDefault();
            fireReq.current = true;
          }}
          onPointerUp={() => (fireReq.current = false)}
          onPointerLeave={() => (fireReq.current = false)}
          onPointerCancel={() => (fireReq.current = false)}
          className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-5 z-50 grid h-16 w-16 cursor-pointer touch-none select-none place-items-center rounded-full border border-lavender/40 bg-violet/30 text-[10px] tracking-[0.2em] text-lavender backdrop-blur-md active:scale-95"
        >
          LASER
        </button>
      )}
    </Scene>
  );
}

function Joystick({
  joystick,
}: {
  joystick: React.RefObject<{ dx: number; dy: number; active: boolean }>;
}) {
  const baseRef = useRef<HTMLDivElement | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const handle = (clientX: number, clientY: number) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const max = rect.width / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy) || 1;
    const clamped = Math.min(dist, max);
    dx = (dx / dist) * clamped;
    dy = (dy / dist) * clamped;
    setKnob({ x: dx, y: dy });
    joystick.current = { dx: dx / max, dy: dy / max, active: true };
  };

  const reset = () => {
    setKnob({ x: 0, y: 0 });
    joystick.current = { dx: 0, dy: 0, active: false };
  };

  return (
    <div
      ref={baseRef}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        if (touch) handle(touch.clientX, touch.clientY);
      }}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        if (touch) handle(touch.clientX, touch.clientY);
      }}
      onTouchEnd={reset}
      onPointerDown={(e) => handle(e.clientX, e.clientY)}
      onPointerMove={(e) => e.buttons === 1 && handle(e.clientX, e.clientY)}
      onPointerUp={reset}
      className="absolute bottom-[max(2rem,env(safe-area-inset-bottom))] left-1/2 z-40 h-32 w-32 -translate-x-1/2 touch-none rounded-full border border-border bg-white/5 backdrop-blur-md"
    >
      <span
        className="absolute left-1/2 top-1/2 h-12 w-12 rounded-full bg-primary/40 shadow-[var(--glow-soft)] transition-transform duration-75"
        style={{
          transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))`,
        }}
      />
    </div>
  );
}
