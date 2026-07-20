import { motion } from "framer-motion";
import { type Task } from "@/lib/todo/types";
import { Calendar, Clock, ArrowRight, ArrowLeft, CheckCircle2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SUBJECT_COLORS, PRIORITY_META } from "@/lib/todo/types";

interface KanbanProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
}

export function KanbanBoard({ tasks, onToggle, onDelete, onPin }: KanbanProps) {
  // Column 1: To Do (Pending, unpinned)
  const todoTasks = tasks.filter((t) => !t.completed && !t.pinned);
  // Column 2: In Progress (Pending, pinned)
  const progressTasks = tasks.filter((t) => !t.completed && t.pinned);
  // Column 3: Completed
  const completedTasks = tasks.filter((t) => t.completed);

  const columns = [
    {
      id: "todo",
      title: "📋 To Do",
      tasks: todoTasks,
      bgColor: "bg-card/40",
      borderColor: "border-border/40",
    },
    {
      id: "progress",
      title: "⚡ In Progress",
      tasks: progressTasks,
      bgColor: "bg-primary/5",
      borderColor: "border-primary/20",
    },
    {
      id: "completed",
      title: "✅ Completed",
      tasks: completedTasks,
      bgColor: "bg-success/5",
      borderColor: "border-success/20",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {columns.map((col) => (
        <div
          key={col.id}
          className={cn(
            "flex flex-col rounded-2xl border p-4 min-h-[500px]",
            col.bgColor,
            col.borderColor,
          )}
        >
          <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-2">
            <h3 className="font-bold text-foreground flex items-center gap-1.5">
              {col.title}
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/80 text-muted-foreground font-semibold">
                {col.tasks.length}
              </span>
            </h3>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1">
            {col.tasks.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border/30 text-center p-4">
                <p className="text-xs text-muted-foreground">No tasks here</p>
              </div>
            ) : (
              col.tasks.map((task) => {
                const p = PRIORITY_META[task.priority];
                return (
                  <motion.div
                    key={task.id}
                    layoutId={task.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "glass rounded-xl p-3.5 shadow-sm border border-border/50 space-y-3 relative group transition-all duration-300 hover:shadow-md",
                      task.completed && "opacity-80 border-success/30",
                      task.pinned && "border-primary/30",
                    )}
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={cn(
                            "inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold border leading-none uppercase tracking-wide",
                            SUBJECT_COLORS[task.subject],
                          )}
                        >
                          {task.subject}
                        </span>
                        <span
                          className={cn(
                            "inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold border leading-none uppercase tracking-wide",
                            p.className,
                          )}
                        >
                          {p.label}
                        </span>
                      </div>
                      <h4
                        className={cn(
                          "mt-2 text-sm font-bold text-foreground leading-snug",
                          task.completed && "line-through text-muted-foreground",
                        )}
                      >
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Meta info (Due Date, Time) */}
                    {(task.dueDate || task.duration) && (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground border-t border-border/10 pt-2">
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {task.dueDate}
                          </span>
                        )}
                        {task.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.duration}m
                          </span>
                        )}
                      </div>
                    )}

                    {/* Column controls */}
                    <div className="flex items-center justify-between border-t border-border/10 pt-2 mt-1">
                      <button
                        onClick={() => onDelete(task.id)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      <div className="flex items-center gap-1.5">
                        {col.id === "todo" && (
                          <button
                            onClick={() => onPin(task.id)}
                            className="flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary hover:bg-primary/20 transition cursor-pointer"
                            title="Start Task"
                          >
                            Start <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                        {col.id === "progress" && (
                          <>
                            <button
                              onClick={() => onPin(task.id)}
                              className="flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-[10px] font-bold text-muted-foreground hover:bg-secondary/80 transition cursor-pointer"
                              title="Move back to To Do"
                            >
                              <ArrowLeft className="h-3 w-3" /> Back
                            </button>
                            <button
                              onClick={() => onToggle(task.id)}
                              className="flex items-center gap-1 rounded-lg bg-success/15 px-2 py-1 text-[10px] font-bold text-success hover:bg-success/25 transition cursor-pointer"
                              title="Mark Completed"
                            >
                              Finish <CheckCircle2 className="h-3 w-3" />
                            </button>
                          </>
                        )}
                        {col.id === "completed" && (
                          <button
                            onClick={() => onToggle(task.id)}
                            className="flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-[10px] font-bold text-muted-foreground hover:bg-secondary/80 transition cursor-pointer"
                            title="Restore Task"
                          >
                            <ArrowLeft className="h-3 w-3" /> Restore
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
