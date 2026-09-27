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
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { chapters, siteMeta, type Chapter, originalLetter } from "@/content/letter";

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

function generatePetals(count: number, isMobile: boolean) {
  const petals = [];
  const totalWeight = PETAL_TYPES.reduce((sum, p) => sum + p.weight, 0);
  const types = PETAL_TYPES.flatMap(p => Array(p.weight).fill(p.char));

  for (let i = 0; i < count; i++) {
    const char = types[Math.floor(Math.random() * types.length)];
    const isEmoji = char.length > 1;
    const baseSize = isEmoji ? 18 : 10;
    const sizeVariation = Math.random() * 16;
    const left = Math.random() * 100;
    const driftX = (Math.random() - 0.5) * 100;
    const rotateEnd = (Math.random() - 0.5) * 900;
    const duration = 20 + Math.random() * 35;
    const delay = Math.random() * duration;
    const animationType = Math.random() < 0.4 ? "slow" : Math.random() < 0.7 ? "medium" : "fast";
    const swayDelay = Math.random() * 8;
    const swayDuration = 5 + Math.random() * 5;

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
      opacity: 0.25 + Math.random() * 0.35,
    });
  }
  return petals;
}

function generateFallingLeaves(count: number) {
  const leaves = [];
  const types = FALLING_LEAVES.flatMap(p => Array(p.weight).fill(p.char));

  for (let i = 0; i < count; i++) {
    const char = types[Math.floor(Math.random() * types.length)];
    const left = Math.random() * 100;
    const driftX = (Math.random() - 0.5) * 60;
    const rotateEnd = (Math.random() - 0.5) * 540;
    const duration = 25 + Math.random() * 20;
    const delay = Math.random() * duration;
    const size = 14 + Math.random() * 12;
    const swayDuration = 6 + Math.random() * 4;

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
      swayDelay: Math.random() * 8,
      swayDuration,
      opacity: 0.15 + Math.random() * 0.25,
    });
  }
  return leaves;
}

function PetalLayer() {
  const [isMobile, setIsMobile] = useState(false);
  const petals = useMemo(() => generatePetals(isMobile ? 20 : 50, isMobile), [isMobile]);
  const fallingLeaves = useMemo(() => generateFallingLeaves(isMobile ? 8 : 18), [isMobile]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="petal-layer" aria-hidden="true" role="img" aria-label="Floating flower petals and falling leaves">
      {petals.map((p) => (
        <span
          key={p.id}
          className="petal"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animation: `
              petal-float-${p.animationType} ${p.duration}s linear ${p.delay}s infinite,
              petal-sway ${p.swayDuration}s ease-in-out ${p.swayDelay}s infinite
            `,
            "--drift-x": `${p.driftX}px`,
            "--rotate-end": `${p.rotateEnd}deg`,
          } as React.CSSProperties}
        >
          {p.char}
        </span>
      ))}
      {fallingLeaves.map((p) => (
        <span
          key={p.id}
          className="petal falling-leaf"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animation: `
              petal-float-slow ${p.duration}s linear ${p.delay}s infinite,
              petal-sway ${p.swayDuration}s ease-in-out ${p.swayDelay}s infinite
            `,
            "--drift-x": `${p.driftX}px`,
            "--rotate-end": `${p.rotateEnd}deg`,
          } as React.CSSProperties}
        >
          {p.char}
        </span>
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
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground reveal-gentle" style={{ animationDelay: "0ms" }}>
        Chapter {number}
      </p>
      <h2 className="text-balance text-4xl font-medium leading-tight text-foreground md:text-5xl lg:text-6xl reveal-gentle" style={{ animationDelay: "100ms" }}>
        {title}
      </h2>
      {subtitle && (
        <p className="mt-6 mx-auto max-w-2xl font-display text-lg italic leading-7 text-muted-foreground md:text-xl reveal-gentle" style={{ animationDelay: "200ms" }}>
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

function EmotionalParticles({ triggerId, particleCount = 12, types = ["heart", "sparkle", "petal", "rose", "wilted"] }: EmotionalParticlesProps) {
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
      { threshold: 0.3, rootMargin: "0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

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
            p.type === "heart" ? "celebration-heart" :
            p.type === "sparkle" ? "celebration-sparkle" :
            p.type === "wilted" ? "celebration-wilted" :
            "celebration-petal"
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

function FlowerAccent({ position = "top", className = "" }: { position?: "top" | "bottom" | "both"; className?: string }) {
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
            <span key={`top-${i}`} className="text-2xl animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
              {f}
            </span>
          ))}
        </div>
      )}
      {(position === "bottom" || position === "both") && (
        <div className="flex gap-1 opacity-50">
          {flowers.bottom.map((f, i) => (
            <span key={`bottom-${i}`} className="text-xl" style={{ animationDelay: `${i * 0.2}s` }}>
              {f}
            </span>
          ))}
        </div>
      )}
    </div>
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
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <section id="opening" className="grain relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24" role="region" aria-label="Opening">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div className="text-6xl opacity-10 animate-pulse" style={{ animationDelay: "0s" }}>🥀</div>
      </div>
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <FlowerAccent position="top" className="mb-6" />
        <div className={`reveal ${phase >= 1 ? "" : "opacity-0"}`} style={{ animationDelay: "0ms" }}>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.4em] text-muted-foreground">A Letter</p>
          <h1 className="text-balance text-5xl font-medium leading-none text-foreground md:text-7xl lg:text-8xl">
            That Was Never<br /><span className="text-primary">Meant to Be Sent</span>
          </h1>
        </div>

        <div className={`transition-all duration-700 ${phase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <p className="mt-6 mx-auto max-w-2xl font-display text-lg italic leading-8 text-muted-foreground md:text-xl">
            "Perhaps this was never really meant for her."
          </p>
          <p className="mt-3 mx-auto max-w-2xl font-display text-lg italic leading-8 text-muted-foreground md:text-xl">
            "Perhaps it was only meant to be written."
          </p>
        </div>

        <div className={`mt-12 transition-all duration-700 ${phase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <FlowerAccent position="both" className="my-4" />
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground/60">Scroll to begin</p>
          <ArrowDown className="mx-auto mt-3 h-7 w-7 text-muted-foreground/50 animate-bounce" />
        </div>
        
        <div className={`mt-8 transition-all duration-700 ${phase >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <p className="font-hand text-lg text-primary/60 italic">For Aneesha... 🌸</p>
        </div>
        <FlowerAccent position="bottom" className="mt-6" />
      </div>
    </section>
  );
}

/* ============================================================
   CHAPTER CONTENT
   ============================================================ */

function ChapterContent({ chapter, index, initiallyVisible }: { chapter: Chapter; index: number; initiallyVisible?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(initiallyVisible ?? false);
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
      { threshold: 0.1, rootMargin: "50px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [initiallyVisible]);

  // Emotional triggers for specific chapters - more flowers for sad chapters
  const sadChapters = ["one-look", "noticing", "looking-for-her", "confession", "no", "afterwards", "self-awareness", "presence-without-place", "ordinary-moments", "hope", "light-left-on", "not-possession", "ending"];
  const showParticles = sadChapters.includes(chapter.id);
  
  const getParticleConfig = (id: string) => {
    if (id === "no") return { count: 16, types: ["wilted", "petal", "sparkle", "rose"] as const };
    if (["afterwards", "light-left-on", "not-possession"].includes(id)) return { count: 14, types: ["wilted", "rose", "sparkle"] as const };
    if (["confession", "self-awareness", "ending"].includes(id)) return { count: 12, types: ["heart", "rose", "wilted", "sparkle"] as const };
    return { count: 10, types: ["petal", "rose", "sparkle", "wilted"] as const };
  };
  
  const particleConfig = getParticleConfig(chapter.id);

  return (
    <>
      {showParticles && <EmotionalParticles triggerId={`${chapter.id}-emotion`} particleCount={particleConfig.count} types={particleConfig.types} />}
      <section
        ref={(el) => { ref.current = el; parallaxRef.current = el; }}
        id={chapter.id}
        className={`${sectionClass} px-6 py-20 md:py-28 relative`}
        role="region"
        aria-label={`Chapter ${chapter.number}: ${chapter.title}`}
        style={parallaxStyle}
      >
        <div className="mx-auto max-w-3xl relative z-10">
          <SectionHeading number={chapter.number} title={chapter.title} subtitle={chapter.subtitle} className={visible ? "" : "opacity-0"} />

          <div className={`prose max-w-none ${visible ? "" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
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
            <div className={`mt-12 grid gap-4 sm:grid-cols-2 ${visible ? "" : "opacity-0"}`} style={{ animationDelay: "200ms" }}>
              {chapter.details.map((detail, i) => (
                <article
                  key={`${chapter.id}-detail-${i}`}
                  className="p-5 border border-border/40 bg-card/50 shadow-soft hover-lift transition-colors duration-300 hover:border-primary/30"
                >
                  <span className="text-xs text-muted-foreground uppercase tracking-[0.2em]">{detail.label}</span>
                  <h3 className="mt-1 text-lg font-medium text-foreground">{detail.label}</h3>
                  <p className="mt-2 font-display text-sm italic leading-6 text-muted-foreground">{detail.description}</p>
                </article>
              ))}
            </div>
          )}

          {chapter.id === "ordinary-moments" && (
            <div className={`mt-12 space-y-6 ${visible ? "" : "opacity-0"}`} style={{ animationDelay: "200ms" }}>
              <div className="grid gap-4 sm:grid-cols-2">
                <article className="p-5 border border-border/40 bg-card/50 shadow-soft hover-lift">
                  <span className="text-xs text-muted-foreground uppercase tracking-[0.2em]">For Her</span>
                  <h3 className="mt-1 text-lg font-medium text-foreground">An ordinary moment</h3>
                  <p className="mt-2 font-display text-sm italic leading-6 text-muted-foreground">She walks past. She attends class. She probably forgets the moment it passes.</p>
                </article>
                <article className="p-5 border border-primary/20 bg-primary/5 shadow-letter hover-lift">
                  <span className="text-xs text-primary uppercase tracking-[0.2em]">For Him</span>
                  <h3 className="mt-1 text-lg font-medium text-primary">A memory</h3>
                  <p className="mt-2 font-display text-sm italic leading-6 text-primary-foreground/90">He notices. He remembers. He remembers much longer than he should.<br /><span className="text-xs not-italic">"Uske liye ek ordinary moment, mere liye poori raat ki soch."</span></p>
                </article>
              </div>
            </div>
          )}

          {chapter.id === "light-left-on" && (
            <div className={`mt-12 relative aspect-square max-w-md mx-auto ${visible ? "" : "opacity-0"}`} style={{ animationDelay: "300ms" }}>
              <div className="relative flex h-full items-center justify-center glow-pulse">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-warm-gold/30 to-muted-rose/30 blur-xl" aria-hidden="true" />
                <div className="relative z-10 h-20 w-20 rounded-full bg-gradient-to-br from-warm-gold to-muted-rose shadow-[0_0_40px_color-mix(in_oklab,var(--warm-gold)_30%,transparent)]" aria-hidden="true" />
                <div className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 text-center w-72">
                  <p className="font-display text-sm italic text-muted-foreground">"You don&apos;t know whether anyone will ever come through the door."</p>
                  <p className="mt-1 font-display text-sm italic text-muted-foreground">"But you still don&apos;t switch it off."</p>
                  <p className="mt-3 font-hand text-base text-primary">Ek chhoti si roshni abhi tak jal rahi hai.</p>
                </div>
              </div>
            </div>
          )}

          {chapter.id === "not-possession" && (
            <div className={`mt-12 space-y-4 text-center ${visible ? "" : "opacity-0"}`} style={{ animationDelay: "200ms" }}>
              <div className="space-y-1">
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground reveal-gentle" style={{ animationDelay: "0ms" }}>Not possession.</p>
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground reveal-gentle" style={{ animationDelay: "100ms" }}>Not a promise.</p>
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground reveal-gentle" style={{ animationDelay: "200ms" }}>Not even an answer.</p>
              </div>
              <p className="font-hand text-xl text-primary md:text-2xl reveal-gentle" style={{ animationDelay: "400ms" }}>Bas samajh.</p>
            </div>
          )}

          {index < chapters.length - 1 && <ChapterDivider />}
        </div>
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

  useEffect(() => () => { if (source) URL.revokeObjectURL(source); }, [source]);

  const chooseSong = useCallback((file?: File) => {
    if (!file) return;
    if (source) URL.revokeObjectURL(source);
    const url = URL.createObjectURL(file);
    setSource(url);
    setTitle(file.name.replace(/\.[^.]+$/, ""));
    setPlaying(false);
    setError(null);
  }, [source]);

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !source) return;
    try {
      if (audio.paused) { await audio.play(); setPlaying(true); setError(null); }
      else { audio.pause(); setPlaying(false); }
    } catch { setError("Unable to play audio."); setPlaying(false); }
  }, [source]);

  return (
    <div className="mt-10 flex flex-col items-center gap-3 md:flex-row md:justify-center">
      <audio ref={audioRef} src={source} onEnded={() => setPlaying(false)} onError={() => setError("Audio playback failed")} />
      <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-card/60 px-5 text-sm font-medium text-foreground shadow-soft hover-lift hover:border-primary/40 focus-within:ring-2 focus-within:ring-ring transition-all duration-200">
        <Upload className="h-4 w-4" /> {source ? "Change song" : "Add a song"}
        <input className="sr-only" type="file" accept="audio/*" onChange={(e) => chooseSong(e.target.files?.[0])} disabled={playing} />
      </label>
      {source && <Button variant="delicate" size="lg" className="h-11 max-w-56 hover-scale" onClick={toggle} aria-label={playing ? `Pause ${title}` : `Play ${title}`} disabled={error !== null}>{playing ? <Pause /> : <Play />} <span className="truncate">{title}</span></Button>}
      {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
      <p className="w-full text-center text-xs text-muted-foreground">Song stays on this device. Plays only when you press play.</p>
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
        <SectionHeading number="—" title="The Letter" subtitle="The words that were never sent. Written to understand, not to confess." />
        <div className="relative">
          <FlowerAccent position="top" className="mb-4 opacity-40" />
          <div className="grain border border-border/70 bg-parchment px-4 py-8 md:px-8 md:py-12 shadow-letter paper-texture md:-rotate-[.3deg] hover-lift transition-all duration-500 relative">
            <div className="absolute top-4 right-4 text-2xl opacity-30" aria-hidden="true">🌸</div>
            <div className="absolute bottom-4 left-4 text-2xl opacity-30" aria-hidden="true">🥀</div>
            <h2 className="font-hand text-3xl text-burgundy md:text-4xl">Dear Aneesha,</h2>
            <div className="mt-5 font-display text-sm leading-8 text-foreground/80 md:text-base whitespace-pre-wrap overflow-wrap-break-word">{originalLetter}</div>
            <div className="mt-6 pt-4 border-t border-border/50">
              <p className="font-hand text-sm text-muted-foreground text-right md:text-base">— from someone who never planned to fall for you, but did anyway, quietly, completely.</p>
            </div>
          </div>
          <FlowerAccent position="bottom" className="mt-4 opacity-40" />
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">This letter lives here. It was never sent. It was only written. 🌸</p>
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
  celebration: "none" | "yes" | "no";
}

function FinalPage({ onYes, onNo, celebration }: FinalPageProps) {
  const lastChapter = chapters[chapters.length - 1];
  const lastLines = lastChapter?.lines ?? [];

  const isYes = celebration === "yes";
  const isNo = celebration === "no";

  return (
    <>
      {isYes && <CelebrationYes />}
      {isNo && <CelebrationNo />}
      <section id="final" className="grain relative flex min-h-[80vh] items-center justify-center px-6 py-24">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {(isYes || isNo) && (
            <div className="absolute inset-0 bg-gradient-to-t from-warm-gold/5 via-transparent to-transparent glow-pulse" />
          )}
          {!isYes && !isNo && (
            <div className="absolute inset-0 flex items-center justify-center opacity-10" aria-hidden="true">
              <span className="text-8xl animate-pulse">🥀</span>
            </div>
          )}
        </div>
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <FlowerAccent position="top" className="mb-6 opacity-50" />
          <p className="font-display text-xl italic text-muted-foreground md:text-2xl reveal-gentle" style={{ animationDelay: "0ms" }}>{lastLines[lastLines.length - 4] ?? ""}</p>
          <div className="mx-auto my-8 h-px w-16 bg-warm-gold/60 reveal-gentle" style={{ animationDelay: "100ms" }} />
          <p className="text-balance font-display text-3xl leading-tight text-foreground md:text-4xl lg:text-5xl reveal-gentle" style={{ animationDelay: "200ms" }}>{lastLines[lastLines.length - 3] ?? ""}</p>
          <p className="mt-8 font-hand text-2xl text-primary md:text-3xl reveal-gentle" style={{ animationDelay: "300ms" }}>{lastLines[lastLines.length - 2] ?? ""}</p>
          <p className="mt-12 font-display text-base italic text-muted-foreground md:text-lg reveal-gentle" style={{ animationDelay: "400ms" }}>{lastLines[lastLines.length - 1] ?? ""}</p>
          <FlowerAccent position="bottom" className="mt-8 opacity-50" />

          <div className="mt-14 flex flex-col items-center gap-4">
            <div className="flex gap-4" role="group" aria-label="Response">
              <Button
                variant="moonlit"
                size="lg"
                className="h-12 min-w-32 hover-glow hover-scale"
                onClick={onYes}
                disabled={isYes || isNo}
                aria-label="Yes"
              >
                <Heart className="mr-2 h-4 w-4" /> Yes
              </Button>
              <Button
                variant="delicate"
                size="lg"
                className="h-12 min-w-32 hover-scale"
                onClick={onNo}
                disabled={isYes || isNo}
                aria-label="No"
              >
                No
              </Button>
            </div>

            {isYes && (
              <div className="celebration-text space-y-3 text-gradient-gold" role="status" aria-live="polite">
                <FlowerAccent position="top" className="mb-2" />
                <p className="font-display text-xl italic">She knows now. 🌸</p>
                <p className="font-display text-lg italic text-muted-foreground">The letter reached her.</p>
                <FlowerAccent position="bottom" className="mt-2" />
              </div>
            )}

            {isNo && (
              <div className="celebration-text space-y-3" role="status" aria-live="polite">
                <FlowerAccent position="top" className="mb-2" />
                <p className="font-display text-xl italic text-muted-foreground">That&apos;s okay. 🥀</p>
                <p className="font-display text-lg italic text-muted-foreground/70">The letter stays here. Unsent. Understood.</p>
                <FlowerAccent position="bottom" className="mt-2" />
              </div>
            )}

            {!isYes && !isNo && (
              <Button variant="delicate" className="mt-4 hover-scale" onClick={() => document.querySelector("#opening")?.scrollIntoView({ behavior: "smooth" })}>
                Begin again <ArrowUp className="ml-2 h-4 w-4" />
              </Button>
            )}
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

  if (!mounted) return null;

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

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true" role="img" aria-label="Flower celebration">
      {roses.map((p) => (
        <span
          key={p.id}
          className="celebration-petal"
          style={{
            left: `${p.left}%`,
            bottom: "-5%",
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${4 + Math.random() * 2}s`,
            "--drift-x": `${p.driftX}px`,
            "--rotate-end": `${p.rotateEnd}deg`,
          } as React.CSSProperties}
        >
          🌹
        </span>
      ))}
      {petals.map((p) => (
        <span
          key={p.id}
          className="celebration-petal"
          style={{
            left: `${p.left}%`,
            bottom: "-5%",
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            "--drift-x": `${p.driftX}px`,
            "--rotate-end": `${p.rotateEnd}deg`,
          } as React.CSSProperties}
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

  if (!mounted) return null;

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

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true" role="img" aria-label="Melancholic acknowledgment">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="celebration-text text-center space-y-2">
          <span className="block text-6xl animate-pulse" style={{ animationDuration: "3s" }}>🥀</span>
          <p className="font-display text-lg italic text-muted-foreground/60">The letter remains here, quietly.</p>
          <p className="font-hand text-sm text-primary/50">Some letters are only meant to be written...</p>
        </div>
      </div>
      {wiltedPetals.map((p) => (
        <span
          key={p.id}
          className="celebration-wilted"
          style={{
            left: `${p.left}%`,
            top: "50%",
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            "--drift-x": `${p.driftX}px`,
            "--rotate-end": `${p.rotateEnd}deg`,
          } as React.CSSProperties}
        >
          {p.char}
        </span>
      ))}
      {tears.map((t) => (
        <span
          key={t.id}
          className="celebration-wilted"
          style={{
            left: `${t.left}%`,
            top: "45%",
            fontSize: `${t.size}px`,
            animationDelay: `${t.delay}s`,
            animationDuration: `${4 + Math.random() * 2}s`,
          } as React.CSSProperties}
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
      { threshold: 0.1, rootMargin: "50px" }
    );

    refs.current.forEach((ref) => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {children}
      <style dangerouslySetInnerHTML={{
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
      }} />
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
    if (playing) { audio.pause(); }
    else { audio.play().catch(() => {}); }
    setPlaying(!playing);
  };

  return (
    <button
      onClick={toggle}
      className="fixed bottom-5 right-5 z-40 rounded-full bg-card/70 backdrop-blur-sm p-2.5 shadow-letter border border-border/40 hover:bg-card hover-glow focus-ring transition-all duration-200"
      aria-label={playing ? "Pause music" : "Play music"}
      aria-pressed={playing}
    >
      {playing ? <Pause className="h-4.5 w-4.5 text-foreground" /> : <Music2 className="h-4.5 w-4.5 text-foreground" />}
    </button>
  );
}

/* ============================================================
   MAIN APP
   ============================================================ */

function LetterWorld() {
  const [celebration, setCelebration] = useState<"none" | "yes" | "no">("none");

  const handleYes = () => setCelebration("yes");
  const handleNo = () => setCelebration("no");

  return (
    <>
      <PetalLayer />
      <div className="scroll-progress" aria-hidden="true" role="progressbar" aria-valuemin={0} aria-valuemax={100} />
      <AudioControl />
      <main className="min-h-screen relative z-0">
        <OpeningScreen />
        <ChapterObserver>
          {chapters.map((chapter, index) => (
            <ChapterContent
              key={chapter.id}
              chapter={chapter}
              index={index}
              initiallyVisible={index === 0}
            />
          ))}
        </ChapterObserver>
        <TheLetter />
        <FinalPage onYes={handleYes} onNo={handleNo} celebration={celebration} />
      </main>
    </>
  );
}