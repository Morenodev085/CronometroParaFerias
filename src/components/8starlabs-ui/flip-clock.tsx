"use client";

import {
  FC,
  HTMLAttributes,
  memo,
  ReactNode,
  useEffect,
  useState
} from "react";

// 8StarLabs UI (MIT); adapted for Vite and local styles.
// Keep variants local so this component needs no CVA or class merging dependency.
type Size = "sm" | "md" | "lg" | "xl";
type Variant = "default" | "secondary" | "destructive" | "outline" | "muted";
function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
function flipUnitVariants({ size = "md", variant = "default" }: { size?: Size; variant?: Variant }) {
  return cn("clock-digit relative subpixel-antialiased perspective-[1000px] rounded-md overflow-hidden",
    { sm: "w-10 min-w-10 h-14 text-3xl", md: "w-14 min-w-14 h-20 text-5xl", lg: "w-17 min-w-17 h-24 text-6xl", xl: "w-22 min-w-22 h-32 text-8xl" }[size],
    `clock-variant-${variant}`);
}
interface FlipUnitProps extends HTMLAttributes<HTMLDivElement> {
  digit: number | string;
  size?: Size;
  variant?: Variant;
}

const commonCardStyle = cn(
  "absolute inset-x-0 overflow-hidden h-1/2 bg-inherit text-inherit"
);

export const FlipUnit: FC<FlipUnitProps> = memo(function FlipUnit({
  digit,
  size,
  variant,
  className
}: FlipUnitProps) {
  const [prevDigit, setPrevDigit] = useState(digit);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (digit !== prevDigit) {
      setFlipping(true);
      // Wait for the full animation (0.3s top + 0.3s bottom) before resetting
      const timer = setTimeout(() => {
        setFlipping(false);
        setPrevDigit(digit);
      }, 600); // Keep the old digit until both flaps finish.
      return () => clearTimeout(timer);
    }
  }, [digit, prevDigit]);

  return (
    <div className={cn(flipUnitVariants({ size, variant }), className)} aria-hidden="true">
      {/* 1. Background Top (The NEW digit waiting) */}
      <div className={cn(commonCardStyle, "rounded-t-lg top-0")}>
        <DigitSpan position="top">{digit}</DigitSpan>
      </div>

      {/* 2. Background Bottom (The OLD digit staying) */}
      <div className={cn(commonCardStyle, "rounded-b-lg top-1/2")}>
        <DigitSpan position="bottom">{prevDigit}</DigitSpan>
      </div>

      {/* 3. Top Flap (The OLD digit falling down) */}
      <div
        className={cn(
          commonCardStyle,
          "z-20 origin-bottom backface-hidden rounded-t-lg top-0",
          flipping && "animate-flip-top"
        )}
      >
        <DigitSpan position="top">{prevDigit}</DigitSpan>
      </div>

      {/* 4. Bottom Flap (The NEW digit appearing) */}
      <div
        className={cn(
          commonCardStyle,
          "z-10 origin-top backface-hidden rounded-b-lg top-1/2",
          flipping && "animate-flip-bottom"
        )}
        style={{ transform: "rotateX(90deg)" }}
      >
        <DigitSpan position="bottom">{digit}</DigitSpan>
      </div>

      {/* Center Divider Shadow */}
      <div className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2 bg-background/50 z-30" />
    </div>
  );
});

interface DigitSpanProps {
  children: ReactNode;
  position?: "top" | "bottom";
}

function DigitSpan({ children, position }: DigitSpanProps) {
  return (
    <span
      className={cn(
        "absolute left-0 right-0 w-full flex items-center justify-center",
        // The span should be the full height of the PARENT FlipUnit (200% of the half-card)
        "h-[200%]"
      )}
      style={{
        // If it's the top half, align the full span to the top
        // If it's the bottom half, shift the full span up so its bottom half shows
        top: position === "top" ? "0%" : "-100%"
      }}
    >
      {children}
    </span>
  );
}

function flipClockVariants({ size = "md" }: { size?: Size; variant?: Variant }) {
  return cn("relative flex justify-center items-center font-mono font-medium",
    { sm: "text-3xl space-x-1", md: "text-5xl space-x-2", lg: "text-6xl space-x-2", xl: "text-8xl space-x-3" }[size]);
}
interface FlipClockProps extends HTMLAttributes<HTMLDivElement> {
  size?: Size;
  variant?: Variant;
  countdown?: boolean;
  targetDate?: Date;
  showDays?: "auto" | "always" | "never";
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

type FlipClockSize = Size;

const heightMap: Record<FlipClockSize, string> = {
  sm: "text-4xl",
  md: "text-5xl",
  lg: "text-6xl",
  xl: "text-8xl"
};

const EMPTY_TIME: TimeLeft = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
};

function ClockSeparator({ size }: { size?: FlipClockSize }) {
  return (
    <span
      className={cn(
        "text-center -translate-y-[8%]",
        size ? heightMap[size] : heightMap["md"]
      )}
    >
      :
    </span>
  );
}

export default function FlipClock({
  countdown = false,
  targetDate,
  size,
  variant,
  showDays = "auto",
  className,
  ...props
}: FlipClockProps) {
  const [time, setTime] = useState<TimeLeft>(EMPTY_TIME);

  useEffect(() => {
    setTime(getTime(countdown, targetDate));

    // Run a faster heartbeat (250ms) to catch the second rollover immediately
    const timer = setInterval(() => {
      const nextTime = getTime(countdown, targetDate);

      // Only update state if the seconds actually changed to prevent unnecessary re-renders
      setTime((prev) => {
        if (
          prev.seconds === nextTime.seconds &&
          prev.minutes === nextTime.minutes
        ) {
          return prev;
        }
        return nextTime;
      });
    }, 250); // 4fps check is plenty

    return () => clearInterval(timer);
  }, [countdown, targetDate]);

  const daysStr = String(time.days).padStart(3, "0");
  const hoursStr = String(time.hours).padStart(2, "0");
  const minutesStr = String(time.minutes).padStart(2, "0");
  const secondsStr = String(time.seconds).padStart(2, "0");

  const shouldShowDays =
    countdown &&
    (showDays === "always" || (showDays === "auto" && time.days > 0));

  return (
    <div
      className={cn(flipClockVariants({ size, variant }), className)}
      aria-live="polite"
      {...props}
    >
      <span className="sr-only absolute">
        {`${time.hours}:${time.minutes}:${time.seconds}`}
      </span>

      {/* Days */}
      {shouldShowDays && (
        <>
          {daysStr.split("").map((digit, i) => (
            <FlipUnit
              key={`d-${i}`}
              digit={digit}
              size={size}
              variant={variant}
            />
          ))}
          <ClockSeparator size={size!} />
        </>
      )}

      {/* Hours */}
      {hoursStr.split("").map((digit, index) => (
        <FlipUnit
          key={`hour-${index}`}
          digit={digit}
          size={size}
          variant={variant}
        />
      ))}

      <ClockSeparator size={size!} />

      {/* Minutes */}
      {minutesStr.split("").map((digit, index) => (
        <FlipUnit
          key={`minute-${index}`}
          digit={digit}
          size={size}
          variant={variant}
        />
      ))}

      <ClockSeparator size={size!} />

      {/* Seconds */}
      {secondsStr.split("").map((digit, index) => (
        <FlipUnit
          key={`second-${index}`}
          digit={digit}
          size={size}
          variant={variant}
        />
      ))}

    </div>
  );
}

function getTime(countdown: boolean, targetDate?: Date): TimeLeft {
  const now = new Date();

  // Real-time Clock Mode
  if (!countdown) {
    return {
      days: 0,
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds()
    };
  }

  // Countdown Mode
  if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const diff = Math.max(0, targetDate.getTime() - now.getTime());

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60)
  };
}
