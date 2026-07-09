import { Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type FilterKey =
  | "all"
  | "pending"
  | "completed"
  | "high"
  | "medium"
  | "low"
  | "overdue"
  | "today"
  | "week"
  | "pinned"
  | "favorites";

export type SortKey = "due" | "priority" | "created" | "alpha" | "subject";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
  { key: "overdue", label: "Overdue" },
  { key: "today", label: "Today" },
  { key: "week", label: "This week" },
  { key: "high", label: "High" },
  { key: "medium", label: "Medium" },
  { key: "low", label: "Low" },
  { key: "pinned", label: "Pinned" },
  { key: "favorites", label: "Favorites" },
];

interface Props {
  search: string;
  onSearch: (v: string) => void;
  filter: FilterKey;
  onFilter: (v: FilterKey) => void;
  sort: SortKey;
  onSort: (v: SortKey) => void;
  counts: Partial<Record<FilterKey, number>>;
}

export function FiltersBar({ search, onSearch, filter, onFilter, sort, onSort, counts }: Props) {
  return (
    <div className="glass rounded-2xl p-4 shadow-soft">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search tasks, subjects, categories…"
            className="pl-9"
            aria-label="Search tasks"
          />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select value={sort} onValueChange={(v) => onSort(v as SortKey)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="due">Due date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="alpha">Alphabetical</SelectItem>
              <SelectItem value="subject">Subject</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const count = counts[f.key];
          return (
            <button
              key={f.key}
              onClick={() => onFilter(f.key)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                active
                  ? "gradient-primary border-transparent text-primary-foreground shadow-soft"
                  : "border-border bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {f.label}
              {typeof count === "number" && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "ml-1.5 h-4 px-1 text-[10px]",
                    active && "bg-white/25 text-primary-foreground",
                  )}
                >
                  {count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
