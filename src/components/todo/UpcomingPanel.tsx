import { useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarClock, Hourglass } from "lucide-react";
import { isOverdue, type Task } from "@/lib/todo/types";

interface Props {
  tasks: Task[];
}

function useCountdown(target?: string) {
  return useMemo(() => {
    if (!target) return null;
    const diff = new Date(target).getTime() - Date.now();
    if (diff <= 0) return "Overdue";
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ${h % 24}h`;
    return `${h}h ${m}m`;
  }, [target]);
}

export function UpcomingPanel({ tasks }: Props) {
  const today = new Date();
  const upcoming = useMemo(
    () =>
      tasks
        .filter((t) => !t.completed && t.dueDate)
        .sort((a, b) => {
          const da = new Date(`${a.dueDate}T${a.dueTime || "23:59"}`).getTime();
          const db = new Date(`${b.dueDate}T${b.dueTime || "23:59"}`).getTime();
          return da - db;
        })
        .slice(0, 4),
    [tasks],
  );

  const next = upcoming[0];
  const nextTarget = next?.dueDate
    ? `${next.dueDate}T${next.dueTime || "23:59"}`
    : undefined;
  const countdown = useCountdown(nextTarget);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 shadow-soft"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg gradient-primary text-primary-foreground">
            <CalendarClock className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-display font-semibold leading-tight">
              {today.toLocaleDateString(undefined, { weekday: "long" })}
            </h4>
            <p className="text-xs text-muted-foreground">
              {today.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>
        {next && (
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Next due</p>
            <p className="flex items-center gap-1 text-sm font-semibold gradient-text">
              <Hourglass className="h-3.5 w-3.5" />
              {countdown}
            </p>
          </div>
        )}
      </div>

      {upcoming.length === 0 ? (
        <p className="rounded-xl bg-secondary/50 p-4 text-center text-sm text-muted-foreground">
          No upcoming deadlines. 🎉
        </p>
      ) : (
        <ul className="space-y-2">
          {upcoming.map((t) => {
            const overdue = isOverdue(t);
            return (
              <li
                key={t.id}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${
                  overdue
                    ? "border-destructive/40 bg-destructive/5 text-destructive"
                    : "border-border bg-background/50"
                }`}
              >
                <span className="min-w-0 truncate font-medium">{t.title}</span>
                <span className="ml-3 shrink-0 text-xs opacity-80">
                  {new Date(t.dueDate!).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  {t.dueTime ? ` · ${t.dueTime}` : ""}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </motion.div>
  );
}
