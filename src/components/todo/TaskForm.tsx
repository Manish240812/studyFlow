import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SUBJECTS,
  CATEGORIES,
  PRIORITIES,
  PRIORITY_META,
  type Task,
  type Priority,
  type Subject,
  type Category,
} from "@/lib/todo/types";

interface Props {
  onAdd: (task: Task) => void;
  editing?: Task | null;
  onUpdate?: (id: string, patch: Partial<Task>) => void;
  onCancelEdit?: () => void;
  defaultDueDate?: string;
  hideScheduleFields?: boolean;
}

const emptyForm = {
  title: "",
  description: "",
  subject: "Computer Science" as Subject,
  category: "Assignment" as Category,
  priority: "medium" as Priority,
  dueDate: "",
  dueTime: "",
  duration: "",
};

export function TaskForm({
  onAdd,
  editing,
  onUpdate,
  onCancelEdit,
  defaultDueDate,
  hideScheduleFields = false,
}: Props) {
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    dueDate: defaultDueDate || "",
  }));

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title,
        description: editing.description || "",
        subject: editing.subject,
        category: editing.category,
        priority: editing.priority,
        dueDate: editing.dueDate || "",
        dueTime: editing.dueTime || "",
        duration: editing.duration ? String(editing.duration) : "",
      });
    } else {
      setForm((prev) => ({
        ...prev,
        dueDate: defaultDueDate || "",
      }));
    }
  }, [editing, defaultDueDate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Please enter a task title");
      return;
    }
    if (editing && onUpdate) {
      onUpdate(editing.id, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        subject: form.subject,
        category: form.category,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
        dueTime: hideScheduleFields ? undefined : form.dueTime || undefined,
        duration: form.duration ? Number(form.duration) : undefined,
      });
      toast.success("Task updated");
      onCancelEdit?.();
    } else {
      const task: Task = {
        id: crypto.randomUUID(),
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        subject: form.subject,
        category: form.category,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
        dueTime: hideScheduleFields ? undefined : form.dueTime || undefined,
        duration: form.duration ? Number(form.duration) : undefined,
        completed: false,
        pinned: false,
        favorite: false,
        createdAt: new Date().toISOString(),
        order: Date.now(),
      };
      onAdd(task);
      toast.success("Task added");
    }
    setForm({ ...emptyForm, dueDate: defaultDueDate || "" });
  };

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 shadow-soft"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg gradient-primary text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <h3 className="font-display text-lg font-semibold">
          {editing ? "Edit task" : "Create a new task"}
        </h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="e.g. Finish DSA assignment on trees"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-1.5"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="desc">Description</Label>
          <Textarea
            id="desc"
            placeholder="Optional notes about the task…"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1.5 min-h-[72px]"
          />
        </div>

        <div>
          <Label>Subject</Label>
          <Select
            value={form.subject}
            onValueChange={(v) => setForm({ ...form, subject: v as Subject })}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Category</Label>
          <Select
            value={form.category}
            onValueChange={(v) => setForm({ ...form, category: v as Category })}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Priority</Label>
          <Select
            value={form.priority}
            onValueChange={(v) => setForm({ ...form, priority: v as Priority })}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${PRIORITY_META[p].dot}`} />
                    {PRIORITY_META[p].label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="duration">Duration (min)</Label>
          <Input
            id="duration"
            type="number"
            min="0"
            placeholder="e.g. 45"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            className="mt-1.5"
          />
        </div>

        {!hideScheduleFields && (
          <>
            <div>
              <Label htmlFor="date">Due date</Label>
              <Input
                id="date"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="time">Due time</Label>
              <Input
                id="time"
                type="time"
                value={form.dueTime}
                onChange={(e) => setForm({ ...form, dueTime: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </>
        )}
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        {editing && (
          <Button type="button" variant="ghost" onClick={onCancelEdit}>
            Cancel
          </Button>
        )}
        <Button type="submit" className="gradient-primary text-primary-foreground shadow-glow">
          <Plus className="mr-1 h-4 w-4" />
          {editing ? "Save changes" : "Add task"}
        </Button>
      </div>
    </motion.form>
  );
}
