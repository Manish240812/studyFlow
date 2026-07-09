import { Instagram, Linkedin, Mail, Send } from "lucide-react";

interface AppFooterProps {
  scrollToHome: () => void;
  onViewTour: () => void;
}

export function AppFooter({ scrollToHome, onViewTour }: AppFooterProps) {
  return (
    <footer className="mt-12 rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur">
      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4 text-sm text-muted-foreground">
          <button
            type="button"
            onClick={scrollToHome}
            className="text-left transition hover:opacity-90"
            aria-label="Go to home"
          >
            <div className="flex items-center gap-1 text-2xl tracking-tight">
              <span className="font-semibold text-foreground">Study</span>
              <span className="font-bold text-primary">Flow</span>
            </div>
          </button>
          <p>
            Study Flow is built for students who want a calm, focused way to manage
            tasks, deadlines, and study routines without feeling overwhelmed.
          </p>
          <p>
            Follow us and connect with our community for updates, productivity tips,
            and support.
          </p>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p className="text-base font-semibold text-foreground">Connect with us</p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://instagram.com/studyflow"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-2 text-foreground transition hover:border-primary hover:text-primary"
            >
              <Instagram className="h-4 w-4" /> Instagram
            </a>
            <a
              href="https://linkedin.com/company/studyflow"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-2 text-foreground transition hover:border-primary hover:text-primary"
            >
              <Linkedin className="h-4 w-4" /> LinkedIn
            </a>
          </div>
          <div className="space-y-1">
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> hello@studyflow.app
            </p>
            <p className="flex items-center gap-2">
              <Send className="h-4 w-4" /> Study Flow Team
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6 border-t border-border/60 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>
          © {new Date().getFullYear()} Study Flow · Built for focused learners.
        </span>
        <button
          type="button"
          onClick={onViewTour}
          className="hover:text-primary transition font-semibold underline cursor-pointer"
        >
          View Welcome Page & Tour
        </button>
      </div>
    </footer>
  );
}
