type TaskSummaryProps = {
  total: number;
  active: number;
  completed: number;
  overdue: number;
};

export function TaskSummary({ total, active, completed, overdue }: TaskSummaryProps) {
  return (
    <div className="grid gap-4 rounded-md border border-border bg-card p-4 sm:grid-cols-4">
      <SummaryItem label="总任务" value={total} />
      <SummaryItem label="进行中" value={active} />
      <SummaryItem label="已完成" value={completed} />
      <SummaryItem label="逾期" value={overdue} variant={overdue > 0 ? "warning" : "default"} />
    </div>
  );
}

type SummaryItemProps = {
  label: string;
  value: number;
  variant?: "default" | "warning";
};

function SummaryItem({ label, value, variant = "default" }: SummaryItemProps) {
  const color = variant === "warning" ? "text-destructive" : "text-foreground";
  return (
    <div className="flex flex-col">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-2xl font-semibold ${color}`}>{value}</span>
    </div>
  );
}
