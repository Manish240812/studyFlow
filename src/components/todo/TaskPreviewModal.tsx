import { motion } from "framer-motion";
import { X } from "lucide-react";
import { TaskList } from "@/components/todo/TaskList";
import { type Task, isOverdue } from "@/lib/todo/types";
import { type FilterKey } from "@/components/todo/FiltersBar";

interface TaskPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewFilter: FilterKey;
  tasks: Task[];
  setAllTasks: (tasks: Task[]) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (t: Task) => void;
  onDuplicate: (t: Task) => void;
  onPin: (id: string) => void;
  onFavorite: (id: string) => void;
}

export function TaskPreviewModal({
  isOpen,
  onClose,
  previewFilter,
  tasks,
  setAllTasks,
  onToggle,
  onDelete,
  onEdit,
  onDuplicate,
  onPin,
  onFavorite,
}: TaskPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 py-6 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border/70 bg-background p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">Task preview</p>
            <h2 className="mt-1 text-2xl font-semibold text-foreground">
              {previewFilter === "all"
                ? "All tasks"
                : previewFilter === "completed"
                  ? "Completed tasks"
                  : previewFilter === "pending"
                    ? "Pending tasks"
                    : previewFilter === "overdue"
                      ? "Overdue tasks"
                      : "Task preview"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review tasks directly from the dashboard without changing the page filters.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border/70 p-2 text-muted-foreground transition hover:border-primary hover:text-primary"
            aria-label="Close preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <TaskList
            tasks={tasks.filter((t) => {
              switch (previewFilter) {
                case "pending":
                  return !t.completed;
                case "completed":
                  return t.completed;
                case "overdue":
                  return isOverdue(t);
                default:
                  return true;
              }
            })}
            allTasks={tasks}
            setAllTasks={setAllTasks}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={(t) => {
              onEdit(t);
              onClose();
            }}
            onDuplicate={onDuplicate}
            onPin={onPin}
            onFavorite={onFavorite}
          />
        </div>
      </motion.div>
    </div>
  );
}
