import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
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

interface SectionHeadingProps {
  number: string;
  title: string;
  subtitle?: string;
  className?: string;
}

function SectionHeading({ number, title, subtitle, className }: SectionHeadingProps) {
  return (
    <header className={`mx-auto mb-16 max-w-3xl text-center ${className ?? ""}`}>
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
        Chapter {number}
      </p>
      <h2 className="text-balance text-4xl font-medium leading-tight text-foreground md:text-5xl lg:text-6xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-6 mx-auto max-w-2xl font-display text-lg italic leading-7 text-muted-foreground md:text-xl">
          {subtitle}
        </p>
      )}
    </header>
  );
}

function ChapterDivider() {
  return <div className="my-24 mx-auto max-w-3xl chapter-divider" aria-hidden="true" />;
}

function OpeningScreen() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <section id="opening" className="grain relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24" role="region" aria-label="Opening">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
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
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground/60">Scroll to begin</p>
          <ArrowDown className="mx-auto mt-3 h-7 w-7 text-muted-foreground/50 animate-bounce" />
        </div>
      </div>
    </section>
  );
}

function ChapterContent({ chapter, index, initiallyVisible }: { chapter: Chapter; index: number; initiallyVisible?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(initiallyVisible ?? false);

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

  const isDarkSection = ["no", "afterwards", "light-left-on"].includes(chapter.id);
  const sectionClass = isDarkSection ? "section-dim grain" : "grain-subtle";
  const hasDetails = "details" in chapter && chapter.details !== undefined;

  return (
    <section ref={ref} id={chapter.id} className={`${sectionClass} px-6 py-20 md:py-28`} role="region" aria-label={`Chapter ${chapter.number}: ${chapter.title}`}>
      <div className="mx-auto max-w-3xl">
        <SectionHeading number={chapter.number} title={chapter.title} subtitle={chapter.subtitle} className={visible ? "reveal" : "opacity-0"} />

        <div className={`prose max-w-none ${visible ? "reveal" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
          {chapter.lines.map((line, i) => (
            <p key={`${chapter.id}-${i}`} className={`font-display text-lg leading-9 text-foreground/80 md:text-xl ${line === "" ? "h-6" : "mb-5"} ${line.startsWith("Bas ") || line.startsWith("Aur ") || line.startsWith("Lekin ") || line.startsWith("Phir ") || line.startsWith("Uska ") || line.startsWith("Kuch ") || line.startsWith("ke ") ? "italic text-primary/90" : ""}`}>
              {line}
            </p>
          ))}
        </div>

        {hasDetails && chapter.details && (
          <div className={`mt-12 grid gap-4 sm:grid-cols-2 ${visible ? "reveal" : "opacity-0"}`} style={{ animationDelay: "200ms" }}>
            {chapter.details.map((detail, i) => (
              <article key={`${chapter.id}-detail-${i}`} className="p-5 border border-border/40 bg-card/50 shadow-soft transition-colors duration-300 hover:border-primary/30">
                <span className="text-xs text-muted-foreground uppercase tracking-[0.2em]">{detail.label}</span>
                <h3 className="mt-1 text-lg font-medium text-foreground">{detail.label}</h3>
                <p className="mt-2 font-display text-sm italic leading-6 text-muted-foreground">{detail.description}</p>
              </article>
            ))}
          </div>
        )}

        {chapter.id === "ordinary-moments" && (
          <div className={`mt-12 space-y-6 ${visible ? "reveal" : "opacity-0"}`} style={{ animationDelay: "200ms" }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <article className="p-5 border border-border/40 bg-card/50 shadow-soft">
                <span className="text-xs text-muted-foreground uppercase tracking-[0.2em]">For Her</span>
                <h3 className="mt-1 text-lg font-medium text-foreground">An ordinary moment</h3>
                <p className="mt-2 font-display text-sm italic leading-6 text-muted-foreground">She walks past. She attends class. She probably forgets the moment it passes.</p>
              </article>
              <article className="p-5 border border-primary/20 bg-primary/5 shadow-letter">
                <span className="text-xs text-primary uppercase tracking-[0.2em]">For Him</span>
                <h3 className="mt-1 text-lg font-medium text-primary">A memory</h3>
                <p className="mt-2 font-display text-sm italic leading-6 text-primary-foreground/90">He notices. He remembers. He remembers much longer than he should.<br /><span className="text-xs not-italic">"Uske liye ek ordinary moment, mere liye poori raat ki soch."</span></p>
              </article>
            </div>
          </div>
        )}

        {chapter.id === "light-left-on" && (
          <div className={`mt-12 relative aspect-square max-w-md mx-auto ${visible ? "reveal" : "opacity-0"}`} style={{ animationDelay: "300ms" }}>
            <div className="relative flex h-full items-center justify-center">
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
          <div className={`mt-12 space-y-4 text-center ${visible ? "reveal" : "opacity-0"}`} style={{ animationDelay: "200ms" }}>
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Not possession.</p>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Not a promise.</p>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Not even an answer.</p>
            </div>
            <p className="font-hand text-xl text-primary md:text-2xl">Bas samajh.</p>
          </div>
        )}

        {index < chapters.length - 1 && <ChapterDivider />}
      </div>
    </section>
  );
}

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
      <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-card/60 px-5 text-sm font-medium text-foreground shadow-soft transition hover:border-primary/40 focus-within:ring-2 focus-within:ring-ring">
        <Upload className="h-4 w-4" /> {source ? "Change song" : "Add a song"}
        <input className="sr-only" type="file" accept="audio/*" onChange={(e) => chooseSong(e.target.files?.[0])} disabled={playing} />
      </label>
      {source && <Button variant="delicate" size="lg" className="h-11 max-w-56" onClick={toggle} aria-label={playing ? `Pause ${title}` : `Play ${title}`} disabled={error !== null}>{playing ? <Pause /> : <Play />} <span className="truncate">{title}</span></Button>}
      {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
      <p className="w-full text-center text-xs text-muted-foreground">Song stays on this device. Plays only when you press play.</p>
    </div>
  );
}

function TheLetter() {
  return (
    <section className="grain-subtle px-6 py-20 md:py-28" id="the-letter">
      <div className="mx-auto max-w-3xl">
        <SectionHeading number="—" title="The Letter" subtitle="The words that were never sent. Written to understand, not to confess." />
        <div className="grain -rotate-[.3deg] border border-border/70 bg-parchment px-7 py-10 shadow-letter sm:px-12 md:px-16 md:py-14 paper-texture">
          <h2 className="font-hand text-4xl text-burgundy md:text-5xl">Dear Anisha,</h2>
          <div className="mt-6 font-display text-base leading-8 text-foreground/80 md:text-lg whitespace-pre-wrap">{originalLetter}</div>
          <div className="mt-8 pt-6 border-t border-border/50">
            <p className="font-hand text-base text-muted-foreground text-right">— from someone who never planned to fall for you, but did anyway, quietly, completely.</p>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">This letter lives here. It was never sent. It was only written.</p>
      </div>
    </section>
  );
}

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
    <section id="final" className="grain relative flex min-h-[70vh] items-center justify-center px-6 py-20">
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <p className="font-display text-xl italic text-muted-foreground md:text-2xl">{lastLines[lastLines.length - 4] ?? ""}</p>
        <div className="mx-auto my-8 h-px w-16 bg-warm-gold/60" />
        <p className="text-balance font-display text-3xl leading-tight text-foreground md:text-4xl lg:text-5xl">{lastLines[lastLines.length - 3] ?? ""}</p>
        <p className="mt-8 font-hand text-2xl text-primary md:text-3xl">{lastLines[lastLines.length - 2] ?? ""}</p>
        <p className="mt-12 font-display text-base italic text-muted-foreground md:text-lg">{lastLines[lastLines.length - 1] ?? ""}</p>

        <div className="mt-14 flex flex-col items-center gap-4">
          <div className="flex gap-4" role="group" aria-label="Response">
            <Button
              variant="moonlit"
              size="lg"
              className="h-12 min-w-32"
              onClick={onYes}
              disabled={isYes || isNo}
              aria-label="Yes"
            >
              <Heart className="mr-2 h-4 w-4" /> Yes
            </Button>
            <Button
              variant="delicate"
              size="lg"
              className="h-12 min-w-32"
              onClick={onNo}
              disabled={isYes || isNo}
              aria-label="No"
            >
              No
            </Button>
          </div>

          {isYes && (
            <div className="celebration-text space-y-3" role="status" aria-live="polite">
              <p className="font-display text-xl italic text-primary">She knows now. 🌸</p>
              <p className="font-display text-lg italic text-muted-foreground">The letter reached her.</p>
            </div>
          )}

          {isNo && (
            <div className="celebration-text space-y-3" role="status" aria-live="polite">
              <p className="font-display text-xl italic text-muted-foreground">That&apos;s okay. 🥀</p>
              <p className="font-display text-lg italic text-muted-foreground/70">The letter stays here. Unsent. Understood.</p>
            </div>
          )}

          {!isYes && !isNo && (
            <Button variant="delicate" className="mt-4" onClick={() => document.querySelector("#opening")?.scrollIntoView({ behavior: "smooth" })}>
              Begin again <ArrowUp className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* YES Celebration - event-driven, stops after animation */}
        {isYes && (
          <CelebrationYes />
        )}

        {/* NO Celebration - gentle, respectful */}
        {isNo && (
          <CelebrationNo />
        )}
      </div>
    </section>
  );
}

/* YES Celebration - flower petals, sparkles, emojis */
function CelebrationYes() {
  const petals = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: 10 + Math.random() * 80,
    delay: Math.random() * 0.8,
    duration: 2.5 + Math.random() * 1.5,
    size: 16 + Math.random() * 16,
    emoji: ["🌸", "🌺", "🌷", "💐", "✨", "❤️"][Math.floor(Math.random() * 6)],
  }));

  const sparkles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: 5 + Math.random() * 90,
    top: 20 + Math.random() * 60,
    delay: Math.random() * 0.5,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true" role="img" aria-label="Flower celebration">
      {petals.map((p) => (
        <span
          key={p.id}
          className="celebration-petal fixed text-2xl"
          style={{
            left: `${p.left}%`,
            bottom: "-5%",
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          {p.emoji}
        </span>
      ))}
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="celebration-sparkle fixed text-lg"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            animationDelay: `${s.delay}s`,
          }}
        >
          ✨
        </span>
      ))}
    </div>
  );
}

/* NO Celebration - gentle, single falling flower */
function CelebrationNo() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden flex items-center justify-center" aria-hidden="true" role="img" aria-label="Gentle acknowledgment">
      <div className="celebration-text text-center space-y-2">
        <span className="block text-5xl animate-bounce" style={{ animationDuration: "2s", animationIterationCount: "3" }}>🥀</span>
        <p className="font-display text-lg italic text-muted-foreground/60">The letter remains here, quietly.</p>
      </div>
    </div>
  );
}

/* Single shared IntersectionObserver for all chapters */
function ChapterObserver({ children }: { children: React.ReactNode }) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
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
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const style = document.createElement('style');
              style.textContent = \`
                .scroll-progress { transform: scaleX(0); }
                @supports (animation-timeline: scroll()) {
                  .scroll-progress {
                    animation: scroll-progress-auto linear;
                    animation-timeline: scroll(root);
                  }
                  @keyframes scroll-progress-auto { to { transform: scaleX(1); } }
                }
              \`;
              document.head.appendChild(style);
            })();
          `,
        }}
      />
    </>
  );
}

/* Lightweight audio control - only creates Audio on first interaction */
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
      className="fixed bottom-5 right-5 z-40 rounded-full bg-card/70 backdrop-blur-sm p-2.5 shadow-letter border border-border/40 hover:bg-card focus-ring transition-colors duration-200"
      aria-label={playing ? "Pause music" : "Play music"}
      aria-pressed={playing}
    >
      {playing ? <Pause className="h-4.5 w-4.5 text-foreground" /> : <Music2 className="h-4.5 w-4.5 text-foreground" />}
    </button>
  );
}

function LetterWorld() {
  const [celebration, setCelebration] = useState<"none" | "yes" | "no">("none");

  const handleYes = () => setCelebration("yes");
  const handleNo = () => setCelebration("no");

  return (
    <>
      <div className="scroll-progress" aria-hidden="true" role="progressbar" aria-valuemin={0} aria-valuemax={100} />
      <AudioControl />
      <main className="min-h-screen">
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