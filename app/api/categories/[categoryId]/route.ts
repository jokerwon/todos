import { NextResponse } from "next/server";

import { updateCategory } from "@/lib/categories-service";

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
  { params }: { params: { categoryId: string } },
) {
  try {
    const userId = requireUserId(request);
    const payload = await request.json();
    const category = await updateCategory(userId, params.categoryId, payload);
    return NextResponse.json({ category }, { status: 200 });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    return NextResponse.json({ error: "Failed to update category" }, { status: 400 });
  }
}
