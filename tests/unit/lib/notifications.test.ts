import { describe, expect, test, vi } from "vitest";

const createMock = vi.fn();
const updateMock = vi.fn();
const deleteMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    reminder: {
      create: createMock,
      update: updateMock,
      delete: deleteMock,
    },
  },
}));

import { scheduleReminder, updateReminder, cancelReminder } from "@/lib/reminders-service";

describe("reminders-service", () => {
  test("throws when triggerAt is too soon", async () => {
    await expect(
      scheduleReminder("user-1", {
        taskId: "task-1",
        triggerAt: new Date(Date.now() + 60 * 1000).toISOString(),
        channel: "IN_APP",
      }),
    ).rejects.toThrow(/至少提前/);
  });

  test("creates reminder when validation passes", async () => {
    createMock.mockResolvedValue({ id: "rem-1" });

    const reminder = await scheduleReminder("user-1", {
      taskId: "task-1",
      triggerAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      channel: "EMAIL",
    });

    expect(reminder.id).toBe("rem-1");
    expect(createMock).toHaveBeenCalled();
  });

  test("updates reminder", async () => {
    updateMock.mockResolvedValue({ id: "rem-1" });

    await updateReminder("user-1", "rem-1", {
      triggerAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    });

    expect(updateMock).toHaveBeenCalled();
  });

  test("cancels reminder", async () => {
    deleteMock.mockResolvedValue(undefined);

    await cancelReminder("user-1", "rem-1");
    expect(deleteMock).toHaveBeenCalledWith({ where: { id: "rem-1", userId: "user-1" } });
  });
});
