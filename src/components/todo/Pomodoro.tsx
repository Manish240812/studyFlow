import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pause,
  Play,
  RotateCcw,
  Timer,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Music,
  GraduationCap,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { SUBJECTS, SUBJECT_COLORS, type Subject, type StudyLog } from "@/lib/todo/types";
import { cn } from "@/lib/utils";

interface Props {
  onAddStudyLog: (log: StudyLog) => void;
}

const SOUND_URLS = {
  none: "",
  rain: "https://www.soundjay.com/nature/sounds/rain-07.mp3",
  cafe: "https://www.soundjay.com/misc/sounds/coffee-shop-1.mp3",
  lofi: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
};

// Presets removed as user decides time manually

export function Pomodoro({ onAddStudyLog }: Props) {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [mode, setMode] = useState<"work" | "break">("work");
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject>("Computer Science");

  // Ambient sound states
  const [selectedSound, setSelectedSound] = useState<keyof typeof SOUND_URLS>("none");
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [volume, setVolume] = useState(0.5);

  // Screen states
  const [isFullscreen, setIsFullscreen] = useState(false);

  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Update remaining time when presets change
  useEffect(() => {
    if (!running) {
      setRemaining((mode === "work" ? workMinutes : breakMinutes) * 60);
    }
  }, [workMinutes, breakMinutes, mode, running]);

  // Handle countdown timer interval
  useEffect(() => {
    if (!running) return;
    timerRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          const nextMode = mode === "work" ? "break" : "work";
          const nextTotal = nextMode === "work" ? workMinutes : breakMinutes;

          if (mode === "work") {
            // Auto log the completed session to the subject
            onAddStudyLog({
              id: crypto.randomUUID(),
              subject: selectedSubject,
              duration: workMinutes,
              date: new Date().toISOString().slice(0, 10),
              notes: "Pomodoro Focus Session",
              createdAt: new Date().toISOString(),
            });
            toast.success(
              `Focus session completed! Logged ${workMinutes}m to ${selectedSubject} 🎉☕`,
            );
          } else {
            toast.success("Break completed! Ready to focus? 💪");
          }

          setMode(nextMode);
          return nextTotal * 60;
        }
        return r - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [running, mode, workMinutes, breakMinutes, selectedSubject, onAddStudyLog]);

  // Audio lifecycle sync
  useEffect(() => {
    if (!audioRef.current) return;
    if (selectedSound !== "none" && isPlayingSound) {
      audioRef.current.volume = volume;
      audioRef.current.play().catch(() => {
        setIsPlayingSound(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [selectedSound, isPlayingSound, volume]);

  // Update volume dynamically
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const total = (mode === "work" ? workMinutes : breakMinutes) * 60;
  const pct = ((total - remaining) / total) * 100;
  const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secs = String(remaining % 60).padStart(2, "0");

  const toggleSound = () => {
    if (selectedSound === "none") {
      toast.error("Please select an ambient sound source first.");
      return;
    }
    setIsPlayingSound((prev) => !prev);
  };

  const selectSoundSource = (source: keyof typeof SOUND_URLS) => {
    setSelectedSound(source);
    if (source === "none") {
      setIsPlayingSound(false);
    } else {
      setIsPlayingSound(true);
    }
  };

  const handleReset = () => {
    setRunning(false);
    setMode("work");
    setRemaining(workMinutes * 60);
  };

  const triggerManualLog = () => {
    const elapsedSeconds = total - remaining;
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);

    if (elapsedMinutes < 1) {
      toast.error("Focus at least 1 minute to log study progress!");
      return;
    }

    onAddStudyLog({
      id: crypto.randomUUID(),
      subject: selectedSubject,
      duration: elapsedMinutes,
      date: new Date().toISOString().slice(0, 10),
      notes: "Manual Focus Session Log",
      createdAt: new Date().toISOString(),
    });

    toast.success(`Logged ${elapsedMinutes}m study session to ${selectedSubject}!`);
    handleReset();
  };

  return (
    <div
      className={cn(
        "space-y-6 transition-all duration-300",
        isFullscreen &&
          "fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 space-y-8 animate-fade-in",
      )}
    >
      {/* Hidden audio element for safe HTML5 playback */}
      <audio ref={audioRef} src={SOUND_URLS[selectedSound] || undefined} loop />

      {/* Header bar controls */}
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-4",
          isFullscreen ? "w-full max-w-xl border-b border-border/30 pb-4" : "",
        )}
      >
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-glow">
            <Timer className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-1.5">
              Focus Space
              {mode === "break" && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-sans">
                  Break Mode
                </span>
              )}
            </h3>
            <p className="text-xs text-muted-foreground">
              Distraction-free environment with ambient soundscapes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-9 w-9 rounded-xl hover:bg-secondary cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Focus Mode"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "grid gap-6",
          isFullscreen ? "w-full max-w-5xl md:grid-cols-[1fr_300px]" : "lg:grid-cols-[1fr_320px]",
        )}
      >
        {/* Left column: Visual Clock and Visualizer */}
        <div className="glass rounded-3xl p-8 flex flex-col items-center justify-center relative min-h-[340px] border border-border/60">
          {/* Removed Zen Pulsing breathing animation */}

          {/* Clock circle graphic */}
          <div className="relative h-56 w-56 grid place-items-center">
            <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90">
              <circle
                cx="60"
                cy="60"
                r="54"
                className="stroke-secondary/35"
                strokeWidth="6"
                fill="none"
              />
              <motion.circle
                cx="60"
                cy="60"
                r="54"
                className="stroke-primary"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={2 * Math.PI * 54}
                animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - pct / 100) }}
                transition={{ duration: running ? 1.05 : 0.3, ease: "linear" }}
              />
            </svg>
            <div className="flex flex-col items-center gap-1.5 z-10 select-none">
              <span className="font-display text-5xl font-bold tabular-nums tracking-tight">
                {mins}:{secs}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                {mode === "work" ? "Deep Focus" : "Rest Period"}
              </span>
            </div>
          </div>

          {/* Main timer playback actions */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => setRunning((r) => !r)}
              className="gradient-primary text-primary-foreground font-semibold rounded-2xl shadow-glow px-6 h-12 cursor-pointer text-sm"
            >
              {running ? (
                <Pause className="h-4.5 w-4.5 mr-1.5" />
              ) : (
                <Play className="h-4.5 w-4.5 mr-1.5" />
              )}
              {running ? "Pause" : "Start Focus"}
            </Button>

            <Button
              size="icon"
              variant="outline"
              onClick={handleReset}
              className="h-12 w-12 rounded-2xl hover:bg-secondary cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="h-4.5 w-4.5" />
            </Button>

            {running && mode === "work" && (
              <Button
                variant="outline"
                onClick={triggerManualLog}
                className="h-12 px-4 rounded-2xl border-dashed border-border/80 hover:bg-secondary cursor-pointer text-xs"
                title="Log currently studied minutes"
              >
                Log Session
              </Button>
            )}
          </div>

          {/* Removed Zen Guide */}
        </div>

        {/* Right column: Subject Linker, Presets, and Soundscape player */}
        <div className="space-y-4">
          {/* Custom Time Options */}
          <div className="glass rounded-2xl p-4 space-y-3 border border-border/60">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Timer className="h-3 w-3 text-primary" /> Custom Interval
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Work (min)
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={workMinutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setWorkMinutes(val);
                    if (!running && mode === "work") setRemaining(val * 60);
                  }}
                  className="h-9 text-xs glass bg-background/50 border-border/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Break (min)
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={breakMinutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setBreakMinutes(val);
                    if (!running && mode === "break") setRemaining(val * 60);
                  }}
                  className="h-9 text-xs glass bg-background/50 border-border/50"
                />
              </div>
            </div>
          </div>

          {/* Subject linking settings */}
          <div className="glass rounded-2xl p-4 space-y-3 border border-border/60">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <GraduationCap className="h-3 w-3 text-primary" /> Link Subject Log
            </h4>
            <div className="space-y-2">
              <Select
                value={selectedSubject}
                onValueChange={(v) => setSelectedSubject(v as Subject)}
                disabled={running}
              >
                <SelectTrigger className="h-9 rounded-xl text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass border-border/50">
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s} className="cursor-pointer text-xs">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1.5 rounded-lg bg-secondary/35 border border-border/30 p-2 text-[10px] text-muted-foreground">
                <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>
                  Minutes spent will automatically upload to this subject when timer finishes.
                </span>
              </div>
            </div>
          </div>

          {/* Soundscapes ambient console */}
          <div className="glass rounded-2xl p-4 space-y-3 border border-border/60">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Music className="h-3 w-3 text-primary" /> Focus Soundscape
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {(["none", "rain", "cafe", "lofi"] as const).map((source) => {
                  const isActive = selectedSound === source;
                  const label =
                    source === "none"
                      ? "🔇 None"
                      : source === "rain"
                        ? "🌧️ Cozy Rain"
                        : source === "cafe"
                          ? "☕ Cozy Cafe"
                          : "🎵 Study Beats";
                  return (
                    <Button
                      key={source}
                      size="sm"
                      variant={isActive ? "default" : "outline"}
                      onClick={() => selectSoundSource(source)}
                      className="text-2xs h-9 rounded-xl font-medium cursor-pointer"
                    >
                      {label}
                    </Button>
                  );
                })}
              </div>

              {selectedSound !== "none" && (
                <div className="space-y-2 border-t border-border/30 pt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={toggleSound}
                        className="h-6 w-6 rounded-md hover:bg-secondary cursor-pointer"
                      >
                        {isPlayingSound ? (
                          <Volume2 className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </Button>
                      Volume
                    </span>
                    <span>{Math.round(volume * 100)}%</span>
                  </div>
                  <Slider
                    min={0}
                    max={1}
                    step={0.05}
                    value={[volume]}
                    onValueChange={(val) => setVolume(val[0])}
                    className="cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Removed Zen Toggle */}
        </div>
      </div>
    </div>
  );
}
