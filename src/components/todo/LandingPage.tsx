import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import {
  ArrowRight,
  Palette,
  Sparkles,
  Calendar,
  Wallet,
  Clock,
  BarChart3,
  Flame,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ThemeMode } from "@/lib/todo/storage";

interface Props {
  onEnterApp: () => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
}

export function LandingPage({ onEnterApp, theme, setTheme }: Props) {
  const [streakCount, setStreakCount] = useState(5);
  const [hasIncrementedStreak, setHasIncrementedStreak] = useState(false);

  // Landing Pomodoro State
  const [pomoTime, setPomoTime] = useState(1500); // 25 mins
  const [pomoActive, setPomoActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (pomoActive && pomoTime > 0) {
      interval = setInterval(() => {
        setPomoTime((t) => t - 1);
      }, 1000);
    } else if (pomoTime === 0) {
      setPomoActive(false);
      confetti({ particleCount: 30, spread: 40 });
      toast.success("Focus session finished! Have a break.");
      setPomoTime(1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pomoActive, pomoTime]);

  const formatPomoTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStreakClick = () => {
    if (hasIncrementedStreak) {
      toast("You already boosted the streak! Open the app to start your real daily goal.");
      return;
    }
    setStreakCount((c) => c + 1);
    setHasIncrementedStreak(true);
    confetti({
      particleCount: 50,
      spread: 60,
      colors: ["#f59e0b", "#ef4444", "#f43f5e"],
    });
    toast.success("Streak Day Boosted! 🔥");
  };

  const handleStartApp = () => {
    onEnterApp();
  };

  // Staggered Container
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden selection:bg-primary/20">
      {/* Background Animated Blobs */}
      <div className="absolute top-[-10%] left-[-15%] w-[40vw] h-[40vw] max-w-[600px] rounded-full bg-primary/10 blur-[100px] sm:blur-[140px] pointer-events-none animate-pulse duration-[6000ms]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] max-w-[700px] rounded-full bg-primary-glow/15 blur-[120px] sm:blur-[160px] pointer-events-none animate-pulse duration-[8000ms]" />

      {/* Floating Sparkles in Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <motion.div
          animate={{ y: [0, -15, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute top-[25%] left-[15%]"
        >
          <Sparkles className="h-6 w-6 text-primary" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], opacity: [0.4, 0.9, 0.4] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
          className="absolute top-[60%] right-[20%]"
        >
          <Sparkles className="h-5 w-5 text-sky-400" />
        </motion.div>
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.2, 0.6, 0.2] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[20%] left-[25%]"
        >
          <Sparkles className="h-4 w-4 text-primary-glow" />
        </motion.div>
      </div>

      {/* Header */}
      <header className="z-10 mx-auto w-full max-w-7xl px-6 py-4 flex items-center justify-between border-b border-border/20 backdrop-blur-md bg-background/50">
        <div className="flex items-center gap-1.5 text-2xl tracking-tight">
          <span className="font-semibold text-foreground">Study</span>
          <span className="font-bold text-primary">Flow</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Paintbrush Theme Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                title="Change Theme"
                className="h-9 w-9 rounded-full border-border/70 bg-card/80 shadow-sm transition hover:border-primary hover:text-primary hover:bg-card cursor-pointer"
              >
                <Palette className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 rounded-xl glass p-1.5 shadow-lg border border-border/50"
            >
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className={cn(
                  "rounded-lg px-2.5 py-2 text-xs font-semibold cursor-pointer transition hover:bg-secondary/60",
                  theme === "dark" && "bg-primary/10 text-primary",
                )}
              >
                🌙 Midnight Default
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("cyberpunk")}
                className={cn(
                  "rounded-lg px-2.5 py-2 text-xs font-semibold cursor-pointer transition hover:bg-secondary/60",
                  theme === "cyberpunk" && "bg-primary/10 text-primary",
                )}
              >
                🧪 Cyberpunk Neon
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("emerald")}
                className={cn(
                  "rounded-lg px-2.5 py-2 text-xs font-semibold cursor-pointer transition hover:bg-secondary/60",
                  theme === "emerald" && "bg-primary/10 text-primary",
                )}
              >
                🌲 Emerald Sage
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("sunset")}
                className={cn(
                  "rounded-lg px-2.5 py-2 text-xs font-semibold cursor-pointer transition hover:bg-secondary/60",
                  theme === "sunset" && "bg-primary/10 text-primary",
                )}
              >
                🌅 Sunset Breeze
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("ocean")}
                className={cn(
                  "rounded-lg px-2.5 py-2 text-xs font-semibold cursor-pointer transition hover:bg-secondary/60",
                  theme === "ocean" && "bg-primary/10 text-primary",
                )}
              >
                🌊 Deep Ocean
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className={cn(
                  "rounded-lg px-2.5 py-2 text-xs font-semibold cursor-pointer transition hover:bg-secondary/60",
                  theme === "light" && "bg-primary/10 text-primary",
                )}
              >
                ☀ Light Aura
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={handleStartApp}
            className="gradient-primary text-primary-foreground font-semibold rounded-full shadow-glow cursor-pointer transition-all hover:scale-105 animate-pulse"
          >
            Enter App
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="z-10 flex-1 mx-auto w-full max-w-7xl px-6 py-12 md:py-20 grid gap-12 lg:grid-cols-2 items-center">
        {/* Left Side: Copywriting */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6 md:space-y-8 animate-fade-in"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary-glow" />
            <span>Simplify your learning journey</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-bold leading-[1.1] tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent"
          >
            Supercharge your study routine, <br />
            <span className="text-primary relative inline-block">
              one hour at a time.
              <span className="absolute bottom-1 left-0 w-full h-[6px] bg-primary/20 -z-10 rounded-full" />
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl"
          >
            A calm, structured workspace built strictly for students. Plan your week visually,
            balance subject time budgets, and capture focus logs without cognitive overload.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-2">
            <Button
              size="lg"
              onClick={handleStartApp}
              className="gradient-primary text-primary-foreground rounded-2xl shadow-glow font-semibold h-12 px-6 hover:shadow-lg transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97]"
            >
              Get Started for Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="rounded-2xl border-border/80 bg-card/40 hover:bg-card h-12 px-6"
            >
              Explore Features
            </Button>
          </motion.div>

          {/* Quick Stats badges */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-4 pt-4 border-t border-border/20 max-w-md"
          >
            <div>
              <p className="text-2xl font-bold text-foreground">100%</p>
              <p className="text-xs text-muted-foreground">Privacy focused</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">6+</p>
              <p className="text-xs text-muted-foreground">Custom themes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">Free</p>
              <p className="text-xs text-muted-foreground">No sign-up required</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side: Interactive Showcase & Live Demos */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.3 }}
          className="relative w-full max-w-xl mx-auto lg:max-w-none"
        >
          {/* Main Mockup Container */}
          <div className="relative rounded-3xl border border-border/60 bg-card/60 shadow-2xl p-6 backdrop-blur aspect-[4/3] flex flex-col justify-between overflow-hidden">
            {/* Window Dots */}
            <div className="absolute top-4 left-4 flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-destructive/60" />
              <span className="h-3 w-3 rounded-full bg-warning/60" />
              <span className="h-3 w-3 rounded-full bg-success/60" />
            </div>

            <div className="mt-6 flex-1 flex flex-col justify-center gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground text-center">
                Interactive Showcase App
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Demo Card 1: Interactive Streaks Game */}
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm text-center flex flex-col items-center justify-center gap-3 cursor-pointer select-none group relative overflow-hidden"
                  onClick={handleStreakClick}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition" />
                  <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Flame className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-2xs uppercase tracking-wide font-semibold text-muted-foreground">
                      Streak Counter
                    </p>
                    <p className="text-xl font-bold text-foreground mt-0.5">
                      {streakCount} Days 🔥
                    </p>
                  </div>
                  <span className="text-[10px] text-primary font-medium border border-primary/20 bg-primary/5 rounded-full px-2 py-0.5 animate-bounce">
                    Click to Boost!
                  </span>
                </motion.div>

                {/* Demo Card 2: Interactive Pomodoro Widget */}
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm text-center flex flex-col items-center justify-center gap-2 select-none"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xs uppercase tracking-wide font-semibold text-muted-foreground">
                      Focus Session
                    </p>
                    <p className="text-2xl font-mono font-bold text-foreground mt-0.5">
                      {formatPomoTime(pomoTime)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={pomoActive ? "destructive" : "outline"}
                    className="h-7 text-3xs font-semibold rounded-lg px-3 cursor-pointer"
                    onClick={() => setPomoActive(!pomoActive)}
                  >
                    {pomoActive ? "Pause" : "Start Focus"}
                  </Button>
                </motion.div>
              </div>

              {/* Subject Targets Visual Demo */}
              <div className="rounded-2xl border border-border/70 bg-background/60 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-sky-400" />
                    Mathematics Time Budget
                  </span>
                  <span className="text-muted-foreground">80% Met</span>
                </div>
                <div className="space-y-1">
                  <div className="h-2 w-full rounded-full bg-secondary/80 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "80%" }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-primary to-sky-400 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                    <span>Actual: 4 hrs</span>
                    <span>Budget: 5 hrs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick action footer */}
            <div className="mt-4 flex items-center justify-center">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-success" />
                This is a live fully interactive demonstration preview!
              </span>
            </div>
          </div>

          {/* Floating badges on top of mockup */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            className="absolute -top-6 -right-6 rounded-2xl glass p-3 border border-border shadow-lg flex items-center gap-2 max-w-[170px]"
          >
            <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-white">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                Weekly View
              </p>
              <p className="text-xs font-bold text-foreground truncate">Plot your tasks</p>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-6 -left-6 rounded-2xl glass p-3 border border-border shadow-lg flex items-center gap-2 max-w-[170px]"
          >
            <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center text-success border border-success/20">
              <Wallet className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                Target Hours
              </p>
              <p className="text-xs font-bold text-foreground truncate">Planned vs Actual</p>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Features Section */}
      <section
        id="features"
        className="z-10 bg-secondary/20 py-16 md:py-24 border-t border-border/20"
      >
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-display font-bold tracking-tight text-foreground sm:text-4xl">
              Packed with features to keep you in the flow
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Every detail is engineered to match the cognitive workflow of college students and
              focused learners.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <motion.div
              whileHover={{ y: -6, scale: 1.01 }}
              className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground shadow-sm">
                  <Wallet className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Time Budgeting
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Allocate target hours per subject. Contrast planned targets vs logged actual hours
                  in a grouped bar chart dashboard.
                </p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              whileHover={{ y: -6, scale: 1.01 }}
              className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center border border-sky-500/20">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Weekly Calendar
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Organize tasks on a visual Monday-to-Sunday columns timeline. Add, complete,
                  reschedule and manage work dynamically.
                </p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              whileHover={{ y: -6, scale: 1.01 }}
              className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Focus Companion
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Beat procrastination with our customized Pomodoro timer. Quick note pads allow
                  capturing instant details during study blocks.
                </p>
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              whileHover={{ y: -6, scale: 1.01 }}
              className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-success/10 text-success flex items-center justify-center border border-success/20">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Visual Analytics
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Deep statistics for completed items, upcoming items, streaks, subject targets, and
                  logs so you are never left guessing.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="z-10 border-t border-border/20 py-8 text-center text-xs text-muted-foreground mt-auto">
        <p className="flex items-center justify-center gap-1.5">
          © {new Date().getFullYear()} Study Flow • Built with passion for structured learning.
        </p>
      </footer>
    </div>
  );
}
