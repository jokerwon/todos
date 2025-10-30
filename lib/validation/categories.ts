import { z } from "zod";

export const CategoryCreateSchema = z.object({
  name: z.string().min(1).max(60).trim(),
  color: z
    .string()
    .regex(/^#?[0-9A-Fa-f]{6}$/)
    .optional(),
  icon: z.string().max(40).optional(),
});

export const CategoryUpdateSchema = CategoryCreateSchema.partial().extend({
  sortOrder: z.number().int().optional(),
});

export type CategoryCreateInput = z.infer<typeof CategoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof CategoryUpdateSchema>;
