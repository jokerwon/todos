"use client";

import { ReminderModal } from "@/app/components/reminder-modal";

type TaskItem = {
  id: string;
  title: string;
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  nextReminderAt?: string | null;
};

type TaskListProps = {
  active: TaskItem[];
  completed: TaskItem[];
  onComplete: (id: string) => void;
  onRestore: (id: string) => void;
  onReminderScheduled?: () => Promise<void> | void;
};

export function TaskList({
  active,
  completed,
  onComplete,
  onRestore,
  onReminderScheduled,
}: TaskListProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section aria-labelledby="active-tasks">
        <header className="mb-3 flex items-center justify-between">
          <h2 id="active-tasks" className="text-lg font-semibold">
            待办事项
          </h2>
          <span className="text-sm text-muted-foreground">{active.length} 个进行中</span>
        </header>
        <ul className="space-y-2" data-testid="active-task-list">
          {active.map((task) => (
            <li
              key={task.id}
              data-testid="task-item"
              className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3 shadow-sm"
            >
              <div className="flex flex-col gap-1">
                <span>{task.title}</span>
                {task.nextReminderAt ? (
                  <span
                    data-testid="reminder-badge"
                    className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                  >
                    提醒 {new Date(task.nextReminderAt).toLocaleTimeString()}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-testid="complete-task"
                  onClick={() => onComplete(task.id)}
                  className="inline-flex items-center rounded-md border border-border bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground transition hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  标记完成
                </button>
                <ReminderModal taskId={task.id} onScheduled={onReminderScheduled} />
              </div>
            </li>
          ))}
          {active.length === 0 ? (
            <li className="rounded-md border border-dashed border-muted p-4 text-sm text-muted-foreground">
              当前没有任务，先添加一个吧。
            </li>
          ) : null}
        </ul>
      </section>

      <section aria-labelledby="completed-tasks">
        <header className="mb-3 flex items-center justify-between">
          <h2 id="completed-tasks" className="text-lg font-semibold">
            已完成
          </h2>
          <span className="text-sm text-muted-foreground">{completed.length} 个</span>
        </header>
        <ul className="space-y-2" data-testid="completed-task-list">
          {completed.map((task) => (
            <li
              key={task.id}
              data-testid="task-item-completed"
              className="flex items-center justify-between rounded-md border border-border bg-muted px-4 py-3 text-muted-foreground"
            >
              <span className="line-through">{task.title}</span>
              <button
                type="button"
                onClick={() => onRestore(task.id)}
                className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1 text-sm font-medium transition hover:bg-background/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                撤销
              </button>
            </li>
          ))}
          {completed.length === 0 ? (
            <li className="rounded-md border border-dashed border-muted p-4 text-sm text-muted-foreground">
              完成任务后会显示在这里。
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
