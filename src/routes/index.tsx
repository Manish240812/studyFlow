import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import {
  BarChart3,
  Instagram,
  Linkedin,
  Mail,
  Moon,
  Quote as QuoteIcon,
  Send,
  Settings as SettingsIcon,
  Sun,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Dashboard } from "@/components/todo/Dashboard";
import { TaskForm } from "@/components/todo/TaskForm";
import { TaskList } from "@/components/todo/TaskList";
import { FiltersBar, type FilterKey, type SortKey } from "@/components/todo/FiltersBar";
import { StatsPanel } from "@/components/todo/StatsPanel";
import { Pomodoro } from "@/components/todo/Pomodoro";
import { QuickNotes } from "@/components/todo/QuickNotes";
import { UpcomingPanel } from "@/components/todo/UpcomingPanel";
import { SettingsPanel } from "@/components/todo/SettingsPanel";
import { useSettings, useStreak, useTasks, useTheme } from "@/lib/todo/storage";
import { isDueThisWeek, isDueToday, isOverdue, type Task } from "@/lib/todo/types";
import { quoteOfTheDay } from "@/lib/todo/quotes";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { tasks, addTask, updateTask, deleteTask, setAllTasks } = useTasks();
  const { theme, toggle } = useTheme();
  const [settings, setSettings] = useSettings();
  const { streak, completedToday } = useStreak(tasks);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("due");
  const [editing, setEditing] = useState<Task | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const quote = useMemo(() => quoteOfTheDay(), []);
  const prevAllComplete = useRef(false);

  // Confetti when all tasks complete
  useEffect(() => {
    if (tasks.length === 0) {
      prevAllComplete.current = false;
      return;
    }
    const allDone = tasks.every((t) => t.completed);
    if (allDone && !prevAllComplete.current) {
      confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
    }
    prevAllComplete.current = allDone;
  }, [tasks]);

  const counts = useMemo(
    () => ({
      all: tasks.length,
      pending: tasks.filter((t) => !t.completed).length,
      completed: tasks.filter((t) => t.completed).length,
      overdue: tasks.filter((t) => isOverdue(t)).length,
      today: tasks.filter((t) => isDueToday(t) && !t.completed).length,
      week: tasks.filter((t) => isDueThisWeek(t) && !t.completed).length,
      high: tasks.filter((t) => t.priority === "high" && !t.completed).length,
      medium: tasks.filter((t) => t.priority === "medium" && !t.completed).length,
      low: tasks.filter((t) => t.priority === "low" && !t.completed).length,
      pinned: tasks.filter((t) => t.pinned).length,
      favorites: tasks.filter((t) => t.favorite).length,
    }),
    [tasks],
  );

  const visibleTasks = useMemo(() => {
    let list = tasks.filter((t) => {
      switch (filter) {
        case "pending": return !t.completed;
        case "completed": return t.completed;
        case "overdue": return isOverdue(t);
        case "today": return isDueToday(t);
        case "week": return isDueThisWeek(t);
        case "high": return t.priority === "high";
        case "medium": return t.priority === "medium";
        case "low": return t.priority === "low";
        case "pinned": return t.pinned;
        case "favorites": return t.favorite;
        default: return true;
      }
    });

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q),
      );
    }

    const priorityRank: Record<string, number> = { high: 0, medium: 1, low: 2 };
    list = [...list].sort((a, b) => {
      // Completed always at bottom
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      // Pinned first
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      switch (sort) {
        case "due": {
          const da = a.dueDate ? new Date(`${a.dueDate}T${a.dueTime || "23:59"}`).getTime() : Infinity;
          const db = b.dueDate ? new Date(`${b.dueDate}T${b.dueTime || "23:59"}`).getTime() : Infinity;
          return da - db;
        }
        case "priority": return priorityRank[a.priority] - priorityRank[b.priority];
        case "created": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "alpha": return a.title.localeCompare(b.title);
        case "subject": return a.subject.localeCompare(b.subject);
      }
    });
    return list;
  }, [tasks, filter, search, sort]);

  const onToggle = (id: string) => {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    const nextCompleted = !t.completed;
    updateTask(id, {
      completed: nextCompleted,
      completedAt: nextCompleted ? new Date().toISOString() : undefined,
    });
    toast.success(nextCompleted ? "Task completed 🎉" : "Task restored");
  };

  const onDelete = (id: string) => {
    deleteTask(id);
    toast.success("Task deleted");
  };

  const onDuplicate = (t: Task) => {
    addTask({
      ...t,
      id: crypto.randomUUID(),
      title: `${t.title} (copy)`,
      completed: false,
      completedAt: undefined,
      pinned: false,
      createdAt: new Date().toISOString(),
      order: Date.now(),
    });
    toast.success("Task duplicated");
  };

  const onPin = (id: string) => {
    const t = tasks.find((x) => x.id === id);
    if (t) updateTask(id, { pinned: !t.pinned });
  };
  const onFavorite = (id: string) => {
    const t = tasks.find((x) => x.id === id);
    if (t) updateTask(id, { favorite: !t.favorite });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/70 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-2xl p-1">
            <img
              src="/logo.png.png"
              alt="Study Flow logo"
              className="h-14 w-auto max-w-[240px] object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.25)]"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-2 shadow-sm transition hover:border-primary hover:bg-card"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sky-500 text-sm font-semibold text-white">
              AS
            </div>
            <span className="text-sm font-medium text-foreground">Profile</span>
          </button>
        </div>
      </header>

      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-2xl rounded-3xl border border-border/70 bg-background p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-primary">Student Profile</p>
                <h2 className="mt-1 text-2xl font-semibold text-foreground">Aarav Sharma</h2>
                <p className="mt-1 text-sm text-muted-foreground">Your personal academic details are kept here for quick access.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="rounded-full border border-border/70 p-2 text-muted-foreground transition hover:border-primary hover:text-primary"
                aria-label="Close profile"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-border/60 bg-card/70 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sky-500 text-xl font-semibold text-white">
                  AS
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">Aarav Sharma</p>
                  <p className="text-sm text-muted-foreground">Student • Active Learner</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Phone</p>
                  <p className="mt-1 text-sm text-foreground">+91 98765 43210</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</p>
                  <p className="mt-1 text-sm text-foreground">aarav@example.com</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Branch</p>
                  <p className="mt-1 text-sm text-foreground">Computer Science</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Class</p>
                  <p className="mt-1 text-sm text-foreground">2nd Year</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={toggle}
                className="rounded-xl border-border/70"
              >
                {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              </Button>
              <Button onClick={() => setIsProfileOpen(false)} className="rounded-xl">
                Close Profile
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-5 flex items-start gap-2 rounded-2xl border border-border bg-secondary/40 p-3 text-sm italic text-muted-foreground"
      >
        <QuoteIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span>{quote}</span>
      </motion.div>

      <div className="mt-6">
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 p-1.5 shadow-sm backdrop-blur">
            <TabsTrigger value="tasks" className="rounded-lg px-4 py-2.5 text-sm font-medium transition data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              Tasks
            </TabsTrigger>
            <TabsTrigger value="stats" className="rounded-lg px-4 py-2.5 text-sm font-medium transition data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              <BarChart3 className="mr-2 h-4 w-4" /> Statistics
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg px-4 py-2.5 text-sm font-medium transition data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              <SettingsIcon className="mr-2 h-4 w-4" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            <Dashboard
              tasks={tasks}
              streak={streak}
              completedToday={completedToday}
              dailyGoal={settings.dailyGoal}
            />

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="space-y-6">
                <TaskForm
                  onAdd={addTask}
                  editing={editing}
                  onUpdate={updateTask}
                  onCancelEdit={() => setEditing(null)}
                />
                <FiltersBar
                  search={search}
                  onSearch={setSearch}
                  filter={filter}
                  onFilter={setFilter}
                  sort={sort}
                  onSort={setSort}
                  counts={counts}
                />
                <TaskList
                  tasks={visibleTasks}
                  allTasks={tasks}
                  setAllTasks={setAllTasks}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onEdit={(t) => {
                    setEditing(t);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onDuplicate={onDuplicate}
                  onPin={onPin}
                  onFavorite={onFavorite}
                />
              </div>
              <aside className="space-y-4">
                <UpcomingPanel tasks={tasks} />
                <Pomodoro />
                <QuickNotes />
              </aside>
            </div>

            <footer className="mt-12 rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur">
              <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p className="text-base font-semibold text-foreground">About us</p>
                  <p>
                    Study Flow is built for students who want a calm, focused way to manage tasks,
                    deadlines, and study routines without feeling overwhelmed.
                  </p>
                  <p>
                    Follow us and connect with our community for updates, productivity tips, and support.
                  </p>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p className="text-base font-semibold text-foreground">Connect with us</p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="https://instagram.com/studyflow"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-2 text-foreground transition hover:border-primary hover:text-primary"
                    >
                      <Instagram className="h-4 w-4" /> Instagram
                    </a>
                    <a
                      href="https://linkedin.com/company/studyflow"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-2 text-foreground transition hover:border-primary hover:text-primary"
                    >
                      <Linkedin className="h-4 w-4" /> LinkedIn
                    </a>
                  </div>
                  <div className="space-y-1">
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> hello@studyflow.app
                    </p>
                    <p className="flex items-center gap-2">
                      <Send className="h-4 w-4" /> Study Flow Team
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 border-t border-border/60 pt-4 text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} Study Flow · Built for focused learners.
              </div>
            </footer>
          </TabsContent>

          <TabsContent value="stats">
            <StatsPanel tasks={tasks} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPanel
              tasks={tasks}
              setAllTasks={setAllTasks}
              settings={settings}
              setSettings={setSettings}
              theme={theme}
              toggleTheme={toggle}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
