import { describe, expect, test } from "vitest";

import { createTaskStore } from "@/app/hooks/use-task-store";

describe("useTaskStore", () => {
  test("adds a task and lists active tasks", () => {
    const store = createTaskStore();
    store.getState().addTask({
      id: "task-1",
      title: "Draft spec",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(store.getState().tasks.active).toHaveLength(1);
  });

  test("toggles completion state", () => {
    const store = createTaskStore();
    const initial = {
      id: "task-1",
      title: "Draft spec",
      status: "ACTIVE" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.getState().addTask(initial);
    store.getState().markComplete("task-1");

    expect(store.getState().tasks.completed).toHaveLength(1);
    expect(store.getState().tasks.active).toHaveLength(0);
  });
});
