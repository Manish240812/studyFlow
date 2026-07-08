import { AnimatePresence, motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Inbox } from "lucide-react";
import { TaskCard } from "./TaskCard";
import type { Task } from "@/lib/todo/types";

interface Props {
  tasks: Task[];
  allTasks: Task[];
  setAllTasks: (t: Task[]) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (t: Task) => void;
  onDuplicate: (t: Task) => void;
  onPin: (id: string) => void;
  onFavorite: (id: string) => void;
}

export function TaskList({
  tasks,
  allTasks,
  setAllTasks,
  onToggle,
  onDelete,
  onEdit,
  onDuplicate,
  onPin,
  onFavorite,
}: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(tasks, oldIndex, newIndex);
    // Reassign order numbers preserving other tasks
    const orderMap = new Map(reordered.map((t, i) => [t.id, i]));
    const next = allTasks
      .map((t) => (orderMap.has(t.id) ? { ...t, order: orderMap.get(t.id)! } : t));
    setAllTasks(next);
  };

  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-10 text-center shadow-soft"
      >
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full gradient-primary text-primary-foreground shadow-glow">
          <Inbox className="h-9 w-9" />
        </div>
        <h3 className="mt-5 font-display text-xl font-bold">You're all caught up!</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first task to start studying.
        </p>
      </motion.div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {tasks.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onToggle={() => onToggle(t.id)}
                onDelete={() => onDelete(t.id)}
                onEdit={() => onEdit(t)}
                onDuplicate={() => onDuplicate(t)}
                onPin={() => onPin(t.id)}
                onFavorite={() => onFavorite(t.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>
    </DndContext>
  );
}
