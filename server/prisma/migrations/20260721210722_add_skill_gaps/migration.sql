-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "skillGaps" TEXT[] DEFAULT ARRAY[]::TEXT[];
