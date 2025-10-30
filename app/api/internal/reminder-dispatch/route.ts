import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { recordReminderLag } from "@/lib/observability";

export async function POST() {
  const now = new Date();
  const upcoming = await prisma.reminder.findMany({
    where: {
      status: "SCHEDULED",
      triggerAt: {
        lte: new Date(now.getTime() + 60 * 1000),
      },
    },
  });

  await Promise.all(
    upcoming.map(async (reminder) => {
      // TODO: integrate with notification delivery service
      recordReminderLag(reminder.triggerAt, new Date());
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: {
          status: "SENT",
          lastAttemptAt: new Date(),
        },
      });
    }),
  );

  return NextResponse.json({ dispatched: upcoming.length }, { status: 200 });
}
