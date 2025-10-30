-- Prisma Migration SQL (manually curated for bootstrap)

CREATE TYPE "TaskStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');
CREATE TYPE "ReminderStatus" AS ENUM ('SCHEDULED', 'SENT', 'MISSED', 'CANCELED');
CREATE TYPE "ReminderChannel" AS ENUM ('IN_APP', 'EMAIL');

CREATE TABLE "Task" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "TaskStatus" NOT NULL DEFAULT 'ACTIVE',
  "dueDate" TIMESTAMPTZ,
  "reminderLeadMinutes" INTEGER,
  "completedAt" TIMESTAMPTZ,
  "allowPastDue" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX "Task_user_status_idx" ON "Task" ("userId", "status");
CREATE INDEX "Task_user_due_idx" ON "Task" ("userId", "dueDate");

CREATE TABLE "Category" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "color" TEXT,
  "icon" TEXT,
  "sortOrder" INTEGER,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX "Category_user_name_unique" ON "Category" ("userId", lower("name"));
CREATE INDEX "Category_user_idx" ON "Category" ("userId");

CREATE TABLE "TaskCategory" (
  "taskId" UUID NOT NULL REFERENCES "Task"("id") ON DELETE CASCADE,
  "categoryId" UUID NOT NULL REFERENCES "Category"("id") ON DELETE CASCADE,
  "assignedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY ("taskId", "categoryId")
);

CREATE TABLE "Reminder" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "taskId" UUID NOT NULL REFERENCES "Task"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL,
  "triggerAt" TIMESTAMPTZ NOT NULL,
  "channel" "ReminderChannel" NOT NULL DEFAULT 'IN_APP',
  "status" "ReminderStatus" NOT NULL DEFAULT 'SCHEDULED',
  "lastAttemptAt" TIMESTAMPTZ,
  "meta" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX "Reminder_user_status_idx" ON "Reminder" ("userId", "status");
CREATE INDEX "Reminder_trigger_idx" ON "Reminder" ("triggerAt");
