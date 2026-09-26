import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  Music2,
  Pause,
  Play,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { chapters, siteMeta, type Chapter } from "@/content/letter";

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

const iconMap: Record<string, LucideIcon> = {
  music: Music2,
};

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
  return (
    <div className="my-24 mx-auto max-w-3xl chapter-divider" aria-hidden="true" />
  );
}

function OpeningScreen() {
  const [visible, setVisible] = useState<"title" | "subtitle" | "cta" | null>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible("title"), 600);
    const t2 = setTimeout(() => setVisible("subtitle"), 1800);
    const t3 = setTimeout(() => setVisible("cta"), 3200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <section
      id="opening"
      className="grain relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24"
      role="region"
      aria-label="Opening"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />
      <div aria-hidden="true" className="absolute left-[10%] top-[20%] h-64 w-64 rounded-full bg-burgundy/10 blur-3xl" />
      <div aria-hidden="true" className="absolute right-[10%] bottom-[20%] h-64 w-64 rounded-full bg-muted-rose/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="reveal" style={{ animationDelay: visible === "title" ? "0ms" : "2000ms" }}>
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.4em] text-muted-foreground">
            A Letter
          </p>
          <h1 className="text-balance text-5xl font-medium leading-none text-foreground md:text-7xl lg:text-8xl">
            That Was Never
            <br />
            <span className="text-primary">Meant to Be Sent</span>
          </h1>
        </div>

        <div
          className={`transition-all duration-1000 ${visible === "subtitle" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <p className="mt-8 mx-auto max-w-2xl font-display text-lg italic leading-8 text-muted-foreground md:text-xl">
            "Perhaps this was never really meant for her."
          </p>
          <p className="mt-4 mx-auto max-w-2xl font-display text-lg italic leading-8 text-muted-foreground md:text-xl">
            "Perhaps it was only meant to be written."
          </p>
        </div>

        <div
          className={`mt-16 transition-all duration-1000 ${visible === "cta" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground/60">
            Scroll to begin reading
          </p>
          <ArrowDown className="mx-auto mt-4 h-8 w-8 text-muted-foreground/50 animate-bounce" />
        </div>
      </div>
    </section>
  );
}

function ChapterContent({ chapter, index }: { chapter: Chapter; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "-50px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const isDarkSection = ["no", "afterwards", "light-left-on"].includes(chapter.id);
  const sectionClass = isDarkSection ? "section-dim grain" : "grain-subtle";

  const hasDetails = "details" in chapter && chapter.details !== undefined;

  return (
    <section
      ref={ref}
      id={chapter.id}
      className={`${sectionClass} px-6 py-24 md:py-32`}
      role="region"
      aria-label={`Chapter ${chapter.number}: ${chapter.title}`}
    >
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          number={chapter.number}
          title={chapter.title}
          subtitle={chapter.subtitle}
          className={visible ? "reveal" : "opacity-0"}
        />

        <div
          className={`prose max-w-none ${visible ? "reveal" : "opacity-0"}`}
          style={{ animationDelay: "200ms" }}
        >
          {chapter.lines.map((line, i) => (
            <p
              key={`${chapter.id}-${i}`}
              className={`font-display text-lg leading-9 text-foreground/80 md:text-xl ${
                line === "" ? "h-6" : "mb-6"
              } ${line.startsWith("Bas ") || line.startsWith("Aur ") || line.startsWith("Lekin ") || line.startsWith("Phir ") || line.startsWith("Uska ") || line.startsWith("Kuch ") || line.startsWith("ke ") ? "italic text-primary/90" : ""}`}
            >
              {line}
            </p>
          ))}
        </div>

        {hasDetails && chapter.details && (
          <div
            className={`mt-16 grid gap-6 sm:grid-cols-2 ${visible ? "reveal" : "opacity-0"}`}
            style={{ animationDelay: "300ms" }}
          >
            {chapter.details.map((detail, i) => (
              <article
                key={`${chapter.id}-detail-${i}`}
                className="group relative p-6 border border-border/50 bg-card/50 shadow-soft transition-all duration-500 hover:border-primary/30 hover:-translate-y-1"
              >
                <span className="text-xs text-muted-foreground uppercase tracking-[0.2em]">
                  {detail.label}
                </span>
                <h3 className="mt-2 text-xl font-medium text-foreground">
                  {detail.label}
                </h3>
                <p className="mt-3 font-display text-base italic leading-6 text-muted-foreground">
                  {detail.description}
                </p>
              </article>
            ))}
          </div>
        )}

        {chapter.id === "ordinary-moments" && (
          <div
            className={`mt-16 space-y-8 ${visible ? "reveal" : "opacity-0"}`}
            style={{ animationDelay: "300ms" }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <article className="p-6 border border-border/50 bg-card/50 shadow-soft">
                <span className="text-xs text-muted-foreground uppercase tracking-[0.2em]">For Her</span>
                <h3 className="mt-2 text-xl font-medium text-foreground">An ordinary moment</h3>
                <p className="mt-3 font-display text-base italic leading-6 text-muted-foreground">
                  She walks past. She attends class. She probably forgets the moment it passes.
                </p>
              </article>
              <article className="p-6 border border-primary/30 bg-primary/5 shadow-letter">
                <span className="text-xs text-primary uppercase tracking-[0.2em]">For Him</span>
                <h3 className="mt-2 text-xl font-medium text-primary">A memory</h3>
                <p className="mt-3 font-display text-base italic leading-6 text-primary-foreground/90">
                  He notices. He remembers. He remembers much longer than he should.
                  <br />
                  <span className="text-sm not-italic">"Uske liye ek ordinary moment, mere liye poori raat ki soch."</span>
                </p>
              </article>
            </div>
          </div>
        )}

        {chapter.id === "light-left-on" && (
          <div
            className={`mt-16 relative aspect-square max-w-md mx-auto ${visible ? "reveal" : "opacity-0"}`}
            style={{ animationDelay: "400ms" }}
          >
            <div className="absolute inset-0 rounded-full bg-charcoal/20 blur-3xl" aria-hidden="true" />
            <div className="relative flex h-full items-center justify-center">
              <div
                className="absolute h-16 w-16 rounded-full bg-warm-gold/20 blur-2xl animate-pulse-soft"
                aria-hidden="true"
              />
              <div className="relative z-10 h-24 w-24 rounded-full bg-gradient-to-br from-warm-gold to-muted-rose shadow-[0_0_60px_color-mix(in_oklab,var(--warm-gold)_40%,transparent)]" />
              <div className="absolute bottom-[-60px] left-1/2 -translate-x-1/2 text-center w-80">
                <p className="font-display text-sm italic text-muted-foreground">
                  "You don&apos;t know whether anyone will ever come through the door."
                </p>
                <p className="mt-2 font-display text-sm italic text-muted-foreground">
                  "But you still don&apos;t switch it off."
                </p>
                <p className="mt-4 font-hand text-lg text-primary">Ek chhoti si roshni abhi tak jal rahi hai.</p>
              </div>
            </div>
          </div>
        )}

        {chapter.id === "not-possession" && (
          <div
            className={`mt-16 space-y-6 text-center ${visible ? "reveal" : "opacity-0"}`}
            style={{ animationDelay: "300ms" }}
          >
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Not possession.</p>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Not a promise.</p>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Not even an answer.</p>
            </div>
            <p className="font-hand text-2xl text-primary md:text-3xl">Bas samajh.</p>
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

  useEffect(() => {
    return () => {
      if (source) URL.revokeObjectURL(source);
    };
  }, [source]);

  const chooseSong = (file?: File) => {
    if (!file) return;
    if (source) URL.revokeObjectURL(source);
    const url = URL.createObjectURL(file);
    setSource(url);
    setTitle(file.name.replace(/\.[^.]+$/, ""));
    setPlaying(false);
    setError(null);
  };

  const toggle = async () => {
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
    } catch (e) {
      setError("Unable to play audio. Please try a different file.");
      setPlaying(false);
    }
  };

  return (
    <div className="mt-12 flex flex-col items-center gap-4 md:flex-row md:justify-center">
      <audio
        ref={audioRef}
        src={source}
        onEnded={() => setPlaying(false)}
        onError={() => setError("Audio playback failed")}
      />
      <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-card/70 px-6 text-sm font-medium text-foreground shadow-soft transition hover:border-primary/50 focus-within:ring-2 focus-within:ring-ring">
        <Upload className="h-4 w-4" />
        {source ? "Change song" : "Add a song"}
        <input
          className="sr-only"
          type="file"
          accept="audio/*"
          onChange={(event) => chooseSong(event.target.files?.[0])}
          disabled={playing}
        />
      </label>
      {source && (
        <Button
          variant="delicate"
          size="lg"
          className="h-12 max-w-64"
          onClick={toggle}
          aria-label={playing ? `Pause ${title}` : `Play ${title}`}
          disabled={error !== null}
        >
          {playing ? <Pause /> : <Play />}
          <span className="truncate">{title}</span>
        </Button>
      )}
      {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
      <p className="w-full text-center text-xs text-muted-foreground">
        The song stays on this device and only plays when you press play.
      </p>
    </div>
  );
}

function LetterWriter() {
  const [letter, setLetter] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("anisha-letter");
    if (stored) setLetter(stored);
  }, []);

  const update = (value: string) => {
    setLetter(value);
    try {
      localStorage.setItem("anisha-letter", value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // private browsing may block storage
    }
  };

  return (
    <section className="grain-subtle px-6 py-24 md:py-32" id="your-letter">
      <div className="mx-auto max-w-3xl">
        <SectionHeading number="—" title="Your Letter" subtitle="Write the things that only sound right in your own words…" />

        <div className="grain -rotate-[.3deg] border border-border/70 bg-parchment px-7 py-10 shadow-letter sm:px-12 md:px-16 md:py-14 paper-texture">
          <h2 className="font-hand text-4xl text-burgundy md:text-5xl">Dear Anisha,</h2>
          <label htmlFor="anisha-letter" className="sr-only">
            Your personal letter to Anisha
          </label>
          <textarea
            id="anisha-letter"
            value={letter}
            onChange={(e) => update(e.target.value)}
            placeholder="Write the things that only sound right in your own words…"
            className="mt-7 min-h-64 w-full resize-y border-0 border-b border-border/60 bg-transparent py-4 font-hand text-2xl leading-10 text-foreground placeholder:text-muted-foreground/65 focus:ring-0 focus:outline-none md:min-h-80 md:text-3xl"
            spellCheck={false}
          />
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <p className="max-w-md font-hand text-lg text-muted-foreground">
              — from someone who never planned to fall for you, but did anyway, quietly, completely.
            </p>
            {letter && (
              <Button variant="ghost" size="sm" onClick={() => update("")}>
                Clear letter
              </Button>
            )}
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {saved ? "Saved." : "Saved privately in this browser as you write."}
        </p>
      </div>
    </section>
  );
}

function FinalPage() {
  const lastChapter = chapters[chapters.length - 1];
  const lastLines = lastChapter?.lines ?? [];

  return (
    <section
      id="final"
      className="grain relative flex min-h-[80vh] items-center justify-center px-6 py-24"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <p className="font-display text-2xl italic text-muted-foreground md:text-3xl">
          {lastLines[lastLines.length - 4] ?? ""}
        </p>
        <div className="mx-auto my-10 h-px w-20 bg-warm-gold/60" />
        <p className="text-balance font-display text-4xl leading-tight text-foreground md:text-5xl lg:text-6xl">
          {lastLines[lastLines.length - 3] ?? ""}
        </p>
        <p className="mt-10 font-hand text-3xl text-primary md:text-4xl">
          {lastLines[lastLines.length - 2] ?? ""}
        </p>
        <p className="mt-16 font-display text-lg italic text-muted-foreground md:text-xl">
          {lastLines[lastLines.length - 1] ?? ""}
        </p>
        <Button
          variant="delicate"
          className="mt-16"
          onClick={() => document.querySelector("#opening")?.scrollIntoView({ behavior: "smooth" })}
        >
          Begin again <ArrowUp className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}

function ProgressIndicator() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;
      setProgress(scrollPercent);
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 h-0.5 z-50 pointer-events-none"
      aria-hidden="true"
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-gradient-to-r from-warm-gold to-muted-rose origin-left"
        style={{ transform: `scaleX(${progress})`, transformOrigin: "left" }}
      />
    </div>
  );
}

function AudioControl() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/WhatsApp Audio 2026-09-13 at 2.18.41 PM.mpeg");
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
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
      className="fixed bottom-6 right-6 z-40 rounded-full bg-card/80 backdrop-blur-sm p-3 shadow-letter border border-border/50 hover:bg-card focus-ring transition-all duration-300"
      aria-label={playing ? "Pause music" : "Play music"}
      aria-pressed={playing}
    >
      {playing ? (
        <Pause className="h-5 w-5 text-foreground" />
      ) : (
        <Music2 className="h-5 w-5 text-foreground" />
      )}
    </button>
  );
}

function LetterWorld() {
  return (
    <>
      <ProgressIndicator />
      <AudioControl />
      <main className="min-h-screen">
        <OpeningScreen />
        {chapters.map((chapter, index) => (
          <ChapterContent key={chapter.id} chapter={chapter} index={index} />
        ))}
        <LetterWriter />
        <FinalPage />
      </main>
    </>
  );
}