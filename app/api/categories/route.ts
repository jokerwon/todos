import { NextResponse } from "next/server";

import { createCategory, listCategories } from "@/lib/categories-service";

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
    const categories = await listCategories(userId);
    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    return NextResponse.json({ error: "Failed to load categories" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = requireUserId(request);
    const payload = await request.json();
    const category = await createCategory(userId, payload);
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    return NextResponse.json({ error: "Invalid category payload" }, { status: 400 });
  }
}
