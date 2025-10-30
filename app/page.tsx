'use client';

import { useEffect } from 'react';

import { CategoryManager } from '@/app/components/category-manager';
import { FilterBar } from '@/app/components/filter-bar';
import { TaskForm } from '@/app/components/task-form';
import { TaskList } from '@/app/components/task-list';
import { TaskSummary } from '@/app/components/task-summary';
import { useTaskStore } from '@/app/hooks/use-task-store';

export default function Page() {
  const tasks = useTaskStore((state) => state.tasks);
  const summary = useTaskStore((state) => state.summary);
  const filters = useTaskStore((state) => state.filters);
  const setFilters = useTaskStore((state) => state.setFilters);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const markComplete = useTaskStore((state) => state.markComplete);
  const restoreTask = useTaskStore((state) => state.restoreTask);

  useEffect(() => {
    loadTasks().catch(() => {
      // swallow errors; UI components will show empty states
    });
  }, [loadTasks]);

  const refreshTasks = async () => {
    await loadTasks();
  };

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">TODO 管理</h1>
        <p className="text-muted-foreground">
          捕获每日任务、按上下文分类，并按时收到提醒。
        </p>
      </header>
      <TaskSummary
        total={summary.total}
        active={summary.active}
        completed={summary.completed}
        overdue={summary.overdue}
      />
      <FilterBar
        filters={filters}
        categories={summary.categories}
        onFilterChange={async (nextFilters) => {
          setFilters(nextFilters);
          await loadTasks();
        }}
      />
      <CategoryManager onCreated={refreshTasks} />
      <div className="space-y-6">
        <TaskForm
          categories={summary.categories.map(({ id, name }) => ({ id, name }))}
          onCreate={refreshTasks}
        />
        <TaskList
          active={tasks.active}
          completed={tasks.completed}
          onComplete={markComplete}
          onRestore={restoreTask}
          onReminderScheduled={refreshTasks}
        />
      </div>
    </main>
  );
}
