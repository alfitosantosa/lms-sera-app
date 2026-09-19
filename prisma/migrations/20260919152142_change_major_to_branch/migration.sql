-- DropForeignKey
ALTER TABLE "announcements" DROP CONSTRAINT "announcements_foundationId_fkey";

-- DropForeignKey
ALTER TABLE "calendar_events" DROP CONSTRAINT "calendar_events_foundationId_fkey";

-- DropForeignKey
ALTER TABLE "dashboard_contents" DROP CONSTRAINT "dashboard_contents_foundationId_fkey";

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_foundationId_fkey" FOREIGN KEY ("foundationId") REFERENCES "foundation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboard_contents" ADD CONSTRAINT "dashboard_contents_foundationId_fkey" FOREIGN KEY ("foundationId") REFERENCES "foundation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_foundationId_fkey" FOREIGN KEY ("foundationId") REFERENCES "foundation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
