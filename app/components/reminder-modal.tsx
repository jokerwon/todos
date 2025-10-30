"use client";

import { useState } from "react";

type ReminderModalProps = {
  taskId: string;
  onScheduled?: () => Promise<void> | void;
};

export function ReminderModal({ taskId, onScheduled }: ReminderModalProps) {
  const [open, setOpen] = useState(false);
  const [minutes, setMinutes] = useState("30");
  const [channel, setChannel] = useState<"IN_APP" | "EMAIL">("IN_APP");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const schedule = async () => {
    setError(null);
    const numeric = Number(minutes);
    if (Number.isNaN(numeric) || numeric < 5) {
      setError("提醒需至少提前 5 分钟");
      return;
    }

    setPending(true);
    const triggerAt = new Date(Date.now() + numeric * 60 * 1000).toISOString();

    const response = await fetch("/api/reminders", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-user-id": "demo-user",
      },
      body: JSON.stringify({ taskId, triggerAt, channel }),
    });

    setPending(false);

    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      setError(json.error ?? "创建提醒失败");
      return;
    }

    setOpen(false);
    if (onScheduled) await onScheduled();
  };

  return (
    <div>
      <button
        type="button"
        data-testid="open-reminder-modal"
        onClick={() => setOpen(true)}
        className="rounded-md border border-border px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        设置提醒
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-md border border-border bg-card p-4 shadow-lg">
            <h2 className="text-lg font-semibold">任务提醒</h2>
            <div className="mt-4 space-y-3">
              <label className="flex flex-col gap-1 text-sm">
                提前分钟
                <input
                  data-testid="reminder-minutes-input"
                  value={minutes}
                  onChange={(event) => setMinutes(event.target.value)}
                  type="number"
                  min={5}
                  className="rounded-md border border-input px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                通知渠道
                <select
                  value={channel}
                  onChange={(event) => setChannel(event.target.value as "IN_APP" | "EMAIL")}
                  className="rounded-md border border-input px-3 py-2"
                >
                  <option value="IN_APP">应用内</option>
                  <option value="EMAIL">邮箱</option>
                </select>
              </label>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-border px-3 py-1 text-sm"
              >
                取消
              </button>
              <button
                type="button"
                data-testid="save-reminder"
                disabled={pending}
                onClick={schedule}
                className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground disabled:opacity-50"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
