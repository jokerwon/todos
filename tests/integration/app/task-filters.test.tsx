import { afterEach, describe, expect, test, vi } from "vitest";

import { createTaskStore } from "@/app/hooks/use-task-store";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("task filtering", () => {
  test("loads tasks with category and due filters", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ items: [], summary: { total: 0 } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    global.fetch = fetchMock;

    const store = createTaskStore();

    store.getState().setFilters({ categoryId: "cat-1", due: "today" });
    await store.getState().loadTasks();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/tasks?categoryId=cat-1&due=today",
      expect.objectContaining({
        headers: expect.objectContaining({ "x-user-id": expect.any(String) }),
      }),
    );
  });

  test("updates summary counts after loading", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              id: "task-1",
              title: "Complete report",
              status: "ACTIVE",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          summary: {
            total: 1,
            active: 1,
            completed: 0,
            overdue: 0,
            categories: { "cat-1": 1 },
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );
    global.fetch = fetchMock;

    const store = createTaskStore();
    await store.getState().loadTasks();

    expect(store.getState().summary.total).toBe(1);
    expect(store.getState().tasks.active).toHaveLength(1);
  });
});
