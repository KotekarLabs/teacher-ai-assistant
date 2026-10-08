-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "classId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "difficulty" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Content_type_resourceId_key" ON "Content"("type", "resourceId");

-- CreateIndex
CREATE INDEX "Content_teacherId_idx" ON "Content"("teacherId");

-- CreateIndex
CREATE INDEX "Content_classId_idx" ON "Content"("classId");

-- CreateIndex
CREATE INDEX "Content_teacherId_type_idx" ON "Content"("teacherId", "type");

-- CreateIndex
CREATE INDEX "Content_teacherId_archivedAt_idx" ON "Content"("teacherId", "archivedAt");

-- CreateIndex
CREATE INDEX "Content_teacherId_status_idx" ON "Content"("teacherId", "status");

-- CreateIndex
CREATE INDEX "Content_teacherId_subject_idx" ON "Content"("teacherId", "subject");

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;
