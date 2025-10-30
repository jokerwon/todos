import { NextResponse } from "next/server";

import { cancelReminder, updateReminder } from "@/lib/reminders-service";

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

export async function PATCH(
  request: Request,
  { params }: { params: { reminderId: string } },
) {
  try {
    const userId = requireUserId(request);
    const payload = await request.json();
    const reminder = await updateReminder(userId, params.reminderId, payload);
    return NextResponse.json({ reminder }, { status: 200 });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update reminder" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { reminderId: string } },
) {
  try {
    const userId = requireUserId(request);
    await cancelReminder(userId, params.reminderId);
    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    return NextResponse.json(
      { error: "Failed to cancel reminder" },
      { status: 400 },
    );
  }
}
