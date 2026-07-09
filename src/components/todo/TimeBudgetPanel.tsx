import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Calendar, Clock, Edit2, Plus, Settings, Timer, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { SUBJECTS, SUBJECT_COLORS, type Subject, type StudyLog } from "@/lib/todo/types";

interface Props {
  studyLogs: StudyLog[];
  budgets: Record<Subject, number>;
  onUpdateBudget: (subject: Subject, hours: number) => void;
  onAddStudyLog: (log: StudyLog) => void;
  onDeleteStudyLog: (id: string) => void;
}

export function TimeBudgetPanel({
  studyLogs,
  budgets,
  onUpdateBudget,
  onAddStudyLog,
  onDeleteStudyLog,
}: Props) {
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject>("Computer Science");
  const [viewingLog, setViewingLog] = useState<StudyLog | null>(null);
  // Budget slider values
  const [budgetForm, setBudgetForm] = useState<Record<Subject, string>>(() => {
    const form = {} as Record<Subject, string>;
    SUBJECTS.forEach((s) => {
      form[s] = String(budgets[s] ?? 5);
    });
    return form;
  });

  const handleOpenBudget = () => {
    const currentBudgets = {} as Record<Subject, string>;
    SUBJECTS.forEach((s) => {
      currentBudgets[s] = String(budgets[s] ?? 5);
    });
    setBudgetForm(currentBudgets);
    setIsBudgetOpen(true);
  };

  const submitBudgets = (e: React.FormEvent) => {
    e.preventDefault();
    SUBJECTS.forEach((s) => {
      const hours = Math.max(0, parseFloat(budgetForm[s]) || 0);
      onUpdateBudget(s, hours);
    });
    setIsBudgetOpen(false);
    toast.success("Study budgets updated successfully");
  };

  // Calculations for Actual hours per subject
  const getActualHours = (subject: Subject) => {
    const mins = studyLogs
      .filter((log) => log.subject === subject)
      .reduce((acc, log) => acc + log.duration, 0);
    return Math.round((mins / 60) * 10) / 10;
  };

  const getPlannedHours = (subject: Subject) => budgets[subject] ?? 5;

  const getFormatDuration = (totalMinutes: number) => {
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs > 0 ? `${hrs}h ` : ""}${mins > 0 ? `${mins}m` : hrs === 0 ? "0m" : ""}`.trim();
  };

  // Recharts Chart Data
  const chartData = SUBJECTS.map((s) => {
    const planned = getPlannedHours(s);
    const actual = getActualHours(s);
    return {
      name: s.length > 8 ? s.slice(0, 8) + "…" : s,
      fullName: s,
      Planned: planned,
      Actual: actual,
    };
  });

  const totalPlanned = SUBJECTS.reduce((acc, s) => acc + getPlannedHours(s), 0);
  const totalActualMinutes = studyLogs.reduce((acc, log) => acc + log.duration, 0);
  const totalActual = Math.round((totalActualMinutes / 60) * 10) / 10;
  const overallProgressPct =
    totalPlanned > 0 ? Math.min(100, Math.round((totalActual / totalPlanned) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5 shadow-soft"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Budgeted Hours
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
            {totalPlanned} hrs
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Weekly planned study target</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass rounded-2xl p-5 shadow-soft"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Actual Hours
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-primary">{totalActual} hrs</p>
          <p className="mt-2 text-xs text-muted-foreground">Logged study time this week</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5 shadow-soft flex flex-col justify-between"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Overall Target Met
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {overallProgressPct}%
              </p>
            </div>
          </div>
          <Progress value={overallProgressPct} className="mt-2 h-2" />
        </motion.div>
      </div>

      {/* Main Budget layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Side: Chart and Budgets Grid */}
        <div className="space-y-6">
          {/* Chart card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-5 shadow-soft"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-semibold">Planned vs Actual Hours</h3>
                <p className="text-sm text-muted-foreground">Weekly comparison per subject</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOpenBudget}
                  className="rounded-xl border-border/70"
                >
                  <Settings className="mr-1.5 h-4 w-4 text-muted-foreground" />
                  Budget Settings
                </Button>
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148, 163, 184, 0.15)"
                    vertical={false}
                  />
                  <XAxis dataKey="name" fontSize={11} stroke="rgba(148, 163, 184, 0.5)" />
                  <YAxis fontSize={12} allowDecimals={true} stroke="rgba(148, 163, 184, 0.5)" />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: "rgba(148, 163, 184, 0.05)" }}
                    itemStyle={{ color: "#f8fafc" }}
                    labelStyle={{ color: "#f8fafc" }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12 }}
                  />
                  <Bar
                    name="Planned (hrs)"
                    dataKey="Planned"
                    fill="rgba(148, 163, 184, 0.3)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    name="Actual (hrs)"
                    dataKey="Actual"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Subjects Progress Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {SUBJECTS.map((s, i) => {
              const planned = getPlannedHours(s);
              const actual = getActualHours(s);
              const pct = planned > 0 ? Math.min(100, Math.round((actual / planned) * 100)) : 0;
              const isGoalMet = actual >= planned && planned > 0;

              return (
                <motion.div
                  key={s}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass rounded-2xl p-4 shadow-soft flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span
                        className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${SUBJECT_COLORS[s]}`}
                      >
                        {s}
                      </span>
                      <div className="text-xl font-bold mt-1.5 text-foreground">
                        {actual}{" "}
                        <span className="text-sm font-normal text-muted-foreground">
                          / {planned} hrs
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isGoalMet && (
                        <span className="rounded-full bg-success/15 px-2 py-0.5 text-2xs font-semibold text-success border border-success/20">
                          Goal Met 🎉
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Weekly Progress</span>
                      <span>{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Log History */}
        <aside className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-5 shadow-soft flex flex-col h-[525px]"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg gradient-primary text-white">
                  <BookOpen className="h-4 w-4" />
                </div>
                <h4 className="font-display font-semibold">Study Log History</h4>
              </div>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                {studyLogs.length} logs
              </span>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {studyLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <p className="text-sm text-muted-foreground">No study sessions logged yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Start logging time using the buttons above or marking tasks with durations
                    complete!
                  </p>
                </div>
              ) : (
                studyLogs.map((log) => (
                  <div
                    key={log.id}
                    onClick={() => setViewingLog(log)}
                    className="group relative rounded-xl border border-border/60 bg-secondary/30 p-3 hover:border-primary/50 hover:bg-secondary/50 transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`inline-block rounded-full border px-2 py-0.5 text-3xs font-semibold tracking-wide ${SUBJECT_COLORS[log.subject]}`}
                      >
                        {log.subject}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteStudyLog(log.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition p-0.5"
                        title="Delete log"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs font-semibold text-foreground">
                      <span className="flex items-center gap-1">
                        <Timer className="h-3.5 w-3.5 text-primary" />
                        {getFormatDuration(log.duration)}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(log.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {log.notes && (
                      <p className="mt-1.5 text-2xs text-muted-foreground italic border-t border-border/30 pt-1.5 leading-snug line-clamp-2">
                        {log.notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </aside>
      </div>

      {/* Dialog 2: Edit Budgets */}
      <Dialog open={isBudgetOpen} onOpenChange={setIsBudgetOpen}>
        <DialogContent className="sm:max-w-[480px] max-h-[85vh] overflow-y-auto rounded-2xl glass">
          <DialogHeader>
            <DialogTitle>Adjust Weekly Budgets</DialogTitle>
            <DialogDescription>
              Set how many hours you plan to spend studying each subject per week.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitBudgets} className="space-y-4 py-2">
            <div className="space-y-3">
              {SUBJECTS.map((s) => (
                <div
                  key={s}
                  className="grid grid-cols-[1fr_90px] items-center gap-3 border-b border-border/30 pb-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${s === "Mathematics" ? "bg-blue-500" : s === "Physics" ? "bg-purple-500" : s === "Chemistry" ? "bg-pink-500" : s === "Computer Science" ? "bg-indigo-500" : s === "DSA" ? "bg-cyan-500" : s === "English" ? "bg-amber-500" : s === "Electronics" ? "bg-emerald-500" : "bg-slate-500"}`}
                    />
                    <Label className="font-medium text-foreground">{s}</Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={budgetForm[s] || "0"}
                      onChange={(e) => setBudgetForm({ ...budgetForm, [s]: e.target.value })}
                      className="h-8 text-center font-semibold"
                    />
                    <span className="text-xs text-muted-foreground">hrs</span>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsBudgetOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="gradient-primary text-primary-foreground shadow-glow"
              >
                Save Target Budgets
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog 3: View Study Session Details */}
      <Dialog open={!!viewingLog} onOpenChange={(open) => !open && setViewingLog(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl glass">
          <DialogHeader>
            <DialogTitle>Study Record Details</DialogTitle>
            <DialogDescription>Details of your logged study session.</DialogDescription>
          </DialogHeader>

          {viewingLog && (
            <div className="space-y-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span
                  className={`inline-block rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide ${SUBJECT_COLORS[viewingLog.subject]}`}
                >
                  {viewingLog.subject}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(viewingLog.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="rounded-xl border border-border/50 bg-secondary/40 p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">
                    Time Studied
                  </p>
                  <p className="text-2xl font-bold text-primary flex items-center gap-1.5 mt-0.5">
                    <Timer className="h-5 w-5" />
                    {getFormatDuration(viewingLog.duration)}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground uppercase font-semibold">
                  Topic Covered / Notes
                </p>
                <div className="rounded-xl border border-border/50 bg-background/50 p-4 min-h-[80px]">
                  {viewingLog.notes ? (
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {viewingLog.notes}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No description or notes were recorded for this session.
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter className="pt-2 gap-2 sm:gap-0 flex flex-row items-center justify-between">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    onDeleteStudyLog(viewingLog.id);
                    setViewingLog(null);
                    toast.success("Study record deleted");
                  }}
                  className="rounded-xl"
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete Record
                </Button>
                <Button type="button" onClick={() => setViewingLog(null)} className="rounded-xl">
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const tooltipStyle: React.CSSProperties = {
  background: "rgba(15, 23, 42, 0.95)",
  border: "1px solid rgba(148, 163, 184, 0.25)",
  borderRadius: "0.75rem",
  fontSize: 12,
  padding: "8px 12px",
  color: "#f8fafc",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
};
