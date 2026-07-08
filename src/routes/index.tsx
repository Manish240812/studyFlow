import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import {
  BarChart3,
  BookOpenCheck,
  Moon,
  Quote as QuoteIcon,
  Settings as SettingsIcon,
  Sun,
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
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <motion.div
            initial={{ scale: 0.8, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow"
          >
            <BookOpenCheck className="h-6 w-6" />
          </motion.div>
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Student <span className="gradient-text">To-Do</span>
            </h1>
            <p className="truncate text-sm text-muted-foreground">
              Stay organized and never miss an assignment.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={toggle}
          aria-label="Toggle theme"
          className="shrink-0 rounded-xl"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </header>

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
          <TabsList className="glass h-11 rounded-xl p-1 shadow-soft">
            <TabsTrigger value="tasks" className="rounded-lg">Tasks</TabsTrigger>
            <TabsTrigger value="stats" className="rounded-lg">
              <BarChart3 className="mr-1 h-4 w-4" /> Statistics
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg">
              <SettingsIcon className="mr-1 h-4 w-4" /> Settings
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

      <footer className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Student To-Do · Built for focused learners.
      </footer>
    </div>
  );
}
