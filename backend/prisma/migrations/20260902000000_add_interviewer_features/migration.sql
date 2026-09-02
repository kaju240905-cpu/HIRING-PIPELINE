-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Recommendation" AS ENUM ('STRONG_HIRE', 'HIRE', 'NEUTRAL', 'REJECT', 'STRONG_REJECT');

-- AlterEnum
ALTER TYPE "ActionType" ADD VALUE 'ARCHIVED';

-- AlterEnum
ALTER TYPE "ApplicationStatus" ADD VALUE 'ARCHIVED';

-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "interviewerId" TEXT NOT NULL,
ADD COLUMN     "roundTitle" TEXT,
ADD COLUMN     "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED';

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "interviewerId" TEXT NOT NULL,
    "technicalSkillsRating" INTEGER NOT NULL,
    "communicationSkillsRating" INTEGER NOT NULL,
    "problemSolvingRating" INTEGER NOT NULL,
    "roleSpecificSkillsRating" INTEGER NOT NULL,
    "recommendation" "Recommendation" NOT NULL,
    "strengths" TEXT NOT NULL,
    "concerns" TEXT NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_interviewId_key" ON "Feedback"("interviewId");

-- CreateIndex
CREATE INDEX "Feedback_interviewerId_idx" ON "Feedback"("interviewerId");

-- CreateIndex
CREATE INDEX "Interview_applicationId_idx" ON "Interview"("applicationId");

-- CreateIndex
CREATE INDEX "Interview_interviewerId_idx" ON "Interview"("interviewerId");

-- CreateIndex
CREATE INDEX "Interview_status_idx" ON "Interview"("status");

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

