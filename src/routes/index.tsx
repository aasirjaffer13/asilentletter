import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  Music2,
  Pause,
  Play,
  Upload,
  Heart,
  Sparkles,
  Flower2,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PetalCatch } from "@/components/PetalCatch";
import {
  chapters,
  siteMeta,
  type Chapter,
  originalLetter,
  secretSeventeenth,
} from "@/content/letter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: siteMeta.title },
      { name: "description", content: siteMeta.description },
      { property: "og:title", content: siteMeta.ogTitle },
      { property: "og:description", content: siteMeta.ogDescription },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LetterWorld,
});

/* ============================================================
   PETAL SYSTEM - Persistent floating flowers/petals
   Uses CSS animations only, no React state updates
   ============================================================ */

const PETAL_TYPES = [
  { char: "🌸", weight: 5 },
  { char: "🌺", weight: 3 },
  { char: "🌷", weight: 3 },
  { char: "💐", weight: 2 },
  { char: "🌹", weight: 3 },
  { char: "🌻", weight: 2 },
  { char: "🌼", weight: 2 },
  { char: "🌿", weight: 2 },
  { char: "🍃", weight: 2 },
  { char: "🍂", weight: 2 },
  { char: "🥀", weight: 3 },
  { char: "✨", weight: 2 },
  { char: "💧", weight: 1 },
] as const;

const FALLING_LEAVES = [
  { char: "🍂", weight: 3 },
  { char: "🍃", weight: 2 },
  { char: "🌿", weight: 2 },
  { char: "🥀", weight: 4 },
] as const;

/* Deterministic PRNG — same values on server and client, so decorative
   elements render identically during hydration (no flicker/jump). */
function seededRandom(seed: number) {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generatePetals(count: number) {
  const petals = [];
  const types = PETAL_TYPES.flatMap((p) => Array(p.weight).fill(p.char));

  for (let i = 0; i < count; i++) {
    const rnd = seededRandom(i * 9301 + 49297);
    const char = types[Math.floor(rnd() * types.length)];
    const isEmoji = char.length > 1;
    const baseSize = isEmoji ? 18 : 10;
    const sizeVariation = rnd() * 16;
    const left = rnd() * 100;
    const driftX = (rnd() - 0.5) * 100;
    const rotateEnd = (rnd() - 0.5) * 900;
    const duration = 20 + rnd() * 35;
    const delay = rnd() * duration;
    const animationType = rnd() < 0.4 ? "slow" : rnd() < 0.7 ? "medium" : "fast";
    const swayDelay = rnd() * 8;
    const swayDuration = 5 + rnd() * 5;

    petals.push({
      id: i,
      char,
      left,
      driftX,
      rotateEnd,
      size: baseSize + sizeVariation,
      duration,
      delay,
      animationType,
      swayDelay,
      swayDuration,
      opacity: 0.25 + rnd() * 0.35,
    });
  }
  return petals;
}

function generateFallingLeaves(count: number) {
  const leaves = [];
  const types = FALLING_LEAVES.flatMap((p) => Array(p.weight).fill(p.char));

  for (let i = 0; i < count; i++) {
    const rnd = seededRandom(i * 40503 + 7919);
    const char = types[Math.floor(rnd() * types.length)];
    const left = rnd() * 100;
    const driftX = (rnd() - 0.5) * 60;
    const rotateEnd = (rnd() - 0.5) * 540;
    const duration = 25 + rnd() * 20;
    const delay = rnd() * duration;
    const size = 14 + rnd() * 12;
    const swayDuration = 6 + rnd() * 4;

    leaves.push({
      id: i + 1000,
      char,
      left,
      driftX,
      rotateEnd,
      size,
      duration,
      delay,
      animationType: "slow",
      swayDelay: rnd() * 8,
      swayDuration,
      opacity: 0.15 + rnd() * 0.25,
    });
  }
  return leaves;
}

function PetalLayer() {
  const [isMobile, setIsMobile] = useState(false);
  const petals = useMemo(() => generatePetals(isMobile ? 20 : 50), [isMobile]);
  const fallingLeaves = useMemo(() => generateFallingLeaves(isMobile ? 8 : 18), [isMobile]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div
      className="petal-layer"
      aria-hidden="true"
      role="img"
      aria-label="Floating flower petals and falling leaves"
    >
      {petals.map((p) => (
        <span
          key={p.id}
          className="petal"
          style={
            {
              left: `${p.left}%`,
              fontSize: `${p.size}px`,
              opacity: p.opacity,
              animation: `
              petal-float-${p.animationType} ${p.duration}s linear ${p.delay}s infinite,
              petal-sway ${p.swayDuration}s ease-in-out ${p.swayDelay}s infinite
            `,
              "--drift-x": `${p.driftX}px`,
              "--rotate-end": `${p.rotateEnd}deg`,
            } as React.CSSProperties
          }
        >
          {p.char}
        </span>
      ))}
      {fallingLeaves.map((p) => (
        <span
          key={p.id}
          className="petal falling-leaf"
          style={
            {
              left: `${p.left}%`,
              fontSize: `${p.size}px`,
              opacity: p.opacity,
              animation: `
              petal-float-slow ${p.duration}s linear ${p.delay}s infinite,
              petal-sway ${p.swayDuration}s ease-in-out ${p.swayDelay}s infinite
            `,
              "--drift-x": `${p.driftX}px`,
              "--rotate-end": `${p.rotateEnd}deg`,
            } as React.CSSProperties
          }
        >
          {p.char}
        </span>
      ))}
    </div>
  );
}

/* ============================================================
   RAIN — soft falling streaks for melancholic sections
   ============================================================ */

function RainEffect({ count = 24, seed = 0 }: { count?: number; seed?: number }) {
  const drops = useMemo(() => {
    const result = [];
    for (let i = 0; i < count; i++) {
      const rnd = seededRandom(seed * 7919 + i * 104729 + 17);
      result.push({
        id: i,
        left: rnd() * 100,
        delay: rnd() * 6,
        duration: 3 + rnd() * 4,
        height: 14 + rnd() * 22,
        opacity: 0.15 + rnd() * 0.25,
      });
    }
    return result;
  }, [count, seed]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {drops.map((d) => (
        <span
          key={d.id}
          className="absolute top-0 w-px animate-rain"
          style={{
            left: `${d.left}%`,
            height: `${d.height}px`,
            opacity: d.opacity,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
            background:
              "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--muted-rose) 60%, transparent))",
          }}
        />
      ))}
    </div>
  );
}

/* ============================================================
   SCROLL PARALLAX HOOK
   ============================================================ */

function useParallax(speed: number = 0.15) {
  const ref = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;
      const distance = (elementCenter - viewportCenter) / viewportCenter;
      setOffset(distance * speed * 100);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return { ref, style: { transform: `translate3d(0, ${offset}px, 0)` } };
}

/* ============================================================
   SECTION COMPONENTS
   ============================================================ */

interface SectionHeadingProps {
  number: string;
  title: string;
  subtitle?: string;
  className?: string;
}

function SectionHeading({ number, title, subtitle, className }: SectionHeadingProps) {
  return (
    <header className={`mx-auto mb-16 max-w-3xl text-center ${className ?? ""}`}>
      <FlowerAccent position="top" className="mb-4" />
      <p
        className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground reveal-gentle"
        style={{ animationDelay: "0ms" }}
      >
        Chapter {number}
      </p>
      <h2
        className="text-balance text-4xl font-medium leading-tight text-foreground md:text-5xl lg:text-6xl reveal-gentle"
        style={{ animationDelay: "100ms" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="mt-6 mx-auto max-w-2xl font-display text-lg italic leading-7 text-muted-foreground md:text-xl reveal-gentle"
          style={{ animationDelay: "200ms" }}
        >
          {subtitle}
        </p>
      )}
      <FlowerAccent position="bottom" className="mt-6" />
    </header>
  );
}

function ChapterDivider() {
  return (
    <div className="my-24 mx-auto max-w-3xl reveal-gentle" aria-hidden="true">
      <div className="chapter-divider" />
      <FlowerAccent position="both" className="my-4" />
    </div>
  );
}

/* ============================================================
   EMOTIONAL MOMENT PARTICLES
   Small burst at key story moments
   ============================================================ */

interface EmotionalParticlesProps {
  triggerId: string;
  particleCount?: number;
  types?: ("heart" | "sparkle" | "petal" | "rose" | "wilted")[];
}

function EmotionalParticles({
  triggerId,
  particleCount = 12,
  types = ["heart", "sparkle", "petal", "rose", "wilted"],
}: EmotionalParticlesProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3, rootMargin: "0px" },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const particles = useMemo(() => {
    const result = [];
    const typeChars = {
      heart: "❤️",
      sparkle: "✨",
      petal: "🌸",
      rose: "🌹",
      wilted: "🥀",
    };
    for (let i = 0; i < particleCount; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      result.push({
        id: i,
        type,
        left: 10 + Math.random() * 80,
        top: 20 + Math.random() * 60,
        delay: Math.random() * 2,
        size: 18 + Math.random() * 14,
        char: typeChars[type as keyof typeof typeChars],
      });
    }
    return result;
  }, [particleCount, types]);

  if (!visible) return null;

  return (
    <div
      ref={ref}
      id={triggerId}
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className={
            p.type === "heart"
              ? "celebration-heart"
              : p.type === "sparkle"
                ? "celebration-sparkle"
                : p.type === "wilted"
                  ? "celebration-wilted"
                  : "celebration-petal"
          }
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.char}
        </span>
      ))}
    </div>
  );
}

/* ============================================================
   FLOWER ACCENTS - Decorative flowers for headings/sections
   ============================================================ */

function FlowerAccent({
  position = "top",
  className = "",
}: {
  position?: "top" | "bottom" | "both";
  className?: string;
}) {
  const flowers = useMemo(() => {
    const topFlowers = ["🌸", "🥀", "🌹", "🌷", "💐", "🌺"];
    const bottomFlowers = ["🍂", "🥀", "🌿", "🍃", "🌸", "🌹"];
    return {
      top: topFlowers.slice(0, 3),
      bottom: bottomFlowers.slice(0, 3),
    };
  }, []);

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      {(position === "top" || position === "both") && (
        <div className="flex gap-1 opacity-60">
          {flowers.top.map((f, i) => (
            <span
              key={`top-${i}`}
              className="text-2xl animate-float"
              style={{ animationDelay: `${i * 0.3}s` }}
            >
              {f}
            </span>
          ))}
        </div>
      )}
      {(position === "bottom" || position === "both") && (
        <div className="flex gap-1 opacity-50">
          {flowers.bottom.map((f, i) => (
            <span
              key={`bottom-${i}`}
              className="text-xl animate-slow-spin"
              style={{ animationDelay: `${i * 1.5}s` }}
            >
              {f}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   TYPEWRITER — types text char by char with blinking caret
   ============================================================ */

function Typewriter({
  text,
  speed = 70,
  delay = 0,
  className = "",
}: {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        setCount((c) => {
          if (c >= text.length) {
            if (interval) clearInterval(interval);
            return c;
          }
          return c + 1;
        });
      }, speed);
    }, delay);
    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [text, speed, delay]);

  const done = count >= text.length;

  return (
    <span className={className} aria-label={text}>
      {text.slice(0, count)}
      <span
        className={`inline-block w-[0.06em] ml-0.5 align-baseline bg-current ${done ? "caret-blink" : "opacity-0"}`}
        style={{ height: "0.9em" }}
        aria-hidden="true"
      />
    </span>
  );
}

/* ============================================================
   STAGGERED WORDS — pops each word in sequence
   ============================================================ */

function StaggeredWords({
  text,
  className = "",
  startDelay = 0,
  step = 60,
}: {
  text: string;
  className?: string;
  startDelay?: number;
  step?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span
          key={i}
          className="inline-block animate-word"
          style={{ animationDelay: `${startDelay + i * step}ms` }}
        >
          {w}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
}

/* ============================================================
   OPENING SCREEN
   ============================================================ */

function OpeningScreen() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 1000);
    const t3 = setTimeout(() => setPhase(3), 1800);
    const t4 = setTimeout(() => setPhase(4), 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <section
      id="opening"
      className="grain relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24"
      role="region"
      aria-label="Opening"
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        <div className="text-6xl opacity-10 animate-slow-zoom">🥀</div>
      </div>
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <FlowerAccent position="top" className="mb-6" />
        <div
          className={`reveal ${phase >= 1 ? "" : "opacity-0"}`}
          style={{ animationDelay: "0ms" }}
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.4em] text-muted-foreground">
            A Letter
          </p>
          <h1 className="text-balance text-5xl font-medium leading-none text-foreground md:text-7xl lg:text-8xl">
            That Was Never
            <br />
            <span className="text-primary text-shimmer">Meant to Be Sent</span>
          </h1>
        </div>

        <div
          className={`transition-all duration-700 ${phase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <p className="mt-6 mx-auto max-w-2xl font-display text-lg italic leading-8 text-muted-foreground md:text-xl">
            <Typewriter text={'"Perhaps this was never really meant for her."'} speed={45} />
          </p>
          <p className="mt-3 mx-auto max-w-2xl font-display text-lg italic leading-8 text-muted-foreground md:text-xl">
            <Typewriter
              text={'"Perhaps it was only meant to be written."'}
              speed={45}
              delay={1800}
            />
          </p>
        </div>

        <div
          className={`mt-12 transition-all duration-700 ${phase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <FlowerAccent position="both" className="my-4" />
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground/60">
            Scroll to begin
          </p>
          <ArrowDown className="mx-auto mt-3 h-7 w-7 text-muted-foreground/50 animate-bounce" />
        </div>

        <div
          className={`mt-8 transition-all duration-700 ${phase >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <p className="font-hand text-lg text-primary/60 italic animate-float">
            For Aneesha... 🌸
          </p>
        </div>
        <FlowerAccent position="bottom" className="mt-6" />
      </div>
    </section>
  );
}

/* ============================================================
   PLANT BURST — celebratory petals when a flower is planted
   ============================================================ */

function PlantBurst() {
  const items = useMemo(() => {
    const chars = ["🌸", "🌺", "🌷", "🌼", "🌹", "💐"];
    const list = [];
    for (let i = 0; i < 22; i++) {
      const rnd = seededRandom(i * 7717 + 3);
      list.push({
        id: `p${i}`,
        char: chars[Math.floor(rnd() * chars.length)] ?? "🌸",
        left: 5 + rnd() * 90,
        delay: rnd() * 1.2,
        duration: 3 + rnd() * 2,
        size: 18 + rnd() * 16,
        driftX: (rnd() - 0.5) * 240,
        rotateEnd: (rnd() - 0.5) * 720,
        kind: "petal" as const,
      });
    }
    for (let i = 0; i < 8; i++) {
      const rnd = seededRandom(i * 9973 + 41);
      list.push({
        id: `h${i}`,
        char: "💗",
        left: 10 + rnd() * 80,
        delay: rnd() * 1.5,
        duration: 3.5 + rnd() * 2,
        size: 16 + rnd() * 14,
        driftX: (rnd() - 0.5) * 160,
        rotateEnd: (rnd() - 0.5) * 360,
        kind: "heart" as const,
      });
    }
    return list;
  }, []);

  return (
    <div className="absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
      {items.map((item) => (
        <span
          key={item.id}
          className={`absolute ${item.kind === "petal" ? "celebration-petal" : "celebration-heart"}`}
          style={{
            left: `${item.left}%`,
            top: "55%",
            fontSize: `${item.size}px`,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
          }}
        >
          {item.char}
        </span>
      ))}
    </div>
  );
}

/* ============================================================
   HIDDEN NOTE OVERLAY — unlocked by tapping the tiny flower
   ============================================================ */

function HiddenNoteOverlay({
  note,
  number,
  onClose,
}: {
  note: string;
  number: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="A hidden note"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-foreground/40 backdrop-blur-sm"
        aria-label="Close the note"
        onClick={onClose}
      />
      <div className="animate-letter-open relative w-full max-w-md border border-border/70 bg-parchment px-6 py-7 shadow-letter paper-texture grain">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground focus-ring"
          aria-label="Close the note"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          A hidden note · {number}
        </p>
        <p className="animate-ink mt-4 font-hand text-xl leading-8 text-burgundy">{note}</p>
        <div className="mt-5 flex justify-end gap-1.5 opacity-50" aria-hidden="true">
          {["🌸", "🌼", "🌸"].map((f, i) => (
            <span
              key={i}
              className="animate-float text-base"
              style={{ animationDelay: `${i * 0.6}s` }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   GARDEN HUD — fixed counter for planted flowers & found notes
   ============================================================ */

function GardenHUD({
  plantedCount,
  notesCount,
  secretUnlocked,
  onPlay,
}: {
  plantedCount: number;
  notesCount: number;
  secretUnlocked: boolean;
  onPlay: () => void;
}) {
  return (
    <div
      className="fixed bottom-5 left-5 z-40 flex items-center gap-3 rounded-full border border-border/40 bg-card/75 px-4 py-2 shadow-letter backdrop-blur-sm"
      aria-label={`Secret garden: ${plantedCount} of 16 flowers planted, ${notesCount} of 16 notes found`}
    >
      <span
        key={`p-${plantedCount}`}
        className="celebration-text text-sm text-primary"
        title="Flowers planted"
      >
        🌸 {plantedCount}/16
      </span>
      <span className="h-3 w-px bg-border" aria-hidden="true" />
      <span
        key={`n-${notesCount}`}
        className="celebration-text text-sm text-burgundy"
        title="Hidden notes found"
      >
        🌼 {notesCount}/16
      </span>
      {secretUnlocked && (
        <span key="unlocked" className="celebration-text text-sm" title="The seventeenth note">
          ✦
        </span>
      )}
      <span className="h-3 w-px bg-border" aria-hidden="true" />
      <button
        type="button"
        onClick={onPlay}
        className="rounded-full p-1 text-sm transition-transform hover:scale-125 focus-ring"
        aria-label="Play a little game — catch the petals"
        title="Play a little game"
      >
        🎀
      </button>
    </div>
  );
}

/* ============================================================
   MEGA CONFETTI — full-screen burst when all 16 notes are found
   ============================================================ */

function MegaConfetti() {
  const items = useMemo(() => {
    const petals = ["🌸", "🌺", "🌷", "🌼", "🌹", "💐", "🌻"];
    const hearts = ["💗", "💕", "💖"];
    const golds = ["✨", "⭐", "🌟", "✦"];
    const list = [];
    for (let i = 0; i < 50; i++) {
      const rnd = seededRandom(i * 6151 + 7);
      list.push({
        id: `m-p${i}`,
        char: petals[Math.floor(rnd() * petals.length)] ?? "🌸",
        left: rnd() * 100,
        delay: rnd() * 2,
        duration: 5 + rnd() * 4,
        size: 20 + rnd() * 18,
        driftX: (rnd() - 0.5) * 300,
        rotateEnd: (rnd() - 0.5) * 1080,
        cls: "celebration-petal",
      });
    }
    for (let i = 0; i < 16; i++) {
      const rnd = seededRandom(i * 8291 + 131);
      list.push({
        id: `m-h${i}`,
        char: hearts[i % hearts.length] ?? "💗",
        left: rnd() * 100,
        delay: rnd() * 2.5,
        duration: 6 + rnd() * 4,
        size: 24 + rnd() * 20,
        driftX: (rnd() - 0.5) * 220,
        rotateEnd: (rnd() - 0.5) * 720,
        cls: "celebration-heart",
      });
    }
    for (let i = 0; i < 20; i++) {
      const rnd = seededRandom(i * 3571 + 977);
      list.push({
        id: `m-g${i}`,
        char: golds[i % golds.length] ?? "✨",
        left: rnd() * 100,
        delay: rnd() * 3,
        duration: 6 + rnd() * 5,
        size: 16 + rnd() * 14,
        driftX: (rnd() - 0.5) * 260,
        rotateEnd: (rnd() - 0.5) * 540,
        cls: "celebration-petal",
      });
    }
    return list;
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true"
      aria-label="All sixteen notes found"
    >
      {items.map((item) => (
        <span
          key={item.id}
          className={`absolute ${item.cls}`}
          style={{
            left: `${item.left}%`,
            top: item.cls === "celebration-heart" ? "45%" : "-4%",
            fontSize: `${item.size}px`,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
          }}
        >
          {item.char}
        </span>
      ))}
    </div>
  );
}

/* ============================================================
   CHAPTER CONTENT
   ============================================================ */

function ChapterContent({
  chapter,
  index,
  initiallyVisible,
  isPlanted,
  onPlant,
  noteFound,
  onFoundNote,
}: {
  chapter: Chapter;
  index: number;
  initiallyVisible?: boolean;
  isPlanted: boolean;
  onPlant: () => void;
  noteFound: boolean;
  onFoundNote: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(initiallyVisible ?? false);
  const [burst, setBurst] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const { ref: parallaxRef, style: parallaxStyle } = useParallax(0.08);

  useEffect(() => {
    if (initiallyVisible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "50px" },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [initiallyVisible]);

  useEffect(() => {
    if (!noteOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNoteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [noteOpen]);

  const isLastChapter = index >= chapters.length - 1;
  const nextId = !isLastChapter ? chapters[index + 1]?.id : "the-letter";

  const handlePlant = () => {
    if (isPlanted) return;
    onPlant();
    setBurst(true);
    window.setTimeout(() => setBurst(false), 3500);
  };

  const handleNoteOpen = () => {
    setNoteOpen(true);
    if (!noteFound) onFoundNote();
  };

  const goNext = () => {
    document.getElementById(nextId ?? "the-letter")?.scrollIntoView({ behavior: "smooth" });
  };

  // Emotional triggers for specific chapters - more flowers for sad chapters
  const sadChapters = [
    "one-look",
    "noticing",
    "looking-for-her",
    "confession",
    "no",
    "afterwards",
    "self-awareness",
    "presence-without-place",
    "ordinary-moments",
    "hope",
    "light-left-on",
    "not-possession",
    "ending",
  ];
  const showParticles = sadChapters.includes(chapter.id);

  const getParticleConfig = (
    id: string,
  ): { count: number; types: ("heart" | "sparkle" | "petal" | "rose" | "wilted")[] } => {
    if (id === "no") return { count: 16, types: ["wilted", "petal", "sparkle", "rose"] };
    if (["afterwards", "light-left-on", "not-possession"].includes(id))
      return { count: 14, types: ["wilted", "rose", "sparkle"] };
    if (["confession", "self-awareness", "ending"].includes(id))
      return { count: 12, types: ["heart", "rose", "wilted", "sparkle"] };
    return { count: 10, types: ["petal", "rose", "sparkle", "wilted"] };
  };

  const particleConfig = getParticleConfig(chapter.id);

  const isDarkSection = ["no", "afterwards", "light-left-on"].includes(chapter.id);
  const sectionClass = isDarkSection ? "section-dim grain" : "grain-subtle";
  const hasDetails = "details" in chapter && chapter.details !== undefined;

  return (
    <>
      {showParticles && (
        <EmotionalParticles
          triggerId={`${chapter.id}-emotion`}
          particleCount={particleConfig.count}
          types={particleConfig.types}
        />
      )}
      <section
        ref={(el) => {
          ref.current = el;
          parallaxRef.current = el;
        }}
        id={chapter.id}
        className={`${sectionClass} px-6 py-20 md:py-28 relative`}
        role="region"
        aria-label={`Chapter ${chapter.number}: ${chapter.title}`}
        style={parallaxStyle}
      >
        {isDarkSection && <RainEffect count={26} seed={index + 1} />}
        <div className="mx-auto max-w-3xl relative z-10">
          <SectionHeading
            number={chapter.number}
            title={chapter.title}
            subtitle={chapter.subtitle}
            className={visible ? "" : "opacity-0"}
          />

          <div
            className={`prose max-w-none ${visible ? "" : "opacity-0"}`}
            style={{ animationDelay: "100ms" }}
          >
            {chapter.lines.map((line, i) => (
              <p
                key={`${chapter.id}-${i}`}
                className={`font-display text-lg leading-9 text-foreground/80 md:text-xl reveal-gentle ${line === "" ? "h-6" : "mb-5"} ${line.startsWith("Bas ") || line.startsWith("Aur ") || line.startsWith("Lekin ") || line.startsWith("Phir ") || line.startsWith("Uska ") || line.startsWith("Kuch ") || line.startsWith("ke ") ? "italic text-primary/90" : ""}`}
                style={{ animationDelay: `${100 + i * 30}ms` }}
              >
                {line}
              </p>
            ))}
          </div>

          {hasDetails && chapter.details && (
            <div
              className={`mt-12 grid gap-4 sm:grid-cols-2 ${visible ? "" : "opacity-0"}`}
              style={{ animationDelay: "200ms" }}
            >
              {chapter.details.map((detail, i) => (
                <article
                  key={`${chapter.id}-detail-${i}`}
                  className="p-5 border border-border/40 bg-card/50 shadow-soft hover-lift transition-colors duration-300 hover:border-primary/30"
                >
                  <span className="text-xs text-muted-foreground uppercase tracking-[0.2em]">
                    {detail.label}
                  </span>
                  <h3 className="mt-1 text-lg font-medium text-foreground">{detail.label}</h3>
                  <p className="mt-2 font-display text-sm italic leading-6 text-muted-foreground">
                    {detail.description}
                  </p>
                </article>
              ))}
            </div>
          )}

          {chapter.id === "ordinary-moments" && (
            <div
              className={`mt-12 space-y-6 ${visible ? "" : "opacity-0"}`}
              style={{ animationDelay: "200ms" }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <article className="p-5 border border-border/40 bg-card/50 shadow-soft hover-lift">
                  <span className="text-xs text-muted-foreground uppercase tracking-[0.2em]">
                    For Her
                  </span>
                  <h3 className="mt-1 text-lg font-medium text-foreground">An ordinary moment</h3>
                  <p className="mt-2 font-display text-sm italic leading-6 text-muted-foreground">
                    She walks past. She attends class. She probably forgets the moment it passes.
                  </p>
                </article>
                <article className="p-5 border border-primary/20 bg-primary/5 shadow-letter hover-lift">
                  <span className="text-xs text-primary uppercase tracking-[0.2em]">For Him</span>
                  <h3 className="mt-1 text-lg font-medium text-primary">A memory</h3>
                  <p className="mt-2 font-display text-sm italic leading-6 text-primary-foreground/90">
                    He notices. He remembers. He remembers much longer than he should.
                    <br />
                    <span className="text-xs not-italic">
                      "Uske liye ek ordinary moment, mere liye poori raat ki soch."
                    </span>
                  </p>
                </article>
              </div>
            </div>
          )}

          {chapter.id === "light-left-on" && (
            <div
              className={`mt-12 relative aspect-square max-w-md mx-auto ${visible ? "" : "opacity-0"}`}
              style={{ animationDelay: "300ms" }}
            >
              <div className="relative flex h-full items-center justify-center glow-pulse">
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-warm-gold/30 to-muted-rose/30 blur-xl"
                  aria-hidden="true"
                />
                <div
                  className="relative z-10 h-20 w-20 rounded-full bg-gradient-to-br from-warm-gold to-muted-rose shadow-[0_0_40px_color-mix(in_oklab,var(--warm-gold)_30%,transparent)]"
                  aria-hidden="true"
                />
                <div className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 text-center w-72">
                  <p className="font-display text-sm italic text-muted-foreground">
                    "You don&apos;t know whether anyone will ever come through the door."
                  </p>
                  <p className="mt-1 font-display text-sm italic text-muted-foreground">
                    "But you still don&apos;t switch it off."
                  </p>
                  <p className="mt-3 font-hand text-base text-primary">
                    Ek chhoti si roshni abhi tak jal rahi hai.
                  </p>
                </div>
              </div>
            </div>
          )}

          {chapter.id === "not-possession" && (
            <div
              className={`mt-12 space-y-4 text-center ${visible ? "" : "opacity-0"}`}
              style={{ animationDelay: "200ms" }}
            >
              <div className="space-y-1">
                <p
                  className="text-sm uppercase tracking-[0.3em] text-muted-foreground reveal-gentle"
                  style={{ animationDelay: "0ms" }}
                >
                  Not possession.
                </p>
                <p
                  className="text-sm uppercase tracking-[0.3em] text-muted-foreground reveal-gentle"
                  style={{ animationDelay: "100ms" }}
                >
                  Not a promise.
                </p>
                <p
                  className="text-sm uppercase tracking-[0.3em] text-muted-foreground reveal-gentle"
                  style={{ animationDelay: "200ms" }}
                >
                  Not even an answer.
                </p>
              </div>
              <p
                className="font-hand text-xl text-primary md:text-2xl text-shimmer"
                style={{ animationDelay: "400ms" }}
              >
                Bas samajh.
              </p>
              <div className="flex justify-center gap-2 pt-2" aria-hidden="true">
                {["🌸", "🥀", "🌸"].map((f, i) => (
                  <span
                    key={i}
                    className="text-xl animate-float opacity-50"
                    style={{ animationDelay: `${i * 0.7}s` }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hidden note — a tiny flower tucked into every chapter */}
          <div
            className={`mt-10 flex justify-end ${visible ? "" : "opacity-0"}`}
            style={{ animationDelay: "350ms" }}
          >
            <button
              type="button"
              onClick={handleNoteOpen}
              className="rounded-full p-2 text-xl opacity-25 transition-opacity duration-300 hover:opacity-70 focus-ring animate-float"
              style={{ animationDelay: "1.5s" }}
              aria-label={noteFound ? "Reread the hidden note" : "A little flower is hiding here"}
              title="A little flower is hiding here..."
            >
              {noteFound ? "🌸" : "🌼"}
            </button>
          </div>

          {/* Yes / Next */}
          <div
            className={`mt-6 flex flex-wrap items-center justify-center gap-3 ${visible ? "" : "opacity-0"}`}
            style={{ animationDelay: "400ms" }}
          >
            <Button
              variant="letter"
              size="lg"
              className="hover-scale"
              onClick={handlePlant}
              disabled={isPlanted}
              aria-pressed={isPlanted}
            >
              <Flower2 className="mr-2 h-4 w-4" />
              {isPlanted ? "Planted — a flower for her" : "Yes, plant a flower"}
            </Button>
            <Button variant="delicate" size="lg" className="hover-scale" onClick={goNext}>
              {isLastChapter ? "Read the letter" : "Next"}
              <ArrowDown className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {noteOpen && (
            <HiddenNoteOverlay
              note={chapter.hiddenNote}
              number={chapter.number}
              onClose={() => setNoteOpen(false)}
            />
          )}

          {index < chapters.length - 1 && <ChapterDivider />}
        </div>
        {burst && <PlantBurst />}
      </section>
    </>
  );
}

/* ============================================================
   SONG PLAYER
   ============================================================ */

function SongPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [source, setSource] = useState("");
  const [title, setTitle] = useState("Choose a song");
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (source) URL.revokeObjectURL(source);
    },
    [source],
  );

  const chooseSong = useCallback(
    (file?: File) => {
      if (!file) return;
      if (source) URL.revokeObjectURL(source);
      const url = URL.createObjectURL(file);
      setSource(url);
      setTitle(file.name.replace(/\.[^.]+$/, ""));
      setPlaying(false);
      setError(null);
    },
    [source],
  );

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !source) return;
    try {
      if (audio.paused) {
        await audio.play();
        setPlaying(true);
        setError(null);
      } else {
        audio.pause();
        setPlaying(false);
      }
    } catch {
      setError("Unable to play audio.");
      setPlaying(false);
    }
  }, [source]);

  return (
    <div className="mt-10 flex flex-col items-center gap-3 md:flex-row md:justify-center">
      <audio
        ref={audioRef}
        src={source}
        onEnded={() => setPlaying(false)}
        onError={() => setError("Audio playback failed")}
      />
      <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-card/60 px-5 text-sm font-medium text-foreground shadow-soft hover-lift hover:border-primary/40 focus-within:ring-2 focus-within:ring-ring transition-all duration-200">
        <Upload className="h-4 w-4" /> {source ? "Change song" : "Add a song"}
        <input
          className="sr-only"
          type="file"
          accept="audio/*"
          onChange={(e) => chooseSong(e.target.files?.[0])}
          disabled={playing}
        />
      </label>
      {source && (
        <Button
          variant="delicate"
          size="lg"
          className="h-11 max-w-56 hover-scale"
          onClick={toggle}
          aria-label={playing ? `Pause ${title}` : `Play ${title}`}
          disabled={error !== null}
        >
          {playing ? <Pause /> : <Play />} <span className="truncate">{title}</span>
        </Button>
      )}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
      <p className="w-full text-center text-xs text-muted-foreground">
        Song stays on this device. Plays only when you press play.
      </p>
    </div>
  );
}

/* ============================================================
   THE LETTER
   ============================================================ */

function TheLetter() {
  return (
    <section className="grain-subtle px-4 py-16 md:px-6 md:py-20" id="the-letter">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          number="—"
          title="The Letter"
          subtitle="The words that were never sent. Written to understand, not to confess."
        />
        <div className="relative animate-letter-open">
          <FlowerAccent position="top" className="mb-4 opacity-40" />
          <div className="grain border border-border/70 bg-parchment px-4 py-8 md:px-8 md:py-12 shadow-letter paper-texture md:-rotate-[.3deg] hover-lift transition-all duration-500 relative">
            <div
              className="absolute top-4 right-4 text-2xl opacity-30 animate-float"
              style={{ animationDelay: "0.5s" }}
              aria-hidden="true"
            >
              🌸
            </div>
            <div
              className="absolute bottom-4 left-4 text-2xl opacity-30 animate-float"
              style={{ animationDelay: "1.5s" }}
              aria-hidden="true"
            >
              🥀
            </div>
            <h2 className="font-hand text-3xl text-burgundy md:text-4xl animate-ink">
              Dear Aneesha,
            </h2>
            <div className="mt-5 font-display text-sm leading-8 text-foreground/80 md:text-base whitespace-pre-wrap overflow-wrap-break-word">
              {originalLetter}
            </div>
            <div className="mt-6 pt-4 border-t border-border/50">
              <p className="font-hand text-sm text-muted-foreground text-right md:text-base">
                — from someone who never planned to fall for you, but did anyway, quietly,
                completely.
              </p>
            </div>
          </div>
          <FlowerAccent position="bottom" className="mt-4 opacity-40" />
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          This letter lives here. It was never sent. It was only written. 🌸
        </p>
      </div>
    </section>
  );
}

/* ============================================================
   FINAL PAGE
   ============================================================ */

interface FinalPageProps {
  onYes: () => void;
  onNo: () => void;
  onReset: () => void;
  celebration: "none" | "yes" | "no";
  secretUnlocked?: boolean;
}

function FinalPage({ onYes, onNo, onReset, celebration, secretUnlocked }: FinalPageProps) {
  const lastChapter = chapters[chapters.length - 1];
  const lastLines = lastChapter?.lines ?? [];

  const isYes = celebration === "yes";
  const isNo = celebration === "no";

  return (
    <>
      {isYes && <CelebrationYes />}
      {isNo && <CelebrationNo />}
      <section
        id="final"
        className="grain relative flex min-h-[80vh] items-center justify-center px-6 py-24"
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {(isYes || isNo) && (
            <div className="absolute inset-0 bg-gradient-to-t from-warm-gold/5 via-transparent to-transparent glow-pulse" />
          )}
          {!isYes && !isNo && (
            <div
              className="absolute inset-0 flex items-center justify-center opacity-10"
              aria-hidden="true"
            >
              <span className="text-8xl animate-slow-zoom">🥀</span>
            </div>
          )}
        </div>
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <FlowerAccent position="top" className="mb-6 opacity-50" />
          <p
            className="font-display text-xl italic text-muted-foreground md:text-2xl reveal-gentle"
            style={{ animationDelay: "0ms" }}
          >
            {lastLines[lastLines.length - 4] ?? ""}
          </p>
          <div
            className="mx-auto my-8 h-px w-16 bg-warm-gold/60 animate-wave"
            style={{ animationDelay: "100ms" }}
          />
          <p
            className="text-balance font-display text-3xl leading-tight text-foreground md:text-4xl lg:text-5xl reveal-gentle"
            style={{ animationDelay: "200ms" }}
          >
            {lastLines[lastLines.length - 3] ?? ""}
          </p>
          <p
            className="mt-8 font-hand text-2xl text-primary md:text-3xl"
            style={{ animationDelay: "300ms" }}
          >
            <StaggeredWords text={lastLines[lastLines.length - 2] ?? ""} step={90} />
          </p>
          <p
            className="mt-12 font-display text-base italic text-muted-foreground md:text-lg reveal-gentle"
            style={{ animationDelay: "400ms" }}
          >
            {lastLines[lastLines.length - 1] ?? ""}
          </p>
          <FlowerAccent position="bottom" className="mt-8 opacity-50" />

          {secretUnlocked && (
            <div
              className="animate-letter-open mx-auto mt-10 max-w-xl border border-warm-gold/40 bg-parchment/90 px-6 py-6 text-left shadow-letter paper-texture grain"
              role="status"
              aria-label="The seventeenth note, unlocked"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-warm-gold">
                  ✦ {secretSeventeenth.title}
                </p>
                <span className="text-sm opacity-60" aria-hidden="true">
                  🌼 16/16
                </span>
              </div>
              <p className="animate-ink mt-4 font-hand text-lg leading-8 text-burgundy md:text-xl">
                {secretSeventeenth.text}
              </p>
            </div>
          )}

          <div className="mt-14 flex flex-col items-center gap-4">
            <div className="flex gap-4" role="group" aria-label="Response">
              <span className={isYes || isNo ? "" : "inline-flex animate-heartbeat"}>
                <Button
                  variant="moonlit"
                  size="lg"
                  className="h-12 min-w-32 hover-scale"
                  onClick={onYes}
                  disabled={isYes || isNo}
                  aria-label="Yes"
                >
                  <Heart className="mr-2 h-4 w-4" /> Yes
                </Button>
              </span>
              <Button
                variant="delicate"
                size="lg"
                className={`h-12 min-w-32 hover-scale ${isYes || isNo ? "" : "animate-pulse-ring"}`}
                onClick={onNo}
                disabled={isYes || isNo}
                aria-label="No"
              >
                No
              </Button>
            </div>

            {isYes && (
              <div
                className="celebration-text space-y-3 text-gradient-gold"
                role="status"
                aria-live="polite"
              >
                <FlowerAccent position="top" className="mb-2" />
                <p className="font-display text-xl italic">She knows now. 🌸</p>
                <p className="font-display text-lg italic text-muted-foreground">
                  The letter reached her.
                </p>
                <FlowerAccent position="bottom" className="mt-2" />
              </div>
            )}

            {isNo && (
              <div className="celebration-text space-y-3" role="status" aria-live="polite">
                <FlowerAccent position="top" className="mb-2" />
                <p className="font-display text-xl italic text-muted-foreground">
                  That&apos;s okay. 🥀
                </p>
                <p className="font-display text-lg italic text-muted-foreground/70">
                  The letter stays here. Unsent. Understood.
                </p>
                <FlowerAccent position="bottom" className="mt-2" />
              </div>
            )}

            <Button
              variant="delicate"
              className="mt-4 hover-scale"
              onClick={() => {
                if (isYes || isNo) onReset();
                document.querySelector("#opening")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Begin again <ArrowUp className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

/* ============================================================
   YES CELEBRATION - Beautiful flower burst
   ============================================================ */

function CelebrationYes() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setMounted(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  const petals = useMemo(() => {
    const result = [];
    const emojis = ["🌸", "🌺", "🌷", "💐", "✨", "❤️", "🌹", "🌻", "🌼", "🌿", "💖", "💕"];
    for (let i = 0; i < 40; i++) {
      result.push({
        id: i,
        char: emojis[Math.floor(Math.random() * emojis.length)],
        left: 5 + Math.random() * 90,
        delay: Math.random() * 2,
        duration: 4 + Math.random() * 3,
        size: 22 + Math.random() * 20,
        driftX: (Math.random() - 0.5) * 120,
        rotateEnd: (Math.random() - 0.5) * 1440,
      });
    }
    return result;
  }, []);

  const sparkles = useMemo(() => {
    const result = [];
    for (let i = 0; i < 50; i++) {
      result.push({
        id: i,
        left: 5 + Math.random() * 90,
        top: 10 + Math.random() * 80,
        delay: Math.random() * 1.5,
        size: 14 + Math.random() * 12,
      });
    }
    return result;
  }, []);

  const hearts = useMemo(() => {
    const result = [];
    for (let i = 0; i < 20; i++) {
      result.push({
        id: i,
        left: 10 + Math.random() * 80,
        delay: Math.random() * 2.5,
        size: 20 + Math.random() * 16,
      });
    }
    return result;
  }, []);

  const roses = useMemo(() => {
    const result = [];
    for (let i = 0; i < 15; i++) {
      result.push({
        id: i,
        left: 10 + Math.random() * 80,
        delay: Math.random() * 2,
        size: 24 + Math.random() * 14,
        driftX: (Math.random() - 0.5) * 80,
        rotateEnd: (Math.random() - 0.5) * 720,
      });
    }
    return result;
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      aria-hidden="true"
      role="img"
      aria-label="Flower celebration"
    >
      {roses.map((p) => (
        <span
          key={p.id}
          className="celebration-petal"
          style={
            {
              left: `${p.left}%`,
              bottom: "-5%",
              fontSize: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${4 + Math.random() * 2}s`,
              "--drift-x": `${p.driftX}px`,
              "--rotate-end": `${p.rotateEnd}deg`,
            } as React.CSSProperties
          }
        >
          🌹
        </span>
      ))}
      {petals.map((p) => (
        <span
          key={p.id}
          className="celebration-petal"
          style={
            {
              left: `${p.left}%`,
              bottom: "-5%",
              fontSize: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--drift-x": `${p.driftX}px`,
              "--rotate-end": `${p.rotateEnd}deg`,
            } as React.CSSProperties
          }
        >
          {p.char}
        </span>
      ))}
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="celebration-sparkle"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            fontSize: `${s.size}px`,
            animationDelay: `${s.delay}s`,
          }}
        >
          ✨
        </span>
      ))}
      {hearts.map((h) => (
        <span
          key={h.id}
          className="celebration-heart"
          style={{
            left: `${h.left}%`,
            bottom: "-5%",
            fontSize: `${h.size}px`,
            animationDelay: `${h.delay}s`,
          }}
        >
          ❤️
        </span>
      ))}
    </div>
  );
}

/* ============================================================
   NO CELEBRATION - Gentle, respectful, melancholic
   ============================================================ */

function CelebrationNo() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setMounted(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const wiltedPetals = useMemo(() => {
    const result = [];
    const emojis = ["🥀", "🌸", "🍂", "🌹", "🌿", "💧"];
    for (let i = 0; i < 20; i++) {
      result.push({
        id: i,
        char: emojis[Math.floor(Math.random() * emojis.length)],
        left: 10 + Math.random() * 80,
        delay: Math.random() * 3,
        duration: 5 + Math.random() * 4,
        size: 20 + Math.random() * 14,
        driftX: (Math.random() - 0.5) * 60,
        rotateEnd: (Math.random() - 0.5) * 360,
      });
    }
    return result;
  }, []);

  const tears = useMemo(() => {
    const result = [];
    for (let i = 0; i < 12; i++) {
      result.push({
        id: i,
        left: 15 + Math.random() * 70,
        delay: Math.random() * 2,
        size: 16 + Math.random() * 8,
      });
    }
    return result;
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      aria-hidden="true"
      role="img"
      aria-label="Melancholic acknowledgment"
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="celebration-text text-center space-y-2">
          <span className="block text-6xl animate-pulse" style={{ animationDuration: "3s" }}>
            🥀
          </span>
          <p className="font-display text-lg italic text-muted-foreground/60">
            The letter remains here, quietly.
          </p>
          <p className="font-hand text-sm text-primary/50">
            Some letters are only meant to be written...
          </p>
        </div>
      </div>
      {wiltedPetals.map((p) => (
        <span
          key={p.id}
          className="celebration-wilted"
          style={
            {
              left: `${p.left}%`,
              top: "50%",
              fontSize: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--drift-x": `${p.driftX}px`,
              "--rotate-end": `${p.rotateEnd}deg`,
            } as React.CSSProperties
          }
        >
          {p.char}
        </span>
      ))}
      {tears.map((t) => (
        <span
          key={t.id}
          className="celebration-wilted"
          style={
            {
              left: `${t.left}%`,
              top: "45%",
              fontSize: `${t.size}px`,
              animationDelay: `${t.delay}s`,
              animationDuration: `${4 + Math.random() * 2}s`,
            } as React.CSSProperties
          }
        >
          💧
        </span>
      ))}
    </div>
  );
}

/* ============================================================
   CHAPTER OBSERVER - Shared IntersectionObserver
   ============================================================ */

function ChapterObserver({ children }: { children: React.ReactNode }) {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [visibleMap, setVisibleMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            setVisibleMap((prev) => ({ ...prev, [id]: true }));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "50px" },
    );

    refs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {children}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .scroll-progress { transform: scaleX(0); }
          @supports (animation-timeline: scroll()) {
            .scroll-progress {
              animation: scroll-progress-auto linear;
              animation-timeline: scroll(root);
            }
            @keyframes scroll-progress-auto { to { transform: scaleX(1); } }
          }
        `,
        }}
      />
    </>
  );
}

/* ============================================================
   AUDIO CONTROL
   ============================================================ */

function AudioControl() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initialized = useRef(false);

  const ensureAudio = useCallback(() => {
    if (!initialized.current) {
      audioRef.current = new Audio("/WhatsApp Audio 2026-09-13 at 2.18.41 PM.mpeg");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.25;
      initialized.current = true;
    }
    return audioRef.current;
  }, []);

  const toggle = () => {
    const audio = ensureAudio();
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  return (
    <button
      onClick={toggle}
      className="fixed bottom-5 right-5 z-40 rounded-full bg-card/70 backdrop-blur-sm p-2.5 shadow-letter border border-border/40 hover:bg-card hover-glow focus-ring transition-all duration-200"
      aria-label={playing ? "Pause music" : "Play music"}
      aria-pressed={playing}
    >
      {playing ? (
        <Pause className="h-4.5 w-4.5 text-foreground" />
      ) : (
        <Music2 className="h-4.5 w-4.5 text-foreground" />
      )}
    </button>
  );
}

/* ============================================================
   MAIN APP
   ============================================================ */

function LetterWorld() {
  const [celebration, setCelebration] = useState<"none" | "yes" | "no">("none");
  const [planted, setPlanted] = useState<Record<string, boolean>>({});
  const [notesFound, setNotesFound] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);
  const [megaBurst, setMegaBurst] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);

  const plantedCount = Object.keys(planted).length;
  const notesCount = Object.keys(notesFound).length;
  const secretUnlocked = notesCount >= chapters.length;

  useEffect(() => {
    try {
      const savedPlanted = localStorage.getItem("sf:planted");
      const savedNotes = localStorage.getItem("sf:notes");
      if (savedPlanted) setPlanted(JSON.parse(savedPlanted));
      if (savedNotes) setNotesFound(JSON.parse(savedNotes));
    } catch {
      // corrupted or unavailable storage — start fresh
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("sf:planted", JSON.stringify(planted));
      localStorage.setItem("sf:notes", JSON.stringify(notesFound));
    } catch {
      // storage unavailable — garden stays in memory only
    }
  }, [hydrated, planted, notesFound]);

  const handleYes = () => setCelebration("yes");
  const handleNo = () => setCelebration("no");
  const handleReset = () => setCelebration("none");

  const handlePlant = (id: string) => setPlanted((p) => (p[id] ? p : { ...p, [id]: true }));

  const handleFoundNote = (id: string) => {
    if (notesFound[id]) return;
    const nextCount = notesCount + 1;
    setNotesFound({ ...notesFound, [id]: true });
    if (nextCount >= chapters.length) {
      setMegaBurst(true);
      window.setTimeout(() => setMegaBurst(false), 9000);
    }
  };

  return (
    <>
      <PetalLayer />
      <div
        className="scroll-progress"
        aria-hidden="true"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
      />
      <AudioControl />
      <GardenHUD
        plantedCount={plantedCount}
        notesCount={notesCount}
        secretUnlocked={secretUnlocked}
        onPlay={() => setGameOpen(true)}
      />
      {megaBurst && <MegaConfetti />}
      {gameOpen && <PetalCatch onClose={() => setGameOpen(false)} />}
      <main className="min-h-screen relative z-0">
        <OpeningScreen />
        <ChapterObserver>
          {chapters.map((chapter, index) => (
            <ChapterContent
              key={chapter.id}
              chapter={chapter}
              index={index}
              initiallyVisible={index === 0}
              isPlanted={!!planted[chapter.id]}
              onPlant={() => handlePlant(chapter.id)}
              noteFound={!!notesFound[chapter.id]}
              onFoundNote={() => handleFoundNote(chapter.id)}
            />
          ))}
        </ChapterObserver>
        <TheLetter />
        <FinalPage
          onYes={handleYes}
          onNo={handleNo}
          onReset={handleReset}
          celebration={celebration}
          secretUnlocked={secretUnlocked}
        />
      </main>
    </>
  );
}
