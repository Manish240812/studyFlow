import { AppHeader } from "@/components/todo/AppHeader";
import { ProfileModal } from "@/components/todo/ProfileModal";
import { SettingsModal } from "@/components/todo/SettingsModal";
import { TaskPreviewModal } from "@/components/todo/TaskPreviewModal";
import { QuoteBanner } from "@/components/todo/QuoteBanner";
import { AppFooter } from "@/components/todo/AppFooter";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
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
  Palette,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dashboard } from "@/components/todo/Dashboard";
import { TaskForm } from "@/components/todo/TaskForm";
import { TaskList } from "@/components/todo/TaskList";
import { KanbanBoard } from "@/components/todo/KanbanBoard";
import { AIBuddy } from "@/components/todo/AIBuddy";
import { FiltersBar, type FilterKey, type SortKey } from "@/components/todo/FiltersBar";
import { StatsPanel } from "@/components/todo/StatsPanel";
import { Pomodoro } from "@/components/todo/Pomodoro";
import { QuickNotes } from "@/components/todo/QuickNotes";
import { UpcomingPanel } from "@/components/todo/UpcomingPanel";
import { SettingsPanel } from "@/components/todo/SettingsPanel";
import {
  useSettings,
  useStreak,
  useTasks,
  useTheme,
  useProfile,
  useBudgets,
  useStudyLogs,
  useSubjectMaterials,
  useGamification,
  type ThemeMode,
} from "@/lib/todo/storage";
import { isDueThisWeek, isDueToday, isOverdue, type Task, type StudyLog } from "@/lib/todo/types";
import { QUOTES } from "@/lib/todo/quotes";
import { WeeklyCalendar } from "@/components/todo/WeeklyCalendar";
import { TimeBudgetPanel } from "@/components/todo/TimeBudgetPanel";
import { LandingPage } from "@/components/todo/LandingPage";
import { ResourcesPanel } from "@/components/todo/ResourcesPanel";
import { Calendar as CalendarIcon, Wallet, Edit2, BookOpen, Timer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { tasks, addTask, updateTask, deleteTask, setAllTasks } = useTasks();
  const { theme, setTheme, toggle } = useTheme();
  const [settings, setSettings] = useSettings();
  const { xp, level, unlockedBadges, addXp, unlockBadge } = useGamification();
  const [showLanding, setShowLanding] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    const stored = localStorage.getItem("studyflow:visited");
    if (stored !== "true") {
      setShowLanding(true);
    }
  }, []);
  const { streak, completedToday } = useStreak(tasks);

  // Auto unlock streak badges
  useEffect(() => {
    if (streak >= 3) {
      unlockBadge("streak-3");
    }
    if (streak >= 7) {
      unlockBadge("streak-7");
    }
  }, [streak, unlockBadge]);

  const [profile, setProfile] = useProfile();
  const [budgets, updateBudget] = useBudgets();
  const { studyLogs, addStudyLog, deleteStudyLog, setAllStudyLogs } = useStudyLogs();
  const { materials, addMaterial, deleteMaterial } = useSubjectMaterials();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("due");
  const [editing, setEditing] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [activeTab, setActiveTab] = useState<
    "tasks" | "calendar" | "budget" | "stats" | "resources" | "focus" | "buddy"
  >("tasks");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFilter, setPreviewFilter] = useState<FilterKey>("all");
  const [quoteIndex, setQuoteIndex] = useState(
    () => Math.floor(Date.now() / 15000) % QUOTES.length,
  );
  const prevAllComplete = useRef(false);

  const initials = useMemo(() => {
    if (!profile?.name) return "AS";
    return profile.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile?.name]);


  const updateTaskAndSyncLogs = useCallback(
    (id: string, patch: Partial<Task>) => {
      const t = tasks.find((x) => x.id === id);
      if (!t) return;

      // Check if completed status is changing
      const prevCompleted = t.completed;
      const nextCompleted = patch.completed !== undefined ? patch.completed : prevCompleted;

      // Check if duration or subject is changing
      const prevDuration = t.duration || 0;
      const nextDuration = patch.duration !== undefined ? patch.duration || 0 : prevDuration;
      const prevSubject = t.subject;
      const nextSubject = patch.subject !== undefined ? patch.subject : prevSubject;

      updateTask(id, patch);

      // Sync study logs:
      if (!prevCompleted && nextCompleted) {
        // Completed now
        if (nextDuration > 0) {
          addStudyLog({
            id: crypto.randomUUID(),
            subject: nextSubject,
            duration: nextDuration,
            date: patch.completedAt
              ? patch.completedAt.slice(0, 10)
              : new Date().toISOString().slice(0, 10),
            notes: `Completed task: ${patch.title || t.title}`,
            taskId: id,
            createdAt: new Date().toISOString(),
          });
        }
      } else if (prevCompleted && !nextCompleted) {
        // Restored
        const log = studyLogs.find((l) => l.taskId === id);
        if (log) {
          deleteStudyLog(log.id);
        }
      } else if (nextCompleted && (prevDuration !== nextDuration || prevSubject !== nextSubject)) {
        // Already completed but duration or subject changed
        const log = studyLogs.find((l) => l.taskId === id);
        if (log) {
          if (nextDuration > 0) {
            // Update log
            const updatedLogs = studyLogs.map((l) =>
              l.id === log.id ? { ...l, subject: nextSubject, duration: nextDuration } : l,
            );
            setAllStudyLogs(updatedLogs);
          } else {
            // Delete log if duration set to 0
            deleteStudyLog(log.id);
          }
        } else if (nextDuration > 0) {
          // Create log if duration was 0 before
          addStudyLog({
            id: crypto.randomUUID(),
            subject: nextSubject,
            duration: nextDuration,
            date: new Date().toISOString().slice(0, 10),
            notes: `Completed task: ${patch.title || t.title}`,
            taskId: id,
            createdAt: new Date().toISOString(),
          });
        }
      }
    },
    [tasks, updateTask, addStudyLog, deleteStudyLog, studyLogs, setAllStudyLogs],
  );

  const scrollToHome = () => {
    const hero = document.getElementById("hero-section");
    if (hero) {
      hero.scrollIntoView({ behavior: "smooth" });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 15000);
    return () => window.clearInterval(interval);
  }, []);

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
        case "pending":
          return !t.completed;
        case "completed":
          return t.completed;
        case "overdue":
          return isOverdue(t);
        case "today":
          return isDueToday(t);
        case "week":
          return isDueThisWeek(t);
        case "high":
          return t.priority === "high";
        case "medium":
          return t.priority === "medium";
        case "low":
          return t.priority === "low";
        case "pinned":
          return t.pinned;
        case "favorites":
          return t.favorite;
        default:
          return true;
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
          const da = a.dueDate
            ? new Date(`${a.dueDate}T${a.dueTime || "23:59"}`).getTime()
            : Infinity;
          const db = b.dueDate
            ? new Date(`${b.dueDate}T${b.dueTime || "23:59"}`).getTime()
            : Infinity;
          return da - db;
        }
        case "priority":
          return priorityRank[a.priority] - priorityRank[b.priority];
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "alpha":
          return a.title.localeCompare(b.title);
        case "subject":
          return a.subject.localeCompare(b.subject);
      }
    });
    return list;
  }, [tasks, filter, search, sort]);

  const onToggle = (id: string) => {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    const nextCompleted = !t.completed;
    updateTaskAndSyncLogs(id, {
      completed: nextCompleted,
      completedAt: nextCompleted ? new Date().toISOString() : undefined,
    });
    if (nextCompleted) {
      addXp(100);
      const completedCount = tasks.filter((x) => x.completed).length + 1;
      if (completedCount === 1) {
        unlockBadge("first-task");
      }
      if (completedCount === 10) {
        unlockBadge("tasks-10");
      }
    } else {
      addXp(-100);
    }
    toast.success(nextCompleted ? "Task completed 🎉" : "Task restored");
  };

  const handleFocusStudyLog = useCallback(
    (log: StudyLog) => {
      addStudyLog(log);
      const duration = log.duration || 0;
      if (duration > 0) {
        addXp(duration * 10);
        const focusLogsCount =
          studyLogs.filter(
            (l) => l.notes?.includes("Focus") || l.notes?.includes("Pomodoro"),
          ).length + 1;
        if (focusLogsCount === 1) {
          unlockBadge("focus-1");
        }
        if (focusLogsCount === 5) {
          unlockBadge("focus-5");
        }
      }
    },
    [addStudyLog, addXp, studyLogs, unlockBadge],
  );

  const onDelete = (id: string) => {
    deleteTask(id);
    const autoLog = studyLogs.find((log) => log.taskId === id);
    if (autoLog) {
      deleteStudyLog(autoLog.id);
    }
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

  const handleEnterApp = () => {
    localStorage.setItem("studyflow:visited", "true");
    setShowLanding(false);
  };

  if (!isHydrated) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <AnimatePresence mode="wait">
      {showLanding ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <LandingPage onEnterApp={handleEnterApp} theme={theme} setTheme={setTheme} />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mx-auto max-w-7xl px-4 py-6 sm:py-10"
        >
          <AppHeader
            scrollToHome={scrollToHome}
            theme={theme}
            setTheme={setTheme}
            initials={initials}
            onOpenProfile={() => setIsProfileOpen(true)}
            level={level}
            xp={xp}
          />

          <ProfileModal
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            profile={profile}
            setProfile={setProfile}
            initials={initials}
            onOpenSettings={() => setIsSettingsOpen(true)}
            level={level}
            xp={xp}
            unlockedBadges={unlockedBadges}
          />

          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={settings}
            setSettings={setSettings}
          />

          <TaskPreviewModal
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            previewFilter={previewFilter}
            tasks={tasks}
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

          <QuoteBanner quoteIndex={quoteIndex} />

          <div className="mt-6">
            <Tabs
              value={activeTab}
              onValueChange={(v) =>
                setActiveTab(
                  v as
                    | "tasks"
                    | "calendar"
                    | "budget"
                    | "stats"
                    | "resources"
                    | "focus"
                    | "buddy",
                )
              }
              className="space-y-6"
            >
              <TabsList className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 p-1.5 shadow-sm backdrop-blur flex-wrap sm:flex-nowrap">
                <TabsTrigger
                  value="tasks"
                  className="rounded-lg px-4 py-2.5 text-sm font-medium transition data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  Tasks
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  className="rounded-lg px-4 py-2.5 text-sm font-medium transition data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" /> Weekly Planner
                </TabsTrigger>
                <TabsTrigger
                  value="budget"
                  className="rounded-lg px-4 py-2.5 text-sm font-medium transition data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <Wallet className="mr-2 h-4 w-4" /> Time Budgeting
                </TabsTrigger>
                <TabsTrigger
                  value="stats"
                  className="rounded-lg px-4 py-2.5 text-sm font-medium transition data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer"
                >
                  <BarChart3 className="mr-2 h-4 w-4" /> Statistics
                </TabsTrigger>
                <TabsTrigger
                  value="resources"
                  className="rounded-lg px-4 py-2.5 text-sm font-medium transition data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer"
                >
                  <BookOpen className="mr-2 h-4 w-4" /> Resources
                </TabsTrigger>
                <TabsTrigger
                  value="focus"
                  className="rounded-lg px-4 py-2.5 text-sm font-medium transition data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer"
                >
                  <Timer className="mr-2 h-4 w-4" /> Focus Timer
                </TabsTrigger>
                <TabsTrigger
                  value="buddy"
                  className="rounded-lg px-4 py-2.5 text-sm font-medium transition data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer"
                >
                  <Brain className="mr-2 h-4 w-4" /> AI Study Buddy
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tasks" className="space-y-6 outline-none">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <Dashboard
                    tasks={tasks}
                    streak={streak}
                    completedToday={completedToday}
                    dailyGoal={settings.dailyGoal}
                    onCardSelect={(filter) => {
                      setPreviewFilter(filter);
                      setIsPreviewOpen(true);
                    }}
                  />

                  <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    <div className="space-y-6">
                      <TaskForm
                        onAdd={addTask}
                        editing={editing}
                        onUpdate={updateTaskAndSyncLogs}
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
                      <div className="flex items-center justify-between border-b border-border/20 pb-3">
                        <h3 className="text-sm font-bold text-foreground">
                          {viewMode === "list" ? "Task List" : "Kanban Board"}
                        </h3>
                        <div className="flex items-center gap-1 bg-secondary/40 p-1 rounded-xl border border-border/40">
                          <button
                            type="button"
                            onClick={() => setViewMode("list")}
                            className={cn(
                              "px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                              viewMode === "list"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                            )}
                          >
                            List View
                          </button>
                          <button
                            type="button"
                            onClick={() => setViewMode("kanban")}
                            className={cn(
                              "px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                              viewMode === "kanban"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                            )}
                          >
                            Kanban Board
                          </button>
                        </div>
                      </div>

                      {viewMode === "list" ? (
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
                      ) : (
                        <KanbanBoard
                          tasks={visibleTasks}
                          onToggle={onToggle}
                          onDelete={onDelete}
                          onPin={onPin}
                        />
                      )}
                    </div>
                    <aside className="space-y-4">
                      <UpcomingPanel tasks={tasks} />
                      <QuickNotes />
                    </aside>
                  </div>

                  <AppFooter
                    scrollToHome={scrollToHome}
                    onViewTour={() => {
                      localStorage.removeItem("studyflow:visited");
                      setShowLanding(true);
                    }}
                  />
                </motion.div>
              </TabsContent>

              <TabsContent value="calendar" className="space-y-6 outline-none">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <WeeklyCalendar
                    tasks={tasks}
                    onAddTask={(t) => {
                      addTask(t);
                      unlockBadge("planner");
                    }}
                    onUpdateTask={(id, patch) => {
                      updateTaskAndSyncLogs(id, patch);
                      unlockBadge("planner");
                    }}
                    onDeleteTask={onDelete}
                  />
                </motion.div>
              </TabsContent>

              <TabsContent value="budget" className="space-y-6 outline-none">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <TimeBudgetPanel
                    studyLogs={studyLogs}
                    budgets={budgets}
                    onUpdateBudget={updateBudget}
                    onAddStudyLog={handleFocusStudyLog}
                    onDeleteStudyLog={deleteStudyLog}
                  />
                </motion.div>
              </TabsContent>

              <TabsContent value="stats" className="outline-none">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <StatsPanel tasks={tasks} />
                </motion.div>
              </TabsContent>

              <TabsContent value="resources" className="outline-none">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <ResourcesPanel
                    materials={materials}
                    onAddMaterial={addMaterial}
                    onDeleteMaterial={deleteMaterial}
                  />
                </motion.div>
              </TabsContent>

              <TabsContent value="focus" className="outline-none">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <Pomodoro onAddStudyLog={handleFocusStudyLog} />
                </motion.div>
              </TabsContent>

              <TabsContent value="buddy" className="outline-none">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <AIBuddy tasks={tasks} studyLogs={studyLogs} streak={streak} />
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
