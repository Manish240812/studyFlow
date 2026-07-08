import { useCallback, useEffect, useMemo, useState } from "react";
import type { Task } from "./types";

const STORAGE_KEY = "student-todo:tasks:v1";
const NOTES_KEY = "student-todo:notes:v1";
const STREAK_KEY = "student-todo:streak:v1";
const SETTINGS_KEY = "student-todo:settings:v1";

export interface Settings {
  animations: boolean;
  dailyGoal: number;
}

const DEFAULT_SETTINGS: Settings = { animations: true, dailyGoal: 5 };

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  return safeParse<Task[]>(localStorage.getItem(STORAGE_KEY), []);
}
export function saveTasks(tasks: Task[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function useLocalStorageState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(key);
    if (raw !== null) setState(safeParse<T>(raw, initial));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state, hydrated]);

  return [state, setState, hydrated] as const;
}

export function useNotes() {
  return useLocalStorageState<string>(NOTES_KEY, "");
}

export function useSettings() {
  return useLocalStorageState<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS);
}

interface StreakData {
  current: number;
  lastActiveDate: string; // YYYY-MM-DD
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function useStreak(tasks: Task[]) {
  const [streak, setStreak] = useLocalStorageState<StreakData>(STREAK_KEY, {
    current: 0,
    lastActiveDate: "",
  });

  const completedToday = useMemo(
    () =>
      tasks.filter(
        (t) => t.completed && t.completedAt && t.completedAt.slice(0, 10) === todayStr(),
      ).length,
    [tasks],
  );

  useEffect(() => {
    if (completedToday === 0) return;
    const today = todayStr();
    if (streak.lastActiveDate === today) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const y = yesterday.toISOString().slice(0, 10);
    setStreak({
      current: streak.lastActiveDate === y ? streak.current + 1 : 1,
      lastActiveDate: today,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedToday]);

  return { streak: streak.current, completedToday };
}

export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTasks(loadTasks());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveTasks(tasks);
  }, [tasks, hydrated]);

  const addTask = useCallback((task: Task) => {
    setTasks((prev) => [task, ...prev]);
  }, []);
  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);
  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const setAllTasks = useCallback((next: Task[]) => setTasks(next), []);

  return { tasks, hydrated, addTask, updateTask, deleteTask, setAllTasks };
}

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const stored = localStorage.getItem("student-todo:theme") as "light" | "dark" | null;
    const initial =
      stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("student-todo:theme", theme);
  }, [theme]);
  return { theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) };
}
