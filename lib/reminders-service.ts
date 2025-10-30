import { addMinutes, isBefore, startOfDay, endOfDay } from "date-fns";

import { prisma } from "@/lib/prisma";
import {
  ReminderScheduleSchema,
  ReminderUpdateSchema,
  type ReminderScheduleInput,
  type ReminderUpdateInput,
} from "@/lib/validation/reminders";

const MIN_LEAD_MINUTES = 5;
const DAILY_LIMIT = 5;

function ensureLeadTime(triggerAt: Date) {
  const earliest = addMinutes(new Date(), MIN_LEAD_MINUTES);
  if (isBefore(triggerAt, earliest)) {
    throw new Error(`提醒需至少提前 ${MIN_LEAD_MINUTES} 分钟设置`);
  }
}

async function ensureDailyLimit(userId: string, triggerAt: Date) {
  const count = await prisma.reminder.count({
    where: {
      userId,
      triggerAt: {
        gte: startOfDay(triggerAt),
        lte: endOfDay(triggerAt),
      },
      status: "SCHEDULED",
    },
  });

  if (count >= DAILY_LIMIT) {
    throw new Error("超出单日提醒数量上限");
  }
}

function serialize(reminder: {
  id: string;
  taskId: string;
  triggerAt: Date;
  channel: string;
  status: string;
}) {
  return {
    id: reminder.id,
    taskId: reminder.taskId,
    triggerAt: reminder.triggerAt.toISOString(),
    channel: reminder.channel,
    status: reminder.status,
  };
}

export async function scheduleReminder(
  userId: string,
  input: ReminderScheduleInput,
) {
  const parsed = ReminderScheduleSchema.parse(input);
  const triggerAt = new Date(parsed.triggerAt);

  ensureLeadTime(triggerAt);
  await ensureDailyLimit(userId, triggerAt);

  const reminder = await prisma.reminder.create({
    data: {
      taskId: parsed.taskId,
      userId,
      triggerAt,
      channel: parsed.channel,
      meta: parsed.meta ?? null,
    },
  });

  return serialize(reminder);
}

export async function updateReminder(
  userId: string,
  reminderId: string,
  input: ReminderUpdateInput,
) {
  const parsed = ReminderUpdateSchema.parse(input);

  if (parsed.triggerAt) {
    const triggerAt = new Date(parsed.triggerAt);
    ensureLeadTime(triggerAt);
    await ensureDailyLimit(userId, triggerAt);
  }

  const reminder = await prisma.reminder.update({
    where: {
      id: reminderId,
      userId,
    },
    data: {
      ...(parsed.triggerAt ? { triggerAt: new Date(parsed.triggerAt) } : {}),
      ...(parsed.channel ? { channel: parsed.channel } : {}),
      ...(parsed.meta ? { meta: parsed.meta } : {}),
    },
  });

  return serialize(reminder);
}

export async function cancelReminder(userId: string, reminderId: string) {
  await prisma.reminder.delete({
    where: {
      id: reminderId,
      userId,
    },
  });
}
