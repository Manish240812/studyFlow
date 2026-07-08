import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Calendar,
  Clock,
  Copy,
  Edit3,
  GripVertical,
  Pin,
  Star,
  Timer,
  Trash2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  PRIORITY_META,
  SUBJECT_COLORS,
  isOverdue,
  type Task,
} from "@/lib/todo/types";

interface Props {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onPin: () => void;
  onFavorite: () => void;
}

export function TaskCard({
  task,
  onToggle,
  onDelete,
  onEdit,
  onDuplicate,
  onPin,
  onFavorite,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const overdue = isOverdue(task);
  const p = PRIORITY_META[task.priority];

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
      className={cn(
        "group glass rounded-2xl p-4 shadow-soft transition-all",
        "hover:shadow-glow hover:-translate-y-0.5",
        task.completed && "opacity-70",
        overdue && !task.completed && "ring-1 ring-destructive/40",
        task.pinned && "ring-1 ring-primary/40",
      )}
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 hidden touch-none text-muted-foreground hover:text-foreground sm:block"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <Checkbox
          checked={task.completed}
          onCheckedChange={onToggle}
          className="mt-1 h-5 w-5"
          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4
                className={cn(
                  "text-base font-semibold text-foreground",
                  task.completed && "line-through text-muted-foreground",
                )}
              >
                {task.title}
              </h4>
              {task.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <TooltipProvider>
                <IconBtn
                  active={task.pinned}
                  onClick={onPin}
                  label={task.pinned ? "Unpin" : "Pin"}
                  activeClass="text-primary"
                >
                  <Pin className={cn("h-4 w-4", task.pinned && "fill-current")} />
                </IconBtn>
                <IconBtn
                  active={task.favorite}
                  onClick={onFavorite}
                  label={task.favorite ? "Unfavorite" : "Favorite"}
                  activeClass="text-warning"
                >
                  <Star className={cn("h-4 w-4", task.favorite && "fill-current")} />
                </IconBtn>
                <IconBtn onClick={onEdit} label="Edit">
                  <Edit3 className="h-4 w-4" />
                </IconBtn>
                <IconBtn onClick={onDuplicate} label="Duplicate">
                  <Copy className="h-4 w-4" />
                </IconBtn>
                <IconBtn onClick={onDelete} label="Delete" activeClass="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </IconBtn>
              </TooltipProvider>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className={cn("rounded-full border px-2 py-0.5 font-medium", SUBJECT_COLORS[task.subject])}>
              {task.subject}
            </span>
            <span className="rounded-full border border-border bg-secondary/60 px-2 py-0.5 font-medium text-secondary-foreground">
              {task.category}
            </span>
            <span className={cn("rounded-full border px-2 py-0.5 font-medium flex items-center gap-1", p.className)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", p.dot)} /> {p.label}
            </span>
            {task.dueDate && (
              <span className={cn(
                "flex items-center gap-1 rounded-full border border-border bg-background/60 px-2 py-0.5",
                overdue && !task.completed && "text-destructive border-destructive/40 bg-destructive/5",
              )}>
                <Calendar className="h-3 w-3" />
                {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
            )}
            {task.dueTime && (
              <span className="flex items-center gap-1 rounded-full border border-border bg-background/60 px-2 py-0.5">
                <Clock className="h-3 w-3" />
                {task.dueTime}
              </span>
            )}
            {task.duration && (
              <span className="flex items-center gap-1 rounded-full border border-border bg-background/60 px-2 py-0.5">
                <Timer className="h-3 w-3" />
                {task.duration}m
              </span>
            )}
            <span className="ml-auto text-muted-foreground">
              Added {new Date(task.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function IconBtn({
  children,
  onClick,
  label,
  active,
  activeClass,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
  activeClass?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={onClick}
          aria-label={label}
          className={cn("h-8 w-8", active && activeClass)}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="rounded-lg bg-foreground text-background">
        <p className="text-xs font-medium">{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
