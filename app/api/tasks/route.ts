import { NextResponse } from "next/server";

import { createTask, listTasks } from "@/lib/tasks-service";
import { TaskFiltersSchema } from "@/lib/validation/tasks";

function requireUserId(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  return userId;
}

export async function GET(request: Request) {
  try {
    const userId = requireUserId(request);
    const params = Object.fromEntries(new URL(request.url).searchParams.entries());
    const filters = TaskFiltersSchema.parse(params);
    const tasks = await listTasks(userId, filters);
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json(
      { error: "Unable to list tasks" },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = requireUserId(request);
    const payload = await request.json();
    const task = await createTask(userId, payload);
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json(
      { error: "Invalid task payload" },
      { status: 400 },
    );
  }
}
