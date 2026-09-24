"use client";

import * as React from "react";
import { Play, Pause, RotateCcw, Sparkles, ArrowLeft } from "lucide-react";
import { cn, fa, formatToman } from "@/lib/utils";

export interface TypewriterProps extends React.HTMLAttributes<HTMLElement> {
  /** Text or array of texts to type sequentially */
  text: string | string[];
  /** Typing speed in milliseconds per glyph/character (default: 65ms) */
  speed?: number;
  /** Deletion speed in milliseconds per glyph/character (default: 35ms) */
  deleteSpeed?: number;
  /** Pause duration in milliseconds before deleting or looping (default: 1800ms) */
  delay?: number;
  /** Whether to loop through texts (default: true for arrays, false for single string) */
  loop?: boolean;
  /** Whether to render the pulsing vertical bar cursor (default: true) */
  cursor?: boolean;
  /** Additional styling for the cursor */
  cursorClassName?: string;
  /** Callback fired when the typing sequence completes */
  onComplete?: () => void;
  /** HTML element wrapper (default: 'span') */
  as?: React.ElementType;
}

/**
 * Typewriter: React + Tailwind CSS animation for Persian & RTL text.
 * 
 * Guarantees:
 * • Renders text.slice(0, n) as a single continuous string to keep Persian cursive glyph joining intact.
 * • Renders a pulsing vertical bar cursor at the inline-end.
 * • Accessible: sets aria-label to the full string on the parent wrapper.
 * • Respects prefers-reduced-motion by rendering full string immediately.
 */
export function Typewriter({
  text,
  speed = 65,
  deleteSpeed = 35,
  delay = 1800,
  loop,
  cursor = true,
  cursorClassName,
  onComplete,
  className,
  as: Component = "span",
  ...props
}: TypewriterProps) {
  const texts = React.useMemo(() => {
    if (Array.isArray(text)) return text.filter(Boolean);
    return text ? [text] : [""];
  }, [text]);

  const shouldLoop = loop ?? texts.length > 1;

  const [textIndex, setTextIndex] = React.useState(0);
  const [subIndex, setSubIndex] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  // Check prefers-reduced-motion
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const currentFullText = texts[textIndex] || "";

  React.useEffect(() => {
    // If user prefers reduced motion, immediately show full text and stop
    if (reducedMotion) {
      setSubIndex(currentFullText.length);
      return;
    }

    if (!currentFullText) return;

    // Paused when typed fully
    if (!isDeleting && subIndex === currentFullText.length) {
      if (!shouldLoop && textIndex === texts.length - 1) {
        onComplete?.();
        return;
      }

      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, delay);
      return () => clearTimeout(timeout);
    }

    // Finished deleting, proceed to next word
    if (isDeleting && subIndex === 0) {
      setIsDeleting(false);
      setTextIndex((prev) => (prev + 1) % texts.length);
      return;
    }

    const currentInterval = isDeleting ? deleteSpeed : speed;
    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, currentInterval);

    return () => clearTimeout(timeout);
  }, [
    subIndex,
    isDeleting,
    textIndex,
    currentFullText,
    texts.length,
    speed,
    deleteSpeed,
    delay,
    shouldLoop,
    reducedMotion,
    onComplete,
  ]);

  // Persian text is rendered as text.slice(0, subIndex)
  // This ensures Persian ligature joining remains natural and continuous.
  const displayText = currentFullText.slice(0, subIndex);

  return (
    <Component
      role="text"
      aria-label={currentFullText}
      dir="rtl"
      className={cn("inline-flex items-baseline font-vazir text-foreground", className)}
      {...props}
    >
      <span aria-hidden="true" className="select-text">
        {displayText}
      </span>
      {cursor && (
        <span
          aria-hidden="true"
          className={cn(
            "inline-block w-[2px] h-[1em] ms-1.5 align-middle bg-primary rounded-full transition-opacity duration-200",
            reducedMotion ? "opacity-75" : "animate-pulse",
            cursorClassName
          )}
        />
      )}
    </Component>
  );
}

export default Typewriter;

/**
 * نمونه کاربرد کامل و دسترس‌پذیر کامپوننت ماشین‌تحریر (Typewriter Demo)
 */
export function TypewriterExample() {
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [customText, setCustomText] = React.useState("کافئین؛ مثل یه جرعه انرژی برای مغز و انگیزهست");
  const [pricing] = React.useState(1850000);

  const samplePhrases = React.useMemo(
    () => [
      "کافئین؛ مثل یه جرعه انرژی برای مغز و انگیزهست",
      "سیستم عامل هوشمند و تحلیلی مشاوره کنکور سراسری",
      "برنامه‌ریزی دقیق، مرور هوشمند و سنجش مداوم تراز",
      "همراهی گام‌به‌گام رتبه‌های برتر و مشاوران ارشد",
    ],
    []
  );

  return (
    <section
      dir="rtl"
      aria-labelledby="typewriter-demo-heading"
      className="w-full max-w-3xl mx-auto my-6 p-6 sm:p-8 rounded-2xl border border-border bg-card text-foreground shadow-sm space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h2 id="typewriter-demo-heading" className="text-base sm:text-lg font-bold text-foreground">
              افکت ماشین‌تحریر کافئین
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              اتصال پیوسته حروف فارسی و دسترسی‌پذیری استاندارد (A11y)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-background hover:bg-accent text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            aria-label={isPlaying ? "توقف انیمیشن" : "ادامه انیمیشن"}
          >
            {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            <span>{isPlaying ? "توقف" : "پخش"}</span>
          </button>
        </div>
      </div>

      {/* Main Typewriter Showcase */}
      <div className="p-5 sm:p-6 rounded-xl bg-background/80 border border-border/80 text-center min-h-[90px] flex items-center justify-center">
        {isPlaying ? (
          <Typewriter
            text={samplePhrases}
            speed={60}
            deleteSpeed={30}
            delay={1900}
            className="text-base sm:text-xl font-bold text-primary leading-relaxed"
          />
        ) : (
          <span className="text-base sm:text-xl font-bold text-muted-foreground">
            {samplePhrases[0]}
          </span>
        )}
      </div>

      {/* Interactive custom test */}
      <div className="space-y-3 pt-2">
        <label htmlFor="custom-typewriter-input" className="block text-xs font-semibold text-foreground">
          آزمایش متن دلخواه شما:
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="custom-typewriter-input"
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="متن دلخواه خود را بنویسید..."
            className="flex-1 h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground outline-none transition-colors focus-within:ring-2 focus-within:ring-ring/50 placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => setCustomText("کافئین؛ مثل یه جرعه انرژی برای مغز و انگیزهست")}
            className="h-10 px-4 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <span>متن پیش‌فرض</span>
            <RotateCcw className="size-3.5" />
          </button>
        </div>

        {customText && (
          <div className="p-3.5 rounded-lg bg-accent/40 border border-border/50 text-sm">
            <span className="text-xs text-muted-foreground me-2">خروجی زنده:</span>
            <Typewriter key={customText} text={customText} speed={50} loop={false} className="font-semibold text-foreground" />
          </div>
        )}
      </div>

      {/* Persian digits & currency demonstration */}
      <div className="pt-2 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span>هزینه اشتراک ماهانه دوره VIP:</span>
          <strong className="text-foreground font-bold">{formatToman(pricing)}</strong>
        </div>

        <div className="inline-flex items-center gap-1 text-primary text-xs font-medium">
          <span>مشاهده جزئیات طرح</span>
          <ArrowLeft className="size-3.5" />
        </div>
      </div>
    </section>
  );
}
