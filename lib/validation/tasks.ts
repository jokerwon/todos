import { z } from "zod";

export const TaskFiltersSchema = z.object({
  status: z
    .string()
    .transform((value) => (value === "ALL" ? undefined : value))
    .pipe(z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]).optional())
    .optional(),
  due: z.enum(["today", "upcoming", "overdue"]).optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const TaskCreateSchema = z.object({
  title: z.string().min(1).max(120).trim(),
  description: z.string().max(2000).trim().optional().or(z.literal("")),
  dueDate: z.string().datetime().optional(),
  reminderLeadMinutes: z.number().int().min(5).max(1440).optional(),
  categoryIds: z.array(z.string().uuid()).max(5).optional(),
  allowPastDue: z.boolean().optional(),
});

export const TaskUpdateSchema = TaskCreateSchema.partial().merge(
  z.object({
    status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
  }),
);

export type TaskFiltersInput = z.infer<typeof TaskFiltersSchema>;
export type TaskCreateInput = z.infer<typeof TaskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof TaskUpdateSchema>;
