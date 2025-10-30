async function dispatchReminders() {
  const response = await fetch("http://localhost:3000/api/internal/reminder-dispatch", {
    method: "POST",
    headers: {
      Authorization: process.env.REMINDER_DISPATCH_TOKEN ?? "local",
    },
  });

  if (!response.ok) {
    throw new Error(`Dispatch failed with status ${response.status}`);
  }

  const json = await response.json();
  // eslint-disable-next-line no-console
  console.log(`[reminder-worker] dispatched ${json.dispatched} reminders`);
}

dispatchReminders().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("[reminder-worker] error", error);
  process.exitCode = 1;
});
