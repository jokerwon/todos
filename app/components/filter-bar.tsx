"use client";

type FilterBarProps = {
  filters: {
    categoryId?: string;
    due?: "today" | "upcoming" | "overdue";
  };
  categories: { id: string; name: string; count: number }[];
  onFilterChange: (filters: { categoryId?: string; due?: "today" | "upcoming" | "overdue" }) => void;
};

const DUE_OPTIONS: { value: "today" | "upcoming" | "overdue"; label: string }[] = [
  { value: "today", label: "今天" },
  { value: "upcoming", label: "即将到期" },
  { value: "overdue", label: "已逾期" },
];

export function FilterBar({ filters, categories, onFilterChange }: FilterBarProps) {
  const toggleDue = (value: "today" | "upcoming" | "overdue") => {
    onFilterChange({
      ...filters,
      due: filters.due === value ? undefined : value,
    });
  };

  const toggleCategory = (categoryId: string) => {
    onFilterChange({
      ...filters,
      categoryId: filters.categoryId === categoryId ? undefined : categoryId,
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2" aria-label="到期筛选">
        <span className="text-sm font-medium text-muted-foreground">到期</span>
        {DUE_OPTIONS.map((option) => {
          const selected = filters.due === option.value;
          return (
            <button
              key={option.value}
              type="button"
              data-testid={`filter-due-${option.value}`}
              onClick={() => toggleDue(option.value)}
              className={`rounded-full border px-3 py-1 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2" aria-label="分类筛选">
        <span className="text-sm font-medium text-muted-foreground">分类</span>
        {categories.length === 0 ? (
          <span className="text-sm text-muted-foreground">暂无分类</span>
        ) : (
          categories.map((category) => {
            const selected = filters.categoryId === category.id;
            return (
              <button
                key={category.id}
                type="button"
                data-testid={`filter-chip-category-${category.id}`}
                onClick={() => toggleCategory(category.id)}
                className={`rounded-full border px-3 py-1 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {category.name}
                <span className="ml-1 text-xs text-muted-foreground">{category.count}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
