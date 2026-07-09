import { motion } from "framer-motion";
import { Quote as QuoteIcon } from "lucide-react";
import { QUOTES } from "@/lib/todo/quotes";

interface QuoteBannerProps {
  quoteIndex: number;
}

export function QuoteBanner({ quoteIndex }: QuoteBannerProps) {
  return (
    <motion.div
      key={quoteIndex}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="mt-5 flex items-start gap-2 rounded-2xl border border-border bg-secondary/40 p-3 text-sm italic text-muted-foreground"
    >
      <QuoteIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <span>{QUOTES[quoteIndex]}</span>
    </motion.div>
  );
}
