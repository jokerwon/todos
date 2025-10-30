import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  TaskCreateSchema,
  TaskFiltersSchema,
  TaskUpdateSchema,
  type TaskCreateInput,
  type TaskFiltersInput,
  type TaskUpdateInput,
} from "@/lib/validation/tasks";

type TaskRecord = Prisma.TaskGetPayload<{
  include: {
    categories: { include: { category: true } };
    reminders: {
      where: { status: "SCHEDULED" };
      orderBy: { triggerAt: "asc" };
      take: 1;
    };
  };
}>;

function sanitizeDescription(description?: string | null) {
  if (!description) return null;
  const trimmed = description.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function serializeTask(task: TaskRecord) {
  if (!task) return null;
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    dueDate: task.dueDate?.toISOString() ?? null,
    reminderLeadMinutes: task.reminderLeadMinutes,
    completedAt: task.completedAt?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    categories: task.categories?.map(({ category }) => ({
      id: category.id,
      name: category.name,
      color: category.color,
    })) ?? [],
    nextReminderAt: task.reminders?.[0]?.triggerAt?.toISOString?.() ?? null,
  };
}

function buildDueDateFilter(due?: string) {
  if (!due) return undefined;
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  switch (due) {
    case "today":
      return { gte: startOfDay, lte: endOfDay };
    case "upcoming":
      return { gte: endOfDay };
    case "overdue":
      return { lt: now };
    default:
      return undefined;
  }
}

export async function createTask(userId: string, input: TaskCreateInput) {
  const parsed = TaskCreateSchema.parse(input);

  const task = await prisma.task.create({
    data: {
      userId,
      title: parsed.title.trim(),
      description: sanitizeDescription(parsed.description),
      dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
      reminderLeadMinutes: parsed.reminderLeadMinutes ?? null,
      allowPastDue: parsed.allowPastDue ?? false,
      categories: parsed.categoryIds
        ? {
            createMany: {
              data: parsed.categoryIds.map((categoryId) => ({ categoryId })),
              skipDuplicates: true,
            },
          }
        : undefined,
    },
    include: {
      categories: { include: { category: true } },
      reminders: {
        where: { status: "SCHEDULED" },
        orderBy: { triggerAt: "asc" },
        take: 1,
      },
    },
  });

  return serializeTask(task);
}

export async function listTasks(userId: string, filters: TaskFiltersInput) {
  const parsed = TaskFiltersSchema.parse(filters);

  const where: Record<string, unknown> = {
    userId,
    ...(parsed.status ? { status: parsed.status } : {}),
    ...(parsed.categoryId
      ? {
          categories: {
            some: { categoryId: parsed.categoryId },
          },
        }
      : {}),
    ...(parsed.search
      ? {
          OR: [
            { title: { contains: parsed.search, mode: "insensitive" } },
            { description: { contains: parsed.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const dueFilter = buildDueDateFilter(parsed.due);
  if (dueFilter) {
    Object.assign(where, { dueDate: dueFilter });
  }

  const [items, total, statusBuckets, overdueCount, categoriesSummary] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (parsed.page - 1) * parsed.pageSize,
      take: parsed.pageSize,
      include: {
        categories: { include: { category: true } },
        reminders: {
          where: { status: "SCHEDULED" },
          orderBy: { triggerAt: "asc" },
          take: 1,
        },
      },
    }),
    prisma.task.count({ where }),
    prisma.task.groupBy({
      by: ["status"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.task.count({
      where: {
        userId,
        status: "ACTIVE",
        dueDate: { lt: new Date() },
      },
    }),
    prisma.category.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    }),
  ]);

  return {
    items: items.map((task) => serializeTask(task)),
    summary: {
      total,
      active: statusBuckets.find((bucket) => bucket.status === "ACTIVE")?._count._all ?? 0,
      completed:
        statusBuckets.find((bucket) => bucket.status === "COMPLETED")?._count._all ?? 0,
      archived:
        statusBuckets.find((bucket) => bucket.status === "ARCHIVED")?._count._all ?? 0,
      overdue: overdueCount,
      categories: categoriesSummary.map((category) => ({
        id: category.id,
        name: category.name,
        count: category._count.tasks,
      })),
    },
  };
}

export async function updateTask(
  userId: string,
  taskId: string,
  updates: TaskUpdateInput,
) {
  const parsed = TaskUpdateSchema.parse(updates);

  const data: Record<string, unknown> = {
    ...(parsed.title ? { title: parsed.title.trim() } : {}),
    ...(parsed.description ? { description: sanitizeDescription(parsed.description) } : {}),
    ...(parsed.status ? { status: parsed.status } : {}),
    ...(parsed.dueDate ? { dueDate: new Date(parsed.dueDate) } : {}),
    ...(parsed.reminderLeadMinutes
      ? { reminderLeadMinutes: parsed.reminderLeadMinutes }
      : {}),
    ...(parsed.categoryIds
      ? {
          categories: {
            deleteMany: {},
            createMany: {
              data: parsed.categoryIds.map((categoryId) => ({ categoryId })),
              skipDuplicates: true,
            },
          },
        }
      : {}),
  };

  const task = await prisma.task.update({
    where: { id: taskId, userId },
    data,
    include: {
      categories: { include: { category: true } },
      reminders: {
        where: { status: "SCHEDULED" },
        orderBy: { triggerAt: "asc" },
        take: 1,
      },
    },
  });

  return serializeTask(task);
}
