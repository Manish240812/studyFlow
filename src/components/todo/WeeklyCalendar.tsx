import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  AlertCircle,
  Timer,
  Pin,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import {
  SUBJECT_COLORS,
  PRIORITY_META,
  isOverdue,
  type Task,
  type Subject,
  type Category,
  type Priority,
} from "@/lib/todo/types";
import { cn } from "@/lib/utils";

interface Props {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onUpdateTask: (id: string, patch: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

export function WeeklyCalendar({ tasks, onAddTask, onUpdateTask, onDeleteTask }: Props) {
  const [pivotDate, setPivotDate] = useState(() => new Date());
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [prefilledDate, setPrefilledDate] = useState("");

  // Calculate start of the week (Monday) based on pivotDate
  const startOfWeek = useMemo(() => {
    const d = new Date(pivotDate);
    const day = d.getDay();
    // Adjust when day is Sunday (getDay() returns 0)
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }, [pivotDate]);

  // Generate 7 days (Mon-Sun) of the week
  const daysOfWeek = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  }, [startOfWeek]);

  const endOfWeek = useMemo(() => {
    const sunday = new Date(daysOfWeek[6]);
    sunday.setHours(23, 59, 59, 999);
    return sunday;
  }, [daysOfWeek]);

  // Filter tasks for the selected week
  const weeklyTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!t.plannedInWeekly) return false;
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d >= startOfWeek && d <= endOfWeek;
    });
  }, [tasks, startOfWeek, endOfWeek]);

  // Filter tasks that are unscheduled (no due date)
  const unscheduledTasks = useMemo(() => {
    return tasks.filter((t) => t.plannedInWeekly && !t.dueDate);
  }, [tasks]);

  const handlePrevWeek = () => {
    setPivotDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() - 7);
      return next;
    });
  };

  const handleNextWeek = () => {
    setPivotDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + 7);
      return next;
    });
  };

  const handleToday = () => {
    setPivotDate(new Date());
  };

  const handleAddTaskClick = (dateStr: string) => {
    setEditingTask(null);
    setPrefilledDate(dateStr);
    setIsTaskFormOpen(true);
  };

  const handleEditTaskClick = (task: Task) => {
    setEditingTask(task);
    setPrefilledDate(task.dueDate || "");
    setIsTaskFormOpen(true);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getFormatWeekRange = () => {
    const formatOptions: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    const startStr = startOfWeek.toLocaleDateString(undefined, formatOptions);
    const endStr = endOfWeek.toLocaleDateString(undefined, formatOptions);
    const year = startOfWeek.getFullYear();
    return `${startStr} – ${endStr}, ${year}`;
  };

  const handleToggle = (task: Task) => {
    const nextCompleted = !task.completed;
    onUpdateTask(task.id, {
      completed: nextCompleted,
      completedAt: nextCompleted ? new Date().toISOString() : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header with Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Weekly Planner</h3>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={handlePrevWeek}
            className="h-8 w-8 rounded-lg"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold min-w-[140px] text-center">
            {getFormatWeekRange()}
          </span>
          <Button
            size="icon"
            variant="outline"
            onClick={handleNextWeek}
            className="h-8 w-8 rounded-lg"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleToday}
            className="text-xs font-semibold rounded-lg"
          >
            Today
          </Button>
        </div>
      </div>

      {/* Main Grid: Days of Week (Mon - Sun) + Unscheduled Drawer */}
      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        {/* Weekly Columns */}
        <div className="grid gap-3 sm:grid-cols-7">
          {daysOfWeek.map((day, index) => {
            const dateStr = day.toISOString().slice(0, 10);
            const dayTasks = weeklyTasks.filter((t) => t.dueDate === dateStr);
            const dayIsToday = isToday(day);

            return (
              <motion.div
                key={dateStr}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={cn(
                  "flex flex-col min-h-[360px] rounded-2xl border border-border/50 bg-card/40 p-3 transition shadow-soft",
                  dayIsToday &&
                    "ring-1 ring-primary border-primary/50 bg-primary/5 dark:bg-primary/2",
                )}
              >
                {/* Day Header */}
                <div className="flex items-baseline justify-between border-b border-border/40 pb-2 mb-3">
                  <div>
                    <h4
                      className={cn(
                        "text-xs font-bold uppercase tracking-wider text-muted-foreground",
                        dayIsToday && "text-primary",
                      )}
                    >
                      {day.toLocaleDateString(undefined, { weekday: "short" })}
                    </h4>
                    <p
                      className={cn(
                        "text-base font-bold text-foreground mt-0.5",
                        dayIsToday && "text-primary",
                      )}
                    >
                      {day.getDate()}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleAddTaskClick(dateStr)}
                    className="h-6 w-6 rounded-md hover:bg-secondary"
                    title="Add task for this day"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Day Tasks List */}
                <div className="flex-1 space-y-2 overflow-y-auto max-h-[400px] pr-0.5">
                  {dayTasks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-2 opacity-40">
                      <span className="text-3xs text-muted-foreground">Empty</span>
                    </div>
                  ) : (
                    dayTasks.map((t) => {
                      const overdue = isOverdue(t);
                      const pm = PRIORITY_META[t.priority];
                      return (
                        <div
                          key={t.id}
                          className={cn(
                            "group rounded-xl border border-border/60 bg-background/50 p-2 text-left hover:border-primary/50 hover:bg-background transition shadow-sm",
                            t.completed && "opacity-60",
                            overdue && !t.completed && "border-destructive/30",
                          )}
                        >
                          <div className="flex items-start gap-1.5">
                            <Checkbox
                              checked={t.completed}
                              onCheckedChange={() => handleToggle(t)}
                              className="h-3.5 w-3.5 mt-0.5 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h5
                                className={cn(
                                  "text-xs font-semibold text-foreground leading-tight truncate",
                                  t.completed && "line-through text-muted-foreground",
                                )}
                                title={t.title}
                              >
                                {t.title}
                              </h5>
                              <div className="mt-1.5 flex flex-wrap items-center gap-1 text-4xs">
                                <span
                                  className={cn(
                                    "rounded-full border px-1 py-0 text-4xs leading-none font-medium scale-90 origin-left",
                                    SUBJECT_COLORS[t.subject],
                                  )}
                                >
                                  {t.subject}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-2 flex items-center justify-between border-t border-border/20 pt-1.5 text-4xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              {t.duration && (
                                <span className="flex items-center gap-0.5" title="Duration">
                                  <Timer className="h-2.5 w-2.5" />
                                  {t.duration}m
                                </span>
                              )}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditTaskClick(t)}
                                className="text-muted-foreground hover:text-primary transition p-0.5"
                                title="Edit"
                              >
                                <Edit2 className="h-2.5 w-2.5" />
                              </button>
                              <button
                                onClick={() => onDeleteTask(t.id)}
                                className="text-muted-foreground hover:text-destructive transition p-0.5"
                                title="Delete"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Unscheduled Sidebar */}
        <aside className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-4 shadow-soft flex flex-col h-[360px] lg:h-full min-h-[360px]"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-warning" />
                <h4 className="font-display font-semibold text-sm">Unscheduled</h4>
              </div>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-3xs font-medium">
                {unscheduledTasks.length} tasks
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {unscheduledTasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-3 opacity-40">
                  <span className="text-xs text-muted-foreground">All tasks scheduled!</span>
                </div>
              ) : (
                unscheduledTasks.map((t) => (
                  <div
                    key={t.id}
                    className="group rounded-xl border border-border/60 bg-secondary/20 p-2 text-left hover:border-primary/50 hover:bg-secondary/40 transition"
                  >
                    <div className="flex items-start gap-1.5">
                      <Checkbox
                        checked={t.completed}
                        onCheckedChange={() => handleToggle(t)}
                        className="h-3.5 w-3.5 mt-0.5 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h5
                          className={cn(
                            "text-xs font-semibold text-foreground leading-tight truncate",
                            t.completed && "line-through text-muted-foreground",
                          )}
                          title={t.title}
                        >
                          {t.title}
                        </h5>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span
                            className={cn(
                              "rounded-full border px-1.5 py-0 text-5xs leading-none font-medium",
                              SUBJECT_COLORS[t.subject],
                            )}
                          >
                            {t.subject}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between border-t border-border/20 pt-1.5 text-4xs text-muted-foreground">
                      <button
                        onClick={() => handleEditTaskClick(t)}
                        className="flex items-center gap-0.5 text-primary hover:underline font-semibold"
                      >
                        <Calendar className="h-2.5 w-2.5" />
                        Schedule
                      </button>
                      <button
                        onClick={() => onDeleteTask(t.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition p-0.5"
                        title="Delete"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </aside>
      </div>

      {/* Task Creation & Editing Dialog */}
      <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-2xl glass">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Planner Task" : "Add Planner Task"}</DialogTitle>
            <DialogDescription>
              Create or modify a study task directly inside your weekly planner schedule.
            </DialogDescription>
          </DialogHeader>

          <TaskForm
            onAdd={(task) => {
              onAddTask({ ...task, plannedInWeekly: true });
              setIsTaskFormOpen(false);
            }}
            editing={editingTask}
            onUpdate={(id, patch) => {
              onUpdateTask(id, patch);
              setIsTaskFormOpen(false);
            }}
            onCancelEdit={() => {
              setIsTaskFormOpen(false);
              setEditingTask(null);
            }}
            defaultDueDate={prefilledDate}
            hideScheduleFields={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
