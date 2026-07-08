import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const WORK = 25 * 60;
const BREAK = 5 * 60;

export function Pomodoro() {
  const [mode, setMode] = useState<"work" | "break">("work");
  const [remaining, setRemaining] = useState(WORK);
  const [running, setRunning] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          const nextMode = mode === "work" ? "break" : "work";
          toast.success(mode === "work" ? "Time for a break! ☕" : "Back to work! 💪");
          setMode(nextMode);
          return nextMode === "work" ? WORK : BREAK;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (ref.current) window.clearInterval(ref.current);
    };
  }, [running, mode]);

  const total = mode === "work" ? WORK : BREAK;
  const pct = ((total - remaining) / total) * 100;
  const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secs = String(remaining % 60).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 shadow-soft"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg gradient-primary text-primary-foreground">
            <Timer className="h-4 w-4" />
          </div>
          <h4 className="font-display font-semibold">Pomodoro</h4>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium capitalize">
          {mode}
        </span>
      </div>

      <div className="relative mx-auto grid h-32 w-32 place-items-center">
        <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90">
          <circle cx="60" cy="60" r="52" className="stroke-secondary" strokeWidth="8" fill="none" />
          <motion.circle
            cx="60"
            cy="60"
            r="52"
            className="stroke-primary"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={2 * Math.PI * 52}
            animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - pct / 100) }}
            transition={{ duration: 0.4 }}
          />
        </svg>
        <span className="font-display text-2xl font-bold tabular-nums">
          {mins}:{secs}
        </span>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        <Button size="sm" onClick={() => setRunning((r) => !r)} className="gradient-primary text-primary-foreground">
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span className="ml-1">{running ? "Pause" : "Start"}</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setRunning(false);
            setMode("work");
            setRemaining(WORK);
          }}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
