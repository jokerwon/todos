import { afterEach, describe, expect, test, vi } from "vitest";

import { GET, POST } from "@/app/api/tasks/route";

const createTaskMock = vi.fn();
const listTasksMock = vi.fn();

vi.mock("@/lib/tasks-service", () => ({
  createTask: (...args: unknown[]) => createTaskMock(...args),
  listTasks: (...args: unknown[]) => listTasksMock(...args),
}));

afterEach(() => {
  vi.resetAllMocks();
});

const baseUrl = "http://localhost/api/tasks";

describe("POST /api/tasks", () => {
  test("returns 201 with task payload", async () => {
    const task = {
      id: "task-1",
      title: "Write spec",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    createTaskMock.mockResolvedValue(task);

    const response = await POST(
      new Request(baseUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-user-id": "user-1",
        },
        body: JSON.stringify({ title: "Write spec" }),
      }),
    );

    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json).toEqual({ task });
    expect(createTaskMock).toHaveBeenCalledWith("user-1", { title: "Write spec" });
  });

  test("returns 400 when validation fails", async () => {
    const response = await POST(
      new Request(baseUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-user-id": "user-1",
        },
        body: JSON.stringify({ title: "" }),
      }),
    );

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(createTaskMock).not.toHaveBeenCalled();
  });
});

describe("GET /api/tasks", () => {
  test("returns list of tasks for user", async () => {
    const tasks = [
      {
        id: "task-1",
        title: "Write spec",
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    listTasksMock.mockResolvedValue({ items: tasks, summary: { total: 1 } });

    const response = await GET(
      new Request(`${baseUrl}?page=1&pageSize=10`, {
        headers: {
          "x-user-id": "user-1",
        },
      }),
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ items: tasks, summary: { total: 1 } });
    expect(listTasksMock).toHaveBeenCalledWith("user-1", {
      page: 1,
      pageSize: 10,
      status: undefined,
      categoryId: undefined,
      due: undefined,
      search: undefined,
    });
  });
});
