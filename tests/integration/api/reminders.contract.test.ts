import { afterEach, describe, expect, test, vi } from "vitest";

import { DELETE, PATCH, POST } from "@/app/api/reminders/route";

const scheduleReminderMock = vi.fn();
const updateReminderMock = vi.fn();
const cancelReminderMock = vi.fn();

vi.mock("@/lib/reminders-service", () => ({
  scheduleReminder: (...args: unknown[]) => scheduleReminderMock(...args),
  updateReminder: (...args: unknown[]) => updateReminderMock(...args),
  cancelReminder: (...args: unknown[]) => cancelReminderMock(...args),
}));

afterEach(() => {
  vi.resetAllMocks();
});

const baseUrl = "http://localhost/api/reminders";

describe("POST /api/reminders", () => {
  test("schedules reminder", async () => {
    const reminder = { id: "rem-1", taskId: "task-1", triggerAt: new Date().toISOString() };
    scheduleReminderMock.mockResolvedValue(reminder);

    const response = await POST(
      new Request(baseUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-user-id": "user-1",
        },
        body: JSON.stringify({ taskId: "task-1", triggerAt: reminder.triggerAt }),
      }),
    );

    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.reminder.id).toBe("rem-1");
    expect(scheduleReminderMock).toHaveBeenCalled();
  });
});

describe("PATCH /api/reminders/{id}", () => {
  test("updates reminder", async () => {
    updateReminderMock.mockResolvedValue({ id: "rem-1" });

    const response = await PATCH(
      new Request(`${baseUrl}/rem-1`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-user-id": "user-1",
        },
        body: JSON.stringify({ triggerAt: new Date().toISOString() }),
      }),
      { params: { reminderId: "rem-1" } } as any,
    );

    expect(response.status).toBe(200);
    expect(updateReminderMock).toHaveBeenCalledWith("user-1", "rem-1", expect.any(Object));
  });
});

describe("DELETE /api/reminders/{id}", () => {
  test("cancels reminder", async () => {
    cancelReminderMock.mockResolvedValue(undefined);

    const response = await DELETE(
      new Request(`${baseUrl}/rem-1`, {
        method: "DELETE",
        headers: {
          "x-user-id": "user-1",
        },
      }),
      { params: { reminderId: "rem-1" } } as any,
    );

    expect(response.status).toBe(204);
    expect(cancelReminderMock).toHaveBeenCalledWith("user-1", "rem-1");
  });
});
