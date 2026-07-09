import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { SUBJECTS, type Task } from "@/lib/todo/types";

interface Props {
  tasks: Task[];
}

const CHART_COLORS = ["hsl(var(--chart-1, 220 90% 60%))"];

export function StatsPanel({ tasks }: Props) {
  const completed = tasks.filter((t) => t.completed).length;
  const pending = tasks.length - completed;

  const pieData = [
    { name: "Completed", value: completed, fill: "var(--success)" },
    { name: "Pending", value: pending, fill: "var(--primary)" },
  ];

  const subjectData = useMemo(
    () =>
      SUBJECTS.map((s) => ({
        subject: s.length > 6 ? s.slice(0, 6) + "…" : s,
        count: tasks.filter((t) => t.subject === s).length,
      })).filter((d) => d.count > 0),
    [tasks],
  );

  const priorityData = [
    {
      name: "High",
      value: tasks.filter((t) => t.priority === "high").length,
      fill: "var(--destructive)",
    },
    {
      name: "Medium",
      value: tasks.filter((t) => t.priority === "medium").length,
      fill: "var(--warning)",
    },
    {
      name: "Low",
      value: tasks.filter((t) => t.priority === "low").length,
      fill: "var(--success)",
    },
  ];

  const weekData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      return {
        day: d.toLocaleDateString(undefined, { weekday: "short" }),
        key,
        completed: 0,
      };
    });
    tasks.forEach((t) => {
      if (!t.completed || !t.completedAt) return;
      const k = t.completedAt.slice(0, 10);
      const day = days.find((d) => d.key === k);
      if (day) day.completed++;
    });
    return days;
  }, [tasks]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ChartCard title="Completed vs Pending">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={pieData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={4}>
              {pieData.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              itemStyle={{ color: "#f8fafc" }}
              labelStyle={{ color: "#f8fafc" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Tasks by priority">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.15)"
              vertical={false}
            />
            <XAxis dataKey="name" fontSize={12} stroke="rgba(148, 163, 184, 0.5)" />
            <YAxis fontSize={12} allowDecimals={false} stroke="rgba(148, 163, 184, 0.5)" />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: "transparent" }}
              itemStyle={{ color: "#f8fafc" }}
              labelStyle={{ color: "#f8fafc" }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {priorityData.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Tasks by subject">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={subjectData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.15)"
              vertical={false}
            />
            <XAxis dataKey="subject" fontSize={11} stroke="rgba(148, 163, 184, 0.5)" />
            <YAxis fontSize={12} allowDecimals={false} stroke="rgba(148, 163, 184, 0.5)" />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: "transparent" }}
              itemStyle={{ color: "#f8fafc" }}
              labelStyle={{ color: "#f8fafc" }}
            />
            <Bar dataKey="count" fill="var(--primary)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Productivity — last 7 days">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.15)"
              vertical={false}
            />
            <XAxis dataKey="day" fontSize={12} stroke="rgba(148, 163, 184, 0.5)" />
            <YAxis fontSize={12} allowDecimals={false} stroke="rgba(148, 163, 184, 0.5)" />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: "transparent" }}
              itemStyle={{ color: "#f8fafc" }}
              labelStyle={{ color: "#f8fafc" }}
            />
            <Bar dataKey="completed" fill="var(--primary-glow)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
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

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5 shadow-soft">
      <h4 className="mb-3 font-display text-sm font-semibold">{title}</h4>
      {children}
    </div>
  );
}
