import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type Task = {
  id: string;
  title: string;
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
  description?: string | null;
  dueDate?: string | null;
  categories?: { id: string; name: string; color?: string | null }[];
  nextReminderAt?: string | null;
};

type Filters = {
  categoryId?: string;
  due?: "today" | "upcoming" | "overdue";
  status?: "ACTIVE" | "COMPLETED" | "ARCHIVED";
};

type Summary = {
  total: number;
  active: number;
  completed: number;
  archived?: number;
  overdue: number;
  categories: { id: string; name: string; count: number }[];
};

type TaskBuckets = {
  active: Task[];
  completed: Task[];
};

type TaskState = {
  tasks: TaskBuckets;
  summary: Summary;
  filters: Filters;
  setFilters: (filters: Partial<Filters>) => void;
  loadTasks: () => Promise<void>;
  addTask: (task: Task) => void;
  markComplete: (taskId: string) => void;
  restoreTask: (taskId: string) => void;
};

const sortByUpdated = (list: Task[]) =>
  [...list].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

const DEFAULT_SUMMARY: Summary = {
  total: 0,
  active: 0,
  completed: 0,
  archived: 0,
  overdue: 0,
  categories: [],
};

const DEFAULT_BUCKETS: TaskBuckets = {
  active: [],
  completed: [],
};

function partitionTasks(tasks: Task[]): TaskBuckets {
  const active = tasks.filter((task) => task.status === "ACTIVE");
  const completed = tasks.filter((task) => task.status === "COMPLETED");
  return {
    active: sortByUpdated(active),
    completed: sortByUpdated(completed),
  };
}

function buildQuery(filters: Filters) {
  const params = new URLSearchParams();
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.due) params.set("due", filters.due);
  if (filters.status && filters.status !== "ACTIVE") params.set("status", filters.status);

  const query = params.toString();
  return query.length ? `?${query}` : "";
}

export const createTaskStore = () =>
  create<TaskState>()(
    devtools((set, get) => ({
      tasks: DEFAULT_BUCKETS,
      summary: DEFAULT_SUMMARY,
      filters: {},
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),
      loadTasks: async () => {
        const filters = get().filters;
        const response = await fetch(`/api/tasks${buildQuery(filters)}`, {
          headers: {
            "x-user-id": "demo-user",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load tasks");
        }

        const json = await response.json();
        const tasks = (json.items ?? []) as Task[];
        set({
          tasks: partitionTasks(tasks),
          summary: {
            total: json.summary?.total ?? tasks.length,
            active: json.summary?.active ?? tasks.filter((task: Task) => task.status === "ACTIVE").length,
            completed:
              json.summary?.completed ?? tasks.filter((task: Task) => task.status === "COMPLETED").length,
            archived: json.summary?.archived ?? 0,
            overdue: json.summary?.overdue ?? 0,
            categories: json.summary?.categories ?? [],
          },
        });
      },
      addTask: (task) =>
        set((state) => ({
          tasks: partitionTasks([task, ...state.tasks.active, ...state.tasks.completed]),
          summary: {
            ...state.summary,
            total: state.summary.total + 1,
            active: state.summary.active + 1,
          },
        })),
      markComplete: (taskId) =>
        set((state) => {
          const active = state.tasks.active.filter((task) => task.id !== taskId);
          const completedTask = state.tasks.active.find((task) => task.id === taskId);
          const completed = completedTask
            ? sortByUpdated([
                { ...completedTask, status: "COMPLETED", updatedAt: new Date().toISOString() },
                ...state.tasks.completed,
              ])
            : state.tasks.completed;
          return {
            tasks: { active, completed },
            summary: {
              ...state.summary,
              active: Math.max(0, state.summary.active - 1),
              completed: state.summary.completed + (completedTask ? 1 : 0),
            },
          };
        }),
      restoreTask: (taskId) =>
        set((state) => {
          const completed = state.tasks.completed.filter((task) => task.id !== taskId);
          const restoredTask = state.tasks.completed.find((task) => task.id === taskId);
          const active = restoredTask
            ? sortByUpdated([
                { ...restoredTask, status: "ACTIVE", updatedAt: new Date().toISOString() },
                ...state.tasks.active,
              ])
            : state.tasks.active;
          return {
            tasks: { active, completed },
            summary: {
              ...state.summary,
              active: state.summary.active + (restoredTask ? 1 : 0),
              completed: Math.max(0, state.summary.completed - (restoredTask ? 1 : 0)),
            },
          };
        }),
    })),
  );

export const useTaskStore = createTaskStore();
