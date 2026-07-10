-- Private message thread per application (professor <-> applicant)
CREATE TABLE IF NOT EXISTS "application_messages" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "application_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "application_messages_applicationId_createdAt_idx"
    ON "application_messages"("applicationId", "createdAt");

DO $$ BEGIN
    ALTER TABLE "application_messages"
        ADD CONSTRAINT "application_messages_applicationId_fkey"
        FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "application_messages"
        ADD CONSTRAINT "application_messages_senderId_fkey"
        FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
