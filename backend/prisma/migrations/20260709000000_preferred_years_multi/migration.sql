-- Convert single preferredYear to multi-select preferredYears
ALTER TABLE "research_projects" ADD COLUMN "preferredYears" TEXT[] NOT NULL DEFAULT '{}';

UPDATE "research_projects"
SET "preferredYears" = ARRAY["preferredYear"]
WHERE "preferredYear" IS NOT NULL AND "preferredYear" NOT IN ('any', '');

ALTER TABLE "research_projects" DROP COLUMN "preferredYear";
