import { useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Download, Upload, Trash, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Task } from "@/lib/todo/types";
import type { Settings } from "@/lib/todo/storage";

interface Props {
  tasks: Task[];
  setAllTasks: (t: Task[]) => void;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export function SettingsPanel({
  tasks,
  setAllTasks,
  settings,
  setSettings,
  theme,
  toggleTheme,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student-todo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Tasks exported");
  };

  const importJson = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error("Invalid file");
      setAllTasks(data as Task[]);
      toast.success(`Imported ${data.length} tasks`);
    } catch {
      toast.error("Could not import file");
    }
  };

  const clearCompleted = () => {
    setAllTasks(tasks.filter((t) => !t.completed));
    toast.success("Completed tasks cleared");
  };

  const resetAll = () => {
    if (!confirm("Delete all tasks and reset the app?")) return;
    setAllTasks([]);
    localStorage.removeItem("student-todo:notes:v1");
    localStorage.removeItem("student-todo:streak:v1");
    toast.success("App reset");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 shadow-soft"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg gradient-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <h3 className="font-display text-lg font-semibold">Settings</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Row label="Dark mode" hint="Toggle theme">
          <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
        </Row>
        <Row label="Animations" hint="Enable motion effects">
          <Switch
            checked={settings.animations}
            onCheckedChange={(v) => setSettings((s) => ({ ...s, animations: v }))}
          />
        </Row>
        <Row label="Daily goal" hint="Tasks per day">
          <Input
            type="number"
            min={1}
            value={settings.dailyGoal}
            onChange={(e) =>
              setSettings((s) => ({ ...s, dailyGoal: Math.max(1, Number(e.target.value) || 1) }))
            }
            className="w-20"
          />
        </Row>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={exportJson}>
          <Download className="mr-1 h-4 w-4" /> Export
        </Button>
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
          <Upload className="mr-1 h-4 w-4" /> Import
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])}
        />
        <Button variant="outline" size="sm" onClick={clearCompleted}>
          <Trash className="mr-1 h-4 w-4" /> Clear completed
        </Button>
        <Button variant="outline" size="sm" onClick={resetAll} className="text-destructive">
          <RefreshCw className="mr-1 h-4 w-4" /> Reset app
        </Button>
      </div>
    </motion.div>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-3">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      {children}
    </div>
  );
}
