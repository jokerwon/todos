import { z } from "zod";

export const ReminderScheduleSchema = z.object({
  taskId: z.string().uuid(),
  triggerAt: z.string().datetime(),
  channel: z.enum(["IN_APP", "EMAIL"]).default("IN_APP"),
  meta: z.record(z.any()).optional(),
});

export const ReminderUpdateSchema = ReminderScheduleSchema.partial();

export type ReminderScheduleInput = z.infer<typeof ReminderScheduleSchema>;
export type ReminderUpdateInput = z.infer<typeof ReminderUpdateSchema>;
