"use client";

import { useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
  color?: string | null;
};

type CategoryManagerProps = {
  onCreated?: (category: Category) => void;
};

export function CategoryManager({ onCreated }: CategoryManagerProps) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    fetch("/api/categories", {
      headers: { "x-user-id": "demo-user" },
    })
      .then((res) => res.json())
      .then((json) => {
        setCategories(json.categories ?? []);
      })
      .catch(() => {
        setCategories([]);
      });
  }, [open]);

  const createCategory = async () => {
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError("请输入分类名称");
      return;
    }

    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-user-id": "demo-user",
      },
      body: JSON.stringify({ name: trimmed }),
    });

    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      setError(json.error ?? "创建分类失败");
      return;
    }

    const { category } = await response.json();
    setCategories((prev) => [category, ...prev]);
    setName("");
    if (onCreated) onCreated(category);
  };

  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">任务分类</h2>
        <button
          type="button"
          data-testid="open-category-manager"
          onClick={() => setOpen((value) => !value)}
          className="rounded-md border border-border px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {open ? "收起" : "管理"}
        </button>
      </div>

      {open ? (
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="flex flex-col gap-1 text-sm">
              名称
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                data-testid="category-name-input"
                className="rounded-md border border-input px-3 py-2"
                placeholder="例如：工作"
              />
            </label>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="button"
              data-testid="create-category"
              onClick={createCategory}
              className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              新增分类
            </button>
          </div>

          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.id} className="text-sm">
                {category.name}
              </li>
            ))}
            {categories.length === 0 ? (
              <li className="text-sm text-muted-foreground">暂无分类</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
