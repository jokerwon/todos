"use client";

import { useState, useTransition } from "react";

type TaskFormProps = {
  categories?: { id: string; name: string }[];
  onCreate?: () => Promise<void> | void;
};

export function TaskForm({ categories = [], onCreate }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      categoryIds: selectedCategories.length ? selectedCategories : undefined,
    };

    if (!payload.title) {
      setError("请输入任务标题");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "demo-user",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "创建任务失败");
        return;
      }

      setTitle("");
      setDescription("");
      setSelectedCategories([]);
      if (onCreate) {
        await onCreate();
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-md border border-border bg-card p-4"
      aria-describedby={error ? "task-form-error" : undefined}
    >
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">任务标题</span>
        <input
          name="task-title"
          data-testid="task-title-input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="例如：撰写产品文档"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-required="true"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">备注</span>
        <textarea
          name="task-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </label>

      {error ? (
        <div
          id="task-form-error"
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-muted-foreground">分类</legend>
        <div className="flex flex-wrap gap-2">
          {categories.length === 0 ? (
            <span className="text-sm text-muted-foreground">暂无分类</span>
          ) : (
            categories.map((category) => {
              const selected = selectedCategories.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategories((current) =>
                      current.includes(category.id)
                        ? current.filter((value) => value !== category.id)
                        : [...current, category.id],
                    );
                  }}
                  className={`rounded-full border px-3 py-1 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {category.name}
                </button>
              );
            })
          )}
        </div>
      </fieldset>

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          data-testid="create-task"
          disabled={isPending}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "保存中…" : "添加任务"}
        </button>
      </div>
    </form>
  );
}
