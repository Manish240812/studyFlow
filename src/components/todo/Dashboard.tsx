import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, ListTodo, AlertTriangle, Flame, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Task } from "@/lib/todo/types";
import { isOverdue } from "@/lib/todo/types";

interface Props {
  tasks: Task[];
  streak: number;
  completedToday: number;
  dailyGoal: number;
}

export function Dashboard({ tasks, streak, completedToday, dailyGoal }: Props) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = tasks.filter((t) => !t.completed).length;
  const overdue = tasks.filter((t) => isOverdue(t)).length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const goalPct = Math.min(100, Math.round((completedToday / Math.max(1, dailyGoal)) * 100));

  const cards = [
    { label: "Total", value: total, icon: ListTodo, color: "text-primary", bg: "bg-primary/10" },
    { label: "Completed", value: completed, icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
    { label: "Pending", value: pending, icon: Circle, color: "text-warning", bg: "bg-warning/15" },
    { label: "Overdue", value: overdue, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
  ];

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-4 sm:p-5 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {c.label}
                </p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                  {c.value}
                </p>
              </div>
              <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${c.bg}`}>
                <c.icon className={`h-5 w-5 ${c.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5 shadow-soft lg:col-span-2"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Overall Progress</h3>
              <p className="text-sm text-muted-foreground">
                {completed} of {total} tasks completed
              </p>
            </div>
            <p className="gradient-text text-3xl font-bold">{pct}%</p>
          </div>
          <Progress value={pct} className="mt-4 h-3" />
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <StatMini icon={Target} label="Daily goal" value={`${completedToday}/${dailyGoal}`} />
            <StatMini icon={Flame} label="Streak" value={`${streak} 🔥`} />
            <StatMini icon={Clock} label="Today" value={`${goalPct}%`} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5 shadow-soft flex flex-col items-center justify-center"
        >
          <CircularProgress value={pct} />
          <p className="mt-3 text-sm font-medium text-muted-foreground">Completion rate</p>
        </motion.div>
      </div>
    </section>
  );
}

function StatMini({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-secondary/60 p-3">
      <Icon className="mx-auto h-4 w-4 text-primary" />
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function CircularProgress({ value }: { value: number }) {
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          className="stroke-secondary"
          strokeWidth="10"
          fill="none"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          className="stroke-primary"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-2xl font-bold gradient-text">{value}%</span>
      </div>
    </div>
  );
}
