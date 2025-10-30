import { prisma } from "@/lib/prisma";
import {
  CategoryCreateSchema,
  CategoryUpdateSchema,
  type CategoryCreateInput,
  type CategoryUpdateInput,
} from "@/lib/validation/categories";

function sanitizeName(name: string) {
  return name.trim();
}

export async function listCategories(userId: string) {
  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    color: category.color,
    icon: category.icon,
  }));
}

export async function createCategory(userId: string, input: CategoryCreateInput) {
  const parsed = CategoryCreateSchema.parse(input);

  const category = await prisma.category.create({
    data: {
      userId,
      name: sanitizeName(parsed.name),
      color: parsed.color ?? null,
      icon: parsed.icon ?? null,
    },
  });

  return {
    id: category.id,
    name: category.name,
    color: category.color,
    icon: category.icon,
  };
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  input: CategoryUpdateInput,
) {
  const parsed = CategoryUpdateSchema.parse(input);

  const category = await prisma.category.update({
    where: {
      id: categoryId,
      userId,
    },
    data: {
      ...(parsed.name ? { name: sanitizeName(parsed.name) } : {}),
      ...(parsed.color ? { color: parsed.color } : {}),
      ...(parsed.icon ? { icon: parsed.icon } : {}),
      ...(parsed.sortOrder !== undefined ? { sortOrder: parsed.sortOrder } : {}),
    },
  });

  return {
    id: category.id,
    name: category.name,
    color: category.color,
    icon: category.icon,
  };
}
