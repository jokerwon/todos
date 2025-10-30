import { NextResponse } from "next/server";

import { scheduleReminder } from "@/lib/reminders-service";

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

export async function POST(request: Request) {
  try {
    const userId = requireUserId(request);
    const payload = await request.json();
    const reminder = await scheduleReminder(userId, payload);
    return NextResponse.json({ reminder }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid reminder" },
      { status: 400 },
    );
  }
}
