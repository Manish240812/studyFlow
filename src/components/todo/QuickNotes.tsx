import { motion } from "framer-motion";
import { StickyNote } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useNotes } from "@/lib/todo/storage";

export function QuickNotes() {
  const [notes, setNotes] = useNotes();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 shadow-soft"
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-warning/20 text-warning-foreground dark:text-warning">
          <StickyNote className="h-4 w-4" />
        </div>
        <h4 className="font-display font-semibold">Quick Notes</h4>
      </div>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Jot down ideas, formulas, reminders…"
        className="min-h-[140px] resize-y bg-background/50"
      />
    </motion.div>
  );
}
