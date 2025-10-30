import { afterEach, describe, expect, test, vi } from "vitest";

import { GET, POST, PATCH } from "@/app/api/categories/route";

const createCategoryMock = vi.fn();
const listCategoriesMock = vi.fn();
const updateCategoryMock = vi.fn();

vi.mock("@/lib/categories-service", () => ({
  createCategory: (...args: unknown[]) => createCategoryMock(...args),
  listCategories: (...args: unknown[]) => listCategoriesMock(...args),
  updateCategory: (...args: unknown[]) => updateCategoryMock(...args),
}));

afterEach(() => {
  vi.resetAllMocks();
});

const baseUrl = "http://localhost/api/categories";

describe("POST /api/categories", () => {
  test("creates category", async () => {
    const category = { id: "cat-1", name: "Work" };
    createCategoryMock.mockResolvedValue(category);

    const response = await POST(
      new Request(baseUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-user-id": "user-1",
        },
        body: JSON.stringify({ name: "Work" }),
      }),
    );

    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json).toEqual({ category });
    expect(createCategoryMock).toHaveBeenCalledWith("user-1", { name: "Work" });
  });
});

describe("GET /api/categories", () => {
  test("returns categories for user", async () => {
    listCategoriesMock.mockResolvedValue([{ id: "cat-1", name: "Work" }]);

    const response = await GET(
      new Request(baseUrl, {
        headers: {
          "x-user-id": "user-1",
        },
      }),
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ categories: [{ id: "cat-1", name: "Work" }] });
    expect(listCategoriesMock).toHaveBeenCalledWith("user-1");
  });
});

describe("PATCH /api/categories/{id}", () => {
  test("updates category", async () => {
    updateCategoryMock.mockResolvedValue({ id: "cat-1", name: "Home" });

    const response = await PATCH(
      new Request(`${baseUrl}/cat-1`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-user-id": "user-1",
        },
        body: JSON.stringify({ name: "Home" }),
      }),
      { params: { categoryId: "cat-1" } } as any,
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.category.name).toBe("Home");
    expect(updateCategoryMock).toHaveBeenCalledWith("user-1", "cat-1", { name: "Home" });
  });
});
