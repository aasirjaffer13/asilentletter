import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type GameState = "idle" | "playing" | "over";

interface FallingItem {
  id: number;
  char: string;
  good: boolean;
  x: number;
  y: number;
  size: number;
  speed: number;
  rot: number;
  spin: number;
}

interface Popup {
  id: number;
  x: number;
  y: number;
  text: string;
  born: number;
}

const PETALS = ["🌸", "🌺", "🌷", "🌼", "🌹", "💐", "🌻"];
const BASKET = "🧺";

const BEST_KEY = "sf:petal-best";

function loadBest(): number {
  try {
    const v = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(v) && v > 0 ? v : 0;
  } catch {
    return 0;
  }
}

function saveBest(value: number) {
  try {
    localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // storage unavailable — best stays in memory
  }
}

export function PetalCatch({ onClose }: { onClose: () => void }) {
  const areaRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<FallingItem[]>([]);
  const popupsRef = useRef<Popup[]>([]);
  const basketXRef = useRef(0.5);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const elapsedRef = useRef(0);
  const spawnInRef = useRef(0.4);
  const nextIdRef = useRef(1);

  const [phase, setPhase] = useState<GameState>("idle");
  const [finalScore, setFinalScore] = useState(0);
  const [best, setBest] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);
  const [, setTick] = useState(0);

  useEffect(() => {
    setBest(loadBest());
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase !== "playing") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, phase]);

  const start = () => {
    itemsRef.current = [];
    popupsRef.current = [];
    basketXRef.current = 0.5;
    scoreRef.current = 0;
    livesRef.current = 3;
    elapsedRef.current = 0;
    spawnInRef.current = 0.4;
    setFinalScore(0);
    setPhase("playing");
  };

  useEffect(() => {
    if (phase !== "playing") return;
    let raf = 0;
    let last = 0;

    const step = (ts: number) => {
      const dt = Math.min((ts - (last || ts)) / 1000, 0.05);
      last = ts;
      elapsedRef.current += dt;

      const area = areaRef.current;
      const w = area?.clientWidth ?? 400;
      const h = area?.clientHeight ?? 420;
      const basketY = h - 58;
      const elapsed = elapsedRef.current;

      spawnInRef.current -= dt;
      if (spawnInRef.current <= 0) {
        spawnInRef.current = Math.max(0.22, 0.7 - elapsed * 0.018);
        const isWilted = Math.random() < Math.min(0.28, 0.15 + elapsed * 0.002);
        const size = 20 + Math.random() * 10;
        itemsRef.current.push({
          id: nextIdRef.current++,
          char: isWilted ? "🥀" : (PETALS[Math.floor(Math.random() * PETALS.length)] ?? "🌸"),
          good: !isWilted,
          x: 0.06 + Math.random() * 0.88,
          y: -size,
          size,
          speed:
            (95 + Math.min(170, elapsed * 2.8 + scoreRef.current)) * (0.85 + Math.random() * 0.3),
          rot: Math.random() * 360,
          spin: (Math.random() - 0.5) * 90,
        });
      }

      const catchTolerance = 46 / w;
      let lifeLost = false;
      const caught: { x: number; y: number; text: string; good: boolean }[] = [];

      const survivors: FallingItem[] = [];
      for (const item of itemsRef.current) {
        item.y += item.speed * dt;
        item.rot += item.spin * dt;

        if (item.y + item.size * 0.9 >= basketY && item.y + item.size <= basketY + 60) {
          if (Math.abs(item.x - basketXRef.current) < catchTolerance) {
            if (item.good) {
              scoreRef.current += 1;
              caught.push({ x: item.x, y: 0.86, text: "+1", good: true });
              continue;
            }
            livesRef.current -= 1;
            lifeLost = true;
            caught.push({ x: item.x, y: 0.86, text: "💔", good: false });
            continue;
          }
        }
        if (item.y > h + 50) continue;
        survivors.push(item);
      }
      itemsRef.current = survivors;

      const now = ts;
      for (const c of caught) {
        popupsRef.current.push({
          id: nextIdRef.current++,
          x: c.x,
          y: c.y,
          text: c.text,
          born: now,
        });
      }
      popupsRef.current = popupsRef.current.filter((p) => now - p.born < 700);

      if (lifeLost) setShakeKey((k) => k + 1);
      setTick((t) => (t + 1) % 1000000);

      if (livesRef.current <= 0) {
        const score = scoreRef.current;
        setFinalScore(score);
        setBest((b) => {
          if (score > b) {
            saveBest(score);
            return score;
          }
          return b;
        });
        setPhase("over");
        return;
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const moveBasket = (clientX: number) => {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    basketXRef.current = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    setTick((t) => (t + 1) % 1000000);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (phase !== "playing") return;
    if (e.key === "ArrowLeft") {
      basketXRef.current = Math.max(0, basketXRef.current - 0.07);
      setTick((t) => (t + 1) % 1000000);
    } else if (e.key === "ArrowRight") {
      basketXRef.current = Math.min(1, basketXRef.current + 0.07);
      setTick((t) => (t + 1) % 1000000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Catch the petals game"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-foreground/50 backdrop-blur-sm"
        aria-label="Close the game"
        onClick={phase === "playing" ? undefined : onClose}
      />
      <div className="animate-letter-open relative w-full max-w-lg border border-border/70 bg-parchment px-5 py-6 shadow-letter paper-texture grain">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground focus-ring"
          aria-label="Close the game"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">A little game</p>

        {phase !== "playing" && (
          <div className="mt-3 text-center">
            <h2 className="animate-ink font-hand text-3xl text-burgundy">Catch the petals</h2>
            <p className="mt-3 font-display text-sm leading-6 text-foreground/75 md:text-base">
              {phase === "idle"
                ? "Move the basket and catch the falling flowers. The 🥀 wilted ones cost a heart — nothing else can hurt you."
                : "The petals settled."}
            </p>
            <p className="mt-2 font-display text-sm italic text-muted-foreground">
              Drag with a finger or mouse — arrow keys work too.
            </p>
            <div className="mt-4 flex items-center justify-center gap-4 font-display text-sm text-muted-foreground">
              <span>
                Score: <span className="text-primary not-italic">{finalScore || 0}</span>
              </span>
              <span className="h-3 w-px bg-border" aria-hidden="true" />
              <span>
                Best: <span className="text-warm-gold not-italic">{best}</span>
              </span>
            </div>
            <div className="mt-5 flex justify-center gap-3">
              <Button variant="letter" size="lg" className="hover-scale" onClick={start}>
                {phase === "over" ? "Play again" : "Start"}
              </Button>
              <Button variant="delicate" size="lg" className="hover-scale" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}

        <div
          key={shakeKey}
          ref={areaRef}
          className={`relative mt-4 h-[420px] w-full touch-none select-none overflow-hidden rounded-lg border border-border/50 bg-gradient-to-b from-warm-gold/10 via-parchment to-muted-rose/15 ${
            phase === "playing" ? "cursor-none" : ""
          }`}
          role="application"
          aria-label="Game area"
          tabIndex={0}
          onPointerDown={(e) => {
            if (phase === "playing") moveBasket(e.clientX);
          }}
          onPointerMove={(e) => {
            if (phase === "playing") moveBasket(e.clientX);
          }}
          onKeyDown={onKeyDown}
        >
          {phase === "playing" && (
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-3 py-2 font-display text-sm">
              <span className="text-primary">🌸 {scoreRef.current}</span>
              <span aria-label={`${livesRef.current} hearts left`}>
                {Array.from({ length: 3 }, (_, i) => (
                  <span key={i} className={i < livesRef.current ? "" : "opacity-25"}>
                    💗
                  </span>
                ))}
              </span>
              <span className="text-warm-gold">★ {best}</span>
            </div>
          )}

          {phase === "playing" &&
            itemsRef.current.map((item) => (
              <span
                key={item.id}
                className="absolute leading-none"
                style={{
                  left: `${item.x * 100}%`,
                  top: `${item.y}px`,
                  fontSize: `${item.size}px`,
                  transform: `translateX(-50%) rotate(${item.rot}deg)`,
                }}
              >
                {item.char}
              </span>
            ))}

          {phase === "playing" &&
            popupsRef.current.map((p) => (
              <span
                key={p.id}
                className="animate-score-pop absolute font-display text-sm font-medium text-primary"
                style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
              >
                {p.text}
              </span>
            ))}

          {phase === "playing" && (
            <span
              className="absolute bottom-3 select-none text-[34px] leading-none"
              style={{ left: `${basketXRef.current * 100}%`, transform: "translateX(-50%)" }}
              aria-hidden="true"
            >
              {BASKET}
            </span>
          )}

          {phase !== "playing" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
              <span className="animate-float text-5xl opacity-70" aria-hidden="true">
                🌸
              </span>
              <span className="font-hand text-lg text-burgundy/80">
                {phase === "idle" ? "Thoda sa khel lo?" : `You caught ${finalScore} petals`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
