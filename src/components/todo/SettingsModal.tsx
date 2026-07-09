import { motion } from "framer-motion";
import { X } from "lucide-react";
import { SettingsPanel } from "@/components/todo/SettingsPanel";
import { type Settings } from "@/lib/todo/storage";
import { type Dispatch, type SetStateAction } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  setSettings: Dispatch<SetStateAction<Settings>>;
}

export function SettingsModal({ isOpen, onClose, settings, setSettings }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 py-6 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border/70 bg-background p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">Settings</p>
            <h2 className="mt-1 text-2xl font-semibold text-foreground">
              Preferences & controls
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border/70 p-2 text-muted-foreground transition hover:border-primary hover:text-primary"
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6">
          <SettingsPanel settings={settings} setSettings={setSettings} />
        </div>
      </motion.div>
    </div>
  );
}
