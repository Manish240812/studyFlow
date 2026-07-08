export type Priority = "high" | "medium" | "low";

export type Subject =
  | "Mathematics"
  | "Physics"
  | "Chemistry"
  | "Computer Science"
  | "DSA"
  | "English"
  | "Electronics"
  | "Other";

export type Category =
  | "Assignment"
  | "Homework"
  | "Exam"
  | "Lab"
  | "Project"
  | "Revision"
  | "Personal";

export interface Task {
  id: string;
  title: string;
  description?: string;
  subject: Subject;
  category: Category;
  priority: Priority;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  duration?: number; // minutes
  completed: boolean;
  completedAt?: string;
  pinned: boolean;
  favorite: boolean;
  createdAt: string;
  order: number;
}

export const SUBJECTS: Subject[] = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Computer Science",
  "DSA",
  "English",
  "Electronics",
  "Other",
];

export const CATEGORIES: Category[] = [
  "Assignment",
  "Homework",
  "Exam",
  "Lab",
  "Project",
  "Revision",
  "Personal",
];

export const PRIORITIES: Priority[] = ["high", "medium", "low"];

export const PRIORITY_META: Record<
  Priority,
  { label: string; className: string; dot: string }
> = {
  high: {
    label: "High",
    className: "bg-destructive/10 text-destructive border-destructive/20",
    dot: "bg-destructive",
  },
  medium: {
    label: "Medium",
    className: "bg-warning/15 text-warning-foreground border-warning/30 dark:text-warning",
    dot: "bg-warning",
  },
  low: {
    label: "Low",
    className: "bg-success/10 text-success border-success/20 dark:text-success",
    dot: "bg-success",
  },
};

export const SUBJECT_COLORS: Record<Subject, string> = {
  Mathematics: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-300",
  Physics: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-300",
  Chemistry: "bg-pink-500/10 text-pink-600 border-pink-500/20 dark:text-pink-300",
  "Computer Science": "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-300",
  DSA: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-300",
  English: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-300",
  Electronics: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-300",
  Other: "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-300",
};

export function isOverdue(t: Task): boolean {
  if (t.completed || !t.dueDate) return false;
  const dt = new Date(`${t.dueDate}T${t.dueTime || "23:59"}`);
  return dt.getTime() < Date.now();
}

export function isDueToday(t: Task): boolean {
  if (!t.dueDate) return false;
  const today = new Date();
  const d = new Date(t.dueDate);
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export function isDueThisWeek(t: Task): boolean {
  if (!t.dueDate) return false;
  const now = new Date();
  const d = new Date(t.dueDate);
  const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= -1 && diff <= 7;
}
