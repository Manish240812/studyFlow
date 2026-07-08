import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Task } from "@/lib/todo/types";
import type { Settings } from "@/lib/todo/storage";

interface Props {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export function SettingsPanel({
  settings,
  setSettings,
  theme,
  toggleTheme,
}: Props) {

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
